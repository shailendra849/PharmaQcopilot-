"""
API surface consumed by the React frontend.

Session endpoints power the right-hand "AIVOA Copilot" chat panel.
Complaint endpoints power the left-hand form once a session is committed.
"""
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ComplaintSession, Complaint
from app.schemas import (
    SessionResponse,
    SendMessageRequest,
    CommitRequest,
    ComplaintResponse,
)
from app.agents.graph import complaint_graph
from app.services.document_parser import extract_text_from_upload
from app.config import get_settings

router = APIRouter(prefix="/api", tags=["complaints"])
settings = get_settings()


# ---------- internal helpers ----------

def _run_agent_turn(session: ComplaintSession, raw_text: str) -> None:
    """Invoke the LangGraph agent and merge results into the session row."""
    is_first_submission = not bool(session.extracted_data)

    result = complaint_graph.invoke(
        {
            "raw_input": raw_text,
            "is_first_submission": is_first_submission,
            "extracted_data": session.extracted_data or {},
            "risk_assessment": session.risk_assessment or {},
        }
    )

    session.extracted_data = result.get("extracted_data", session.extracted_data)
    session.risk_assessment = result.get("risk_assessment", session.risk_assessment)
    session.status = result.get("status", session.status)

    now = datetime.now(UTC).isoformat()
    messages = list(session.messages or [])
    messages.append({"role": "user", "content": raw_text, "ts": now})
    messages.append(
        {"role": "assistant", "content": result.get("assistant_message", ""), "ts": now}
    )
    session.messages = messages


def _next_complaint_code(db: Session) -> str:
    year = datetime.now(UTC).year
    count = db.scalar(select(func.count()).select_from(Complaint)) or 0
    return f"CC-{year}-{count + 1:05d}"


# ---------- session endpoints (AI Copilot panel) ----------

@router.post("/sessions", response_model=SessionResponse)
def create_session(db: Session = Depends(get_db)):
    session = ComplaintSession()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.get(ComplaintSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.post("/sessions/{session_id}/message", response_model=SessionResponse)
def send_message(session_id: str, payload: SendMessageRequest, db: Session = Depends(get_db)):
    session = db.get(ComplaintSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status == "committed":
        raise HTTPException(400, "This complaint has already been committed to the ledger")

    _run_agent_turn(session, payload.text)
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/upload", response_model=SessionResponse)
async def upload_document(
    session_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    session = db.get(ComplaintSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    content = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f"File exceeds {settings.max_upload_mb}MB limit")

    raw_text = extract_text_from_upload(file.filename, content)
    if not raw_text.strip():
        raise HTTPException(422, "Could not extract any text from the uploaded document")

    _run_agent_turn(session, raw_text)
    db.commit()
    db.refresh(session)
    return session


# ---------- commit + ledger endpoints ----------

@router.post("/sessions/{session_id}/commit", response_model=ComplaintResponse)
def commit_session(session_id: str, payload: CommitRequest, db: Session = Depends(get_db)):
    session = db.get(ComplaintSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status == "committed":
        raise HTTPException(400, "Already committed")
    if not session.extracted_data:
        raise HTTPException(400, "Nothing to commit yet - submit a complaint first")

    data = dict(session.extracted_data)
    if payload.overrides:
        data.update({k: v for k, v in payload.overrides.model_dump().items() if v is not None})

    risk = dict(session.risk_assessment or {})
    if payload.risk_overrides:
        risk.update({k: v for k, v in payload.risk_overrides.model_dump().items() if v is not None})

    complaint = Complaint(
        complaint_code=_next_complaint_code(db),
        complaint_source=data.get("complaint_source"),
        customer_name=data.get("customer_name"),
        product_name=data.get("product_name"),
        product_strength_grade=data.get("product_strength_grade"),
        batch_lot_number=data.get("batch_lot_number"),
        affected_quantity=data.get("affected_quantity"),
        manufacturing_date=data.get("manufacturing_date"),
        expiry_date=data.get("expiry_date"),
        originating_site_block=data.get("originating_site_block"),
        impacted_npm=data.get("impacted_npm"),
        complaint_category=data.get("complaint_category"),
        complaint_description=data.get("complaint_description"),
        severity=risk.get("severity"),
        priority=risk.get("priority"),
        suggested_next_action=risk.get("suggested_next_action"),
        initial_risk_assessment=risk.get("initial_risk_assessment"),
        status="committed",
    )
    db.add(complaint)
    session.status = "committed"
    session.committed_complaint_id = None  # set after flush below
    db.flush()
    session.committed_complaint_id = complaint.id
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/complaints", response_model=list[ComplaintResponse])
def list_complaints(db: Session = Depends(get_db)):
    return db.scalars(select(Complaint).order_by(Complaint.created_at.desc())).all()


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    return complaint

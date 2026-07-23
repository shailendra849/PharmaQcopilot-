"""
ORM models.

ComplaintSession  -> the "draft" that the AI Copilot is working on for one
                     conversation (chat history + extracted fields + risk
                     assessment). Nothing here is a permanent QMS record yet.

Complaint         -> the permanent, committed QMS record created when the
                     user clicks "Commit to QMS Ledger". Structured columns
                     match the reference form exactly, so the row can be
                     queried/reported on directly.
"""
import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ComplaintSession(Base):
    """One AI Copilot conversation / working draft."""

    __tablename__ = "complaint_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)

    # Full chat transcript: [{role: "user"|"assistant", content: str, ts: iso}, ...]
    messages: Mapped[list] = mapped_column(JSON, default=list)

    # Current best-known structured fields (mirrors the form on screen)
    extracted_data: Mapped[dict] = mapped_column(JSON, default=dict)

    # Latest AI risk assessment block (severity, priority, next action, narrative)
    risk_assessment: Mapped[dict] = mapped_column(JSON, default=dict)

    # "pending_triage" | "ready_to_commit" | "committed"
    status: Mapped[str] = mapped_column(String(32), default="pending_triage")

    committed_complaint_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    complaint: Mapped["Complaint"] = relationship(back_populates="session")


class Complaint(Base):
    """Committed QMS complaint record."""

    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    complaint_code: Mapped[str] = mapped_column(String(32), unique=True)  # e.g. CC-2026-00154

    # 1. Origin & Customer Details
    complaint_source: Mapped[str | None] = mapped_column(String(64))
    customer_name: Mapped[str | None] = mapped_column(String(255))

    # 2. Product & Batch Identification
    product_name: Mapped[str | None] = mapped_column(String(255))
    product_strength_grade: Mapped[str | None] = mapped_column(String(64))
    batch_lot_number: Mapped[str | None] = mapped_column(String(64))
    affected_quantity: Mapped[str | None] = mapped_column(String(128))
    manufacturing_date: Mapped[str | None] = mapped_column(String(64))
    expiry_date: Mapped[str | None] = mapped_column(String(64))

    # 3. Facility & Material Impact
    originating_site_block: Mapped[str | None] = mapped_column(String(128))
    impacted_npm: Mapped[str | None] = mapped_column(String(255))

    # 4. Defect Analysis
    complaint_category: Mapped[str | None] = mapped_column(String(128))
    complaint_description: Mapped[str | None] = mapped_column(Text)

    # 5. Initial Assessment & Priority (AI-suggested, human-committed)
    severity: Mapped[str | None] = mapped_column(String(32))
    priority: Mapped[str | None] = mapped_column(String(32))
    suggested_next_action: Mapped[str | None] = mapped_column(String(255))
    initial_risk_assessment: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(32), default="committed")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    session: Mapped["ComplaintSession"] = relationship(back_populates="complaint", uselist=False)

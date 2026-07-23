"""
Node functions for the complaint-intake LangGraph.

Each node takes the current state dict and returns a *partial* dict of
updates - LangGraph merges these into the running state automatically.
"""
import json

from app.agents.state import ComplaintAgentState
from app.agents.prompts import (
    EXTRACTION_SYSTEM_PROMPT,
    CORRECTION_SYSTEM_PROMPT,
    RISK_ASSESSMENT_SYSTEM_PROMPT,
)
from app.services.groq_client import call_json
from app.config import get_settings

settings = get_settings()

EMPTY_FIELDS = {
    "complaint_source": None,
    "customer_name": None,
    "product_name": None,
    "product_strength_grade": None,
    "batch_lot_number": None,
    "affected_quantity": None,
    "manufacturing_date": None,
    "expiry_date": None,
    "originating_site_block": None,
    "impacted_npm": None,
    "complaint_category": None,
    "complaint_description": None,
}


def route_intake(state: ComplaintAgentState) -> str:
    """Conditional-edge function: pick 'extract' or 'correct'."""
    return "extract" if state.get("is_first_submission") else "correct"


def extract_node(state: ComplaintAgentState) -> dict:
    """First-time submission: parse the raw complaint text into structured fields."""
    data = call_json(
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        user_prompt=state["raw_input"],
        model=settings.groq_model_extraction,
    )
    # Guard against the model adding/dropping keys
    merged = {**EMPTY_FIELDS, **data}
    return {
        "extracted_data": merged,
        "assistant_message": (
            "Complaint parsed successfully. I've extracted the product details, "
            "mapped the batch information, and I'm running the initial risk assessment now."
        ),
    }


def correct_node(state: ComplaintAgentState) -> dict:
    """Follow-up message: patch only the fields the user is correcting."""
    current = state.get("extracted_data", {}) or dict(EMPTY_FIELDS)

    prompt = (
        f"CURRENT_DATA:\n{json.dumps(current, indent=2)}\n\n"
        f"USER_MESSAGE:\n{state['raw_input']}"
    )
    patch = call_json(
        system_prompt=CORRECTION_SYSTEM_PROMPT,
        user_prompt=prompt,
        model=settings.groq_model_extraction,
    )
    # Only accept keys that already exist on the form - never let the LLM invent new fields
    safe_patch = {k: v for k, v in patch.items() if k in EMPTY_FIELDS}
    updated = {**current, **safe_patch}

    changed_fields = ", ".join(safe_patch.keys()) if safe_patch else "no matching fields"
    return {
        "extracted_data": updated,
        "assistant_message": f"I've applied the correction. Updated: {changed_fields}.",
    }


def risk_assessment_node(state: ComplaintAgentState) -> dict:
    """Run only after a fresh extraction - never re-runs on simple corrections."""
    data = call_json(
        system_prompt=RISK_ASSESSMENT_SYSTEM_PROMPT,
        user_prompt=json.dumps(state["extracted_data"], indent=2),
        model=settings.groq_model_context,
    )
    return {
        "risk_assessment": data,
        "status": "ready_to_commit",
        "assistant_message": (
            state.get("assistant_message", "")
            + " Initial risk assessment complete - form is ready to commit."
        ),
    }

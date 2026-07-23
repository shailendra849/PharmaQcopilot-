"""
Shared state passed between LangGraph nodes.

Kept intentionally as a plain TypedDict (not pydantic) because LangGraph
merges partial updates into this dict between nodes - a lightweight
structure keeps that merging predictable.
"""
from typing import TypedDict, Literal


class ComplaintAgentState(TypedDict, total=False):
    # Input
    raw_input: str                     # latest user message / extracted PDF text
    is_first_submission: bool          # decided by the router: True -> extract, False -> correct

    # Working data (mirrors the form)
    extracted_data: dict
    risk_assessment: dict

    # Output for the chat panel
    assistant_message: str

    # "pending_triage" | "ready_to_commit"
    status: Literal["pending_triage", "ready_to_commit"]

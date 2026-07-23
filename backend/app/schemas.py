"""
Pydantic schemas: what goes over the wire.
Field names here match the reference UI form 1:1, which keeps the
frontend mapping trivial (data.extracted_data.batch_lot_number -> input value).
"""
from datetime import datetime
from pydantic import BaseModel, Field


class ExtractedData(BaseModel):
    """Mirrors every field on the 'Log Customer Complaint' form."""

    # 1. Origin & Customer Details
    complaint_source: str | None = None
    customer_name: str | None = None

    # 2. Product & Batch Identification
    product_name: str | None = None
    product_strength_grade: str | None = None
    batch_lot_number: str | None = None
    affected_quantity: str | None = None
    manufacturing_date: str | None = None
    expiry_date: str | None = None

    # 3. Facility & Material Impact
    originating_site_block: str | None = None
    impacted_npm: str | None = None

    # 4. Defect Analysis
    complaint_category: str | None = None
    complaint_description: str | None = None


class RiskAssessment(BaseModel):
    severity: str | None = None
    priority: str | None = None
    suggested_next_action: str | None = None
    initial_risk_assessment: str | None = None


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    ts: str | None = None


class SessionResponse(BaseModel):
    id: str
    messages: list[ChatMessage]
    extracted_data: ExtractedData
    risk_assessment: RiskAssessment
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    text: str = Field(..., description="Raw pasted complaint text or a follow-up correction message")


class CommitRequest(BaseModel):
    # Allows the human QA reviewer to tweak fields one last time before committing
    overrides: ExtractedData | None = None
    risk_overrides: RiskAssessment | None = None


class ComplaintResponse(BaseModel):
    id: str
    complaint_code: str
    complaint_source: str | None
    customer_name: str | None
    product_name: str | None
    product_strength_grade: str | None
    batch_lot_number: str | None
    affected_quantity: str | None
    manufacturing_date: str | None
    expiry_date: str | None
    originating_site_block: str | None
    impacted_npm: str | None
    complaint_category: str | None
    complaint_description: str | None
    severity: str | None
    priority: str | None
    suggested_next_action: str | None
    initial_risk_assessment: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

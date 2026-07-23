// Single source of truth for what's on the form — keeps ComplaintForm.jsx
// a plain map/render instead of hand-written JSX per field.

export const FORM_SECTIONS = [
  {
    tag: "01",
    title: "Origin & Customer Details",
    fields: [
      { key: "complaint_source", label: "Complaint Source", placeholder: "Email, Pharmacy, Distributor…" },
      { key: "customer_name", label: "Customer Name", placeholder: "Awaiting AI extraction…" },
    ],
  },
  {
    tag: "02",
    title: "Product & Batch Identification",
    fields: [
      { key: "product_name", label: "Product Name (API/FDF)", placeholder: "Awaiting AI extraction…" },
      { key: "product_strength_grade", label: "Product Strength/Grade", placeholder: "e.g. 500 mg, IP/BP" },
      { key: "batch_lot_number", label: "Batch / Lot Number", placeholder: "Awaiting AI extraction…", mono: true },
      { key: "affected_quantity", label: "Affected Quantity", placeholder: "e.g. 50 kg (2 HDPE Drum)" },
      { key: "manufacturing_date", label: "Manufacturing Date", placeholder: "Awaiting AI extraction…" },
      { key: "expiry_date", label: "Expiry Date", placeholder: "Not provided" },
    ],
  },
  {
    tag: "03",
    title: "Facility & Material Impact",
    fields: [
      { key: "originating_site_block", label: "Originating Site Block", placeholder: "Awaiting AI classification…" },
      { key: "impacted_npm", label: "Impacted Non-Product Materials (NPM)", placeholder: "e.g. Primary packaging" },
    ],
  },
  {
    tag: "04",
    title: "Defect Analysis",
    fields: [
      { key: "complaint_category", label: "Complaint Category", placeholder: "Awaiting AI classification…" },
      {
        key: "complaint_description",
        label: "Structured Defect Summary",
        placeholder: "AI will synthesize the complaint into a formal QMS description…",
        textarea: true,
      },
    ],
  },
];

export const RISK_FIELDS = [
  { key: "severity", label: "Severity (Suggested)" },
  { key: "priority", label: "Priority" },
  { key: "suggested_next_action", label: "Suggested Next Action" },
];

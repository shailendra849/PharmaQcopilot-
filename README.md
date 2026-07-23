# AIVOA — AI-Powered Customer Complaint Management System

AIVOA is an AI-assisted complaint intake and triage system built for pharmaceutical API/FDF (Active Pharmaceutical Ingredient / Finished Dosage Form) quality assurance teams. A QA reviewer pastes in raw complaint text or uploads a document (email, PDF, scanned report), and an AI Copilot extracts the structured complaint fields, performs an initial risk assessment (severity, priority, suggested next action), and lets the reviewer correct/confirm details in a chat-style panel before committing the record to a permanent QMS ledger.

## How It Works

1. **Start a session** – a new `ComplaintSession` (a working draft) is created.
2. **Submit a complaint** – paste text or upload a document. A LangGraph agent pipeline:
   - Routes the message: first submission → **extract**, follow-up correction → **correct**.
   - `extract` — an LLM (via Groq) reads the raw text and fills the structured complaint form (customer, product, batch/lot, dates, defect category, description, etc.), never inventing data that isn't present.
   - `assess_risk` — a second LLM pass performs a QMS-style initial risk assessment (severity, priority, suggested next action, narrative), following ICH Q10 principles. Runs only on first submission.
   - `correct` — for follow-up messages, only updates the specific fields the user is correcting, without re-running risk assessment.
3. **Review in the Copilot panel** – the extracted data and risk assessment populate the on-screen form live; the reviewer can chat back and forth to fix fields.
4. **Commit to the QMS Ledger** – once satisfied, the reviewer commits the session, which creates a permanent, immutable `Complaint` record with an auto-generated complaint code (e.g. `CC-2026-00154`) and closes out the session.
5. **Ledger view** – all committed complaints are listed/queryable via the ledger drawer.

## Architecture & Tech Stack

**Backend** — `FastAPI` (Python)
- `SQLAlchemy` ORM + `PostgreSQL` (via `psycopg`) for persistence
- `LangGraph` for the multi-step agent pipeline (route → extract/correct → risk assessment)
- `Groq` API for LLM calls (fast extraction model + a larger model for contextual risk assessment)
- `pypdf` / `python-docx` for parsing uploaded PDF/Word complaint documents
- `Pydantic` / `pydantic-settings` for schemas and environment-based config

**Frontend** — `React (Vite)`
- `Redux Toolkit` + `react-redux` for complaint/session state
- `Tailwind CSS` for styling
- `axios` for API calls
- `lucide-react` for icons

```
Aivoa/
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph state, nodes, prompts, graph wiring
│   │   ├── routers/         # FastAPI routes (sessions, messages, upload, commit, ledger)
│   │   ├── services/        # Document parsing, Groq client
│   │   ├── config.py        # Settings loaded from .env
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # ComplaintSession & Complaint ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   └── main.py          # FastAPI app entrypoint
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/      # ChatMessage, ComplaintForm, CopilotPanel, LedgerDrawer, RiskAssessmentPanel, etc.
    │   ├── store/            # Redux slice + store
    │   ├── api/              # Axios client
    │   └── App.jsx
    └── package.json
```

## Prerequisites

- **Python** 3.11+ (project was built/tested with a `venv`; avoid very new Python versions with native-dependency packages like `psycopg[binary]`)
- **Node.js** 18+ and npm
- **PostgreSQL** running locally (or accessible via connection string)
- A free **Groq API key** — get one at https://console.groq.com

## Backend Setup

```bash
cd backend
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (this is git-ignored, so it will **not** already exist after cloning):

```env
# Postgres connection string
DATABASE_URL=postgresql+psycopg://<user>:<password>@localhost:5432/aivoa_complaints

# Get a free key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL_EXTRACTION=openai/gpt-oss-20b
GROQ_MODEL_CONTEXT=openai/gpt-oss-120b

CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
MAX_UPLOAD_MB=10
```

Make sure the `aivoa_complaints` database exists in Postgres (create it manually — tables are auto-created on startup for this assignment's scope):

```sql
CREATE DATABASE aivoa_complaints;
```

Run the API:

```bash
uvicorn app.main:app --reload
```

- API base URL: `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- Interactive docs (Swagger): `http://localhost:8000/docs`

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` if the API isn't running on the default assumed URL (check `src/api/client.js` for the expected env var name, typically something like `VITE_API_BASE_URL=http://localhost:8000`).

Run the dev server:

```bash
npm run dev
```

- Frontend URL: `http://localhost:5173`

## Running the Full App

1. Start PostgreSQL.
2. Start the backend: `uvicorn app.main:app --reload` (from `backend/`).
3. Start the frontend: `npm run dev` (from `frontend/`).
4. Open `http://localhost:5173`, start a new complaint session, paste in complaint text or upload a document, and interact with the AI Copilot panel.

## Key API Endpoints (backend, prefix `/api`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/sessions` | Create a new complaint session |
| `GET` | `/sessions/{session_id}` | Fetch a session (chat + extracted data + risk assessment) |
| `POST` | `/sessions/{session_id}/message` | Send a text message (first submission or correction) to the AI Copilot |
| `POST` | `/sessions/{session_id}/upload` | Upload a document (PDF/DOCX) for extraction |
| `POST` | `/sessions/{session_id}/commit` | Commit the session as a permanent QMS complaint record |
| `GET` | `/complaints` | List all committed complaints (ledger) |
| `GET` | `/complaints/{complaint_id}` | Fetch a single committed complaint |

## Notes

- `.env` files in both `backend/` and `frontend/` are git-ignored — each environment needs its own copy with real credentials/keys; never commit secrets.
- Table creation currently happens automatically on backend startup (`Base.metadata.create_all`) for assignment scope; a production deployment would use Alembic migrations instead.
- The correction flow (`correct` node) intentionally does **not** re-run risk assessment, so correcting a field like batch number won't reset severity/priority already assigned.

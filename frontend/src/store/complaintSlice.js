import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";

const EMPTY_FIELDS = {
  complaint_source: null,
  customer_name: null,
  product_name: null,
  product_strength_grade: null,
  batch_lot_number: null,
  affected_quantity: null,
  manufacturing_date: null,
  expiry_date: null,
  originating_site_block: null,
  impacted_npm: null,
  complaint_category: null,
  complaint_description: null,
};

const EMPTY_RISK = {
  severity: null,
  priority: null,
  suggested_next_action: null,
  initial_risk_assessment: null,
};

const initialState = {
  sessionId: null,
  messages: [],
  extractedData: { ...EMPTY_FIELDS },
  riskAssessment: { ...EMPTY_RISK },
  status: "idle", // "idle" | "pending_triage" | "ready_to_commit" | "committed"
  committedComplaint: null,
  ledger: [],

  // async lifecycle flags, kept granular so the UI can show the right spinner
  isStartingSession: false,
  isSendingMessage: false,
  isUploading: false,
  isCommitting: false,
  isLoadingLedger: false,
  error: null,
};

export const startSession = createAsyncThunk(
  "complaint/startSession",
  async () => await api.createSession()
);

export const sendMessage = createAsyncThunk(
  "complaint/sendMessage",
  async ({ sessionId, text }) => await api.sendMessage(sessionId, text)
);

export const uploadDocument = createAsyncThunk(
  "complaint/uploadDocument",
  async ({ sessionId, file }) => await api.uploadDocument(sessionId, file)
);

export const commitSession = createAsyncThunk(
  "complaint/commitSession",
  async ({ sessionId, overrides }) => await api.commitSession(sessionId, overrides)
);

export const fetchLedger = createAsyncThunk(
  "complaint/fetchLedger",
  async () => await api.listComplaints()
);

function applySessionPayload(state, payload) {
  state.sessionId = payload.id;
  state.messages = payload.messages;
  state.extractedData = { ...EMPTY_FIELDS, ...payload.extracted_data };
  state.riskAssessment = { ...EMPTY_RISK, ...payload.risk_assessment };
  state.status = payload.status;
}

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    resetSession(state) {
      Object.assign(state, initialState, { ledger: state.ledger });
    },
    // Lets a QA reviewer hand-edit a field in the form before committing
    editField(state, action) {
      const { field, value } = action.payload;
      state.extractedData[field] = value;
    },
    editRiskField(state, action) {
      const { field, value } = action.payload;
      state.riskAssessment[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      // start session
      .addCase(startSession.pending, (state) => {
        state.isStartingSession = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.isStartingSession = false;
        applySessionPayload(state, action.payload);
      })
      .addCase(startSession.rejected, (state, action) => {
        state.isStartingSession = false;
        state.error = action.error.message;
      })

      // send message
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        applySessionPayload(state, action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.error.message;
      })

      // upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        applySessionPayload(state, action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message;
      })

      // commit
      .addCase(commitSession.pending, (state) => {
        state.isCommitting = true;
        state.error = null;
      })
      .addCase(commitSession.fulfilled, (state, action) => {
        state.isCommitting = false;
        state.status = "committed";
        state.committedComplaint = action.payload;
      })
      .addCase(commitSession.rejected, (state, action) => {
        state.isCommitting = false;
        state.error = action.error.message;
      })

      // ledger
      .addCase(fetchLedger.pending, (state) => {
        state.isLoadingLedger = true;
      })
      .addCase(fetchLedger.fulfilled, (state, action) => {
        state.isLoadingLedger = false;
        state.ledger = action.payload;
      })
      .addCase(fetchLedger.rejected, (state, action) => {
        state.isLoadingLedger = false;
        state.error = action.error.message;
      });
  },
});

export const { resetSession, editField, editRiskField } = complaintSlice.actions;
export default complaintSlice.reducer;

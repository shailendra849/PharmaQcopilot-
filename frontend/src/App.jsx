import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, RotateCcw } from "lucide-react";
import {
  startSession,
  sendMessage,
  uploadDocument,
  commitSession,
  resetSession,
} from "./store/complaintSlice";
import ComplaintForm from "./components/ComplaintForm";
import CopilotPanel from "./components/CopilotPanel";
import LedgerDrawer from "./components/LedgerDrawer";

export default function App() {
  const dispatch = useDispatch();
  const [showLedger, setShowLedger] = useState(false);

  const {
    sessionId,
    messages,
    extractedData,
    riskAssessment,
    status,
    isSendingMessage,
    isUploading,
    isCommitting,
    error,
  } = useSelector((s) => s.complaint);

  useEffect(() => {
    if (!sessionId) dispatch(startSession());
  }, [sessionId, dispatch]);

  const isBusy = isSendingMessage || isUploading;

  const handleSendMessage = (text) => dispatch(sendMessage({ sessionId, text }));
  const handleUploadFile = (file) => dispatch(uploadDocument({ sessionId, file }));
  const handleCommit = () =>
    dispatch(
      commitSession({
        sessionId,
        overrides: { overrides: extractedData, risk_overrides: riskAssessment },
      })
    );
  const handleNewComplaint = () => {
    dispatch(resetSession());
    dispatch(startSession());
  };

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-ink-100 bg-white px-6 py-3">
        <span className="text-sm font-semibold tracking-tight text-ink-900">
          AIVOA <span className="font-normal text-ink-500">| Complaint Management</span>
        </span>
        <div className="flex items-center gap-2">
          {status === "committed" && (
            <button
              onClick={handleNewComplaint}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100"
            >
              <RotateCcw size={13} />
              New Complaint
            </button>
          )}
          <button
            onClick={() => setShowLedger(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100"
          >
            <ClipboardList size={13} />
            Ledger
          </button>
        </div>
      </header>

      {error && (
        <div className="flex-shrink-0 border-b border-red-100 bg-red-50 px-6 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-h-0 border-r border-ink-100">
          <ComplaintForm
            extractedData={extractedData}
            riskAssessment={riskAssessment}
            status={status}
            onCommit={handleCommit}
            isCommitting={isCommitting}
          />
        </div>
        <div className="min-h-0">
          <CopilotPanel
            messages={messages}
            status={status}
            isBusy={isBusy}
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
          />
        </div>
      </main>

      {showLedger && <LedgerDrawer onClose={() => setShowLedger(false)} />}
    </div>
  );
}

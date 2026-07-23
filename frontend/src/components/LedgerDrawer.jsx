import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ClipboardList } from "lucide-react";
import { fetchLedger } from "../store/complaintSlice";

const SEVERITY_COLOR = {
  Critical: "text-red-600 bg-red-50",
  Major: "text-status-pending bg-status-pending-bg",
  Minor: "text-status-ready bg-status-ready-bg",
};

export default function LedgerDrawer({ onClose }) {
  const dispatch = useDispatch();
  const { ledger, isLoadingLedger } = useSelector((s) => s.complaint);

  useEffect(() => {
    dispatch(fetchLedger());
  }, [dispatch]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <ClipboardList size={17} className="text-copilot" />
            QMS Complaint Ledger
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          {isLoadingLedger && <p className="text-sm text-ink-500">Loading…</p>}

          {!isLoadingLedger && ledger.length === 0 && (
            <p className="text-sm text-ink-500">
              No complaints have been committed yet.
            </p>
          )}

          <div className="space-y-3">
            {ledger.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-ink-100 p-4 shadow-panel"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-ink-500">
                    {c.complaint_code}
                  </span>
                  {c.severity && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        SEVERITY_COLOR[c.severity] || "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {c.severity}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-ink-900">
                  {c.product_name || "Unnamed product"}
                </div>
                <div className="mt-0.5 text-xs text-ink-500">
                  Batch {c.batch_lot_number || "—"} · {c.customer_name || "Unknown customer"}
                </div>
                {c.complaint_description && (
                  <p className="mt-2 line-clamp-2 text-xs text-ink-500">
                    {c.complaint_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

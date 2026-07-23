import { useDispatch } from "react-redux";
import { ShieldCheck, Loader2 } from "lucide-react";
import { editRiskField } from "../store/complaintSlice";

export default function RiskAssessmentPanel({ risk, status, onCommit, isCommitting }) {
  const dispatch = useDispatch();
  const isEmpty = !risk.severity;

  const handleChange = (key) => (e) =>
    dispatch(editRiskField({ field: key, value: e.target.value }));

  return (
    <div className="mt-6 rounded-xl border border-copilot/20 bg-copilot-soft/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={16} className="text-copilot" />
        <span className="text-sm font-semibold text-copilot-text">
          AI Copilot Risk Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Severity (Suggested)
          </label>
          <input
            className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copilot focus:ring-2 focus:ring-copilot/10"
            placeholder="Awaiting risk assessment…"
            value={risk.severity ?? ""}
            onChange={handleChange("severity")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Suggested Next Action
          </label>
          <input
            className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copilot focus:ring-2 focus:ring-copilot/10"
            placeholder="Awaiting risk assessment…"
            value={risk.suggested_next_action ?? ""}
            onChange={handleChange("suggested_next_action")}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Initial Risk Assessment
        </label>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copilot focus:ring-2 focus:ring-copilot/10"
          placeholder="Awaiting risk assessment…"
          value={risk.initial_risk_assessment ?? ""}
          onChange={handleChange("initial_risk_assessment")}
        />
      </div>

      <button
        onClick={onCommit}
        disabled={isEmpty || status === "committed" || isCommitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-copilot py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isCommitting && <Loader2 size={16} className="animate-spin" />}
        {status === "committed" ? "Committed to QMS Ledger" : "Commit to QMS Ledger"}
      </button>
    </div>
  );
}

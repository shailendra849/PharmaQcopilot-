const CONFIG = {
  pending_triage: { label: "Pending Triage", dot: "bg-status-pending", bg: "bg-status-pending-bg", text: "text-status-pending" },
  ready_to_commit: { label: "Ready to Commit", dot: "bg-status-ready pulse-dot", bg: "bg-status-ready-bg", text: "text-status-ready" },
  committed: { label: "Committed", dot: "bg-status-committed", bg: "bg-status-committed-bg", text: "text-status-committed" },
  idle: { label: "Awaiting Input", dot: "bg-ink-300", bg: "bg-ink-100", text: "text-ink-500" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.idle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

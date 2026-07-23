import { useRef, useState } from "react";
import { FlaskConical, Paperclip, ArrowUp, Loader2, Circle } from "lucide-react";
import ChatMessage from "./ChatMessage";

const WELCOME = {
  role: "assistant",
  content:
    "Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.",
};

export default function CopilotPanel({
  messages,
  status,
  isBusy,
  onSendMessage,
  onUploadFile,
}) {
  const [draft, setDraft] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const isCommitted = status === "committed";
  const displayMessages = messages.length ? messages : [WELCOME];

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isBusy || isCommitted) return;
    onSendMessage(text);
    setDraft("");
    scrollToBottom();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (file) => {
    if (!file || isBusy || isCommitted) return;
    onUploadFile(file);
    scrollToBottom();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      className="flex h-full flex-col bg-ink-100/60"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between border-b border-ink-200 bg-white px-6 py-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
            <FlaskConical size={16} className="text-copilot" />
            AIVOA Copilot
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            Drop complaint files or paste text below.
          </p>
        </div>
        <Circle
          size={9}
          className={`fill-current ${isBusy ? "text-status-pending pulse-dot" : "text-status-ready"}`}
        />
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 space-y-4 overflow-y-auto scrollbar-thin px-6 py-6"
      >
        {displayMessages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {isBusy && (
          <div className="flex items-center gap-2 pl-9 text-xs text-ink-500">
            <Loader2 size={13} className="animate-spin text-copilot" />
            Analyzing…
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-copilot bg-copilot-soft/80 text-sm font-medium text-copilot-text">
            Drop the complaint file to upload
          </div>
        )}
      </div>

      <div className="border-t border-ink-200 bg-white p-4">
        {isCommitted ? (
          <div className="rounded-lg bg-ink-100 px-4 py-3 text-center text-sm text-ink-500">
            This complaint has been committed to the QMS ledger.
          </div>
        ) : (
          <div className="flex items-end gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 focus-within:border-copilot focus-within:ring-2 focus-within:ring-copilot/10">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 disabled:opacity-40"
              title="Attach a complaint document"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.eml"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <textarea
              rows={1}
              className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-300"
              placeholder="Type a message or paste a complaint…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isBusy || !draft.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-copilot text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        )}
        <p className="mt-2 text-center text-[11px] tracking-wide text-ink-300">
          POWERED BY LANGGRAPH
        </p>
      </div>
    </div>
  );
}

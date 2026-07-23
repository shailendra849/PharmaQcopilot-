import { Sparkles, User, FileText } from "lucide-react";

export default function ChatMessage({ role, content, isFile, fileName }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-ink-200" : "bg-copilot-soft"
        }`}
      >
        {isUser ? (
          <User size={13} className="text-ink-600" />
        ) : (
          <Sparkles size={13} className="text-copilot" />
        )}
      </div>

      {isFile ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-panel">
          <FileText size={18} className="text-rose-400" />
          <div>
            <div className="text-sm font-medium text-ink-900">{fileName}</div>
            <div className="text-xs text-ink-500">PDF Document</div>
          </div>
        </div>
      ) : (
        <div
          className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-copilot text-white"
              : "border border-ink-100 bg-white text-ink-700 shadow-panel"
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

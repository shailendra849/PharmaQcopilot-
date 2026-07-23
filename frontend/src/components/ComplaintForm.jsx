import { FlaskConical } from "lucide-react";
import { FORM_SECTIONS } from "../formSchema";
import FormField from "./FormField";
import StatusBadge from "./StatusBadge";
import RiskAssessmentPanel from "./RiskAssessmentPanel";

export default function ComplaintForm({
  extractedData,
  riskAssessment,
  status,
  onCommit,
  isCommitting,
}) {
  const isCommitted = status === "committed";

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-thin bg-white">
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-ink-100 bg-white/95 px-8 py-6 backdrop-blur">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            Log Customer Complaint
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
            <FlaskConical size={13} />
            API &amp; FDF Quality Assurance Module
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex-1 px-8 py-6">
        {FORM_SECTIONS.map((section) => (
          <section key={section.tag} className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-ink-500">
                {section.tag}
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={extractedData[field.key]}
                  disabled={isCommitted}
                />
              ))}
            </div>
          </section>
        ))}

        <RiskAssessmentPanel
          risk={riskAssessment}
          status={status}
          onCommit={onCommit}
          isCommitting={isCommitting}
        />
      </div>
    </div>
  );
}

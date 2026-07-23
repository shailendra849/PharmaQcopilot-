import { useDispatch } from "react-redux";
import { editField } from "../store/complaintSlice";

export default function FormField({ field, value, disabled }) {
  const dispatch = useDispatch();
  const isEmpty = value === null || value === undefined || value === "";

  const handleChange = (e) =>
    dispatch(editField({ field: field.key, value: e.target.value }));

  const sharedClasses = `w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors
    ${isEmpty ? "text-ink-300" : "text-ink-900"}
    ${disabled ? "bg-ink-100 border-ink-100 cursor-not-allowed" : "bg-white border-ink-200 focus:border-copilot focus:ring-2 focus:ring-copilot/10 outline-none"}
    ${field.mono ? "font-mono" : ""}`;

  return (
    <div className={field.textarea ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">
        {field.label}
      </label>
      {field.textarea ? (
        <textarea
          rows={3}
          className={sharedClasses}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
        />
      ) : (
        <input
          type="text"
          className={sharedClasses}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}

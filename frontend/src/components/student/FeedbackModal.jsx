import { useState } from "react";

const OPTIONS = [
  "Staff was helpful",
  "Issue was resolved clearly",
  "Waiting time was reasonable",
  "Communication could be improved",
  "Process took longer than expected",
];

export default function FeedbackModal({
  ticketId,
  onSubmit,
  onClose,
}) {
  const [selected, setSelected] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleOption = (opt) => {
    setSelected((prev) =>
      prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError("Please select at least one option");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        ticketId,
        options: selected,
        comment,
      });
      // onSubmit already closes modal & shows message
    } catch (err) {
      console.error("Feedback submit failed:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0f1f4d] w-full max-w-lg rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold mb-2">
          📝 Service Feedback
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Feedback is reviewed by administration only.
        </p>

        <p className="mb-3 font-medium">
          How was your experience?{" "}
          <span className="text-red-400">*</span>
        </p>

        <div className="space-y-2 mb-6">
          {OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        <label className="block mb-2">
          Additional comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value.slice(0, 200))
          }
          className="w-full p-3 rounded-xl bg-white text-black"
          rows={4}
        />
        <p className="text-xs text-slate-400 mt-1">
          {comment.length} / 200 characters
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={selected.length === 0 || loading}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

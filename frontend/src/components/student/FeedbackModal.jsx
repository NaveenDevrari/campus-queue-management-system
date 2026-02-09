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
      <div className="bg-[var(--glass-bg)] backdrop-blur-xl w-full max-w-lg rounded-2xl p-6 border border-[var(--glass-border)] shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
          📝 Service Feedback
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Feedback is reviewed by administration only.
        </p>

        <p className="mb-3 font-medium text-[var(--text-primary)]">
          How was your experience?{" "}
          <span className="text-red-400">*</span>
        </p>

        <div className="space-y-2 mb-6 text-[var(--text-primary)]">
          {OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--glass-border)]"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-[var(--accent-primary)] w-4 h-4"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        <label className="block mb-2 text-[var(--text-primary)] font-medium">
          Additional comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) =>
            setComment(e.target.value.slice(0, 200))
          }
          className="w-full p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          rows={4}
          placeholder="Tell us more..."
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1 text-right">
          {comment.length} / 200 characters
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-400 font-bold bg-red-500/10 p-2 rounded-lg text-center">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={selected.length === 0 || loading}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-bold hover:bg-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/20 disabled:opacity-50 transition-all"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

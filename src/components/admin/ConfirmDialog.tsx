'use client';

// Shared delete-confirmation modal used by the Portfolio, Policies, and
// Pricing managers - deleting is permanent and the admin may be on a phone,
// so a single accidental tap must never remove something instantly.
export function ConfirmDialog({
  open,
  title = 'Are you sure you want to delete this item?',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="w-full max-w-xs rounded-xl border-2 border-diary-black bg-white p-5 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="font-hand text-xl text-diary-black">{title}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-full border-2 border-diary-black py-2 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-full border-2 border-diary-black bg-red-500 py-2 text-sm text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

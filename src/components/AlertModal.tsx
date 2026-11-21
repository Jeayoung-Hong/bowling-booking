import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

interface Props {
  message: string;
  detail?: string;
  onClose: () => void;
}

export default function AlertModal({ message, detail, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <h2 id="alert-title" className="mt-3 text-base font-semibold">
          {message}
        </h2>
        {detail && <p className="mt-1.5 text-sm text-slate-500">{detail}</p>}
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-navy-900 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          확인
        </button>
      </div>
    </div>
  );
}

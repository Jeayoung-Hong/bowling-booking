import { Check } from "lucide-react";

export const STEPS = [
  { id: 1, label: "인원" },
  { id: 2, label: "날짜" },
  { id: 3, label: "시간" },
  { id: 4, label: "라인" },
] as const;

interface Props {
  current: number;
  canGoTo: (step: number) => boolean;
  isDone: (step: number) => boolean;
  onGo: (step: number) => void;
}

export default function StepIndicator({ current, canGoTo, isDone, onGo }: Props) {
  return (
    <ol className="flex items-center" aria-label="예약 진행 단계">
      {STEPS.map((s, i) => {
        const active = s.id === current;
        const done = isDone(s.id) && !active;
        const reachable = canGoTo(s.id);
        return (
          <li key={s.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onGo(s.id)}
              aria-current={active ? "step" : undefined}
              className="group flex items-center gap-2.5 disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : done
                      ? "bg-navy-900 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  active ? "text-navy-900" : done ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-0.5 flex-1 rounded-full transition ${
                  isDone(s.id) ? "bg-navy-900" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

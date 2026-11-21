import { useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { formatDuration, formatKoreanDate, type Reservation } from "../lib/booking";

interface Props {
  reservation: Reservation;
  onClose: () => void;
}

export default function CompleteModal({ reservation: r, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows: [string, string][] = [
    ["인원", `${r.people}명`],
    ["사용 라인 수", `${r.laneCount}개`],
    ["날짜", formatKoreanDate(r.dateKey)],
    ["시간대", `${r.startLabel} ~ ${r.endLabel} (${formatDuration(r.minutes)})`],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-7 shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <CircleCheck className="h-12 w-12 text-blue-600" />
          <h2 id="complete-title" className="mt-3 text-xl font-bold">
            예약이 완료되었어요
          </h2>
          <p className="mt-1 text-sm text-slate-500">아래 내용으로 예약되었습니다.</p>
        </div>

        <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
          <div className="px-4 py-3">
            <dt className="mb-2 text-slate-500">라인별 이용</dt>
            <dd>
              <ul className="space-y-1.5">
                {r.lanes.map((l) => (
                  <li key={l.lane} className="flex justify-between gap-4 font-medium">
                    <span>
                      {l.lane}번 · {l.people}명
                    </span>
                    <span className="text-right">
                      {l.startLabel} ~ {l.endLabel}
                      <span className="ml-1 text-xs font-normal text-slate-500">({formatDuration(l.minutes!)})</span>
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          확인
        </button>
      </div>
    </div>
  );
}

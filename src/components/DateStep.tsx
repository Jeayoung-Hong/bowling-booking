import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey } from "../lib/booking";

interface Props {
  today: Date;
  /** 예약 가능한 마지막 날짜 (오늘 + 7일) */
  maxDate: Date;
  value: string | null;
  onSelect: (dateKey: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function DateStep({ today, maxDate, value, onSelect }: Props) {
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const todayKey = toDateKey(today);
  const maxKey = toDateKey(maxDate);

  const monthOffset = (view.y - today.getFullYear()) * 12 + (view.m - today.getMonth());
  const maxMonthOffset = (maxDate.getFullYear() - today.getFullYear()) * 12 + (maxDate.getMonth() - today.getMonth());
  const canPrev = monthOffset > 0;
  const canNext = monthOffset < maxMonthOffset;

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const arr: (number | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const move = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">날짜를 선택해 주세요</h2>
      <p className="mt-1 text-sm text-slate-500">
        오늘부터 7일 뒤({maxDate.getMonth() + 1}월 {maxDate.getDate()}일)까지 예약할 수 있어요.
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!canPrev}
            aria-label="이전 달"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold">
            {view.y}년 {view.m + 1}월
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!canNext}
            aria-label="다음 달"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const key = toDateKey(new Date(view.y, view.m, d));
            const disabled = key < todayKey || key > maxKey; // YYYY-MM-DD 문자열 비교: 과거 / 7일 초과 비활성
            const selected = key === value;
            const isToday = key === todayKey;
            const dow = i % 7;
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(key)}
                aria-pressed={selected}
                aria-label={`${view.m + 1}월 ${d}일`}
                className={`relative aspect-square rounded-xl text-sm font-medium transition ${
                  selected
                    ? "bg-blue-600 text-white shadow-sm"
                    : disabled
                      ? "cursor-not-allowed text-slate-300"
                      : `hover:bg-blue-50 ${dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-600" : "text-slate-700"}`
                } ${isToday && !selected ? "ring-1 ring-inset ring-blue-300" : ""}`}
              >
                {d}
                {isToday && (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      selected ? "bg-white" : "bg-blue-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

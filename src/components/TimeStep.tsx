import { RotateCcw } from "lucide-react";
import {
  TIME_SLOTS,
  formatDuration,
  formatKoreanDate,
  rangeInfo,
  type TimeRange,
} from "../lib/booking";

interface Props {
  dateKey: string;
  people: number;
  laneCount: number;
  quotas: number[];
  maxBlocks: number;
  range: TimeRange | null;
  /** 오늘 날짜일 때 현재 시각(분) — 이미 지난 시간 비활성화용. 오늘이 아니면 null */
  nowMinutes: number | null;
  onSlotClick: (index: number) => void;
  onReset: () => void;
}

export default function TimeStep({
  dateKey,
  people,
  laneCount,
  quotas,
  maxBlocks,
  range,
  nowMinutes,
  onSlotClick,
  onReset,
}: Props) {
  const info = range ? rangeInfo(range) : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">이용 시간을 선택해 주세요</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatKoreanDate(dateKey)} · {people}명 / {laneCount}개 라인 기준 최대 {maxBlocks}블록(
            {formatDuration(maxBlocks * 30)})
          </p>
        </div>
        {range && (
          <button
            type="button"
            onClick={onReset}
            className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <p>시작 시간을 누른 뒤, 이어서 종료 블록을 눌러 연속 구간을 선택하세요. (블록 1개 = 30분)</p>
        {quotas.length > 1 && quotas.some((q) => q !== quotas[0]) && (
          <p className="mt-1">
            라인별 이용 가능 시간:{" "}
            {quotas.map((q, i) => `라인 ${i + 1} ${formatDuration(q * 30)}`).join(" · ")}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {TIME_SLOTS.map((slot) => {
          const past = nowMinutes !== null && slot.minutes <= nowMinutes;
          const selected = !!range && slot.index >= range.start && slot.index <= range.end;
          const isEdge = !!range && (slot.index === range.start || slot.index === range.end);
          return (
            <button
              key={slot.index}
              type="button"
              disabled={past}
              onClick={() => onSlotClick(slot.index)}
              aria-pressed={selected}
              className={`rounded-xl border py-3 text-sm font-medium tabular-nums transition ${
                selected
                  ? isEdge
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-blue-500 bg-blue-500 text-white"
                  : past
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
          info ? "border-blue-100 bg-blue-50/60 text-navy-900" : "border-dashed border-slate-200 text-slate-400"
        }`}
      >
        {info ? (
          <>
            <span className="font-semibold">
              {info.startLabel} ~ {info.endLabel}
            </span>
            <span className="ml-2 text-slate-500">
              ({formatDuration(info.minutes)} · {info.blocks}/{maxBlocks}블록)
            </span>
          </>
        ) : (
          "선택된 시간이 없습니다."
        )}
      </div>
    </div>
  );
}

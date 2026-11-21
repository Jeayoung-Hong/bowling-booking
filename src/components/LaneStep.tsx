import { AlertTriangle, Check, Lock } from "lucide-react";
import { LANE_COUNT, type LaneDetail } from "../lib/booking";

interface Props {
  laneCount: number;
  selected: number[];
  reserved: number[];
  details: LaneDetail[];
  onToggle: (lane: number) => void;
}

export default function LaneStep({ laneCount, selected, reserved, details, onToggle }: Props) {
  const lanes = Array.from({ length: LANE_COUNT }, (_, i) => i + 1);
  const available = LANE_COUNT - reserved.length;
  const shortage = available < laneCount;
  const remaining = Math.max(0, laneCount - selected.length);
  const detailOf = (n: number) => details.find((d) => d.lane === n);

  return (
    <div>
      <h2 className="text-lg font-semibold">레인을 선택해 주세요</h2>
      <p className="mt-1 text-sm text-slate-500">
        <b className="text-navy-900">{laneCount}개</b> 라인을 선택해야 해요. ({selected.length}/{laneCount})
        {remaining > 0 ? ` ${remaining}개 더 선택해 주세요.` : " 선택이 완료됐어요."}
      </p>

      {shortage && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            선택한 시간대에 예약 가능한 라인({available}개)이 사용 라인 수({laneCount}개)보다 적어요. 시간이나 날짜를
            바꾸거나 라인 수를 줄여 주세요.
          </span>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-center text-xs font-medium tracking-widest text-slate-400">— 입구 —</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {lanes.map((n) => {
            const isReserved = reserved.includes(n);
            const isSelected = selected.includes(n);
            const d = detailOf(n);
            return (
              <button
                key={n}
                type="button"
                disabled={isReserved}
                onClick={() => onToggle(n)}
                aria-pressed={isSelected}
                aria-label={`${n}번 레인 ${isReserved ? "예약 불가" : isSelected ? "선택됨" : "선택 가능"}`}
                className={`relative flex flex-col items-center rounded-xl border-2 px-2 py-4 transition ${
                  isReserved
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border-slate-200 bg-white text-navy-900 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <span className={`text-[10px] font-semibold tracking-widest ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  LANE
                </span>
                <span className="text-3xl font-bold tabular-nums leading-tight">{n}</span>
                <span
                  className={`my-2 h-1 w-10 rounded-full ${
                    isReserved ? "bg-slate-200" : isSelected ? "bg-white/40" : "bg-blue-100"
                  }`}
                />
                <span className="flex items-center gap-1 text-xs font-medium">
                  {isReserved ? (
                    <>
                      <Lock className="h-3 w-3" /> 예약 불가
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="h-3 w-3" /> 선택됨
                    </>
                  ) : (
                    "선택 가능"
                  )}
                </span>
                {isSelected && d && (
                  <span className="mt-1 text-[11px] text-blue-100">
                    {d.people}명{d.startLabel ? ` · ${d.startLabel}~${d.endLabel}` : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs font-medium tracking-widest text-slate-400">— 핀 —</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <Legend className="border-slate-200 bg-white" label="선택 가능" />
        <Legend className="border-blue-600 bg-blue-600" label="선택 완료" />
        <Legend className="border-slate-200 bg-slate-100" label="예약 불가" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded border-2 ${className}`} />
      {label}
    </span>
  );
}

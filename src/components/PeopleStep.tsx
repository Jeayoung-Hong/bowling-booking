import { Clock, LayoutGrid, Minus, Plus } from "lucide-react";
import {
  LANE_CAPACITY,
  MAX_PEOPLE,
  MIN_PEOPLE,
  formatDuration,
  laneQuotas,
  maxLaneCount,
  minLanes,
} from "../lib/booking";

interface Props {
  people: number;
  laneCount: number;
  onPeopleChange: (n: number) => void;
  onLaneCountChange: (n: number) => void;
}

function Stepper({
  value,
  min,
  max,
  unit,
  label,
  size = "lg",
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  size?: "lg" | "md";
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn =
    "flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700";
  const btnSize = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`${label} 줄이기`}
        className={`${btn} ${btnSize}`}
      >
        <Minus className="h-5 w-5" />
      </button>
      <div className="flex min-w-24 items-baseline justify-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v)) onChange(clamp(v));
          }}
          aria-label={label}
          className={`appearance-none bg-transparent text-center font-bold tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            size === "lg" ? "w-20 text-5xl" : "w-14 text-3xl"
          }`}
        />
        <span className={`text-slate-500 ${size === "lg" ? "text-lg" : "text-base"}`}>{unit}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`${label} 늘리기`}
        className={`${btn} ${btnSize}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function PeopleStep({ people, laneCount, onPeopleChange, onLaneCountChange }: Props) {
  const minL = minLanes(people);
  const maxL = maxLaneCount(people);
  const quotas = laneQuotas(people, laneCount);
  const longest = quotas[0] * 30;

  return (
    <div>
      <h2 className="text-lg font-semibold">몇 명이 함께하시나요?</h2>
      <p className="mt-1 text-sm text-slate-500">
        최소 {MIN_PEOPLE}명 ~ 최대 {MAX_PEOPLE}명까지 예약할 수 있어요.
      </p>

      <div className="mt-6">
        <Stepper
          value={people}
          min={MIN_PEOPLE}
          max={MAX_PEOPLE}
          unit="명"
          label="예약 인원"
          onChange={onPeopleChange}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <h3 className="text-sm font-semibold">사용할 라인 수</h3>
        <p className="mt-1 text-xs text-slate-500">
          1개 라인당 최대 {LANE_CAPACITY}명이라 최소 {minL}개 라인이 필요해요. 라인을 나눌수록 라인당 이용 시간은 줄어들어요.
          (선택 가능: {minL}~{maxL}개)
        </p>
        <div className="mt-4">
          <Stepper
            value={laneCount}
            min={minL}
            max={maxL}
            unit="개"
            label="사용 라인 수"
            size="md"
            onChange={onLaneCountChange}
          />
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {quotas.map((q, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
            >
              <span className="font-medium">라인 {i + 1} · {q}명</span>
              <span className="text-slate-500">최대 {formatDuration(q * 30)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <LayoutGrid className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-navy-900">
              {laneCount}개 라인 예약 (최소 {minL}개 필요)
            </p>
            <p className="mt-0.5 text-xs text-slate-500">라인 선택 단계에서 정확히 {laneCount}개를 골라 주세요</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-navy-900">
              최대 {formatDuration(longest)}({quotas[0]}블록) 이용 가능
            </p>
            <p className="mt-0.5 text-xs text-slate-500">라인 1개당 최대 2시간(4블록)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { CalendarDays, Clock, LayoutGrid, Users } from "lucide-react";
import { formatDuration, formatKoreanDate, rangeInfo, type LaneDetail, type TimeRange } from "../lib/booking";

interface Props {
  people: number;
  laneCount: number;
  minLaneCount: number;
  dateKey: string | null;
  range: TimeRange | null;
  lanes: LaneDetail[];
  canReserve: boolean;
  onReserve: () => void;
}

export default function SummaryPanel({
  people,
  laneCount,
  minLaneCount,
  dateKey,
  range,
  lanes,
  canReserve,
  onReserve,
}: Props) {
  const info = range ? rangeInfo(range) : null;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-base font-semibold">예약 요약</h2>
      <dl className="mt-4 space-y-4">
        <Row icon={Users} label="인원" value={`${people}명`} />
        <Row icon={LayoutGrid} label="사용 라인 수" value={`${laneCount}개 (최소 ${minLaneCount}개 필요)`} />
        <Row icon={CalendarDays} label="날짜" value={dateKey ? formatKoreanDate(dateKey) : null} />
        <Row
          icon={Clock}
          label="시간대"
          value={info ? `${info.startLabel} ~ ${info.endLabel} (${formatDuration(info.minutes)})` : null}
        />
        <Row
          icon={LayoutGrid}
          label={`선택 라인 (${lanes.length}/${laneCount})`}
          value={
            lanes.length ? (
              <ul className="space-y-1">
                {lanes.map((l) => (
                  <li key={l.lane}>
                    {l.lane}번 · {l.people}명
                    {l.startLabel && (
                      <span className="block text-xs font-normal text-slate-500">
                        {l.startLabel} ~ {l.endLabel} ({formatDuration(l.minutes!)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null
          }
        />
      </dl>

      <button
        type="button"
        onClick={onReserve}
        disabled={!canReserve}
        className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        예약하기
      </button>
      {!canReserve && (
        <p className="mt-2 text-center text-xs text-slate-400">모든 단계를 완료하면 예약할 수 있어요.</p>
      )}
    </aside>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${value ? "text-blue-600" : "text-slate-300"}`} />
      <div className="min-w-0">
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className={`text-sm ${value ? "font-medium text-navy-900" : "text-slate-300"}`}>{value ?? "미선택"}</dd>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import StepIndicator from "../components/StepIndicator";
import PeopleStep from "../components/PeopleStep";
import DateStep from "../components/DateStep";
import TimeStep from "../components/TimeStep";
import LaneStep from "../components/LaneStep";
import SummaryPanel from "../components/SummaryPanel";
import CompleteModal from "../components/CompleteModal";
import AlertModal from "../components/AlertModal";
import { getUser, logout } from "../lib/auth";
import {
  BOOKING_WINDOW_DAYS,
  MAX_PEOPLE,
  MIN_PEOPLE,
  addDays,
  buildLaneDetails,
  formatDuration,
  laneQuotas,
  maxBlocks as calcMaxBlocks,
  maxLaneCount,
  minLanes,
  rangeInfo,
  toDateKey,
  type Reservation,
  type TimeRange,
} from "../lib/booking";
import { getReservedLanesForRange } from "../lib/mock";

const EXCEED_MESSAGE = "최대 예약 가능 횟수를 초과하였습니다";

export default function BookingPage() {
  const navigate = useNavigate();
  const user = getUser();

  // 시스템 현재 시각 기준 (마운트 시점 고정). 예약 가능 기간: 오늘 ~ 7일 뒤
  const [now] = useState(() => new Date());
  const todayKey = toDateKey(now);
  const maxDate = useMemo(() => addDays(now, BOOKING_WINDOW_DAYS), [now]);

  const [step, setStep] = useState(1);
  const [people, setPeople] = useState(2);
  const [laneCount, setLaneCount] = useState(1);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange | null>(null);
  const [lanes, setLanes] = useState<number[]>([]);
  const [completed, setCompleted] = useState<Reservation | null>(null);
  const [alert, setAlert] = useState<{ message: string; detail?: string } | null>(null);

  // ── 파생 값 ──
  const minL = minLanes(people);
  const quotas = laneQuotas(people, laneCount);
  const maxBlocks = calcMaxBlocks(people, laneCount);

  const reservedLanes = useMemo(
    () => (dateKey && range ? getReservedLanesForRange(dateKey, range.start, range.end) : []),
    [dateKey, range],
  );

  const laneDetails = useMemo(
    () => buildLaneDetails(people, laneCount, lanes, range),
    [people, laneCount, lanes, range],
  );

  const nowMinutes = dateKey === todayKey ? now.getHours() * 60 + now.getMinutes() : null;

  const valid: Record<number, boolean> = {
    1: people >= MIN_PEOPLE && people <= MAX_PEOPLE && laneCount >= minL && laneCount <= maxLaneCount(people),
    2: !!dateKey,
    3: !!range,
    4: lanes.length === laneCount,
  };
  const canGoTo = (target: number) => Array.from({ length: target - 1 }, (_, i) => i + 1).every((s) => valid[s]);
  const canReserve = [1, 2, 3, 4].every((s) => valid[s]);

  // ── 핸들러 ──
  /** 라인 수/인원 변경 후 새 최대 블록 수에 맞게 시간대를 잘라냄 */
  const trimRange = (limit: number) =>
    setRange((r) => (r && r.end - r.start + 1 > limit ? { start: r.start, end: r.start + limit - 1 } : r));

  const changePeople = (n: number) => {
    const newMin = minLanes(n);
    const newMax = maxLaneCount(n);
    // 라인 수가 기존 최소값이었다면 새 최소값을 따라가고, 아니면 허용 범위로 보정
    const newLaneCount = laneCount === minL ? newMin : Math.min(newMax, Math.max(newMin, laneCount));
    setPeople(n);
    setLaneCount(newLaneCount);
    trimRange(calcMaxBlocks(n, newLaneCount));
    setLanes((prev) => prev.slice(0, newLaneCount));
  };

  const changeLaneCount = (l: number) => {
    setLaneCount(l);
    trimRange(calcMaxBlocks(people, l));
    setLanes((prev) => prev.slice(0, l));
  };

  const selectDate = (key: string) => {
    if (key === dateKey) return;
    setDateKey(key);
    setRange(null);
    setLanes([]);
  };

  const applyRange = (next: TimeRange | null) => {
    setRange(next);
    // 새 시간대에 예약 불가가 된 라인은 선택 해제
    const reserved = dateKey && next ? getReservedLanesForRange(dateKey, next.start, next.end) : [];
    setLanes((prev) => prev.filter((l) => !reserved.includes(l)));
  };

  const handleSlotClick = (i: number) => {
    if (!range) return applyRange({ start: i, end: i });
    const { start, end } = range;

    // 이미 선택된 구간 안을 누르면 → 그 블록까지로 축소 (단일 블록이면 선택 해제)
    if (i >= start && i <= end) {
      if (start === end) return applyRange(null);
      return applyRange({ start, end: i });
    }

    // 구간 밖을 누르면 → 연속 구간으로 확장. 최대 블록 수를 넘으면 기존 선택을 유지하고 안내창 표시
    const next = { start: Math.min(start, i), end: Math.max(end, i) };
    if (next.end - next.start + 1 > maxBlocks) {
      setAlert({
        message: EXCEED_MESSAGE,
        detail: `현재 설정에서는 최대 ${maxBlocks}블록(${formatDuration(maxBlocks * 30)})까지 선택할 수 있어요.`,
      });
      return;
    }
    applyRange(next);
  };

  const toggleLane = (n: number) => {
    if (lanes.includes(n)) return setLanes((prev) => prev.filter((l) => l !== n));
    if (lanes.length >= laneCount) {
      setAlert({
        message: EXCEED_MESSAGE,
        detail: `선택할 수 있는 라인은 ${laneCount}개입니다. 다른 라인을 고르려면 기존 선택을 먼저 해제해 주세요.`,
      });
      return;
    }
    setLanes((prev) => [...prev, n]);
  };

  const reserve = () => {
    if (!canReserve || !dateKey || !range) return;
    const info = rangeInfo(range);
    setCompleted({
      people,
      laneCount,
      dateKey,
      startLabel: info.startLabel,
      endLabel: info.endLabel,
      minutes: info.minutes,
      lanes: laneDetails,
    });
  };

  const resetAll = () => {
    setCompleted(null);
    setStep(1);
    setPeople(2);
    setLaneCount(1);
    setDateKey(null);
    setRange(null);
    setLanes([]);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isLast = step === 4;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-sm font-bold text-white">
              S
            </div>
            <span className="font-bold tracking-tight">스트라이크 볼링</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden max-w-48 truncate text-slate-500 sm:block">{user}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">볼링 예약</h1>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <StepIndicator
            current={step}
            canGoTo={canGoTo}
            isDone={(s) => valid[s] && s < step}
            onGo={(s) => canGoTo(s) && setStep(s)}
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {step === 1 && (
              <PeopleStep
                people={people}
                laneCount={laneCount}
                onPeopleChange={changePeople}
                onLaneCountChange={changeLaneCount}
              />
            )}
            {step === 2 && <DateStep today={now} maxDate={maxDate} value={dateKey} onSelect={selectDate} />}
            {step === 3 && dateKey && (
              <TimeStep
                dateKey={dateKey}
                people={people}
                laneCount={laneCount}
                quotas={quotas}
                maxBlocks={maxBlocks}
                range={range}
                nowMinutes={nowMinutes}
                onSlotClick={handleSlotClick}
                onReset={() => applyRange(null)}
              />
            )}
            {step === 4 && range && (
              <LaneStep
                laneCount={laneCount}
                selected={lanes}
                reserved={reservedLanes}
                details={laneDetails}
                onToggle={toggleLane}
              />
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:invisible"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={reserve}
                  disabled={!canReserve}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  예약하기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  disabled={!valid[step]}
                  className="flex items-center gap-1 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <SummaryPanel
            people={people}
            laneCount={laneCount}
            minLaneCount={minL}
            dateKey={dateKey}
            range={range}
            lanes={laneDetails}
            canReserve={canReserve}
            onReserve={reserve}
          />
        </div>
      </main>

      {completed && <CompleteModal reservation={completed} onClose={resetAll} />}
      {alert && <AlertModal message={alert.message} detail={alert.detail} onClose={() => setAlert(null)} />}
    </div>
  );
}

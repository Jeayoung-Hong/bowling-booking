// ───────── 비즈니스 규칙 상수 ─────────
export const LANE_CAPACITY = 4; // 1개 라인 최대 수용 인원
export const MINUTES_PER_PERSON = 30; // 1인당 이용 시간(분) = 1블록
export const SLOT_MINUTES = 30; // 시간 블록 단위
export const MIN_PEOPLE = 1;
export const MAX_PEOPLE = 40;
export const LANE_COUNT = 10;
export const BOOKING_WINDOW_DAYS = 7; // 오늘 기준 7일 뒤까지 예약 가능

// 운영 시간: 13:00 시작 ~ 마지막 시작 22:00 (종료 22:30)
export const OPEN_MINUTES = 13 * 60;
export const LAST_START_MINUTES = 22 * 60;

export const TIME_SLOTS: { index: number; minutes: number; label: string }[] = (() => {
  const slots = [];
  for (let m = OPEN_MINUTES, i = 0; m <= LAST_START_MINUTES; m += SLOT_MINUTES, i++) {
    slots.push({ index: i, minutes: m, label: formatMinutes(m) });
  }
  return slots;
})();

// ───────── 인원 / 라인 / 시간 계산 ─────────
/** 인원수 기준 최소 라인 수 (1개 라인당 최대 4명) */
export const minLanes = (people: number) => Math.ceil(people / LANE_CAPACITY);

/** 선택 가능한 최대 라인 수 (라인당 최소 1명, 전체 10개 레인) */
export const maxLaneCount = (people: number) => Math.min(people, LANE_COUNT);

/**
 * 인원을 라인 수만큼 최대한 고르게 나눈 라인별 인원 (내림차순).
 * 1인당 30분(1블록)이므로 "라인별 인원 = 그 라인의 최대 이용 블록 수"입니다.
 * 예) 8명/2라인 → [4,4] (각 2시간), 5명/2라인 → [3,2] (1시간 30분, 1시간)
 */
export function laneQuotas(people: number, laneCount: number): number[] {
  const l = Math.max(1, laneCount);
  const base = Math.floor(people / l);
  const rem = people % l;
  return Array.from({ length: l }, (_, i) => base + (i < rem ? 1 : 0));
}

/** 예약 시간대(연속 블록)로 선택할 수 있는 최대 블록 수 = 가장 오래 쓰는 라인의 블록 수 (최대 4블록 = 2시간) */
export const maxBlocks = (people: number, laneCount: number) => laneQuotas(people, laneCount)[0];

// ───────── 포맷 유틸 ─────────
export function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export function formatKoreanDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`;
}

export interface TimeRange {
  start: number; // TIME_SLOTS index
  end: number; // TIME_SLOTS index (포함)
}

export function rangeInfo(range: TimeRange) {
  const blocks = range.end - range.start + 1;
  const startMin = TIME_SLOTS[range.start].minutes;
  const endMin = TIME_SLOTS[range.end].minutes + SLOT_MINUTES;
  return {
    blocks,
    minutes: blocks * SLOT_MINUTES,
    startLabel: formatMinutes(startMin),
    endLabel: formatMinutes(endMin),
  };
}

// ───────── 라인별 이용 내역 ─────────
export interface LaneDetail {
  lane: number;
  people: number; // 해당 라인 이용 인원
  minutes: number | null; // 해당 라인 이용 시간 (시간대 미선택이면 null)
  startLabel: string | null;
  endLabel: string | null;
}

/**
 * 선택한 라인(번호 오름차순)에 라인별 인원을 배정하고, 각 라인의 이용 시간을 계산합니다.
 * 라인 이용 시간 = min(라인별 인원 × 30분, 선택한 시간대 길이), 시작은 선택 시간대의 시작 시각입니다.
 */
export function buildLaneDetails(
  people: number,
  laneCount: number,
  lanes: number[],
  range: TimeRange | null,
): LaneDetail[] {
  const quotas = laneQuotas(people, laneCount);
  const sorted = [...lanes].sort((a, b) => a - b);
  return sorted.map((lane, i) => {
    const q = quotas[i] ?? quotas[quotas.length - 1];
    if (!range) return { lane, people: q, minutes: null, startLabel: null, endLabel: null };
    const windowBlocks = range.end - range.start + 1;
    const blocks = Math.min(q, windowBlocks);
    const startMin = TIME_SLOTS[range.start].minutes;
    return {
      lane,
      people: q,
      minutes: blocks * SLOT_MINUTES,
      startLabel: formatMinutes(startMin),
      endLabel: formatMinutes(startMin + blocks * SLOT_MINUTES),
    };
  });
}

export interface Reservation {
  people: number;
  laneCount: number;
  dateKey: string;
  startLabel: string;
  endLabel: string;
  minutes: number;
  lanes: LaneDetail[];
}

import { LANE_COUNT } from "./booking";

/**
 * Mock 예약 데이터.
 * 실제 DB/API 연동 전까지 "날짜 + 3시간 구간" 단위로 2~3개 라인이 이미 예약된 것으로 가정합니다.
 * (같은 날짜·시간대는 항상 같은 결과가 나오도록 시드 기반으로 생성)
 *
 * 백엔드 연동 시 이 파일의 getReservedLanesForRange 만 API 호출로 교체하면 됩니다.
 */
const BUCKET_SLOTS = 6; // 6블록 = 3시간

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  next();
  next();
  next();
  return next;
}

function reservedLanesForBucket(dateKey: string, bucket: number): number[] {
  const rand = seeded(hash(`${dateKey}#${bucket}`));
  const count = 2 + Math.floor(rand() * 2); // 2~3개
  const lanes = new Set<number>();
  while (lanes.size < count) lanes.add(1 + Math.floor(rand() * LANE_COUNT));
  return [...lanes].sort((a, b) => a - b);
}

/** 선택한 시간 구간(블록 index start~end)에 하나라도 예약된 라인 번호 목록 */
export function getReservedLanesForRange(dateKey: string, start: number, end: number): number[] {
  const set = new Set<number>();
  const firstBucket = Math.floor(start / BUCKET_SLOTS);
  const lastBucket = Math.floor(end / BUCKET_SLOTS);
  for (let b = firstBucket; b <= lastBucket; b++) {
    reservedLanesForBucket(dateKey, b).forEach((l) => set.add(l));
  }
  return [...set].sort((a, b) => a - b);
}

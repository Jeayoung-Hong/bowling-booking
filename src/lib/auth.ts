// 목업 인증: 백엔드 연동 전까지 sessionStorage 에 사용자 ID만 저장합니다.
const KEY = "bowling_user";

export function getUser(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function login(userId: string) {
  try {
    sessionStorage.setItem(KEY, userId);
  } catch {
    /* 저장 불가 환경에서는 무시 */
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

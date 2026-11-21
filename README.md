# 스트라이크 볼링 예약 (프론트엔드)

React + TypeScript + Tailwind CSS v4 + lucide-react + react-router-dom (Vite)

## 실행
```bash
npm install
npm run dev     # http://localhost:5173  (/login → /booking)
npm run build   # 타입 체크 + 프로덕션 빌드
```

## 구조
- `src/lib/booking.ts` : 비즈니스 규칙(라인당 4명, 1인 30분, 운영시간)·계산·포맷
- `src/lib/mock.ts`    : 이미 예약된 라인 Mock 데이터 (API 연동 시 이 함수만 교체)
- `src/lib/auth.ts`    : 목업 로그인(sessionStorage)
- `src/pages/`         : LoginPage, BookingPage(상태 관리)
- `src/components/`    : StepIndicator, PeopleStep, DateStep, TimeStep, LaneStep, SummaryPanel, CompleteModal

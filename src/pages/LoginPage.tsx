import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { getUser, login } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({});

  if (getUser()) return <Navigate to="/booking" replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: { id?: string; pw?: string } = {};
    const trimmed = id.trim();
    if (!trimmed) next.id = "아이디(또는 이메일)를 입력해 주세요.";
    else if (trimmed.includes("@") && !EMAIL_RE.test(trimmed)) next.id = "이메일 형식이 올바르지 않습니다.";
    if (!pw) next.pw = "비밀번호를 입력해 주세요.";
    else if (pw.length < 4) next.pw = "비밀번호는 4자 이상 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // 목업 로그인: 유효성만 통과하면 성공 처리
    login(trimmed);
    navigate("/booking", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-navy-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-xl font-bold text-white shadow-lg shadow-navy-900/20">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight">스트라이크 볼링</h1>
          <p className="mt-1 text-sm text-slate-500">로그인하고 레인을 예약하세요</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div>
            <label htmlFor="id" className="mb-1.5 block text-sm font-medium text-slate-700">
              아이디 또는 이메일
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
                placeholder="bowling@example.com"
                aria-invalid={!!errors.id}
                className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                  errors.id ? "border-red-400" : "border-slate-200"
                }`}
              />
            </div>
            {errors.id && <p className="mt-1.5 text-xs text-red-500">{errors.id}</p>}
          </div>

          <div>
            <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="pw"
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
                placeholder="비밀번호 4자 이상"
                aria-invalid={!!errors.pw}
                className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                  errors.pw ? "border-red-400" : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.pw && <p className="mt-1.5 text-xs text-red-500">{errors.pw}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
          >
            로그인
          </button>

          <p className="text-center text-xs text-slate-400">
            백엔드 연동 전 목업입니다. 유효성 검사를 통과하면 로그인됩니다.
          </p>
        </form>
      </div>
    </main>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";
import { getUser } from "./lib/auth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getUser() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/booking"
        element={
          <RequireAuth>
            <BookingPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/booking" replace />} />
    </Routes>
  );
}

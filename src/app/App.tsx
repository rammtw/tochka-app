import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "@/pages/login";
import { PasswordsPage } from "@/pages/passwords";
import { TasksPage } from "@/pages/tasks";
import { WikiDocumentPage, WikiPage } from "@/pages/wiki";
import { useAuth } from "@/shared/auth";

function AuthLoading() {
  return (
    <div className="auth-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>Проверяем сессию...</span>
    </div>
  );
}

function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<TasksPage />} />
          <Route path="wiki" element={<WikiPage />} />
          <Route path="wiki/:id" element={<WikiDocumentPage />} />
          <Route path="passwords" element={<PasswordsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

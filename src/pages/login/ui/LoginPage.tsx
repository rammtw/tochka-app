import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import "./login-page.css";

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) {
    return <div className="auth-loading" role="status"><span className="spinner" />Проверяем сессию...</div>;
  }
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(username.trim(), password);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand__mark"><Icon name="check" size={26} /></span>
          <span><strong>точка</strong><small>план · дело · знания</small></span>
        </div>
        <div className="login-card__heading">
          <span className="login-card__icon"><Icon name="lock" size={23} /></span>
          <h1 id="login-title">С возвращением</h1>
          <p>Войдите в личное рабочее пространство.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-username">Логин</label>
            <input id="login-username" name="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Введите логин" autoComplete="username" maxLength={320} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="login-password">Пароль</label>
            <div className="login-password">
              <input id="login-password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" autoComplete="current-password" maxLength={1000} required />
              <Button variant="ghost" size="icon" aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} icon={<Icon name={showPassword ? "eye-off" : "eye"} size={18} />} onClick={() => setShowPassword((value) => !value)} />
            </div>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <Button className="login-form__submit" type="submit" loading={submitting}>Войти</Button>
        </form>
        <p className="login-card__note"><Icon name="lock" size={13} /> Локальный доступ без регистрации</p>
      </section>
    </main>
  );
}

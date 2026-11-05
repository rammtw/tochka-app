import { NavLink, Outlet } from "react-router-dom";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";

const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Мой день", icon: "tasks" },
  { to: "/wiki", label: "База знаний", icon: "book" },
  { to: "/passwords", label: "Пароли", icon: "lock" },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Точка — на главную">
          <span className="brand__mark"><Icon name="check" size={26} /></span>
          <span>
            <strong>точка</strong>
            <small>план · дело · знания</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Основная навигация">
          <span className="main-nav__caption">Рабочее пространство</span>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `main-nav__link ${isActive ? "main-nav__link--active" : ""}`
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="storage-indicator" aria-hidden="true" />
          <div>
            <strong>Данные сохранены</strong>
            <span>Локальная SQLite-база</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

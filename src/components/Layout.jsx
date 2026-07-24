import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClock, formatDataHora } from '../utils/useClock';

const CHANNELS = [
  { to: '/cards', code: 'CH.01 · CARDS', label: 'Gerador de Card' },
  { to: '/report', code: 'CH.02 · LOG', label: 'Relatório' },
  { to: '/turn-pass', code: 'CH.03 · HANDOFF', label: 'Passagem de turno' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const now = useClock(60000);

  return (
    <div className="container">
      <header className="app-header panel">
        <div className="brand">
          <span className="brand__radar" aria-hidden="true" />
          <div>
            <h1 className="brand__title">
              APK CargioTran
              <span className="badge badge--signal">Shopee</span>
            </h1>
            <div className="brand__sub">Torre de controle de frota</div>
          </div>
        </div>

        <div className="header-status">
          <span className="live-dot">
            <span className="dot" /> AO VIVO
          </span>
          <span className="data-hora">{formatDataHora(now)}</span>
          {user && (
            <button className="logout-btn" onClick={logout} title="Encerrar sessão">
              {user.operatorId} · sair
            </button>
          )}
        </div>
      </header>

      <nav className="channel-nav">
        {CHANNELS.map((c) => (
          <NavLink
            key={c.to}
            to={c.to}
            className={({ isActive }) => `channel-tab${isActive ? ' active' : ''}`}
          >
            <span className="channel-tab__code">{c.code}</span>
            <span className="channel-tab__label">{c.label}</span>
          </NavLink>
        ))}
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="page-footer">
        Status EM VIAGEM ou FINALIZADO não mostra contagem regressiva · dados atualizados em tempo real
      </footer>
    </div>
  );
}

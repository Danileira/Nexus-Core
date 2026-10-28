import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Veiculos } from './components/Veiculos';
import { Motoristas } from './components/Motoristas';
import { Viagens } from './components/Viagens';
import { LayoutDashboard, Truck, Users, MapPin, ShieldCheck, Search, Bell, Check, X } from 'lucide-react';
import { useIdioma } from './context/IdiomaContext';

export default function App() {
  const { idioma, alternarIdioma, t } = useIdioma();
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [menuNotificacoesAberto, setMenuNotificacoesAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([
    { id: 1, texto: 'Sistema Nexus-Core iniciado com sucesso.', lida: false, hora: 'Hoje' },
    { id: 2, texto: 'Conexão com API Flask estabelecida.', lida: false, hora: 'Hoje' },
  ]);

  const naoLidasCount = notificacoes.filter(n => !n.lida).length;

  function marcarTodasComoLidas() {
    setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
  }

  function removerNotificacao(id) {
    setNotificacoes(notificacoes.filter(n => n.id !== id));
  }

  return (
    <div className="app-container">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <ShieldCheck size={32} color="#38bdf8" />
          <div className="sidebar-brand">
            <h1>Nexus-Core</h1>
            <span>{t('subtituloHeader')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-button ${abaAtiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button 
            className={`nav-button ${abaAtiva === 'veiculos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('veiculos')}
          >
            <Truck size={18} />
            {t('veiculos')}
          </button>

          <button 
            className={`nav-button ${abaAtiva === 'motoristas' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('motoristas')}
          >
            <Users size={18} />
            {t('motoristas')}
          </button>

          <button 
            className={`nav-button ${abaAtiva === 'viagens' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('viagens')}
          >
            <MapPin size={18} />
            {t('viagens')}
          </button>
        </nav>
      </aside>

      {/* Área Principal */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className="topbar">
          <div className="topbar-title">
            {abaAtiva === 'dashboard' && t('dashboard')}
            {abaAtiva === 'veiculos' && t('veiculos')}
            {abaAtiva === 'motoristas' && t('motoristas')}
            {abaAtiva === 'viagens' && t('viagens')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Seletor de Idioma PT / EN */}
            <div style={{ display: 'flex', gap: '4px', background: '#131b2e', padding: '4px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => alternarIdioma('pt')}
                style={{
                  background: idioma === 'pt' ? '#0284c7' : 'transparent',
                  color: idioma === 'pt' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                PT
              </button>
              <button
                onClick={() => alternarIdioma('en')}
                style={{
                  background: idioma === 'en' ? '#0284c7' : 'transparent',
                  color: idioma === 'en' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                EN
              </button>
            </div>

            {/* Campo de Busca */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={t('pesquisar')}
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px 8px 36px', borderRadius: '20px', fontSize: '13px', height: '38px' }}
              />
              {buscaGlobal && (
                <button onClick={() => setBuscaGlobal('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown de Notificações */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuNotificacoesAberto(!menuNotificacoesAberto)}
                style={{ position: 'relative', cursor: 'pointer', padding: '10px', background: '#131b2e', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={t('notificacoes')}
              >
                <Bell size={18} color="#94a3b8" />
                {naoLidasCount > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', background: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 8px #38bdf8' }}></span>}
              </button>

              {menuNotificacoesAberto && (
                <div style={{ position: 'absolute', right: 0, top: '50px', width: '320px', background: '#131b2e', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{t('notificacoes')} ({naoLidasCount})</span>
                    {naoLidasCount > 0 && (
                      <button onClick={marcarTodasComoLidas} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> {t('marcarLidas')}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {notificacoes.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '12px' }}>{t('semNotificacoes')}</p>
                    ) : (
                      notificacoes.map((n) => (
                        <div key={n.id} style={{ padding: '10px', borderRadius: '8px', background: n.lida ? '#090d16' : 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.4' }}>{n.texto}</p>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.hora}</span>
                          </div>
                          <button onClick={() => removerNotificacao(n.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status do Backend */}
            <div className="status-indicator">
              <span className="status-dot"></span>
              Flask API
            </div>
          </div>
        </header>

        {/* Corpo com o Conteúdo */}
        <div className="content-body" style={{ flex: 1 }}>
          {abaAtiva === 'dashboard' && <Dashboard filtro={buscaGlobal} />}
          {abaAtiva === 'veiculos' && <Veiculos filtro={buscaGlobal} />}
          {abaAtiva === 'motoristas' && <Motoristas filtro={buscaGlobal} />}
          {abaAtiva === 'viagens' && <Viagens filtro={buscaGlobal} />}
        </div>

        {/* Rodapé com Copyright */}
        <footer style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: 'auto' }}>
          {t('copyright')}
        </footer>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, Users, MapPin, Activity, BarChart3, PieChart } from 'lucide-react';
import { useIdioma } from '../context/IdiomaContext';

export function Dashboard({ filtro = '' }) {
  const { t } = useIdioma();
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [viagens, setViagens] = useState([]);

  useEffect(() => {
    async function carregarDadosCompletos() {
      try {
        const [resVeiculos, resMotoristas, resViagens] = await Promise.all([
          api.get('/veiculos'),
          api.get('/motoristas'),
          api.get('/viagens')
        ]);

        setVeiculos(resVeiculos.data);
        setMotoristas(resMotoristas.data);
        setViagens(resViagens.data);
      } catch (error) {
        console.error('Erro ao carregar dados do Dashboard:', error);
      }
    }

    carregarDadosCompletos();
  }, []);

  const totalVeiculos = veiculos.length;
  const veiculosDisponiveis = veiculos.filter(v => v.status === 'DISPONIVEL').length;
  const veiculosEmViagem = totalVeiculos - veiculosDisponiveis;
  const pctVeiculosDisp = totalVeiculos > 0 ? (veiculosDisponiveis / totalVeiculos) * 100 : 0;
  const pctVeiculosRota = totalVeiculos > 0 ? (veiculosEmViagem / totalVeiculos) * 100 : 0;

  const totalMotoristas = motoristas.length;
  const motoristasDisponiveis = motoristas.filter(m => m.status === 'DISPONIVEL').length;
  const motoristasEmViagem = totalMotoristas - motoristasDisponiveis;

  const totalViagens = viagens.length;
  const viagensConcluidas = viagens.filter(v => v.status === 'CONCLUIDA').length;
  const viagensEmAndamento = totalViagens - viagensConcluidas;

  const capacidadeTotalTon = veiculos.reduce((acc, v) => acc + (parseFloat(v.capacidade_toneladas) || 0), 0);
  const taxaOcupacao = totalVeiculos > 0 ? ((veiculosEmViagem / totalVeiculos) * 100).toFixed(1) : 0;

  const viagensFiltradas = viagens.filter(v => 
    v.origem.toLowerCase().includes(filtro.toLowerCase()) ||
    v.destino.toLowerCase().includes(filtro.toLowerCase())
  );

  const viagensRecentes = [...viagensFiltradas].reverse().slice(0, 5);

  return (
    <div>
      {/* Grid Principal */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Truck size={28} />
          </div>
          <div className="stat-info">
            <h3>{t('frotaTotal')}</h3>
            <div className="value">{totalVeiculos}</div>
            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
              {veiculosDisponiveis} {t('disponiveis')} / {veiculosEmViagem} {t('emRota')}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Users size={28} />
          </div>
          <div className="stat-icon-info">
            <h3>{t('corpoMotoristas')}</h3>
            <div className="value">{totalMotoristas}</div>
            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: '600' }}>
              {motoristasDisponiveis} {t('aptos')} / {motoristasEmViagem} {t('ativos')}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <MapPin size={28} />
          </div>
          <div className="stat-info">
            <h3>{t('operacoesViagem')}</h3>
            <div className="value">{totalViagens}</div>
            <span style={{ fontSize: '12px', color: '#22d3ee', fontWeight: '600' }}>
              {viagensEmAndamento} {t('emAndamento')} / {viagensConcluidas} {t('concluidas')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos Visuais Avançados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Gráfico 1: Distribuição da Frota */}
        <div className="panel-box" style={{ marginBottom: 0 }}>
          <div className="panel-title">
            <PieChart size={20} color="#38bdf8" />
            <span>{t('frotaRegistrada')} - Status Chart</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#4ade80', fontWeight: '600' }}>Disponíveis ({veiculosDisponiveis})</span>
                <span style={{ color: '#94a3b8' }}>{pctVeiculosDisp.toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pctVeiculosDisp}%`, height: '100%', background: '#4ade80', transition: 'width 0.4s' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#f59e0b', fontWeight: '600' }}>Em Rota / Viagem ({veiculosEmViagem})</span>
                <span style={{ color: '#94a3b8' }}>{pctVeiculosRota.toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pctVeiculosRota}%`, height: '100%', background: '#f59e0b', transition: 'width 0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Capacidade Logística */}
        <div className="panel-box" style={{ marginBottom: 0 }}>
          <div className="panel-title">
            <BarChart3 size={20} color="#38bdf8" />
            <span>{t('capacidadeLogistica')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t('capacidadeTotal')}</span>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>{capacidadeTotalTon.toFixed(1)} {t('toneladas')}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t('taxaOcupacao')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <div style={{ flex: 1, height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                  <div style={{ width: `${taxaOcupacao}%`, height: '100%', background: '#38bdf8', transition: 'width 0.4s ease' }}></div>
                </div>
                <span style={{ fontWeight: '700', color: '#38bdf8', fontSize: '14px' }}>{taxaOcupacao}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tabela de Viagens Recentes */}
      <div className="panel-box">
        <div className="panel-title">
          <Activity size={20} color="#38bdf8" />
          <span>{t('ultimasMovimentacoes')}</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('rotaOperacional')}</th>
              <th>{t('idVeiculo')}</th>
              <th>{t('idMotorista')}</th>
              <th>{t('statusAtual')}</th>
            </tr>
          </thead>
          <tbody>
            {viagensRecentes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                  {t('semViagens')}
                </td>
              </tr>
            ) : (
              viagensRecentes.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td style={{ fontWeight: '600' }}>{v.origem} ➔ {v.destino}</td>
                  <td>#{v.veiculo_id}</td>
                  <td>#{v.motorista_id}</td>
                  <td>
                    <span className={`badge ${v.status === 'CONCLUIDA' ? 'badge-concluida' : 'badge-emviagem'}`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
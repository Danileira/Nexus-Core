import { useState, useEffect } from 'react';
import api from '../services/api';
import { Truck, PlusCircle, Trash2, Edit3, Download, X } from 'lucide-react';
import { useIdioma } from '../context/IdiomaContext';

export function Veiculos({ filtro = '' }) {
  const { t } = useIdioma();
  const [veiculos, setVeiculos] = useState([]);
  const [formData, setFormData] = useState({ placa: '', modelo: '', capacidade_toneladas: '' });
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null);

  useEffect(() => { carregarVeiculos(); }, []);

  async function carregarVeiculos() {
    try {
      const res = await api.get('/veiculos');
      setVeiculos(res.data);
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    try {
      if (veiculoEmEdicao) {
        await api.put(`/veiculos/${veiculoEmEdicao.id}`, {
          placa: formData.placa,
          modelo: formData.modelo,
          capacidade_toneladas: parseFloat(formData.capacidade_toneladas)
        });
        setMensagemSucesso('Veículo atualizado com sucesso!');
        setVeiculoEmEdicao(null);
      } else {
        await api.post('/veiculos', {
          placa: formData.placa,
          modelo: formData.modelo,
          capacidade_toneladas: parseFloat(formData.capacidade_toneladas)
        });
        setMensagemSucesso('Veículo cadastrado com sucesso!');
      }
      setFormData({ placa: '', modelo: '', capacidade_toneladas: '' });
      carregarVeiculos();
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err.response?.data?.ERRO || 'Erro ao processar requisição.');
    }
  }

  function iniciarEdicao(v) {
    setVeiculoEmEdicao(v);
    setFormData({ placa: v.placa, modelo: v.modelo, capacidade_toneladas: v.capacidade_toneladas });
  }

  function cancelarEdicao() {
    setVeiculoEmEdicao(null);
    setFormData({ placa: '', modelo: '', capacidade_toneladas: '' });
  }

  async function handleDelete(id) {
    if (window.confirm('Deseja realmente remover este veículo?')) {
      try {
        await api.delete(`/veiculos/${id}`);
        carregarVeiculos();
      } catch (err) { alert(err.response?.data?.ERRO || 'Erro'); }
    }
  }

  function exportarCSV() {
    const cabecalho = 'ID,Placa,Modelo,Capacidade(Ton),Status\n';
    const linhas = veiculos.map(v => `${v.id},"${v.placa}","${v.modelo}",${v.capacidade_toneladas},${v.status}`).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_frota.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const veiculosFiltrados = veiculos.filter(v => {
    const atendeTexto = v.placa.toLowerCase().includes(filtro.toLowerCase()) || v.modelo.toLowerCase().includes(filtro.toLowerCase());
    const atendeStatus = statusFiltro === 'TODOS' || v.status === statusFiltro;
    return atendeTexto && atendeStatus;
  });

  return (
    <div>
      {mensagemSucesso && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
          ✓ {mensagemSucesso}
        </div>
      )}

      <div className="panel-box">
        <div className="panel-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={22} color="#38bdf8" />
            <span>{veiculoEmEdicao ? `${t('editarVeiculo')} #${veiculoEmEdicao.id}` : t('cadastrarVeiculo')}</span>
          </div>
          {veiculoEmEdicao && (
            <button onClick={cancelarEdicao} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <X size={16} /> {t('cancelarEdicao')}
            </button>
          )}
        </div>
        {erro && <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '14px' }}>{erro}</p>}
        
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text"
            placeholder={t('placaPlaceholder')}
            value={formData.placa}
            onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder={t('modeloPlaceholder')}
            value={formData.modelo}
            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="number"
            step="0.1"
            placeholder={t('capacidadePlaceholder')}
            value={formData.capacidade_toneladas}
            onChange={(e) => setFormData({ ...formData, capacidade_toneladas: e.target.value })}
            required
            className="form-input"
          />
          <button type="submit" className="btn-primary">
            {veiculoEmEdicao ? <Edit3 size={18} /> : <PlusCircle size={18} />} 
            {veiculoEmEdicao ? t('salvarAlteracoes') : t('btnCadastrarVeiculo')}
          </button>
        </form>
      </div>

      <div className="panel-box">
        <div className="panel-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>{t('frotaRegistrada')} ({veiculosFiltrados.length})</span>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', background: '#090d16', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {['TODOS', 'DISPONIVEL', 'EM VIAGEM'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFiltro(s)}
                  style={{
                    background: statusFiltro === s ? '#0284c7' : 'transparent',
                    color: statusFiltro === s ? '#ffffff' : '#94a3b8',
                    border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <button onClick={exportarCSV} style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> {t('exportarCsv')}
            </button>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('colPlaca')}</th>
              <th>{t('colModelo')}</th>
              <th>{t('colCapacidade')}</th>
              <th>{t('colStatus')}</th>
              <th style={{ textAlign: 'center' }}>{t('colAcoes')}</th>
            </tr>
          </thead>
          <tbody>
            {veiculosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                  {t('nenhumVeiculo')}
                </td>
              </tr>
            ) : (
              veiculosFiltrados.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td style={{ fontWeight: '700', color: '#38bdf8' }}>{v.placa}</td>
                  <td>{v.modelo}</td>
                  <td>{v.capacidade_toneladas} {t('toneladas')}</td>
                  <td>
                    <span className={`badge ${v.status === 'DISPONIVEL' ? 'badge-disponivel' : 'badge-emviagem'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicao(v)} className="btn-primary" style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="btn-danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
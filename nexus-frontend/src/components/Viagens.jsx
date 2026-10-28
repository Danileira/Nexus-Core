import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { useIdioma } from '../context/IdiomaContext';

export function Viagens({ filtro = '' }) {
  const { t } = useIdioma();
  const [viagens, setViagens] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [formData, setFormData] = useState({ origem: '', destino: '', veiculo_id: '', motorista_id: '' });
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      const [resViagens, resVeiculos, resMotoristas] = await Promise.all([
        api.get('/viagens'),
        api.get('/veiculos'),
        api.get('/motoristas')
      ]);
      setViagens(resViagens.data);
      setVeiculos(resVeiculos.data.filter(v => v.status === 'DISPONIVEL'));
      setMotoristas(resMotoristas.data.filter(m => m.status === 'DISPONIVEL'));
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    try {
      await api.post('/viagens', {
        origem: formData.origem,
        destino: formData.destino,
        veiculo_id: parseInt(formData.veiculo_id),
        motorista_id: parseInt(formData.motorista_id)
      });
      setFormData({ origem: '', destino: '', veiculo_id: '', motorista_id: '' });
      setMensagemSucesso('Viagem iniciada com sucesso!');
      await carregarDados();
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err.response?.data?.ERRO || 'Erro ao registrar viagem.');
    }
  }

  async function handleConcluir(id) {
    try {
      await api.put(`/viagens/${id}`, { status: 'CONCLUIDA' });
      await carregarDados();
    } catch (err) { alert(err.response?.data?.ERRO || 'Erro'); }
  }

  async function handleDelete(id) {
    if (window.confirm('Deseja realmente remover esta viagem?')) {
      try {
        await api.delete(`/viagens/${id}`);
        await carregarDados();
      } catch (err) { alert(err.response?.data?.ERRO || 'Erro'); }
    }
  }

  const viagensFiltradas = viagens.filter(v =>
    v.origem.toLowerCase().includes(filtro.toLowerCase()) ||
    v.destino.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      {mensagemSucesso && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' }}>
          ✓ {mensagemSucesso}
        </div>
      )}

      <div className="panel-box">
        <div className="panel-title">
          <MapPin size={22} color="#38bdf8" />
          <span>{t('lancarViagem')}</span>
        </div>
        {erro && <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '14px' }}>{erro}</p>}
        
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text"
            placeholder={t('origemPlaceholder')}
            value={formData.origem}
            onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder={t('destinoPlaceholder')}
            value={formData.destino}
            onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
            required
            className="form-input"
          />
          <select
            value={formData.veiculo_id}
            onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
            required
            className="form-select"
          >
            <option value="">{t('selecioneVeiculo')}</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>
            ))}
          </select>
          <select
            value={formData.motorista_id}
            onChange={(e) => setFormData({ ...formData, motorista_id: e.target.value })}
            required
            className="form-select"
          >
            <option value="">{t('selecioneMotorista')}</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            <PlusCircle size={18} /> {t('iniciarViagem')}
          </button>
        </form>
      </div>

      <div className="panel-box">
        <div className="panel-title">
          <span>{t('historicoOperacoes')} ({viagensFiltradas.length})</span>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('colRota')}</th>
              <th>{t('colVeiculoId')}</th>
              <th>{t('colMotoristaId')}</th>
              <th>{t('colStatus')}</th>
              <th style={{ textAlign: 'center' }}>{t('colAcoes')}</th>
            </tr>
          </thead>
          <tbody>
            {viagensFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                  {t('semViagensHistorico')}
                </td>
              </tr>
            ) : (
              viagensFiltradas.map((viagem) => (
                <tr key={viagem.id}>
                  <td>#{viagem.id}</td>
                  <td style={{ fontWeight: '600' }}>{viagem.origem} ➔ {viagem.destino}</td>
                  <td>#{viagem.veiculo_id}</td>
                  <td>#{viagem.motorista_id}</td>
                  <td>
                    <span className={`badge ${viagem.status === 'CONCLUIDA' ? 'badge-concluida' : 'badge-emviagem'}`}>
                      {viagem.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {viagem.status !== 'CONCLUIDA' && (
                        <button onClick={() => handleConcluir(viagem.id)} className="btn-success" title="Concluir Viagem">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(viagem.id)} className="btn-danger" title="Remover Viagem">
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
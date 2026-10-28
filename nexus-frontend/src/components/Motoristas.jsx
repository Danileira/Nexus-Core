import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, PlusCircle, Trash2, Edit3, Download, X } from 'lucide-react';
import { useIdioma } from '../context/IdiomaContext';

export function Motoristas({ filtro = '' }) {
  const { t } = useIdioma();
  const [motoristas, setMotoristas] = useState([]);
  const [formData, setFormData] = useState({ nome: '', cnh: '' });
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [motoristaEmEdicao, setMotoristaEmEdicao] = useState(null);

  useEffect(() => { carregarMotoristas(); }, []);

  async function carregarMotoristas() {
    try {
      const res = await api.get('/motoristas');
      setMotoristas(res.data);
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setMensagemSucesso('');
    try {
      if (motoristaEmEdicao) {
        await api.put(`/motoristas/${motoristaEmEdicao.id}`, { nome: formData.nome, cnh: formData.cnh });
        setMensagemSucesso('Motorista atualizado com sucesso!');
        setMotoristaEmEdicao(null);
      } else {
        await api.post('/motoristas', { nome: formData.nome, cnh: formData.cnh });
        setMensagemSucesso('Motorista cadastrado com sucesso!');
      }
      setFormData({ nome: '', cnh: '' });
      carregarMotoristas();
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setErro(err.response?.data?.ERRO || 'Erro ao processar requisição.');
    }
  }

  function iniciarEdicao(m) {
    setMotoristaEmEdicao(m);
    setFormData({ nome: m.nome, cnh: m.cnh });
  }

  function cancelarEdicao() {
    setMotoristaEmEdicao(null);
    setFormData({ nome: '', cnh: '' });
  }

  async function handleDelete(id) {
    if (window.confirm('Deseja realmente remover este motorista?')) {
      try {
        await api.delete(`/motoristas/${id}`);
        carregarMotoristas();
      } catch (err) { alert(err.response?.data?.ERRO || 'Erro'); }
    }
  }

  function exportarCSV() {
    const cabecalho = 'ID,Nome,CNH,Status\n';
    const linhas = motoristas.map(m => `${m.id},"${m.nome}","${m.cnh}",${m.status}`).join('\n');
    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_motoristas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const motoristasFiltrados = motoristas.filter(m => {
    const atendeTexto = m.nome.toLowerCase().includes(filtro.toLowerCase()) || m.cnh.toLowerCase().includes(filtro.toLowerCase());
    const atendeStatus = statusFiltro === 'TODOS' || m.status === statusFiltro;
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
            <Users size={22} color="#38bdf8" />
            <span>{motoristaEmEdicao ? `${t('editarMotorista')} #${motoristaEmEdicao.id}` : t('cadastrarMotorista')}</span>
          </div>
          {motoristaEmEdicao && (
            <button onClick={cancelarEdicao} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <X size={16} /> {t('cancelarEdicao')}
            </button>
          )}
        </div>
        {erro && <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '14px' }}>{erro}</p>}
        
        <form onSubmit={handleSubmit} className="form-row">
          <input
            type="text"
            placeholder={t('nomePlaceholder')}
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder={t('cnhPlaceholder')}
            value={formData.cnh}
            onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
            required
            className="form-input"
          />
          <button type="submit" className="btn-primary">
            {motoristaEmEdicao ? <Edit3 size={18} /> : <PlusCircle size={18} />} 
            {motoristaEmEdicao ? t('salvarAlteracoes') : t('btnCadastrarMotorista')}
          </button>
        </form>
      </div>

      <div className="panel-box">
        <div className="panel-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>{t('motoristasCadastrados')} ({motoristasFiltrados.length})</span>
          
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
              <th>{t('colNome')}</th>
              <th>{t('colCnh')}</th>
              <th>{t('colStatus')}</th>
              <th style={{ textAlign: 'center' }}>{t('colAcoes')}</th>
            </tr>
          </thead>
          <tbody>
            {motoristasFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                  {t('nenhumMotorista')}
                </td>
              </tr>
            ) : (
              motoristasFiltrados.map((m) => (
                <tr key={m.id}>
                  <td>#{m.id}</td>
                  <td style={{ fontWeight: '600' }}>{m.nome}</td>
                  <td>{m.cnh}</td>
                  <td>
                    <span className={`badge ${m.status === 'DISPONIVEL' ? 'badge-disponivel' : 'badge-emviagem'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => iniciarEdicao(m)} className="btn-primary" style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="btn-danger">
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
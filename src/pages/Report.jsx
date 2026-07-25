import { useState } from 'react';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Select from '../components/ui/Select';
import styles from './Report.module.css';

const EMPTY_FORM = {
  tipo: 'delay',
  motorista: '',
  placa: '',
  destino: '',
  data_agendada: '',
  data_realizada: '',
  impacto: '',
  motivo: '',
  descricao: '',
  acao_realizada: '',
};

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function Report() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [ocorrencias, setOcorrencias] = useState(() => {
    return JSON.parse(localStorage.getItem("ocorrencias")) || []
  });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function mostrarFormulario() {
    setShowForm((v) => !v);
  }

  function salvarOcc(e) {
    e.preventDefault();
    if (!form.motorista.trim() || !form.destino.trim()) return;

    setOcorrencias((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev]);

    if (localStorage.getItem('ocorrencias')) {
      const prev = JSON.parse(localStorage.getItem('ocorrencias'));
      localStorage.setItem('ocorrencias', JSON.stringify([{ id: crypto.randomUUID(), ...form }, ...prev]));
    }

    else {
      localStorage.setItem('ocorrencias', JSON.stringify([{ id: crypto.randomUUID(), ...form }]));
    }

    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  function excluirOcc(id) {
    setOcorrencias((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className={`panel ${styles.box}`}>
      <h3>📑 Relatório diário</h3>

      <Button variant="info" onClick={mostrarFormulario}>
        {showForm ? '− Fechar' : '+ Adicionar'}
      </Button>

      {showForm && (
        <form className={styles.form} onSubmit={salvarOcc}>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => updateField('tipo', e.target.value)}>
              <option value="early">Early</option>
              <option value="delay">Delay</option>
            </Select>
          </Field>

          <div className="field-row">
            <Field label="Nome do motorista">
              <Input value={form.motorista} onChange={(e) => updateField('motorista', e.target.value)} required />
            </Field>
            <Field label="Placa do veículo">
              <Input value={form.placa} onChange={(e) => updateField('placa', e.target.value)} />
            </Field>
          </div>

          <Field label="Destino">
            <Input value={form.destino} onChange={(e) => updateField('destino', e.target.value)} required />
          </Field>

          <div className="field-row">
            <Field label="Data/hora agendada">
              <Input
                type="datetime-local"
                value={form.data_agendada}
                onChange={(e) => updateField('data_agendada', e.target.value)}
              />
            </Field>
            <Field label="Data/hora realizada">
              <Input
                type="datetime-local"
                value={form.data_realizada}
                onChange={(e) => updateField('data_realizada', e.target.value)}
              />
            </Field>
          </div>

          <div className="field-row">
            <Field label="Impacto">
              <Input
                placeholder="Ex: 2h30"
                value={form.impacto}
                onChange={(e) => updateField('impacto', e.target.value)}
              />
            </Field>
            <Field label="Motivo">
              <Input value={form.motivo} onChange={(e) => updateField('motivo', e.target.value)} />
            </Field>
          </div>

          <Field label="Descrição">
            <TextArea value={form.descricao} onChange={(e) => updateField('descricao', e.target.value)} />
          </Field>

          <Field label="Ação realizada">
            <TextArea value={form.acao_realizada} onChange={(e) => updateField('acao_realizada', e.target.value)} />
          </Field>

          <div className={styles.formActions}>
            <Button type="submit" variant="success">
              Salvar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {ocorrencias.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📭</span>
            Nenhuma ocorrência registrada hoje
          </div>
        ) : (
          ocorrencias.map((o) => (
            <div
              key={o.id}
              className={`panel ${styles.occCard} ${o.tipo === 'delay' ? styles['occCard--delay'] : ''}`}
            >
              <button className={styles.removeBtn} onClick={() => excluirOcc(o.id)} title="Remover ocorrência">
                ❌
              </button>

              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>👤 {o.motorista}</span>
                <span className={`${styles.statusBadge} ${o.tipo === 'delay' ? styles['statusBadge--delay'] : ''}`}>
                  {o.tipo === 'delay' ? 'Delay' : 'Atraso'}
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div>
                  <span className={styles.infoLabel}>Placa</span>
                  <span className={styles.infoValue}>{o.placa || '—'}</span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Destino</span>
                  <span className={styles.infoValue}>{o.destino}</span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Agendado</span>
                  <span className={styles.infoValue}>{formatDateTime(o.data_agendada)}</span>
                </div>
                <div>
                  <span className={styles.infoLabel}>Realizado</span>
                  <span className={styles.infoValue}>{formatDateTime(o.data_realizada)}</span>
                </div>
              </div>

              {o.impacto && (
                <div className={styles.impactBox}>
                  <span className={styles.infoLabel}>Impacto</span>
                  <span className={styles.impactValue}>{o.impacto}</span>
                </div>
              )}

              <div className={styles.descBlock}>
                {o.motivo && (
                  <>
                    <h4>Motivo</h4>
                    <p>{o.motivo}</p>
                  </>
                )}
                {o.descricao && (
                  <>
                    <h4>Descrição</h4>
                    <p>{o.descricao}</p>
                  </>
                )}
                {o.acao_realizada && (
                  <>
                    <h4>Ação realizada</h4>
                    <p>{o.acao_realizada}</p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

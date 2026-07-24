import { useState } from 'react';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { parseTurnPassData } from '../utils/parseTurnPass';
import { periodoDoDia } from '../utils/statusColeta';
import styles from './TurnPass.module.css';

const EMPTY_OCC_FORM = { lh: '', rota: '', motorista: '', occ: '' };

const SECTIONS = [
  { key: 'atrasoOrigem', title: '🚨 Atrasos origem' },
  { key: 'atrasoDestino', title: '🚨 Atrasos destino' },
  { key: 'canceladas', title: '🚫 Canceladas' },
  { key: 'noShow', title: '🚷 No show' },
  { key: 'spots', title: "🚛 Extra spot's" },
];

function TripRow({ lh, motorista, rota, occ }) {
  return (
    <div className={styles.tripRow}>
      <div className={styles.lhTag}>🔻 {lh}</div>
      <div>
        <strong>🛣️ Rota:</strong> {rota}
      </div>
      <div>
        <strong>🚚 Motorista:</strong> {motorista}
      </div>
      {occ && (
        <div>
          <strong>⚠️ Ocorrência:</strong> {occ}
        </div>
      )}
    </div>
  );
}

function OccForm({ title, formState, setFormState, onSave, onCancel }) {
  return (
    <div className={styles.inlineForm}>
      <h4 style={{ fontSize: 13, color: 'var(--fog)' }}>{title}</h4>
      <div className="field-row">
        <Field label="LH">
          <Input value={formState.lh} onChange={(e) => setFormState({ ...formState, lh: e.target.value })} />
        </Field>
        <Field label="Rota">
          <Input value={formState.rota} onChange={(e) => setFormState({ ...formState, rota: e.target.value })} />
        </Field>
      </div>
      <Field label="Motorista">
        <Input
          value={formState.motorista}
          onChange={(e) => setFormState({ ...formState, motorista: e.target.value })}
        />
      </Field>
      <Field label="Situação">
        <TextArea
          placeholder="Digite a situação"
          value={formState.occ}
          onChange={(e) => setFormState({ ...formState, occ: e.target.value })}
        />
      </Field>
      <div className={styles.inlineFormActions}>
        <Button variant="success" size="sm" onClick={onSave}>
          Adicionar
        </Button>
        <Button variant="danger" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export default function TurnPass() {
  const [planilhaInput, setPlanilhaInput] = useState('');
  const [dadosDia, setDadosDia] = useState({
    atrasoDestino: [],
    atrasoOrigem: [],
    canceladas: [],
    noShow: [],
    spots: [],
  });

  const [showPostoForm, setShowPostoForm] = useState(false);
  const [showAtencaoForm, setShowAtencaoForm] = useState(false);
  const [postoForm, setPostoForm] = useState(EMPTY_OCC_FORM);
  const [atencaoForm, setAtencaoForm] = useState(EMPTY_OCC_FORM);
  const [postoFiscalLhs, setPostoFiscalLhs] = useState([]);
  const [atencaoLhs, setAtencaoLhs] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [imported, setImported] = useState(false);

  function importarDados() {
    if (!planilhaInput.trim()) {
      setFeedback({ type: 'error', text: 'Cole os dados da planilha primeiro!' });
      return;
    }
    setDadosDia(parseTurnPassData(planilhaInput));
    setImported(true);
    setFeedback({ type: 'success', text: '✅ Dados importados!' });
  }

  function addOcc(form) {
    if (form === 'postoFiscal') {
      if (!postoForm.lh.trim()) return;
      setPostoFiscalLhs((prev) => [...prev, { id: crypto.randomUUID(), ...postoForm }]);
      setPostoForm(EMPTY_OCC_FORM);
      setShowPostoForm(false);
    } else {
      if (!atencaoForm.lh.trim()) return;
      setAtencaoLhs((prev) => [...prev, { id: crypto.randomUUID(), ...atencaoForm }]);
      setAtencaoForm(EMPTY_OCC_FORM);
      setShowAtencaoForm(false);
    }
  }

  function excluirOcc(id, form) {
    if (form === 'postoFiscal') setPostoFiscalLhs((prev) => prev.filter((o) => o.id !== id));
    else setAtencaoLhs((prev) => prev.filter((o) => o.id !== id));
  }

  async function copiarPassagem() {
    const nenhum = '_Até o momento, nenhum_';
    const day = new Date().getUTCDate();
    const month = new Date().getUTCMonth();
    const period = periodoDoDia();

    const renderMsg = (e) =>
      e.occ != null && e.occ !== ''
        ? `🔸 *${e.rota}*\n  • *Viagem:* ${e.lh}\n  • *Motorista:* ${e.motorista}\n  ⚠ ${e.occ}`
        : `🔸 *${e.rota}*\n  • *Viagem:* ${e.lh}\n  • *Motorista:* ${e.motorista}`;

    const block = (arr) => (arr.length === 0 ? nenhum : arr.map(renderMsg).join('\n'));

    const message = `
*${period} a todos!*

📋 *Passagem de Turno | ${day}/${month}*

━━━━━━━━━━━━━━━━━━━━━━
🚨 *ATRASOS - ORIGEM*
${block(dadosDia.atrasoOrigem)}

━━━━━━━━━━━━━━━━━━━━━━
🚨 *ATRASOS - DESTINO*
${block(dadosDia.atrasoDestino)}

━━━━━━━━━━━━━━━━━━━━━━
🚫 *CANCELADAS*
${block(dadosDia.canceladas)}

━━━━━━━━━━━━━━━━━━━━━━
🚛 *EXTRA SPOT*
${block(dadosDia.spots)}

━━━━━━━━━━━━━━━━━━━━━━
🚷 *NO SHOW*
${block(dadosDia.noShow)}

━━━━━━━━━━━━━━━━━━━━━━
🛃 *RETIDOS NO POSTO FISCAL*
${block(postoFiscalLhs)}

━━━━━━━━━━━━━━━━━━━━━━
⚠️ *ATENÇÃO*
${block(atencaoLhs)}
`;

    try {
      await navigator.clipboard.writeText(message.replaceAll('`', ''));
      setFeedback({ type: 'success', text: '✅ Texto copiado! Cole no WhatsApp.' });
    } catch {
      setFeedback({ type: 'error', text: '❌ Erro ao copiar.' });
    }
  }

  return (
    <div>
      <div className={`panel ${styles.box}`}>
        <h3>📑 1. Dados da planilha</h3>
        <TextArea
          large
          placeholder="Cole aqui os dados da planilha..."
          value={planilhaInput}
          onChange={(e) => setPlanilhaInput(e.target.value)}
        />

        <h3>📑 2. Posto fiscal</h3>
        {!showPostoForm && (
          <Button variant="info" size="sm" onClick={() => setShowPostoForm(true)}>
            + Adicionar
          </Button>
        )}
        {showPostoForm && (
          <OccForm
            title="Nova ocorrência — posto fiscal"
            formState={postoForm}
            setFormState={setPostoForm}
            onSave={() => addOcc('postoFiscal')}
            onCancel={() => setShowPostoForm(false)}
          />
        )}
        {postoFiscalLhs.length > 0 && (
          <div className={styles.occList}>
            {postoFiscalLhs.map((o) => (
              <div key={o.id} className={`panel ${styles.occCard}`}>
                <div className={styles.occHeader}>
                  <span className={styles.occLh}>🚚 LH {o.lh}</span>
                  <button className={styles.removeBtn} onClick={() => excluirOcc(o.id, 'postoFiscal')}>
                    ❌
                  </button>
                </div>
                <div className={styles.occDriver}>👤 {o.motorista}</div>
                <div className={styles.occText}>📑 {o.occ}</div>
              </div>
            ))}
          </div>
        )}

        <h3>📑 3. Atenção</h3>
        {!showAtencaoForm && (
          <Button variant="info" size="sm" onClick={() => setShowAtencaoForm(true)}>
            + Adicionar
          </Button>
        )}
        {showAtencaoForm && (
          <OccForm
            title="Nova ocorrência — atenção"
            formState={atencaoForm}
            setFormState={setAtencaoForm}
            onSave={() => addOcc('atencao')}
            onCancel={() => setShowAtencaoForm(false)}
          />
        )}
        {atencaoLhs.length > 0 && (
          <div className={styles.occList}>
            {atencaoLhs.map((o) => (
              <div key={o.id} className={`panel ${styles.occCard}`}>
                <div className={styles.occHeader}>
                  <span className={styles.occLh}>🚚 LH {o.lh}</span>
                  <button className={styles.removeBtn} onClick={() => excluirOcc(o.id, 'atencao')}>
                    ❌
                  </button>
                </div>
                <div className={styles.occDriver}>👤 {o.motorista}</div>
                <div className={styles.occText}>📑 {o.occ}</div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="success" onClick={importarDados}>
            ✅ Importar
          </Button>
          <Button variant="primary" onClick={copiarPassagem}>
            📑 Copiar
          </Button>
        </div>

        {feedback && (
          <p style={{ marginTop: 12, fontSize: 13, color: feedback.type === 'error' ? 'var(--danger)' : 'var(--ok)' }}>
            {feedback.text}
          </p>
        )}
      </div>

      {imported && (
        <div className={`panel ${styles.summaryPanel}`}>
          {SECTIONS.map((s) => (
            <div className={styles.section} key={s.key}>
              <div className={styles.sectionTitle}>{s.title}</div>
              {dadosDia[s.key].length === 0 ? (
                <div className={styles.noOcc}>No momento, nenhum.</div>
              ) : (
                dadosDia[s.key].map((e, idx) => <TripRow key={`${s.key}-${idx}`} {...e} />)
              )}
            </div>
          ))}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>🛃 Posto fiscal</div>
            {postoFiscalLhs.length === 0 ? (
              <div className={styles.noOcc}>No momento, nenhum.</div>
            ) : (
              postoFiscalLhs.map((e) => <TripRow key={e.id} {...e} />)
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>⚠️ Atenção</div>
            {atencaoLhs.length === 0 ? (
              <div className={styles.noOcc}>No momento, nenhum.</div>
            ) : (
              atencaoLhs.map((e) => <TripRow key={e.id} {...e} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

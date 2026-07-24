import { useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import { parseViagens } from '../utils/parseViagens';
import { calcularStatusColeta, periodoDoDia } from '../utils/statusColeta';
import { useClock } from '../utils/useClock';
import styles from './CardGenerator.module.css';

const TIPO_CLASS = {
  atraso: styles['tripCard--atraso'],
  cancelada: styles['tripCard--cancelada'],
  atencao: styles['tripCard--atencao'],
  normal: styles['tripCard--normal'],
};

function montarCardTexto(v, statusColeta) {
  let texto = `🔻 ${v.id}\n`;
  texto += `   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `   🛣️ ROTA: ${v.origem} → ${v.destino}\n`;
  texto += `   👤 MOTORISTA: ${v.motorista}\n`;
  texto += `   🚛 PLACA: ${v.cavalo}\n`;
  texto += `   📅 COLETA: ${v.dataColeta}\n`;
  if (statusColeta) {
    texto += `   ${statusColeta}\n`;
  }
  texto += `   🎯 CHEGADA NO CLIENTE: ${v.etaDestino}\n`;
  texto += `\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `\n    🚨 *AVISO* 🚨\n`;
  texto += `\n    Caso a documentação de viagem demore *MAIS DE 40 MINUTOS* para ser enviada:`;
  texto += `\n    ⚠ *Tire um PRINT da conversa e nos ENVIE IMEDIATAMENTE*`;
  return texto;
}

function montarSaudacao(v) {
  const period = periodoDoDia();
  const firstNameMot = (v.motorista.split(' ')[0] || '').toLowerCase();
  const hourColeta = v.dataColeta.split(' ')[1] || v.dataColeta;
  return { period, firstNameMot, hourColeta };
}

export default function CardGenerator() {
  const [planilhaInput, setPlanilhaInput] = useState('');
  const [viagens, setViagens] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Keeps "faltam X min para a coleta" readouts live, mirroring the
  // original setInterval(atualizarDataHora, 60000) + renderizarCards().
  useClock(60000);

  function importarDados() {
    if (!planilhaInput.trim()) {
      setFeedback({ type: 'error', text: 'Cole os dados da planilha primeiro!' });
      return;
    }

    const parsed = parseViagens(planilhaInput);
    setViagens(parsed);

    if (parsed.length > 0) {
      setFeedback({ type: 'success', text: `✅ ${parsed.length} viagens carregadas!` });
    } else {
      setFeedback({ type: 'error', text: '❌ Nenhuma viagem encontrada. Verifique o formato dos dados.' });
    }
  }

  function limparTudo() {
    setViagens([]);
    setPlanilhaInput('');
    setFeedback({ type: 'success', text: '🗑️ Dados limpos!' });
  }

  const resumo = useMemo(
    () => ({
      total: viagens.length,
      atrasos: viagens.filter((v) => v.tipo === 'atraso').length,
      canceladas: viagens.filter((v) => v.tipo === 'cancelada').length,
      atencao: viagens.filter((v) => v.tipo === 'atencao').length,
      normais: viagens.filter((v) => v.tipo === 'normal').length,
    }),
    [viagens]
  );

  async function copiarCard(saudacao, cardTexto) {
    const texto = `${saudacao}\n\n${cardTexto}`;
    try {
      await navigator.clipboard.writeText(texto);
      setFeedback({ type: 'success', text: '✅ Card copiado! Cole no WhatsApp.' });
    } catch {
      setFeedback({ type: 'error', text: '❌ Erro ao copiar.' });
    }
  }

  return (
    <div>
      <div className={`panel ${styles.importBox}`}>
        <h3>📂 1. Cole a planilha aqui</h3>
        <TextArea
          large
          placeholder="Cole aqui os dados da planilha..."
          value={planilhaInput}
          onChange={(e) => setPlanilhaInput(e.target.value)}
        />
        <div className={styles.actions}>
          <Button variant="success" onClick={importarDados}>
            ✅ Importar
          </Button>
          <Button variant="ghost" onClick={limparTudo}>
            🗑️ Limpar
          </Button>
        </div>
        {feedback && (
          <p style={{ marginTop: 12, fontSize: 13, color: feedback.type === 'error' ? 'var(--danger)' : 'var(--ok)' }}>
            {feedback.text}
          </p>
        )}
      </div>

      {viagens.length > 0 && (
        <div className={`panel ${styles.summary}`}>
          <h3>📊 Resumo da operação</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{resumo.total}</div>
              <div className={styles.summaryLabel}>TOTAL</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue} style={{ color: 'var(--danger)' }}>{resumo.atrasos}</div>
              <div className={styles.summaryLabel}>⚠️ ATRASOS</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue} style={{ color: 'var(--danger)' }}>{resumo.canceladas}</div>
              <div className={styles.summaryLabel}>❌ CANCELADAS</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue} style={{ color: 'var(--warn)' }}>{resumo.atencao}</div>
              <div className={styles.summaryLabel}>⏳ ATENÇÃO</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue} style={{ color: 'var(--ok)' }}>{resumo.normais}</div>
              <div className={styles.summaryLabel}>✅ OK</div>
            </div>
          </div>
        </div>
      )}

      {viagens.length === 0 ? (
        <div className="panel empty-state">
          <span className="empty-state__icon">📭</span>
          Nenhuma viagem carregada
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {viagens.map((v) => {
            const statusColeta = calcularStatusColeta(v.dataColetaRaw || v.dataColeta, v.status);
            const cardTexto = montarCardTexto(v, statusColeta);
            const { period, firstNameMot, hourColeta } = montarSaudacao(v);
            const saudacao = `${period} ${firstNameMot}, tudo bem? Queria saber se esta tudo nos conformes pra sua coleta de hoje às ${hourColeta}?`;

            return (
              <div key={v.id} className={`panel ${styles.tripCard} ${TIPO_CLASS[v.tipo] || ''}`}>
                <p className={styles.greeting}>
                  {period} <span className={styles.name}>{firstNameMot}</span>, tudo bem? Queria saber se esta tudo
                  nos conformes pra sua coleta de hoje às {hourColeta}?
                </p>
                <pre className={styles.cardText}>{cardTexto}</pre>
                <div className={styles.actions}>
                  <Button size="sm" variant="ghost" onClick={() => copiarCard(saudacao, cardTexto)}>
                    📋 Copiar card
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

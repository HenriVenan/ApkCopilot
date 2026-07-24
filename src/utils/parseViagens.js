/**
 * Ported from cardBody.js `importarDados`, split out as a pure parser
 * that returns the array of trips instead of touching the DOM.
 */
export function parseViagens(texto) {
  const linhas = texto.split(/\r?\n/);
  const viagens = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const colunas = linha.split(/\t/);

    if (colunas[0] === 'PERFIL' || colunas[0].toUpperCase() === 'PERFIL') continue;
    if (colunas.length < 8) continue;

    const lhTrip = colunas[2]?.trim() || '';
    const rota = colunas[1]?.trim() || '';
    const dataColeta = colunas[3]?.trim() || '';
    const cptMeta = colunas[4]?.trim() || '';
    const etaDestino = colunas[5]?.trim() || '';
    const motorista = colunas[10]?.trim() || '';
    const cavalo = colunas[11]?.trim() || '';
    const carreta = colunas[12]?.trim() || '';
    const status = colunas[13]?.trim() || 'PENDENTE';
    const observacao = colunas[15]?.trim() || colunas[13]?.trim() || '';

    if (!lhTrip) continue;

    let origem = '';
    let destino = '';
    if (rota.includes('|')) {
      const partes = rota.split('|');
      origem = partes[0].trim();
      destino = partes[1].trim();
    } else {
      origem = rota;
      destino = 'Destino não informado';
    }

    let dataFormatada = dataColeta;
    if (dataFormatada && dataFormatada.includes(' ')) {
      const partes = dataFormatada.split(' ');
      dataFormatada = `${partes[0]} ${partes[1]?.substring(0, 5) || ''}`;
    }
    let etaFormatado = etaDestino;
    if (etaFormatado && etaFormatado.includes(' ')) {
      const partes = etaFormatado.split(' ');
      etaFormatado = `${partes[0]} ${partes[1]?.substring(0, 5) || ''}`;
    }

    let tipo = 'normal';
    let motivo = '';

    if (status === 'CANCELADA') {
      tipo = 'cancelada';
      motivo = observacao || 'Cancelado';
    } else if (status === 'FINALIZADO' && observacao && observacao !== 'ONTIME') {
      tipo = 'atraso';
      motivo = observacao;
    } else if (
      observacao &&
      (observacao.toLowerCase().includes('atraso') || observacao.toLowerCase().includes('delay'))
    ) {
      tipo = 'atraso';
      motivo = observacao;
    } else if (observacao && observacao.toLowerCase().includes('postergado')) {
      tipo = 'atraso';
      motivo = observacao;
    } else if (status === 'AG. CARREGAMENTO' || status === 'AG. DESCARREGAMENTO') {
      tipo = 'atencao';
      motivo = `Aguardando ${status === 'AG. CARREGAMENTO' ? 'carregamento' : 'descarregamento'}`;
    } else if (status === 'EM VIAGEM') {
      tipo = 'normal';
    } else if (status === 'FINALIZADO') {
      tipo = 'normal';
    }

    viagens.push({
      id: lhTrip,
      origem,
      destino,
      rotaCompleta: rota,
      dataColeta: dataFormatada,
      dataColetaRaw: dataColeta,
      cptMeta,
      etaDestino: etaFormatado,
      motorista: motorista.substring(0, 35),
      cavalo,
      carreta,
      status,
      tipo,
      motivo,
      observacao,
    });
  }

  const ordem = { atraso: 1, cancelada: 2, atencao: 3, normal: 4 };
  viagens.sort((a, b) => (ordem[a.tipo] || 5) - (ordem[b.tipo] || 5));

  return viagens;
}

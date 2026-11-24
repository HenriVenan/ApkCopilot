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

    let id = ""
    let rota = ""
    let dataColeta = ""
    let cptMeta = ""
    let etaDestino = ""
    let motorista = ""
    let cavalo = ""
    let carreta = ""
    let status = ""
    let observacao = ""
    let origem = ""
    let destino = ""

    console.log(colunas[5].includes(":"))

    if(colunas[5].includes(":")){
        id = colunas[2]?.trim() || '';
        dataColeta = colunas[3]?.trim() || '';
        cptMeta = colunas[4]?.trim() || '';
        etaDestino = colunas[5]?.trim() || '';
        motorista = colunas[11]?.trim() || '';
        cavalo = colunas[12]?.trim() || '';
        carreta = colunas[13]?.trim() || '';
        status = colunas[14]?.trim() || 'PENDENTE';
        observacao = colunas[15]?.trim() || colunas[13]?.trim() || '';
        rota = colunas[1]?.trim() || '';

        if (rota.includes('|')) {
            const partes = rota.split('|');
            origem = partes[0].trim();
            destino = partes[1].trim();
          } else {
            origem = rota;
            destino = 'Destino não informado';
        }
    }

    else {
        id = colunas[6]?.trim() || '';
        dataColeta = colunas[7]?.trim() || '';
        cptMeta = colunas[8]?.trim() || '';
        etaDestino = colunas[8]?.trim() || '';
        motorista = colunas[16]?.trim() || '';
        cavalo = colunas[17]?.trim() || '';
        carreta = colunas[18]?.trim() || '';
        status = colunas[20]?.trim() || 'PENDENTE';
        observacao = colunas[25]?.trim() || '';
        rota = colunas[1]?.trim() || '';
        origem = colunas[4]?.trim() || '';
        destino = colunas[5]?.trim() || '';
    }

    if (!id) continue;
    

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
      id: id,
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

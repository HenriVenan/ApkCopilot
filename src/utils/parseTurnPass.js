/**
 * Ported from turnPass.js `importarDados`, split out as a pure parser.
 * Returns the same shape as the original `dadosDia` object.
 */
export function parseTurnPassData(texto) {
  const linhas = texto.split(/\r?\n/);

  const dadosDia = {
    atrasoDestino: [],
    atrasoOrigem: [],
    canceladas: [],
    noShow: [],
    spots: [],
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const colunas = linha.split(/\t/);

    if (colunas[0] === 'PERFIL' || colunas[0].toUpperCase() === 'PERFIL') continue;
    if (colunas.length < 8) continue;

    const lhTrip = colunas[2]?.trim() || '';
    const rota = colunas[1]?.trim() || '';
    const motorista = colunas[10]?.trim() || '';
    const etaOrigemStatus = colunas[13]?.trim() || 'PENDENTE';
    const etaDestinoStatus = colunas[15]?.trim() || 'PENDENTE';

    if (!lhTrip) continue;

    const entry = { lh: lhTrip, rota, motorista };

    if (etaOrigemStatus === 'DELAY') dadosDia.atrasoOrigem.push(entry);
    if (etaDestinoStatus === 'DELAY') dadosDia.atrasoDestino.push(entry);
    if (etaOrigemStatus === 'CANCELADA') dadosDia.canceladas.push(entry);
    if (etaOrigemStatus === 'NO SHOW') dadosDia.noShow.push(entry);

    const lhString = lhTrip.split('');
    if (lhString[2] === '1') dadosDia.spots.push(entry);
  }

  return dadosDia;
}

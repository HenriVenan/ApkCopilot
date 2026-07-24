/**
 * Ported 1:1 from the original cardBody.js `calcularStatusColeta`.
 * Pure function — no DOM, safe to call from render.
 */
export function calcularStatusColeta(dataColetaStr, status) {
  if (status === 'EM VIAGEM') {
    return '🚛 VEÍCULO JÁ EM VIAGEM';
  }
  if (status === 'FINALIZADO') {
    return '✅ VIAGEM FINALIZADA';
  }
  if (status === 'CANCELADA') {
    return '';
  }

  if (!dataColetaStr || dataColetaStr === '-') return '';

  try {
    const partes = dataColetaStr.split(' ');
    const dataParte = partes[0];
    const horaParte = partes[1] || '00:00';

    const dataArr = dataParte.split('/');
    let dia, mes, ano;
    if (dataArr[0].length === 4) {
      ano = parseInt(dataArr[0]);
      mes = parseInt(dataArr[1]) - 1;
      dia = parseInt(dataArr[2]);
    } else {
      dia = parseInt(dataArr[0]);
      mes = parseInt(dataArr[1]) - 1;
      ano = parseInt(dataArr[2]);
    }

    const horaArr = horaParte.split(':');
    const horas = parseInt(horaArr[0]);
    const minutos = parseInt(horaArr[1] || 0);

    const dataColeta = new Date(ano, mes, dia, horas, minutos);
    const agora = new Date();

    const diffMs = dataColeta - agora;

    if (diffMs <= 0) {
      const atrasoMs = agora - dataColeta;
      const atrasoHoras = Math.floor(atrasoMs / (1000 * 60 * 60));
      const atrasoMinutos = Math.floor((atrasoMs % (1000 * 60 * 60)) / (1000 * 60));

      if (atrasoHoras >= 24) {
        const atrasoDias = Math.floor(atrasoHoras / 24);
        return `🔴 COLETA ATRASADA HÁ ${atrasoDias} DIAS`;
      } else if (atrasoHoras >= 1) {
        return `🔴 COLETA ATRASADA HÁ ${atrasoHoras} HORAS`;
      } else {
        return `🔴 COLETA ATRASADA HÁ ${atrasoMinutos} MINUTOS`;
      }
    }

    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHoras >= 24) {
      const diffDias = Math.floor(diffHoras / 24);
      return `⏰ FALTAM ${diffDias} DIAS PARA A COLETA`;
    } else if (diffHoras >= 1) {
      return `⏰ FALTAM ${diffHoras} HORAS E ${diffMinutos} MIN PARA A COLETA`;
    } else {
      return `⏰ FALTAM ${diffMinutos} MINUTOS PARA A COLETA`;
    }
  } catch (e) {
    return '';
  }
}

/** "Bom dia" / "Boa tarde" / "Boa noite" — ported from the original inline logic. */
export function periodoDoDia(hour = new Date().getHours()) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function calcularDebitoCredito(horarioReal, horarioPrevistoStr, tipo) {
    const [horasPrev, minsPrev] = horarioPrevistoStr.split(':').map(Number);
    const previsto = new Date(horarioReal);
    previsto.setHours(horasPrev, minsPrev, 0, 0);

    const diffMinutos = Math.round((horarioReal - previsto) / (1000 * 60));
    
    let minutosDebito = 0;
    let minutosCredito = 0;

    // Tolerância / Grace period de 15 minutos
    if (tipo === 'ENTRADA') {
        if (diffMinutos > 15) {
            minutosDebito = diffMinutos;
        } else if (diffMinutos < -15) {
            minutosCredito = Math.abs(diffMinutos);
        }
    } else if (tipo === 'SAIDA') {
        if (diffMinutos < -15) {
            minutosDebito = Math.abs(diffMinutos);
        } else if (diffMinutos > 15) {
            minutosCredito = diffMinutos;
        }
    }

    return { minutosDebito, minutosCredito };
}
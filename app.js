import { supabase } from './supabase.js';
import { calcularDebitoCredito } from './calc.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const cameraStatus = document.getElementById('camera-status');

let cameraAtiva = false;

// Inicializa a câmera ao carregar a página
async function iniciarCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (cameraStatus) {
            cameraStatus.textContent = '❌ Câmera não suportada neste navegador.';
            cameraStatus.style.color = '#dc2626';
        }
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        cameraAtiva = true;
        if (cameraStatus) {
            cameraStatus.textContent = '🟢 Câmera ativa e pronta';
            cameraStatus.style.color = '#16a34a';
        }
    } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        cameraAtiva = false;
        if (cameraStatus) {
            cameraStatus.textContent = '❌ Não foi possível acessar a câmera. Verifique as permissões.';
            cameraStatus.style.color = '#dc2626';
        }
    }
}

iniciarCamera();

// Função para capturar o frame do vídeo em formato Base64
function capturarFoto() {
    if (!cameraAtiva) {
        return null;
    }
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
}

document.getElementById('form-ponto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const matricula = document.getElementById('matricula').value.trim();
    const tipo = e.submitter.value;

    // Captura e valida a foto da webcam
    const fotoBase64 = capturarFoto();
    if (!fotoBase64) {
        alert('A foto do rosto é obrigatória para registrar o ponto. Ative a câmera e conceda a permissão necessária.');
        return;
    }

    // Busca funcionário no Supabase
    const { data: funcionario, error: funcError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('matricula', matricula)
        .maybeSingle();

    if (funcError || !funcionario) {
        alert('Matrícula não encontrada no sistema!');
        return;
    }

    const agora = new Date();

    // Registra o ponto no banco
    const { data: ponto, error: pontoError } = await supabase
        .from('registros_ponto')
        .insert([
            {
                funcionario_id: funcionario.id,
                tipo_registro: tipo,
                data_hora: agora.toISOString()
            }
        ])
        .select()
        .single();

    if (pontoError) {
        alert('Erro ao registrar o ponto. Tente novamente.');
        return;
    }

    // Atualiza os dados na tela para exibição/impressão
    document.getElementById('comp-nome').textContent = funcionario.nome_completo;
    document.getElementById('comp-matricula').textContent = funcionario.matricula;
    document.getElementById('comp-datahora').textContent = agora.toLocaleString('pt-BR');
    document.getElementById('comp-tipo').textContent = tipo;
    document.getElementById('comp-foto').src = fotoBase64;

    // Limpa QR Code anterior e gera um novo com hash simples de verificação
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';

    const hashVerificacao = btoa(`${ponto.id || 'N/A'}-${funcionario.matricula}-${agora.getTime()}`).substring(0, 16);

    const dadosQRCode = JSON.stringify({
        id: ponto.id,
        matricula: funcionario.matricula,
        dataHora: agora.toISOString(),
        tipo: tipo,
        hash: hashVerificacao
    });

    new QRCode(qrcodeContainer, {
        text: dadosQRCode,
        width: 128,
        height: 128,
        correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById('comprovante').style.display = 'block';

    // Dispara a janela de impressão
    setTimeout(() => {
        window.print();
    }, 500);
});

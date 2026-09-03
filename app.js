import { supabase } from './supabase.js';
import { calcularDebitoCredito } from './calc.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

// Inicializa a câmera ao carregar a página
async function iniciarCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Erro ao acessar a câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
}

iniciarCamera();

// Função para capturar o frame do vídeo em formato Base64
function capturarFoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
}

document.getElementById('form-ponto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const matricula = document.getElementById('matricula').value.trim();
    const tipo = e.submitter.value;

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

    // Captura a foto da webcam
    const fotoBase64 = capturarFoto();
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

    // Limpa QR Code anterior e gera um novo
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';
    
    const dadosQRCode = JSON.stringify({
        id: ponto.id,
        matricula: funcionario.matricula,
        dataHora: agora.toISOString(),
        tipo: tipo
    });

    new QRCode(qrcodeContainer, {
        text: dadosQRCode,
        width: 128,
        height: 128
    });

    document.getElementById('comprovante').style.display = 'block';
    
    // Dispara a janela de impressão
    setTimeout(() => {
        window.print();
    }, 500);
});
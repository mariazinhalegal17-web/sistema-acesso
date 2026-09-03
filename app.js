import { supabase } from './supabase.js';
import { calcularDebitoCredito } from './calc.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

// Inicializa a câmera se existir, sem travar o código se falhar
async function iniciarCamera() {
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (video) video.srcObject = stream;
        }
    } catch (err) {
        console.warn("Câmera não detectada ou permissão negada. O sistema continuará normalmente.");
    }
}

iniciarCamera();

// Captura a foto da webcam ou gera uma imagem neutra se não houver câmera
function capturarFotoOuPlaceholder() {
    try {
        if (video && video.videoWidth > 0 && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg');
        }
    } catch (e) {
        console.warn("Erro ao processar imagem da webcam:", e);
    }
    return "https://via.placeholder.com/150?text=Sem+Foto";
}

document.getElementById('form-ponto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const matriculaInput = document.getElementById('matricula');
    const matricula = matriculaInput ? matriculaInput.value.trim() : '';
    const tipo = e.submitter ? e.submitter.value : 'ENTRADA';

    // 1. Busca o funcionário no Supabase
    const { data: funcionario, error: funcError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('matricula', matricula)
        .maybeSingle();

    if (funcError || !funcionario) {
        alert('Matrícula não encontrada no sistema!');
        return;
    }

    // 2. Processa a foto e obtém a hora atual
    const foto = capturarFotoOuPlaceholder();
    const agora = new Date();

    // 3. Insere o registro de ponto no banco
    const { data: ponto, error: pontoError } = await supabase
        .from('registros_ponto')
        .insert([{
            funcionario_id: funcionario.id,
            tipo_registro: tipo,
            data_hora: agora.toISOString()
        }])
        .select()
        .maybeSingle();

    if (pontoError) {
        alert('Erro ao registrar o ponto no banco de dados.');
        return;
    }

    // 4. Preenche os dados do comprovante na tela
    document.getElementById('comp-nome').textContent = funcionario.nome_completo;
    document.getElementById('comp-matricula').textContent = funcionario.matricula;
    document.getElementById('comp-datahora').textContent = agora.toLocaleString('pt-BR');
    document.getElementById('comp-tipo').textContent = tipo;
    
    const imgComp = document.getElementById('comp-foto');
    if (imgComp) imgComp.src = foto;

    // 5. Gera o QR Code com segurança contra falhas de carregamento
    const qrcodeContainer = document.getElementById('qrcode');
    if (qrcodeContainer) {
        qrcodeContainer.innerHTML = '';
        const dadosQR = JSON.stringify({
            id: ponto ? ponto.id : 'N/A',
            matricula: funcionario.matricula,
            dataHora: agora.toISOString(),
            tipo: tipo
        });

        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeContainer, {
                text: dadosQR,
                width: 128,
                height: 128
            });
        } else {
            qrcodeContainer.innerText = dadosQR;
        }
    }

    // 6. Exibe o comprovante e chama a impressão
    const comprovanteArea = document.getElementById('comprovante');
    if (comprovanteArea) {
        comprovanteArea.style.display = 'block';
    }

    setTimeout(() => {
        window.print();
    }, 400);
});
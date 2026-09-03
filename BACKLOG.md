# BACKLOG E ANÁLISE DE FUNCIONALIDADES - REGISTRO DE PONTO

Este documento traz a análise do estado atual do sistema de Registro de Ponto Eletrônico comparado com as especificações contidas no `SPECS.MD`, além do backlog de tarefas detalhado para o aprimoramento do registro com foto da câmera e emissão de comprovante com QR Code.

---

## 1. Análise de Funcionalidades Já Implementadas

| Funcionalidade / Requisito (SPECS.MD) | Status Atual | Detalhes da Implementação Atual |
| :--- | :--- | :--- |
| **Interface Corporativa & UI Base** | **Implementado** | Interface responsiva utilizando Pico.css e `custom.css` com formulário centralizado em `index.html`. |
| **Integração Backend (Supabase)** | **Implementado** | Módulo `supabase.js` configurado com cliente Supabase JS (ESM). Consulta em `funcionarios` com `.maybeSingle()` e gravação em `registros_ponto`. |
| **Cálculo de Banco de Horas / Tolerância** | **Implementado** | Módulo `calc.js` exportando `calcularDebitoCredito()` com tolerância de 15 minutos para entradas e saídas. |
| **Captura de Foto via Webcam** | **Parcialmente Implementado** | Câmera inicializada em `<video>` no `app.js` e captura realizada via `<canvas>`. Necessita de melhor tratamento de erros de permissão e validação do fluxo do usuário. |
| **Geração de QR Code e Ticket de Ponto** | **Parcialmente Implementado** | QR Code gerado no comprovante com a biblioteca `qrcode.js`. Ticket exibido na tela com opção de impressão por `window.print()`. Necessita padronização de dados e ajustes no CSS de impressão. |

---

## 2. Backlog de Tarefas (Ponto com Foto e QR Code)

### Épico 1: Captura de Foto e Resoluções da Câmera
- **US01 - Feedback Visual do Status da Câmera**
  - **Descrição**: Como funcionário, quero visualizar o status da minha câmera (Carregando, Ativa, Erro/Sem Permissão) antes de registrar o ponto.
  - **Tarefas**:
    - [ ] Criar indicador de status visual da câmera no `index.html`.
    - [ ] Atualizar estado do indicador em `app.js` durante a chamada `navigator.mediaDevices.getUserMedia`.

- **US02 - Validação Obrigatória da Foto**
  - **Descrição**: Como gestor de RH, quero garantir que nenhum ponto seja registrado sem a foto do funcionário.
  - **Tarefas**:
    - [ ] Adicionar checagem de estado ativo da câmera em `app.js`.
    - [ ] Impedir o envio do formulário e alertar o usuário se a foto não for capturada adequadamente.

- **US03 - Otimização da Imagem Capturada**
  - **Descrição**: Como sistema, quero capturar a imagem do rosto no tamanho ideal e com boa compressão em base64/JPEG.
  - **Tarefas**:
    - [ ] Ajustar as dimensões do `<canvas>` e compressão no método `capturarFoto()`.

---

### Épico 2: Comprovante e QR Code de Autenticidade
- **US04 - Padronização e Segurança dos Dados do QR Code**
  - **Descrição**: Como auditor, quero que o QR Code do comprovante contenha informações estruturadas e um hash/checksum de validação do registro.
  - **Tarefas**:
    - [ ] Estruturar o objeto de dados do QR Code com ID do registro, matrícula, timestamp ISO e código de verificação/hash.
    - [ ] Garantir formatação limpa e legível para escaneamento em dispositivos móveis.

- **US05 - Ajustes de Layout e Estilo de Impressão do Comprovante**
  - **Descrição**: Como funcionário, quero que o comprovante impresso apresente foto, QR Code e informações organizadas no formato de ticket.
  - **Tarefas**:
    - [ ] Atualizar as regras do `@media print` no `custom.css` para centralizar o ticket e garantir nitidez da foto e do QR Code.
    - [ ] Garantir ocultação adequada dos elementos de formulário e botões durante a impressão.

---

### Épico 3: Testes e Garantia de Qualidade
- **US06 - Testes Unitários e Validação de Fluxo**
  - **Descrição**: Como desenvolvedor, quero garantir que a lógica de cálculo de tolerância e geração de payload do comprovante funcionem sem regressões.
  - **Tarefas**:
    - [ ] Executar e validar módulo de cálculo `calc.js`.
    - [ ] Testar captura de câmera e geração de QR Code em ambiente do navegador.

// Seleção dos elementos
const editor = document.getElementById('anotacoes');
const materiaSelect = document.getElementById('materiaSelect');
const statusDiv = document.getElementById('status');
const palavrasCount = document.getElementById('palavrasCount');
const caracteresCount = document.getElementById('caracteresCount');
const btnLimpar = document.getElementById('btnLimpar');

// Retorna a chave do localStorage para cada matéria
function getChaveStorage() {
    return `agronotes_materia_${materiaSelect.value}`;
}

// 1. CARREGAR ANOTAÇÕES
function carregarAnotacoes() {
    const chave = getChaveStorage();
    const conteudoSalvo = localStorage.getItem(chave);

    if (conteudoSalvo !== null) {
        editor.innerHTML = conteudoSalvo;
    } else {
        editor.innerHTML = '';
    }

    atualizarContadores();
    statusDiv.textContent = "Pronto";
    statusDiv.classList.remove('salvando');
}

// 2. SALVAR ANOTAÇÕES AUTOMATICAMENTE
function salvarAnotacoes() {
    statusDiv.textContent = "Salvando...";
    statusDiv.classList.add('salvando');

    const chave = getChaveStorage();
    // Salva o innerHTML para preservar os grifos e marcações
    localStorage.setItem(chave, editor.innerHTML);
    localStorage.setItem('agronotes_ultima_materia', materiaSelect.value);

    setTimeout(() => {
        statusDiv.textContent = "Salvo no navegador";
        statusDiv.classList.remove('salvando');
    }, 300);
}

// 3. FUNÇÃO PARA DESTARCAR TEXTO SELECIONADO
function destacarTexto(cor) {
    const selecao = window.getSelection();
    
    if (!selecao.isCollapsed && selecao.rangeCount > 0) {
        document.execCommand('hiliteColor', false, cor);
        salvarAnotacoes();
    }
}

// 4. REMOVER DESTAQUE DO TEXTO SELECIONADO
function removerDestaque() {
    const selecao = window.getSelection();
    
    if (!selecao.isCollapsed && selecao.rangeCount > 0) {
        document.execCommand('hiliteColor', false, 'transparent');
        salvarAnotacoes();
    }
}

// 5. CONTADORES DE TEXTO
function atualizarContadores() {
    const textoPuro = editor.innerText || '';

    caracteresCount.textContent = `${textoPuro.length} caracteres`;

    const textoLimpo = textoPuro.trim();
    const palavras = textoLimpo === '' ? 0 : textoLimpo.split(/\s+/).length;
    palavrasCount.textContent = `${palavras} palavras`;
}

// EVENTOS DE ESCUTA

// Detecta digitação e alterações na área editável
editor.addEventListener('input', () => {
    salvarAnotacoes();
    atualizarContadores();
});

// Troca de Matéria
materiaSelect.addEventListener('change', () => {
    carregarAnotacoes();
});

// Limpar Matéria Atual
btnLimpar.addEventListener('click', () => {
    const materiaNome = materiaSelect.options[materiaSelect.selectedIndex].text;

    if (confirm(`Tem certeza que deseja apagar todas as anotações de "${materiaNome}"?`)) {
        editor.innerHTML = '';
        salvarAnotacoes();
        atualizarContadores();
    }
});

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    const ultimaMateria = localStorage.getItem('agronotes_ultima_materia');
    if (ultimaMateria) {
        materiaSelect.value = ultimaMateria;
    }
    carregarAnotacoes();
});

// SELEÇÃO DO NOVO BOTÃO DE LOGOUT
const btnSair = document.getElementById('btnSair');

// VERIFICAÇÃO DE SEGURANÇA: Se não estiver logado, redireciona para login.html
if (localStorage.getItem('agronotes_autenticado') !== 'true') {
    window.location.href = 'login.html';
}

// EVT: AÇÃO DO BOTÃO "SALVAR E SAIR"
if (btnSair) {
    btnSair.addEventListener('click', () => {
        // 1. Força o salvamento das alterações atuais no localStorage
        salvarAnotacoes();
        
        // 2. Altera a indicação visual de status
        statusDiv.textContent = "Sessão encerrada com sucesso!";
        
        // 3. Remove a permissão de acesso ativo
        localStorage.removeItem('agronotes_autenticado');
        
        // 4. Redireciona de volta para a tela de login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    });
}
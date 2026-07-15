<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBuDX35KzF00HYhmHKHZJyjFOut1edzS7o",
    authDomain: "agronote-a9a28.firebaseapp.com",
    databaseURL: "https://agronote-a9a28-default-rtdb.firebaseio.com",
    projectId: "agronote-a9a28",
    storageBucket: "agronote-a9a28.firebasestorage.app",
    messagingSenderId: "491935875027",
    appId: "1:491935875027:web:c6286e59d2e86554013926",
    measurementId: "G-49VGTPRYD3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>


// Seleção dos elementos do HTML
const editor = document.getElementById('anotacoes');
const materiaSelect = document.getElementById('materiaSelect');
const statusDiv = document.getElementById('status');
const palavrasCount = document.getElementById('palavrasCount');
const caracteresCount = document.getElementById('caracteresCount');
const btnLimpar = document.getElementById('btnLimpar');
const btnSair = document.getElementById('btnSair');

// ID do Usuário (Usado como ID do documento na Nuvem)
const USUARIO_ID = "06869"; 

let tempoDigitacao = null;

// VERIFICAÇÃO DE SEGURANÇA
if (localStorage.getItem('agronotes_autenticado') !== 'true') {
    window.location.href = 'login.html';
}

// 2. BUSCAR ANOTAÇÃO NA NUVEM
async function carregarAnotacoesNuvem() {
    statusDiv.textContent = "Buscando da nuvem...";
    statusDiv.classList.add('salvando');

    const materiaAtual = materiaSelect.value;
    const docRef = doc(db, "cadernos", `${USUARIO_ID}_${materiaAtual}`);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            editor.innerHTML = docSnap.data().conteudo || '';
        } else {
            editor.innerHTML = '';
        }
        
        statusDiv.textContent = "Sincronizado";
    } catch (error) {
        console.error("Erro ao carregar:", error);
        statusDiv.textContent = "Erro ao conectar";
    } finally {
        statusDiv.classList.remove('salvando');
        atualizarContadores();
    }
}

// 3. SALVAR ANOTAÇÃO NA NUVEM
async function salvarAnotacoesNuvem() {
    statusDiv.textContent = "Salvando na nuvem...";
    statusDiv.classList.add('salvando');

    const materiaAtual = materiaSelect.value;
    const docRef = doc(db, "cadernos", `${USUARIO_ID}_${materiaAtual}`);

    try {
        await setDoc(docRef, {
            conteudo: editor.innerHTML,
            ultimaAtualizacao: new Date().toISOString()
        });

        localStorage.setItem('agronotes_ultima_materia', materiaAtual);

        setTimeout(() => {
            statusDiv.textContent = "Salvo na nuvem ☁️";
            statusDiv.classList.remove('salvando');
        }, 400);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        statusDiv.textContent = "Erro ao salvar";
        statusDiv.classList.remove('salvando');
    }
}

// 4. FUNÇÕES DE DESTAQUE DE TEXTO
window.destacarTexto = function(cor) {
    const selecao = window.getSelection();
    if (!selecao.isCollapsed && selecao.rangeCount > 0) {
        document.execCommand('hiliteColor', false, cor);
        salvarAnotacoesNuvem();
    }
};

window.removerDestaque = function() {
    const selecao = window.getSelection();
    if (!selecao.isCollapsed && selecao.rangeCount > 0) {
        document.execCommand('hiliteColor', false, 'transparent');
        salvarAnotacoesNuvem();
    }
};

// 5. CONTADORES DE PALAVRAS E CARACTERES
function atualizarContadores() {
    const textoPuro = editor.innerText || '';
    caracteresCount.textContent = `${textoPuro.length} caracteres`;

    const textoLimpo = textoPuro.trim();
    const palavras = textoLimpo === '' ? 0 : textoLimpo.split(/\s+/).length;
    palavrasCount.textContent = `${palavras} palavras`;
}

// EVENTOS DE ESCUTA

// Salva com um pequeno atraso (debounce) enquanto o usuário digita para não sobrecarregar a rede
editor.addEventListener('input', () => {
    statusDiv.textContent = "Digitando...";
    atualizarContadores();
    
    clearTimeout(tempoDigitacao);
    tempoDigitacao = setTimeout(() => {
        salvarAnotacoesNuvem();
    }, 800); // Aguarda 0.8s após parar de digitar para enviar
});

// Troca de Matéria
materiaSelect.addEventListener('change', () => {
    carregarAnotacoesNuvem();
});

// Limpar Matéria
btnLimpar.addEventListener('click', () => {
    const materiaNome = materiaSelect.options[materiaSelect.selectedIndex].text;

    if (confirm(`Tem certeza que deseja apagar todas as anotações de "${materiaNome}"?`)) {
        editor.innerHTML = '';
        salvarAnotacoesNuvem();
        atualizarContadores();
    }
});

// Botão Salvar e Sair
if (btnSair) {
    btnSair.addEventListener('click', async () => {
        await salvarAnotacoesNuvem();
        localStorage.removeItem('agronotes_autenticado');
        window.location.href = 'login.html';
    });
}

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    const ultimaMateria = localStorage.getItem('agronotes_ultima_materia');
    if (ultimaMateria) {
        materiaSelect.value = ultimaMateria;
    }
    carregarAnotacoesNuvem();
});

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  onValue,
  push,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// Configurações do Firebase
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  databaseURL: 'https://SEU_PROJETO-default-rtdb.firebaseio.com',
  projectId: 'SEU_PROJETO',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const teamsRef = ref(db, 'fogueteCup/teams');

const teamCountEl = document.querySelector('[data-team-count]');
const teamListEl = document.getElementById('teamList');
const form = document.getElementById('inscricaoForm');
const statusMessage = document.getElementById('inscricaoStatus');

let registeredTeams = [];

// Ouve as mudanças do Banco de Dados em tempo real
onValue(teamsRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    registeredTeams = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  } else {
    registeredTeams = [];
  }
  renderTeams();
});

function renderTeams() {
  const total = registeredTeams.length;
  if (teamCountEl) teamCountEl.textContent = String(total);

  if (!total) {
    teamListEl.innerHTML = '<li>Nenhuma equipe registrada ainda.</li>';
    return;
  }

  teamListEl.innerHTML = registeredTeams
    .map((team) => {
      const membros = [team.lider, team.aluno2, team.aluno3, team.aluno4]
        .filter(Boolean)
        .join(' • ');

      return `<li><strong>${team.name}</strong> — ${team.email} <br><small>${membros}</small></li>`;
    })
    .join('');
}

document.querySelectorAll('.auth-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.auth-btn').forEach((btn) => btn.classList.remove('is-active'));
    button.classList.add('is-active');

    const emailInput = document.getElementById('alunoEmail');
    if (button.dataset.provider === 'escola') {
      emailInput.placeholder = 'aluno@escola.pr.gov.br';
      emailInput.setAttribute('aria-label', 'E-mail da escola');
    } else {
      emailInput.placeholder = 'aluno@gmail.com';
      emailInput.setAttribute('aria-label', 'E-mail do Google');
    }

    emailInput.focus();
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const emailInput = document.getElementById('alunoEmail');
  const teamInput = document.getElementById('nomeEquipe');
  const liderInput = document.getElementById('nomeLider');
  const aluno2Input = document.getElementById('aluno2');
  const aluno3Input = document.getElementById('aluno3');
  const aluno4Input = document.getElementById('aluno4');

  const email = emailInput.value.trim();
  const teamName = teamInput.value.trim();
  const lider = liderInput.value.trim();
  const aluno2 = aluno2Input.value.trim();
  const aluno3 = aluno3Input.value.trim();
  const aluno4 = aluno4Input.value.trim();

  if (!email || !teamName || !lider || !aluno2 || !aluno3 || !aluno4) {
    statusMessage.textContent = 'Preencha todos os campos da equipe antes de enviar.';
    statusMessage.style.color = '#ffd166';
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    statusMessage.textContent = 'Digite um e-mail válido para continuar.';
    statusMessage.style.color = '#ffd166';
    return;
  }

  const alreadyExists = registeredTeams.some((team) => {
    return team.name.toLowerCase() === teamName.toLowerCase() || team.email.toLowerCase() === email.toLowerCase();
  });

  if (alreadyExists) {
    statusMessage.textContent = 'Essa equipe ou esse e-mail já foi inscrito.';
    statusMessage.style.color = '#ffd166';
    return;
  }

  try {
    await push(teamsRef, {
      name: teamName,
      email,
      lider,
      aluno2,
      aluno3,
      aluno4,
    });

    statusMessage.textContent = `${teamName} foi inscrita com sucesso!`;
    statusMessage.style.color = '#7ef0a8';
    form.reset();
  } catch (error) {
    console.error('Erro ao salvar no Firebase:', error);
    statusMessage.textContent = 'Erro ao registrar. Tente novamente.';
    statusMessage.style.color = '#ff6b6b';
  }
});

// 4. Função JavaScript que dispara ao concluir o login do Google
function handleCredentialResponse(response) {
  console.log("Token JWT de login:", response.credential);
  alert("Login efetuado com sucesso!");
}

const STORAGE_KEY = 'fogueteCupTeams';
const teamCountEl = document.querySelector('[data-team-count]');
const teamListEl = document.getElementById('teamList');
const form = document.getElementById('inscricaoForm');
const statusMessage = document.getElementById('inscricaoStatus');
const registeredTeams = loadTeams();

function loadTeams() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Não foi possível carregar as equipes salvas:', error);
    return [];
  }
}

function saveTeams() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registeredTeams));
  } catch (error) {
    console.error('Não foi possível salvar as equipes:', error);
  }
}

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

form.addEventListener('submit', (event) => {
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

  registeredTeams.push({
    name: teamName,
    email,
    lider,
    aluno2,
    aluno3,
    aluno4,
  });

  saveTeams();
  renderTeams();
  statusMessage.textContent = `${teamName} foi inscrita com sucesso por ${email}.`;
  statusMessage.style.color = '#7ef0a8';
  form.reset();
});

renderTeams();

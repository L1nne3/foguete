const teamCountEl = document.querySelector('[data-team-count]');
const teamListEl = document.getElementById('teamList');
const form = document.getElementById('inscricaoForm');
const statusMessage = document.getElementById('inscricaoStatus');
const registeredTeams = [];

function handleCredentialResponse(response) {
  console.log("Token JWT de login:", response.credential);
  alert("Login efetuado com sucesso!");
}

function renderTeams() {
  const total = registeredTeams.length;
  teamCountEl.textContent = String(total);

  if (!total) {
    teamListEl.innerHTML = '<li>Nenhuma equipe registrada ainda.</li>';
    return;
  }

  teamListEl.innerHTML = registeredTeams
    .map((team) => `<li><strong>${team.name}</strong> — ${team.email}</li>`)
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
  const email = emailInput.value.trim();
  const teamName = teamInput.value.trim();

  if (!email || !teamName) {
    statusMessage.textContent = 'Preencha o e-mail e o nome da equipe antes de enviar.';
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
  });

  renderTeams();
  statusMessage.textContent = `${teamName} foi inscrita com sucesso por ${email}.`;
  statusMessage.style.color = '#7ef0a8';
  form.reset();
});

renderTeams();

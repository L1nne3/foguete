<script type="module">
 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
  import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCeZfbi8ZjfiJdfQcev76OdcLSwZTIMcEc",
    authDomain: "foguete-cup.firebaseapp.com",
    databaseURL: "https://foguete-cup-default-rtdb.firebaseio.com",
    projectId: "foguete-cup",
    storageBucket: "foguete-cup.firebasestorage.app",
    messagingSenderId: "1034694225214",
    appId: "1:1034694225214:web:2d8637f897e4a395e3d06f",
    measurementId: "G-JG77QS21GG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
const firebaseReady = !Object.values(firebaseConfig).some((value) => {
  const text = String(value);
  return text.includes('SUA_') || text.includes('SEU_PROJETO') || text.includes('default-rtdb.firebaseio.com');
});

let registeredTeams = [];
let db = null;
let teamsRef = null;

function normalizeTeam(rawTeam) {
  if (!rawTeam || typeof rawTeam !== 'object') return null;

  return {
    name: rawTeam.name || 'Equipe sem nome',
    email: rawTeam.email || '',
    lider: rawTeam.lider || '',
    aluno2: rawTeam.aluno2 || '',
    aluno3: rawTeam.aluno3 || '',
    aluno4: rawTeam.aluno4 || '',
  };
}

function renderTeams() {
  const total = registeredTeams.length;
  if (teamCountEl) teamCountEl.textContent = String(total);

  if (!total) {
    if (firebaseReady) {
      teamListEl.innerHTML = '<li>Nenhuma equipe registrada ainda.</li>';
    } else {
      teamListEl.innerHTML = '<li>Configure o Firebase para receber as inscrições em tempo real.</li>';
    }
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

function syncTeamsFromFirebase(snapshot) {
  const data = snapshot.val();
  const firebaseTeams = [];

  if (data) {
    Object.entries(data).forEach(([, value]) => {
      const team = normalizeTeam(value);
      if (team) firebaseTeams.push(team);
    });
  }

  registeredTeams = firebaseTeams;
  renderTeams();
}

function connectFirebase() {
  if (!firebaseReady) {
    statusMessage.textContent = 'Configure o Firebase para sincronizar as inscrições entre os computadores.';
    statusMessage.style.color = '#ffd166';
    renderTeams();
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    teamsRef = ref(db, 'fogueteCup/teams');

    onValue(teamsRef, (snapshot) => {
      syncTeamsFromFirebase(snapshot);
    });
  } catch (error) {
    console.error('Erro ao conectar ao Firebase:', error);
    statusMessage.textContent = 'Não foi possível conectar ao Firebase. Verifique a configuração.';
    statusMessage.style.color = '#ffd166';
    renderTeams();
  }
}

async function saveTeamToFirebase(team) {
  if (!firebaseReady || !teamsRef) {
    setStatus('Configure o Firebase antes de enviar a equipe.', false);
    return;
  }

  try {
    await push(teamsRef, team);
  } catch (error) {
    console.error('Erro ao salvar equipe no Firebase:', error);
    setStatus('Não foi possível salvar no Firebase. Tente novamente.', false);
    throw error;
  }
}

function setStatus(message, isSuccess = true) {
  statusMessage.textContent = message;
  statusMessage.style.color = isSuccess ? '#7ef0a8' : '#ffd166';
}

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
    setStatus('Preencha todos os campos da equipe antes de enviar.', false);
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    setStatus('Digite um e-mail válido para continuar.', false);
    return;
  }

  const alreadyExists = registeredTeams.some((team) => {
    return team.name.toLowerCase() === teamName.toLowerCase() || team.email.toLowerCase() === email.toLowerCase();
  });

  if (alreadyExists) {
    setStatus('Essa equipe ou esse e-mail já foi inscrito.', false);
    return;
  }

  const teamData = {
    name: teamName,
    email,
    lider,
    aluno2,
    aluno3,
    aluno4,
  };

  try {
    await saveTeamToFirebase(teamData);
    setStatus(`${teamName} foi inscrita com sucesso por ${email}.`);
    form.reset();
  } catch (error) {
    // erro já tratado dentro do saveTeamToFirebase
  }
});

connectFirebase();

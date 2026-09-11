<script type="module">
      import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
      import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
      import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

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

      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      const db = getDatabase(app);
      const teamsRef = ref(db, 'fogueteCup/teams');

      // Seleção dos elementos do HTML
      const form = document.getElementById('inscricaoForm');
      const statusMessage = document.getElementById('inscricaoStatus');
      const teamListEl = document.getElementById('teamList');
      const teamCountEl = document.querySelector('[data-team-count]');

      let registeredTeams = [];

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

      onValue(teamsRef, (snapshot) => {
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
      }, (error) => {
        console.error('Erro ao sincronizar com o Firebase:', error);
        statusMessage.textContent = 'Não foi possível conectar ao banco de dados.';
        statusMessage.style.color = '#ffd166';
      });

      function setStatus(message, isSuccess = true) {
        statusMessage.textContent = message;
        statusMessage.style.color = isSuccess ? '#7ef0a8' : '#ffd166';
      }

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('alunoEmail').value.trim();
        const teamName = document.getElementById('nomeEquipe').value.trim();
        const lider = document.getElementById('nomeLider').value.trim();
        const aluno2 = document.getElementById('aluno2').value.trim();
        const aluno3 = document.getElementById('aluno3').value.trim();
        const aluno4 = document.getElementById('aluno4').value.trim();

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

        const teamData = { name: teamName, email, lider, aluno2, aluno3, aluno4 };

        try {
          await push(teamsRef, teamData);
          setStatus(`${teamName} foi inscrita com sucesso por ${email}.`);
          form.reset();
        } catch (error) {
          console.error('Erro ao salvar:', error);
          setStatus('Não foi possível salvar no Firebase. Tente novamente.', false);
        }
      });

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

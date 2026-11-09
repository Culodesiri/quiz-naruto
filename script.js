let currentQuizData = null;
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let isAnswered = false;
let activeQuizFile = '';

const QUESTIONS_PER_QUIZ = 10;

const quizzesList = [
  { file: 'historia.json', title: 'Historia y Arcos', desc: 'Eventos principales desde la infancia de Naruto hasta la Cuarta Guerra Ninja.' },
  { file: 'personajes.json', title: 'Personajes y Jutsus', desc: 'Kekkei Genkai, Mangekyō Sharingan, invocaciones y técnicas.' },
  { file: 'curiosidades.json', title: 'Lore y Exámenes Chūnin', desc: 'Ramen Ichiraku, clanes, detalles de trasfondo y secretos.' }
];

const screenMenu = document.getElementById('screen-menu');
const screenQuiz = document.getElementById('screen-quiz');
const screenResults = document.getElementById('screen-results');

const quizListContainer = document.getElementById('quiz-list');
const rankingContainer = document.getElementById('ranking-container');

const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const hintBox = document.getElementById('hint-box');
const hintText = document.getElementById('hint-text');

const btnAction = document.getElementById('btn-action');
const btnHint = document.getElementById('btn-hint');
const btnAbort = document.getElementById('btn-abort');

const resultMessage = document.getElementById('result-message');
const finalScore = document.getElementById('final-score');
const maxScore = document.getElementById('max-score');
const playerNameInput = document.getElementById('player-name');
const btnSaveScore = document.getElementById('btn-save-score');
const btnRestart = document.getElementById('btn-restart');
const btnHome = document.getElementById('btn-home');

document.addEventListener('DOMContentLoaded', () => {
  renderQuizMenu();
  renderRanking();
  setupEventListeners();
});

function renderQuizMenu() {
  quizListContainer.innerHTML = '';
  quizzesList.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div>
        <h4>${quiz.title}</h4>
        <p>${quiz.desc}</p>
      </div>
      <button class="btn-start">Iniciar Quiz</button>
    `;
    card.addEventListener('click', () => startQuiz(quiz.file));
    quizListContainer.appendChild(card);
  });
}

async function startQuiz(quizFile) {
  activeQuizFile = quizFile;
  try {
    const response = await fetch(`data/${quizFile}`);
    currentQuizData = await response.json();

    selectedQuestions = shuffleArray([...currentQuizData.questions]).slice(0, QUESTIONS_PER_QUIZ);
    
    currentQuestionIndex = 0;
    score = 0;

    switchScreen(screenQuiz);
    loadQuestion();
  } catch (error) {
    console.error('Error al cargar el cuestionario:', error);
    alert('No se pudo cargar el cuestionario. Asegúrate de abrir la página con Live Server.');
  }
}

function loadQuestion() {
  isAnswered = false;
  selectedOptionIndex = null;

  const currentQ = selectedQuestions[currentQuestionIndex];

  questionCounter.textContent = `Pregunta ${currentQuestionIndex + 1} / ${selectedQuestions.length}`;
  scoreCounter.innerHTML = `⭐ Puntos: ${score}`;
  progressBar.style.width = `${((currentQuestionIndex) / selectedQuestions.length) * 100}%`;

  questionText.textContent = `${currentQuestionIndex + 1}. ${currentQ.question}`;
  
  hintBox.style.display = 'none';
  btnHint.disabled = !currentQ.hint;

  btnAction.textContent = 'Confirmar Respuesta';
  btnAction.disabled = true;

  optionsContainer.innerHTML = '';
  currentQ.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span>${optText}</span> ⚪`;
    btn.addEventListener('click', () => selectOption(index));
    optionsContainer.appendChild(btn);
  });
}

function selectOption(index) {
  if (isAnswered) return;

  selectedOptionIndex = index;
  const buttons = optionsContainer.querySelectorAll('.option-btn');

  buttons.forEach((btn, idx) => {
    if (idx === index) {
      btn.classList.add('selected');
      btn.innerHTML = `<span>${btn.querySelector('span').textContent}</span> 🔘`;
    } else {
      btn.classList.remove('selected');
      btn.innerHTML = `<span>${btn.querySelector('span').textContent}</span> ⚪`;
    }
  });

  btnAction.disabled = false;
}

function handleAction() {
  if (!isAnswered) {
    checkAnswer();
  } else {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }
}

function checkAnswer() {
  isAnswered = true;
  const currentQ = selectedQuestions[currentQuestionIndex];
  const buttons = optionsContainer.querySelectorAll('.option-btn');

  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    const text = btn.querySelector('span').textContent;
    if (idx === currentQ.correct) {
      btn.classList.add('correct');
      btn.innerHTML = `<span>${text}</span> ✅`;
    }
    if (idx === selectedOptionIndex && idx !== currentQ.correct) {
      btn.classList.add('incorrect');
      btn.innerHTML = `<span>${text}</span> ❌`;
    }
  });

  if (selectedOptionIndex === currentQ.correct) {
    score++;
    scoreCounter.innerHTML = `⭐ Puntos: ${score}`;
  }

  btnAction.textContent = currentQuestionIndex === selectedQuestions.length - 1 ? 'Ver Resultados' : 'Siguiente Pregunta';
  btnAction.disabled = false;
}

function toggleHint() {
  const currentQ = selectedQuestions[currentQuestionIndex];
  if (currentQ.hint) {
    hintText.textContent = currentQ.hint;
    hintBox.style.display = 'block';
    btnHint.disabled = true;
  }
}

function showResults() {
  progressBar.style.width = '100%';
  switchScreen(screenResults);

  finalScore.textContent = score;
  maxScore.textContent = selectedQuestions.length;

  const percentage = (score / selectedQuestions.length) * 100;
  if (percentage === 100) {
    resultMessage.textContent = '¡Impresionante! ¡Eres un auténtico Hokage de Konoha!';
  } else if (percentage >= 70) {
    resultMessage.textContent = '¡Excelente nivel! Has alcanzado el rango de Jōnin.';
  } else if (percentage >= 50) {
    resultMessage.textContent = '¡Buen esfuerzo! Has superado el examen Chūnin.';
  } else {
    resultMessage.textContent = 'Aún te queda entrenamiento en la Academia Ninja.';
  }

  playerNameInput.value = '';
  btnSaveScore.disabled = false;
  btnSaveScore.textContent = 'Guardar Registro';
}

function saveScore() {
  const name = playerNameInput.value.trim() || 'Shinobi Anónimo';
  const ranking = JSON.parse(localStorage.getItem('naruto_quiz_ranking')) || [];

  const newEntry = {
    name: name,
    score: score,
    max: selectedQuestions.length,
    quizTitle: currentQuizData.title,
    date: new Date().toLocaleDateString('es-ES')
  };

  ranking.push(newEntry);
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem('naruto_quiz_ranking', JSON.stringify(ranking.slice(0, 10)));

  btnSaveScore.disabled = true;
  btnSaveScore.textContent = '¡Guardado!';
  renderRanking();
}

function renderRanking() {
  const ranking = JSON.parse(localStorage.getItem('naruto_quiz_ranking')) || [];

  if (ranking.length === 0) {
    rankingContainer.innerHTML = '<p class="empty-ranking">Aún no hay puntuaciones registradas. ¡Sé el primero en jugar!</p>';
    return;
  }

  let html = `
    <table class="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre Ninja</th>
          <th>Prueba</th>
          <th>Puntos</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
  `;

  ranking.forEach((entry, idx) => {
    html += `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${escapeHtml(entry.name)}</td>
        <td><small>${escapeHtml(entry.quizTitle)}</small></td>
        <td><strong>${entry.score} / ${entry.max}</strong></td>
        <td><small>${entry.date}</small></td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  rankingContainer.innerHTML = html;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function switchScreen(screenToActive) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screenToActive.classList.add('active');
}

function escapeHtml(text) {
  const div.textContent = text;
  return div.innerHTML;
}

function setupEventListeners() {
  btnAction.addEventListener('click', handleAction);
  btnHint.addEventListener('click', toggleHint);
  btnAbort.addEventListener('click', () => switchScreen(screenMenu));
  
  btnSaveScore.addEventListener('click', saveScore);
  btnRestart.addEventListener('click', () => startQuiz(activeQuizFile));
  btnHome.addEventListener('click', () => {
    renderRanking();
    switchScreen(screenMenu);
  });
}

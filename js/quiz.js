const demoQuestions = [
  {
    text: 'Jaká je správná odpověď na tuto ukázkovou otázku?',
    answers: [
      { letter: 'A', text: 'První možnost', correct: false },
      { letter: 'B', text: 'Druhá možnost - správná', correct: true },
      { letter: 'C', text: 'Třetí možnost', correct: false },
      { letter: 'D', text: 'Čtvrtá možnost', correct: false }
    ]
  },
  {
    text: 'Toto je druhá ukázková otázka pro testování?',
    answers: [
      { letter: 'A', text: 'Odpověď A', correct: false },
      { letter: 'B', text: 'Odpověď B', correct: false },
      { letter: 'C', text: 'Odpověď C - správná', correct: true },
      { letter: 'D', text: 'Odpověď D', correct: false }
    ]
  }
];

let settings = {};
let currentQuestionIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let answered = false;
let correctAnswers = 0;
let incorrectAnswers = 0;
let quizStartTime = Date.now();
let questionStartTime = Date.now();
let questions = [];
let userAnswers = [];

window.onload = function() {
  const storedSettings = sessionStorage.getItem('quizSettings');
  if (storedSettings) {
    settings = JSON.parse(storedSettings);
  } else {
    settings = {
      timeLimit: '0',
      questionCount: '2',
      scoringMode: 'standard',
      questionOrder: 'fixed',
      answerReview: 'after-each',
      categoryId: 'pravni'
    };
  }
  
  questions = [...demoQuestions];
  if (settings.questionOrder === 'random') {
    questions = shuffleArray(questions);
  }
  
  loadQuestion();
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function loadQuestion() {
  answered = false;
  questionStartTime = Date.now();
  const question = questions[currentQuestionIndex];
  
  document.getElementById('question-number').textContent = currentQuestionIndex + 1;
  document.getElementById('total-questions').textContent = questions.length;
  document.getElementById('question-text').textContent = question.text;
  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  question.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left border-2 border-gray-300 rounded-md px-4 py-3 hover:border-blue-500 transition';
    btn.innerHTML = `<span class="font-semibold">${answer.letter}.</span> ${answer.text}`;
    btn.onclick = () => selectAnswer(answer.letter, answer.correct);
    answersDiv.appendChild(btn);
  });

  if (settings.timeLimit && parseInt(settings.timeLimit) > 0) {
    timeRemaining = parseInt(settings.timeLimit);
    updateTimer();
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimer();
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        if (!answered) {
          autoSkip();
        }
      }
    }, 1000);
  } else {
    document.getElementById('timer').textContent = '';
  }
}

function updateTimer() {
  document.getElementById('timer').textContent = `Čas: ${timeRemaining}s`;
}

function selectAnswer(letter, correct) {
  if (answered) return;
  answered = true;

  const timeSpent = (Date.now() - questionStartTime) / 1000;
  
  userAnswers.push({
    questionIndex: currentQuestionIndex,
    correct: correct,
    timeSpent: timeSpent
  });

  if (correct) {
    correctAnswers++;
  } else {
    incorrectAnswers++;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const buttons = document.querySelectorAll('#answers button');
  buttons.forEach(btn => {
    btn.disabled = true;
    const btnLetter = btn.textContent.trim()[0];
    
    if (btnLetter === letter) {
      if (correct) {
        btn.classList.remove('border-gray-300');
        btn.classList.add('border-green-500', 'bg-green-50');
      } else {
        btn.classList.remove('border-gray-300');
        btn.classList.add('border-red-500', 'bg-red-50');
      }
    }
  });

  if (settings.answerReview === 'after-each') {
    showFeedback(correct);
  } else {
    setTimeout(() => {
      nextQuestion();
    }, 800);
  }
}

function showFeedback(correct) {
  const question = questions[currentQuestionIndex];
  const correctAnswer = question.answers.find(a => a.correct);
  
  const feedbackDiv = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  
  if (correct) {
    feedbackText.className = 'text-sm text-green-700 font-semibold';
    feedbackText.textContent = '✓ Správná odpověď!';
  } else {
    feedbackText.className = 'text-sm text-red-700 font-semibold';
    feedbackText.textContent = `✗ Správná odpověď: ${correctAnswer.letter}. ${correctAnswer.text}`;
  }
  
  feedbackDiv.classList.remove('hidden');
  document.getElementById('next-btn').classList.remove('hidden');
}

function skipQuestion() {
  if (answered) return;
  
  userAnswers.push({
    questionIndex: currentQuestionIndex,
    correct: false,
    timeSpent: 0,
    skipped: true
  });
  
  incorrectAnswers++;
  nextQuestion();
}

function autoSkip() {
  const feedbackDiv = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  const question = questions[currentQuestionIndex];
  const correctAnswer = question.answers.find(a => a.correct);
  
  userAnswers.push({
    questionIndex: currentQuestionIndex,
    correct: false,
    timeSpent: parseInt(settings.timeLimit),
    timeout: true
  });
  
  incorrectAnswers++;
  
  if (settings.answerReview === 'after-each') {
    feedbackText.className = 'text-sm text-orange-700 font-semibold';
    feedbackText.textContent = `⏱ Čas vypršel! Správná odpověď: ${correctAnswer.letter}. ${correctAnswer.text}`;
    feedbackDiv.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    const buttons = document.querySelectorAll('#answers button');
    buttons.forEach(btn => btn.disabled = true);
  } else {
    setTimeout(() => {
      nextQuestion();
    }, 800);
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
  const avgTime = Math.round(totalTime / questions.length);
  
  let finalScore = correctAnswers;
  
  if (settings.scoringMode === 'negative') {
    finalScore = correctAnswers - incorrectAnswers;
    if (finalScore < 0) finalScore = 0;
  } else if (settings.scoringMode === 'time-weighted') {
    finalScore = 0;
    userAnswers.forEach(answer => {
      if (answer.correct) {
        const timeBonus = Math.max(0, 10 - answer.timeSpent);
        finalScore += (10 + timeBonus);
      }
    });
  }
  
  if (settings.answerReview === 'after-quiz' || settings.answerReview === 'no-review') {
    showResults(finalScore, totalTime, avgTime);
  } else {
    exitQuiz();
  }
}

function showResults(score, totalTime, avgTime) {
  const maxScore = settings.scoringMode === 'time-weighted' 
    ? questions.length * 20 // Max 20 points per question (10 base + 10 time bonus)
    : questions.length;
  
  const scoreDisplay = settings.scoringMode === 'time-weighted' 
    ? `${Math.round(score)}/${maxScore}`
    : `${correctAnswers}/${questions.length}`;
  
  document.getElementById('final-score').textContent = scoreDisplay;
  document.getElementById('correct-count').textContent = correctAnswers;
  document.getElementById('incorrect-count').textContent = incorrectAnswers;
  document.getElementById('total-time').textContent = totalTime + 's';
  document.getElementById('avg-time').textContent = avgTime + 's';
  
  document.getElementById('results-modal').classList.remove('hidden');
}

function closeResults() {
  const categoryId = settings.categoryId || 'pravni';
  window.location.href = `categories/${categoryId}.html`;
}

function exitQuiz() {
  if (confirm('Opravdu chcete ukončit trénink?')) {
    const categoryId = settings.categoryId || 'pravni';
    window.location.href = `categories/${categoryId}.html`;
  }
}
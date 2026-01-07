function startQuiz() {
  const settings = {
    timeLimit: document.getElementById('time-limit').value,
    questionCount: document.getElementById('question-count').value,
    scoringMode: document.getElementById('scoring-mode').value,
    questionOrder: document.getElementById('question-order').value,
    answerReview: document.getElementById('answer-review').value,
    categoryId: getCategoryFromURL()
  };
  
  sessionStorage.setItem('quizSettings', JSON.stringify(settings));
  window.location.href = '../quiz.html';
}

function getCategoryFromURL() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1);
  return filename.replace('.html', '');
}
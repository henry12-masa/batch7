const EXAM_META = [
  { id: 'cia', title: '公認内部監査人（CIA）', file: 'cia.js' },
  { id: 'cfe', title: '公認不正検査士（CFE）', file: 'cfe.js' },
  { id: 'iso9001Auditor', title: 'ISO 9001 審査員補', file: 'iso9001-auditor.js' },
  { id: 'iso14001Auditor', title: 'ISO 14001 審査員補', file: 'iso14001-auditor.js' },
  { id: 'iso27001Auditor', title: 'ISO 27001 審査員補', file: 'iso27001-auditor.js' },
  { id: 'haccpManager', title: 'HACCP管理者', file: 'haccp-manager.js' },
  { id: 'foodLabel', title: '食品表示検定', file: 'food-label.js' },
  { id: 'fireManager', title: '防火管理者（甲種）', file: 'fire-manager.js' },
  { id: 'bosaisi', title: '防災士', file: 'bosaisi.js' },
  { id: 'eiseiManager1', title: '衛生管理者（第一種）', file: 'eisei-manager1.js' },
  { id: 'eiseiManager2', title: '衛生管理者（第二種）', file: 'eisei-manager2.js' },
  { id: 'safetyConsultant', title: '労働安全コンサルタント', file: 'safety-consultant.js' },
  { id: 'healthConsultant', title: '労働衛生コンサルタント', file: 'health-consultant.js' },
  { id: 'environmentMeter', title: '環境計量士', file: 'environment-meter.js' },
  { id: 'workEnvironment', title: '作業環境測定士', file: 'work-environment.js' }
];

const QUESTION_LIMIT = 50;
let currentExamId = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let locked = false;

const $ = (id) => document.getElementById(id);

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function showOnly(screenId) {
  ['homeScreen', 'quizScreen', 'resultScreen'].forEach(id => $(id).classList.add('hidden'));
  $(screenId).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderExamList() {
  $('examList').innerHTML = EXAM_META.map(exam => {
    const count = window.quizData?.[exam.id]?.length || 0;
    return `<button class="exam-card" onclick="startQuiz('${exam.id}')"><strong>${exam.title}</strong><span>${count}問収録 / ランダム50問</span></button>`;
  }).join('');
}

function startQuiz(examId) {
  const data = window.quizData?.[examId] || [];
  if (data.length < QUESTION_LIMIT) {
    alert('問題データが不足しています。');
    return;
  }
  currentExamId = examId;
  currentQuestions = shuffle(data).slice(0, QUESTION_LIMIT);
  currentIndex = 0;
  score = 0;
  locked = false;
  $('scoreNow').textContent = score;
  const title = EXAM_META.find(e => e.id === examId)?.title || '資格クイズ';
  $('examTitle').textContent = title;
  showOnly('quizScreen');
  renderQuestion();
}

function renderQuestion() {
  locked = false;
  const q = currentQuestions[currentIndex];
  $('questionCount').textContent = `第${currentIndex + 1}問 / ${QUESTION_LIMIT}`;
  $('questionText').textContent = q.question;
  $('feedback').classList.add('hidden');
  $('feedback').textContent = '';
  $('progressBar').style.width = `${(currentIndex / QUESTION_LIMIT) * 100}%`;

  $('choices').innerHTML = q.choices.map((choice, index) => {
    return `<button class="choice-btn" onclick="answerQuestion(${index})">${choice}</button>`;
  }).join('');
}

function answerQuestion(selectedIndex) {
  if (locked) return;
  locked = true;
  const q = currentQuestions[currentIndex];
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.answer) btn.classList.add('correct');
    if (index === selectedIndex && selectedIndex !== q.answer) btn.classList.add('wrong');
  });

  if (selectedIndex === q.answer) score++;
  $('scoreNow').textContent = score;
  $('feedback').textContent = `${selectedIndex === q.answer ? '正解です。' : '不正解です。'} ${q.explanation}`;
  $('feedback').classList.remove('hidden');

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= QUESTION_LIMIT) {
      showResult();
    } else {
      renderQuestion();
    }
  }, 900);
}

function showResult() {
  $('progressBar').style.width = '100%';
  $('resultText').textContent = `${score} / ${QUESTION_LIMIT} 問正解`;
  const rate = Math.round((score / QUESTION_LIMIT) * 100);
  $('resultMessage').textContent = rate >= 80 ? '素晴らしい理解度です。苦手分野の確認に進みましょう。' : rate >= 60 ? '合格圏まであと少しです。解説を意識して復習しましょう。' : '基礎用語から復習すると点数が伸びやすいです。';
  showOnly('resultScreen');
}

function goHome() {
  currentExamId = null;
  showOnly('homeScreen');
}

$('homeBtn').addEventListener('click', goHome);
$('backHomeBtn').addEventListener('click', goHome);
$('retryBtn').addEventListener('click', () => currentExamId ? startQuiz(currentExamId) : goHome());

document.addEventListener('DOMContentLoaded', renderExamList);

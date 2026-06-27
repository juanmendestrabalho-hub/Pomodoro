const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const modeButtons = document.querySelectorAll(".modes button");

const todayEl = document.getElementById("today");
const totalEl = document.getElementById("total");

let timer;
let timeLeft = 1500;
let currentMode = "work";
let running = false;

const modes = {
  work: 1500,
  short: 300,
  long: 900
};

//  som simples
function playSound() {
  const audio = new Audio("https://www.soundjay.com/buttons/beep-07.wav");
  audio.play();
}

//  carregar stats
function loadStats() {
  const data = JSON.parse(localStorage.getItem("pomodoroStats")) || {
    today: 0,
    total: 0,
    lastDate: new Date().toDateString()
  };

  const todayDate = new Date().toDateString();

  if (data.lastDate !== todayDate) {
    data.today = 0;
    data.lastDate = todayDate;
  }

  todayEl.textContent = data.today;
  totalEl.textContent = data.total;

  return data;
}

//  salvar stats
function saveStats(data) {
  localStorage.setItem("pomodoroStats", JSON.stringify(data));
}

// ⏱ atualizar tela
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

//  iniciar
function startTimer() {
  if (running) return;
  running = true;

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      running = false;
      playSound();

      if (currentMode === "work") {
        let stats = loadStats();
        stats.today++;
        stats.total++;
        saveStats(stats);
        loadStats();
      }
    }
  }, 1000);
}

// ⏸ pausar
function pauseTimer() {
  clearInterval(timer);
  running = false;
}

//  resetar
function resetTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = modes[currentMode];
  updateDisplay();
}

//  mudar modo
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    timeLeft = modes[currentMode];
    updateDisplay();
    pauseTimer();
  });
});

// eventos
startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;

// init
loadStats();
updateDisplay();

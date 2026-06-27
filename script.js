const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const modeButtons = document.querySelectorAll(".modes button");
const themeToggle = document.getElementById("themeToggle");

const todayEl = document.getElementById("today");
const totalEl = document.getElementById("total");

let timer;
let timeLeft = 1500;
let currentMode = "work";
let running = false;
let chart;

const modes = {
  work: 1500,
  short: 300,
  long: 900
};

// THEME
function loadTheme() {
  const saved = localStorage.getItem("theme");

  if (saved) {
    document.body.classList.toggle("light", saved === "light");
  } else {
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.body.classList.toggle("light", prefersLight);
  }
}

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
};

// SOUND
function playSound() {
  const audio = new Audio("https://www.soundjay.com/buttons/beep-07.wav");
  audio.play();
}

// STATS
function loadStats() {
  let data = JSON.parse(localStorage.getItem("pomodoroStats")) || {
    today: 0,
    total: 0,
    history: {},
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

function saveStats(data) {
  localStorage.setItem("pomodoroStats", JSON.stringify(data));
}

// CHART
function renderChart() {
  const data = loadStats();

  const labels = Object.keys(data.history).slice(-7);
  const values = labels.map(d => data.history[d]);

  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Sessões",
        data: values
      }]
    }
  });
}

// DISPLAY
function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timeDisplay.textContent =
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// START
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
        const todayKey = new Date().toLocaleDateString();

        stats.today++;
        stats.total++;
        stats.history[todayKey] = (stats.history[todayKey] || 0) + 1;

        saveStats(stats);
        loadStats();
        renderChart();
      }
    }
  }, 1000);
}

// PAUSE
function pauseTimer() {
  clearInterval(timer);
  running = false;
}

// RESET
function resetTimer() {
  clearInterval(timer);
  running = false;
  timeLeft = modes[currentMode];
  updateDisplay();
}

// MODE SWITCH
modeButtons.forEach(btn => {
  btn.onclick = () => {
    currentMode = btn.dataset.mode;
    timeLeft = modes[currentMode];
    updateDisplay();
    pauseTimer();
  };
});

// INIT
loadTheme();
loadStats();
renderChart();
updateDisplay();

startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;

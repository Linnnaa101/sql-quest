const STORAGE_KEY = 'sqlQuestProgress';
const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];

const elements = {
  score: document.querySelector('#score'),
  levelList: document.querySelector('#levelList'),
  progressText: document.querySelector('#progressText'),
  progressTrack: document.querySelector('#progressTrack'),
  progressFill: document.querySelector('#progressFill'),
  progressPercent: document.querySelector('#progressPercent'),
  difficulty: document.querySelector('#difficulty'),
  topic: document.querySelector('#topic'),
  levelTitle: document.querySelector('#levelTitle'),
  explanation: document.querySelector('#explanation'),
  task: document.querySelector('#task'),
  hintText: document.querySelector('#hintText'),
  solutionBox: document.querySelector('#solutionBox'),
  sqlInput: document.querySelector('#sqlInput'),
  runButton: document.querySelector('#runButton'),
  hintButton: document.querySelector('#hintButton'),
  solutionButton: document.querySelector('#solutionButton'),
  nextButton: document.querySelector('#nextButton'),
  feedback: document.querySelector('#feedback'),
  resultTable: document.querySelector('#resultTable'),
  rowCount: document.querySelector('#rowCount'),
  resetProgressButton: document.querySelector('#resetProgressButton'),
  databaseIntro: document.querySelector('#databaseIntro'),
  gameLayout: document.querySelector('#gameLayout'),
  pathSelection: document.querySelector('#pathSelection'),
  beginnerIntro: document.querySelector('#beginnerIntro'),
  createDatabaseButton: document.querySelector('#createDatabaseButton'),
  startLevelsButton: document.querySelector('#startLevelsButton'),
  startBeginnerPathButton: document.querySelector('#startBeginnerPathButton'),
  startLevelOneButton: document.querySelector('#startLevelOneButton'),
  backToLevelsButton: document.querySelector('#backToLevelsButton'),
  showDatabaseInfoButton: document.querySelector('#showDatabaseInfoButton'),
  introFeedback: document.querySelector('#introFeedback')
};

let SQL;
let db;
let isDatabaseReady = false;
let hasLevelSessionStarted = false;
let selectedPath = null;
let hasBeginnerIntroCompleted = false;
let currentLevelIndex = 0;
let progress = loadProgress();

window.addEventListener('DOMContentLoaded', init);
elements.runButton.addEventListener('click', runPlayerQuery);
elements.hintButton.addEventListener('click', showHint);
elements.solutionButton.addEventListener('click', showSolution);
elements.nextButton.addEventListener('click', goToNextLevel);
elements.resetProgressButton.addEventListener('click', resetProgress);
elements.createDatabaseButton.addEventListener('click', createPracticeDatabase);
elements.startLevelsButton.addEventListener('click', startLevels);
elements.startBeginnerPathButton.addEventListener('click', startBeginnerPath);
elements.startLevelOneButton.addEventListener('click', completeBeginnerIntro);
elements.backToLevelsButton.addEventListener('click', showLearningFlow);
elements.showDatabaseInfoButton.addEventListener('click', showDatabaseInfo);

async function init() {
  updateProgressBar();
  setIntroFeedback('sql.js wird geladen …', 'info');
  showDatabaseInfo();
  try {
    SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    updateDatabaseIntroActions();
    setIntroFeedback('Bereit zum Erstellen der Übungsdatenbank.', 'info');
  } catch (error) {
    updateDatabaseIntroActions();
    setIntroFeedback(`sql.js konnte nicht geladen werden: ${error.message}`, 'error');
  }
}

function createPracticeDatabase() {
  if (isDatabaseReady) {
    setIntroFeedback('Die Übungsdatenbank ist bereits erstellt.', 'info');
    updateDatabaseIntroActions();
    return;
  }

  if (!SQL) {
    setIntroFeedback('sql.js ist noch nicht bereit. Bitte warte einen Moment.', 'error');
    return;
  }

  db = new SQL.Database();
  seedDatabase(db);
  isDatabaseReady = true;
  updateDatabaseIntroActions();
  setIntroFeedback('Die Übungsdatenbank wurde erfolgreich erstellt.', 'success');
}

function startLevels() {
  hasLevelSessionStarted = true;
  showLearningFlow();
}

function startBeginnerPath() {
  selectedPath = 'beginner';
  hasLevelSessionStarted = true;
  showLearningFlow();
}

function completeBeginnerIntro() {
  hasBeginnerIntroCompleted = true;
  currentLevelIndex = Math.min(progress.currentLevelIndex || 0, LEVELS.length - 1);
  showLevels();
  setFeedback('Bereit für deine erste Quest!', 'info');
}

function showLearningFlow() {
  if (!isDatabaseReady) {
    setIntroFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    showDatabaseInfo();
    return;
  }

  if (!selectedPath) {
    showPathSelection();
    return;
  }

  if (selectedPath === 'beginner' && !hasBeginnerIntroCompleted) {
    showBeginnerIntro();
    return;
  }

  showLevels();
}

function hideLearningViews() {
  elements.databaseIntro.hidden = true;
  elements.pathSelection.hidden = true;
  elements.beginnerIntro.hidden = true;
  elements.gameLayout.hidden = true;
}

function showPathSelection() {
  hideLearningViews();
  elements.pathSelection.hidden = false;
}

function showBeginnerIntro() {
  hideLearningViews();
  elements.beginnerIntro.hidden = false;
}

function showLevels() {
  if (!isDatabaseReady) {
    setIntroFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    showDatabaseInfo();
    return;
  }

  hideLearningViews();
  elements.gameLayout.hidden = false;
  renderLevelList();
  updateProgressBar();
  loadLevel(currentLevelIndex);
}

function showDatabaseInfo() {
  hideLearningViews();
  elements.databaseIntro.hidden = false;
  updateDatabaseIntroActions();
}

function updateDatabaseIntroActions() {
  elements.createDatabaseButton.hidden = isDatabaseReady;
  elements.createDatabaseButton.disabled = !SQL || isDatabaseReady;
  elements.startLevelsButton.hidden = !isDatabaseReady || hasLevelSessionStarted;
  elements.backToLevelsButton.hidden = !isDatabaseReady || !hasLevelSessionStarted;
}

function loadProgress() {
  const fallback = { score: 0, solvedLevelIds: [], currentLevelIndex: 0, savedQueries: {} };
  try {
    const storedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return {
      ...fallback,
      ...storedProgress,
      solvedLevelIds: Array.isArray(storedProgress.solvedLevelIds) ? storedProgress.solvedLevelIds : [],
      savedQueries: storedProgress.savedQueries || {}
    };
  } catch {
    return fallback;
  }
}

function saveProgress() {
  progress.currentLevelIndex = currentLevelIndex;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function renderLevelList() {
  elements.levelList.innerHTML = '';
  LEVELS.forEach((level, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.classList.toggle('active', index === currentLevelIndex);
    button.classList.toggle('solved', progress.solvedLevelIds.includes(level.id));
    button.innerHTML = `<span>Level ${level.id}</span><strong>${level.title}</strong>`;
    button.addEventListener('click', () => loadLevel(index));
    elements.levelList.append(button);
  });
  elements.score.textContent = progress.score;
  updateProgressBar();
}

function updateProgressBar() {
  const beginnerLevels = LEVELS.filter(level => level.difficulty === 'Anfänger');
  const beginnerLevelIds = new Set(beginnerLevels.map(level => level.id));
  const solvedBeginnerLevelCount = new Set(
    progress.solvedLevelIds.filter(levelId => beginnerLevelIds.has(levelId))
  ).size;
  const totalBeginnerLevelCount = beginnerLevels.length;
  const progressPercent = totalBeginnerLevelCount === 0
    ? 0
    : Math.round((solvedBeginnerLevelCount / totalBeginnerLevelCount) * 100);

  elements.progressText.textContent = `${solvedBeginnerLevelCount} von ${totalBeginnerLevelCount} Leveln gelöst`;
  elements.progressPercent.textContent = `${progressPercent} %`;
  elements.progressFill.style.width = `${progressPercent}%`;
  elements.progressTrack.setAttribute('aria-valuemax', totalBeginnerLevelCount);
  elements.progressTrack.setAttribute('aria-valuenow', solvedBeginnerLevelCount);
}

function loadLevel(index) {
  currentLevelIndex = index;
  const level = LEVELS[currentLevelIndex];
  elements.difficulty.textContent = level.difficulty;
  elements.topic.textContent = level.topic;
  elements.levelTitle.textContent = `Level ${level.id}: ${level.title}`;
  elements.explanation.textContent = level.explanation;
  elements.task.textContent = level.task;
  elements.hintText.textContent = `💡 Tipp: ${level.hint}`;
  elements.hintText.hidden = true;
  elements.solutionBox.textContent = `Lösung: ${level.expectedSql}`;
  elements.solutionBox.hidden = true;
  elements.sqlInput.value = progress.savedQueries[level.id] || '';
  elements.sqlInput.placeholder = 'Schreibe hier deine SQL-Abfrage …';
  elements.resultTable.className = 'table-wrap empty-state';
  elements.resultTable.textContent = 'Noch keine Abfrage ausgeführt.';
  elements.rowCount.textContent = '';
  setFeedback('Führe deine Abfrage aus, um das Level zu lösen.', 'info');
  saveProgress();
  renderLevelList();
}

function runPlayerQuery() {
  if (!db) {
    setFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    return;
  }

  const sql = elements.sqlInput.value.trim();
  if (!sql) {
    setFeedback('Bitte gib zuerst eine SQL-Abfrage ein.', 'error');
    return;
  }

  const blockedCommand = findBlockedCommand(sql);
  if (blockedCommand) {
    setFeedback(`Der Befehl ${blockedCommand} ist in SQL Quest gesperrt. Bitte verwende nur lesende SELECT-Abfragen.`, 'error');
    return;
  }

  try {
    const playerResult = executeSelect(sql);
    const expectedResult = executeSelect(LEVELS[currentLevelIndex].expectedSql);
    renderResult(playerResult);

    if (resultsEqual(playerResult, expectedResult)) {
      markLevelSolved();
    } else {
      setFeedback('Noch nicht richtig. Vergleiche deine Spalten und Zeilen mit der Aufgabe.', 'error');
    }
  } catch (error) {
    setFeedback(`SQL-Fehler: ${error.message}`, 'error');
  }
}

function findBlockedCommand(sql) {
  const normalized = sql.replace(/--.*$/gm, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ');
  return BLOCKED_COMMANDS.find(command => new RegExp(`\\b${command}\\b`, 'i').test(normalized));
}

function executeSelect(sql) {
  const result = db.exec(sql);
  if (result.length === 0) {
    return { columns: [], values: [] };
  }
  return { columns: result[0].columns, values: result[0].values };
}

function resultsEqual(left, right) {
  return JSON.stringify(left.columns) === JSON.stringify(right.columns)
    && JSON.stringify(left.values) === JSON.stringify(right.values);
}

function renderResult(result) {
  elements.resultTable.className = 'table-wrap';
  elements.resultTable.innerHTML = '';
  elements.rowCount.textContent = `${result.values.length} Zeile(n)`;

  if (result.columns.length === 0) {
    elements.resultTable.classList.add('empty-state');
    elements.resultTable.textContent = 'Die Abfrage hat keine Tabelle zurückgegeben.';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');

  result.columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.append(th);
  });

  result.values.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    });
    tbody.append(tr);
  });

  thead.append(headerRow);
  table.append(thead, tbody);
  elements.resultTable.append(table);
}

function markLevelSolved() {
  const level = LEVELS[currentLevelIndex];
  const sql = elements.sqlInput.value.trim();
  progress.savedQueries[level.id] = sql;
  if (!progress.solvedLevelIds.includes(level.id)) {
    progress.solvedLevelIds.push(level.id);
    progress.score += level.points;
  }
  saveProgress();
  renderLevelList();
  setFeedback(`Richtig! Level gelöst und ${level.points} Punkte gesammelt.`, 'success');
}

function showHint() {
  elements.hintText.hidden = false;
  setFeedback('Der Hinweis ist jetzt sichtbar.', 'info');
}

function showSolution() {
  elements.solutionBox.hidden = false;
  setFeedback('Die Musterlösung ist jetzt sichtbar. Führe sie aus, wenn du das Level lösen möchtest.', 'info');
}

function goToNextLevel() {
  const nextIndex = (currentLevelIndex + 1) % LEVELS.length;
  loadLevel(nextIndex);
}

function resetProgress() {
  progress = { score: 0, solvedLevelIds: [], currentLevelIndex: 0, savedQueries: {} };
  saveProgress();
  loadLevel(0);
}

function setFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`;
}

function setIntroFeedback(message, type) {
  elements.introFeedback.textContent = message;
  elements.introFeedback.className = `feedback ${type}`;
}

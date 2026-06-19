const STORAGE_KEY = 'sqlQuestProgress';
const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];

const elements = {
  score: document.querySelector('#score'),
  levelList: document.querySelector('#levelList'),
  difficulty: document.querySelector('#difficulty'),
  topic: document.querySelector('#topic'),
  levelTitle: document.querySelector('#levelTitle'),
  explanation: document.querySelector('#explanation'),
  task: document.querySelector('#task'),
  hintText: document.querySelector('#hintText'),
  sqlInput: document.querySelector('#sqlInput'),
  runButton: document.querySelector('#runButton'),
  hintButton: document.querySelector('#hintButton'),
  nextButton: document.querySelector('#nextButton'),
  feedback: document.querySelector('#feedback'),
  resultTable: document.querySelector('#resultTable'),
  rowCount: document.querySelector('#rowCount'),
  resetProgressButton: document.querySelector('#resetProgressButton')
};

let db;
let currentLevelIndex = 0;
let progress = loadProgress();

window.addEventListener('DOMContentLoaded', init);
elements.runButton.addEventListener('click', runPlayerQuery);
elements.hintButton.addEventListener('click', showHint);
elements.nextButton.addEventListener('click', goToNextLevel);
elements.resetProgressButton.addEventListener('click', resetProgress);

async function init() {
  setFeedback('Datenbank wird geladen …', 'info');
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    db = new SQL.Database();
    seedDatabase();
    currentLevelIndex = Math.min(progress.currentLevelIndex || 0, LEVELS.length - 1);
    renderLevelList();
    loadLevel(currentLevelIndex);
    setFeedback('Bereit für deine erste Quest!', 'info');
  } catch (error) {
    setFeedback(`Die Datenbank konnte nicht geladen werden: ${error.message}`, 'error');
  }
}

function seedDatabase() {
  db.run(`
    CREATE TABLE kunden (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      stadt TEXT NOT NULL,
      alter_jahre INTEGER NOT NULL,
      punkte INTEGER NOT NULL
    );

    INSERT INTO kunden (id, name, stadt, alter_jahre, punkte) VALUES
    (1, 'Anna', 'Berlin', 24, 120),
    (2, 'Ben', 'Hamburg', 31, 80),
    (3, 'Clara', 'Berlin', 29, 200),
    (4, 'David', 'München', 42, 150),
    (5, 'Emma', 'Köln', 35, 90);
  `);
}

function loadProgress() {
  const fallback = { score: 0, solvedLevelIds: [], currentLevelIndex: 0 };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
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
}

function loadLevel(index) {
  currentLevelIndex = index;
  const level = LEVELS[currentLevelIndex];
  elements.difficulty.textContent = level.difficulty;
  elements.topic.textContent = level.topic;
  elements.levelTitle.textContent = `Level ${level.id}: ${level.title}`;
  elements.explanation.textContent = level.explanation;
  elements.task.textContent = level.task;
  elements.hintText.textContent = `Hinweis: ${level.hint}`;
  elements.hintText.hidden = true;
  elements.sqlInput.value = level.starterSql;
  elements.resultTable.className = 'table-wrap empty-state';
  elements.resultTable.textContent = 'Noch keine Abfrage ausgeführt.';
  elements.rowCount.textContent = '';
  setFeedback('Führe deine Abfrage aus, um das Level zu lösen.', 'info');
  saveProgress();
  renderLevelList();
}

function runPlayerQuery() {
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

function goToNextLevel() {
  const nextIndex = (currentLevelIndex + 1) % LEVELS.length;
  loadLevel(nextIndex);
}

function resetProgress() {
  progress = { score: 0, solvedLevelIds: [], currentLevelIndex: 0 };
  saveProgress();
  loadLevel(0);
}

function setFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`;
}

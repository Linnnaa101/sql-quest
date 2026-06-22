const STORAGE_KEY = 'sqlQuestProgress';
const STAR_SYSTEM_VERSION = 3;
const MAX_STARS = 3;
const MIN_STARS_TO_UNLOCK_NEXT_LEVEL = 2;
const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];


const LEARNED_SQL_STAGES = [
  {
    unlockLevelId: 5,
    title: 'Nach Level 5',
    lockedPreview: 'SELECT, FROM und * werden nach Level 5 freigeschaltet.',
    items: [
      {
        term: 'SELECT',
        description: 'Legt fest, welche Daten angezeigt werden.',
        example: `SELECT name
FROM kunden;`,
        exampleExplanation: 'Zeigt die Namen aller Kunden aus der Tabelle kunden.'
      },
      {
        term: 'FROM',
        description: 'Legt fest, aus welcher Tabelle Daten gelesen werden.',
        example: `SELECT *
FROM kunden;`,
        exampleExplanation: 'Liest Daten aus der Tabelle kunden.'
      },
      {
        term: '*',
        description: 'Das Sternchen steht für alle Spalten.',
        example: `SELECT *
FROM kunden;`,
        exampleExplanation: 'Zeigt alle Spalten und alle Kunden an.'
      }
    ]
  },
  {
    unlockLevelId: 10,
    title: 'Nach Level 10',
    lockedPreview: 'Einzelne Spalten und WHERE werden nach Level 10 freigeschaltet.',
    items: [
      {
        term: 'Einzelne Spalten auswählen',
        description: 'Legt fest, dass nur bestimmte Spalten angezeigt werden.',
        example: `SELECT name, stadt
FROM kunden;`,
        exampleExplanation: 'Zeigt nur die Spalten name und stadt.'
      },
      {
        term: 'WHERE',
        description: 'Filtert Datensätze mit einer Bedingung.',
        example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin';`,
        exampleExplanation: 'Zeigt nur Kunden aus Berlin.'
      }
    ]
  },
  {
    unlockLevelId: 15,
    title: 'Nach Level 15',
    lockedPreview: 'ORDER BY und LIMIT werden nach Level 15 freigeschaltet.',
    items: [
      {
        term: 'ORDER BY',
        description: 'Sortiert Ergebnisse nach einer oder mehreren Spalten.',
        example: `SELECT *
FROM kunden
ORDER BY punkte DESC;`,
        exampleExplanation: 'Sortiert Kunden nach Punkten, mit den höchsten Punkten zuerst.'
      },
      {
        term: 'LIMIT',
        description: 'Begrenzt, wie viele Ergebnisse angezeigt werden.',
        example: `SELECT *
FROM kunden
LIMIT 3;`,
        exampleExplanation: 'Zeigt nur die ersten drei Ergebnisse.'
      }
    ]
  },
  {
    unlockLevelId: 20,
    title: 'Nach Level 20',
    lockedPreview: 'Vergleichsoperatoren, AND und OR werden nach Level 20 freigeschaltet.',
    items: [
      {
        term: 'Vergleichsoperatoren',
        description: 'Vergleichen Werte in einer Bedingung.',
        example: `SELECT *
FROM kunden
WHERE punkte >= 100;`,
        exampleExplanation: 'Zeigt Kunden mit mindestens 100 Punkten.',
        details: ['= gleich', '> größer als', '< kleiner als', '>= größer oder gleich', '<= kleiner oder gleich']
      },
      {
        term: 'AND',
        description: 'Verknüpft Bedingungen, bei denen alle Bedingungen erfüllt sein müssen.',
        example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin' AND punkte > 100;`,
        exampleExplanation: 'Beide Bedingungen müssen erfüllt sein.'
      },
      {
        term: 'OR',
        description: 'Verknüpft Bedingungen, bei denen mindestens eine Bedingung erfüllt sein muss.',
        example: `SELECT *
FROM kunden
WHERE stadt = 'Berlin' OR stadt = 'Hamburg';`,
        exampleExplanation: 'Mindestens eine Bedingung muss erfüllt sein.'
      }
    ]
  },
  {
    unlockLevelId: 25,
    title: 'Nach Level 25',
    lockedPreview: 'COUNT, SUM, AVG sowie MIN und MAX werden nach Level 25 freigeschaltet.',
    items: [
      {
        term: 'COUNT',
        description: 'Zählt Datensätze oder Werte.',
        example: `SELECT COUNT(*)
FROM kunden;`,
        exampleExplanation: 'Zählt alle Kunden.'
      },
      {
        term: 'SUM',
        description: 'Addiert Zahlenwerte einer Spalte.',
        example: `SELECT SUM(punkte)
FROM kunden;`,
        exampleExplanation: 'Addiert alle Punkte.'
      },
      {
        term: 'AVG',
        description: 'Berechnet den Durchschnitt einer Zahlenspalte.',
        example: `SELECT AVG(punkte)
FROM kunden;`,
        exampleExplanation: 'Berechnet den durchschnittlichen Punktestand.'
      },
      {
        term: 'MIN und MAX',
        description: 'Ermitteln den kleinsten und den größten Wert einer Spalte.',
        example: `SELECT MIN(punkte), MAX(punkte)
FROM kunden;`,
        exampleExplanation: 'Ermittelt den kleinsten und größten Punktestand.'
      }
    ]
  },
  {
    unlockLevelId: 30,
    title: 'Nach Level 30',
    lockedPreview: 'GROUP BY, HAVING und Gruppenauswertungen werden nach Level 30 freigeschaltet.',
    items: [
      {
        term: 'GROUP BY',
        description: 'Fasst Zeilen mit gleichen Werten zu Gruppen zusammen.',
        example: `SELECT stadt, COUNT(*)
FROM kunden
GROUP BY stadt;`,
        exampleExplanation: 'Gruppiert Kunden nach Stadt und zählt die Kunden je Stadt.'
      },
      {
        term: 'HAVING',
        description: 'Filtert Gruppen nach dem Gruppieren.',
        example: `SELECT stadt, COUNT(*)
FROM kunden
GROUP BY stadt
HAVING COUNT(*) > 1;`,
        exampleExplanation: 'Zeigt nur Städte mit mehr als einem Kunden.'
      },
      {
        term: 'Gruppen sortieren und begrenzen',
        description: 'Kombiniert Gruppieren, Sortieren und Begrenzen für gezielte Auswertungen.',
        example: `SELECT stadt, SUM(punkte)
FROM kunden
GROUP BY stadt
ORDER BY SUM(punkte) DESC
LIMIT 1;`,
        exampleExplanation: 'Zeigt die Stadt mit der höchsten Gesamtpunktzahl.'
      }
    ]
  }
];

const SQL_BASICS_CHAPTERS = [
  {
    title: 'SELECT und FROM',
    unlockLevelId: 0,
    content: [
      'Mit SELECT wählst du aus, welche Daten du sehen möchtest.',
      'Mit FROM gibst du an, aus welcher Tabelle die Daten kommen.'
    ],
    examples: ['SELECT * FROM kunden;']
  },
  {
    title: 'Spalten und WHERE',
    unlockLevelId: 5,
    content: [
      'Du kannst einzelne Spalten auswählen, indem du ihre Namen nach SELECT schreibst.',
      'WHERE filtert einzelne Zeilen nach einer Bedingung.'
    ],
    examples: ["SELECT name FROM kunden;", "SELECT * FROM kunden WHERE stadt = 'Berlin';"]
  },
  {
    title: 'Sortieren und Begrenzen',
    unlockLevelId: 10,
    content: [
      'ORDER BY sortiert Ergebnisse aufsteigend oder absteigend.',
      'LIMIT begrenzt, wie viele Zeilen angezeigt werden.'
    ],
    examples: ['SELECT * FROM kunden ORDER BY punkte DESC;', 'SELECT * FROM kunden LIMIT 3;']
  },
  {
    title: 'Vergleichen und Verknüpfen',
    unlockLevelId: 15,
    content: [
      'Mit Vergleichsoperatoren wie >, <, >= und <= prüfst du Zahlenwerte.',
      'AND und OR verbinden mehrere Bedingungen.'
    ],
    examples: ["SELECT * FROM kunden WHERE stadt = 'Berlin' AND punkte > 100;"]
  },
  {
    title: 'Einfache Auswertungen',
    unlockLevelId: 20,
    content: [
      'COUNT zählt Zeilen, SUM addiert Zahlenwerte und AVG berechnet Durchschnittswerte.',
      'MIN und MAX finden den kleinsten oder größten Wert einer Spalte.'
    ],
    examples: ['SELECT COUNT(*) FROM kunden;', 'SELECT AVG(punkte) FROM kunden;']
  },
  {
    title: 'Gruppieren und Auswerten',
    unlockLevelId: 25,
    content: [
      'Mit GROUP BY kannst du gleiche Werte zu Gruppen zusammenfassen.',
      'Zum Beispiel kannst du Kunden nach ihrer Stadt gruppieren.',
      'Mit COUNT, SUM oder AVG kannst du jede Gruppe auswerten.',
      'HAVING filtert Gruppen nach dem Gruppieren.'
    ],
    examples: [
      'SELECT stadt, COUNT(*)\nFROM kunden\nGROUP BY stadt;',
      'SELECT stadt, COUNT(*)\nFROM kunden\nGROUP BY stadt\nHAVING COUNT(*) > 1;'
    ]
  }
];

const elements = {
  score: document.querySelector('#score'),
  levelList: document.querySelector('#levelList'),
  progressText: document.querySelector('#progressText'),
  progressTrack: document.querySelector('#progressTrack'),
  progressFill: document.querySelector('#progressFill'),
  progressPercent: document.querySelector('#progressPercent'),
  sqlBasicsList: document.querySelector('#sqlBasicsList'),
  sqlBasicsProgress: document.querySelector('#sqlBasicsProgress'),
  learnedSqlList: document.querySelector('#learnedSqlList'),
  learnedSqlProgress: document.querySelector('#learnedSqlProgress'),
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
  overviewButton: document.querySelector('#overviewButton'),
  backToOverviewButton: document.querySelector('#backToOverviewButton'),
  levelOverview: document.querySelector('#levelOverview'),
  showDatabaseInfoInGameButton: document.querySelector('#showDatabaseInfoInGameButton'),
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
  introFeedback: document.querySelector('#introFeedback'),
  overviewFeedback: document.querySelector('#overviewFeedback'),
  successModalOverlay: document.querySelector('#successModalOverlay'),
  successModal: document.querySelector('#successModal'),
  successModalCloseButton: document.querySelector('#successModalCloseButton'),
  successModalStars: document.querySelector('#successModalStars'),
  successModalStarText: document.querySelector('#successModalStarText'),
  successModalBest: document.querySelector('#successModalBest'),
  successModalMessage: document.querySelector('#successModalMessage'),
  successModalCompletion: document.querySelector('#successModalCompletion'),
  successModalActions: document.querySelector('#successModalActions')
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
elements.overviewButton.addEventListener('click', showLevelOverview);
elements.backToOverviewButton.addEventListener('click', showLevelOverview);
elements.resetProgressButton.addEventListener('click', resetProgress);
elements.createDatabaseButton.addEventListener('click', createPracticeDatabase);
elements.startLevelsButton.addEventListener('click', startLevels);
elements.startBeginnerPathButton.addEventListener('click', startBeginnerPath);
elements.startLevelOneButton.addEventListener('click', completeBeginnerIntro);
elements.backToLevelsButton.addEventListener('click', showLearningFlow);
elements.showDatabaseInfoButton.addEventListener('click', showDatabaseInfo);
elements.showDatabaseInfoInGameButton.addEventListener('click', showDatabaseInfo);
elements.successModalCloseButton.addEventListener('click', closeSuccessModalToOverview);
elements.successModal.addEventListener('keydown', handleSuccessModalKeydown);

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
  if (!isLevelUnlocked(currentLevelIndex)) {
    currentLevelIndex = 0;
  }
  showLevelOverview();
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

  showLevelOverview();
}

function hideLearningViews() {
  elements.databaseIntro.hidden = true;
  elements.pathSelection.hidden = true;
  elements.beginnerIntro.hidden = true;
  elements.gameLayout.hidden = true;
  elements.levelOverview.hidden = true;
}

function showPathSelection() {
  hideLearningViews();
  elements.pathSelection.hidden = false;
}

function showBeginnerIntro() {
  hideLearningViews();
  elements.beginnerIntro.hidden = false;
}

function showLevelOverview() {
  if (!isDatabaseReady) {
    setIntroFeedback('Bitte erstelle zuerst die Übungsdatenbank.', 'error');
    showDatabaseInfo();
    return;
  }

  hideSuccessModal();
  hideLearningViews();
  elements.levelOverview.hidden = false;
  renderLevelList();
  renderSqlBasicsChapters();
  updateProgressBar();
}

function showDatabaseInfo() {
  hideSuccessModal();
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

function createEmptyProgress() {
  return {
    score: 0,
    solvedLevelIds: [],
    currentLevelIndex: 0,
    savedQueries: {},
    levelStars: {},
    levelAttempts: {},
    solutionViewedLevelIds: [],
    starSystemVersion: STAR_SYSTEM_VERSION
  };
}

function loadProgress() {
  const fallback = createEmptyProgress();
  try {
    const rawProgress = localStorage.getItem(STORAGE_KEY);
    if (!rawProgress) {
      return fallback;
    }

    const storedProgress = JSON.parse(rawProgress) || {};
    const migratedProgress = migrateProgressToCurrentStarSystem(storedProgress);
    const normalizedProgress = {
      ...fallback,
      ...migratedProgress,
      score: Number.isFinite(migratedProgress.score) ? migratedProgress.score : fallback.score,
      currentLevelIndex: Number.isInteger(migratedProgress.currentLevelIndex) ? migratedProgress.currentLevelIndex : fallback.currentLevelIndex,
      solvedLevelIds: Array.isArray(migratedProgress.solvedLevelIds) ? migratedProgress.solvedLevelIds : [],
      savedQueries: migratedProgress.savedQueries && typeof migratedProgress.savedQueries === 'object' ? migratedProgress.savedQueries : {},
      levelStars: migratedProgress.levelStars && typeof migratedProgress.levelStars === 'object' ? migratedProgress.levelStars : {},
      levelAttempts: migratedProgress.levelAttempts && typeof migratedProgress.levelAttempts === 'object' ? migratedProgress.levelAttempts : {},
      solutionViewedLevelIds: Array.isArray(migratedProgress.solutionViewedLevelIds) ? migratedProgress.solutionViewedLevelIds : [],
      starSystemVersion: STAR_SYSTEM_VERSION
    };

    if (storedProgress.starSystemVersion !== STAR_SYSTEM_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProgress));
    }

    return normalizedProgress;
  } catch {
    return fallback;
  }
}

function migrateProgressToCurrentStarSystem(storedProgress) {
  if (storedProgress.starSystemVersion === STAR_SYSTEM_VERSION) {
    return storedProgress;
  }

  const migratedLevelStars = {};
  const oldLevelStars = storedProgress.levelStars && typeof storedProgress.levelStars === 'object'
    ? storedProgress.levelStars
    : {};

  Object.entries(oldLevelStars).forEach(([levelId, oldStars]) => {
    migratedLevelStars[levelId] = migrateLegacyStars(oldStars);
  });

  return {
    ...storedProgress,
    levelStars: migratedLevelStars,
    starSystemVersion: STAR_SYSTEM_VERSION
  };
}

function migrateLegacyStars(oldStars) {
  const stars = Number(oldStars) || 0;
  if (stars >= 5) {
    return 3;
  }
  if (stars === 4) {
    return 2;
  }
  if (stars === 3) {
    return 1;
  }
  return 0;
}

function saveProgress() {
  progress.currentLevelIndex = currentLevelIndex;
  progress.starSystemVersion = STAR_SYSTEM_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function renderLevelList() {
  elements.levelList.innerHTML = '';
  LEVELS.forEach((level, index) => {
    const unlocked = isLevelUnlocked(index);
    const stars = getLevelStars(level.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.classList.toggle('active', index === currentLevelIndex);
    button.classList.toggle('solved', progress.solvedLevelIds.includes(level.id));
    button.classList.toggle('locked', !unlocked);
    button.setAttribute('aria-disabled', String(!unlocked));
    button.setAttribute('aria-label', getLevelButtonLabel(level, index, unlocked, stars));
    button.innerHTML = `
      <span class="level-button-topline">
        <span data-level-number="${level.id}">Level ${level.id}</span>
        <span class="level-stars" aria-hidden="true">${unlocked ? renderStars(stars) : '🔒'}</span>
      </span>
      <strong>${level.title}</strong>
    `;
    button.addEventListener('click', () => {
      if (!isLevelUnlocked(index)) {
        setOverviewFeedback('Erreiche mindestens 2 Sterne im vorherigen Level, um dieses Level freizuschalten.', 'info');
        return;
      }
      loadLevel(index);
    });
    elements.levelList.append(button);
  });
  elements.score.textContent = progress.score;
  renderSqlBasicsChapters();
  updateProgressBar();
}


function getHighestSolvedLevelId() {
  const validLevelIds = new Set(LEVELS.map(level => Number(level.id)));
  return progress.solvedLevelIds.reduce((highestLevelId, solvedLevelId) => {
    const numericLevelId = Number(solvedLevelId);
    if (!Number.isFinite(numericLevelId) || !validLevelIds.has(numericLevelId)) {
      return highestLevelId;
    }
    return Math.max(highestLevelId, numericLevelId);
  }, 0);
}

function getUnlockedLearnedSqlStages() {
  const highestSolvedLevelId = getHighestSolvedLevelId();
  return LEARNED_SQL_STAGES.filter(stage => highestSolvedLevelId >= stage.unlockLevelId);
}

function createLearnedSqlCard(item) {
  const card = document.createElement('article');
  card.className = 'learned-sql-item';

  const title = document.createElement('h4');
  title.textContent = item.term;
  card.append(title);

  const description = document.createElement('p');
  description.textContent = item.description;
  card.append(description);

  if (item.details?.length) {
    const details = document.createElement('ul');
    details.className = 'learned-sql-details';
    item.details.forEach(detail => {
      const detailItem = document.createElement('li');
      detailItem.textContent = detail;
      details.append(detailItem);
    });
    card.append(details);
  }

  const exampleLabel = document.createElement('p');
  exampleLabel.className = 'learned-sql-example-label';
  exampleLabel.textContent = 'Beispielabfrage';
  card.append(exampleLabel);

  const example = document.createElement('pre');
  example.className = 'sql-example learned-sql-example';
  const code = document.createElement('code');
  code.textContent = item.example;
  example.append(code);
  card.append(example);

  const exampleExplanation = document.createElement('p');
  exampleExplanation.className = 'muted small';
  exampleExplanation.textContent = item.exampleExplanation;
  card.append(exampleExplanation);

  return card;
}

function renderLearnedSqlBlocks() {
  if (!elements.learnedSqlList || !elements.learnedSqlProgress) {
    return;
  }

  const unlockedStages = getUnlockedLearnedSqlStages();
  const unlockedStageCount = unlockedStages.length;

  elements.learnedSqlProgress.textContent = `Stufe ${unlockedStageCount} von ${LEARNED_SQL_STAGES.length}`;
  elements.learnedSqlList.innerHTML = '';

  if (unlockedStageCount === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'muted small';
    emptyMessage.textContent = 'Löse Level 5, um deine ersten SQL-Bausteine freizuschalten.';
    elements.learnedSqlList.append(emptyMessage);
  }

  LEARNED_SQL_STAGES.forEach(stage => {
    const isUnlocked = unlockedStages.includes(stage);
    const stageSection = document.createElement('section');
    stageSection.className = `learned-sql-stage${isUnlocked ? '' : ' locked'}`;

    const stageTitle = document.createElement('h3');
    stageTitle.textContent = stage.title;
    stageSection.append(stageTitle);

    if (isUnlocked) {
      const itemGrid = document.createElement('div');
      itemGrid.className = 'learned-sql-stage-grid';
      stage.items.forEach(item => itemGrid.append(createLearnedSqlCard(item)));
      stageSection.append(itemGrid);
    } else {
      const lockedMessage = document.createElement('p');
      lockedMessage.className = 'muted small';
      lockedMessage.textContent = stage.lockedPreview;
      stageSection.append(lockedMessage);
    }

    elements.learnedSqlList.append(stageSection);
  });
}

function renderSqlBasicsChapters() {
  if (!elements.sqlBasicsList || !elements.sqlBasicsProgress) {
    return;
  }

  elements.sqlBasicsList.innerHTML = '';
  const unlockedChapterCount = SQL_BASICS_CHAPTERS.filter(chapter => isSqlBasicsChapterUnlocked(chapter)).length;
  elements.sqlBasicsProgress.textContent = `Kapitel ${unlockedChapterCount} von ${SQL_BASICS_CHAPTERS.length} freigeschaltet`;

  SQL_BASICS_CHAPTERS.forEach((chapter, index) => {
    const isUnlocked = isSqlBasicsChapterUnlocked(chapter);
    const article = document.createElement('article');
    article.className = 'sql-basics-chapter';
    article.classList.toggle('locked', !isUnlocked);

    if (isUnlocked) {
      const paragraphs = chapter.content.map(text => `<p>${text}</p>`).join('');
      const examples = chapter.examples.map(example => `<pre class="sql-example"><code>${example}</code></pre>`).join('');
      article.innerHTML = `
        <div class="level-button-topline">
          <span>Kapitel ${index + 1}</span>
          <span aria-hidden="true">📖</span>
        </div>
        <h3>${chapter.title}</h3>
        ${paragraphs}
        ${examples}
      `;
    } else {
      article.innerHTML = `
        <div class="level-button-topline">
          <span>Kapitel ${index + 1}</span>
          <span aria-hidden="true">🔒</span>
        </div>
        <h3>${chapter.title}</h3>
        <p class="muted">Dieses Kapitel wird freigeschaltet, sobald Level ${chapter.unlockLevelId} gelöst wurde.</p>
      `;
    }

    elements.sqlBasicsList.append(article);
  });
}

function isSqlBasicsChapterUnlocked(chapter) {
  return chapter.unlockLevelId === 0 || progress.solvedLevelIds.includes(chapter.unlockLevelId);
}

function getLevelButtonLabel(level, index, unlocked, stars) {
  const status = unlocked ? 'freigeschaltet' : 'gesperrt';
  const starText = unlocked ? `${stars} von ${MAX_STARS} Sternen` : 'Freischaltung benötigt mindestens 2 Sterne im vorherigen Level';
  return `Level ${level.id}: ${level.title}, ${status}, ${starText}`;
}

function renderStars(stars) {
  return `${'★'.repeat(stars)}${'☆'.repeat(MAX_STARS - stars)}`;
}

function getLevelStars(levelId) {
  return Math.max(0, Math.min(MAX_STARS, Number(progress.levelStars[levelId]) || 0));
}

function isLevelUnlocked(levelIndex) {
  if (levelIndex === 0) {
    return true;
  }
  const previousLevel = LEVELS[levelIndex - 1];
  return getLevelStars(previousLevel.id) >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
}

function updateProgressBar() {
  const beginnerLevels = LEVELS.filter(level => level.difficulty === 'Anfänger');
  const beginnerLevelIds = new Set(beginnerLevels.map(level => level.id));
  const solvedBeginnerLevelCount = new Set(
    progress.solvedLevelIds.filter(levelId => beginnerLevelIds.has(levelId))
  ).size;
  const unlockedBeginnerLevelCount = beginnerLevels.filter(level => isLevelUnlocked(LEVELS.indexOf(level))).length;
  const consideredBeginnerLevelCount = Math.max(unlockedBeginnerLevelCount, solvedBeginnerLevelCount);
  const totalBeginnerLevelCount = beginnerLevels.length;
  const progressPercent = totalBeginnerLevelCount === 0
    ? 0
    : Math.round((consideredBeginnerLevelCount / totalBeginnerLevelCount) * 100);
  const collectedStars = beginnerLevels.reduce((sum, level) => sum + getLevelStars(level.id), 0);
  const maxStars = beginnerLevels.length * MAX_STARS;

  elements.progressText.textContent = `${solvedBeginnerLevelCount} von ${totalBeginnerLevelCount} Leveln gelöst`;
  elements.progressPercent.textContent = `${progressPercent} % · ${collectedStars} von ${maxStars} Sternen gesammelt`;
  elements.progressFill.style.width = `${progressPercent}%`;
  elements.progressTrack.setAttribute('aria-valuemax', totalBeginnerLevelCount);
  elements.progressTrack.setAttribute('aria-valuenow', consideredBeginnerLevelCount);
}

function loadLevel(index) {
  hideSuccessModal();
  if (!isLevelUnlocked(index)) {
    setFeedback('Erreiche mindestens 2 Sterne im vorherigen Level, um dieses Level freizuschalten.', 'info');
    renderLevelList();
    return;
  }

  hideLearningViews();
  elements.gameLayout.hidden = false;
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
  progress.levelAttempts[level.id] = 0;
  elements.sqlInput.value = progress.savedQueries[level.id] || '';
  elements.sqlInput.placeholder = 'Schreibe hier deine SQL-Abfrage …';
  elements.resultTable.className = 'table-wrap empty-state';
  elements.resultTable.textContent = 'Noch keine Abfrage ausgeführt.';
  elements.rowCount.textContent = '';
  setFeedback('Führe deine Abfrage aus, um das Level zu lösen.', 'info');
  saveProgress();
  renderLevelList();
  renderLearnedSqlBlocks();
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
      countFailedAttempt(LEVELS[currentLevelIndex].id);
      setFeedback('Noch nicht richtig. Vergleiche deine Spalten und Zeilen mit der Aufgabe.', 'error');
    }
  } catch (error) {
    countFailedAttempt(LEVELS[currentLevelIndex].id);
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

function countFailedAttempt(levelId) {
  progress.levelAttempts[levelId] = (Number(progress.levelAttempts[levelId]) || 0) + 1;
  saveProgress();
}

function calculateStars(levelId) {
  const failedAttempts = Number(progress.levelAttempts[levelId]) || 0;
  const solutionViewed = progress.solutionViewedLevelIds.includes(levelId);

  if (solutionViewed || failedAttempts >= 3) {
    return 1;
  }
  if (failedAttempts >= 1) {
    return 2;
  }
  return 3;
}

function markLevelSolved() {
  const level = LEVELS[currentLevelIndex];
  const sql = elements.sqlInput.value.trim();
  const earnedStars = calculateStars(level.id);
  const previousStars = getLevelStars(level.id);
  const bestStars = Math.max(previousStars, earnedStars);
  const isNewBest = bestStars > previousStars;

  progress.savedQueries[level.id] = sql;
  progress.levelStars[level.id] = bestStars;
  progress.solutionViewedLevelIds = progress.solutionViewedLevelIds.filter(levelId => levelId !== level.id);
  if (!progress.solvedLevelIds.includes(level.id)) {
    progress.solvedLevelIds.push(level.id);
    progress.score += level.points;
  }
  saveProgress();
  renderLevelList();
  renderLearnedSqlBlocks();

  const bestMessage = isNewBest ? ` Neue Bestleistung: ${bestStars} von ${MAX_STARS} Sternen!` : '';
  setFeedback(`Richtig gelöst! Du hast ${earnedStars} von ${MAX_STARS} Sternen erreicht.${bestMessage}`, 'success');
  showSuccessModal({ earnedStars, bestStars, isNewBest });
}

function showSuccessModal({ earnedStars, bestStars, isNewBest }) {
  const level = LEVELS[currentLevelIndex];
  const isFinalLevel = currentLevelIndex === LEVELS.length - 1;
  const hasBestStarsForUnlock = bestStars >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
  const canOfferNextLevel = hasBestStarsForUnlock && !isFinalLevel;
  const nextLevelIsUnlocked = canOfferNextLevel && isLevelUnlocked(currentLevelIndex + 1);

  elements.successModalStars.textContent = '★'.repeat(earnedStars) + '☆'.repeat(MAX_STARS - earnedStars);
  elements.successModalStarText.textContent = `${earnedStars} von ${MAX_STARS} Sternen`;
  elements.successModalBest.hidden = !isNewBest;
  elements.successModalMessage.textContent = getSuccessMessage(earnedStars);
  elements.successModalCompletion.hidden = !(isFinalLevel && hasBestStarsForUnlock);
  elements.successModalActions.innerHTML = '';

  if (hasBestStarsForUnlock) {
    if (isFinalLevel) {
      addSuccessModalButton('Zur Levelübersicht', 'primary-button', showLevelOverview);
      addSuccessModalButton(`Level ${level.id} wiederholen`, 'secondary-button', () => loadLevel(currentLevelIndex));
    } else {
      addSuccessModalButton('Nächstes Level', 'primary-button', () => {
        if (nextLevelIsUnlocked) {
          loadLevel(currentLevelIndex + 1);
        } else {
          showLevelOverview();
          setOverviewFeedback('Das nächste Level ist noch nicht freigeschaltet. Erreiche mindestens 2 Sterne im vorherigen Level.', 'info');
        }
      });
      addSuccessModalButton('Zur Levelübersicht', 'secondary-button', showLevelOverview);
    }
  } else {
    addSuccessModalButton('Level wiederholen', 'primary-button', () => loadLevel(currentLevelIndex));
    addSuccessModalButton('Zur Levelübersicht', 'secondary-button', showLevelOverview);
  }

  elements.successModalOverlay.hidden = false;
  document.body.classList.add('modal-open');
  const firstActionButton = elements.successModalActions.querySelector('button');
  (firstActionButton || elements.successModalCloseButton).focus();
}

function getSuccessMessage(earnedStars) {
  if (earnedStars === MAX_STARS) {
    return 'Perfekt gelöst – ohne Fehlversuch.';
  }
  if (earnedStars === MIN_STARS_TO_UNLOCK_NEXT_LEVEL) {
    return 'Gut geschafft! Das nächste Level ist freigeschaltet.';
  }
  return 'Du hast das Level bestanden. Wiederhole es später, um mehr Sterne zu erreichen.';
}

function addSuccessModalButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  elements.successModalActions.append(button);
}

function closeSuccessModalToOverview() {
  showLevelOverview();
}

function hideSuccessModal() {
  if (elements.successModalOverlay.hidden) {
    return;
  }
  elements.successModalOverlay.hidden = true;
  document.body.classList.remove('modal-open');
}

function handleSuccessModalKeydown(event) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = Array.from(elements.successModal.querySelectorAll('button:not([disabled])'));
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstFocusableElement) {
    event.preventDefault();
    lastFocusableElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
    event.preventDefault();
    firstFocusableElement.focus();
  }
}

function showHint() {
  elements.hintText.hidden = false;
  setFeedback('Der Hinweis ist jetzt sichtbar.', 'info');
}

function showSolution() {
  const level = LEVELS[currentLevelIndex];
  elements.solutionBox.hidden = false;
  if (!progress.solutionViewedLevelIds.includes(level.id)) {
    progress.solutionViewedLevelIds.push(level.id);
    saveProgress();
  }
  setFeedback('Die Musterlösung ist jetzt sichtbar. Führe sie aus, wenn du das Level lösen möchtest.', 'info');
}

function resetProgress() {
  progress = createEmptyProgress();
  saveProgress();
  currentLevelIndex = 0;
  elements.score.textContent = progress.score;
  showLevelOverview();
}

function setFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`;
}

function setOverviewFeedback(message, type) {
  elements.overviewFeedback.textContent = message;
  elements.overviewFeedback.className = `feedback ${type}`;
}

function setIntroFeedback(message, type) {
  elements.introFeedback.textContent = message;
  elements.introFeedback.className = `feedback ${type}`;
}

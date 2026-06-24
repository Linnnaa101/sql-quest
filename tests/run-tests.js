const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const logic = require('../quest-logic');
const levelsCode = fs.readFileSync('levels.js', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(`${levelsCode}\nthis.LEVELS = LEVELS;`, context);
const { LEVELS } = context;
const emptyProgress = () => ({ solvedLevelIds: [], levelStars: {} });
const indexOf = id => LEVELS.findIndex(level => level.id === id);

assert.equal(LEVELS.length, 80, 'Es gibt genau 80 Level.');
assert.deepEqual(Array.from(LEVELS, level => level.id), Array.from({ length: 80 }, (_, index) => index + 1), 'Level-IDs 1 bis 80 sind vollständig.');
assert.deepEqual(Array.from(LEVELS.filter(level => level.difficulty === 'Meister'), level => level.id), Array.from({ length: 20 }, (_, index) => index + 61), 'Meister-Level sind 61 bis 80.');
const level80 = LEVELS.find(level => level.id === 80);
assert.ok(level80?.task && level80?.hint && level80?.expectedSql, 'Level 80 besitzt Aufgabe, Hinweise und Lösung.');

assert.equal(logic.isLevelUnlocked(LEVELS, emptyProgress(), 0), true, 'Level 1 ist erreichbar.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [30], levelStars: {} }, indexOf(31)), true, 'Level 31 nach Level 30.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [40], levelStars: {} }, indexOf(41)), true, 'Level 41 nach Level 40.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [50], levelStars: {} }, indexOf(51)), true, 'Level 51 nach Level 50.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [60], levelStars: {} }, indexOf(61)), true, 'Level 61 nach Level 60.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [1], levelStars: { 1: 1 } }, indexOf(2)), false, 'Ein Stern reicht nicht.');
assert.equal(logic.isLevelUnlocked(LEVELS, { solvedLevelIds: [1], levelStars: { 1: 2 } }, indexOf(2)), true, 'Zwei Sterne reichen.');

assert.equal(logic.isSelectStatement('SELECT * FROM kunden;'), true);
assert.equal(logic.isSelectStatement('WITH x AS (SELECT 1) SELECT * FROM x;'), true);
for (const command of ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'ALTER', 'CREATE', 'PRAGMA', 'REPLACE', 'TRUNCATE', 'ATTACH', 'DETACH']) {
  assert.equal(logic.findBlockedCommand(`${command} foo`), command);
}
assert.equal(logic.hasMultipleStatements('SELECT 1; SELECT 2;'), true);
assert.equal(logic.hasMultipleStatements("SELECT ';' AS semicolon;"), false);

assert.equal(logic.isTestModeFromSearch(''), false);
assert.equal(logic.isTestModeFromSearch('?testmode=1'), true);
assert.equal(LEVELS.filter((_, index) => logic.isLevelUnlocked(LEVELS, emptyProgress(), index, { isTestMode: true, areAllLevelsUnlockedForTesting: true })).length, 80);
const solved = logic.solveAllLevelsForTesting(LEVELS, emptyProgress());
assert.equal(solved.solvedLevelIds.length, 80);
assert.equal(Object.keys(solved.levelStars).length, 80);
assert.equal(Object.values(solved.levelStars).every(stars => stars === 3), true);
assert.deepEqual(solved.hintUsedLevelIds, [], 'Testmodus speichert keine Hinweisabzüge.');
assert.deepEqual(solved.solutionViewedLevelIds, [], 'Testmodus speichert keine Lösungsabzüge.');


const levelOne = LEVELS[0];
const fullPoints = levelOne.points;
assert.equal(logic.calculateStarsForHelpUsage({ hintUsed: false, solutionViewed: false }), 3, 'Ohne Hilfe gibt es 3 Sterne.');
assert.equal(logic.calculatePointsForStars(levelOne, 3), fullPoints, 'Ohne Hilfe gibt es volle Punktzahl.');
assert.equal(logic.calculateStarsForHelpUsage({ hintUsed: true, solutionViewed: false }), 2, 'Mit Hinweis gibt es maximal 2 Sterne.');
assert.equal(logic.calculatePointsForStars(levelOne, 2), Math.round(fullPoints * 2 / 3), 'Mit Hinweis gibt es reduzierte Punktzahl.');
assert.equal(logic.calculateStarsForHelpUsage({ hintUsed: true, solutionViewed: true }), 1, 'Mit Lösung gibt es maximal 1 Stern.');
assert.equal(logic.calculatePointsForStars(levelOne, 1), Math.round(fullPoints / 3), 'Mit Lösung gibt es deutlich reduzierte Punktzahl.');

let helpProgress = logic.normalizeHelpTracking({ solvedLevelIds: [], levelStars: {}, score: 0 });
helpProgress.hintUsedLevelIds.push(1);
helpProgress = logic.solveLevelWithStars(LEVELS, helpProgress, 1, logic.calculateStarsForHelpUsage({ hintUsed: true }));
assert.equal(helpProgress.levelStars[1], 2, 'Hinweis-Lösung speichert 2 Sterne.');
assert.equal(helpProgress.score, logic.calculatePointsForStars(levelOne, 2), 'Hinweis-Lösung speichert reduzierte Punktzahl.');
assert.equal(logic.isLevelUnlocked(LEVELS, helpProgress, indexOf(2)), true, 'Level mit 2 Sternen bleibt freischaltbar.');

const repeatedTwoStarProgress = logic.solveLevelWithStars(LEVELS, helpProgress, 1, 2);
assert.equal(repeatedTwoStarProgress.levelStars[1], 2, 'Wiederholtes Lösen zählt Sterne nicht doppelt.');
assert.equal(repeatedTwoStarProgress.score, helpProgress.score, 'Wiederholtes Lösen zählt Punktzahl nicht doppelt.');

const improvedProgress = logic.solveLevelWithStars(LEVELS, helpProgress, 1, logic.calculateStarsForHelpUsage({ hintUsed: false, solutionViewed: false }));
assert.equal(improvedProgress.levelStars[1], 3, 'Späteres Lösen ohne Hilfe verbessert auf 3 Sterne.');
assert.equal(improvedProgress.score, fullPoints, 'Spätere bessere Leistung ersetzt die Punktzahl.');
assert.equal(improvedProgress.hintUsedLevelIds.includes(1), false, 'Bessere Lösung ohne Hilfe entfernt gespeicherte Hinweisnutzung.');

let solutionProgress = logic.normalizeHelpTracking({ solvedLevelIds: [], levelStars: {}, score: 0 });
solutionProgress.solutionViewedLevelIds.push(1);
solutionProgress = logic.solveLevelWithStars(LEVELS, solutionProgress, 1, logic.calculateStarsForHelpUsage({ solutionViewed: true }));
assert.equal(solutionProgress.levelStars[1], 1, 'Angesehene Lösung speichert 1 Stern.');
assert.equal(solutionProgress.score, logic.calculatePointsForStars(levelOne, 1), 'Angesehene Lösung speichert deutlich reduzierte Punktzahl.');
assert.equal(logic.isLevelUnlocked(LEVELS, solutionProgress, indexOf(2)), false, 'Level mit 1 Stern schaltet das nächste Level nicht frei.');

const legacyProgress = logic.normalizeHelpTracking({ solvedLevelIds: [1], levelStars: { 1: 2 }, score: 7 });
assert.deepEqual(legacyProgress.hintUsedLevelIds, [], 'Alte Fortschrittsdaten ohne Hinweisfeld funktionieren.');
assert.deepEqual(legacyProgress.solutionViewedLevelIds, [], 'Alte Fortschrittsdaten ohne Lösungsfeld funktionieren.');


const storedHintProgress = logic.normalizeHelpTracking({ solvedLevelIds: [], levelStars: {}, score: 0, hintUsedLevelIds: [1] });
const restoredHintUsage = logic.getHelpUsageForLevel(storedHintProgress, 1);
assert.deepEqual(restoredHintUsage, { hintUsed: true, solutionViewed: false }, 'Gespeicherter Hinweisstatus wird beim Laden rekonstruiert.');
assert.equal(logic.calculateStarsForHelpUsage(restoredHintUsage), 2, 'Rekonstruierter Hinweisstatus bleibt auf maximal 2 Sterne begrenzt.');

const storedSolutionProgress = logic.normalizeHelpTracking({ solvedLevelIds: [], levelStars: {}, score: 0, solutionViewedLevelIds: [1] });
const restoredSolutionUsage = logic.getHelpUsageForLevel(storedSolutionProgress, 1);
assert.deepEqual(restoredSolutionUsage, { hintUsed: false, solutionViewed: true }, 'Gespeicherter Lösungsstatus wird beim Laden rekonstruiert.');
assert.equal(logic.calculateStarsForHelpUsage(restoredSolutionUsage), 1, 'Rekonstruierter Lösungsstatus bleibt auf maximal 1 Stern begrenzt.');
console.log('Alle Tests erfolgreich.');

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
console.log('Alle Tests erfolgreich.');

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

const badgeIds = progress => logic.calculateBadges(progress).filter(badge => badge.unlocked).map(badge => badge.id);
const solvedRange = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
assert.deepEqual(badgeIds({ solvedLevelIds: [1], levelStars: { 1: 3 } }).includes('first_steps'), true, 'Erstes gelöstes Level schaltet Erste Schritte frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(1, 9), levelStars: Object.fromEntries(solvedRange(1, 9).map(id => [id, id === 9 ? 1 : 3])) }).includes('star_collector'), true, '25 Sterne schalten Sternensammler frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(1, 40), levelStars: {} }).includes('halfway'), true, '40 gelöste Level schalten Halbzeit frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(1, 5), levelStars: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 } }).includes('no_help'), true, 'Fünf 3-Sterne-Level schalten Ohne Hilfe frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(1, 30), levelStars: {} }).includes('beginner_done'), true, 'Anfänger abgeschlossen schaltet Anfänger-Abzeichen frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(31, 60), levelStars: {} }).includes('advanced_done'), true, 'Fortgeschritten abgeschlossen schaltet Fortgeschritten-Abzeichen frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: [80], levelStars: {} }).includes('masterclass'), true, 'Level 80 schaltet Meisterklasse frei.');
assert.deepEqual(badgeIds({ solvedLevelIds: solvedRange(1, 80), levelStars: {} }).includes('quest_complete'), true, 'Alle 80 Level schalten Abschluss-Abzeichen frei.');
assert.deepEqual(logic.getReachedMilestones({ solvedLevelIds: solvedRange(1, 20), levelStars: {} }, 80), [25], '20 von 80 Leveln erreichen 25 %.');
assert.deepEqual(logic.getReachedMilestones({ solvedLevelIds: solvedRange(1, 40), levelStars: {} }, 80), [25, 50], '40 von 80 Leveln erreichen 50 %.');
assert.deepEqual(logic.getReachedMilestones({ solvedLevelIds: solvedRange(1, 60), levelStars: {} }, 80), [25, 50, 75], '60 von 80 Leveln erreichen 75 %.');
assert.deepEqual(logic.getReachedMilestones({ solvedLevelIds: solvedRange(1, 80), levelStars: {} }, 80), [25, 50, 75, 100], '80 von 80 Leveln erreichen 100 %.');
const oldAchievementProgress = logic.normalizeAchievementTracking({ solvedLevelIds: [1], levelStars: { 1: 3 } });
assert.deepEqual(oldAchievementProgress.unlockedBadgeDates, {}, 'Alte Fortschrittsdaten ohne Abzeichenfelder funktionieren.');
assert.deepEqual(oldAchievementProgress.shownMilestones, [], 'Alte Fortschrittsdaten ohne Meilensteinfelder funktionieren.');
assert.equal(logic.getNewMilestones({ solvedLevelIds: solvedRange(1, 40), levelStars: {}, shownMilestones: [25] }, 80)[0], 50, 'Bereits angezeigte Meilensteine werden nicht wiederholt.');
const resetAchievementProgress = logic.normalizeAchievementTracking({ solvedLevelIds: [], levelStars: {}, unlockedBadgeDates: {}, shownMilestones: [] });
assert.equal(logic.calculateBadges(resetAchievementProgress).every(badge => !badge.unlocked), true, 'Reset entfernt alle erreichten Abzeichen.');
assert.deepEqual(logic.getNewMilestones(resetAchievementProgress, 80), [], 'Reset entfernt alle erreichten Meilensteine.');
assert.equal(logic.calculateBadges(solved).every(badge => badge.unlocked), true, 'Testmodus löst alle passenden Abzeichen aus.');
assert.deepEqual(solved.shownMilestones, [25, 50, 75, 100], 'Testmodus aktiviert alle Meilensteine.');


assert.equal(logic.getSolvedLevelsForReplay(LEVELS, emptyProgress()).length, 0, 'Keine gelösten Level ergeben eine leere Wiederholungsmenge.');
const replayProgress = { solvedLevelIds: [1, 3, 999, 'x'], levelStars: { 1: 2, 2: 3, 3: 3 } };
assert.deepEqual(Array.from(logic.getSolvedLevelsForReplay(LEVELS, replayProgress), level => level.id), [1, 3], 'Nur tatsächlich gelöste Level werden im Wiederholungsmodus angeboten.');
assert.deepEqual(Array.from(logic.filterReplayLevels(LEVELS, replayProgress, 'underThreeStars'), level => level.id), [1], 'Filter weniger als 3 Sterne zeigt nur passende gelöste Level.');
for (const randomValue of [0, 0.2, 0.5, 0.9999]) {
  assert.ok([1, 3].includes(logic.getRandomSolvedLevel(LEVELS, replayProgress, () => randomValue).id), 'Zufallslevel stammt aus den gelösten Levels.');
}
assert.equal(logic.getSolvedLevelsForReplay(LEVELS, solved).length, 80, 'Testmodus Alle Level lösen befüllt den Wiederholungsmodus vollständig.');
assert.equal(logic.getSolvedLevelsForReplay(LEVELS, resetAchievementProgress).length, 0, 'Reset liefert keine Wiederholungslevel.');
const protectedProgress = logic.solveLevelWithStars(LEVELS, { solvedLevelIds: [1], levelStars: { 1: 3 }, score: fullPoints }, 1, 1);
assert.equal(protectedProgress.levelStars[1], 3, 'Wiederholen verschlechtert Sterne nicht.');
assert.equal(protectedProgress.score, fullPoints, 'Wiederholen verschlechtert Punkte nicht und erzeugt keine doppelten Punkte.');

const unlockedForProgress = progress => (_level, index) => logic.isLevelUnlocked(LEVELS, progress, index);
const dailyProgress = { solvedLevelIds: [1], levelStars: { 1: 2 } };
const sameDayA = logic.updateDailyChallengeProgress(LEVELS, dailyProgress, '2026-06-24', unlockedForProgress(dailyProgress));
const sameDayB = logic.updateDailyChallengeProgress(LEVELS, sameDayA, '2026-06-24', unlockedForProgress(sameDayA));
assert.equal(sameDayA.dailyChallenge.levelId, sameDayB.dailyChallenge.levelId, 'Gleicher Tag liefert dieselbe Tages-Challenge.');
const nextDay = logic.updateDailyChallengeProgress(LEVELS, dailyProgress, '2026-06-25', unlockedForProgress(dailyProgress));
assert.ok(Number.isInteger(nextDay.dailyChallenge.levelId), 'Neuer Tag kann eine gültige neue Tages-Challenge auswählen.');

const unsolvedPreferredProgress = { solvedLevelIds: [1], levelStars: { 1: 2 } };
const unsolvedChallenge = logic.selectDailyChallengeLevel(LEVELS, unsolvedPreferredProgress, '2026-06-24', unlockedForProgress(unsolvedPreferredProgress));
assert.equal(unsolvedChallenge.id, 2, 'Ungelöste freigeschaltete Level werden bevorzugt.');

const underThreePreferredProgress = { solvedLevelIds: [1, 2], levelStars: { 1: 3, 2: 2 } };
const underThreeChallenge = logic.selectDailyChallengeLevel(LEVELS, underThreePreferredProgress, '2026-06-24', (_level, index) => index < 2);
assert.equal(underThreeChallenge.id, 2, 'Gelöste Level mit weniger als 3 Sternen werden nach ungelösten Leveln bevorzugt.');

const solvedFallbackProgress = { solvedLevelIds: [1, 2], levelStars: { 1: 3, 2: 3 } };
const solvedFallbackChallenge = logic.selectDailyChallengeLevel(LEVELS, solvedFallbackProgress, '2026-06-24', () => false);
assert.ok([1, 2].includes(solvedFallbackChallenge.id), 'Fallback auf gelöste Level funktioniert.');

const oldDailyProgress = logic.normalizeDailyChallenge({ solvedLevelIds: [1], levelStars: { 1: 3 } });
assert.deepEqual(oldDailyProgress.dailyChallenge, { date: null, levelId: null, completed: false }, 'Alte Fortschrittsdaten ohne Tages-Challenge-Felder funktionieren.');
const resetDailyProgress = logic.normalizeDailyChallenge({ solvedLevelIds: [], levelStars: {} });
assert.equal(resetDailyProgress.dailyChallenge.levelId, null, 'Reset entfernt Tages-Challenge-Daten.');
const testModeDaily = logic.updateDailyChallengeProgress(LEVELS, solved, '2026-06-24', () => true);
assert.ok(LEVELS.some(level => level.id === testModeDaily.dailyChallenge.levelId), 'Testmodus liefert eine gültige Tages-Challenge.');
for (const dateKey of ['2026-06-24', '2026-06-25', '2026-06-26']) {
  const challenge = logic.updateDailyChallengeProgress(LEVELS, dailyProgress, dateKey, unlockedForProgress(dailyProgress));
  assert.ok(LEVELS.some(level => level.id === challenge.dailyChallenge.levelId), 'Challenge-Auswahl enthält nur existierende Level.');
}


const firstStoredDaily = logic.updateDailyChallengeProgress(LEVELS, { solvedLevelIds: [1], levelStars: { 1: 2 } }, '2026-06-24', unlockedForProgress(dailyProgress));
assert.equal(logic.hasDailyChallengeChanged({ solvedLevelIds: [1], levelStars: { 1: 2 } }, firstStoredDaily), true, 'Neu erzeugte Tages-Challenge wird als speicherpflichtige Änderung erkannt.');
const reloadedDaily = logic.updateDailyChallengeProgress(LEVELS, firstStoredDaily, '2026-06-24', unlockedForProgress(firstStoredDaily));
assert.equal(reloadedDaily.dailyChallenge.levelId, firstStoredDaily.dailyChallenge.levelId, 'Reload mit gespeichertem Fortschritt behält dieselbe Level-ID.');
assert.equal(logic.hasDailyChallengeChanged(firstStoredDaily, reloadedDaily), false, 'Reload derselben Tages-Challenge speichert nicht erneut.');
const progressedSameDay = { ...firstStoredDaily, solvedLevelIds: [1, 2], levelStars: { 1: 2, 2: 3 } };
const sameDayAfterProgress = logic.updateDailyChallengeProgress(LEVELS, progressedSameDay, '2026-06-24', unlockedForProgress(progressedSameDay));
assert.equal(sameDayAfterProgress.dailyChallenge.levelId, firstStoredDaily.dailyChallenge.levelId, 'Fortschrittsänderung am selben Tag behält die ursprüngliche gespeicherte Challenge.');
assert.equal(logic.hasDailyChallengeChanged(progressedSameDay, sameDayAfterProgress), false, 'Unveränderte gespeicherte Tages-Challenge erzeugt keine Speicherschleife.');
const nextDayStored = logic.updateDailyChallengeProgress(LEVELS, sameDayAfterProgress, '2026-06-25', unlockedForProgress(sameDayAfterProgress));
assert.equal(nextDayStored.dailyChallenge.date, '2026-06-25', 'Am nächsten Tag wird eine neue Tages-Challenge gespeichert.');
assert.equal(logic.hasDailyChallengeChanged(sameDayAfterProgress, nextDayStored), true, 'Tageswechsel wird genau als speicherpflichtige Änderung erkannt.');

const unlockedTimeChallengeProgress = { solvedLevelIds: [1], levelStars: { 1: 2 } };
const timeChallengeUnlockedIds = logic.getTimeChallengeCandidateGroups(LEVELS, unlockedTimeChallengeProgress, unlockedForProgress(unlockedTimeChallengeProgress)).flat().map(level => level.id);
assert.equal(timeChallengeUnlockedIds.every(id => logic.isLevelUnlocked(LEVELS, unlockedTimeChallengeProgress, indexOf(id))), true, 'Zeit-Challenge wählt nur freigeschaltete Level.');
const timeUnsolved = logic.selectTimeChallengeLevel(LEVELS, unlockedTimeChallengeProgress, unlockedForProgress(unlockedTimeChallengeProgress), () => 0);
assert.equal(timeUnsolved.id, 2, 'Zeit-Challenge priorisiert ungelöste freigeschaltete Level.');
const timeUnderThree = logic.selectTimeChallengeLevel(LEVELS, { solvedLevelIds: [1, 2], levelStars: { 1: 3, 2: 2 } }, (_level, index) => index < 2, () => 0);
assert.equal(timeUnderThree.id, 2, 'Zeit-Challenge fällt auf Level mit weniger als 3 Sternen zurück.');
assert.equal(logic.formatTimeChallengeSeconds(300), '5:00', 'Zeit-Challenge formatiert 300 Sekunden als 5:00.');
assert.equal(logic.isTimeChallengeSuccess({ active: true, levelId: 1, expired: false }, 1, 12), true, 'Zeit-Challenge erkennt Erfolg vor Ablauf.');
const expiredProtected = logic.solveLevelWithStars(LEVELS, { solvedLevelIds: [1], levelStars: { 1: 3 }, score: fullPoints }, 1, 1);
assert.equal(expiredProtected.levelStars[1], 3, 'Zeitablauf oder schwächerer Versuch verändert Sterne nicht.');
assert.equal(expiredProtected.score, fullPoints, 'Zeitablauf oder schwächerer Versuch verändert Punkte nicht.');
let timeProgress = logic.recordTimeChallengeSuccess({ solvedLevelIds: [1], levelStars: { 1: 3 } }, 1, 100);
timeProgress = logic.recordTimeChallengeSuccess(timeProgress, 1, 80);
assert.equal(timeProgress.timeChallenge.bestRemainingSecondsByLevel[1], 100, 'Beste Zeit wird nicht verschlechtert.');
timeProgress = logic.recordTimeChallengeSuccess(timeProgress, 1, 120);
assert.equal(timeProgress.timeChallenge.bestRemainingSecondsByLevel[1], 120, 'Beste Zeit wird verbessert.');
assert.deepEqual(logic.normalizeTimeChallenge({ solvedLevelIds: [], levelStars: {} }).timeChallenge, { bestRemainingSecondsByLevel: {}, completedCount: 0, lastStartedLevelId: null }, 'Reset entfernt gespeicherte Zeit-Challenge-Daten.');
assert.deepEqual(logic.normalizeTimeChallenge({ solvedLevelIds: [1], levelStars: { 1: 3 } }).timeChallenge, { bestRemainingSecondsByLevel: {}, completedCount: 0, lastStartedLevelId: null }, 'Alte Fortschrittsdaten ohne Zeit-Challenge-Felder funktionieren.');
const testModeTimeLevel = logic.selectTimeChallengeLevel(LEVELS, solved, () => true, () => 0.4);
assert.ok(LEVELS.some(level => level.id === testModeTimeLevel.id), 'Testmodus bleibt für Zeit-Challenges kompatibel.');

console.log('Alle Tests erfolgreich.');

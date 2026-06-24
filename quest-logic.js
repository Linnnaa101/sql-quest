const MAX_STARS = 3;
const MIN_STARS_TO_UNLOCK_NEXT_LEVEL = 2;

const BADGE_DEFINITIONS = [
  { id: 'first_steps', title: 'Erste Schritte', description: 'Erstes Level gelöst.', icon: '👣' },
  { id: 'star_collector', title: 'Sternensammler', description: 'Mindestens 25 Sterne gesammelt.', icon: '⭐' },
  { id: 'halfway', title: 'Halbzeit', description: 'Mindestens 40 von 80 Leveln gelöst.', icon: '🏁' },
  { id: 'no_help', title: 'Ohne Hilfe', description: 'Mindestens 5 Level mit 3 Sternen gelöst.', icon: '💎' },
  { id: 'beginner_done', title: 'Anfänger geschafft', description: 'Alle Anfänger-Level 1–30 gelöst.', icon: '🌱' },
  { id: 'advanced_done', title: 'Fortgeschritten', description: 'Alle Fortgeschritten-Level 31–60 gelöst.', icon: '🚀' },
  { id: 'masterclass', title: 'Meisterklasse', description: 'Level 80 gelöst.', icon: '👑' },
  { id: 'quest_complete', title: 'SQL Quest abgeschlossen', description: 'Alle 80 Level gelöst.', icon: '🏆' }
];
const MILESTONE_DEFINITIONS = [25, 50, 75, 100];

function normalizeAchievementTracking(progress = {}) {
  return {
    ...progress,
    unlockedBadgeDates: progress.unlockedBadgeDates && typeof progress.unlockedBadgeDates === 'object' ? progress.unlockedBadgeDates : {},
    shownMilestones: Array.isArray(progress.shownMilestones) ? progress.shownMilestones : []
  };
}

function getSolvedLevelIdSet(progress = {}) {
  return new Set((Array.isArray(progress.solvedLevelIds) ? progress.solvedLevelIds : []).map(id => Number(id)));
}

function countSolvedLevelsInRange(progress = {}, start, end) {
  const solved = getSolvedLevelIdSet(progress);
  let count = 0;
  for (let id = start; id <= end; id += 1) if (solved.has(id)) count += 1;
  return count;
}

function countSolvedLevels(progress = {}) { return countSolvedLevelsInRange(progress, 1, 80); }
function countCollectedStars(progress = {}) { return Object.values(progress.levelStars || {}).reduce((sum, stars) => sum + Math.max(0, Math.min(MAX_STARS, Number(stars) || 0)), 0); }
function countThreeStarLevels(progress = {}) { return Object.values(progress.levelStars || {}).filter(stars => Math.max(0, Math.min(MAX_STARS, Number(stars) || 0)) === MAX_STARS).length; }

function isBadgeUnlocked(badgeId, progress = {}) {
  const solved = getSolvedLevelIdSet(progress);
  if (badgeId === 'first_steps') return countSolvedLevels(progress) >= 1;
  if (badgeId === 'star_collector') return countCollectedStars(progress) >= 25;
  if (badgeId === 'halfway') return countSolvedLevels(progress) >= 40;
  if (badgeId === 'no_help') return countThreeStarLevels(progress) >= 5;
  if (badgeId === 'beginner_done') return countSolvedLevelsInRange(progress, 1, 30) >= 30;
  if (badgeId === 'advanced_done') return countSolvedLevelsInRange(progress, 31, 60) >= 30;
  if (badgeId === 'masterclass') return solved.has(80);
  if (badgeId === 'quest_complete') return countSolvedLevels(progress) >= 80;
  return false;
}

function calculateBadges(progress = {}) {
  const normalized = normalizeAchievementTracking(progress);
  return BADGE_DEFINITIONS.map(badge => ({ ...badge, unlocked: isBadgeUnlocked(badge.id, normalized), unlockedAt: normalized.unlockedBadgeDates[badge.id] || null }));
}

function applyBadgeUnlockDates(progress = {}, now = new Date().toISOString()) {
  const normalized = normalizeAchievementTracking(progress);
  const unlockedBadgeDates = { ...normalized.unlockedBadgeDates };
  BADGE_DEFINITIONS.forEach(badge => { if (isBadgeUnlocked(badge.id, normalized) && !unlockedBadgeDates[badge.id]) unlockedBadgeDates[badge.id] = now; });
  return { ...normalized, unlockedBadgeDates };
}

function getReachedMilestones(progress = {}, totalLevels = 80) {
  const solvedPercent = totalLevels === 0 ? 0 : Math.floor((countSolvedLevels(progress) / totalLevels) * 100);
  return MILESTONE_DEFINITIONS.filter(percent => solvedPercent >= percent);
}

function getNewMilestones(progress = {}, totalLevels = 80) {
  const normalized = normalizeAchievementTracking(progress);
  const shown = new Set(normalized.shownMilestones.map(Number));
  return getReachedMilestones(normalized, totalLevels).filter(percent => !shown.has(percent));
}

const BLOCKED_COMMANDS = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'REPLACE', 'TRUNCATE', 'PRAGMA', 'ATTACH', 'DETACH'];

function isTestModeFromSearch(search = '') {
  return new URLSearchParams(search).get('testmode') === '1';
}

function getLevelStars(progress, levelId) {
  return Math.max(0, Math.min(MAX_STARS, Number(progress.levelStars?.[levelId]) || 0));
}

function isEveryLevelUnlockedForTesting(isTestMode, areAllLevelsUnlockedForTesting) {
  return Boolean(isTestMode && areAllLevelsUnlockedForTesting);
}

function isLevelUnlocked(levels, progress, levelIndex, options = {}) {
  const level = levels[levelIndex];
  if (!level) return false;
  if (isEveryLevelUnlockedForTesting(options.isTestMode, options.areAllLevelsUnlockedForTesting)) return true;
  if (levelIndex === 0) return true;
  if (level.id === 31) return progress.solvedLevelIds.includes(30);
  if (level.id === 41) return progress.solvedLevelIds.includes(40);
  if (level.id === 51) return progress.solvedLevelIds.includes(50);
  if (level.id === 61) return progress.solvedLevelIds.includes(60);
  return getLevelStars(progress, levels[levelIndex - 1].id) >= MIN_STARS_TO_UNLOCK_NEXT_LEVEL;
}

function maskSqlCommentsAndStrings(sql) {
  let masked = '', quote = null, inLineComment = false, inBlockComment = false;
  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index], next = sql[index + 1];
    if (inLineComment) { if (char === '\n') { inLineComment = false; masked += char; } else masked += ' '; continue; }
    if (inBlockComment) { if (char === '*' && next === '/') { masked += '  '; inBlockComment = false; index += 1; } else masked += ' '; continue; }
    if (quote) { if (char === quote && next === quote) { masked += '  '; index += 1; } else if (char === quote) { masked += ' '; quote = null; } else masked += ' '; continue; }
    if (char === '-' && next === '-') { masked += '  '; inLineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { masked += '  '; inBlockComment = true; index += 1; continue; }
    if (char === '\'' || char === '"') { masked += ' '; quote = char; continue; }
    masked += char;
  }
  return masked;
}
function findBlockedCommand(sql) { return maskSqlCommentsAndStrings(sql).match(new RegExp(`\\b(${BLOCKED_COMMANDS.join('|')})\\b`, 'i'))?.[1].toUpperCase(); }
function splitSqlStatements(sql) {
  const statements = []; let current = '', quote = null, inLineComment = false, inBlockComment = false;
  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index], next = sql[index + 1];
    if (inLineComment) { if (char === '\n') { inLineComment = false; current += char; } continue; }
    if (inBlockComment) { if (char === '*' && next === '/') { inBlockComment = false; index += 1; } continue; }
    if (!quote && char === '-' && next === '-') { inLineComment = true; index += 1; continue; }
    if (!quote && char === '/' && next === '*') { inBlockComment = true; index += 1; continue; }
    current += char;
    if (quote) { if (char === quote && next === quote) { current += next; index += 1; } else if (char === quote) quote = null; continue; }
    if (char === '\'' || char === '"') quote = char; else if (char === ';') { statements.push(current.slice(0, -1)); current = ''; }
  }
  statements.push(current); return statements;
}
function hasMultipleStatements(sql) { return splitSqlStatements(sql).filter(statement => statement.trim()).length > 1; }
function skipSqlWhitespace(sql, startIndex) { let index = startIndex; while (index < sql.length && /\s/.test(sql[index])) index += 1; return index; }
function readSqlIdentifier(sql, startIndex) { const index = skipSqlWhitespace(sql, startIndex); const match = sql.slice(index).match(/^([A-Z_][A-Z0-9_$]*)/i); return match ? { value: match[1], end: index + match[1].length } : null; }
function readSqlKeyword(sql, startIndex) { const identifier = readSqlIdentifier(sql, startIndex); return identifier ? { keyword: identifier.value.toUpperCase(), end: identifier.end } : null; }
function findMatchingSqlParenthesis(sql, startIndex) { let depth = 0, quote = null; for (let index = startIndex; index < sql.length; index += 1) { const char = sql[index], next = sql[index + 1]; if (quote) { if (char === quote && next === quote) index += 1; else if (char === quote) quote = null; continue; } if (char === '\'' || char === '"') quote = char; else if (char === '(') depth += 1; else if (char === ')' && --depth === 0) return index; } return -1; }
function getMainCommandAfterCtes(sql, startIndex) { let index = skipSqlWhitespace(sql, startIndex); const recursiveKeyword = readSqlKeyword(sql, index); if (recursiveKeyword?.keyword === 'RECURSIVE') index = skipSqlWhitespace(sql, recursiveKeyword.end); while (index < sql.length) { const cteName = readSqlIdentifier(sql, index); if (!cteName) return null; index = skipSqlWhitespace(sql, cteName.end); const asKeyword = readSqlKeyword(sql, index); if (asKeyword?.keyword !== 'AS') return null; index = skipSqlWhitespace(sql, asKeyword.end); if (sql[index] !== '(') return null; index = findMatchingSqlParenthesis(sql, index); if (index === -1) return null; index = skipSqlWhitespace(sql, index + 1); if (sql[index] === ',') { index = skipSqlWhitespace(sql, index + 1); continue; } return readSqlKeyword(sql, index)?.keyword || null; } return null; }
function getReadOnlyMainCommand(sql) { const statement = splitSqlStatements(sql).join(' '); const firstKeyword = readSqlKeyword(statement, 0); if (firstKeyword?.keyword === 'SELECT') return 'SELECT'; if (firstKeyword?.keyword !== 'WITH') return firstKeyword?.keyword || null; return getMainCommandAfterCtes(statement, firstKeyword.end); }
function isSelectStatement(sql) { return getReadOnlyMainCommand(sql) === 'SELECT'; }
function calculateStarsForHelpUsage({ hintUsed = false, solutionViewed = false } = {}) {
  if (solutionViewed) return 1;
  if (hintUsed) return 2;
  return 3;
}
function calculatePointsForStars(level, stars) {
  return Math.round((Number(level?.points) || 0) * (Math.max(0, Math.min(MAX_STARS, Number(stars) || 0)) / MAX_STARS));
}
function calculateScoreFromStars(levels, levelStars = {}) {
  return levels.reduce((score, level) => score + calculatePointsForStars(level, levelStars[level.id]), 0);
}
function normalizeHelpTracking(progress = {}) {
  return {
    ...progress,
    hintUsedLevelIds: Array.isArray(progress.hintUsedLevelIds) ? progress.hintUsedLevelIds : [],
    solutionViewedLevelIds: Array.isArray(progress.solutionViewedLevelIds) ? progress.solutionViewedLevelIds : []
  };
}
function getHelpUsageForLevel(progress = {}, levelId) {
  const normalized = normalizeHelpTracking(progress);
  return {
    hintUsed: normalized.hintUsedLevelIds.includes(levelId),
    solutionViewed: normalized.solutionViewedLevelIds.includes(levelId)
  };
}

function getSolvedLevelsForReplay(levels = [], progress = {}) {
  const solved = getSolvedLevelIdSet(progress);
  return levels.filter(level => solved.has(Number(level.id)));
}

function filterReplayLevels(levels = [], progress = {}, filter = 'all') {
  const replayLevels = getSolvedLevelsForReplay(levels, progress);
  if (filter === 'underThreeStars') {
    return replayLevels.filter(level => getLevelStars(progress, level.id) < MAX_STARS);
  }
  if (filter === 'beginner') {
    return replayLevels.filter(level => level.difficulty === 'Anfänger');
  }
  if (filter === 'advanced') {
    return replayLevels.filter(level => level.difficulty === 'Fortgeschritten');
  }
  if (filter === 'master') {
    return replayLevels.filter(level => level.difficulty === 'Meister');
  }
  if (filter === 'helpUsed') {
    const normalized = normalizeHelpTracking(progress);
    return replayLevels.filter(level => normalized.hintUsedLevelIds.includes(level.id) || normalized.solutionViewedLevelIds.includes(level.id));
  }
  return replayLevels;
}

function getRandomSolvedLevel(levels = [], progress = {}, random = Math.random) {
  const replayLevels = getSolvedLevelsForReplay(levels, progress);
  if (!replayLevels.length) return null;
  const randomValue = Math.max(0, Math.min(0.999999999999, Number(random()) || 0));
  return replayLevels[Math.floor(randomValue * replayLevels.length)];
}

function getLocalDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return getLocalDateKey(new Date());
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashStringToIndex(seed, length) {
  if (!length) return -1;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function normalizeDailyChallenge(progress = {}) {
  const challenge = progress.dailyChallenge && typeof progress.dailyChallenge === 'object' ? progress.dailyChallenge : {};
  return {
    ...progress,
    dailyChallenge: {
      date: typeof challenge.date === 'string' ? challenge.date : null,
      levelId: Number.isInteger(Number(challenge.levelId)) ? Number(challenge.levelId) : null,
      completed: Boolean(challenge.completed)
    }
  };
}

function getDailyChallengeCandidateGroups(levels = [], progress = {}, isUnlocked = () => true) {
  const solved = getSolvedLevelIdSet(progress);
  const unlockedLevels = levels.filter((level, index) => level && isUnlocked(level, index));
  return [
    unlockedLevels.filter(level => !solved.has(Number(level.id))),
    unlockedLevels.filter(level => solved.has(Number(level.id)) && getLevelStars(progress, level.id) < MAX_STARS),
    unlockedLevels,
    levels.filter(level => solved.has(Number(level.id)))
  ];
}

function selectDailyChallengeLevel(levels = [], progress = {}, dateKey = getLocalDateKey(), isUnlocked = () => true) {
  const existingIds = new Set(levels.map(level => Number(level.id)));
  const normalized = normalizeDailyChallenge(progress);
  const stored = normalized.dailyChallenge;
  if (stored.date === dateKey && existingIds.has(Number(stored.levelId))) {
    return levels.find(level => Number(level.id) === Number(stored.levelId)) || null;
  }

  const groups = getDailyChallengeCandidateGroups(levels, normalized, isUnlocked);
  const candidates = groups.find(group => group.length > 0) || [];
  if (!candidates.length) return null;
  const index = hashStringToIndex(`${dateKey}:daily-challenge`, candidates.length);
  return candidates[index] || null;
}

function updateDailyChallengeProgress(levels = [], progress = {}, date = new Date(), isUnlocked = () => true) {
  const dateKey = typeof date === 'string' ? date : getLocalDateKey(date);
  const level = selectDailyChallengeLevel(levels, progress, dateKey, isUnlocked);
  if (!level) return normalizeDailyChallenge(progress);
  const current = normalizeDailyChallenge(progress).dailyChallenge;
  return {
    ...progress,
    dailyChallenge: {
      date: dateKey,
      levelId: level.id,
      completed: current.date === dateKey && Number(current.levelId) === Number(level.id) ? Boolean(current.completed) : false
    }
  };
}

function hasDailyChallengeChanged(previousProgress = {}, nextProgress = {}) {
  const previous = normalizeDailyChallenge(previousProgress).dailyChallenge;
  const next = normalizeDailyChallenge(nextProgress).dailyChallenge;
  return previous.date !== next.date || Number(previous.levelId) !== Number(next.levelId) || Boolean(previous.completed) !== Boolean(next.completed);
}

function markDailyChallengeCompleted(progress = {}, levelId, date = new Date()) {
  const dateKey = typeof date === 'string' ? date : getLocalDateKey(date);
  const normalized = normalizeDailyChallenge(progress);
  if (normalized.dailyChallenge.date !== dateKey || Number(normalized.dailyChallenge.levelId) !== Number(levelId)) return normalized;
  return { ...normalized, dailyChallenge: { ...normalized.dailyChallenge, completed: true } };
}

function solveLevelWithStars(levels, progress, levelId, earnedStars) {
  const normalized = normalizeHelpTracking(progress);
  const previousStars = getLevelStars(normalized, levelId);
  const bestStars = Math.max(previousStars, earnedStars);
  const levelStars = { ...(normalized.levelStars || {}), [levelId]: bestStars };
  const solvedLevelIds = normalized.solvedLevelIds?.includes(levelId) ? normalized.solvedLevelIds : [...(normalized.solvedLevelIds || []), levelId];
  return {
    ...normalized,
    solvedLevelIds,
    levelStars,
    score: calculateScoreFromStars(levels, levelStars),
    hintUsedLevelIds: bestStars > previousStars && earnedStars === MAX_STARS ? normalized.hintUsedLevelIds.filter(id => id !== levelId) : normalized.hintUsedLevelIds,
    solutionViewedLevelIds: bestStars > previousStars && earnedStars > 1 ? normalized.solutionViewedLevelIds.filter(id => id !== levelId) : normalized.solutionViewedLevelIds
  };
}
function solveAllLevelsForTesting(levels, progress = {}) { const levelStars = levels.reduce((stars, level) => ({ ...stars, [level.id]: MAX_STARS }), {}); return applyBadgeUnlockDates({ ...normalizeAchievementTracking(normalizeHelpTracking(progress)), solvedLevelIds: levels.map(level => level.id), levelStars, hintUsedLevelIds: [], solutionViewedLevelIds: [], shownMilestones: getReachedMilestones({ solvedLevelIds: levels.map(level => level.id), levelStars }, levels.length), score: calculateScoreFromStars(levels, levelStars) }); }

module.exports = { getLocalDateKey, normalizeDailyChallenge, getDailyChallengeCandidateGroups, selectDailyChallengeLevel, updateDailyChallengeProgress, hasDailyChallengeChanged, markDailyChallengeCompleted, BADGE_DEFINITIONS, MILESTONE_DEFINITIONS, normalizeAchievementTracking, calculateBadges, applyBadgeUnlockDates, getReachedMilestones, getNewMilestones, MAX_STARS, MIN_STARS_TO_UNLOCK_NEXT_LEVEL, BLOCKED_COMMANDS, isTestModeFromSearch, isLevelUnlocked, getLevelStars, isEveryLevelUnlockedForTesting, findBlockedCommand, hasMultipleStatements, isSelectStatement, calculateStarsForHelpUsage, calculatePointsForStars, calculateScoreFromStars, normalizeHelpTracking, getHelpUsageForLevel, getSolvedLevelsForReplay, filterReplayLevels, getRandomSolvedLevel, solveLevelWithStars, solveAllLevelsForTesting };

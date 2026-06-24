const MAX_STARS = 3;
const MIN_STARS_TO_UNLOCK_NEXT_LEVEL = 2;
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
function solveAllLevelsForTesting(levels, progress = {}) { const levelStars = levels.reduce((stars, level) => ({ ...stars, [level.id]: MAX_STARS }), {}); return { ...normalizeHelpTracking(progress), solvedLevelIds: levels.map(level => level.id), levelStars, hintUsedLevelIds: [], solutionViewedLevelIds: [], score: calculateScoreFromStars(levels, levelStars) }; }

module.exports = { MAX_STARS, MIN_STARS_TO_UNLOCK_NEXT_LEVEL, BLOCKED_COMMANDS, isTestModeFromSearch, isLevelUnlocked, getLevelStars, isEveryLevelUnlockedForTesting, findBlockedCommand, hasMultipleStatements, isSelectStatement, calculateStarsForHelpUsage, calculatePointsForStars, calculateScoreFromStars, normalizeHelpTracking, getHelpUsageForLevel, solveLevelWithStars, solveAllLevelsForTesting };

(function initDashboardLogic(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SqlQuestDashboardLogic = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDashboardLogic() {
  const MAX_STARS = 3;
  const EMPTY_ACTIVITY_TEXT = 'Starte dein erstes Level und beginne deine SQL Quest.';

  function getLevelStars(progress = {}, levelId) {
    return Math.max(0, Math.min(MAX_STARS, Number(progress.levelStars?.[levelId]) || 0));
  }

  function getSolvedLevelIdSet(progress = {}) {
    return new Set((Array.isArray(progress.solvedLevelIds) ? progress.solvedLevelIds : []).map(id => Number(id)));
  }

  function normalizeTimeChallenge(progress = {}) {
    const challenge = progress.timeChallenge && typeof progress.timeChallenge === 'object' ? progress.timeChallenge : {};
    return {
      ...progress,
      timeChallenge: {
        bestRemainingSecondsByLevel: challenge.bestRemainingSecondsByLevel && typeof challenge.bestRemainingSecondsByLevel === 'object' ? challenge.bestRemainingSecondsByLevel : {},
        completedCount: Number.isInteger(Number(challenge.completedCount)) ? Math.max(0, Number(challenge.completedCount)) : 0,
        completedChallengeCount: Number.isInteger(Number(challenge.completedChallengeCount)) ? Math.max(0, Number(challenge.completedChallengeCount)) : (Number.isInteger(Number(challenge.completedCount)) ? Math.max(0, Number(challenge.completedCount)) : 0),
        bestRemainingSeconds: Number.isFinite(Number(challenge.bestRemainingSeconds)) ? Math.max(0, Math.floor(Number(challenge.bestRemainingSeconds))) : 0,
        bestExpiredSolvedCount: Number.isInteger(Number(challenge.bestExpiredSolvedCount)) ? Math.max(0, Number(challenge.bestExpiredSolvedCount)) : 0,
        lastStartedLevelId: Number.isInteger(Number(challenge.lastStartedLevelId)) ? Number(challenge.lastStartedLevelId) : null
      }
    };
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

  function normalizeDashboardActivity(progress = {}) {
    return {
      ...progress,
      lastOpenedLevelId: Number.isInteger(Number(progress.lastOpenedLevelId)) ? Number(progress.lastOpenedLevelId) : null,
      lastSolvedLevelId: Number.isInteger(Number(progress.lastSolvedLevelId)) ? Number(progress.lastSolvedLevelId) : null
    };
  }

  function getDifficultyBuckets(levels = [], progress = {}) {
    const solved = getSolvedLevelIdSet(progress);
    return ['Anfänger', 'Fortgeschritten', 'Meister'].map(title => {
      const bucketLevels = levels.filter(level => level.difficulty === title);
      const solvedCount = bucketLevels.filter(level => solved.has(Number(level.id))).length;
      return { title, solved: solvedCount, total: bucketLevels.length, percent: bucketLevels.length ? Math.round((solvedCount / bucketLevels.length) * 100) : 0 };
    });
  }

  function getProgressSummary(levels = [], progress = {}) {
    const solved = getSolvedLevelIdSet(progress);
    const solvedLevels = levels.filter(level => solved.has(Number(level.id))).length;
    const totalLevels = levels.length;
    const collectedStars = levels.reduce((sum, level) => sum + getLevelStars(progress, level.id), 0);
    const maxStars = totalLevels * MAX_STARS;
    return {
      solvedLevels,
      totalLevels,
      collectedStars,
      maxStars,
      percent: totalLevels ? Math.round((solvedLevels / totalLevels) * 100) : 0,
      buckets: getDifficultyBuckets(levels, progress)
    };
  }

  function selectNextMissionLevel(levels = [], progress = {}, isUnlocked = () => true, random = Math.random) {
    const solved = getSolvedLevelIdSet(progress);
    const unlockedLevels = levels.filter((level, index) => level && isUnlocked(level, index));
    const unsolved = unlockedLevels.find(level => !solved.has(Number(level.id)));
    if (unsolved) return { level: unsolved, reason: 'unsolved' };
    const underThree = unlockedLevels.find(level => getLevelStars(progress, level.id) < MAX_STARS);
    if (underThree) return { level: underThree, reason: 'underThreeStars' };
    const firstLocked = levels.find((level, index) => level && !isUnlocked(level, index));
    if (firstLocked) return { level: firstLocked, reason: 'nextLockedPreview' };
    if (!levels.length) return { level: null, reason: 'none' };
    const randomValue = Math.max(0, Math.min(0.999999999999, Number(random()) || 0));
    return { level: levels[Math.floor(randomValue * levels.length)] || null, reason: 'replay' };
  }

  function getLastActivity(levels = [], progress = {}) {
    const normalized = normalizeDashboardActivity(progress);
    const id = normalized.lastSolvedLevelId || normalized.lastOpenedLevelId || null;
    const level = id ? levels.find(candidate => Number(candidate.id) === Number(id)) || null : null;
    return { level, type: normalized.lastSolvedLevelId ? 'solved' : (normalized.lastOpenedLevelId ? 'opened' : 'empty'), emptyText: EMPTY_ACTIVITY_TEXT };
  }

  function buildDashboardData(levels = [], progress = {}, options = {}) {
    const normalized = normalizeTimeChallenge(normalizeDailyChallenge(normalizeDashboardActivity(progress)));
    const isUnlocked = options.isUnlocked || (() => true);
    const updateDailyChallengeProgress = options.updateDailyChallengeProgress || ((sourceProgress = normalized) => sourceProgress);
    const calculateBadges = options.calculateBadges || (() => []);
    const dailyProgress = updateDailyChallengeProgress(normalized);
    const dailyChallenge = normalizeDailyChallenge(dailyProgress).dailyChallenge;
    const dailyLevel = dailyChallenge.levelId ? levels.find(level => Number(level.id) === Number(dailyChallenge.levelId)) || null : null;
    const badges = calculateBadges(dailyProgress);
    const unlockedBadges = badges.filter(badge => badge.unlocked).sort((a, b) => String(b.unlockedAt || '').localeCompare(String(a.unlockedAt || '')));
    return {
      nextMission: selectNextMissionLevel(levels, dailyProgress, isUnlocked, options.random || Math.random),
      dailyChallenge: { ...dailyChallenge, level: dailyLevel },
      timeChallenge: normalizeTimeChallenge(dailyProgress).timeChallenge,
      progress: getProgressSummary(levels, dailyProgress),
      activity: getLastActivity(levels, dailyProgress),
      badges: { unlockedCount: unlockedBadges.length, totalCount: badges.length, latest: unlockedBadges[0] || null }
    };
  }

  return { getDifficultyBuckets, getProgressSummary, selectNextMissionLevel, normalizeDashboardActivity, getLastActivity, buildDashboardData };
});

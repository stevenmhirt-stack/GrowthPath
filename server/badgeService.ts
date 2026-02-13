import { storage } from "./storage";

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awardedBadges: string[] = [];

  let stats = await storage.getUserStats(userId);
  if (!stats) {
    stats = await storage.upsertUserStats({
      userId,
      totalPoints: 0,
      goalsCompleted: 0,
      routinesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      assessmentsCompleted: 0,
      leversActivated: 0,
    });
  }

  const [goals, routines, levers, assessmentScores] = await Promise.all([
    storage.getGoals(userId),
    storage.getRoutines(userId),
    storage.getLevers(userId),
    storage.getAssessmentScores(userId),
  ]);

  if (goals.length >= 1) {
    const result = await storage.awardBadge(userId, 'first-goal');
    if (result) awardedBadges.push('first-goal');
  }

  if (goals.length >= 5) {
    const result = await storage.awardBadge(userId, 'five-goals');
    if (result) awardedBadges.push('five-goals');
  }

  const bigXGoal = goals.find(g => g.goalType === 'big-x');
  if (bigXGoal) {
    const result = await storage.awardBadge(userId, 'big-x-set');
    if (result) awardedBadges.push('big-x-set');
  }

  const completedGoals = goals.filter(g => g.status === 'Completed');
  if (completedGoals.length >= 1) {
    const result = await storage.awardBadge(userId, 'goal-complete');
    if (result) awardedBadges.push('goal-complete');
  }

  if (routines.length >= 1) {
    const result = await storage.awardBadge(userId, 'first-routine');
    if (result) awardedBadges.push('first-routine');
  }

  if (assessmentScores.length >= 1) {
    const result = await storage.awardBadge(userId, 'assessment-done');
    if (result) awardedBadges.push('assessment-done');
  }

  const highScores = assessmentScores.filter(s => s.score >= 9);
  if (highScores.length >= 5) {
    const result = await storage.awardBadge(userId, 'perfectionist');
    if (result) awardedBadges.push('perfectionist');
  }

  const activeLevers = levers.filter(l => {
    const data = l.selectedActions as { isActive?: boolean } | null;
    return data?.isActive === true;
  });

  if (activeLevers.length >= 1) {
    const result = await storage.awardBadge(userId, 'lever-active');
    if (result) awardedBadges.push('lever-active');
  }

  if (activeLevers.length >= 8) {
    const result = await storage.awardBadge(userId, 'all-levers');
    if (result) awardedBadges.push('all-levers');
  }

  const completedRoutines = routines.filter(r => r.completed);
  
  const freshStats = await storage.getUserStats(userId);
  
  await storage.upsertUserStats({
    userId,
    totalPoints: freshStats?.totalPoints || 0,
    goalsCompleted: completedGoals.length,
    routinesCompleted: completedRoutines.length,
    currentStreak: freshStats?.currentStreak || 0,
    longestStreak: freshStats?.longestStreak || 0,
    assessmentsCompleted: assessmentScores.length,
    leversActivated: activeLevers.length,
  });

  return awardedBadges;
}

export async function awardStreakBadges(userId: string, streak: number): Promise<string[]> {
  const awardedBadges: string[] = [];

  if (streak >= 7) {
    const result = await storage.awardBadge(userId, 'streak-7');
    if (result) awardedBadges.push('streak-7');
  }

  if (streak >= 30) {
    const result = await storage.awardBadge(userId, 'streak-30');
    if (result) awardedBadges.push('streak-30');
  }

  return awardedBadges;
}

export async function checkReflectionBadge(userId: string): Promise<string[]> {
  const awardedBadges: string[] = [];
  const result = await storage.awardBadge(userId, 'reflection');
  if (result) awardedBadges.push('reflection');
  return awardedBadges;
}

import { 
  type User, type UpsertUser,
  type Goal, type InsertGoal,
  type Routine, type InsertRoutine,
  type ScheduleItem, type InsertScheduleItem,
  type DailyReflection, type InsertDailyReflection,
  type AssessmentScore, type InsertAssessmentScore,
  type Lever, type InsertLever,
  type Badge, type InsertBadge,
  type UserBadge, type InsertUserBadge,
  type UserStats, type InsertUserStats,
  users, goals, routines, scheduleItems, dailyReflections, assessmentScores, levers,
  badges, userBadges, userStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  getUserByRefreshToken(token: string): Promise<User | undefined>;
  createUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  setEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void>;
  verifyEmail(userId: string): Promise<void>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
  setRefreshToken(userId: string, token: string | null): Promise<void>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string, userId: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, userId: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string, userId: string): Promise<boolean>;
  
  // Routines
  getRoutines(userId: string): Promise<Routine[]>;
  getRoutine(id: string, userId: string): Promise<Routine | undefined>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  updateRoutine(id: string, userId: string, routine: Partial<InsertRoutine>): Promise<Routine | undefined>;
  deleteRoutine(id: string, userId: string): Promise<boolean>;
  
  // Schedule Items
  getScheduleItems(userId: string): Promise<ScheduleItem[]>;
  getScheduleItem(id: string): Promise<ScheduleItem | undefined>;
  createScheduleItem(item: InsertScheduleItem): Promise<ScheduleItem>;
  updateScheduleItem(id: string, userId: string, item: Partial<InsertScheduleItem>): Promise<ScheduleItem | undefined>;
  deleteScheduleItem(id: string): Promise<boolean>;
  
  // Daily Reflections
  getDailyReflection(userId: string, date: string): Promise<DailyReflection | undefined>;
  upsertDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection>;
  
  // Assessment Scores
  getAssessmentScores(userId: string): Promise<AssessmentScore[]>;
  upsertAssessmentScore(score: InsertAssessmentScore): Promise<AssessmentScore>;
  
  // Levers
  getLevers(userId: string): Promise<Lever[]>;
  upsertLever(lever: InsertLever): Promise<Lever>;
  
  // Subscription
  updateUserSubscription(userId: string, data: {
    stripeCustomerId?: string;
    subscriptionStatus?: string;
    subscriptionPriceId?: string | null;
    subscriptionCurrentPeriodEnd?: Date | null;
  }): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge | null>;
  hasUserBadge(userId: string, badgeId: string): Promise<boolean>;
  
  // User Stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  upsertUserStats(stats: InsertUserStats): Promise<UserStats>;
  getLeaderboard(limit?: number): Promise<(UserStats & { user: User })[]>;
  
  // Admin
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const [user] = await db.insert(users).values({
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
    }).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    return result[0];
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
    return result[0];
  }

  async getUserByRefreshToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.refreshToken, token)).limit(1);
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async setEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({ emailVerificationToken: token, emailVerificationExpires: expires, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async verifyEmail(userId: string): Promise<void> {
    await db.update(users)
      .set({ emailVerified: true, emailVerificationToken: null, emailVerificationExpires: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db.update(users)
      .set({ passwordResetToken: null, passwordResetExpires: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setRefreshToken(userId: string, token: string | null): Promise<void> {
    await db.update(users)
      .set({ refreshToken: token, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserSubscription(userId: string, data: {
    stripeCustomerId?: string;
    subscriptionStatus?: string;
    subscriptionPriceId?: string | null;
    subscriptionCurrentPeriodEnd?: Date | null;
  }): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
    return result[0];
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: string, userId: string): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).limit(1);
    return result[0];
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await db.insert(goals).values(goal).returning();
    return result[0];
  }

  async updateGoal(id: string, userId: string, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await db.update(goals)
      .set(goal)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).returning();
    return result.length > 0;
  }

  // Routines
  async getRoutines(userId: string): Promise<Routine[]> {
    return await db.select().from(routines).where(and(eq(routines.userId, userId), eq(routines.archived, false)));
  }

  async getRoutine(id: string, userId: string): Promise<Routine | undefined> {
    const result = await db.select().from(routines).where(and(eq(routines.id, id), eq(routines.userId, userId))).limit(1);
    return result[0];
  }

  async createRoutine(routine: InsertRoutine): Promise<Routine> {
    const result = await db.insert(routines).values(routine).returning();
    return result[0];
  }

  async updateRoutine(id: string, userId: string, routine: Partial<InsertRoutine>): Promise<Routine | undefined> {
    const result = await db.update(routines)
      .set(routine)
      .where(and(eq(routines.id, id), eq(routines.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteRoutine(id: string, userId: string): Promise<boolean> {
    const result = await db.update(routines)
      .set({ archived: true, archivedAt: new Date() })
      .where(and(eq(routines.id, id), eq(routines.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Schedule Items
  async getScheduleItems(userId: string): Promise<ScheduleItem[]> {
    return await db.select().from(scheduleItems).where(eq(scheduleItems.userId, userId));
  }

  async getScheduleItem(id: string): Promise<ScheduleItem | undefined> {
    const result = await db.select().from(scheduleItems).where(eq(scheduleItems.id, id)).limit(1);
    return result[0];
  }

  async createScheduleItem(item: InsertScheduleItem): Promise<ScheduleItem> {
    const result = await db.insert(scheduleItems).values(item).returning();
    return result[0];
  }

  async updateScheduleItem(id: string, userId: string, item: Partial<InsertScheduleItem>): Promise<ScheduleItem | undefined> {
    const result = await db.update(scheduleItems)
      .set(item)
      .where(and(eq(scheduleItems.id, id), eq(scheduleItems.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteScheduleItem(id: string): Promise<boolean> {
    const result = await db.delete(scheduleItems).where(eq(scheduleItems.id, id)).returning();
    return result.length > 0;
  }

  // Daily Reflections
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | undefined> {
    const result = await db.select().from(dailyReflections)
      .where(and(eq(dailyReflections.userId, userId), eq(dailyReflections.date, date)))
      .limit(1);
    return result[0];
  }

  async upsertDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection> {
    const existing = await this.getDailyReflection(reflection.userId, reflection.date);
    
    if (existing) {
      const result = await db.update(dailyReflections)
        .set(reflection)
        .where(eq(dailyReflections.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(dailyReflections).values(reflection).returning();
      return result[0];
    }
  }

  // Assessment Scores
  async getAssessmentScores(userId: string): Promise<AssessmentScore[]> {
    return await db.select().from(assessmentScores).where(eq(assessmentScores.userId, userId));
  }

  async upsertAssessmentScore(score: InsertAssessmentScore): Promise<AssessmentScore> {
    const existing = await db.select().from(assessmentScores)
      .where(and(eq(assessmentScores.userId, score.userId), eq(assessmentScores.word, score.word)))
      .limit(1);
    
    if (existing[0]) {
      const result = await db.update(assessmentScores)
        .set({ 
          score: score.score, 
          notes: score.notes,
          selectedForAction: score.selectedForAction,
          updatedAt: new Date() 
        })
        .where(eq(assessmentScores.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(assessmentScores).values(score).returning();
      return result[0];
    }
  }

  // Levers
  async getLevers(userId: string): Promise<Lever[]> {
    return await db.select().from(levers).where(eq(levers.userId, userId));
  }

  async upsertLever(lever: InsertLever): Promise<Lever> {
    const existing = await db.select().from(levers)
      .where(and(eq(levers.userId, lever.userId), eq(levers.leverTitle, lever.leverTitle)))
      .limit(1);
    
    if (existing[0]) {
      const result = await db.update(levers)
        .set({ ...lever, updatedAt: new Date() })
        .where(eq(levers.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(levers).values(lever).returning();
      return result[0];
    }
  }

  // Badges
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    
    return results.map(r => ({
      ...r.user_badges,
      badge: r.badges
    }));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const hasIt = await this.hasUserBadge(userId, badgeId);
    if (hasIt) return null;
    
    const result = await db.insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    
    const badge = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
    if (badge[0]) {
      const stats = await this.getUserStats(userId);
      if (stats) {
        await this.upsertUserStats({
          userId,
          totalPoints: stats.totalPoints + badge[0].points,
          goalsCompleted: stats.goalsCompleted,
          routinesCompleted: stats.routinesCompleted,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          assessmentsCompleted: stats.assessmentsCompleted,
          leversActivated: stats.leversActivated,
        });
      }
    }
    
    return result[0];
  }

  async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .limit(1);
    return result.length > 0;
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const result = await db.select().from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);
    return result[0];
  }

  async upsertUserStats(stats: InsertUserStats): Promise<UserStats> {
    const existing = await this.getUserStats(stats.userId);
    
    if (existing) {
      const result = await db.update(userStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(userStats.userId, stats.userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userStats).values(stats).returning();
      return result[0];
    }
  }

  async getLeaderboard(limit: number = 10): Promise<(UserStats & { user: User })[]> {
    const results = await db
      .select()
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.totalPoints))
      .limit(limit);
    
    return results.map(r => ({
      ...r.user_stats,
      user: r.users
    }));
  }

  // Admin
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(userId: string): Promise<boolean> {
    await db.delete(goals).where(eq(goals.userId, userId));
    await db.delete(routines).where(eq(routines.userId, userId));
    await db.delete(scheduleItems).where(eq(scheduleItems.userId, userId));
    await db.delete(dailyReflections).where(eq(dailyReflections.userId, userId));
    await db.delete(assessmentScores).where(eq(assessmentScores.userId, userId));
    await db.delete(levers).where(eq(levers.userId, userId));
    await db.delete(userBadges).where(eq(userBadges.userId, userId));
    await db.delete(userStats).where(eq(userStats.userId, userId));
    const result = await db.delete(users).where(eq(users.id, userId));
    return true;
  }
}

export const storage = new DatabaseStorage();

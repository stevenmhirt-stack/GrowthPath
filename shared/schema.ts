import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  refreshToken: varchar("refresh_token"),
  stripeCustomerId: varchar("stripe_customer_id"),
  subscriptionStatus: varchar("subscription_status").default("free"),
  subscriptionPriceId: varchar("subscription_price_id"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  goalType: text("goal_type").notNull().default('near-term'),
  status: text("status").notNull().default('In Progress'),
  progress: integer("progress").notNull().default(0),
  deadline: text("deadline").notNull(),
  description: text("description").notNull(),
  milestones: jsonb("milestones").notNull().default('[]'),
  formData: jsonb("form_data").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_goals_user_status").on(table.userId, table.status),
]);

export const routines = pgTable("routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  time: text("time"),
  frequency: text("frequency").notNull(),
  category: text("category").notNull(),
  completed: boolean("completed").notNull().default(false),
  streak: integer("streak").notNull().default(0),
  measureOfSuccess: text("measure_of_success"),
  scheduledDays: jsonb("scheduled_days").default('[]'),
  lastCompleted: timestamp("last_completed"),
  completionHistory: jsonb("completion_history").default('[]'),
  archived: boolean("archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_routines_user_date").on(table.userId, table.createdAt),
]);

export const scheduleItems = pgTable("schedule_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  time: text("time").notNull(),
  activity: text("activity").notNull(),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_schedule_user_date").on(table.userId, table.createdAt),
]);

export const dailyReflections = pgTable("daily_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  mainFocus: text("main_focus"),
  gratitude: text("gratitude"),
  wins: text("wins"),
  improvements: text("improvements"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentScores = pgTable("assessment_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  word: text("word").notNull(),
  score: integer("score").notNull().default(5),
  notes: text("notes"),
  selectedForAction: text("selected_for_action"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const levers = pgTable("levers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  leverTitle: text("lever_title").notNull(),
  score: integer("score").notNull().default(5),
  actionItem: text("action_item"),
  selectedActions: jsonb("selected_actions").notNull().default('[]'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badges - predefined achievement badges
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirement: text("requirement").notNull(),
  points: integer("points").notNull().default(10),
});

// User badges - tracks which badges users have earned
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// User stats - tracks points and achievements for leaderboard
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalPoints: integer("total_points").notNull().default(0),
  goalsCompleted: integer("goals_completed").notNull().default(0),
  routinesCompleted: integer("routines_completed").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  assessmentsCompleted: integer("assessments_completed").notNull().default(0),
  leversActivated: integer("levers_activated").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Chat conversations and messages
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert/Upsert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertRoutineSchema = createInsertSchema(routines).omit({
  id: true,
  createdAt: true,
  archived: true,
  archivedAt: true,
});

export const insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({
  id: true,
  createdAt: true,
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentScoreSchema = createInsertSchema(assessmentScores).omit({
  id: true,
  updatedAt: true,
});

export const insertLeverSchema = createInsertSchema(levers).omit({
  id: true,
  updatedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges);

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type Routine = typeof routines.$inferSelect;

export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;
export type ScheduleItem = typeof scheduleItems.$inferSelect;

export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;

export type InsertAssessmentScore = z.infer<typeof insertAssessmentScoreSchema>;
export type AssessmentScore = typeof assessmentScores.$inferSelect;

export type InsertLever = z.infer<typeof insertLeverSchema>;
export type Lever = typeof levers.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

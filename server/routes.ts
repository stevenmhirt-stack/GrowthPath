import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { insertGoalSchema, insertRoutineSchema, insertScheduleItemSchema, insertDailyReflectionSchema, insertAssessmentScoreSchema, insertLeverSchema } from "@shared/schema";
import { checkAndAwardBadges, checkReflectionBadge } from "./badgeService";
import bcrypt from "bcryptjs";
import { authLimiter, apiLimiter } from "./middleware";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, generateVerificationToken, generatePasswordResetToken, hashToken, TOKEN_EXPIRY } from "./jwtService";
import { sendVerificationEmail, sendPasswordResetEmail } from "./emailService";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { getAISuggestion, type AIAssistRequest } from "./aiAssistant";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication (Replit Auth)
  await setupAuth(app);

  // Development fallback user ID
  const DEV_USER_ID = "dev-user-123";
  
  // Ensure dev user exists in development mode
  if (process.env.NODE_ENV === "development") {
    storage.upsertUser({
      id: DEV_USER_ID,
      email: "dev@test.com",
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
    }).catch(console.error);
  }

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check session-based auth first
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          req.user = { claims: { sub: req.session.userId } };
          return res.json(user);
        }
      }
      // Check Replit Auth
      if (req.user?.claims?.sub) {
        const user = await storage.getUser(req.user.claims.sub);
        if (user) {
          return res.json(user);
        }
      }
      // Development fallback - auto-login as dev user
      if (process.env.NODE_ENV === "development") {
        const devUser = await storage.getUser(DEV_USER_ID);
        if (devUser) {
          req.session.userId = DEV_USER_ID;
          return res.json(devUser);
        }
      }
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email/Password Signup with JWT and Email Verification
  app.post('/api/auth/signup', authLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser(email, hashedPassword, firstName, lastName);

      const verificationToken = generateVerificationToken();
      const verificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);
      await storage.setEmailVerificationToken(user.id, verificationToken, verificationExpires);

      sendVerificationEmail(email, verificationToken, firstName || undefined).catch(console.error);

      const accessToken = generateAccessToken(user.id, email);
      const refreshToken = generateRefreshToken(user.id, email);
      await storage.setRefreshToken(user.id, hashToken(refreshToken));

      (req.session as any).userId = user.id;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRY.REFRESH,
      });
      
      res.status(201).json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: false,
        },
        accessToken,
        message: "Account created. Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Email/Password Login with JWT
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const accessToken = generateAccessToken(user.id, user.email!);
      const refreshToken = generateRefreshToken(user.id, user.email!);
      await storage.setRefreshToken(user.id, hashToken(refreshToken));

      (req.session as any).userId = user.id;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRY.REFRESH,
      });
      
      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
        accessToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Refresh Token endpoint
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const hashedToken = hashToken(refreshToken);
      const user = await storage.getUserByRefreshToken(hashedToken);
      if (!user) {
        return res.status(403).json({ message: "Token reuse detected" });
      }

      const newAccessToken = generateAccessToken(user.id, user.email!);
      const newRefreshToken = generateRefreshToken(user.id, user.email!);
      await storage.setRefreshToken(user.id, hashToken(newRefreshToken));

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: TOKEN_EXPIRY.REFRESH,
      });

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({ message: "Failed to refresh token" });
    }
  });

  // Email Verification endpoint
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      await storage.verifyEmail(user.id);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If this email exists, a verification link has been sent" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      const verificationToken = generateVerificationToken();
      const verificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);
      await storage.setEmailVerificationToken(user.id, verificationToken, verificationExpires);

      await sendVerificationEmail(email, verificationToken, user.firstName || undefined);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Forgot Password - Request reset
  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      console.log("Forgot password request received");
      const { email } = req.body;
      console.log(`Forgot password for email: ${email}`);
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      console.log(`User found: ${user ? 'yes' : 'no'}`);
      if (user) {
        const resetToken = generatePasswordResetToken();
        const resetExpires = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);
        await storage.setPasswordResetToken(user.id, hashToken(resetToken), resetExpires);
        console.log("Password reset token set, sending email...");
        const emailSent = await sendPasswordResetEmail(email, resetToken, user.firstName || undefined);
        console.log(`Email send result: ${emailSent ? 'success' : 'failed'}`);
      }

      res.json({ message: "If this email exists, a password reset link has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset Password
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const hashedResetToken = hashToken(token);
      const user = await storage.getUserByPasswordResetToken(hashedResetToken);
      if (!user) {
        return res.status(400).json({ message: "Invalid reset token" });
      }

      if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.clearPasswordResetToken(user.id);
      await storage.setRefreshToken(user.id, null);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Logout (works for both auth methods)
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      if (req.session?.userId) {
        await storage.setRefreshToken(req.session.userId, null);
      }
      
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Premium middleware - checks if user has active subscription
  const requirePremium = async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const status = user.subscriptionStatus;
      if (status === 'active' || status === 'trialing') {
        return next();
      }
      return res.status(402).json({ 
        message: "Premium subscription required", 
        upgradeRequired: true,
        upgradePath: "/api/billing/checkout"
      });
    } catch (error) {
      console.error("Premium check error:", error);
      return res.status(500).json({ message: "Failed to verify subscription" });
    }
  };

  // Goals API - Protected
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
      const goal = await storage.createGoal(goalData);
      await checkAndAwardBadges(userId);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.updateGoal(req.params.id, userId, req.body);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      await checkAndAwardBadges(userId);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteGoal(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Routines API - Protected (Premium)
  app.get("/api/routines", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routines = await storage.getRoutines(userId);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routines" });
    }
  });

  app.post("/api/routines", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routineData = insertRoutineSchema.parse({ ...req.body, userId });
      const routine = await storage.createRoutine(routineData);
      await checkAndAwardBadges(userId);
      res.status(201).json(routine);
    } catch (error) {
      res.status(400).json({ error: "Invalid routine data" });
    }
  });

  app.patch("/api/routines/:id", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = { ...req.body };
      
      // Convert string dates to Date objects for Drizzle
      if (updateData.lastCompleted && typeof updateData.lastCompleted === 'string') {
        updateData.lastCompleted = new Date(updateData.lastCompleted);
      }
      
      const routine = await storage.updateRoutine(req.params.id, userId, updateData);
      if (!routine) {
        return res.status(404).json({ error: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(400).json({ error: "Failed to update routine" });
    }
  });

  app.delete("/api/routines/:id", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteRoutine(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Routine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete routine" });
    }
  });

  // Schedule Items API - Protected (Premium)
  app.get("/api/schedule", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getScheduleItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule items" });
    }
  });

  app.post("/api/schedule", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = insertScheduleItemSchema.parse({ ...req.body, userId });
      const item = await storage.createScheduleItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid schedule item data" });
    }
  });

  app.delete("/api/schedule/:id", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const item = await storage.getScheduleItem(req.params.id);
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: "Schedule item not found" });
      }
      await storage.deleteScheduleItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule item" });
    }
  });

  // Daily Reflections API - Protected (Premium)
  app.get("/api/reflections/:date", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reflection = await storage.getDailyReflection(userId, req.params.date);
      res.json(reflection || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  app.post("/api/reflections", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reflectionData = insertDailyReflectionSchema.parse({ ...req.body, userId });
      const reflection = await storage.upsertDailyReflection(reflectionData);
      await checkReflectionBadge(userId);
      res.json(reflection);
    } catch (error) {
      res.status(400).json({ error: "Invalid reflection data" });
    }
  });

  // Assessment Scores API - Protected (Premium)
  app.get("/api/assessment", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scores = await storage.getAssessmentScores(userId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment scores" });
    }
  });

  app.post("/api/assessment", isAuthenticated, requirePremium, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scoreData = insertAssessmentScoreSchema.parse({ ...req.body, userId });
      const score = await storage.upsertAssessmentScore(scoreData);
      await checkAndAwardBadges(userId);
      res.json(score);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment score data" });
    }
  });

  // Levers API - Protected
  app.get("/api/levers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const levers = await storage.getLevers(userId);
      res.json(levers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch levers" });
    }
  });

  app.post("/api/levers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leverData = insertLeverSchema.parse({ ...req.body, userId });
      const lever = await storage.upsertLever(leverData);
      await checkAndAwardBadges(userId);
      res.json(lever);
    } catch (error) {
      res.status(400).json({ error: "Invalid lever data" });
    }
  });

  // Badges API - Protected
  app.get("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/badges/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  app.post("/api/badges/award/:badgeId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBadge = await storage.awardBadge(userId, req.params.badgeId);
      if (!userBadge) {
        return res.status(200).json({ message: "Badge already earned" });
      }
      res.status(201).json(userBadge);
    } catch (error) {
      res.status(400).json({ error: "Failed to award badge" });
    }
  });

  // User Stats & Leaderboard API - Protected
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
          leversActivated: 0
        });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  app.get("/api/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Billing Routes
  app.get("/api/billing/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        subscriptionStatus: user.subscriptionStatus || "free",
        stripeCustomerId: user.stripeCustomerId || null,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd || null,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/billing/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan = 'monthly' } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stripe = await getUncachableStripeClient();
      
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserSubscription(userId, { stripeCustomerId: customerId });
      }

      const prices = await stripe.prices.list({
        active: true,
        type: 'recurring',
        limit: 10,
      });

      if (prices.data.length === 0) {
        return res.status(400).json({ 
          error: "No subscription products configured. Please create recurring products in the Stripe Dashboard." 
        });
      }

      const targetInterval = plan === 'yearly' ? 'year' : 'month';
      const selectedPrice = prices.data.find(p => p.recurring?.interval === targetInterval) || prices.data[0];

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: selectedPrice.id, quantity: 1 }],
        success_url: `${req.protocol}://${req.get('host')}/?checkout=success`,
        cancel_url: `${req.protocol}://${req.get('host')}/?checkout=canceled`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      const message = error?.message || "Failed to create checkout session";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/billing/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No billing account found" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.protocol}://${req.get('host')}/`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error fetching publishable key:", error);
      res.status(500).json({ error: "Failed to fetch publishable key" });
    }
  });

  // AI Assistant endpoint for form completion help
  app.post("/api/ai/assist", isAuthenticated, apiLimiter, async (req: any, res) => {
    try {
      const { context, fieldName, currentValue, formType } = req.body as AIAssistRequest;
      
      if (!fieldName || !formType) {
        return res.status(400).json({ error: "fieldName and formType are required" });
      }

      const suggestion = await getAISuggestion({
        context: context || "",
        fieldName,
        currentValue,
        formType,
      });

      res.json({ suggestion });
    } catch (error) {
      console.error("AI assist error:", error);
      res.status(500).json({ error: "Failed to get AI suggestion" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    next();
  };

  // Admin API endpoints
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        emailVerified: u.emailVerified,
        subscriptionStatus: u.subscriptionStatus,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.claims.sub;
      
      if (id === currentUserId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const allowedUpdates: Partial<any> = {};
      if (updates.subscriptionStatus !== undefined) allowedUpdates.subscriptionStatus = updates.subscriptionStatus;
      if (updates.isAdmin !== undefined) allowedUpdates.isAdmin = updates.isAdmin;
      
      const user = await storage.updateUser(id, allowedUpdates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  return httpServer;
}

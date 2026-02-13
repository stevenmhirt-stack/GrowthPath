import { Layout } from "@/components/layout";
import { BigXHeader } from "@/components/big-x-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { userProfile } from "@/lib/mock-data";
import { ArrowRight, CheckCircle2, Trophy, Zap, Star, AlertTriangle, Flame, Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import generatedImage from "@assets/generated_images/abstract_geometric_growth_background.png";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getRoutines } from "@/lib/api";
import type { Goal, Lever, AssessmentScore, Routine } from "@shared/schema";
import { getRoutinesForDay, type RoutineScheduleInfo } from "@shared/scheduling";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { BookOpen, Target, Users, MessageSquare, Lightbulb, TrendingUp, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: levers = [] } = useQuery<Lever[]>({
    queryKey: ["/api/levers"],
  });

  const { data: assessmentScores = [] } = useQuery<AssessmentScore[]>({
    queryKey: ["/api/assessment"],
  });

  const { data: routines = [] } = useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: getRoutines,
  });

  const todaysRoutines = useMemo(() => {
    const today = new Date();
    const routineInfos: RoutineScheduleInfo[] = routines.map(r => ({
      id: r.id,
      title: r.title,
      time: r.time,
      frequency: r.frequency,
      scheduledDays: r.scheduledDays as string[] | null,
      category: r.category,
      completed: r.completed,
      streak: r.streak,
      measureOfSuccess: r.measureOfSuccess,
      createdAt: r.createdAt,
    }));
    const scheduled = getRoutinesForDay(routineInfos, today);
    return routines.filter(r => scheduled.some(s => s.id === r.id));
  }, [routines]);

  const routineStats = useMemo(() => {
    const completed = todaysRoutines.filter(r => r.completed).length;
    const total = todaysRoutines.length;
    const dailyPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    let weeklyCompletions = 0;
    let monthlyCompletions = 0;
    let ytdCompletions = 0;
    
    routines.forEach(routine => {
      const history = (routine.completionHistory as string[]) || [];
      const uniqueDates = new Set<string>();
      history.forEach(dateStr => {
        const completionDate = new Date(dateStr);
        const dateKey = completionDate.toISOString().split('T')[0];
        if (!uniqueDates.has(dateKey)) {
          uniqueDates.add(dateKey);
          if (completionDate >= startOfWeek) weeklyCompletions++;
          if (completionDate >= startOfMonth) monthlyCompletions++;
          if (completionDate >= startOfYear) ytdCompletions++;
        }
      });
    });
    
    return { 
      completed, 
      total, 
      dailyPercentage,
      weeklyCompletions,
      monthlyCompletions,
      ytdCompletions,
    };
  }, [todaysRoutines, routines]);

  const activeLevers = useMemo(() => {
    return levers
      .filter(lever => {
        const data = lever.selectedActions as { isActive?: boolean } | null;
        return data?.isActive === true && lever.actionItem;
      })
      .map(lever => {
        const data = lever.selectedActions as { isActive?: boolean; progress?: number } | null;
        return {
          title: lever.actionItem || '',
          position: lever.leverTitle.replace('position-', ''),
          progress: data?.progress ?? 0,
        };
      });
  }, [levers]);

  const { topStrengths, topWeaknesses } = useMemo(() => {
    if (assessmentScores.length === 0) {
      return { topStrengths: [], topWeaknesses: [] };
    }
    
    const sorted = [...assessmentScores].sort((a, b) => b.score - a.score);
    return {
      topStrengths: sorted.slice(0, 3),
      topWeaknesses: sorted.slice(-3).reverse(),
    };
  }, [assessmentScores]);

  const leverRadarData = useMemo(() => {
    const leverNames = ["Mindset", "Energy", "Relationships", "Skills", "Systems", "Time", "Focus", "Balance"];
    return leverNames.map(name => {
      const lever = levers.find(l => l.leverTitle.toLowerCase().includes(name.toLowerCase()));
      return {
        subject: name,
        score: lever?.score || 5,
        fullMark: 10,
      };
    });
  }, [levers]);

  const streakChartData = useMemo(() => {
    const last7Days: { date: string; completions: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let completions = 0;
      routines.forEach(routine => {
        const history = (routine.completionHistory as string[]) || [];
        if (history.some(h => h.startsWith(dateStr))) {
          completions++;
        }
      });
      
      last7Days.push({ date: dayLabel, completions });
    }
    return last7Days;
  }, [routines]);

  const categoryCompletionData = useMemo(() => {
    const categories = ["Health/Wellness", "Mindframe", "Learning/Development", "Business"];
    return categories.map(cat => {
      const catRoutines = routines.filter(r => r.category === cat);
      const completed = catRoutines.filter(r => r.completed).length;
      const total = catRoutines.length;
      return {
        category: cat.split('/')[0],
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }).filter(c => c.total > 0);
  }, [routines]);

  const suggestedRoutines = useMemo(() => {
    const suggestions: { title: string; reason: string; category: string }[] = [];
    
    const sortedScores = [...assessmentScores].sort((a, b) => a.score - b.score);
    const weakAreas = sortedScores.slice(0, 3);
    
    weakAreas.forEach(area => {
      if (area.score <= 4) {
        const existingRoutine = routines.find(r => 
          r.title.toLowerCase().includes(area.word.toLowerCase())
        );
        if (!existingRoutine) {
          suggestions.push({
            title: `Practice ${area.word}`,
            reason: `Your ${area.word} score is ${area.score}/10 - building a routine can help improve this`,
            category: "Learning/Development",
          });
        }
      }
    });
    
    levers.forEach(lever => {
      if (lever.score <= 4) {
        const leverName = lever.leverTitle.replace('position-', '');
        const existingRoutine = routines.find(r => 
          r.title.toLowerCase().includes(leverName.toLowerCase())
        );
        if (!existingRoutine && suggestions.length < 5) {
          suggestions.push({
            title: `Improve ${leverName}`,
            reason: `Your ${leverName} lever is at ${lever.score}/10`,
            category: "Health/Wellness",
          });
        }
      }
    });
    
    if (routineStats.dailyPercentage < 50 && routines.length > 0) {
      suggestions.push({
        title: "Review daily commitments",
        reason: "Your routine completion is below 50% - consider simplifying your routine list",
        category: "Mindframe",
      });
    }
    
    return suggestions.slice(0, 3);
  }, [assessmentScores, levers, routines, routineStats.dailyPercentage]);

  const generateShareableProgress = () => {
    const completed = goals.filter(g => g.status === "Completed").length;
    const avgLeverScore = levers.length > 0 
      ? Math.round(levers.reduce((sum, l) => sum + l.score, 0) / levers.length * 10) / 10
      : 0;
    
    const shareText = `My GrowthPath Progress:\n\n` +
      `Big X: ${bigX}\n` +
      `Goals: ${completed}/${goals.length} completed\n` +
      `Routines Today: ${routineStats.completed}/${routineStats.total} (${routineStats.dailyPercentage}%)\n` +
      `Average Lever Score: ${avgLeverScore}/10\n` +
      `Weekly Completions: ${routineStats.weeklyCompletions}\n\n` +
      `#GrowthPath #PersonalDevelopment`;
    
    return shareText;
  };

  const handleCopyProgress = () => {
    const text = generateShareableProgress();
    navigator.clipboard.writeText(text);
    toast({ title: "Progress copied to clipboard!" });
    setIsShareDialogOpen(false);
  };

  const activeGoals = goals.filter((g) => g.status === "In Progress");
  const bigXGoal = goals.find((g) => g.goalType === "big-x");
  const bigXFormData = bigXGoal?.formData as { 
    bigXName?: string; 
    purpose?: string;
    intermediateGoal?: string;
    confidentOrEasiest?: string;
    currentCapability?: string;
    currentProgress?: number;
  } | null;
  const bigX = bigXFormData?.bigXName || bigXGoal?.title || activeGoals[0]?.title || "Set your first goal";
  const bigXPurpose = bigXFormData?.purpose || bigXGoal?.description || "";
  
  const totalGoalsCount = useMemo(() => {
    let count = 0;
    if (bigXFormData?.bigXName) count++;
    if (bigXFormData?.intermediateGoal) count++;
    if (bigXFormData?.confidentOrEasiest) count++;
    if (bigXFormData?.currentCapability) count++;
    const inProgressGoals = goals.filter(g => g.status === "In Progress" && g.goalType !== "big-x");
    count += inProgressGoals.length;
    return count;
  }, [bigXFormData, goals]);
  
  const completionRate = bigXFormData?.currentProgress ?? 0;

  const getUserFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split("@")[0];
    return "there";
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <BigXHeader />
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 shadow-xl">
          <div className="absolute inset-0 z-0">
            <img
              src={generatedImage}
              alt="Background"
              className="h-full w-full object-cover opacity-20 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-md border border-white/20">
              <span className="mr-2 h-2 w-2 rounded-full bg-secondary animate-pulse" />
              Current Streak: {userProfile.stats.currentStreak} Days
            </div>
            <h1
              className="text-4xl font-display font-bold tracking-tight md:text-5xl"
              data-testid="text-welcome"
            >
              Welcome back, {getUserFirstName()}
            </h1>
            <p className="text-xl font-semibold text-primary-foreground">
              Your Big X: <span className="text-secondary">{bigX}</span>
            </p>
            {bigXPurpose && (
              <p className="text-lg text-primary-foreground/80 italic">
                Purpose: "{bigXPurpose}"
              </p>
            )}
            {!bigXPurpose && (
              <p className="text-lg text-primary-foreground/80">
                You've made great progress this week on your Big X!
              </p>
            )}
            <div className="pt-4 flex gap-3">
              <Link href="/goals">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold shadow-lg shadow-secondary/20"
                >
                  View Goals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/assessment">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  Take Assessment
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/daily">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid="quick-action-reflection">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Daily Planner</p>
                  <p className="text-xs text-muted-foreground">Plan your day</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/daily">
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid="quick-action-routine">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Start Routine</p>
                  <p className="text-xs text-muted-foreground">Check off today's habits</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/goals">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid="quick-action-goal">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium">View Goals</p>
                  <p className="text-xs text-muted-foreground">See your progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsShareDialogOpen(true)} data-testid="quick-action-share">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Share2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Share Progress</p>
                <p className="text-xs text-muted-foreground">With accountability partner</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <TooltipProvider>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Goals
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      <p>Goals from your Big X form (Big X, Intermediate, Confident, Current Capability) plus any other goals currently In Progress.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Trophy className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-goals">
                  {totalGoalsCount}
                </div>
                <p className="text-xs text-muted-foreground">Track your progress</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Levers
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p>Levers you've marked as "active" in the 8 Levers page with a defined action item. These are your current priority focus areas.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Zap className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLevers.length}</div>
                <p className="text-xs text-muted-foreground">Priority focus areas</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Today's Routines
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      <p>Routines scheduled for today based on their frequency settings (daily, weekly, monthly). Shows how many you've completed out of the total scheduled.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {routineStats.completed}/{routineStats.total}
                </div>
                <p className="text-xs text-muted-foreground">{routineStats.dailyPercentage}% completed today</p>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>

        {/* Today's Routines Section */}
        {todaysRoutines.length > 0 && (
          <Card className="border-none shadow-lg bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-xl">Today's Routines</CardTitle>
                  <CardDescription>
                    {routineStats.completed} of {routineStats.total} completed ({routineStats.dailyPercentage}%)
                  </CardDescription>
                </div>
                <Link href="/daily">
                  <Button variant="ghost" size="sm">
                    Go to Daily Planner <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <Progress value={routineStats.dailyPercentage} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {todaysRoutines.map(routine => (
                  <div 
                    key={routine.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all w-full text-left
                      ${routine.completed 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50 border border-transparent'}
                    `}
                    data-testid={`dashboard-routine-${routine.id}`}
                  >
                    <div className={`
                      h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${routine.completed 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground/30'}
                    `}>
                      {routine.completed && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${routine.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {routine.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {routine.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {routine.time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" /> {routine.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Routine Completion Stats */}
        {routines.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{routineStats.dailyPercentage}%</div>
                <Progress value={routineStats.dailyPercentage} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{routineStats.completed}/{routineStats.total} routines</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{routineStats.weeklyCompletions}</div>
                <p className="text-xs text-muted-foreground mt-1">routine completions</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{routineStats.monthlyCompletions}</div>
                <p className="text-xs text-muted-foreground mt-1">routine completions</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Year to Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{routineStats.ytdCompletions}</div>
                <p className="text-xs text-muted-foreground mt-1">routine completions</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Visualizations */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 7-Day Streak Chart */}
          <Card className="border-none shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                7-Day Activity
              </CardTitle>
              <CardDescription>Routine completions over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={streakChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* AI-Powered Suggestions */}
        {suggestedRoutines.length > 0 && (
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Suggested Actions
              </CardTitle>
              <CardDescription>Personalized recommendations based on your assessment and lever scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {suggestedRoutines.map((suggestion, index) => (
                  <div key={index} className="p-4 rounded-lg bg-card border shadow-sm" data-testid={`suggestion-${index}`}>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{suggestion.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{suggestion.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          {/* Active Goals */}
          <Card className="col-span-4 border-none shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Active Goals</CardTitle>
              <CardDescription>Your top priorities for this quarter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-4">Loading goals...</p>
              ) : activeGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No active goals yet. Add one to get started!
                </p>
              ) : (
                activeGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2 group" data-testid={`goal-item-${goal.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {goal.category[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium leading-none group-hover:text-primary transition-colors">
                            {goal.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                      </div>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Levers & Strengths/Weaknesses */}
          <div className="col-span-3 space-y-6">
            {/* Active Levers */}
            <Card className="border-none shadow-lg bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">Active Levers</CardTitle>
                    <CardDescription>Your current priority focus areas</CardDescription>
                  </div>
                  <Link href="/levers">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activeLevers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active levers. Go to the Levers page to set your priorities.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeLevers.map((lever, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {lever.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm block truncate">{lever.title}</span>
                          </div>
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex-shrink-0">
                            {lever.progress}%
                          </Badge>
                        </div>
                        <Progress value={lever.progress} className="h-1.5 mt-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Strengths */}
            <Card className="border-none shadow-lg bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="font-display text-lg">Top Strengths</CardTitle>
                  </div>
                  <Link href="/assessment">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {topStrengths.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Take the assessment to see your strengths
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topStrengths.map((item) => (
                      <div 
                        key={item.word}
                        className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10"
                      >
                        <span className="font-medium text-sm">{item.word}</span>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                          {item.score}/10
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Areas to Improve */}
            <Card className="border-none shadow-lg bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <CardTitle className="font-display text-lg">Areas to Improve</CardTitle>
                  </div>
                  <Link href="/assessment">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {topWeaknesses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Take the assessment to identify growth areas
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topWeaknesses.map((item) => (
                      <div 
                        key={item.word}
                        className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10"
                      >
                        <span className="font-medium text-sm">{item.word}</span>
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 dark:text-orange-400">
                          {item.score}/10
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Progress Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Share Your Progress
            </DialogTitle>
            <DialogDescription>
              Share your GrowthPath progress with an accountability partner, mentor, or friend
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/50 border text-sm whitespace-pre-wrap font-mono">
              {generateShareableProgress()}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyProgress} data-testid="button-copy-progress">
              <MessageSquare className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

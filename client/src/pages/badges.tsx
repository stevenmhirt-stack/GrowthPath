import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Badge, UserBadge, UserStats } from "@shared/schema";
import { 
  Target, Trophy, CheckCircle, Star, Repeat, Flame, Zap, Brain, 
  Settings, Sliders, BookOpen, Sunrise, Calendar, Award, Lock
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'target': Target,
  'trophy': Trophy,
  'check-circle': CheckCircle,
  'star': Star,
  'repeat': Repeat,
  'flame': Flame,
  'zap': Zap,
  'brain': Brain,
  'settings': Settings,
  'sliders': Sliders,
  'book-open': BookOpen,
  'sunrise': Sunrise,
  'calendar': Calendar,
  'award': Award,
};

const categoryColors: Record<string, string> = {
  'goals': 'bg-blue-500/10 text-blue-600 border-blue-200',
  'routines': 'bg-green-500/10 text-green-600 border-green-200',
  'streaks': 'bg-orange-500/10 text-orange-600 border-orange-200',
  'assessment': 'bg-purple-500/10 text-purple-600 border-purple-200',
  'levers': 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  'daily': 'bg-pink-500/10 text-pink-600 border-pink-200',
  'engagement': 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

export default function Badges() {
  const { data: allBadges = [], isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ["/api/badges"],
  });

  const { data: userBadges = [], isLoading: userBadgesLoading } = useQuery<(UserBadge & { badge: Badge })[]>({
    queryKey: ["/api/badges/user"],
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  const earnedCount = earnedBadgeIds.size;
  const totalCount = allBadges.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const isLoading = badgesLoading || userBadgesLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading badges...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Badges & Achievements
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and unlock achievements
            </p>
          </div>
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Points</span>
                <BadgeUI variant="secondary" className="bg-primary/10 text-primary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {userStats?.totalPoints || 0}
                </BadgeUI>
              </div>
              <div className="text-xs text-muted-foreground">
                {earnedCount} of {totalCount} badges earned
              </div>
              <Progress value={progressPercent} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedData = userBadges.find(ub => ub.badgeId === badge.id);
            const IconComponent = iconMap[badge.icon] || Award;
            const colorClass = categoryColors[badge.category] || 'bg-gray-500/10 text-gray-600 border-gray-200';

            return (
              <Card 
                key={badge.id} 
                className={`relative overflow-hidden transition-all duration-200 ${
                  isEarned 
                    ? 'border-primary/30 shadow-md hover:shadow-lg' 
                    : 'opacity-60 grayscale hover:opacity-80'
                }`}
                data-testid={`card-badge-${badge.id}`}
              >
                {isEarned && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${colorClass}`}>
                    {isEarned ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6 opacity-50" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <BadgeUI variant="outline" className={colorClass}>
                      {badge.category}
                    </BadgeUI>
                    <span className="font-medium text-primary">+{badge.points} pts</span>
                  </div>
                  {isEarned && earnedData?.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {badge.requirement}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {allBadges.length === 0 && (
          <Card className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No badges available yet</h3>
            <p className="text-sm text-muted-foreground">
              Badges will appear here as you use the platform
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}

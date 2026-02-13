import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { UserStats, User } from "@shared/schema";
import { Trophy, Medal, Crown, Target, Flame, Star, Users } from "lucide-react";

type LeaderboardEntry = UserStats & { user: User };

export default function Leaderboard() {
  const { user: currentUser } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const currentUserRank = leaderboard.findIndex(entry => entry.userId === currentUser?.id) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
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
              Leaderboard
            </h1>
            <p className="text-muted-foreground mt-1">
              See how you rank against other users
            </p>
          </div>
          {userStats && (
            <Card className="w-72">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Your Rank</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        #{currentUserRank || '-'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {userStats.totalPoints} pts
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Users ranked by total points earned
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No rankings yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to earn points and appear on the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isCurrentUser = entry.userId === currentUser?.id;
                      
                      return (
                        <div 
                          key={entry.id}
                          className={`flex items-center gap-4 p-4 transition-colors ${
                            isCurrentUser ? 'bg-primary/5' : ''
                          } ${getRankBg(rank)}`}
                          data-testid={`row-leaderboard-${rank}`}
                        >
                          <div className="w-10 flex justify-center">
                            {getRankIcon(rank)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {entry.user.firstName?.[0] || entry.user.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {entry.user.firstName && entry.user.lastName 
                                ? `${entry.user.firstName} ${entry.user.lastName}`
                                : entry.user.email || 'Anonymous'}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {entry.goalsCompleted} goals
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {entry.currentStreak} day streak
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">{entry.totalPoints}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userStats ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Goals Completed</span>
                      <Badge variant="secondary">{userStats.goalsCompleted}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Routines Completed</span>
                      <Badge variant="secondary">{userStats.routinesCompleted}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        <Flame className="w-3 h-3 mr-1" />
                        {userStats.currentStreak} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <Badge variant="secondary">{userStats.longestStreak} days</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Levers Activated</span>
                      <Badge variant="secondary">{userStats.leversActivated}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start using the platform to track your stats!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>Set and complete goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Maintain daily streaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Complete assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span>Earn achievement badges</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

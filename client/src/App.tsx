import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { TutorialProvider, TutorialOverlay } from "@/components/tutorial";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Goals from "@/pages/goals";
import Assessment from "@/pages/assessment";
import Routines from "@/pages/routines";
import DailyPlanner from "@/pages/daily-planner";
import Levers from "@/pages/levers";
import Badges from "@/pages/badges";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import Account from "@/pages/account";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import GettingStarted from "@/pages/getting-started";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/daily" component={DailyPlanner} />
      <Route path="/goals" component={Goals} />
      <Route path="/routines" component={Routines} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/levers" component={Levers} />
      <Route path="/badges" component={Badges} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/account" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TutorialProvider>
          <Toaster />
          <Router />
          <TutorialOverlay />
        </TutorialProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

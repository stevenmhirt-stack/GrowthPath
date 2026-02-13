import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ListChecks, CalendarClock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PlanType = 'monthly' | 'yearly';

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to start checkout. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL received. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: ListChecks,
      title: "Self Assessment",
      description: "Comprehensive 36-word self-assessment to understand your strengths and areas for growth",
    },
    {
      icon: CalendarClock,
      title: "Routines",
      description: "Build and track daily, weekly, and custom routines with streak tracking",
    },
    {
      icon: Calendar,
      title: "Daily Planner",
      description: "Plan your day with time-blocked schedules and daily reflections",
    },
  ];

  const plans = [
    {
      id: 'monthly' as PlanType,
      name: 'Monthly',
      price: '$10.99',
      period: '/month',
      savings: null,
    },
    {
      id: 'yearly' as PlanType,
      name: 'Annual',
      price: '$99.00',
      period: '/year',
      savings: 'Save $32.88',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="dialog-upgrade-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Unlock powerful features to accelerate your growth journey
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
              data-testid={`button-plan-${plan.id}`}
            >
              {plan.savings && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                  {plan.savings}
                </span>
              )}
              <span className="text-sm font-medium text-muted-foreground">{plan.name}</span>
              <span className="text-2xl font-bold mt-1">{plan.price}</span>
              <span className="text-xs text-muted-foreground">{plan.period}</span>
              {selectedPlan === plan.id && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {premiumFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleUpgrade}
            disabled={isLoading}
            data-testid="button-upgrade-premium"
          >
            {isLoading ? "Loading..." : `Subscribe ${selectedPlan === 'yearly' ? 'Annually' : 'Monthly'}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Subscriptions auto-renew. Cancel anytime. Secure payment by Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

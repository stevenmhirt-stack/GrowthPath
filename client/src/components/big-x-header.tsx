import { useQuery } from "@tanstack/react-query";
import { getGoals } from "@/lib/api";
import { Target, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface BigXHeaderProps {
  showLink?: boolean;
}

export function BigXHeader({ showLink = true }: BigXHeaderProps) {
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });

  const bigXGoals = goals.filter((g) => g.goalType === "big-x" && g.status === "In Progress");
  const bigX = bigXGoals[0]?.title;

  if (!bigX) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Big X</p>
            {showLink ? (
              <Link href="/goals" className="text-lg font-semibold text-primary hover:underline" data-testid="link-set-big-x">
                Set your first goal to define your Big X
              </Link>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">Set your first goal to define your Big X</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Your Big X</p>
          <p className="text-lg font-bold text-foreground truncate" data-testid="text-big-x">
            {bigX}
          </p>
        </div>
        {showLink && (
          <Link 
            href="/goals" 
            className="text-xs text-primary hover:underline shrink-0"
            data-testid="link-view-goals"
          >
            View Goals
          </Link>
        )}
      </div>
    </div>
  );
}

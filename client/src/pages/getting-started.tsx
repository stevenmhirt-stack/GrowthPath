import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCcw, 
  Target, 
  ClipboardCheck, 
  Play, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Calendar,
  ListChecks
} from "lucide-react";

export default function GettingStarted() {
  return (
    <Layout>
      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Your Journey Begins Here
          </Badge>
          <h1 className="text-4xl font-display font-bold" data-testid="text-page-title">Getting Started</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The Big X Process at a Glance: <span className="font-semibold text-primary">RACE</span>
          </p>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-medium">
              <span className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-primary" />
                Reflect
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Assess
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Commit
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Execute
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Repeat
              </span>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              You'll move through four steps, then loop back with better clarity, stronger routines, and more confidence.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <StepCard
            step={1}
            title="Reflect: Get Clear Before You Get Busy"
            icon={RefreshCcw}
            description="Before you set goals or build routines, pause and reflect. Clarity reduces friction."
          >
            <div className="space-y-6">
              <PromptSection title="What am I trying to achieve?">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What outcome would feel meaningful—not just impressive?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What would "progress" look like in 30, 90, and 365 days?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    Why does this matter now?
                  </li>
                </ul>
              </PromptSection>

              <PromptSection title="Strengths & Weaknesses">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What strengths can I lean on immediately?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What patterns or weaknesses tend to derail me?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What do I need more of: skill, structure, support, or belief?
                  </li>
                </ul>
              </PromptSection>

              <PromptSection title="Opportunities & Challenges">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What opportunities are available right now (time, resources, relationships)?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What obstacles are predictable (schedule, energy, environment, mindset)?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What will I do when motivation drops?
                  </li>
                </ul>
              </PromptSection>

              <PromptSection title="Key Success Factors">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    If I had to name the 3–5 things that will make this work, what are they?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    What must be true each week for me to stay on track?
                  </li>
                </ul>
              </PromptSection>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>This reflection becomes your foundation. It helps you choose goals and routines that actually fit your life.</span>
                </p>
              </div>
            </div>
          </StepCard>

          <StepCard
            step={2}
            title="Assess: Complete the 36-Word Assessment"
            icon={ClipboardCheck}
            description="Identify your strengths to leverage and challenges to improve."
            actionButton={
              <Link href="/assessment">
                <Button data-testid="button-go-to-assessment">
                  Take Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">As you review your results, look for:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                  One or two standout strengths you can intentionally deploy
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                  One or two themes that may be limiting your consistency or confidence
                </li>
              </ul>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Choose a Focus Word or Theme (Optional but Powerful)</h4>
                <p className="text-muted-foreground text-sm">
                  If there's a particular word or theme you want to work on, record your reason—why this matters, what's at stake, what success would change. Then move it forward into your Routines or 8 Levers pages.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>This is how awareness becomes action.</span>
                </p>
              </div>
            </div>
          </StepCard>

          <StepCard
            step={3}
            title="Commit: Build 'My Goals' (Iterate—Don't Overthink)"
            icon={Target}
            description="This is not a one-time activity. You may need a few iterations before your goals feel functional and aligned. That's normal."
            actionButton={
              <Link href="/goals">
                <Button data-testid="button-go-to-goals">
                  Set My Goals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-medium text-primary">Don't strive for perfection—strive for clarity.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your goals should be:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span><strong>Well-defined</strong> — clear outcomes, not vague intentions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span><strong>Realistic but bold</strong> — stretching you without breaking you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <span><strong>Measurable</strong> — so you can track progress and adjust</span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Complete the Service Portion</h4>
                <p className="text-muted-foreground text-sm mb-3">Service is not an add-on—it's part of the engine.</p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    Who benefits from your growth?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    How you will serve (through leadership, example, contribution, encouragement, impact)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                    Why service strengthens your commitment (purpose sustains effort)
                  </li>
                </ul>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>When your goals include service, your discipline becomes bigger than your mood.</span>
                </p>
              </div>
            </div>
          </StepCard>

          <StepCard
            step={4}
            title="Execute: Design Your 8 Levers (and Your Routines)"
            icon={Play}
            description="The 8 Levers represent your key success factors—the supporting activities and conditions that will move you toward your Big X."
            actionButton={
              <div className="flex gap-2">
                <Link href="/levers">
                  <Button data-testid="button-go-to-levers">
                    8 Levers <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/routines">
                  <Button variant="outline" data-testid="button-go-to-routines">
                    My Routines <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">Think of the 8 Levers as the "system" behind the goal. On this page, you will:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                  Identify the Levers that matter most for your Big X
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                  Define the supporting actions that make each lever real
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" />
                  Create routines that turn your plan into repeatable behavior
                </li>
              </ul>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Routines Populate Your Tracking Pages</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  As you build routines here, they can automatically populate:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <strong>Routines Page</strong> — Your daily habits and recurring activities
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-primary shrink-0" />
                    <strong>Daily Planner Page</strong> — Your time-blocked activities for each day
                  </li>
                </ul>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>This is where your Big X stops being an idea and becomes a schedule.</span>
                </p>
              </div>
            </div>
          </StepCard>

          <StepCard
            step={5}
            title="Track & Reflect: Use the Daily Activity Log"
            icon={Calendar}
            description="Track routines and reflect on progress. This may be the hardest part—not because it's complex, but because it requires daily effort."
            actionButton={
              <Link href="/daily">
                <Button data-testid="button-go-to-daily">
                  Daily Planner <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">A Few Important Truths:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-amber-500 shrink-0" />
                    Daily logging is not mandatory
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-amber-500 shrink-0" />
                    But routines must be monitored and measured frequently
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-amber-500 shrink-0" />
                    Adjustments should be made based on what's actually happening
                  </li>
                </ul>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>Tracking creates awareness. Awareness creates choice. Choice creates change.</span>
                </p>
              </div>
            </div>
          </StepCard>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-primary" />
              Repeat the Loop: RACE Again (Based on Results)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              As you execute, you will learn. And learning is the point.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <RefreshCcw className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">Reflect</span>
                  <p className="text-sm text-muted-foreground">on what's working and what's not</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">Assess</span>
                  <p className="text-sm text-muted-foreground">what strengths/challenges are emerging</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">Commit</span>
                  <p className="text-sm text-muted-foreground">by refining goals and service</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Play className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">Execute</span>
                  <p className="text-sm text-muted-foreground">by adjusting levers and routines</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 mt-4">
              <p className="text-center font-display font-semibold text-lg text-primary">
                Progress is built through iteration—not intensity.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/assessment">
            <Button size="lg" className="shadow-xl shadow-primary/20" data-testid="button-start-journey">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function StepCard({ 
  step, 
  title, 
  icon: Icon, 
  description, 
  children, 
  actionButton 
}: { 
  step: number; 
  title: string; 
  icon: any; 
  description: string; 
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}) {
  return (
    <Card data-testid={`card-step-${step}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
              {step}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Icon className="h-5 w-5 text-primary" />
                {title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </div>
        {actionButton && <div className="mt-4">{actionButton}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PromptSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Calendar, CheckCircle2, BarChart3, Sparkles, ArrowRight, Compass, RefreshCw, Zap, Heart, AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout";

function LandingContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Compass className="h-4 w-4" />
            Align Your Days With What Matters Most
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4" data-testid="text-hero-title">
            Stop Starting Over.
            <span className="text-primary block mt-2">Start Living in Alignment With What Matters Most.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4" data-testid="text-hero-subtitle">
            You're capable. You're driven. You care about growth.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mb-10">
            But if you're honest, your days don't always reflect what truly matters to you. GrowthPath is a simple system that helps you align your daily actions with your priorities—so you stop drifting, stop resetting, and start making steady, visible progress.
          </p>
          
          <p className="text-sm text-muted-foreground mb-6 italic">No hype. No guilt. Just intentional living—one day at a time.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 shadow-xl shadow-primary/20"
                    data-testid="button-review-goals"
                  >
                    Review Your Goals <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 shadow-xl shadow-primary/20"
                    data-testid="button-start-intentional"
                  >
                    Start Living Intentionally <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8"
                    data-testid="button-sign-in"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-4" data-testid="text-problem-title">The Problem GrowthPath Solves</h2>
            <p className="text-lg text-muted-foreground">
              Most people don't fail because they lack motivation or ambition. They fail because:
            </p>
          </div>
          
          <div className="grid gap-3 mb-8">
            {[
              "Their days are reactive instead of intentional",
              "Their goals aren't connected to daily actions",
              "They rely on motivation instead of structure",
              "They make progress in one area while sacrificing another",
              "They keep \"starting over\" instead of building consistency",
            ].map((problem, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10" data-testid={`text-problem-${i}`}>
                <X className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm font-medium">{problem}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-2">You may be productive—but still feel misaligned.</p>
            <p className="font-medium text-primary">GrowthPath was built for people who are done drifting and ready to live on purpose.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent via-primary/3 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4" data-testid="text-how-title">How GrowthPath Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            GrowthPath helps you turn intention into alignment—by connecting what matters to what you do every day.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard 
            number={1}
            title="Clarify What Matters"
            description="Define your core values and your Big X—so your goals are built on the right foundation."
          />
          <StepCard 
            number={2}
            title="Translate Priorities Into Daily Structure"
            description="Turn what matters into simple routines and plans that remove friction and reduce decision fatigue."
          />
          <StepCard 
            number={3}
            title="Make Progress Visible"
            description="Track what you're doing, reflect daily, and adjust—so progress becomes sustainable, not exhausting."
          />
        </div>

        <div className="text-center mt-10">
          <p className="text-muted-foreground italic">This isn't about doing more.</p>
          <p className="font-semibold text-lg mt-1">It's about doing what matters—consistently.</p>
        </div>
      </div>

      {/* Tools Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4" data-testid="text-tools-title">The Tools That Support Alignment</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each tool in GrowthPath serves a single purpose: helping your daily actions reflect your priorities.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={Target}
            title="Goal Setting"
            description="Define goals that actually matter—and break them into clear, achievable progress."
          />
          <FeatureCard 
            icon={RefreshCw}
            title="Daily Rituals"
            description="Build simple morning, work, and evening routines that create consistency without relying on motivation."
          />
          <FeatureCard 
            icon={Calendar}
            title="Daily Planning"
            description="Design each day with intention, reflect on wins, and continuously improve without judgment."
          />
          <FeatureCard 
            icon={BarChart3}
            title="The 8 Levers"
            description="Stay aligned across the critical areas of life—so progress in one area doesn't come at the expense of another."
          />
        </div>
      </div>

      {/* Values Assessment Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-card/50 backdrop-blur border-primary/10 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 md:p-12">
                <p className="text-sm uppercase tracking-wider text-primary font-medium mb-3">Alignment Starts With Values</p>
                <h3 className="text-2xl font-display font-bold mb-2" data-testid="text-values-title">Discover What Truly Drives You</h3>
                <p className="text-muted-foreground mb-6">
                  Before you build goals or routines, you need clarity. The GrowthPath 36-Values Assessment helps you uncover what matters most—so your decisions, goals, and habits are aligned with who you really are.
                </p>
                <Link href={isAuthenticated ? "/assessment" : "/signup"}>
                  <Button 
                    variant="default" 
                    size="lg"
                    data-testid="button-take-assessment"
                  >
                    Take the Values Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-center p-8 bg-primary/5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Growth", icon: "🌱" },
                    { value: "Impact", icon: "💥" },
                    { value: "Freedom", icon: "🕊️" },
                    { value: "Wisdom", icon: "📖" },
                    { value: "Balance", icon: "⚖️" },
                    { value: "Excellence", icon: "⭐" },
                  ].map(({ value, icon }) => (
                    <div 
                      key={value}
                      className="px-4 py-3 bg-background/80 border border-primary/20 text-foreground rounded-lg text-sm font-medium text-center shadow-sm"
                    >
                      <span className="block text-lg mb-1">{icon}</span>
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Who It's For Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-8" data-testid="text-who-title">Who GrowthPath Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              "Are capable and driven—but feel misaligned",
              "Want consistency without burnout",
              "Care about growth across life—not just work",
              "Are done chasing productivity and ready for purpose",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 text-left" data-testid={`text-audience-${i}`}>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground italic">If you're tired of starting over, this is for you.</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-10 border border-primary/10">
          <h2 className="text-3xl font-display font-bold mb-4" data-testid="text-cta-title">Ready to Align Your Days With What Matters Most?</h2>
          <p className="text-muted-foreground mb-8">
            Join professionals who are choosing clarity over chaos—and alignment over drift.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/daily" : "/signup"}>
              <Button 
                size="lg" 
                className="text-lg px-8 shadow-xl shadow-primary/20"
                data-testid="button-start-living"
              >
                Start Living Intentionally <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/signup">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8"
                  data-testid="button-begin-big-x"
                >
                  Begin Your Big X
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Closing Thought */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <Compass className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground mb-1">You don't need more motivation.</p>
          <p className="text-muted-foreground mb-1">You don't need another productivity system.</p>
          <p className="text-lg font-semibold mt-4 mb-1">You need alignment.</p>
          <p className="text-muted-foreground">And alignment starts with how you live today.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>GrowthPath — Align your days with what matters most.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6" data-testid={`step-card-${number}`}>
      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors" data-testid={`feature-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return (
      <Layout>
        <LandingContent />
      </Layout>
    );
  }
  
  return <LandingContent />;
}

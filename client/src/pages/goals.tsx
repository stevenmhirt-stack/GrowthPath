import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, createGoal, updateGoal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Save, Target, TrendingUp, Users, Shield, Sparkles, Calendar, Heart, Briefcase } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import type { Goal } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAssistButton } from "@/components/AIAssistButton";

interface GoalFormData {
  bigXName: string;
  setDate: string;
  purpose: string;
  targetDate: string;
  actualCompletionDate: string;
  serviceToOthers: string;
  familySpirit: string;
  workCommunity: string;
  intermediateGoal: string;
  intermediateProgress: number;
  confidentOrEasiest: string;
  confidentProgress: number;
  currentCapability: string;
  currentProgress: number;
  milestoneConfidentDate: string;
  milestoneIntermediateDate: string;
  goalsInProcess: string[];
  fourPerspectives: string[];
  goalsCompleted: string;
  supportersCoaches: string;
  supportHow: string;
  winningAttributes: {
    mental: string;
    health: string;
    skill: string;
    lifestyle: string;
  };
  weaknessFailure: {
    mental: string;
    health: string;
    skill: string;
    lifestyle: string;
  };
  potentialProblems: {
    mental: string;
    health: string;
    skill: string;
    lifestyle: string;
  };
  countermeasures: {
    mental: string;
    health: string;
    skill: string;
    lifestyle: string;
  };
}

const defaultFormData: GoalFormData = {
  bigXName: "",
  setDate: "",
  purpose: "",
  targetDate: "",
  actualCompletionDate: "",
  serviceToOthers: "",
  familySpirit: "",
  workCommunity: "",
  intermediateGoal: "",
  intermediateProgress: 0,
  confidentOrEasiest: "",
  confidentProgress: 0,
  currentCapability: "",
  currentProgress: 0,
  milestoneConfidentDate: "",
  milestoneIntermediateDate: "",
  goalsInProcess: ["", "", ""],
  fourPerspectives: ["", "", "", ""],
  goalsCompleted: "",
  supportersCoaches: "",
  supportHow: "",
  winningAttributes: { mental: "", health: "", skill: "", lifestyle: "" },
  weaknessFailure: { mental: "", health: "", skill: "", lifestyle: "" },
  potentialProblems: { mental: "", health: "", skill: "", lifestyle: "" },
  countermeasures: { mental: "", health: "", skill: "", lifestyle: "" },
};

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export default function Goals() {
  const [formData, setFormData] = useState<GoalFormData>(defaultFormData);
  const [existingGoalId, setExistingGoalId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });

  useEffect(() => {
    const bigXGoal = goals.find((g: Goal) => g.goalType === "big-x");
    if (bigXGoal) {
      setExistingGoalId(bigXGoal.id);
      const savedData = bigXGoal.formData as GoalFormData | null;
      if (savedData && typeof savedData === 'object' && 'bigXName' in savedData) {
        setFormData(savedData);
      } else {
        setFormData({
          ...defaultFormData,
          bigXName: bigXGoal.title,
          purpose: bigXGoal.description,
          targetDate: bigXGoal.deadline,
        });
      }
    }
  }, [goals]);

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setExistingGoalId(newGoal.id);
      setHasChanges(false);
      toast({ title: "Goal form saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) => updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setHasChanges(false);
      toast({ title: "Goal form saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  const handleChange = (field: keyof GoalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedChange = (
    section: 'winningAttributes' | 'weaknessFailure' | 'potentialProblems' | 'countermeasures',
    field: 'mental' | 'health' | 'skill' | 'lifestyle',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (field: 'goalsInProcess' | 'fourPerspectives', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.bigXName.trim()) {
      toast({ title: "Please enter your Big X goal name", variant: "destructive" });
      return;
    }

    const goalData = {
      title: formData.bigXName,
      category: "Professional",
      goalType: "big-x" as const,
      deadline: formData.targetDate || new Date().toISOString().split('T')[0],
      description: formData.purpose,
      status: "In Progress",
      progress: 0,
      milestones: [],
      formData: formData,
    };

    if (existingGoalId) {
      updateMutation.mutate({ id: existingGoalId, data: goalData });
    } else {
      createMutation.mutate(goalData);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Long-term Goal Planning</h1>
            <p className="text-muted-foreground">Define and track your Big X vision with comprehensive planning.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="gap-2"
            data-testid="button-save-form"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-6 pr-4">
            
            {/* Big X Overview Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Your Big X Goal</CardTitle>
                    <CardDescription>Your ultimate 3-5 year vision</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-auto">3-5 Years</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bigXName">Goal Name</Label>
                    <Input 
                      id="bigXName"
                      value={formData.bigXName}
                      onChange={(e) => handleChange('bigXName', e.target.value)}
                      placeholder="What is your Big X?"
                      className="text-lg"
                      data-testid="input-bigx-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="purpose">Purpose</Label>
                      <AIAssistButton
                        fieldName="Purpose"
                        formType="goals"
                        context={formData.bigXName}
                        currentValue={formData.purpose}
                        onApply={(suggestion) => handleChange('purpose', suggestion)}
                      />
                    </div>
                    <Textarea 
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleChange('purpose', e.target.value)}
                      placeholder="Why does this matter?"
                      className="min-h-[60px] resize-none"
                      data-testid="input-purpose"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="setDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date Set
                    </Label>
                    <Input 
                      id="setDate"
                      type="date"
                      value={formData.setDate}
                      onChange={(e) => handleChange('setDate', e.target.value)}
                      data-testid="input-set-date"
                    />
                    <p className="text-xs text-muted-foreground">When you created this goal</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate" className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Target Date
                    </Label>
                    <Input 
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => handleChange('targetDate', e.target.value)}
                      data-testid="input-target-date"
                    />
                    <p className="text-xs text-muted-foreground">When you aim to achieve your Big X</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actualCompletionDate" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      Completion Date
                    </Label>
                    <Input 
                      id="actualCompletionDate"
                      type="date"
                      value={formData.actualCompletionDate}
                      onChange={(e) => handleChange('actualCompletionDate', e.target.value)}
                      data-testid="input-completion-date"
                    />
                    <p className="text-xs text-muted-foreground">Fill in when achieved</p>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Goal Hierarchy - Combined with dates */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader 
                  icon={TrendingUp} 
                  title="Goal Hierarchy" 
                  description="Build your path from where you are today to your Big X vision"
                />
                
                <div className="space-y-6 mt-4">
                  {/* Step 1: Current Capability */}
                  <div className="relative pl-6 border-l-2 border-primary/30">
                    <div className="absolute -left-2 top-0 h-8 w-8 rounded-full bg-primary/50 flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-primary/80 font-semibold text-base">Current Capability</Label>
                        <Badge variant="outline" className="text-xs">Where you are now</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Start by honestly assessing where you stand today</p>
                      <Textarea 
                        value={formData.currentCapability}
                        onChange={(e) => handleChange('currentCapability', e.target.value)}
                        placeholder="What can you do right now? What skills, resources, and experience do you currently have?"
                        className="min-h-[80px]"
                        data-testid="input-current-capability"
                      />
                    </div>
                  </div>

                  {/* Step 2: Confident Goal */}
                  <div className="relative pl-6 border-l-2 border-primary/30">
                    <div className="absolute -left-2 top-0 h-8 w-8 rounded-full bg-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-primary/90 font-semibold text-base">Confident Goal</Label>
                        <Badge variant="secondary" className="text-xs">12-18 months</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">What you're confident you can achieve in the next 12-18 months</p>
                      <div className="grid md:grid-cols-[1fr_200px] gap-4">
                        <Textarea 
                          value={formData.confidentOrEasiest}
                          onChange={(e) => handleChange('confidentOrEasiest', e.target.value)}
                          placeholder="What are you confident you can achieve? Be specific about measurable outcomes."
                          className="min-h-[80px]"
                          data-testid="input-confident-easiest"
                        />
                        <div className="space-y-2">
                          <Label htmlFor="milestoneConfidentDate" className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Target Date
                          </Label>
                          <Input 
                            id="milestoneConfidentDate"
                            type="date"
                            value={formData.milestoneConfidentDate}
                            onChange={(e) => handleChange('milestoneConfidentDate', e.target.value)}
                            className="w-full"
                            data-testid="input-milestone-confident-date"
                          />
                          <p className="text-xs text-muted-foreground">When will you achieve this?</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Intermediate Goal */}
                  <div className="relative pl-6 border-l-2 border-primary/30">
                    <div className="absolute -left-2 top-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
                    <div className="ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-primary font-semibold text-base">Intermediate Goal</Label>
                          <Badge variant="secondary" className="text-xs">18-30 months</Badge>
                        </div>
                        <AIAssistButton
                          fieldName="Intermediate Goal"
                          formType="goals"
                          context={`Big X Goal: ${formData.bigXName}. Purpose: ${formData.purpose}. Current capability: ${formData.currentCapability}. Confident goal: ${formData.confidentOrEasiest}`}
                          currentValue={formData.intermediateGoal}
                          onApply={(suggestion) => handleChange('intermediateGoal', suggestion)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">The major milestone that bridges your confident goal to your Big X</p>
                      <div className="grid md:grid-cols-[1fr_200px] gap-4">
                        <Textarea 
                          value={formData.intermediateGoal}
                          onChange={(e) => handleChange('intermediateGoal', e.target.value)}
                          placeholder="What's the major milestone along the way? This should be a significant achievement between your confident goal and your ultimate vision."
                          className="min-h-[80px]"
                          data-testid="input-intermediate-goal"
                        />
                        <div className="space-y-2">
                          <Label htmlFor="milestoneIntermediateDate" className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Target Date
                          </Label>
                          <Input 
                            id="milestoneIntermediateDate"
                            type="date"
                            value={formData.milestoneIntermediateDate}
                            onChange={(e) => handleChange('milestoneIntermediateDate', e.target.value)}
                            className="w-full"
                            data-testid="input-milestone-intermediate-date"
                          />
                          <p className="text-xs text-muted-foreground">When will you achieve this?</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Big X Reference */}
                  <div className="relative pl-6">
                    <div className="absolute -left-2 top-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="ml-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-primary font-semibold text-base">Your Big X Vision</Label>
                        <Badge variant="default" className="text-xs">3-5 years</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Your ultimate destination defined above</p>
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{formData.bigXName || "Define your Big X goal above"}</p>
                        {formData.targetDate && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {new Date(formData.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Work Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <SectionHeader 
                    icon={Target} 
                    title="Goals In Process" 
                    description="What you're actively working on"
                  />
                  <div className="space-y-3">
                    {formData.goalsInProcess.map((goal, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Goal {index + 1}</Label>
                        <Textarea 
                          value={goal}
                          onChange={(e) => handleArrayChange('goalsInProcess', index, e.target.value)}
                          placeholder={`Active goal ${index + 1}...`}
                          className="min-h-[80px]"
                          data-testid={`input-goal-process-${index}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <SectionHeader 
                    icon={Target} 
                    title="Goals Completed" 
                    description="Goals you have successfully achieved"
                  />
                  <div className="space-y-3">
                    <Textarea 
                      value={formData.goalsCompleted || ""}
                      onChange={(e) => handleChange('goalsCompleted', e.target.value)}
                      placeholder="List your completed goals..."
                      className="min-h-[200px]"
                      data-testid="input-goals-completed"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Four Perspectives - 2x2 Matrix */}
            <Card className="overflow-hidden border-primary/20">
              <div className="flex">
                {/* Sidebar */}
                <div className="bg-primary/10 p-3 flex items-center justify-center w-[100px] border-r-2 border-primary">
                  <p className="text-xs font-semibold text-primary italic leading-tight text-center">
                    Four Perspectives on value and purposes of goals.
                  </p>
                </div>
                
                {/* Matrix Container */}
                <div className="flex-1">
                  {/* Column Headers */}
                  <div className="grid grid-cols-[60px_1fr_1fr] bg-primary text-primary-foreground">
                    <div className="p-2"></div>
                    <div className="p-3 text-center font-bold border-l border-primary-foreground/30">Myself</div>
                    <div className="p-3 text-center font-bold border-l border-primary-foreground/30">Family/Work/Community</div>
                  </div>
                  
                  {/* Row 1: Tangible */}
                  <div className="grid grid-cols-[60px_1fr_1fr] border-b border-border">
                    <div className="bg-primary text-primary-foreground p-2 flex items-center justify-center font-bold text-xs">
                      <span className="writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>Tangible</span>
                    </div>
                    <div className="p-4 border-l border-border bg-background">
                      <Textarea 
                        value={formData.fourPerspectives[0]}
                        onChange={(e) => handleArrayChange('fourPerspectives', 0, e.target.value)}
                        placeholder="Tangible benefits for myself..."
                        className="min-h-[120px] text-sm border-0 shadow-none focus-visible:ring-0 resize-none"
                        data-testid="input-perspective-0"
                      />
                    </div>
                    <div className="p-4 border-l border-border bg-background">
                      <Textarea 
                        value={formData.fourPerspectives[1]}
                        onChange={(e) => handleArrayChange('fourPerspectives', 1, e.target.value)}
                        placeholder="Tangible benefits for family, work, and community..."
                        className="min-h-[120px] text-sm border-0 shadow-none focus-visible:ring-0 resize-none"
                        data-testid="input-perspective-1"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Intangible */}
                  <div className="grid grid-cols-[60px_1fr_1fr]">
                    <div className="bg-primary text-primary-foreground p-2 flex items-center justify-center font-bold text-xs">
                      <span style={{ writingMode: 'vertical-rl' }} className="rotate-180">Intangible</span>
                    </div>
                    <div className="p-4 border-l border-border bg-background">
                      <Textarea 
                        value={formData.fourPerspectives[2]}
                        onChange={(e) => handleArrayChange('fourPerspectives', 2, e.target.value)}
                        placeholder="Intangible benefits for myself..."
                        className="min-h-[120px] text-sm border-0 shadow-none focus-visible:ring-0 resize-none"
                        data-testid="input-perspective-2"
                      />
                    </div>
                    <div className="p-4 border-l border-border bg-background">
                      <Textarea 
                        value={formData.fourPerspectives[3]}
                        onChange={(e) => handleArrayChange('fourPerspectives', 3, e.target.value)}
                        placeholder="Intangible benefits for family, work, and community..."
                        className="min-h-[120px] text-sm border-0 shadow-none focus-visible:ring-0 resize-none"
                        data-testid="input-perspective-3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support Network */}
            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <SectionHeader 
                  icon={Users} 
                  title="Support Network" 
                  description="Who will help you achieve this goal"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supporters & Coaches</Label>
                    <Textarea 
                      value={formData.supportersCoaches}
                      onChange={(e) => handleChange('supportersCoaches', e.target.value)}
                      placeholder="Who are your key supporters and mentors?"
                      className="min-h-[100px] bg-background"
                      data-testid="input-supporters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>How Will They Support You?</Label>
                    <Textarea 
                      value={formData.supportHow}
                      onChange={(e) => handleChange('supportHow', e.target.value)}
                      placeholder="What kind of support do you need from them?"
                      className="min-h-[100px] bg-background"
                      data-testid="input-support-how"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader 
                  icon={Shield} 
                  title="Strengths & Challenges" 
                  description="Know yourself to succeed"
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Winning Attributes to Leverage
                    </h4>
                    {(['mental', 'health', 'skill', 'lifestyle'] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <Label className="capitalize text-sm">{field}</Label>
                        <Textarea 
                          value={formData.winningAttributes[field]}
                          onChange={(e) => handleNestedChange('winningAttributes', field, e.target.value)}
                          placeholder={`Your ${field} strengths...`}
                          className="min-h-[50px]"
                          data-testid={`input-winning-${field}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Points of Weakness / Failure Risk
                    </h4>
                    {(['mental', 'health', 'skill', 'lifestyle'] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <Label className="capitalize text-sm">{field}</Label>
                        <Textarea 
                          value={formData.weaknessFailure[field]}
                          onChange={(e) => handleNestedChange('weaknessFailure', field, e.target.value)}
                          placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} challenges...`}
                          className="min-h-[50px]"
                          data-testid={`input-weakness-${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems & Countermeasures */}
            <Card>
              <CardContent className="pt-6">
                <SectionHeader 
                  icon={Shield} 
                  title="Risk Management" 
                  description="Anticipate problems and prepare solutions"
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                      Potential Problems
                    </h4>
                    {(['mental', 'health', 'skill', 'lifestyle'] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <Label className="capitalize text-sm">{field}</Label>
                        <Textarea 
                          value={formData.potentialProblems[field]}
                          onChange={(e) => handleNestedChange('potentialProblems', field, e.target.value)}
                          placeholder={`Potential ${field} obstacles...`}
                          className="min-h-[50px]"
                          data-testid={`input-problems-${field}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sky-600 dark:text-sky-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-500" />
                      Countermeasures
                    </h4>
                    {(['mental', 'health', 'skill', 'lifestyle'] as const).map((field) => (
                      <div key={field} className="space-y-1">
                        <Label className="capitalize text-sm">{field}</Label>
                        <Textarea 
                          value={formData.countermeasures[field]}
                          onChange={(e) => handleNestedChange('countermeasures', field, e.target.value)}
                          placeholder={`How you'll address ${field} challenges...`}
                          className="min-h-[50px]"
                          data-testid={`input-countermeasures-${field}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/layout";
import { BigXHeader } from "@/components/big-x-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { assessmentWords, type AssessmentCategory } from "@/lib/mock-data";
import { useState, useEffect, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Info, HelpCircle, User, Brain, Zap, Star, TrendingUp, AlertCircle, Minus, MessageSquare, CheckCircle2, Target, ChevronDown, ChevronUp } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssessmentScores, saveAssessmentScore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const categories: AssessmentCategory[] = ["Who I Am", "How I Think", "How I Act"];

const categoryIcons: Record<AssessmentCategory, typeof User> = {
  "Who I Am": User,
  "How I Think": Brain,
  "How I Act": Zap,
};

const categoryDescriptions: Record<AssessmentCategory, string> = {
  "Who I Am": "Core identity traits that define your character and values",
  "How I Think": "Mental patterns and cognitive approaches you use",
  "How I Act": "Behavioral tendencies and actions you take",
};

export default function Assessment() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(assessmentWords.map(item => [item.word, 5]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(assessmentWords.map(item => [item.word, ""]))
  );
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string | null>>(
    Object.fromEntries(assessmentWords.map(item => [item.word, null]))
  );
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("assessment");
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: savedScores = [], isLoading } = useQuery({
    queryKey: ["assessment"],
    queryFn: getAssessmentScores,
  });

  const saveScoreMutation = useMutation({
    mutationFn: saveAssessmentScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
  });

  useEffect(() => {
    if (savedScores.length > 0) {
      const loadedScores: Record<string, number> = {};
      const loadedNotes: Record<string, string> = {};
      const loadedSelections: Record<string, string | null> = {};
      savedScores.forEach((s: any) => {
        loadedScores[s.word] = s.score;
        loadedNotes[s.word] = s.notes || "";
        const selection = s.selectedForAction;
        loadedSelections[s.word] = selection === 'routines' ? 'levers' : (selection || null);
      });
      const mergedScores = Object.fromEntries(
        assessmentWords.map(item => [item.word, loadedScores[item.word] || 5])
      );
      const mergedNotes = Object.fromEntries(
        assessmentWords.map(item => [item.word, loadedNotes[item.word] || ""])
      );
      const mergedSelections = Object.fromEntries(
        assessmentWords.map(item => [item.word, loadedSelections[item.word] || null])
      );
      setScores(mergedScores);
      setNotes(mergedNotes);
      setSelectedTraits(mergedSelections);
    }
  }, [savedScores]);

  const handleScoreChange = (word: string, value: number[]) => {
    setScores(prev => ({ ...prev, [word]: value[0] }));
  };

  const handleNotesChange = (word: string, value: string) => {
    setNotes(prev => ({ ...prev, [word]: value }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedTraits).filter(v => v !== null).length;
  }, [selectedTraits]);

  const handleTraitSelection = (word: string, destination: string | null) => {
    setSelectedTraits(prev => {
      if (destination === null) {
        return { ...prev, [word]: null };
      }
      
      const currentlySelected = Object.values(prev).filter(v => v !== null).length;
      const isAlreadySelected = prev[word] !== null;
      
      if (currentlySelected >= 5 && !isAlreadySelected) {
        toast({
          title: "Maximum selections reached",
          description: "You can only select up to 5 traits. Deselect one to add another.",
          variant: "destructive",
        });
        return prev;
      }
      return { ...prev, [word]: destination };
    });
  };

  const toggleCardExpanded = (word: string) => {
    setExpandedCards(prev => ({ ...prev, [word]: !prev[word] }));
  };

  const handleSaveAll = async () => {
    const promises = Object.entries(scores).map(([word, score]) =>
      saveScoreMutation.mutateAsync({ 
        word, 
        score,
        notes: notes[word] || null,
        selectedForAction: selectedTraits[word] || null,
      })
    );
    
    try {
      await Promise.all(promises);
      toast({ title: "Assessment saved successfully!" });
    } catch (error) {
      toast({ title: "Failed to save assessment", variant: "destructive" });
    }
  };

  const getWordsByCategory = (category: AssessmentCategory) => {
    return assessmentWords.filter(item => item.category === category);
  };

  const getCategoryStats = useMemo(() => {
    return categories.map(category => {
      const words = getWordsByCategory(category);
      const categoryScores = words.map(w => scores[w.word] || 5);
      const average = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
      const high = words.filter(w => scores[w.word] >= 9);
      const medium = words.filter(w => scores[w.word] >= 7 && scores[w.word] <= 8);
      const low = words.filter(w => scores[w.word] >= 5 && scores[w.word] <= 6);
      const veryLow = words.filter(w => scores[w.word] < 5);
      
      return {
        category,
        average: Math.round(average * 10) / 10,
        high,
        medium,
        low,
        veryLow,
      };
    });
  }, [scores]);

  const getScoresByRange = useMemo(() => {
    const all = assessmentWords.map(item => ({
      ...item,
      score: scores[item.word] || 5,
    }));
    
    return {
      excellent: all.filter(item => item.score >= 9),
      strong: all.filter(item => item.score >= 7 && item.score <= 8),
      developing: all.filter(item => item.score >= 5 && item.score <= 6),
      needsWork: all.filter(item => item.score < 5),
    };
  }, [scores]);

  const getTopValues = () => {
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([subject, A]) => ({ subject, A, fullMark: 10 }));
  };

  const getCategoryRadarData = () => {
    return categories.map(category => {
      const words = getWordsByCategory(category);
      const avg = words.reduce((sum, w) => sum + (scores[w.word] || 5), 0) / words.length;
      return { subject: category, A: Math.round(avg * 10) / 10, fullMark: 10 };
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <BigXHeader />
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">36 Values Assessment</h1>
          <p className="text-muted-foreground">
            Rate each value from 1 (I do not possess this trait) to 10 (I fully live this trait) to discover your core drivers.
          </p>
          {selectedCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {selectedCount}/5 traits selected for action
              </Badge>
            </div>
          )}
        </div>

        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between mb-4" data-testid="button-toggle-assessment-instructions">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                How to Complete the Assessment
              </span>
              {instructionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-4 text-sm">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                    Read Each Word Slowly
                  </h3>
                  <p className="text-muted-foreground">Ask yourself: "Does this word describe how I am currently living — most days?"</p>
                  <div className="bg-secondary/50 rounded p-2 text-xs text-muted-foreground">
                    <strong>Not:</strong> How you want to be • How you used to be • How others see you on a good day
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Answer based on your current reality.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                    Choose One Response Per Word
                  </h3>
                  <p className="text-muted-foreground">Select what feels most true right now: <strong>Consistently Me</strong>, <strong>Sometimes Me</strong>, or <strong>Rarely Me</strong>.</p>
                  <p className="text-xs text-muted-foreground italic">There are no right or wrong answers. Honesty creates leverage. Optimism creates blind spots.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                    Keep Moving (This Matters)
                  </h3>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Trust your first instinct</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Do not debate the wording</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Do not try to balance scores</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Do not rush — but do not stall</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">Most people complete this in 5–7 minutes. If you feel discomfort, pause — that's usually insight knocking.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                    Review the Pattern, Not the Score
                  </h3>
                  <p className="text-muted-foreground">When complete, you will see areas of strength, areas of instability, and areas of neglect.</p>
                  <p className="text-xs text-muted-foreground font-medium">Your goal is not to fix everything.</p>
                  <p className="text-xs bg-secondary/50 p-2 rounded"><strong>Your goal:</strong> Ask "What is this pattern telling me about my Big X right now?"</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                    Let the Assessment Guide Focus
                  </h3>
                  <p className="text-muted-foreground">Use your results to:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Select 3–5 active levers</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Identify where to simplify</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Decide what to protect</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />Reveal what has been avoided</li>
                  </ul>
                  <p className="text-xs text-muted-foreground font-medium">This assessment is a starting point, not a judgment.</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <h4 className="font-semibold text-sm">Ground Rules</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Low scores are information, not failure</li>
                    <li>• High scores are responsibility, not arrival</li>
                    <li>• Repeating this assessment quarterly is recommended</li>
                    <li>• Change is expected — consistency is earned</li>
                  </ul>
                  <p className="text-xs text-muted-foreground font-medium mt-2">You don't improve what you judge. You improve what you understand.</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-1">When to Retake</h4>
                  <p className="text-xs text-muted-foreground">At the start of a new quarter • After a major life or leadership shift • When momentum stalls • When clarity feels cloudy</p>
                  <p className="text-xs text-muted-foreground font-medium mt-2">It's a compass, not a report card.</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-4 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">The goal isn't to become perfect across all words. The goal is to live aligned with the words that matter most now.</p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Clarity creates confidence. Confidence creates consistency. Consistency creates your Big X.</p>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
            <TabsTrigger value="report" data-testid="tab-report">Summary Report</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-8 mt-6">
            {/* Category Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {getCategoryStats.map(stat => {
                const Icon = categoryIcons[stat.category];
                return (
                  <Card key={stat.category} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-medium">{stat.category}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{stat.average}</div>
                      <p className="text-xs text-muted-foreground mt-1">Average score across 12 traits</p>
                      <Progress value={stat.average * 10} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-primary">How to Score</p>
                    <p className="text-sm text-muted-foreground">
                      Hover over the <HelpCircle className="inline h-3 w-3 mx-1" /> icon next to each word to see its definition. 
                      Be honest with your self-assessment to get the most accurate profile.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {assessmentWords.map((item) => (
                <Card 
                  key={item.word} 
                  className={`transition-all duration-200 ${selectedTraits[item.word] ? 'border-secondary/50 bg-secondary/5 ring-1 ring-secondary/20' : scores[item.word] >= 8 ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/20'}`} 
                  data-testid={`card-value-${item.word}`}
                >
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`slider-${item.word}`} className="font-display text-lg font-medium cursor-help">
                                {item.word}
                              </Label>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 p-4">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">{item.word}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                              {selectedTraits[item.word] && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  <Target className="h-2.5 w-2.5" />
                                </Badge>
                              )}
                            </div>
                            <span className={`text-sm font-bold w-6 text-center ${scores[item.word] >= 8 ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`text-score-${item.word}`}>
                              {scores[item.word]}
                            </span>
                          </div>
                          <Slider
                            id={`slider-${item.word}`}
                            min={1}
                            max={10}
                            step={1}
                            value={[scores[item.word]]}
                            onValueChange={(val) => handleScoreChange(item.word, val)}
                            className="py-2"
                            data-testid={`slider-${item.word}`}
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-1">
                            <span>Don't possess</span>
                            <span>Fully live</span>
                          </div>
                          
                          <Collapsible open={expandedCards[item.word]} onOpenChange={() => toggleCardExpanded(item.word)}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground" data-testid={`button-expand-${item.word}`}>
                                {expandedCards[item.word] ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Hide options
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Notes & actions
                                  </>
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 pt-2">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  Personal notes
                                </Label>
                                <Textarea
                                  placeholder="Add your thoughts about this trait..."
                                  value={notes[item.word] || ""}
                                  onChange={(e) => handleNotesChange(item.word, e.target.value)}
                                  className="text-xs min-h-[60px] resize-none"
                                  data-testid={`textarea-notes-${item.word}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`levers-${item.word}`}
                                    checked={selectedTraits[item.word] === 'levers'}
                                    onCheckedChange={(checked) => {
                                      handleTraitSelection(item.word, checked ? 'levers' : null);
                                    }}
                                    data-testid={`checkbox-levers-${item.word}`}
                                  />
                                  <Label htmlFor={`levers-${item.word}`} className="text-xs cursor-pointer flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Track in 8 Levers ({selectedCount}/5 selected)
                                  </Label>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                </CardContent>
              </Card>
              ))}
            </div>
            
            <div className="flex justify-end py-8">
              <Button size="lg" className="shadow-xl shadow-primary/20" onClick={handleSaveAll} data-testid="button-save-assessment">
                Save Assessment Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="report" className="space-y-8 mt-6">
            {/* Selected Traits and Top Values Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    Traits for 8 Levers
                  </CardTitle>
                  <CardDescription>Values you've selected to focus on and develop</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCount === 0 ? (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
                      <Target className="h-12 w-12 mb-4 opacity-30" />
                      <p className="font-medium">No traits selected yet</p>
                      <p className="text-sm mt-1">Go to the Assessment tab and select up to 5 traits to track in your 8 Levers</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assessmentWords
                        .filter(item => selectedTraits[item.word] === 'levers')
                        .map(item => {
                          const score = scores[item.word] || 5;
                          const note = notes[item.word];
                          return (
                            <div key={item.word} className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                                  <span className="font-display font-semibold">{item.word}</span>
                                  <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                                </div>
                                <span className={`text-sm font-bold ${score >= 8 ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {score}/10
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                              {note && (
                                <div className="mt-2 pt-2 border-t border-secondary/10">
                                  <p className="text-xs text-muted-foreground flex items-start gap-1">
                                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span className="italic">{note}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Top Values</CardTitle>
                  <CardDescription>Your six highest-rated traits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getTopValues()}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar
                          name="Values"
                          dataKey="A"
                          stroke="hsl(var(--secondary))"
                          fill="hsl(var(--secondary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Summaries */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Summary by Category</h2>
              <div className="grid gap-6">
                {getCategoryStats.map(stat => {
                  const Icon = categoryIcons[stat.category];
                  return (
                    <Card key={stat.category} className="border-none shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="font-display text-xl">{stat.category}</CardTitle>
                              <CardDescription>{categoryDescriptions[stat.category]}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">{stat.average}</div>
                            <p className="text-sm text-muted-foreground">avg score</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <ScoreGroup
                            label="Excellent (9-10)"
                            items={stat.high}
                            scores={scores}
                            icon={Star}
                            color="text-yellow-500"
                            bgColor="bg-yellow-500/10"
                          />
                          <ScoreGroup
                            label="Strong (7-8)"
                            items={stat.medium}
                            scores={scores}
                            icon={TrendingUp}
                            color="text-green-500"
                            bgColor="bg-green-500/10"
                          />
                          <ScoreGroup
                            label="Developing (5-6)"
                            items={stat.low}
                            scores={scores}
                            icon={Minus}
                            color="text-blue-500"
                            bgColor="bg-blue-500/10"
                          />
                          <ScoreGroup
                            label="Needs Work (<5)"
                            items={stat.veryLow}
                            scores={scores}
                            icon={AlertCircle}
                            color="text-orange-500"
                            bgColor="bg-orange-500/10"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Overall Score Report */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Overall Score Report</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ReportCard
                  title="Excellent (9-10)"
                  description="Your strongest traits"
                  items={getScoresByRange.excellent}
                  scores={scores}
                  icon={Star}
                  color="text-yellow-500"
                  bgColor="bg-yellow-500/10"
                  borderColor="border-yellow-500/30"
                />
                <ReportCard
                  title="Strong (7-8)"
                  description="Well-developed traits"
                  items={getScoresByRange.strong}
                  scores={scores}
                  icon={TrendingUp}
                  color="text-green-500"
                  bgColor="bg-green-500/10"
                  borderColor="border-green-500/30"
                />
                <ReportCard
                  title="Developing (5-6)"
                  description="Room for growth"
                  items={getScoresByRange.developing}
                  scores={scores}
                  icon={Minus}
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                  borderColor="border-blue-500/30"
                />
                <ReportCard
                  title="Needs Work (<5)"
                  description="Focus areas"
                  items={getScoresByRange.needsWork}
                  scores={scores}
                  icon={AlertCircle}
                  color="text-orange-500"
                  bgColor="bg-orange-500/10"
                  borderColor="border-orange-500/30"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ScoreGroup({ 
  label, 
  items, 
  scores, 
  icon: Icon, 
  color, 
  bgColor 
}: { 
  label: string; 
  items: { word: string; category: string }[]; 
  scores: Record<string, number>;
  icon: typeof Star;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-sm font-bold">{items.length}</span>
      </div>
      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">None</p>
        ) : (
          items.map(item => (
            <div key={item.word} className="flex justify-between text-sm">
              <span className="truncate">{item.word}</span>
              <span className="font-medium ml-2">{scores[item.word]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ReportCard({ 
  title, 
  description, 
  items, 
  scores, 
  icon: Icon, 
  color, 
  bgColor,
  borderColor 
}: { 
  title: string; 
  description: string;
  items: { word: string; category: string; score: number }[]; 
  scores: Record<string, number>;
  icon: typeof Star;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <Card className={`${borderColor} border-2`}>
      <CardHeader className="pb-3">
        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center mb-2`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-2xl font-bold">{items.length} traits</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No traits in this range</p>
          ) : (
            items.map(item => (
              <div key={item.word} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                <div>
                  <span className="font-medium">{item.word}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                </div>
                <span className={`font-bold ${color}`}>{item.score}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

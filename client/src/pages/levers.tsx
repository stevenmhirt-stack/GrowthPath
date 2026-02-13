import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Plus, CalendarClock, Check, ChevronDown, ChevronUp, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLevers, saveLever, getGoals, createRoutine, getRoutines } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Lever, Goal, Routine } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { AIAssistButton } from "@/components/AIAssistButton";

interface ActionItem {
  id: number;
  title: string;
}

interface LeverData {
  id: string;
  position: number;
  title: string;
  category: string;
  isActive: boolean;
  progress: number;
  actions: ActionItem[];
}

const leverCategories = ["Health", "Mindframe", "Learning", "Business"];

const createDefaultActions = (): ActionItem[] => 
  Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: "" }));

const defaultLevers: LeverData[] = Array.from({ length: 8 }, (_, i) => ({
  id: `l${i + 1}`,
  position: i + 1,
  title: "",
  category: "Business",
  isActive: false,
  progress: 0,
  actions: createDefaultActions(),
}));

export default function Levers() {
  const [levers, setLevers] = useState<LeverData[]>(defaultLevers);
  const [editingLever, setEditingLever] = useState<LeverData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<{ leverPos: number; actionId: number } | null>(null);
  const [actionText, setActionText] = useState("");
  const [selectedForRoutines, setSelectedForRoutines] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: savedLevers = [], isLoading: leversLoading } = useQuery({
    queryKey: ["levers"],
    queryFn: getLevers,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });

  const { data: existingRoutines = [] } = useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: getRoutines,
  });

  // Mark actions that already exist as routines
  useEffect(() => {
    if (levers.length > 0 && existingRoutines.length > 0) {
      const routineTitles = new Set(existingRoutines.map(r => r.title.toLowerCase()));
      const matchedKeys = new Set<string>();
      
      levers.forEach(lever => {
        lever.actions.forEach(action => {
          if (action.title && routineTitles.has(action.title.toLowerCase())) {
            matchedKeys.add(`${lever.position}-${action.id}`);
          }
        });
      });
      
      if (matchedKeys.size > 0) {
        setSelectedForRoutines(prev => {
          const combined = new Set([...Array.from(prev), ...Array.from(matchedKeys)]);
          return combined;
        });
      }
    }
  }, [levers, existingRoutines]);

  const saveLeverMutation = useMutation({
    mutationFn: saveLever,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levers"] });
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });

  const bigXGoal = goals.find((g: Goal) => g.goalType === "big-x" && g.status === "In Progress");

  const selectedCount = selectedForRoutines.size;

  const handleRoutineToggle = (leverPos: number, actionId: number) => {
    const key = `${leverPos}-${actionId}`;
    setSelectedForRoutines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        if (newSet.size >= 10) {
          toast({
            title: "Maximum 10 routines",
            description: "You can only select up to 10 actions for routines. Deselect one to add another.",
            variant: "destructive",
          });
          return prev;
        }
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleCreateRoutines = async () => {
    if (selectedForRoutines.size === 0) {
      toast({ title: "No actions selected", description: "Select at least one action to create routines.", variant: "destructive" });
      return;
    }

    const routinesToCreate: { leverPos: number; actionId: number; title: string; leverTitle: string }[] = [];
    
    selectedForRoutines.forEach(key => {
      const [leverPos, actionId] = key.split("-").map(Number);
      const lever = levers.find(l => l.position === leverPos);
      if (lever) {
        const action = lever.actions.find(a => a.id === actionId);
        if (action && action.title) {
          routinesToCreate.push({
            leverPos,
            actionId,
            title: action.title,
            leverTitle: lever.title || `Lever ${leverPos}`,
          });
        }
      }
    });

    try {
      for (const routine of routinesToCreate) {
        await createRoutineMutation.mutateAsync({
          title: routine.title,
          category: "Business",
          frequency: "Daily",
          time: "09:00",
          measureOfSuccess: `From ${routine.leverTitle}`,
          completed: false,
          streak: 0,
          scheduledDays: [],
          lastCompleted: null,
          completionHistory: [],
        });
      }
      
      toast({ 
        title: "Routines created!", 
        description: `${routinesToCreate.length} routine(s) added to your Daily Routines.` 
      });
      setLocation("/routines");
    } catch (error) {
      toast({ title: "Failed to create routines", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (savedLevers.length > 0) {
      const mergedLevers = defaultLevers.map(defaultLever => {
        const saved = savedLevers.find((s: Lever) => s.leverTitle === `position-${defaultLever.position}`);
        if (saved) {
          const savedData = saved.selectedActions as { isActive?: boolean; progress?: number; actions?: ActionItem[]; category?: string } | null;
          return {
            ...defaultLever,
            title: saved.actionItem || "",
            category: savedData?.category ?? "Business",
            isActive: savedData?.isActive ?? false,
            progress: savedData?.progress ?? 0,
            actions: savedData?.actions ?? createDefaultActions(),
          };
        }
        return defaultLever;
      });
      setLevers(mergedLevers);
    }
  }, [savedLevers]);

  const handleEditLever = (lever: LeverData) => {
    setEditingLever({ ...lever });
    setIsDialogOpen(true);
  };

  const handleSaveLever = () => {
    if (!editingLever) return;

    setLevers(levers.map(l => 
      l.position === editingLever.position ? editingLever : l
    ));

    saveLeverMutation.mutate({
      leverTitle: `position-${editingLever.position}`,
      score: editingLever.isActive ? 10 : 0,
      actionItem: editingLever.title,
      selectedActions: { isActive: editingLever.isActive, progress: editingLever.progress, actions: editingLever.actions, category: editingLever.category },
    });

    setIsDialogOpen(false);
    setEditingLever(null);
    toast({ title: "Lever saved!" });
  };

  const handleActionClick = (leverPos: number, actionId: number) => {
    const lever = levers.find(l => l.position === leverPos);
    if (!lever) return;
    const action = lever.actions.find(a => a.id === actionId);
    setEditingAction({ leverPos, actionId });
    setActionText(action?.title || "");
  };

  const handleSaveAction = () => {
    if (!editingAction) return;
    
    const updatedLevers = levers.map(l => {
      if (l.position === editingAction.leverPos) {
        const updatedActions = l.actions.map(a => 
          a.id === editingAction.actionId ? { ...a, title: actionText } : a
        );
        
        saveLeverMutation.mutate({
          leverTitle: `position-${l.position}`,
          score: l.isActive ? 10 : 0,
          actionItem: l.title,
          selectedActions: { isActive: l.isActive, progress: l.progress, actions: updatedActions, category: l.category },
        });
        
        return { ...l, actions: updatedActions };
      }
      return l;
    });
    
    setLevers(updatedLevers);
    setEditingAction(null);
    setActionText("");
  };

  if (leversLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading levers...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">The 8 Levers Matrix</h1>
            <p className="text-sm text-muted-foreground">
              Each lever is surrounded by 8 action items. Click to edit, or check the box to add as a routine.
            </p>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs py-1 px-2">
                <CalendarClock className="h-3 w-3 mr-1" />
                {selectedCount}/10 routines selected
              </Badge>
              <Button 
                size="sm" 
                onClick={handleCreateRoutines}
                disabled={createRoutineMutation.isPending}
                data-testid="button-create-routines"
              >
                <Check className="h-4 w-4 mr-1" />
                Create Routines
              </Button>
            </div>
          )}
        </div>

        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between mb-4" data-testid="button-toggle-instructions">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                How to Use the 8 Levers
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
                    Select Your Active Levers (Weeks 1-4)
                  </h3>
                  <p className="text-muted-foreground">Choose 3-5 levers that answer: "If I moved these forward consistently, my Big X would noticeably advance."</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />At least 1 Purpose/Direction lever</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />At least 1 Execution lever (routines or focus)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />At least 1 Sustainability lever (energy or reflection)</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                    Define Supporting Actions (Don't Overbuild)
                  </h3>
                  <p className="text-muted-foreground">For each active lever, identify 1-3 simple supporting actions that are visible, repeatable, and weekly or daily.</p>
                  <p className="text-xs bg-secondary/50 p-2 rounded"><strong>Example:</strong> Lever: Routines → Action: 10-minute daily reflection. That's enough.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                    Operate in a 30-90 Day Cycle
                  </h3>
                  <p className="text-muted-foreground">Live inside your selected levers for 30-90 days. Don't add new levers or optimize everything. Observe patterns, not perfection.</p>
                  <p className="text-xs text-muted-foreground italic">Ask weekly: Is this moving my Big X forward? What feels easier? What feels forced?</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                    Monthly Reflection Checkpoint
                  </h3>
                  <p className="text-muted-foreground">At month's end, assess each active lever: Is it becoming more natural? Is progress visible? For inactive levers: Is any one now asking for attention?</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                    Promote a Lever (One at a Time)
                  </h3>
                  <p className="text-muted-foreground">When an active lever feels stable, promote one from Supporting → Active. Never have more than 5 active levers at once.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                    Integrate All 8 (Mastery Phase)
                  </h3>
                  <p className="text-muted-foreground">Over 6-12 months, all 8 levers become active naturally. You're no longer working the system—the system is working for you.</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-4">
                  <p className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                    <span><strong>If overwhelmed:</strong> Reduce active levers, shrink actions, reconnect to Purpose. This is discipline in disguise.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          {/* Main 3x3 Layout: Top row of levers, Middle with Big X, Bottom row of levers */}
          <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto p-2">
            {/* Top Row: Levers 1, 2, 3 */}
            <LeverCluster 
              lever={levers[0]} 
              onEditLever={() => handleEditLever(levers[0])}
              onEditAction={(actionId) => handleActionClick(1, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(1, actionId)}
            />
            <LeverCluster 
              lever={levers[1]} 
              onEditLever={() => handleEditLever(levers[1])}
              onEditAction={(actionId) => handleActionClick(2, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(2, actionId)}
            />
            <LeverCluster 
              lever={levers[2]} 
              onEditLever={() => handleEditLever(levers[2])}
              onEditAction={(actionId) => handleActionClick(3, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(3, actionId)}
            />

            {/* Middle Row: Lever 4, Big X, Lever 5 */}
            <LeverCluster 
              lever={levers[3]} 
              onEditLever={() => handleEditLever(levers[3])}
              onEditAction={(actionId) => handleActionClick(4, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(4, actionId)}
            />
            
            {/* Big X Center */}
            <div className="flex items-center justify-center p-2">
              <Card className="bg-amber-500 border-amber-600 shadow-xl w-full h-full min-h-[120px] flex items-center justify-center p-3 text-center overflow-auto">
                <CardContent className="p-0 max-h-[200px] overflow-y-auto">
                  {bigXGoal ? (
                    <>
                      <h2 className="text-xs md:text-sm font-bold text-black leading-tight">
                        {bigXGoal.title}
                      </h2>
                      {bigXGoal.description && (
                        <p className="text-[9px] md:text-[10px] text-black/80 mt-1 leading-snug">
                          {bigXGoal.description}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-black font-medium">Set your Big X goal</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <LeverCluster 
              lever={levers[4]} 
              onEditLever={() => handleEditLever(levers[4])}
              onEditAction={(actionId) => handleActionClick(5, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(5, actionId)}
            />

            {/* Bottom Row: Levers 6, 7, 8 */}
            <LeverCluster 
              lever={levers[5]} 
              onEditLever={() => handleEditLever(levers[5])}
              onEditAction={(actionId) => handleActionClick(6, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(6, actionId)}
            />
            <LeverCluster 
              lever={levers[6]} 
              onEditLever={() => handleEditLever(levers[6])}
              onEditAction={(actionId) => handleActionClick(7, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(7, actionId)}
            />
            <LeverCluster 
              lever={levers[7]} 
              onEditLever={() => handleEditLever(levers[7])}
              onEditAction={(actionId) => handleActionClick(8, actionId)}
              selectedForRoutines={selectedForRoutines}
              onRoutineToggle={(actionId) => handleRoutineToggle(8, actionId)}
            />
          </div>
        </ScrollArea>

        {/* Edit Lever Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Lever {editingLever?.position}</DialogTitle>
            </DialogHeader>
            {editingLever && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lever Title</Label>
                  <Input
                    id="title"
                    value={editingLever.title}
                    onChange={(e) => setEditingLever({ ...editingLever, title: e.target.value })}
                    placeholder="Enter lever title..."
                    data-testid="input-lever-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingLever.category}
                    onValueChange={(value) => setEditingLever({ ...editingLever, category: value })}
                  >
                    <SelectTrigger data-testid="select-lever-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {leverCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active Priority (Green)</Label>
                  <Switch
                    id="active"
                    checked={editingLever.isActive}
                    onCheckedChange={(checked) => setEditingLever({ ...editingLever, isActive: checked })}
                    data-testid="switch-lever-active"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Progress: {editingLever.progress}%</Label>
                  </div>
                  <Slider
                    value={[editingLever.progress]}
                    onValueChange={(value) => setEditingLever({ ...editingLever, progress: value[0] })}
                    max={100}
                    step={5}
                    className="w-full"
                    data-testid="slider-lever-progress"
                  />
                  <Progress value={editingLever.progress} className="h-2" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLever} data-testid="button-save-lever">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Action Dialog */}
        <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="actionTitle">Action Item</Label>
                  <AIAssistButton
                    fieldName="Action Item"
                    formType="levers"
                    context={editingAction ? `Lever: ${levers[editingAction.leverPos - 1]?.title || 'Life Lever'}` : ""}
                    currentValue={actionText}
                    onApply={(suggestion) => setActionText(suggestion)}
                  />
                </div>
                <Input
                  id="actionTitle"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Enter action item..."
                  data-testid="input-action-title"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAction(null)}>Cancel</Button>
              <Button onClick={handleSaveAction} data-testid="button-save-action">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

function LeverCluster({ 
  lever, 
  onEditLever,
  onEditAction,
  selectedForRoutines,
  onRoutineToggle,
}: { 
  lever: LeverData;
  onEditLever: () => void;
  onEditAction: (actionId: number) => void;
  selectedForRoutines: Set<string>;
  onRoutineToggle: (actionId: number) => void;
}) {
  // Actions layout:
  // Row 1: actions[0], actions[1], actions[2] (top 3)
  // Row 2: actions[3], LEVER, actions[4] (left, center, right)
  // Row 3: actions[5], actions[6], actions[7] (bottom 3)
  
  const isSelected = (actionId: number) => selectedForRoutines.has(`${lever.position}-${actionId}`);
  
  return (
    <div className="grid grid-cols-3 gap-1">
      {/* Top row: 3 actions */}
      <ActionCell action={lever.actions[0]} leverActive={lever.isActive} onClick={() => onEditAction(1)} isSelectedForRoutine={isSelected(1)} onRoutineToggle={() => onRoutineToggle(1)} />
      <ActionCell action={lever.actions[1]} leverActive={lever.isActive} onClick={() => onEditAction(2)} isSelectedForRoutine={isSelected(2)} onRoutineToggle={() => onRoutineToggle(2)} />
      <ActionCell action={lever.actions[2]} leverActive={lever.isActive} onClick={() => onEditAction(3)} isSelectedForRoutine={isSelected(3)} onRoutineToggle={() => onRoutineToggle(3)} />
      
      {/* Middle row: action, lever, action */}
      <ActionCell action={lever.actions[3]} leverActive={lever.isActive} onClick={() => onEditAction(4)} isSelectedForRoutine={isSelected(4)} onRoutineToggle={() => onRoutineToggle(4)} />
      <LeverCell lever={lever} onClick={onEditLever} />
      <ActionCell action={lever.actions[4]} leverActive={lever.isActive} onClick={() => onEditAction(5)} isSelectedForRoutine={isSelected(5)} onRoutineToggle={() => onRoutineToggle(5)} />
      
      {/* Bottom row: 3 actions */}
      <ActionCell action={lever.actions[5]} leverActive={lever.isActive} onClick={() => onEditAction(6)} isSelectedForRoutine={isSelected(6)} onRoutineToggle={() => onRoutineToggle(6)} />
      <ActionCell action={lever.actions[6]} leverActive={lever.isActive} onClick={() => onEditAction(7)} isSelectedForRoutine={isSelected(7)} onRoutineToggle={() => onRoutineToggle(7)} />
      <ActionCell action={lever.actions[7]} leverActive={lever.isActive} onClick={() => onEditAction(8)} isSelectedForRoutine={isSelected(8)} onRoutineToggle={() => onRoutineToggle(8)} />
    </div>
  );
}

function LeverCell({ 
  lever, 
  onClick 
}: { 
  lever: LeverData;
  onClick: () => void;
}) {
  const isEmpty = !lever.title;

  const MAX_LEVER_CHARS = 50;
  const displayTitle = lever.title.length > MAX_LEVER_CHARS 
    ? lever.title.substring(0, MAX_LEVER_CHARS) + "..." 
    : lever.title;

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-300 hover:scale-110 
        flex flex-col items-center justify-center p-2 text-center min-h-[100px] relative overflow-hidden
        shadow-lg hover:shadow-xl border-2
        ${lever.isActive 
          ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 border-emerald-300 text-white ring-2 ring-emerald-300/50' 
          : 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-slate-300 text-slate-700 hover:from-slate-300 hover:via-slate-400 hover:to-slate-500 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 dark:border-slate-500 dark:text-slate-100'}
      `}
      onClick={onClick}
      data-testid={`lever-cell-${lever.position}`}
    >
      <CardContent className="p-0 flex flex-col items-center w-full">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium opacity-80">Lever {lever.position}</span>
          </div>
        ) : (
          <div className="w-full px-1">
            <div className="flex items-center justify-center mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Lever {lever.position}</span>
            </div>
            <p className="text-xs md:text-sm font-bold leading-snug text-center drop-shadow-sm break-words">
              {displayTitle}
            </p>
            <div className="mt-2 w-full">
              <div className="flex items-center justify-center mb-1">
                <span className="text-xs font-bold drop-shadow-sm">{lever.progress}%</span>
              </div>
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${lever.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionCell({ 
  action, 
  leverActive,
  onClick,
  isSelectedForRoutine,
  onRoutineToggle,
}: { 
  action: ActionItem;
  leverActive: boolean;
  onClick: () => void;
  isSelectedForRoutine: boolean;
  onRoutineToggle: () => void;
}) {
  const isEmpty = !action.title;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEmpty) {
      onRoutineToggle();
    }
  };

  return (
    <div 
      className={`
        cursor-pointer transition-all duration-200 hover:scale-105 relative
        flex items-center justify-center p-1 text-center min-h-[40px] rounded border
        ${isSelectedForRoutine 
          ? 'bg-blue-100 border-blue-400 ring-1 ring-blue-400 dark:bg-blue-900/30 dark:border-blue-600'
          : leverActive 
            ? 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700' 
            : 'bg-gray-100 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700'}
      `}
      onClick={onClick}
      data-testid={`action-cell-${action.id}`}
    >
      {isEmpty ? (
        <Plus className="h-2 w-2 text-muted-foreground" />
      ) : (
        <>
          <p className="text-[8px] md:text-[9px] leading-tight line-clamp-3 text-foreground pr-3">
            {action.title}
          </p>
          <div 
            className="absolute top-0.5 right-0.5"
            onClick={handleCheckboxClick}
          >
            <Checkbox
              checked={isSelectedForRoutine}
              className="h-3 w-3 border-muted-foreground/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              data-testid={`checkbox-routine-${action.id}`}
            />
          </div>
        </>
      )}
    </div>
  );
}

import { Layout } from "@/components/layout";
import { BigXHeader } from "@/components/big-x-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Routine } from "@shared/schema";
import { CheckCircle2, Flame, Clock, Plus, Pencil, Trash2, Target, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoutines, updateRoutine, createRoutine, deleteRoutine } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoutinesForDay, type RoutineScheduleInfo } from "@shared/scheduling";

const routineCategories = [
  { value: "Health/Wellness", label: "Health/Wellness", emoji: "💪" },
  { value: "Mindframe", label: "Mindframe", emoji: "🧠" },
  { value: "Learning/Development", label: "Learning/Development", emoji: "📚" },
  { value: "Business", label: "Business", emoji: "💼" },
];

const frequencyOptions = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "3x Weekly", label: "3 times per week" },
  { value: "Bi-weekly", label: "Bi-weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
];

const daysOfWeek = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

interface RoutineFormData {
  title: string;
  category: string;
  frequency: string;
  scheduledDays: string[];
  measureOfSuccess: string;
  time: string;
}

const defaultFormData: RoutineFormData = {
  title: "",
  category: "Health/Wellness",
  frequency: "Daily",
  scheduledDays: [],
  measureOfSuccess: "",
  time: "",
};

export default function Routines() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [formData, setFormData] = useState<RoutineFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ["routines"],
    queryFn: getRoutines,
  });

  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
      toast({ title: "Routine created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create routine", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Routine> }) => updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setIsEditDialogOpen(false);
      setEditingRoutine(null);
      setFormData(defaultFormData);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setDeleteConfirmId(null);
      setDeleteConfirmTitle("");
      toast({ title: "Routine deleted", description: "Your completion history has been preserved" });
    },
    onError: () => {
      setDeleteConfirmId(null);
      setDeleteConfirmTitle("");
      toast({ title: "Failed to delete routine", variant: "destructive" });
    },
  });

  const handleAddRoutine = () => {
    setFormData(defaultFormData);
    setIsAddDialogOpen(true);
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormData({
      title: routine.title,
      category: routine.category,
      frequency: routine.frequency,
      scheduledDays: (routine.scheduledDays as string[]) || [],
      measureOfSuccess: routine.measureOfSuccess || "",
      time: routine.time || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteRoutine = (id: string, title: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmTitle(title);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteConfirmTitle("");
    }
  };

  const handleSubmitAdd = () => {
    if (formData.title.trim()) {
      createMutation.mutate({
        title: formData.title,
        category: formData.category,
        frequency: formData.frequency,
        scheduledDays: formData.scheduledDays,
        measureOfSuccess: formData.measureOfSuccess,
        time: formData.time || null,
        completed: false,
        streak: 0,
        lastCompleted: null,
        completionHistory: [],
        archived: false,
        archivedAt: null,
      });
    }
  };

  const handleSubmitEdit = () => {
    if (editingRoutine && formData.title.trim()) {
      updateMutation.mutate({
        id: editingRoutine.id,
        data: {
          title: formData.title,
          category: formData.category,
          frequency: formData.frequency,
          scheduledDays: formData.scheduledDays,
          measureOfSuccess: formData.measureOfSuccess,
          time: formData.time || null,
        },
      });
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduledDays: prev.scheduledDays.includes(day)
        ? prev.scheduledDays.filter(d => d !== day)
        : [...prev.scheduledDays, day],
    }));
  };

  const categories = routineCategories.map(c => c.value);
  const maxStreak = routines.length > 0 ? Math.max(...routines.map(r => r.streak), 0) : 0;

  const todaysRoutines = useMemo(() => {
    const today = new Date();
    const routineInfos: RoutineScheduleInfo[] = routines.map(r => ({
      id: r.id,
      title: r.title,
      time: r.time,
      frequency: r.frequency,
      scheduledDays: r.scheduledDays as string[] | null,
      category: r.category,
      completed: r.completed,
      streak: r.streak,
      measureOfSuccess: r.measureOfSuccess,
      createdAt: r.createdAt,
    }));
    const scheduled = getRoutinesForDay(routineInfos, today);
    return routines.filter(r => scheduled.some(s => s.id === r.id));
  }, [routines]);

  const todaysCompletionRate = todaysRoutines.length > 0 
    ? Math.round((todaysRoutines.filter(r => r.completed).length / todaysRoutines.length) * 100)
    : 0;

  const getCategoryEmoji = (category: string) => {
    return routineCategories.find(c => c.value === category)?.emoji || "📋";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading routines...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <BigXHeader />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">My Routines</h1>
            <p className="text-muted-foreground">Build consistency through structured habits and routines.</p>
          </div>
          <Button className="shadow-lg shadow-primary/20" onClick={handleAddRoutine} data-testid="button-add-routine">
            <Plus className="mr-2 h-4 w-4" /> Add Routine
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">{routines.length}</span>
              <span className="text-sm text-muted-foreground">Total Routines</span>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-orange-500">{maxStreak}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Flame className="h-4 w-4" /> Best Streak
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-blue-500">{todaysRoutines.length}</span>
              <span className="text-sm text-muted-foreground">Scheduled Today</span>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="today" data-testid="tab-today-routines">Today</TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-routines">All Routines</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat.toLowerCase().replace("/", "-")} data-testid={`tab-${cat.toLowerCase().replace("/", "-")}-routines`}>
                {getCategoryEmoji(cat)} {cat.split("/")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Scheduled Routines
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} - Go to Daily Planner to mark routines complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysRoutines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">No routines scheduled for today</p>
                    <p className="text-sm">Create routines to start building your daily habits!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todaysRoutines.map(routine => (
                      <div
                        key={routine.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 border-border"
                        data-testid={`today-routine-${routine.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{routine.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{getCategoryEmoji(routine.category)} {routine.category}</span>
                              {routine.time && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {routine.time}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {routine.streak > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {routine.streak}
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditRoutine(routine)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {routines.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No routines yet</p>
                <p className="text-sm">Add your first routine to start building consistency!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {categories.map(category => {
                  const categoryRoutines = routines.filter(r => r.category === category);
                  if (categoryRoutines.length === 0) return null;
                  
                  return (
                    <Card key={category} className="h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          {getCategoryEmoji(category)} {category}
                        </CardTitle>
                        <CardDescription>{categoryRoutines.length} routine(s)</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="space-y-1">
                          {categoryRoutines.map(routine => (
                            <RoutineItem 
                              key={routine.id} 
                              routine={routine} 
                              onEdit={() => handleEditRoutine(routine)}
                              onDelete={() => handleDeleteRoutine(routine.id, routine.title)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat.toLowerCase().replace("/", "-")} className="max-w-3xl">
              <Card>
                <CardHeader>
                  <CardTitle>{getCategoryEmoji(cat)} {cat} Routines</CardTitle>
                  <CardDescription>Your structured plan for {cat.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {routines.filter(r => r.category === cat).map(routine => (
                    <RoutineItem 
                      key={routine.id} 
                      routine={routine} 
                      onEdit={() => handleEditRoutine(routine)}
                      onDelete={() => handleDeleteRoutine(routine.id, routine.title)}
                      showDetails
                    />
                  ))}
                  {routines.filter(r => r.category === cat).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No routines set for this category yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Add Routine Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Routine</DialogTitle>
            <DialogDescription>
              Create a new routine to track regularly. Set your frequency and measure of success.
            </DialogDescription>
          </DialogHeader>
          <RoutineForm 
            formData={formData}
            setFormData={setFormData}
            toggleDay={toggleDay}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAdd} disabled={createMutation.isPending} data-testid="button-submit-routine">
              {createMutation.isPending ? "Creating..." : "Create Routine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Routine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Routine</DialogTitle>
            <DialogDescription>
              Update your routine details.
            </DialogDescription>
          </DialogHeader>
          <RoutineForm 
            formData={formData}
            setFormData={setFormData}
            toggleDay={toggleDay}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={updateMutation.isPending} data-testid="button-update-routine">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) { setDeleteConfirmId(null); setDeleteConfirmTitle(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Routine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmTitle}"? Your completion history and streak data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmId(null); setDeleteConfirmTitle(""); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending} data-testid="button-confirm-delete-routine">
              {deleteMutation.isPending ? "Deleting..." : "Delete Routine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function RoutineForm({ 
  formData, 
  setFormData, 
  toggleDay 
}: { 
  formData: RoutineFormData; 
  setFormData: React.Dispatch<React.SetStateAction<RoutineFormData>>;
  toggleDay: (day: string) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Routine Name</Label>
        <Input
          id="title"
          placeholder="e.g., Morning meditation"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          data-testid="input-routine-title"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger data-testid="select-routine-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {routineCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value, scheduledDays: [] }))}
          >
            <SelectTrigger data-testid="select-routine-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(formData.frequency === "Weekly" || formData.frequency === "3x Weekly" || formData.frequency === "Bi-weekly") && (
        <div className="grid gap-2">
          <Label>Select Days of the Week</Label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = formData.scheduledDays.includes(day.value);
              return (
                <div
                  key={day.value}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted/50 hover:bg-muted border-border'}
                  `}
                  onClick={() => toggleDay(day.value)}
                  data-testid={`day-chip-${day.value}`}
                >
                  <Checkbox 
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">{day.label.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
          {formData.scheduledDays.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {formData.scheduledDays.join(", ")}
            </p>
          )}
        </div>
      )}

      {(formData.frequency === "Monthly" || formData.frequency === "Quarterly") && (
        <div className="grid gap-2">
          <Label>Monthly Schedule</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">On day</span>
              <Select
                value={formData.scheduledDays[0] || "1"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, scheduledDays: [value] }))}
              >
                <SelectTrigger className="w-20" data-testid="select-day-of-month">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">of {formData.frequency === "Quarterly" ? "each quarter" : "each month"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Or select a specific weekday pattern:
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={formData.scheduledDays[1] || "1st"}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  scheduledDays: [prev.scheduledDays[0] || "1", value, prev.scheduledDays[2] || "Mon"] 
                }))}
              >
                <SelectTrigger className="w-24" data-testid="select-ordinal">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st</SelectItem>
                  <SelectItem value="2nd">2nd</SelectItem>
                  <SelectItem value="3rd">3rd</SelectItem>
                  <SelectItem value="4th">4th</SelectItem>
                  <SelectItem value="last">Last</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.scheduledDays[2] || "Mon"}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  scheduledDays: [prev.scheduledDays[0] || "1", prev.scheduledDays[1] || "1st", value] 
                }))}
              >
                <SelectTrigger className="w-32" data-testid="select-weekday">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">of {formData.frequency === "Quarterly" ? "each quarter" : "each month"}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="time">Preferred Time (optional)</Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          data-testid="input-routine-time"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="measureOfSuccess">Measure of Success</Label>
        <Textarea
          id="measureOfSuccess"
          placeholder="How will you know you've completed this routine successfully? e.g., 'Meditated for 10 minutes without interruption'"
          value={formData.measureOfSuccess}
          onChange={(e) => setFormData(prev => ({ ...prev, measureOfSuccess: e.target.value }))}
          data-testid="input-routine-measure"
        />
      </div>
    </div>
  );
}

export function RoutineItem({ 
  routine, 
  onEdit,
  onDelete,
  showDetails = false
}: { 
  routine: Routine; 
  onEdit?: () => void;
  onDelete?: () => void;
  showDetails?: boolean;
}) {
  const getFrequencyLabel = (frequency: string) => {
    const freq = frequencyOptions.find(f => f.value === frequency);
    return freq?.label || frequency;
  };

  return (
    <div 
      className="flex flex-col p-3 rounded-lg transition-all group hover:bg-muted"
      data-testid={`routine-item-${routine.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
            <Calendar className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" data-testid={`text-routine-title-${routine.id}`}>
              {routine.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {routine.time && (
                <>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {routine.time}</span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {getFrequencyLabel(routine.frequency)}</span>
              <span>•</span>
              <span className="flex items-center gap-1" data-testid={`text-routine-streak-${routine.id}`}><Flame className="h-3 w-3 text-orange-500" /> {routine.streak}</span>
            </div>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} data-testid={`button-edit-routine-${routine.id}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} data-testid={`button-delete-routine-${routine.id}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {showDetails && routine.measureOfSuccess && (
        <div className="mt-2 ml-8 p-2 bg-muted/50 rounded-md">
          <div className="flex items-start gap-2">
            <Target className="h-3 w-3 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">{routine.measureOfSuccess}</p>
          </div>
        </div>
      )}
      
      {showDetails && (() => {
        const days = routine.scheduledDays as string[] | null;
        return days && days.length > 0 && (
          <div className="mt-2 ml-8 flex gap-1 flex-wrap">
            {days.map((day) => (
              <Badge key={day} variant="outline" className="text-[10px]">{day}</Badge>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

import { Layout } from "@/components/layout";
import { BigXHeader } from "@/components/big-x-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Routine, ScheduleItem } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Moon, Sun, Plus, CheckCircle2, Flame, Target, ChevronLeft, ChevronRight, X, Trash2, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getScheduleItems, getDailyReflection, saveDailyReflection, getRoutines, updateRoutine, createScheduleItem, deleteScheduleItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getRoutinesForDay, sortByTime, type RoutineScheduleInfo } from "@shared/scheduling";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CombinedItem {
  id: string;
  time: string | null;
  title: string;
  type: "schedule" | "routine";
  category: string;
  completed?: boolean;
  streak?: number;
  measureOfSuccess?: string | null;
  routine?: Routine;
  scheduleItem?: ScheduleItem;
}

const formatLocalDateStr = (date: Date): string => {
  return date.toLocaleDateString('en-CA');
};

export default function DailyPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    activity: "",
    time: "",
    type: "Task",
  });
  const selectedDateStr = formatLocalDateStr(selectedDate);
  const todayStr = formatLocalDateStr(new Date());
  const isToday = selectedDateStr === todayStr;
  const isPast = selectedDateStr < todayStr;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [reflection, setReflection] = useState({
    mainFocus: "",
    gratitude: "",
    wins: "",
    improvements: "",
  });

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const wasRoutineCompletedOnDate = (routine: Routine, dateStr: string): boolean => {
    const history = (routine.completionHistory as string[]) || [];
    return history.some(d => {
      if (d.startsWith(dateStr)) return true;
      if (d.includes('T')) {
        const historyDate = new Date(d);
        return formatLocalDateStr(historyDate) === dateStr;
      }
      return false;
    });
  };

  const { data: schedule = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: getScheduleItems,
  });

  const { data: routines = [] } = useQuery({
    queryKey: ["routines"],
    queryFn: getRoutines,
    refetchInterval: 15000,
  });

  const { data: savedReflection } = useQuery({
    queryKey: ["reflection", selectedDateStr],
    queryFn: () => getDailyReflection(selectedDateStr),
  });

  useEffect(() => {
    if (savedReflection) {
      setReflection({
        mainFocus: savedReflection.mainFocus || "",
        gratitude: savedReflection.gratitude || "",
        wins: savedReflection.wins || "",
        improvements: savedReflection.improvements || "",
      });
    } else {
      setReflection({
        mainFocus: "",
        gratitude: "",
        wins: "",
        improvements: "",
      });
    }
  }, [savedReflection, selectedDateStr]);

  const saveReflectionMutation = useMutation({
    mutationFn: saveDailyReflection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflection", selectedDateStr] });
      toast({ title: "Reflection saved!" });
    },
  });

  const updateRoutineMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Routine> }) => updateRoutine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      toast({
        title: variables.data.completed ? "Routine completed!" : "Routine unchecked",
        description: variables.data.completed ? "Great job staying on track!" : "Marked as incomplete",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: createScheduleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      setAddEventOpen(false);
      setNewEvent({ activity: "", time: "", type: "Task" });
      toast({ title: "Event added!" });
    },
    onError: () => {
      toast({ title: "Failed to add event", variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteScheduleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast({ title: "Event deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  const handleAddEvent = () => {
    if (!newEvent.activity.trim()) {
      toast({ title: "Please enter an activity name", variant: "destructive" });
      return;
    }
    if (!newEvent.time) {
      toast({ title: "Please select a time", variant: "destructive" });
      return;
    }
    createEventMutation.mutate({
      activity: newEvent.activity,
      time: newEvent.time,
      type: newEvent.type,
      orderIndex: 0,
    });
  };

  const toggleRoutine = (routine: Routine) => {
    const newCompleted = !routine.completed;
    const now = new Date();
    const todayKey = formatLocalDateStr(now);
    const history = (routine.completionHistory as string[]) || [];
    
    const isEntryForToday = (d: string): boolean => {
      if (d.startsWith(todayKey)) return true;
      if (d.includes('T')) {
        const historyDate = new Date(d);
        return formatLocalDateStr(historyDate) === todayKey;
      }
      return false;
    };
    
    let newHistory: string[];
    if (newCompleted) {
      const alreadyHasToday = history.some(isEntryForToday);
      newHistory = alreadyHasToday ? history : [...history, todayKey];
    } else {
      newHistory = history.filter(d => !isEntryForToday(d));
    }
    
    updateRoutineMutation.mutate({
      id: routine.id,
      data: {
        completed: newCompleted,
        streak: newCompleted ? routine.streak + 1 : Math.max(0, routine.streak - 1),
        lastCompleted: newCompleted ? now : routine.lastCompleted,
        completionHistory: newHistory,
      },
    });
  };

  const handleReflectionChange = (field: string, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveReflection = () => {
    saveReflectionMutation.mutate({
      date: selectedDateStr,
      ...reflection,
    });
  };

  // Get routines scheduled for the selected date
  const scheduledRoutines = useMemo(() => {
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
    
    const scheduled = getRoutinesForDay(routineInfos, selectedDate);
    return routines.filter(r => scheduled.some(s => s.id === r.id));
  }, [routines, selectedDate]);

  // Combine schedule items and routines into a unified timeline
  const combinedTimeline = useMemo(() => {
    const items: CombinedItem[] = [];
    
    // Add schedule items (only for today, not historical)
    if (isToday) {
      schedule.forEach(item => {
        items.push({
          id: `schedule-${item.id}`,
          time: item.time,
          title: item.activity,
          type: "schedule",
          category: item.type,
          scheduleItem: item,
        });
      });
    }
    
    // Add routines for the selected date with times
    scheduledRoutines.forEach(routine => {
      const wasCompleted = wasRoutineCompletedOnDate(routine, selectedDateStr);
      items.push({
        id: `routine-${routine.id}`,
        time: routine.time,
        title: routine.title,
        type: "routine",
        category: routine.category,
        completed: wasCompleted,
        streak: routine.streak,
        measureOfSuccess: routine.measureOfSuccess,
        routine: routine,
      });
    });
    
    // Sort by time
    return sortByTime(items);
  }, [schedule, scheduledRoutines, isToday, selectedDateStr]);

  // Split into timed and anytime items
  const timedItems = combinedTimeline.filter(item => item.time);
  const anytimeRoutines = scheduledRoutines.filter(r => !r.time);

  // Group routines by category for the tabs view
  const routinesByCategory = useMemo(() => {
    return {
      "Health/Wellness": scheduledRoutines.filter(r => r.category === "Health/Wellness"),
      "Mindframe": scheduledRoutines.filter(r => r.category === "Mindframe"),
      "Learning/Development": scheduledRoutines.filter(r => r.category === "Learning/Development"),
      "Business": scheduledRoutines.filter(r => r.category === "Business"),
    };
  }, [scheduledRoutines]);

  const completedCount = scheduledRoutines.filter(r => wasRoutineCompletedOnDate(r, selectedDateStr)).length;
  const totalCount = scheduledRoutines.length;

  return (
    <Layout>
      <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
        <BigXHeader />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Daily Planner</h1>
            <div className="text-muted-foreground flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => navigateDate(-1)}
                  data-testid="button-prev-day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-8 gap-2 px-3 font-normal"
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => navigateDate(1)}
                  data-testid="button-next-day"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {!isToday && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 ml-1 text-xs"
                    onClick={goToToday}
                    data-testid="button-go-to-today"
                  >
                    Today
                  </Button>
                )}
              </div>
              
              {totalCount > 0 && (
                <Badge variant={isPast ? "outline" : "secondary"} className="ml-2">
                  {completedCount}/{totalCount} routines
                  {isPast && " (historical)"}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["routines"] })}
              title="Sync routines (auto-syncs every 15s)"
              data-testid="button-sync-routines"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleSaveReflection} variant="outline" data-testid="button-save-reflection">
              Save Reflection
            </Button>
            {isToday && (
              <Button 
                className="shadow-lg shadow-primary/20" 
                data-testid="button-add-event"
                onClick={() => setAddEventOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column: Combined Schedule & Routines Timeline */}
          <Card className="lg:col-span-1 flex flex-col h-full overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {isToday ? "Today's Schedule" : "Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-6 pt-0 space-y-0 relative">
                  <div className="absolute left-[4.5rem] top-0 bottom-0 w-px bg-border/50" />
                  
                  {timedItems.map((item) => (
                    <TimelineItem 
                      key={item.id} 
                      item={item} 
                      onToggle={isToday && item.type === "routine" && item.routine ? () => toggleRoutine(item.routine!) : undefined}
                      onDelete={isToday && item.type === "schedule" && item.scheduleItem ? () => deleteEventMutation.mutate(item.scheduleItem!.id) : undefined}
                      isReadOnly={!isToday}
                    />
                  ))}
                  
                  {timedItems.length === 0 && anytimeRoutines.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No scheduled items for {isToday ? "today" : "this date"}. Add routines or events to get started.
                    </div>
                  )}
                  
                  {/* Anytime Routines Section */}
                  {anytimeRoutines.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 ml-2">
                        {isToday ? "Anytime Today" : "Anytime"}
                      </p>
                      {anytimeRoutines.map(routine => (
                        <RoutineTimelineItem 
                          key={routine.id} 
                          routine={routine} 
                          onToggle={isToday ? () => toggleRoutine(routine) : undefined}
                          isCompleted={wasRoutineCompletedOnDate(routine, selectedDateStr)}
                          isReadOnly={!isToday}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Middle Column: Reflection & Focus */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
            {/* Top Section: Focus & Reflection */}
            <div className="grid md:grid-cols-2 gap-6 shrink-0">
              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sun className="h-4 w-4 text-orange-500" />
                    Morning Intentions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Main Focus</Label>
                    <Textarea 
                      placeholder="What is the one thing I must accomplish today?"
                      className="font-medium min-h-[80px] resize-none"
                      value={reflection.mainFocus}
                      onChange={(e) => handleReflectionChange("mainFocus", e.target.value)}
                      data-testid="input-main-focus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Gratitude</Label>
                    <Textarea 
                      placeholder="I am grateful for..."
                      className="min-h-[80px] resize-none"
                      value={reflection.gratitude}
                      onChange={(e) => handleReflectionChange("gratitude", e.target.value)}
                      data-testid="input-gratitude"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    Evening Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wins</Label>
                    <Textarea 
                      placeholder="What went well today?"
                      className="min-h-[80px] resize-none"
                      value={reflection.wins}
                      onChange={(e) => handleReflectionChange("wins", e.target.value)}
                      data-testid="input-wins"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Improvements</Label>
                    <Input 
                      placeholder="What could I have done better?"
                      value={reflection.improvements}
                      onChange={(e) => handleReflectionChange("improvements", e.target.value)}
                      data-testid="input-improvements"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section: Routines by Category */}
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/50">
              <CardHeader className="pb-2 shrink-0">
                <CardTitle className="text-base">{isToday ? "Today's" : "Scheduled"} Routines by Category</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <Tabs defaultValue="all" className="h-full flex flex-col">
                  <div className="px-6">
                    <TabsList className="w-full justify-start flex-wrap h-auto gap-1 py-1">
                      <TabsTrigger value="all" className="text-xs" data-testid="tab-all-daily-routines">
                        All ({completedCount}/{totalCount})
                      </TabsTrigger>
                      {Object.entries(routinesByCategory).map(([category, items]) => (
                        items.length > 0 && (
                          <TabsTrigger key={category} value={category} className="text-xs" data-testid={`tab-${category.toLowerCase().replace("/", "-")}-daily`}>
                            {category.split("/")[0]} ({items.filter(r => wasRoutineCompletedOnDate(r, selectedDateStr)).length}/{items.length})
                          </TabsTrigger>
                        )
                      ))}
                    </TabsList>
                  </div>
                  
                  <ScrollArea className="flex-1 p-6 pt-4">
                    <TabsContent value="all" className="mt-0 space-y-2">
                      {scheduledRoutines.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No routines scheduled for {isToday ? "today" : "this date"}. Add routines with frequency settings to see them here.
                        </p>
                      ) : (
                        scheduledRoutines.map(routine => (
                          <RoutineCard 
                            key={routine.id} 
                            routine={routine} 
                            onToggle={isToday ? () => toggleRoutine(routine) : undefined}
                            isCompleted={wasRoutineCompletedOnDate(routine, selectedDateStr)}
                            isReadOnly={!isToday}
                          />
                        ))
                      )}
                    </TabsContent>
                    
                    {Object.entries(routinesByCategory).map(([category, items]) => (
                      <TabsContent key={category} value={category} className="mt-0 space-y-2">
                        {items.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No {category.toLowerCase()} routines scheduled for {isToday ? "today" : "this date"}.
                          </p>
                        ) : (
                          items.map(routine => (
                            <RoutineCard 
                              key={routine.id} 
                              routine={routine} 
                              onToggle={isToday ? () => toggleRoutine(routine) : undefined}
                              isCompleted={wasRoutineCompletedOnDate(routine, selectedDateStr)}
                              isReadOnly={!isToday}
                            />
                          ))
                        )}
                      </TabsContent>
                    ))}
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Add a one-time event or important task to your daily schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-activity">Event Name</Label>
              <Input
                id="event-activity"
                placeholder="What do you need to do?"
                value={newEvent.activity}
                onChange={(e) => setNewEvent({ ...newEvent, activity: e.target.value })}
                data-testid="input-event-activity"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  data-testid="input-event-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Category</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger id="event-type" data-testid="select-event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Deadline">Deadline</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              disabled={createEventMutation.isPending}
              data-testid="button-confirm-add-event"
            >
              {createEventMutation.isPending ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function TimelineItem({ item, onToggle, onDelete, isReadOnly }: { item: CombinedItem; onToggle?: () => void; onDelete?: () => void; isReadOnly?: boolean }) {
  const isRoutine = item.type === "routine";
  const isEvent = item.type === "schedule";
  const canToggle = isRoutine && !isReadOnly && onToggle;
  
  return (
    <div 
      className={`
        relative group flex gap-4 py-4 rounded-lg transition-colors px-2 -mx-2
        ${isRoutine ? 'cursor-default' : 'hover:bg-muted/20'}
        ${item.completed ? 'opacity-60' : ''}
      `}
      data-testid={`timeline-item-${item.id}`}
    >
      <div className="w-14 text-xs font-medium text-muted-foreground pt-1 text-right shrink-0">
        {item.time}
      </div>
      <div className="flex-1 pt-0.5">
        <div className={`
          absolute left-[4.25rem] top-5 h-3 w-3 rounded-full border-2 bg-background z-10
          ${isRoutine 
            ? (item.completed ? 'bg-primary border-primary' : 'border-primary') 
            : 'border-muted-foreground'}
        `}>
          {isRoutine && item.completed && <CheckCircle2 className="h-2 w-2 text-primary-foreground" />}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canToggle && (
              <Checkbox
                checked={!!item.completed}
                onCheckedChange={() => onToggle()}
                className="h-5 w-5"
                data-testid={`checkbox-routine-${item.id}`}
              />
            )}
            <p className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
              {item.title}
            </p>
            {isRoutine && (
              <Badge variant="outline" className="text-[10px]">Routine</Badge>
            )}
            {isEvent && (
              <Badge variant="secondary" className="text-[10px]">Event</Badge>
            )}
          </div>
          {isEvent && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{item.category}</p>
          {isRoutine && item.streak !== undefined && item.streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <Flame className="h-3 w-3" /> {item.streak}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface RoutineTimelineItemProps {
  routine: Routine;
  onToggle?: () => void;
  isCompleted?: boolean;
  isReadOnly?: boolean;
}

function RoutineTimelineItem({ routine, onToggle, isCompleted, isReadOnly }: RoutineTimelineItemProps) {
  const completed = isCompleted ?? routine.completed;
  const canToggle = !isReadOnly && onToggle;
  
  return (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-colors cursor-default
        ${completed ? 'bg-primary/5 opacity-60' : isReadOnly ? 'opacity-50' : ''}
      `}
      data-testid={`routine-timeline-${routine.id}`}
    >
      {canToggle ? (
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle()}
          className="h-5 w-5 shrink-0"
          data-testid={`checkbox-anytime-routine-${routine.id}`}
        />
      ) : (
        <div className={`
          h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
          ${completed 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-muted-foreground/30'}
        `}>
          {completed && <CheckCircle2 className="h-3 w-3" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${completed ? 'line-through text-muted-foreground' : ''}`}>
          {routine.title}
        </p>
        <p className="text-xs text-muted-foreground">{routine.category}</p>
      </div>
      {routine.streak > 0 && (
        <span className="flex items-center gap-1 text-xs text-orange-500 shrink-0">
          <Flame className="h-3 w-3" /> {routine.streak}
        </span>
      )}
    </div>
  );
}

interface RoutineCardProps {
  routine: Routine;
  onToggle?: () => void;
  isCompleted?: boolean;
  isReadOnly?: boolean;
}

function RoutineCard({ routine, onToggle, isCompleted, isReadOnly }: RoutineCardProps) {
  const completed = isCompleted ?? routine.completed;
  const canToggle = !isReadOnly && onToggle;
  
  return (
    <div 
      className={`
        flex flex-col p-4 rounded-lg border transition-all cursor-default
        ${completed 
          ? 'bg-primary/5 border-primary/20' 
          : isReadOnly 
            ? 'bg-card/50 opacity-60' 
            : 'bg-card'}
      `}
      data-testid={`routine-card-${routine.id}`}
    >
      <div className="flex items-start gap-3">
        {canToggle ? (
          <Checkbox
            checked={completed}
            onCheckedChange={() => onToggle()}
            className="h-6 w-6 shrink-0 mt-0.5"
            data-testid={`checkbox-card-routine-${routine.id}`}
          />
        ) : (
          <div className={`
            h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5
            ${completed 
              ? 'bg-primary border-primary text-primary-foreground' 
              : 'border-muted-foreground/30'}
          `}>
            {completed && <CheckCircle2 className="h-4 w-4" />}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
              {routine.title}
            </p>
            {routine.streak > 0 && (
              <span className="flex items-center gap-1 text-sm text-orange-500 shrink-0">
                <Flame className="h-4 w-4" /> {routine.streak}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px]">{routine.category}</Badge>
            <Badge variant="outline" className="text-[10px]">{routine.frequency}</Badge>
            {routine.time && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {routine.time}
              </span>
            )}
          </div>
          {routine.measureOfSuccess && (
            <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{routine.measureOfSuccess}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

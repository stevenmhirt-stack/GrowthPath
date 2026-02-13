import type { Goal, Routine, ScheduleItem, DailyReflection, AssessmentScore, Lever } from "@shared/schema";

const API_BASE = "/api";

// Goals API
export async function getGoals(): Promise<Goal[]> {
  const response = await fetch(`${API_BASE}/goals`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch goals");
  return response.json();
}

export async function createGoal(goal: Omit<Goal, "id" | "userId" | "createdAt">): Promise<Goal> {
  const response = await fetch(`${API_BASE}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to create goal");
  return response.json();
}

export async function updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
  const response = await fetch(`${API_BASE}/goals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to update goal");
  return response.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/goals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete goal");
}

// Routines API
export async function getRoutines(): Promise<Routine[]> {
  const response = await fetch(`${API_BASE}/routines`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch routines");
  return response.json();
}

export async function createRoutine(routine: Omit<Routine, "id" | "userId" | "createdAt">): Promise<Routine> {
  const response = await fetch(`${API_BASE}/routines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to create routine");
  return response.json();
}

export async function updateRoutine(id: string, routine: Partial<Routine>): Promise<Routine> {
  const response = await fetch(`${API_BASE}/routines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to update routine");
  return response.json();
}

export async function deleteRoutine(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/routines/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete routine");
}

// Schedule Items API
export async function getScheduleItems(): Promise<ScheduleItem[]> {
  const response = await fetch(`${API_BASE}/schedule`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch schedule items");
  return response.json();
}

export async function createScheduleItem(item: Omit<ScheduleItem, "id" | "userId" | "createdAt">): Promise<ScheduleItem> {
  const response = await fetch(`${API_BASE}/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to create schedule item");
  return response.json();
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/schedule/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete schedule item");
}

// Daily Reflections API
export async function getDailyReflection(date: string): Promise<DailyReflection | null> {
  const response = await fetch(`${API_BASE}/reflections/${date}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch reflection");
  return response.json();
}

export async function saveDailyReflection(reflection: Omit<DailyReflection, "id" | "userId" | "createdAt">): Promise<DailyReflection> {
  const response = await fetch(`${API_BASE}/reflections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reflection),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to save reflection");
  return response.json();
}

// Assessment Scores API
export async function getAssessmentScores(): Promise<AssessmentScore[]> {
  const response = await fetch(`${API_BASE}/assessment`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch assessment scores");
  return response.json();
}

export async function saveAssessmentScore(score: Omit<AssessmentScore, "id" | "userId" | "updatedAt">): Promise<AssessmentScore> {
  const response = await fetch(`${API_BASE}/assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(score),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to save assessment score");
  return response.json();
}

// Levers API
export async function getLevers(): Promise<Lever[]> {
  const response = await fetch(`${API_BASE}/levers`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch levers");
  return response.json();
}

export async function saveLever(lever: Omit<Lever, "id" | "userId" | "updatedAt">): Promise<Lever> {
  const response = await fetch(`${API_BASE}/levers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lever),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to save lever");
  return response.json();
}

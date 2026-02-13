// Scheduling utilities for determining which routines should appear on a given day

export type Frequency = "Daily" | "Weekly" | "3x Weekly" | "Bi-weekly" | "Monthly" | "Quarterly";

export interface RoutineScheduleInfo {
  id: string;
  title: string;
  time: string | null;
  frequency: string;
  scheduledDays: string[] | null;
  category: string;
  completed: boolean;
  streak: number;
  measureOfSuccess: string | null;
  createdAt: Date | string | null;
}

const dayOfWeekMap: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function isRoutineScheduledForDay(routine: RoutineScheduleInfo, targetDate: Date): boolean {
  const frequency = routine.frequency as Frequency;
  const dayOfWeek = dayOfWeekMap[targetDate.getDay()];
  const dayOfMonth = targetDate.getDate();
  const month = targetDate.getMonth(); // 0-11

  switch (frequency) {
    case "Daily":
      return true;

    case "Weekly": {
      const scheduledDays = routine.scheduledDays || [];
      if (scheduledDays.length > 0) {
        return scheduledDays.includes(dayOfWeek);
      }
      return dayOfWeek === "Mon";
    }

    case "3x Weekly": {
      const scheduledDays = routine.scheduledDays || [];
      return scheduledDays.includes(dayOfWeek);
    }

    case "Bi-weekly": {
      // Check if current week is an "active" week based on routine creation date
      const createdAt = routine.createdAt ? new Date(routine.createdAt) : new Date();
      const createdWeek = getWeekNumber(createdAt);
      const currentWeek = getWeekNumber(targetDate);
      const weekDiff = Math.abs(currentWeek - createdWeek);
      
      // Active on even weeks from creation
      if (weekDiff % 2 !== 0) return false;
      
      // Also check if specific days are scheduled
      const scheduledDays = routine.scheduledDays || [];
      if (scheduledDays.length > 0) {
        return scheduledDays.includes(dayOfWeek);
      }
      // If no specific days, show on weekdays
      return targetDate.getDay() >= 1 && targetDate.getDay() <= 5;
    }

    case "Monthly": {
      // Check if it's the first occurrence of a specific day, or same day of month
      const scheduledDays = routine.scheduledDays || [];
      if (scheduledDays.length > 0) {
        // First occurrence of the scheduled day in the month
        if (!scheduledDays.includes(dayOfWeek)) return false;
        // Check if this is the first occurrence
        return dayOfMonth <= 7;
      }
      // Default: first Monday of the month or 1st of month
      return dayOfMonth === 1 || (dayOfWeek === "Mon" && dayOfMonth <= 7);
    }

    case "Quarterly": {
      // First day of each quarter (Jan, Apr, Jul, Oct)
      const quarterStartMonths = [0, 3, 6, 9];
      if (!quarterStartMonths.includes(month)) return false;
      return dayOfMonth === 1;
    }

    default:
      return false;
  }
}

export function getRoutinesForDay<T extends RoutineScheduleInfo>(routines: T[], targetDate: Date): T[] {
  return routines.filter(routine => isRoutineScheduledForDay(routine, targetDate));
}

export function sortByTime<T extends { time: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

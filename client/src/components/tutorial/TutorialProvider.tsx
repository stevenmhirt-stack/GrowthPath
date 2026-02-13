import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  placement?: "top" | "bottom" | "left" | "right";
  action?: "click" | "navigate" | "input";
  nextRoute?: string;
  highlightPadding?: number;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
}

interface TutorialContextType {
  activeTutorial: Tutorial | null;
  currentStepIndex: number;
  isActive: boolean;
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  completedTutorials: string[];
  availableTutorials: Tutorial[];
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export const tutorials: Tutorial[] = [
  {
    id: "welcome",
    name: "Welcome to GrowthPath",
    description: "Learn the basics of your personal development journey",
    steps: [
      {
        id: "welcome-intro",
        title: "Welcome to GrowthPath!",
        description: "This quick tour will show you how to use GrowthPath to achieve your professional goals. Let's get started!",
        placement: "bottom",
      },
      {
        id: "welcome-dashboard",
        title: "Your Dashboard",
        description: "This is your home base. Here you'll see your progress at a glance, including your Big X goal, stats, and recent activity.",
        targetSelector: "[data-testid='text-welcome']",
        placement: "bottom",
      },
      {
        id: "welcome-navigation",
        title: "Navigation Menu",
        description: "Use the sidebar to navigate between different sections. Each area helps you build different aspects of your growth journey.",
        targetSelector: "aside",
        placement: "right",
        highlightPadding: 0,
      },
      {
        id: "welcome-getting-started",
        title: "Getting Started Guide",
        description: "Visit the Getting Started page anytime to review the RACE methodology: Reflect, Assess, Commit, Execute, and Repeat.",
        targetSelector: "a[href='/getting-started']",
        placement: "right",
      },
      {
        id: "welcome-tutorials",
        title: "Access Tutorials Anytime",
        description: "Click the help icon in the header to access these guided tutorials whenever you need a refresher.",
        targetSelector: "[data-testid='button-tutorial-menu']",
        placement: "bottom",
      },
      {
        id: "welcome-complete",
        title: "You're Ready!",
        description: "That's the basics! We recommend starting with the Assessment to discover your core values, then setting your Big X goal.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "assessment-guide",
    name: "36 Values Assessment",
    description: "Learn how to complete your values assessment",
    steps: [
      {
        id: "assessment-intro",
        title: "Values Assessment",
        description: "The 36-Word Assessment helps you identify your core values - the principles that drive your decisions and define your character.",
        placement: "bottom",
      },
      {
        id: "assessment-how",
        title: "How It Works",
        description: "You'll rate 36 different values on a scale of 1-10 based on how strongly each resonates with who you are and who you want to become.",
        placement: "bottom",
      },
      {
        id: "assessment-tips",
        title: "Tips for Success",
        description: "Be honest with yourself - there are no wrong answers! Consider both who you are today and who you aspire to be.",
        placement: "bottom",
      },
      {
        id: "assessment-complete",
        title: "Review Your Results",
        description: "Once complete, you'll see your top values highlighted. Use these insights to inform your goals and routines!",
        placement: "bottom",
      },
    ],
  },
  {
    id: "goals-guide",
    name: "Setting Your Goals",
    description: "Learn how to create meaningful goals",
    steps: [
      {
        id: "goals-intro",
        title: "My Goals",
        description: "This is where you define what you're working toward. Your goals should be clear, measurable, and meaningful to you.",
        placement: "bottom",
      },
      {
        id: "goals-bigx",
        title: "Your Big X",
        description: "Start by defining your Big X - your major 3-5 year vision. This is the north star that guides all other goals.",
        placement: "bottom",
      },
      {
        id: "goals-types",
        title: "Goal Hierarchy",
        description: "Goals come in different types: Big X (3-5 years), Intermediate (18-30 months), Near-term (12-18 months), and Current Capability (present focus).",
        placement: "bottom",
      },
      {
        id: "goals-milestones",
        title: "Add Milestones",
        description: "Break down each goal into milestones. Small wins build momentum and keep you motivated on the journey.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "levers-guide",
    name: "8 Levers Framework",
    description: "Understand the 8 key areas of life performance",
    steps: [
      {
        id: "levers-intro",
        title: "The 8 Levers",
        description: "The 8 Levers represent key life domains that support your Big X. Balancing these areas creates sustainable success.",
        placement: "bottom",
      },
      {
        id: "levers-scoring",
        title: "Score Each Lever",
        description: "Rate each lever from 1-10 based on how well you're currently performing in that area. This creates your baseline.",
        placement: "bottom",
      },
      {
        id: "levers-actions",
        title: "Select Actions",
        description: "For each lever, choose specific actions you'll take to improve. These become your routines and habits.",
        placement: "bottom",
      },
      {
        id: "levers-balance",
        title: "Seek Balance",
        description: "The goal isn't perfection in every area - it's finding the right balance that supports your Big X.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "routines-guide",
    name: "Building Routines",
    description: "Create daily habits that drive progress",
    steps: [
      {
        id: "routines-intro",
        title: "My Routines",
        description: "Routines are the daily habits that compound into major results. Consistency beats intensity every time.",
        placement: "bottom",
      },
      {
        id: "routines-create",
        title: "Create a Routine",
        description: "Use the 'Add Routine' button to create a new habit. Define what you'll do, when, and how often.",
        placement: "bottom",
      },
      {
        id: "routines-tracking",
        title: "Track Completion",
        description: "Check off routines as you complete them each day. Watch your streak grow as you build consistency!",
        placement: "bottom",
      },
      {
        id: "routines-streaks",
        title: "Build Streaks",
        description: "Streaks are powerful motivators. Try not to break the chain - but if you do, just start again!",
        placement: "bottom",
      },
    ],
  },
];

const STORAGE_KEY = "growthpath_completed_tutorials";

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompletedTutorials(JSON.parse(saved));
    }
  }, []);

  const saveCompleted = (tutorials: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tutorials));
    setCompletedTutorials(tutorials);
  };

  const startTutorial = (tutorialId: string) => {
    const tutorial = tutorials.find((t) => t.id === tutorialId);
    if (tutorial) {
      setActiveTutorial(tutorial);
      setCurrentStepIndex(0);
    }
  };

  const nextStep = () => {
    if (activeTutorial && currentStepIndex < activeTutorial.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const skipTutorial = () => {
    setActiveTutorial(null);
    setCurrentStepIndex(0);
  };

  const completeTutorial = () => {
    if (activeTutorial && !completedTutorials.includes(activeTutorial.id)) {
      saveCompleted([...completedTutorials, activeTutorial.id]);
    }
    setActiveTutorial(null);
    setCurrentStepIndex(0);
  };

  return (
    <TutorialContext.Provider
      value={{
        activeTutorial,
        currentStepIndex,
        isActive: activeTutorial !== null,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
        completedTutorials,
        availableTutorials: tutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

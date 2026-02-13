import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  LogOut,
  User,
  ListChecks,
  CalendarClock,
  Calendar,
  Octagon,
  Trophy,
  Medal,
  Rocket
} from "lucide-react";

export interface Lever {
  id: string;
  title: string;
  description: string;
  score: number; // 1-10
  actionItem: string;
  potentialActions: string[];
}

export const mockLevers: Lever[] = [
  { 
    id: "l1", 
    title: "Mindset", 
    description: "Cultivating resilience, growth thinking, and mental clarity.", 
    score: 7, 
    actionItem: "Daily gratitude practice",
    potentialActions: [
      "Daily gratitude journaling",
      "10-min mindfulness meditation",
      "Morning visualization",
      "Positive affirmations",
      "Reframe one challenge daily",
      "Read 10 pages of philosophy",
      "Seek constructive feedback",
      "Celebrate 3 small wins"
    ]
  },
  { 
    id: "l2", 
    title: "Energy", 
    description: "Managing physical vitality, sleep, and stress levels.", 
    score: 6, 
    actionItem: "Sleep 8 hours consistent",
    potentialActions: [
      "Sleep 7-8 hours consistently",
      "Drink 3L of water daily",
      "Eat whole, unprocessed foods",
      "30 mins daily exercise",
      "Morning sunlight exposure",
      "Cold shower / therapy",
      "Deep breathing breaks",
      "Limit caffeine after 12 PM"
    ]
  },
  { 
    id: "l3", 
    title: "Strategy", 
    description: "Planning, prioritizing, and aligning actions with vision.", 
    score: 8, 
    actionItem: "Sunday weekly review",
    potentialActions: [
      "Conduct Sunday weekly review",
      "Set daily top 3 priorities",
      "Review long-term goals monthly",
      "Perform 80/20 analysis on tasks",
      "Practice saying 'No' to distractions",
      "Implement time-blocking",
      "Quarterly strategic planning",
      "Identify key bottlenecks"
    ]
  },
  { 
    id: "l4", 
    title: "Influence", 
    description: "Building relationships, networking, and persuasive communication.", 
    score: 5, 
    actionItem: "Connect with 2 mentors",
    potentialActions: [
      "Attend one networking event",
      "Mentor a junior colleague",
      "Practice public speaking",
      "Write and publish insights",
      "Practice active listening",
      "Build rapport with stakeholders",
      "Study negotiation tactics",
      "Engage on professional social media"
    ]
  },
  { 
    id: "l5", 
    title: "Environment", 
    description: "Optimizing physical workspace and digital ecosystems.", 
    score: 9, 
    actionItem: "Declutter desk daily",
    potentialActions: [
      "Clear physical workspace daily",
      "Digital file decluttering",
      "Add inspiring visual cues",
      "Optimize ergonomic setup",
      "Remove phone/distractions",
      "Spend time in nature",
      "Curate information feed",
      "Surround yourself with A-players"
    ]
  },
  { 
    id: "l6", 
    title: "Skills", 
    description: "Continuous learning, technical mastery, and talent development.", 
    score: 7, 
    actionItem: "Complete React course",
    potentialActions: [
      "Take an online course",
      "Read industry-related books",
      "Practice deliberate drills",
      "Teach a concept to others",
      "Attend a workshop/seminar",
      "Build a side project",
      "Seek code/work reviews",
      "Train soft skills (EQ)"
    ]
  },
  { 
    id: "l7", 
    title: "Finance", 
    description: "Managing personal/business resources and investment growth.", 
    score: 4, 
    actionItem: "Review monthly budget",
    potentialActions: [
      "Review monthly budget",
      "Automate investments",
      "Track daily expenses",
      "Negotiate recurring bills",
      "Brainstorm income streams",
      "Build emergency fund",
      "Pay down high-interest debt",
      "Audit subscriptions"
    ]
  },
  { 
    id: "l8", 
    title: "Execution", 
    description: "Taking consistent, disciplined action on high-value tasks.", 
    score: 8, 
    actionItem: "Daily deep work blocks",
    potentialActions: [
      "Schedule deep work blocks",
      "Use Pomodoro technique",
      "Eat the frog (hardest task first)",
      "Eliminate multitasking",
      "Set aggressive deadlines",
      "Check in with accountability partner",
      "Batch similar tasks",
      "Review daily performance metrics"
    ]
  },
];

export interface Routine {
  id: string;
  title: string;
  time: string;
  frequency: "Daily" | "Weekly" | "Weekdays";
  category: "Morning" | "Workday" | "Evening" | "Weekly";
  completed: boolean;
  streak: number;
}

export const mockRoutines: Routine[] = [
  { id: "r1", title: "Deep Work Session (90m)", time: "09:00 AM", frequency: "Weekdays", category: "Workday", completed: false, streak: 12 },
  { id: "r2", title: "Daily Planning & Review", time: "08:30 AM", frequency: "Daily", category: "Morning", completed: true, streak: 45 },
  { id: "r3", title: "Team Sync", time: "11:00 AM", frequency: "Weekdays", category: "Workday", completed: false, streak: 5 },
  { id: "r4", title: "Evening Reflection", time: "06:00 PM", frequency: "Daily", category: "Evening", completed: false, streak: 8 },
  { id: "r5", title: "Weekly Retrospective", time: "Friday", frequency: "Weekly", category: "Weekly", completed: false, streak: 3 },
  { id: "r6", title: "Read Industry News", time: "08:00 AM", frequency: "Daily", category: "Morning", completed: true, streak: 21 },
];

export interface Goal {
  id: string;
  title: string;
  category: "Skills" | "Career" | "Personal" | "Project";
  status: "In Progress" | "Completed" | "On Hold";
  progress: number; // 0-100
  deadline: string;
  description: string;
  milestones: { id: string; title: string; completed: boolean }[];
}

export type AssessmentCategory = "Who I Am" | "How I Think" | "How I Act";

export interface AssessmentItem {
  word: string;
  description: string;
  category: AssessmentCategory;
}

export const assessmentWords: AssessmentItem[] = [
  // Who I Am (12 words)
  {
    word: "Authentic",
    description: "Being true to oneself, expressing thoughts, feelings, and values honestly. Score 1: Frequently hides true self or suppresses opinions. Score 10: Consistently lives and communicates in alignment with true beliefs.",
    category: "Who I Am"
  },
  {
    word: "Humble",
    description: "Modest view of one's own importance, being open to learning from others. Score 1: Highly self-centered or arrogant. Score 10: Consistently values others' perspectives and admits mistakes.",
    category: "Who I Am"
  },
  {
    word: "Purpose-driven",
    description: "Having a clear sense of direction, motivation, and meaning. Score 1: Feels aimless or lacks motivation. Score 10: Strongly guided by a sense of purpose and aligns actions with core values.",
    category: "Who I Am"
  },
  {
    word: "Resilient",
    description: "Capacity to withstand and recover from adversity or setbacks. Score 1: Very difficult to cope with challenges. Score 10: Consistently recovers quickly and adapts positively to change.",
    category: "Who I Am"
  },
  {
    word: "Courageous",
    description: "Willingness to face fear, risk, or uncertainty in pursuit of values or goals. Score 1: Avoids challenges or risk. Score 10: Consistently confronts fears and takes bold actions.",
    category: "Who I Am"
  },
  {
    word: "Compassionate",
    description: "Capacity to recognize the suffering of others and feel motivated to alleviate it. Score 1: Rarely notices needs of others. Score 10: Deeply attuned to others' emotions and actively seeks to support them.",
    category: "Who I Am"
  },
  {
    word: "Trustworthy",
    description: "Quality of being reliable, honest, and deserving of confidence. Score 1: Generally unreliable or breaks promises. Score 10: Consistently demonstrates integrity and keeps their word.",
    category: "Who I Am"
  },
  {
    word: "Confident",
    description: "Sense of self-assurance and belief in one's abilities, qualities, and judgment. Score 1: Very little belief in themselves. Score 10: Strong, unwavering belief in themselves and their presence.",
    category: "Who I Am"
  },
  {
    word: "Grateful",
    description: "Recognizing and appreciating the positive aspects of life. Score 1: Rarely notices or values the good in life. Score 10: Consistently acknowledges and deeply appreciates even small gestures.",
    category: "Who I Am"
  },
  {
    word: "Responsible",
    description: "Tendency to reliably fulfill obligations and honor commitments. Score 1: Avoids duties or neglects promises. Score 10: Highly dependable and takes ownership of tasks.",
    category: "Who I Am"
  },
  {
    word: "Ethical",
    description: "Commitment to moral principles, honesty, and doing what is right. Score 1: Rarely considers ethical standards. Score 10: Consistently upholds the highest moral standards and integrity.",
    category: "Who I Am"
  },
  {
    word: "Self-aware",
    description: "Capacity to recognize and understand one's own emotions and behaviors. Score 1: Little insight into own feelings or impact. Score 10: Highly attuned to internal states and strengths.",
    category: "Who I Am"
  },
  // How I Think (12 words)
  {
    word: "Strategic",
    description: "Ability to think ahead, plan effectively, and align decisions with long-term goals. Score 1: Rarely considers future consequences. Score 10: Consistently anticipates future scenarios and plans accordingly.",
    category: "How I Think"
  },
  {
    word: "Curious",
    description: "Strong desire to learn, explore, and understand new ideas. Score 1: Rarely seeks new knowledge. Score 10: Highly inquisitive and constantly seeks to expand understanding.",
    category: "How I Think"
  },
  {
    word: "Solution-oriented",
    description: "Mindset focused on identifying effective ways to overcome challenges. Score 1: Focuses on difficulties and feels stuck. Score 10: Consistently approaches situations with a proactive attitude toward solutions.",
    category: "How I Think"
  },
  {
    word: "Optimistic",
    description: "Tendency to expect positive outcomes and focus on favorable aspects. Score 1: Consistently anticipates negative results. Score 10: Habitually expects the best and sees potential for improvement.",
    category: "How I Think"
  },
  {
    word: "Analytical",
    description: "Ability to systematically examine information, identify patterns, and break down complex problems. Score 1: Rarely engages in critical thinking. Score 10: Excels at dissecting complex issues and applying logical reasoning.",
    category: "How I Think"
  },
  {
    word: "Reflective",
    description: "Tendency to thoughtfully consider experiences, actions, and ideas. Score 1: Rarely engages in self-examination. Score 10: Consistently analyzes experiences to guide personal growth.",
    category: "How I Think"
  },
  {
    word: "Experimental",
    description: "Willingness to try new ideas, approaches, or methods. Score 1: Highly resistant to new experiences. Score 10: Actively seeks out novel concepts and unconventional solutions.",
    category: "How I Think"
  },
  {
    word: "Systems-minded",
    description: "Ability to perceive, understand, and think in terms of interconnected systems. Score 1: Sees issues in isolation, missing connections. Score 10: Naturally considers the bigger picture and ripple effects.",
    category: "How I Think"
  },
  {
    word: "Possibility-focused",
    description: "Mindset oriented toward seeing opportunities and potential. Score 1: Focuses on limitations and obstacles. Score 10: Consistently envisions new possibilities and creative solutions.",
    category: "How I Think"
  },
  {
    word: "Empowered",
    description: "Sense of having control over your thoughts, decisions, and direction of life. Score 1: Feels powerless, dictated by external factors. Score 10: Consistently feels confident in ability to direct their own path.",
    category: "How I Think"
  },
  {
    word: "Priority-driven",
    description: "Focus on what is most important, organizing thoughts around clear goals. Score 1: Focus is scattered without a sense of direction. Score 10: Consistently aligns thinking and decisions with top priorities.",
    category: "How I Think"
  },
  {
    word: "Long-term",
    description: "Ability to prioritize future outcomes and sustainable success over immediate gratification. Score 1: Focuses only on the immediate present. Score 10: Makes decisions based on long-term vision and sustainability.",
    category: "How I Think"
  },
  // How I Act (12 words)
  {
    word: "Disciplined",
    description: "Ability to consistently regulate one's actions, behaviors, and impulses. Score 1: Difficult to maintain routines or resist distractions. Score 10: Exceptional self-control and reliability in following plans.",
    category: "How I Act"
  },
  {
    word: "Personable",
    description: "Quality of being pleasant, friendly, and easy to interact with. Score 1: Distant, unapproachable, or difficult to engage. Score 10: Warm, engaging, and approachable in social settings.",
    category: "How I Act"
  },
  {
    word: "Proactive",
    description: "Tendency to take initiative and anticipate potential challenges. Score 1: Rarely takes initiative, waits for direction. Score 10: Consistently anticipates needs and takes charge of situations.",
    category: "How I Act"
  },
  {
    word: "Decisive",
    description: "Ability to make choices confidently and promptly. Score 1: Consistently struggles to make decisions, paralyzed by options. Score 10: Makes decisions quickly and confidently, even in complex situations.",
    category: "How I Act"
  },
  {
    word: "Focused",
    description: "Ability to concentrate attention and effort on a specific task or goal. Score 1: Easily distracted, struggles to maintain attention. Score 10: Consistently directs attention with precision and minimizes distractions.",
    category: "How I Act"
  },
  {
    word: "Accountable",
    description: "Refers to the willingness and ability to take responsibility for one's actions, decisions, and their outcomes. Score 1: Avoids responsibility, makes excuses. Score 10: Reliably owns choices and acknowledges mistakes or successes.",
    category: "How I Act"
  },
  {
    word: "Intentional",
    description: "Acting with purpose, forethought, and clear motivation. Score 1: Actions are largely unplanned or reactive. Score 10: Actions are consistently guided by conscious choices and clear goals.",
    category: "How I Act"
  },
  {
    word: "Prepared",
    description: "Extent to which a person anticipates needs and organizes resources. Score 1: Rarely plans ahead, often caught off guard. Score 10: Consistently anticipates needs and thoroughly organizes resources.",
    category: "How I Act"
  },
  {
    word: "Supportive",
    description: "Tendency to offer encouragement, assistance, and understanding to others. Score 1: Rarely provides help or backing. Score 10: Consistently goes out of way to uplift and assist others.",
    category: "How I Act"
  },
  {
    word: "Adaptable",
    description: "Ability to adjust behavior, thinking, or approach in response to new situations. Score 1: Extremely difficult to change habits. Score 10: Embraces change with ease and thrives in dynamic circumstances.",
    category: "How I Act"
  },
  {
    word: "Collaborative",
    description: "Tendency to work effectively and willingly with others toward shared goals. Score 1: Prefers to work alone, resists input. Score 10: Actively encourages group participation and excels at building consensus.",
    category: "How I Act"
  },
  {
    word: "Self-managed",
    description: "Ability to independently organize and direct actions without external supervision. Score 1: Relies heavily on others for direction. Score 10: Consistently takes initiative and manages time effectively.",
    category: "How I Act"
  }
];

export const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Master Advanced React Patterns",
    category: "Skills",
    status: "In Progress",
    progress: 65,
    deadline: "2025-03-15",
    description: "Deep dive into compound components, render props, and custom hooks optimization.",
    milestones: [
      { id: "m1", title: "Complete Advanced React Course", completed: true },
      { id: "m2", title: "Build a component library", completed: true },
      { id: "m3", title: "Refactor legacy codebases", completed: false },
    ]
  },
  {
    id: "2",
    title: "Lead Q2 Product Launch",
    category: "Career",
    status: "In Progress",
    progress: 40,
    deadline: "2025-06-01",
    description: "Coordinate cross-functional teams to deliver the new analytics dashboard feature.",
    milestones: [
      { id: "m4", title: "Finalize requirements", completed: true },
      { id: "m5", title: "Design review sign-off", completed: true },
      { id: "m6", title: "Beta testing phase", completed: false },
      { id: "m7", title: "Public release", completed: false },
    ]
  },
  {
    id: "3",
    title: "Public Speaking Improvement",
    category: "Personal",
    status: "On Hold",
    progress: 20,
    deadline: "2025-12-31",
    description: "Join Toastmasters and deliver 5 speeches this year.",
    milestones: [
      { id: "m8", title: "Join local chapter", completed: true },
      { id: "m9", title: "First Icebreaker speech", completed: false },
    ]
  },
  {
    id: "4",
    title: "Obtain AWS Certification",
    category: "Skills",
    status: "Completed",
    progress: 100,
    deadline: "2025-01-15",
    description: "Study for and pass the AWS Solutions Architect Associate exam.",
    milestones: [
      { id: "m10", title: "Complete video course", completed: true },
      { id: "m11", title: "Practice exams", completed: true },
      { id: "m12", title: "Pass exam", completed: true },
    ]
  }
];

export const navItems = [
  { icon: Rocket, label: "Home", href: "/", premium: false },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", premium: false },
  { icon: ListChecks, label: "Assessment", href: "/assessment", premium: true },
  { icon: Target, label: "My Goals", href: "/goals", premium: false },
  { icon: Octagon, label: "8 Levers", href: "/levers", premium: false },
  { icon: CalendarClock, label: "Routines", href: "/routines", premium: true },
  { icon: Calendar, label: "Daily Planner", href: "/daily", premium: true },
  { icon: Trophy, label: "Badges", href: "/badges", premium: false },
  { icon: Medal, label: "Leaderboard", href: "/leaderboard", premium: false },
];

export const userProfile = {
  name: "Alex Morgan",
  role: "Senior Product Designer",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  stats: {
    completedGoals: 12,
    currentStreak: 5,
    totalHours: 145
  }
};

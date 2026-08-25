export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in-progress" | "completed";

export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
export const STATUSES: Status[] = ["todo", "in-progress", "completed"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string | null; // yyyy-mm-dd
  category: string;
  owner: string;
  createdAt: string;
  sourceMeetingId?: string;
  parentId?: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  priority: Priority;
  dueDate: string | null;
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  openQuestions: string[];
  participants: string[];
}

export interface Meeting {
  id: string;
  title: string;
  notes: string;
  summary: MeetingSummary | null;
  createdAt: string;
  tasksCreated: boolean;
}

export type Tone = "professional" | "friendly" | "formal" | "concise" | "persuasive" | "follow-up";
export const TONES: Tone[] = [
  "professional",
  "friendly",
  "formal",
  "concise",
  "persuasive",
  "follow-up",
];

export type Length = "short" | "medium" | "long";

export interface EmailDraft {
  id: string;
  purpose: string;
  recipient: string;
  keyPoints: string;
  tone: Tone;
  length: Length;
  subject: string;
  body: string;
  createdAt: string;
  sourceMeetingId?: string;
}

export interface Activity {
  id: string;
  kind: "meeting" | "email" | "task" | "plan" | "assistant";
  text: string;
  createdAt: string;
}

export interface Preferences {
  userName: string;
  signOff: string;
  defaultTone: Tone;
  defaultCategory: string;
}

export interface EmailPrefill {
  purpose: string;
  recipient: string;
  keyPoints: string;
  tone: Tone;
  contextLabel: string;
  sourceMeetingId?: string;
}

export interface AppData {
  tasks: Task[];
  meetings: Meeting[];
  emails: EmailDraft[];
  activity: Activity[];
  preferences: Preferences;
}

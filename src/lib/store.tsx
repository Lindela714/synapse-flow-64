import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Activity,
  AppData,
  EmailDraft,
  EmailPrefill,
  Meeting,
  Preferences,
  Task,
} from "./types";

const STORAGE_KEY = "meridian:data:v1";

const defaultPreferences: Preferences = {
  userName: "Alex Reyes",
  signOff: "Best regards,\nAlex",
  defaultTone: "professional",
  defaultCategory: "General",
};

const emptyData: AppData = {
  tasks: [],
  meetings: [],
  emails: [],
  activity: [],
  preferences: defaultPreferences,
};

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function load(): AppData {
  if (typeof window === "undefined") return emptyData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...emptyData,
      ...parsed,
      preferences: { ...defaultPreferences, ...(parsed.preferences ?? {}) },
    };
  } catch {
    return emptyData;
  }
}

interface StoreValue extends AppData {
  hydrated: boolean;
  addTask: (task: Partial<Task> & { name: string }) => Task;
  addTasks: (tasks: Array<Partial<Task> & { name: string }>) => Task[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addMeeting: (meeting: Partial<Meeting> & { title: string; notes: string }) => Meeting;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addEmail: (email: Omit<EmailDraft, "id" | "createdAt">) => EmailDraft;
  deleteEmail: (id: string) => void;
  logActivity: (kind: Activity["kind"], text: string) => void;
  setPreferences: (patch: Partial<Preferences>) => void;
  emailPrefill: EmailPrefill | null;
  setEmailPrefill: (prefill: EmailPrefill | null) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [hydrated, setHydrated] = useState(false);
  const [emailPrefill, setEmailPrefill] = useState<EmailPrefill | null>(null);

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable — app still works in-memory */
    }
  }, [data, hydrated]);

  const logActivity = useCallback((kind: Activity["kind"], text: string) => {
    setData((d) => ({
      ...d,
      activity: [{ id: uid(), kind, text, createdAt: new Date().toISOString() }, ...d.activity].slice(
        0,
        40,
      ),
    }));
  }, []);

  const makeTask = useCallback(
    (t: Partial<Task> & { name: string }, category: string): Task => ({
      id: uid(),
      name: t.name,
      description: t.description ?? "",
      priority: t.priority ?? "medium",
      status: t.status ?? "todo",
      dueDate: t.dueDate ?? null,
      category: t.category || category,
      owner: t.owner ?? "",
      createdAt: new Date().toISOString(),
      sourceMeetingId: t.sourceMeetingId,
      parentId: t.parentId,
    }),
    [],
  );

  const value = useMemo<StoreValue>(() => {
    return {
      ...data,
      hydrated,
      emailPrefill,
      setEmailPrefill,
      logActivity,
      addTask: (t) => {
        const task = makeTask(t, data.preferences.defaultCategory);
        setData((d) => ({ ...d, tasks: [task, ...d.tasks] }));
        logActivity("task", `Task created: ${task.name}`);
        return task;
      },
      addTasks: (list) => {
        const tasks = list.map((t) => makeTask(t, data.preferences.defaultCategory));
        setData((d) => ({ ...d, tasks: [...tasks, ...d.tasks] }));
        logActivity("task", `${tasks.length} tasks added to the planner`);
        return tasks;
      },
      updateTask: (id, patch) =>
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
      addMeeting: (m) => {
        const meeting: Meeting = {
          id: uid(),
          title: m.title,
          notes: m.notes,
          summary: m.summary ?? null,
          createdAt: new Date().toISOString(),
          tasksCreated: false,
        };
        setData((d) => ({ ...d, meetings: [meeting, ...d.meetings] }));
        logActivity("meeting", `Meeting summarized: ${meeting.title}`);
        return meeting;
      },
      updateMeeting: (id, patch) =>
        setData((d) => ({
          ...d,
          meetings: d.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      deleteMeeting: (id) =>
        setData((d) => ({ ...d, meetings: d.meetings.filter((m) => m.id !== id) })),
      addEmail: (e) => {
        const email: EmailDraft = { ...e, id: uid(), createdAt: new Date().toISOString() };
        setData((d) => ({ ...d, emails: [email, ...d.emails] }));
        logActivity("email", `Email drafted: ${email.subject}`);
        return email;
      },
      deleteEmail: (id) => setData((d) => ({ ...d, emails: d.emails.filter((e) => e.id !== id) })),
      setPreferences: (patch) =>
        setData((d) => ({ ...d, preferences: { ...d.preferences, ...patch } })),
      resetAll: () => setData(emptyData),
    };
  }, [data, hydrated, emailPrefill, logActivity, makeTask]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------- derived selectors ---------- */

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(task: Task) {
  return task.status !== "completed" && !!task.dueDate && task.dueDate < todayISO();
}

export function isDueToday(task: Task) {
  return task.status !== "completed" && task.dueDate === todayISO();
}

export function isUpcoming(task: Task) {
  return task.status !== "completed" && !!task.dueDate && task.dueDate > todayISO();
}

export function useTaskStats() {
  const { tasks } = useStore();
  return useMemo(() => {
    const open = tasks.filter((t) => t.status !== "completed");
    return {
      total: tasks.length,
      dueToday: tasks.filter(isDueToday),
      overdue: tasks.filter(isOverdue),
      highPriority: open.filter((t) => t.priority === "high" || t.priority === "urgent"),
      completed: tasks.filter((t) => t.status === "completed"),
      open,
    };
  }, [tasks]);
}

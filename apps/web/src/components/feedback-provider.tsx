"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type FeedbackType = "success" | "error" | "info";

type FeedbackItem = {
  id: number;
  message: string;
  type: FeedbackType;
};

type FeedbackContextValue = {
  dismiss: (id: number) => void;
  error: (message: string, durationMs?: number) => number;
  info: (message: string, durationMs?: number) => number;
  show: (type: FeedbackType, message: string, durationMs?: number) => number;
  success: (message: string, durationMs?: number) => number;
};

type FeedbackProviderProps = {
  children: ReactNode;
};

const feedbackStyles: Record<
  FeedbackType,
  {
    container: string;
    label: string;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-950",
    label: "Success",
  },
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-950",
    label: "Error",
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-950",
    label: "Info",
  },
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function FeedbackViewport({
  items,
  onDismiss,
}: {
  items: FeedbackItem[];
  onDismiss: (id: number) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
      {items.map((item) => {
        const style = feedbackStyles[item.type];

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${style.container}`}
            role={item.type === "error" ? "alert" : "status"}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {style.label}
                </p>
                <p className="mt-1 text-sm leading-6">{item.message}</p>
              </div>
              <button
                aria-label="Dismiss feedback"
                className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] transition hover:border-current/40"
                onClick={() => onDismiss(item.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const show = useCallback(
    (type: FeedbackType, message: string, durationMs = 3600) => {
      const id = nextIdRef.current++;

      setItems((currentItems) => {
        const nextItems = [...currentItems, { id, message, type }];
        return nextItems.slice(-4);
      });

      const timer = setTimeout(() => {
        dismiss(id);
      }, durationMs);

      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  const contextValue = useMemo<FeedbackContextValue>(
    () => ({
      dismiss,
      error: (message: string, durationMs?: number) => show("error", message, durationMs),
      info: (message: string, durationMs?: number) => show("info", message, durationMs),
      show,
      success: (message: string, durationMs?: number) =>
        show("success", message, durationMs),
    }),
    [dismiss, show],
  );

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackViewport items={items} onDismiss={dismiss} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider.");
  }

  return context;
}

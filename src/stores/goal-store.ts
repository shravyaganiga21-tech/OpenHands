import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { GoalStatus } from "#/types/agent-server/core/events/conversation-state-event";

interface GoalEntry {
  status: GoalStatus;
  objective: string;
  createdAt: number;
}

interface GoalState {
  activeGoalByConversation: Record<string, GoalEntry | null>;
  historyByConversation: Record<string, GoalEntry[]>;
}

interface GoalActions {
  setStatus: (conversationId: string, status: GoalStatus) => void;
  clearGoal: (conversationId: string) => void;
}

type GoalStore = GoalState & GoalActions;

const initialState: GoalState = {
  activeGoalByConversation: {},
  historyByConversation: {},
};

export const useGoalStore = create<GoalStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setStatus: (conversationId, status) =>
        set((s) => {
          const current = s.activeGoalByConversation[conversationId];
          const nextObjective = status.objective?.trim() ?? "";

          const nextEntry: GoalEntry = {
            status,
            objective: nextObjective || current?.objective || "",
            createdAt: Date.now(),
          };

          const previous =
            current && current.objective !== nextEntry.objective ? [current] : [];

          return {
            activeGoalByConversation: {
              ...s.activeGoalByConversation,
              [conversationId]: nextEntry,
            },
            historyByConversation: {
              ...s.historyByConversation,
              [conversationId]: [
                ...(s.historyByConversation[conversationId] ?? []),
                ...previous,
              ],
            },
          };
        }),

      clearGoal: (conversationId) =>
        set((s) => ({
          activeGoalByConversation: {
            ...s.activeGoalByConversation,
            [conversationId]: null,
          },
        })),
    }),
    { name: "GoalStore" },
  ),
);

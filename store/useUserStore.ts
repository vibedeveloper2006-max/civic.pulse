"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { VoterState, EligibilityAnswers, Message, UserProgress } from "@/lib/types";

interface UserStore {
  // Core voter state machine
  voterState: VoterState;
  eligibilityAnswers: EligibilityAnswers;
  completedSteps: number[];
  currentStep: number;
  location: string;
  sessionId: string;

  // Chat state
  messages: Message[];
  isTyping: boolean;

  // Actions
  setVoterState: (state: VoterState) => void;
  setEligibilityAnswer: (key: keyof EligibilityAnswers, value: boolean | null) => void;
  completeStep: (step: number) => void;
  setCurrentStep: (step: number) => void;
  setLocation: (location: string) => void;
  addMessage: (message: Message) => void;
  setIsTyping: (val: boolean) => void;
  resetProgress: () => void;
  getProgress: () => UserProgress;

  // State machine transitions
  transitionTo: (newState: VoterState) => boolean;
  canTransitionTo: (newState: VoterState) => boolean;
}

const VALID_TRANSITIONS: Record<VoterState, VoterState[]> = {
  NOT_STARTED: ["ELIGIBILITY_VERIFIED"],
  ELIGIBILITY_VERIFIED: ["REGISTERED"],
  REGISTERED: ["READY_TO_VOTE"],
  READY_TO_VOTE: ["VOTED"],
  VOTED: [],
};

const initialEligibilityAnswers: EligibilityAnswers = {
  ageVerified: null,
  isCitizen: null,
  isResident: null,
  isRegistered: null,
};

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      voterState: "NOT_STARTED",
      eligibilityAnswers: initialEligibilityAnswers,
      completedSteps: [],
      currentStep: 1,
      location: "",
      sessionId: generateSessionId(),
      messages: [],
      isTyping: false,

      setVoterState: (state) => set({ voterState: state }),

      setEligibilityAnswer: (key, value) =>
        set((s) => ({
          eligibilityAnswers: { ...s.eligibilityAnswers, [key]: value },
        })),

      completeStep: (step) =>
        set((s) => {
          // Enforce sequential steps: can only complete step if previous is completed
          if (step > 1 && !s.completedSteps.includes(step - 1)) {
            return s; 
          }
          const newlyCompleted = s.completedSteps.includes(step)
            ? s.completedSteps
            : [...s.completedSteps, step];
            
          return {
            completedSteps: newlyCompleted,
            currentStep: Math.min(Math.max(...newlyCompleted) + 1, 5)
          };
        }),

      setCurrentStep: (step) => set((s) => {
        // Can only set current step if unlocked
        if (step > 1 && !s.completedSteps.includes(step - 1)) return s;
        return { currentStep: step };
      }),

      setLocation: (location) => set({ location }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      setIsTyping: (val) => set({ isTyping: val }),

      resetProgress: () =>
        set({
          voterState: "NOT_STARTED",
          eligibilityAnswers: initialEligibilityAnswers,
          completedSteps: [],
          currentStep: 1,
          location: "",
          messages: [],
          sessionId: generateSessionId(),
        }),

      getProgress: () => {
        const s = get();
        return {
          state: s.voterState,
          eligibilityAnswers: s.eligibilityAnswers,
          completedSteps: s.completedSteps,
          location: s.location,
          sessionId: s.sessionId,
        };
      },

      canTransitionTo: (newState) => {
        const current = get().voterState;
        return VALID_TRANSITIONS[current].includes(newState);
      },

      transitionTo: (newState) => {
        const can = get().canTransitionTo(newState);
        if (can) {
          set({ voterState: newState });
        }
        return can;
      },
    }),
    {
      name: "civic-pulse-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        voterState: s.voterState,
        eligibilityAnswers: s.eligibilityAnswers,
        completedSteps: s.completedSteps,
        currentStep: s.currentStep,
        location: s.location,
        sessionId: s.sessionId,
        messages: s.messages.slice(-50), // keep last 50
      }),
    }
  )
);

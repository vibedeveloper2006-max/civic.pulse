import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../store/useUserStore";

describe("User Store", () => {
  beforeEach(() => {
    // Reset store state if needed (Zustand persists unless cleared)
  });

  it("should initialize with default state", () => {
    const state = useUserStore.getState();
    expect(state.voterState).toBe("NOT_STARTED");
    expect(state.completedSteps).toHaveLength(0);
  });

  it("should update current step", () => {
    useUserStore.getState().setCurrentStep(3);
    expect(useUserStore.getState().currentStep).toBe(3);
  });

  it("should complete a step and update voter state", () => {
    useUserStore.getState().completeStep(1);
    const state = useUserStore.getState();
    expect(state.completedSteps).toContain(1);
    expect(state.voterState).toBe("ELIGIBILITY_VERIFIED");
  });

  it("should reach READY_TO_VOTE after 4 steps", () => {
    useUserStore.getState().completeStep(1);
    useUserStore.getState().completeStep(2);
    useUserStore.getState().completeStep(3);
    useUserStore.getState().completeStep(4);
    expect(useUserStore.getState().voterState).toBe("READY_TO_VOTE");
  });
});

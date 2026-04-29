import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "../store/useUserStore";

describe("User Store", () => {
  beforeEach(() => {
    // Manually reset the store before each test
    useUserStore.getState().resetProgress();
  });

  it("should initialize with default state", () => {
    const state = useUserStore.getState();
    expect(state.voterState).toBe("NOT_STARTED");
    expect(state.completedSteps).toHaveLength(0);
  });

  it("should update current step if unlocked", () => {
    // Step 1 is always unlocked
    useUserStore.getState().setCurrentStep(1);
    expect(useUserStore.getState().currentStep).toBe(1);
  });

  it("should complete a step in order", () => {
    useUserStore.getState().completeStep(1);
    const state = useUserStore.getState();
    expect(state.completedSteps).toContain(1);
    expect(state.currentStep).toBe(2);
  });

  it("should not complete steps out of order", () => {
    useUserStore.getState().completeStep(3); // Step 3 depends on 1 and 2
    const state = useUserStore.getState();
    expect(state.completedSteps).not.toContain(3);
  });

  it("should progress through states correctly", () => {
    useUserStore.getState().completeStep(1);
    useUserStore.getState().setVoterState("ELIGIBILITY_VERIFIED");
    
    useUserStore.getState().completeStep(2);
    useUserStore.getState().completeStep(3);
    useUserStore.getState().setVoterState("READY_TO_VOTE");
    
    const state = useUserStore.getState();
    expect(state.voterState).toBe("READY_TO_VOTE");
    expect(state.completedSteps).toContain(3);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SmartStepper } from "../components/SmartStepper";

// Mock the store
vi.mock("@/store/useUserStore", () => ({
  useUserStore: () => ({
    completedSteps: [1],
    currentStep: 2,
    voterState: "NOT_STARTED",
  }),
}));

describe("SmartStepper Component", () => {
  it("renders all voter steps", () => {
    render(<SmartStepper />);
    expect(screen.getByText("Eligibility")).toBeInTheDocument();
    expect(screen.getByText("Registration")).toBeInTheDocument();
    expect(screen.getByText("Polling Place")).toBeInTheDocument();
  });

  it("marks completed steps with 'Done'", () => {
    render(<SmartStepper />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("marks current step as 'Current'", () => {
    render(<SmartStepper />);
    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});

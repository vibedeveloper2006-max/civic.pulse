import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoterStatusCard } from "../components/VoterStatusCard";

// Mock the store
vi.mock("@/store/useUserStore", () => ({
  useUserStore: () => ({
    voterState: "READY_TO_VOTE",
    completedSteps: [1, 2, 3],
  }),
}));

describe("VoterStatusCard", () => {
  it("displays the correct status label", () => {
    render(<VoterStatusCard />);
    expect(screen.getByText("Ready to Vote!")).toBeInTheDocument();
  });

  it("calculates and displays progress correctly", () => {
    render(<VoterStatusCard />);
    expect(screen.getByText("3/5 steps")).toBeInTheDocument();
  });

  it("shows high urgency badge for action needed state", () => {
    render(<VoterStatusCard />);
    expect(screen.getByText("Action Needed")).toBeInTheDocument();
  });

  it("links to the correct next step", () => {
    render(<VoterStatusCard />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/polling");
  });
});

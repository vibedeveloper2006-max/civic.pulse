"use client";

import { useUserStore } from "@/store/useUserStore";
import { VoterState } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  ShieldCheck, UserCheck, BadgeCheck, Vote,
  ArrowRight, AlertCircle,
} from "lucide-react";

const STATE_CONFIG: Record<
  VoterState,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; next: string; nextHref: string; urgency: "low" | "medium" | "high" }
> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "text-[#43474f]",
    bg: "bg-[#ebeef0]",
    border: "border-[#c4c6d0]",
    icon: <AlertCircle className="w-5 h-5" />,
    next: "Check Your Eligibility",
    nextHref: "/eligibility",
    urgency: "medium",
  },
  ELIGIBILITY_VERIFIED: {
    label: "Eligibility Verified",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
    next: "Complete Registration",
    nextHref: "/guide",
    urgency: "medium",
  },
  REGISTERED: {
    label: "Registered",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    next: "Verify Your Registration",
    nextHref: "/guide",
    urgency: "medium",
  },
  READY_TO_VOTE: {
    label: "Ready to Vote!",
    color: "text-[#002855]",
    bg: "bg-[#d6e3ff]",
    border: "border-[#aac7fd]",
    icon: <BadgeCheck className="w-5 h-5 text-[#002855]" />,
    next: "Find Your Polling Place",
    nextHref: "/polling",
    urgency: "high",
  },
  VOTED: {
    label: "Voted ✓",
    color: "text-[#002855]",
    bg: "bg-[#002855]",
    border: "border-[#002855]",
    icon: <Vote className="w-5 h-5 text-white" />,
    next: "View Election Results",
    nextHref: "/timeline",
    urgency: "low",
  },
};

export function VoterStatusCard() {
  const { voterState, completedSteps } = useUserStore();
  const config = STATE_CONFIG[voterState];
  const progressPct = (completedSteps.length / 5) * 100;

  return (
    <div className={`rounded border ${config.border} ${config.bg} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#43474f]">Your Status</p>
            <p className={`text-base font-bold ${config.color}`}>{config.label}</p>
          </div>
        </div>
        <Badge
          variant={config.urgency === "high" ? "danger" : config.urgency === "medium" ? "info" : "success"}
        >
          {config.urgency === "high" ? "Action Needed" : config.urgency === "medium" ? "In Progress" : "Complete"}
        </Badge>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#43474f] mb-1">
          <span>Voting Journey</span>
          <span>{completedSteps.length}/5 steps</span>
        </div>
        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#002855] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#43474f]">Next: <span className="font-semibold">{config.next}</span></p>
        <Link href={config.nextHref}>
          <Button size="sm" variant="primary" className="gap-1">
            Go <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

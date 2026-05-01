"use client";

import { useUserStore } from "@/store/useUserStore";
import { VOTER_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, UserCheck, BadgeCheck, MapPin, Vote,
  Lock, CheckCircle2, Circle,
} from "lucide-react";
import Link from "next/link";

const STEP_ICONS = [ShieldCheck, UserCheck, BadgeCheck, MapPin, Vote];
const STEP_HREFS = ["/eligibility", "/guide#resources", "/guide#resources", "/polling", "/guide#tips"];

export function SmartStepper() {
  const { completedSteps, currentStep } = useUserStore();

  const isUnlocked = (stepId: number): boolean => {
    if (stepId === 1) return true;
    return completedSteps.includes(stepId - 1);
  };

  return (
    <div className="bg-white rounded border border-[#c4c6d0] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#ebeef0]">
        <h2 className="text-lg font-bold text-[#181c1e]">Your Voting Journey</h2>
        <p className="text-sm text-[#43474f] mt-0.5">Follow these steps to exercise your right to vote</p>
      </div>

      <div className="divide-y divide-[#ebeef0]">
        {VOTER_STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id && !isCompleted;
          const unlocked = isUnlocked(step.id);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition-colors",
                isActive && "bg-[#d6e3ff]/30",
                !unlocked && "opacity-50"
              )}
            >
              {/* Step indicator */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                ) : !unlocked ? (
                  <Lock className="w-7 h-7 text-[#c4c6d0]" />
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-[#002855] flex items-center justify-center text-white font-bold text-sm">
                    {step.id}
                  </div>
                ) : (
                  <Circle className="w-7 h-7 text-[#c4c6d0]" />
                )}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "p-2 rounded",
                  isCompleted ? "bg-green-100" : isActive ? "bg-[#002855]" : "bg-[#ebeef0]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isCompleted ? "text-green-700" : isActive ? "text-white" : "text-[#43474f]"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("font-semibold text-sm", isCompleted ? "text-green-700" : isActive ? "text-[#002855]" : "text-[#181c1e]")}>
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="px-2 py-0.5 bg-[#002855] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wide">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#43474f] mt-0.5">{step.description}</p>
              </div>

              {/* CTA */}
              {unlocked && !isCompleted && (
                <Link
                  href={STEP_HREFS[i]}
                  className="flex-shrink-0 text-xs font-semibold text-[#002855] hover:underline"
                  aria-label={`Go to ${step.label} step`}
                >
                  Go →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

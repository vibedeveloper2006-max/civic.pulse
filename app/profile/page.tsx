"use client";

import { useUserStore } from "@/store/useUserStore";
import { VoterStatusCard } from "@/components/VoterStatusCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { VOTER_STEPS } from "@/lib/constants";
import { RotateCcw, CheckCircle2, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const {
    voterState,
    eligibilityAnswers,
    completedSteps,
    location,
    messages,
    resetProgress,
    sessionId,
  } = useUserStore();

  const answeredCount = Object.values(eligibilityAnswers).filter((v) => v !== null).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#181c1e]">Your Profile</h1>
        <p className="text-[#43474f] mt-1 text-sm">Track your civic journey and manage your preferences.</p>
      </div>

      {/* Status Card */}
      <VoterStatusCard />

      {/* Voter State Info */}
      <Card elevated>
        <CardHeader>
          <h2 className="font-bold text-[#181c1e]">State Machine Status</h2>
        </CardHeader>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#43474f]">Current State</span>
            <Badge variant={voterState === "VOTED" ? "success" : voterState === "NOT_STARTED" ? "neutral" : "info"}>
              {voterState.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#43474f]">Steps Completed</span>
            <span className="text-sm font-bold text-[#181c1e]">{completedSteps.length} / {VOTER_STEPS.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#43474f]">Eligibility Questions</span>
            <span className="text-sm font-bold text-[#181c1e]">{answeredCount} / 4 answered</span>
          </div>
          {location && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#43474f]">Saved Location</span>
              <span className="flex items-center gap-1 text-sm font-medium text-[#002855]">
                <MapPin className="w-3.5 h-3.5" />{location}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#43474f]">Assistant Messages</span>
            <span className="flex items-center gap-1 text-sm font-bold text-[#181c1e]">
              <MessageSquare className="w-3.5 h-3.5 text-[#43474f]" />{messages.length}
            </span>
          </div>
          <div className="pt-2 border-t border-[#ebeef0]">
            <p className="text-xs text-[#747780]">Session: <code className="text-[10px] bg-[#ebeef0] px-1 rounded">{sessionId.slice(0, 24)}...</code></p>
          </div>
        </CardContent>
      </Card>

      {/* Completed steps */}
      <Card elevated>
        <CardHeader>
          <h2 className="font-bold text-[#181c1e]">Journey Checklist</h2>
        </CardHeader>
        <CardContent className="py-4 space-y-2">
          {VOTER_STEPS.map((step) => {
            const done = completedSteps.includes(step.id);
            return (
              <div key={step.id} className="flex items-center gap-3 py-1.5">
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${done ? "text-green-600" : "text-[#c4c6d0]"}`} />
                <span className={`text-sm ${done ? "text-green-800 font-medium" : "text-[#43474f]"}`}>
                  {step.label}
                  {done && <span className="ml-2 text-xs text-green-600">✓ Complete</span>}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/assistant">
          <Button variant="primary" size="lg" className="w-full gap-2">
            <MessageSquare className="w-4 h-4" /> Open Assistant
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 text-[#e41d35] border-[#e41d35] hover:bg-red-50"
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) {
              resetProgress();
            }
          }}
        >
          <RotateCcw className="w-4 h-4" /> Reset Progress
        </Button>
      </div>

      <p className="text-xs text-center text-[#747780]">
        Your data is stored locally in your browser. CivicPulse never shares your information.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EligibilityAnswers, EligibilityResponse } from "@/lib/types";
import {
  CheckCircle2, XCircle, ChevronRight,
  AlertTriangle, ExternalLink,
} from "lucide-react";

const QUESTIONS = [
  {
    key: "ageVerified" as keyof EligibilityAnswers,
    question: "Are you 18 years of age or older on the qualifying date (usually Jan 1st)?",
    detail: "You must be at least 18 years old to be placed on the electoral roll.",
    step: 1,
  },
  {
    key: "isCitizen" as keyof EligibilityAnswers,
    question: "Are you an Indian citizen?",
    detail: "Only citizens of India are eligible to vote in the general elections.",
    step: 2,
  },
  {
    key: "isResident" as keyof EligibilityAnswers,
    question: "Are you an ordinary resident of your Constituency?",
    detail: "You must reside in the constituency/part where you want to be enrolled.",
    step: 3,
  },
  {
    key: "isRegistered" as keyof EligibilityAnswers,
    question: "Is your name already present on the Electoral Roll (do you have an EPIC)?",
    detail: "Check voters.eci.gov.in. If not registered, answer 'No' and we will help you fill Form 6.",
    step: 4,
  },
];

const EMPTY_ELIGIBILITY_ANSWERS: EligibilityAnswers = {
  ageVerified: null,
  isCitizen: null,
  isResident: null,
  isRegistered: null,
};

export default function EligibilityPage() {
  const { eligibilityAnswers, setEligibilityAnswer, transitionTo, completeStep, setCurrentStep, voterState } =
    useUserStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const q = QUESTIONS[currentQ];
  const allAnswered = Object.values(eligibilityAnswers).every((v) => v !== null);
  const alreadyDone = voterState !== "NOT_STARTED";

  async function submitEligibility() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: eligibilityAnswers }),
      });
      const data: EligibilityResponse = await res.json();
      setResult(data);
      if (data.eligible) {
        transitionTo("ELIGIBILITY_VERIFIED");
        completeStep(1);
        setCurrentStep(2);
      }
    } catch {
      setError("Failed to check eligibility. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(value: boolean) {
    setEligibilityAnswer(q.key, value);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  }

  function resetQuestionnaire() {
    setResult(null);
    setCurrentQ(0);
    (Object.entries(EMPTY_ELIGIBILITY_ANSWERS) as Array<[keyof EligibilityAnswers, null]>).forEach(([key, value]) => {
      setEligibilityAnswer(key, value);
    });
  }

  if (alreadyDone && result === null) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card elevated>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#181c1e] mb-2">Eligibility Already Verified</h1>
            <p className="text-[#43474f] mb-6">
              You&apos;ve already completed eligibility verification. Your voter journey is in progress.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/guide">
                <Button variant="primary">Continue to Guide</Button>
              </a>
              <Button variant="outline" onClick={resetQuestionnaire}>
                Retake Questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card elevated>
          <CardContent className="py-10 text-center">
            {result.eligible ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-800 mb-2">You Are Eligible to Vote!</h1>
                <p className="text-[#43474f] mb-2 max-w-md mx-auto">{result.reason}</p>
                <div className="bg-green-50 border border-green-200 rounded px-4 py-3 mb-6 text-sm text-green-800 font-medium">
                  Next Step: {result.nextStep}
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a href="/guide">
                    <Button variant="primary">Go to Voting Guide</Button>
                  </a>
                  <a href="/assistant">
                    <Button variant="outline">Ask the Assistant</Button>
                  </a>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-[#e41d35] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#181c1e] mb-2">Eligibility Issue Found</h1>
                <p className="text-[#43474f] mb-2 max-w-md mx-auto">{result.reason}</p>
                <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-6 text-sm text-amber-800">
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  {result.nextStep}
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-1">
                      Visit ECI Portal <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                  <Button variant="ghost" onClick={resetQuestionnaire}>
                    Retake Questionnaire
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181c1e]">Check Your Eligibility</h1>
        <p className="text-[#43474f] mt-1">Answer 4 quick questions to confirm you can vote.</p>
      </div>

      {/* Progress */}
      <div className="bg-[#ebeef0] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-[#002855] rounded-full transition-all duration-400"
          style={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-[#43474f] -mt-4">Question {currentQ + 1} of {QUESTIONS.length}</p>

      {/* Question Card */}
      <Card elevated className="animate-slide-in">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002855] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {q.step}
            </div>
            <h2 className="text-lg font-semibold text-[#181c1e]">{q.question}</h2>
          </div>
          <p className="text-sm text-[#43474f] mt-2 ml-11">{q.detail}</p>
        </CardHeader>
        <CardContent className="flex gap-4 pt-5">
          <Button
            variant={eligibilityAnswers[q.key] === true ? "primary" : "outline"}
            size="lg"
            className="flex-1"
            onClick={() => handleAnswer(true)}
          >
            <CheckCircle2 className="w-5 h-5" /> Yes
          </Button>
          <Button
            variant={eligibilityAnswers[q.key] === false ? "danger" : "outline"}
            size="lg"
            className="flex-1"
            onClick={() => handleAnswer(false)}
          >
            <XCircle className="w-5 h-5" /> No
          </Button>
        </CardContent>
      </Card>

      {/* Answered summary */}
      <div className="grid grid-cols-4 gap-2">
        {QUESTIONS.map((q2, i) => {
          const ans = eligibilityAnswers[q2.key];
          return (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`rounded py-2 text-xs font-medium transition-colors border ${
                i === currentQ
                  ? "border-[#002855] bg-[#002855] text-white"
                  : ans === true
                  ? "border-green-300 bg-green-50 text-green-700"
                  : ans === false
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-[#c4c6d0] bg-white text-[#747780]"
              }`}
            >
              {i + 1}. {ans === null ? "?" : ans ? "Yes" : "No"}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {allAnswered && (
        <div className="animate-fade-in">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <Button
            variant="primary"
            size="lg"
            className="w-full gap-2"
            onClick={submitEligibility}
            loading={loading}
          >
            Check My Eligibility <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

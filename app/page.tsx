import Link from "next/link";
import { VoterStatusCard } from "@/components/VoterStatusCard";
import { SmartStepper } from "@/components/SmartStepper";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  ShieldCheck, MessageSquare, CalendarDays, MapPin,
  ArrowRight, CheckCircle2, Zap, Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Eligibility Check",
    description: "Answer 4 quick questions to confirm your voting eligibility instantly.",
    href: "/eligibility",
    color: "text-[#002855]",
    bg: "bg-[#d6e3ff]",
  },
  {
    icon: MessageSquare,
    title: "Instant Assistant",
    description: "Ask anything about polling locations, voter ID, or ballot measures — powered by Gemini AI.",
    href: "/assistant",
    color: "text-[#e41d35]",
    bg: "bg-red-50",
  },
  {
    icon: CalendarDays,
    title: "Personalized Timeline",
    description: "Never miss a deadline. Track registration, mail-in, and election day for your district.",
    href: "/timeline",
    color: "text-[#005596]",
    bg: "bg-blue-50",
  },
  {
    icon: MapPin,
    title: "Polling Finder",
    description: "Find your nearest open polling place with real-time wait-time estimates.",
    href: "/polling",
    color: "text-green-700",
    bg: "bg-green-50",
  },
];

const STATS = [
  { icon: Users, value: "2.4M+", label: "Voters Guided" },
  { icon: CheckCircle2, value: "98%", label: "Accuracy Rate" },
  { icon: Zap, value: "<2s", label: "Response Time" },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Banner */}
      <div className="rounded-lg overflow-hidden bg-[#002855] text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002855] via-[#001a3d] to-[#00152c]" />
        <div className="relative px-6 py-10 md:py-14 max-w-3xl">
          <Badge variant="danger" className="mb-4 bg-[#e41d35]/20 text-[#ffdad8] border border-[#e41d35]/40">
            🗳️ General Election · Nov 4, 2025
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
            Navigate Your Elections<br /> with Confidence
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
            Your personal AI-powered assistant for local and national voting. Stay informed, track deadlines,
            and make your voice heard — without the noise.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 bg-[#e41d35] hover:bg-[#bb0024] text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
            >
              Check Eligibility <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded font-semibold text-sm transition-colors border border-white/25"
            >
              Ask the Assistant <MessageSquare className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative border-t border-white/15 bg-white/5 flex divide-x divide-white/15">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 py-4">
              <Icon className="w-4 h-4 text-white/60" />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status + Stepper */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <VoterStatusCard />
        </div>
        <div className="md:col-span-2">
          <SmartStepper />
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold text-[#181c1e] mb-4">What Would You Like to Do?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, href, color, bg }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full hover:border-[#002855] hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="flex flex-col gap-3 py-5">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#181c1e] text-sm">{title}</h3>
                    <p className="text-xs text-[#43474f] mt-1 leading-relaxed">{description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-[#002855] text-xs font-semibold">
                    Get Started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Non-partisan disclaimer */}
      <div className="bg-[#ebeef0] rounded border border-[#c4c6d0] px-5 py-4 flex gap-3 items-start">
        <ShieldCheck className="w-5 h-5 text-[#002855] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#181c1e]">Non-Partisan & Privacy-First</p>
          <p className="text-xs text-[#43474f] mt-0.5">
            CivicPulse is strictly non-partisan. We provide factual information only. Your data is stored locally and never sold.
            Always verify critical information with official government sources.
          </p>
        </div>
      </div>
    </div>
  );
}

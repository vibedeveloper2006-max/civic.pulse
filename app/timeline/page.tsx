"use client";

import { useEffect, useState } from "react";
import { TimelineEvent } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { getCountdown } from "@/lib/utils";
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Info } from "lucide-react";

const CATEGORY_CONFIG = {
  registration: { color: "bg-[#002855]", light: "bg-[#d6e3ff]", text: "text-[#002855]", label: "Registration" },
  election: { color: "bg-[#e41d35]", light: "bg-red-50", text: "text-[#e41d35]", label: "Election" },
  deadline: { color: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", label: "Deadline" },
  result: { color: "bg-green-600", light: "bg-green-50", text: "text-green-700", label: "Result" },
};

function TimelineCard({ event }: { event: TimelineEvent & { countdown?: number | null } }) {
  const cfg = CATEGORY_CONFIG[event.category];
  const [tick, setTick] = useState(() => (
    event.isPast || !event.date ? "" : getCountdown(event.date)
  ));

  useEffect(() => {
    if (event.isPast || !event.date) return;
    const interval = setInterval(() => setTick(getCountdown(event.date)), 1000);
    return () => clearInterval(interval);
  }, [event.date, event.isPast]);

  return (
    <div className={`flex gap-4 animate-slide-in ${event.isPast ? "opacity-60" : ""}`}>
      {/* Dot + Line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
            event.isCurrent
              ? "ring-4 ring-[#002855]/20 " + cfg.color
              : event.isPast
              ? "bg-[#c4c6d0]"
              : cfg.color
          }`}
        >
          {event.isPast ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : event.isCurrent ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <CalendarDays className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 border-l-2 pl-4 -ml-4 ${event.isCurrent ? "border-[#002855]" : "border-[#ebeef0]"}`}>
        <div className="bg-white border border-[#c4c6d0] rounded p-4 ml-4 hover:border-[#002855] transition-colors">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="neutral">{cfg.label}</Badge>
            {event.isCurrent && <Badge variant="danger">⚡ Upcoming Soon</Badge>}
            {event.isPast && <Badge variant="success">✓ Passed</Badge>}
          </div>

          <h3 className="font-bold text-[#181c1e] mb-1 text-sm">{event.title}</h3>
          <p className="text-xs text-[#43474f] leading-relaxed mb-3">{event.description}</p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#43474f]">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {!event.isPast && tick && (
              <div className="flex items-center gap-1.5 bg-[#002855] text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                <Clock className="w-3 h-3" />
                {tick}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [events, setEvents] = useState<(TimelineEvent & { countdown?: number | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/timeline")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", "registration", "election", "deadline", "result"];
  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);
  const upcoming = events.filter((e) => !e.isPast).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181c1e]">Election Timeline</h1>
        <p className="text-[#43474f] mt-1 text-sm">
          Key dates and deadlines for the upcoming General Election.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Upcoming Events", value: upcoming, icon: CalendarDays, color: "text-[#002855]" },
          { label: "Deadlines", value: events.filter((e) => e.category === "deadline").length, icon: AlertCircle, color: "text-amber-600" },
          { label: "Completed", value: events.filter((e) => e.isPast).length, icon: CheckCircle2, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#c4c6d0] rounded p-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold text-[#181c1e]">{value}</p>
            <p className="text-[10px] text-[#43474f]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
              filter === cat
                ? "bg-[#002855] text-white"
                : "bg-white border border-[#c4c6d0] text-[#43474f] hover:border-[#002855] hover:text-[#002855]"
            }`}
          >
            {cat === "all" ? "All Events" : cat}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded border border-[#ebeef0] bg-[#f1f4f6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {filtered.map((event) => (
            <TimelineCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Official sources */}
      <div className="bg-[#ebeef0] rounded border border-[#c4c6d0] px-4 py-3 flex gap-2">
        <Info className="w-4 h-4 text-[#002855] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#43474f]">
          Dates shown are illustrative. Always verify with your state&apos;s official{" "}
          <a href="https://vote.gov" target="_blank" rel="noopener noreferrer" className="text-[#002855] font-semibold underline">
            Secretary of State
          </a>{" "}
          website.
        </p>
      </div>
    </div>
  );
}

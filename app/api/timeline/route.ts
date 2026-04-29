import { NextResponse } from "next/server";
import { TIMELINE_EVENTS } from "@/lib/constants";

export async function GET() {
  const now = new Date();
  const events = TIMELINE_EVENTS.map((e) => {
    const eventDate = new Date(e.date);
    return {
      ...e,
      isPast: eventDate < now,
      isCurrent:
        eventDate >= now &&
        eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      countdown: eventDate > now
        ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };
  });

  return NextResponse.json({ events, generatedAt: new Date().toISOString() });
}

import { NextRequest, NextResponse } from "next/server";

// In-memory session store (replace with DB in production)
const sessions = new Map<string, Record<string, unknown>>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const data = sessions.get(sessionId) ?? null;
  return NextResponse.json({ session: data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, progress } = body;
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    sessions.set(sessionId, progress);
    return NextResponse.json({ success: true, sessionId });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

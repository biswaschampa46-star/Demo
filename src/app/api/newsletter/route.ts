import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = (body.email ?? "").toLowerCase().trim();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    await db
      .insert(subscribers)
      .values({ email })
      .onConflictDoNothing({ target: subscribers.email });
    return NextResponse.json({ ok: true, message: "You're on the list. Welcome." });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

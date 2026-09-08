import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json({ ok: false, message: "Please tell us your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length < 4) {
      return NextResponse.json({ ok: false, message: "Please write a short message." }, { status: 400 });
    }

    await db.insert(messages).values({ name, email, message });
    return NextResponse.json({
      ok: true,
      message: "Message received. We usually reply within a day.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

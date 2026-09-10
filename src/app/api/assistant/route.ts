import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSettings } from "@/lib/settings";

const MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
];
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/* naive per-IP rate limit: 20 requests / 10 min */
const hits = new Map<string, { n: number; reset: number }>();

type ChatMessage = { role: "user" | "model"; text: string };

function cleanAnswer(raw: string): string {
  let t = raw.trim();
  // strip explicit <think> blocks
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // models that expose chain-of-thought: keep only the final answer
  const m = t.match(/\*\*\s*Final\s*Answer\s*\*\*\s*[:\-]?\s*([\s\S]+)/i) || t.match(/\bFinal\s*Answer\b\s*[:\-]\s*([\s\S]+)/i);
  if (m) t = m[1].trim();
  // if it still looks like leaked reasoning, treat as unusable
  if (/^(here.s a thinking process|thinking process|let me think|\d+\.\s+\*\*)/i.test(t)) return "";
  return t.slice(0, 700);
}
function buildStoreContext(
  list: { name: string; slug: string; price: number; compareAtPrice: number | null; description: string; isNew: boolean; isFeatured: boolean; stock: number }[],
  s: { deliveryFeeInside: number; deliveryFeeOutside: number; bkashNumber: string; nagadNumber: string; rocketNumber: string; tagline: string },
): string {
  const lines: string[] = [
    "STORE: MKR — a clothing store (clothes only).",
    "Product payment: CASH ON DELIVERY. Only the delivery charge is prepaid via bKash/Nagad/Rocket.",
    `Delivery charge: ৳${s.deliveryFeeInside} inside Chittagong, ৳${s.deliveryFeeOutside} outside Chittagong (prepaid).`,
    "Store city: Dhaka, Bangladesh. We deliver across Bangladesh.",
    "Customers can track orders on /track using their phone number. Cart at /cart, checkout at /checkout, shop at /shop, FAQ at /faq, contact at /contact.",
    s.tagline ? `Tagline: ${s.tagline}` : "",
    "PAYMENT NUMBERS (only share if the customer asks how to prepay the delivery charge):" +
      (s.bkashNumber ? ` bKash ${s.bkashNumber}.` : "") +
      (s.nagadNumber ? ` Nagad ${s.nagadNumber}.` : "") +
      (s.rocketNumber ? ` Rocket ${s.rocketNumber}.` : "") || " Payment numbers are not configured — say the team will share them after ordering.",
    "PRODUCT CATALOGUE (live, do not invent anything outside this):",
    ...list.map(
      (p) =>
        `- ${p.name} — ৳${p.price}${p.compareAtPrice ? ` (was ৳${p.compareAtPrice})` : ""}${p.isNew ? " [NEW]" : ""}${p.isFeatured ? " [FEATURED]" : ""}, stock ${p.stock}. ${p.description.slice(0, 140)}`,
    ),
  ];
  return lines.filter(Boolean).join("\n");
}

const SYSTEM = `You are the friendly shop assistant of MKR, a clothing store.
Rules:
- Answer ONLY from the store context given in the system context. Never invent products, prices, or policies.
- If the customer writes in Bangla, reply in Bangla. If they write in English, reply in English.
- Keep answers short (1-4 sentences), warm and helpful. You may add one relevant emoji.
- You can answer about: products, prices, new arrivals, delivery charges, cash-on-delivery, prepaying the delivery charge, store location, how to order, how to track an order.
- You cannot place orders, change prices, or access the admin panel. For complaints, point to /contact.
- If asked something unrelated to the store, politely steer back to shopping.`;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const rec = hits.get(ip);
  if (rec && rec.reset > now && rec.n >= 20) {
    return NextResponse.json({ ok: false, message: "Too many questions. Please wait a bit." }, { status: 429 });
  }
  if (!rec || rec.reset <= now) hits.set(ip, { n: 1, reset: now + 10 * 60 * 1000 });
  else rec.n += 1;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, message: "The assistant is not configured yet." }, { status: 500 });
  }

  let history: ChatMessage[] = [];
  try {
    const body = (await request.json()) as { history?: ChatMessage[] };
    history = Array.isArray(body.history)
      ? body.history
          .filter((m) => m && (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
          .slice(-10)
      : [];
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ ok: false, message: "Nothing to answer." }, { status: 400 });
  }

  try {
    const [list, settings] = await Promise.all([
      db
        .select({
          name: products.name,
          slug: products.slug,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          description: products.description,
          isNew: products.isNew,
          isFeatured: products.isFeatured,
          stock: products.stock,
        })
        .from(products)
        .orderBy(desc(products.createdAt)),
      getSettings(),
    ]);

    const messages = [
      {
        role: "system",
        content: `${SYSTEM}\n\nSTORE CONTEXT (the only source of truth):\n${buildStoreContext(list, settings)}`,
      },
      ...history.map((m) => ({ role: m.role === "model" ? "assistant" : "user", content: m.text })),
    ];

    let text: string | undefined;
    for (const model of MODELS) {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "MKR Shop Assistant",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 300,
            reasoning: { enabled: false },
          }),
          signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`assistant api error [${model}]`, res.status, errText.slice(0, 200));
          continue;
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const raw = data.choices?.[0]?.message?.content ?? "";
        text = cleanAnswer(raw);
        if (text) break;
        console.error(`assistant empty reply [${model}], trying fallback`);
      } catch (err) {
        console.error(`assistant request failed [${model}]`, err);
      }
    }

    if (!text) {
      return NextResponse.json({ ok: false, message: "The assistant is having trouble right now. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, text });
  } catch (err) {
    console.error("assistant failed", err);
    return NextResponse.json({ ok: false, message: "The assistant is unavailable right now." }, { status: 500 });
  }
}

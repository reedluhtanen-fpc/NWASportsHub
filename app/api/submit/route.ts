import { NextRequest, NextResponse } from "next/server";
import { appendSubmission } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await appendSubmission(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

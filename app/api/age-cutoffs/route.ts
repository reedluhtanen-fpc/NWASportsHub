import { NextResponse } from "next/server";
import { getAgeCutoffs } from "@/lib/sheets";

export async function GET() {
  try {
    const cutoffs = await getAgeCutoffs();
    return NextResponse.json(cutoffs);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

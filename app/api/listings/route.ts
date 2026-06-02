import { NextResponse } from "next/server";
import { getListings } from "@/lib/sheets";

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json(listings);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

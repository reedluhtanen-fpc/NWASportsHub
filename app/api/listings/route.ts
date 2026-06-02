import { NextResponse } from "next/server";
import { getListings } from "@/lib/sheets";

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json(listings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}

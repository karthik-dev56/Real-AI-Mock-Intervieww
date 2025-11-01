import arcjet, { tokenBucket } from "@arcjet/next";
import { NextResponse } from "next/server";

import { aj } from "../../../../utils/route";


export async function GET(req: Request) {
  const userId = "user123"; 
  const decision = await aj.protect(req, { userId, requested: 5 }); 
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Too Many Requests", reason: decision.reason },
      { status: 429 },
    );
  }

  return NextResponse.json({ message: "Hello world" });
}
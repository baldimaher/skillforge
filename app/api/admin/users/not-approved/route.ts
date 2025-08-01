// app/api/admin/users/not-approved/route.ts

import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";

export async function GET() {
  await dbConnect();

  const users = await User.find({ isApproved: false });
  return NextResponse.json(users);
}

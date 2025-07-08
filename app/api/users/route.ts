// /app/api/progress/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import Project from "@/models/Project";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find();
    const projects = await Project.find();

    const userProgress = users.map((user: any) => {
      const userProjects = projects.filter(
        (p: any) => String(p.takenBy) === String(user._id)
      );

      const total = userProjects.length;
      const done = userProjects.filter((p: any) => p.status === "terminé").length;

      const progress = total === 0 ? 0 : Math.min((done / total) * 100, 100);

      return {
        userId: user._id,
        name: `${user.firstName || user.name || "Utilisateur"} ${user.lastName || ""}`.trim(),
        progress: Math.round(progress),
      };
    });

    return NextResponse.json(userProgress);
  } catch (err) {
    console.error("Erreur /api/progress :", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

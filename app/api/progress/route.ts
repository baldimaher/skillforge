import { NextResponse } from "next/server";
import Project from "@/models/Project";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find().lean();
    const projects = await Project.find().lean();

    const userProgress = users.map((user: any) => {
      const userProjects = projects.filter((p) => String(p.takenBy) === String(user._id));
      const total = userProjects.length;
      const done = userProjects.filter((p) => p.status?.toLowerCase() === "terminé").length;
      const progress = total === 0 ? 0 : Math.min((done / total) * 100, 100);

      return {
        userId: user._id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Utilisateur inconnu",
        progress: Math.round(progress),
      };
    });

    console.log("User Progress:", userProgress);
    return NextResponse.json(userProgress);
  } catch (err) {
    console.error("Erreur /api/progress :", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
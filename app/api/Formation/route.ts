import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import Formation from "../../../models/Formation";
import dbConnect from "../../../lib/mongo";

export const config = {
  api: {
    bodyParser: false, // Nécessaire pour traiter formData avec fichiers
  },
};

export async function GET() {
  try {
    await dbConnect();
    const formations = await Formation.find().sort({ createdAt: -1 });
    return NextResponse.json(formations, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/Formation :", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const duration = formData.get("duration")?.toString() || "";
    const instructor = formData.get("instructor")?.toString() || "";
    const level = formData.get("level")?.toString() || "";
    const category = formData.get("category")?.toString() || "";

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    let photoUrl = "";
    let videoUrl = "";

    const photoFile = formData.get("photo");
    if (photoFile && photoFile instanceof File && photoFile.size > 0) {
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      const photoName = `${Date.now()}_${photoFile.name.replace(/\s+/g, "_")}`;
      await writeFile(path.join(uploadsDir, photoName), photoBuffer);
      photoUrl = `/uploads/${photoName}`;
    }

    const videoFile = formData.get("video");
    if (videoFile && videoFile instanceof File && videoFile.size > 0) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const videoName = `${Date.now()}_${videoFile.name.replace(/\s+/g, "_")}`;
      await writeFile(path.join(uploadsDir, videoName), videoBuffer);
      videoUrl = `/uploads/${videoName}`;
    }

    const newFormation = new Formation({
      title,
      description,
      photoUrl,
      videoUrl,
      duration,
      instructor,
      level,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newFormation.save();

    return NextResponse.json(newFormation, { status: 201 });
  } catch (error) {
    console.error("Erreur dans /api/formation POST:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

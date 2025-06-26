import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";
import path from "path";
import pdfParse from "pdf-parse";

export const config = {
  api: { bodyParser: false },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Fonction séparée pour appeler Hugging Face NER
async function extractSkillsFromText(text: string): Promise<string[]> {
  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  if (!HF_API_TOKEN) throw new Error("Token Hugging Face manquant");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/Nucha/Nucha_SkillNER_BERT",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) throw new Error("Erreur API Hugging Face");

  const data = await response.json();

  // Filtrer les entités "SKILL"
  const skills = data
    .filter((item: any) => item.entity.toUpperCase().includes("SKILL"))
    .map((item: any) => item.word);

  return Array.from(new Set(skills)); // supprimer doublons
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const email = formData.get("email")?.toString().toLowerCase();

    if (!file || !email) {
      return NextResponse.json({ error: "Fichier ou email manquant" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Supprimer l'ancien CV si présent
    if (existingUser?.cv?.path) {
      const oldPath = path.join(process.cwd(), "public", existingUser.cv.path);
      try {
        await unlink(oldPath);
        console.log("✅ Ancien CV supprimé :", oldPath);
      } catch {
        console.warn("⚠️ Ancien CV non trouvé :", oldPath);
      }
    }

    // Sauvegarder le nouveau fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const sanitizedFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, sanitizedFileName);
    const publicPath = `/uploads/${sanitizedFileName}`;
    const fullUrl = `${BASE_URL}${publicPath}`;
    await writeFile(filePath, buffer);

    // Extraire le texte du PDF
    const parsed = await pdfParse(buffer);
    const extractedSkills = await extractSkillsFromText(parsed.text);

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          cvUrl: fullUrl,
          "cv.path": publicPath,
          "cv.filename": sanitizedFileName,
          "cv.uploadedAt": new Date(),
          cvText: parsed.text,
          updatedAt: new Date(),
          skills: extractedSkills,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      message: "✅ CV mis à jour et compétences extraites",
      skills: updatedUser.skills,
      cvUrl: updatedUser.cvUrl,
    });
  } catch (err) {
    console.error("Erreur dans /api/upload :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

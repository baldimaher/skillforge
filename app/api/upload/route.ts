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

// 🔒 Fonction pour échapper les caractères spéciaux des mots-clés
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 🔧 Normalisation du texte (minuscules, suppression des accents)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s+]/g, " ");
}

// 🧠 Extraction simple des compétences par mots-clés
function extractSkillsFromText(text: string): string[] {
  const keywords = [
    "react",
    "nodejs",
    "python",
    "java",
    "html",
    "css",
    "javascript",
    "typescript",
    "mongodb",
    "sql",
    "express",
    "docker",
    "aws",
    "git",
    "github",
    "c++",
    "nextjs",
    "figma",
    "firebase",
    "tailwind",
    "kotlin",
    "flutter",
    "android",
  ];

  const normalizedText = normalizeText(text);

  return keywords.filter((skill) => {
    const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
    return regex.test(normalizedText);
  });
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

    // 🔄 Supprimer l’ancien CV si présent
    if (existingUser?.cv?.path) {
      const oldPath = path.join(process.cwd(), "public", existingUser.cv.path);
      try {
        await unlink(oldPath);
        console.log("✅ Ancien CV supprimé :", oldPath);
      } catch {
        console.warn("⚠️ Ancien CV non trouvé :", oldPath);
      }
    }

    // 📥 Sauvegarder le nouveau CV
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const sanitizedFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, sanitizedFileName);
    const publicPath = `/uploads/${sanitizedFileName}`;
    const fullUrl = `${BASE_URL}${publicPath}`;
    await writeFile(filePath, buffer);

    // 📄 Extraire le texte du CV
    const parsed = await pdfParse(buffer);
    console.log("Longueur texte extrait :", parsed.text.length);

    // 🧠 Extraire les compétences à partir du texte
    const extractedSkills = extractSkillsFromText(parsed.text);
    console.log("Compétences extraites :", extractedSkills);

    // 💾 Mise à jour utilisateur
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
  } catch (err: any) {
    console.error("Erreur dans /api/upload :", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";
import extractSkillsFromText from "../../../lib/extractSkills";
import path from "path";
import pdfParse from "pdf-parse";

export const config = {
  api: { bodyParser: false },
};

// URL base (à adapter en prod)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File;
    const email = formData.get("email")?.toString().toLowerCase();

    if (!file || !email) {
      return NextResponse.json(
        { error: "Fichier ou email manquant" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Récupérer utilisateur existant
    const existingUser = await User.findOne({ email });

    // Supprimer ancien CV si présent
    if (existingUser?.cv?.path) {
      const oldPath = path.join(process.cwd(), "public", existingUser.cv.path);
      try {
        await unlink(oldPath);
        console.log("Ancien CV supprimé :", oldPath);
      } catch (e) {
        console.warn("Ancien CV non trouvé :", oldPath);
      }
    }

    // Préparer sauvegarde fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const sanitizedFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, sanitizedFileName);
    const publicPath = `/uploads/${sanitizedFileName}`;
    const fullUrl = `${BASE_URL}${publicPath}`;

    await writeFile(filePath, buffer);

    // Extraire texte et compétences
    const parsed = await pdfParse(buffer);
    const extractedSkills = await extractSkillsFromText(parsed.text);

    // Construire objet update
    const updateData: any = {
      cvUrl: fullUrl,
      "cv.path": publicPath,
      "cv.filename": sanitizedFileName,
      "cv.uploadedAt": new Date(),
      cvText: parsed.text,
      updatedAt: new Date(),
    };

   // Toujours mettre à jour les skills
updateData.skills = extractedSkills;


    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "CV mis à jour, compétences extraites selon condition.",
      skills: updatedUser.skills,
      cvUrl: updatedUser.cvUrl,
    });
  } catch (err) {
    console.error("Erreur dans /api/upload :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

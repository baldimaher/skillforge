import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  // Vérification du rôle autorisé
  if (!["admin", "user"].includes(user.role)) {
    return NextResponse.json({ error: "Rôle non autorisé." }, { status: 403 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 3600000; // 1h
  await user.save();
  console.log("Token sauvegardé :", user.resetToken);
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: `Réinitialisation de mot de passe - ${user.role}`,
    html: `
      <p>Bonjour ${user.firstName},</p>
      <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Ce lien expire dans 1 heure.</p>
    `,
  });

  return NextResponse.json({ message: "Email envoyé avec succès." });
}

// Facultatif pour éviter l'erreur 405 en développement
export async function GET() {
  return NextResponse.json(
    { error: "Méthode GET non autorisée sur cette route." },
    { status: 405 }
  );
}

import { NextRequest, NextResponse } from "next/server";

import User from "@/models/User";
import crypto from "crypto";
import dbConnect from "@/lib/mongo";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email } = await req.json();
    
    // Validation de l'email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Vérification du rôle autorisé
    if (!["admin", "user"].includes(user.role)) {
      return NextResponse.json({ error: "Rôle non autorisé." }, { status: 403 });
    }

    // Génération du token de réinitialisation
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000; // 1h
    await user.save();
    
    console.log("Token sauvegardé :", user.resetToken);
    
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envoi de l'email
    await transporter.sendMail({
      to: email,
      subject: `Réinitialisation de mot de passe - ${user.role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4338ca;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #4338ca; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p><strong>Ce lien expire dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Email envoyé avec succès." });
    
  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'envoi de l'email." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Méthode GET non autorisée sur cette route." },
    { status: 405 }
  );
}
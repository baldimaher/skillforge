import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongo";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password, firstName, lastName, phone, birthDate } = await req.json();

    // Vérification simple des champs obligatoires
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // Vérifier si email existe déjà
    const userExist = await User.findOne({ email });
    if (userExist) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer utilisateur avec tous les champs
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
    });

    return NextResponse.json({
      message: "✅ Utilisateur créé avec succès",
      user: { email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName },
    });
  } catch (error) {
    console.error("Erreur signup :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password, firstName, lastName, phone, birthDate, role } = await req.json();

    // Validation des champs obligatoires
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Vérifie si l'utilisateur existe déjà
    const userExist = await User.findOne({ email });
    if (userExist) {
      return NextResponse.json(
        { error: "Email déjà utilisé" },
        { status: 409 }
      );
    }

    // Valide le rôle (user ou admin)
    const validRoles = ["user", "admin"];
    const userRole = validRoles.includes(role) ? role : "user";

    // Crée l'utilisateur, le hashage est fait automatiquement par le middleware mongoose
    const newUser = new User({
      email,
      password, // clair ici, sera hashé automatiquement par le pre-save
      firstName,
      lastName,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      role: userRole,
    });

    await newUser.save();

    // Réponse sans le mot de passe
    return NextResponse.json({
      message: "✅ Utilisateur créé avec succès",
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Erreur signup :", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";
import { sendEmail } from "@/lib/sendEmail";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const userId = params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    user.isApproved = true;
    await user.save();

    // Envoyer un email à tous les utilisateurs
    const allUsers = await User.find({});
    const subject = "Nouvel utilisateur approuvé";
    const message = `L'utilisateur ${user.name || user.email} a été approuvé.`;

    for (const u of allUsers) {
      if (u.email) {
        await sendEmail(u.email, subject, message);
      }
    }

    return NextResponse.json({ message: "Utilisateur approuvé avec succès et notification envoyée" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

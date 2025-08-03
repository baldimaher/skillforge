import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";
import { sendEmail } from "@/lib/sendEmail";

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const userId = context.params.id;
  await dbConnect();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    user.isApproved = true;
    await user.save();

    const allUsers = await User.find({});
    const subject = "Nouvel utilisateur approuvé";
    const message = `L'utilisateur ${user.name || user.email} a été approuvé.`;

    await Promise.all(
      allUsers
        .filter(u => u.email)
        .map(u => sendEmail(u.email, subject, message))
    );

    return NextResponse.json({
      message: "Utilisateur approuvé avec succès et notification envoyée"
    });
  } catch (error: any) {
    console.error("Erreur d'approbation ou d'envoi d'e-mail :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}


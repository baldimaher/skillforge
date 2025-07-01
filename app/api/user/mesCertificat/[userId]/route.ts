import Certificate from "../../../../../models/Certificate";
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongo";

export async function GET(
  request: Request,
  { params }: { params: { userid: string } }
) {
  try {
    await dbConnect();

    const userId = params.userid;

    // Trouver les certificats pour cet utilisateur
    const certifs = await Certificate.find({ userId });

    if (!certifs || certifs.length === 0) {
      return NextResponse.json(
        { message: "Aucun certificat trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(certifs);
  } catch (error) {
    console.error("Erreur API mesCertificats :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

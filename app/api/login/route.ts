import { NextResponse } from "next/server";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function POST(request: Request) {
  await dbConnect();

  const { email, password } = await request.json();

  console.log("Email reçu :", email);            // <-- ici
  console.log("Mot de passe reçu :", password);  // <-- ici

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 401 });
  }

  const isMatch = await user.comparePassword(password);

  console.log("Mot de passe correct ?", isMatch); // <-- ici

  if (!isMatch) {
    return NextResponse.json({ success: false, message: "Mot de passe incorrect" }, { status: 401 });
  }

  const userSafe = user.toObject();
  delete userSafe.password;

  return NextResponse.json({ success: true, user: userSafe });
}


export async function GET() {
  return NextResponse.json({ error: "Méthode GET non autorisée" }, { status: 405 });
}
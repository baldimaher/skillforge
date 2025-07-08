import mongoose from "mongoose";

// URL MongoDB en dur (sans .env)
const MONGODB_URI = "mongodb://localhost:27017/mondb";

// Pas besoin de cache si tu veux une version simple
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    // Déjà connecté
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "mondb",
    });
    console.log("✅ MongoDB connecté");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error);
  }
}

export default dbConnect;
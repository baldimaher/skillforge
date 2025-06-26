import { NextRequest, NextResponse } from "next/server";

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
if (!HUGGINGFACE_API_TOKEN) {
  throw new Error("HUGGINGFACE_API_TOKEN manquant dans les variables d'environnement");
}

const MODEL_URL = "https://api-inference.huggingface.co/models/dslim/bert-base-NER";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Texte manquant" }, { status: 400 });
    }

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API Hugging Face:", response.status, response.statusText, errorText);
      return NextResponse.json(
        { error: "Erreur d'appel à l'API Hugging Face", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    const entities = result[0]; // Hugging Face retourne un tableau à l'intérieur

    const skills = entities
      .filter(
        (ent: any) =>
          ent.entity_group === "MISC" || ent.entity_group === "ORG"
      )
      .map((ent: any) => ent.word.replace("##", ""))
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // supprime les doublons

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Erreur extraction :", error);
    return NextResponse.json(
      { error: "Erreur extraction", details: (error as Error).message },
      { status: 500 }
    );
  }
}

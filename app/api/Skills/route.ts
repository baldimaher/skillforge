import { NextRequest, NextResponse } from "next/server";

const HUGGINGFACE_API_TOKEN = "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";
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
        Authorization: HUGGINGFACE_API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const result = await response.json();

    const skills = result
      .flat()
      .filter((ent: any) => ent.entity_group === "MISC" || ent.entity_group === "ORG" || ent.entity_group === "SKILL")
      .map((ent: any) => ent.word.replace("##", ""))
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // remove duplicates

    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Erreur extraction :", error);
    return NextResponse.json({ error: "Erreur extraction" }, { status: 500 });
  }
}

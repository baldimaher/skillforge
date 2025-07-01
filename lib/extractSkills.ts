export default async function extractSkillsFromText(text: string): Promise<string[]> {
  const HF_TOKEN ="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";
  if (!HF_TOKEN) throw new Error("Token Hugging Face manquant");

  const response = await fetch("https://api-inference.huggingface.co/models/dslim/bert-base-NER", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) throw new Error("Erreur API Hugging Face");


  const data = await response.json();

  if (!Array.isArray(data)) {
    console.error("Réponse API inattendue :", data);
    throw new Error("Réponse API HuggingFace au format inattendu");
  }

  const blacklist = ["français", "anglais", "rouge tunisien", "arabe"]; // mots à exclure en minuscules

  const skills = data
    .flat()
    .filter((item: any) => item.entity_group === "MISC" || item.entity_group === "SKILL")
    .map((item: any) => item.word)
    .filter((value: string, index: number, self: string[]) =>
      self.indexOf(value) === index &&
      !blacklist.includes(value.toLowerCase())
    );

  return skills;
}

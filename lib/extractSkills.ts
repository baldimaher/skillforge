export default async function extractSkillsFromText(text: string): Promise<string[]> {
  const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

  const response = await fetch("https://api-inference.huggingface.co/models/Jean-Baptiste/roberta-large-ner-english", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  const data = await response.json();

  const blacklist = ["français", "anglais", "rouge tunisien","Arabe"]; // mots à exclure (en minuscules)

  const skills = data
    .flat()
    .filter((item: any) => item.entity_group === "MISC" || item.entity_group === "SKILL")
    .map((item: any) => item.word)
    // Supprimer doublons et filtrer la blacklist (insensible à la casse)
    .filter((value: string, index: number, self: string[]) =>
      self.indexOf(value) === index &&
      !blacklist.includes(value.toLowerCase())
    );

  return skills;
}

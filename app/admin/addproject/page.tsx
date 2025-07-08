import { useState } from "react";

export default function CreateProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [level, setLevel] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        technologies: technologies.split(",").map((tech) => tech.trim()),
        level,
      }),
    });

    if (res.ok) {
      alert("Projet créé avec succès !");
      setTitle("");
      setDescription("");
      setTechnologies("");
      setLevel("");
    } else {
      alert("Erreur lors de la création du projet");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Créer un nouveau projet</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Technologies (séparées par des virgules)</label>
          <input value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
        </div>
        <div>
          <label>Niveau</label>
          <input value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>
        <button type="submit">Créer le projet</button>
      </form>
    </div>
  );
}

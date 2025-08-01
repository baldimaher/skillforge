"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Head from "next/head";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function AddProjectPage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [objectives, setObjectives] = useState("");
  const [status, setStatus] = useState("à venir");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) {
      setErrorMsg("Vous devez être connecté pour ajouter un projet.");
      toast({
        title: "Erreur",
        description: "Veuillez vous connecter pour continuer.",
        variant: "destructive",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Vous devez être connecté pour ajouter un projet.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const techArray = technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);

    const objArray = objectives
      .split(";")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          technologies: techArray,
          objectives: objArray,
          status,
          difficulty,
          duration,
          githubUrl: link.trim(),
          demoUrl: demoUrl.trim(),
          userId: user._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Projet ajouté avec succès !");
        toast({
          title: "Succès",
          description: "Votre projet a été ajouté avec succès.",
        });
        setTitle("");
        setLink("");
        setDemoUrl("");
        setDescription("");
        setDuration("");
        setTechnologies("");
        setObjectives("");
        setStatus("à venir");
        setDifficulty("Beginner");
      } else {
        setErrorMsg(data.message || "Erreur lors de l'ajout du projet.");
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout du projet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMsg("Erreur réseau ou serveur.");
      toast({
        title: "Erreur",
        description: "Une erreur réseau est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ajouter un Projet - InnovaSkilles</title>
        <meta
          name="description"
          content="Ajoutez un nouveau projet à votre portfolio sur InnovaSkilles."
        />
      </Head>
      <div className="max-w-xl mx-auto mt-10 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
          Ajouter un Projet
        </h1>
        {errorMsg && (
          <div className="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 px-4 py-2 rounded mb-4">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-4 py-2 rounded mb-4">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Titre du projet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            required
            aria-label="Titre du projet"
          />
          <Input
            type="url"
            placeholder="Lien GitHub"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            aria-label="Lien GitHub"
          />
          <Input
            type="url"
            placeholder="Lien de démo"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className="border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            aria-label="Lien de démo"
          />
          <textarea
            placeholder="Description du projet"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-indigo-300 dark:border-indigo-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            rows={4}
            aria-label="Description du projet"
          />
          <textarea
            placeholder="Objectifs (séparés par ;) ex: Apprendre React;Maîtriser les hooks"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            className="w-full border border-indigo-300 dark:border-indigo-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={3}
            aria-label="Objectifs du projet"
          />
          <Input
            type="text"
            placeholder="Technologies (ex: React, Node.js)"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            className="border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            aria-label="Technologies utilisées"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border border-indigo-300 dark:border-indigo-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
            aria-label="Niveau de difficulté"
          >
            <option value="Beginner">Débutant</option>
            <option value="Intermediate">Intermédiaire</option>
            <option value="Advanced">Avancé</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-indigo-300 dark:border-indigo-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Statut du projet"
          >
            <option value="à venir">À venir</option>
            <option value="en cours">En cours</option>
            <option value="terminé">Terminé</option>
          </select>
          <Input
            type="text"
            placeholder="Durée estimée (ex: 2 semaines)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border-indigo-300 dark:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            required
            aria-label="Durée estimée"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white w-full"
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter"}
          </Button>
        </form>
      </div>
    </>
  );
}
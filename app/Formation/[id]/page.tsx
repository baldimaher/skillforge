import Formation from "../../../models/Formation";
import { ObjectId } from "mongodb";
import dbConnect from "../../../lib/mongo";
import { notFound } from "next/navigation";

interface Params {
  params: { id: string };
}

export default async function FormationDetailPage({ params }: Params) {
  const { id } = params;

  await dbConnect();

  if (!ObjectId.isValid(id)) {
    return notFound();
  }

  const formation = (await Formation.findById(id).lean()) as {
    _id: string;
    title: string;
    description: string;
    photoUrl?: string;
    videoUrl?: string;
    duration?: string;
    level?: string;
    instructor?: string;
    category?: string;
  } | null;

  if (!formation) return notFound();

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 flex items-center space-x-2">
            <span className="hover:text-indigo-600 transition">Formations</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">{formation.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">{formation.title}</h1>

          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
            {formation.instructor && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {formation.instructor}
              </div>
            )}
            {formation.duration && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {formation.duration}
              </div>
            )}
            {formation.level && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Niveau {formation.level}
              </div>
            )}
          </div>

          {formation.photoUrl && (
            <img
              src={formation.photoUrl}
              alt={formation.title}
              className="rounded-lg w-full h-60 object-cover shadow-md border"
              loading="lazy"
            />
          )}

          <section>
            <h2 className="text-xl font-semibold mb-2">À propos de cette formation</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {formation.description}
            </p>
          </section>

          {formation.videoUrl && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Contenu vidéo</h2>
              <div className="rounded-lg overflow-hidden border shadow">
                <video
                  src={formation.videoUrl}
                  controls
                  className="w-full aspect-video object-contain bg-black"
                  poster={formation.photoUrl}
                />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Access Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Accès à la formation</h3>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-shadow shadow-md">
              Commencer
            </button>
            <button className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              Aperçu gratuit
            </button>
          </div>

          {/* Détails */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Détails</h3>
            <ul className="space-y-2 text-sm">
              {formation.category && (
                <li className="flex justify-between">
                  <span className="text-gray-500">Catégorie</span>
                  <span>{formation.category}</span>
                </li>
              )}
              {formation.level && (
                <li className="flex justify-between">
                  <span className="text-gray-500">Niveau</span>
                  <span>{formation.level}</span>
                </li>
              )}
              {formation.duration && (
                <li className="flex justify-between">
                  <span className="text-gray-500">Durée</span>
                  <span>{formation.duration}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-gray-500">Format</span>
                <span>{formation.videoUrl ? "Vidéo + Texte" : "Texte"}</span>
              </li>
            </ul>
          </div>

          {/* Ce que vous apprendrez */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Ce que vous apprendrez</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✔</span>
                Concepts fondamentaux et applications pratiques
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✔</span>
                Techniques avancées et bonnes pratiques
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✔</span>
                Exercices pratiques et cas d'étude
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✔</span>
                Ressources complémentaires téléchargeables
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow">
            <h3 className="font-semibold text-indigo-900 mb-2">Besoin d’aide ?</h3>
            <p className="text-sm text-indigo-800 mb-3">
              Notre équipe est disponible pour répondre à vos questions.
            </p>
            <button className="text-indigo-700 font-medium hover:underline">
              Contacter le support →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

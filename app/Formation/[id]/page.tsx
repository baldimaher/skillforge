import Formation from "../../../models/Formation";
import { ObjectId } from "mongodb";
import dbConnect from "../../../lib/mongo";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Interface pour les paramètres de la page
interface Params {
  params: Promise<{ id: string }>; // Updated to reflect params as a Promise
}

// Interface pour le type Formation
interface FormationData {
  _id: string;
  title: string;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
  duration?: string;
  level?: string;
  instructor?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Fonction pour récupérer les données de formation
async function getFormation(id: string): Promise<FormationData | null> {
  try {
    await dbConnect();

    if (!ObjectId.isValid(id)) {
      return null;
    }

    const formation = await Formation.findById(id)
      .select("title description photoUrl videoUrl duration level instructor category createdAt updatedAt")
      .lean()
      .exec() as FormationData | null;

    return formation;
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
    return null;
  }
}

// Génération des métadonnées pour le SEO
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params; // Await params to resolve the Promise
  const formation = await getFormation(id);

  if (!formation) {
    return {
      title: "Formation non trouvée",
      description: "La formation demandée n'existe pas.",
      robots: "noindex, nofollow",
    };
  }

  const description = formation.description.length > 160
    ? formation.description.substring(0, 160) + "..."
    : formation.description;

  return {
    title: `${formation.title} - Formation`,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    keywords: `formation, ${formation.category}, ${formation.level}, ${formation.instructor}`,
    openGraph: {
      title: formation.title,
      description,
      type: "article",
      images: formation.photoUrl ? [{
        url: formation.photoUrl,
        alt: formation.title,
        width: 1200,
        height: 630,
      }] : [],
      publishedTime: formation.createdAt?.toISOString(),
      modifiedTime: formation.updatedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: formation.title,
      description,
      images: formation.photoUrl ? [formation.photoUrl] : [],
    },
  };
}

// Composant pour afficher les infos de la formation
function FormationInfo({ formation }: { formation: FormationData }) {
  const infoItems = [
    { label: "Durée", value: formation.duration, icon: "⏱️" },
    { label: "Formateur", value: formation.instructor, icon: "👨‍🏫" },
    { label: "Catégorie", value: formation.category, icon: "📂" },
    { label: "Niveau", value: formation.level, icon: "📊" },
  ];

  return (
    <div className="space-y-4">
      {infoItems.map(({ label, value, icon }) => (
        <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-500 block">{label}</span>
            <span className="text-gray-800 font-medium">{value || "Non spécifié"}</span>
          </div>
        </div>
      ))}

      {formation.createdAt && (
        <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
          Créé le {new Date(formation.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

// Composant pour afficher vidéo ou image
function MediaDisplay({ formation }: { formation: FormationData }) {
  if (formation.videoUrl) {
    return (
      <div className="relative group">
        <video
          src={formation.videoUrl}
          controls
          className="w-full rounded-lg shadow-md"
          poster={formation.photoUrl}
          preload="metadata"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
          🎥 Vidéo
        </div>
      </div>
    );
  }

  if (formation.photoUrl) {
    return (
      <div className="relative group">
        <img
          src={formation.photoUrl}
          alt={formation.title}
          className="w-full rounded-lg shadow-md object-cover max-h-96"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-500 shadow-md">
      <div className="text-center">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg font-medium">Pas de média disponible</p>
        <p className="text-sm mt-2">Cette formation ne contient pas d'image ou de vidéo</p>
      </div>
    </div>
  );
}

// Composant breadcrumb
function Breadcrumb({ formation }: { formation: FormationData }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <a href="/dashboard" className="hover:text-blue-600 transition-colors">Accueil</a>
      <span>/</span>
      <a href="/Formation" className="hover:text-blue-600 transition-colors">Formations</a>
      <span>/</span>
      <span className="text-gray-900">{formation.title}</span>
    </nav>
  );
}

// Composant principal
export default async function FormationDetailPage({ params }: Params) {
  const { id } = await params; // Await params to resolve the Promise
  const formation = await getFormation(id);

  if (!formation) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <Breadcrumb formation={formation} />

        {/* En-tête */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {formation.category && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {formation.category}
              </span>
            )}
            {formation.level && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Niveau {formation.level}
              </span>
            )}
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {formation.title}
          </h1>
        </header>

        {/* Média */}
        <section className="mb-8">
          <MediaDisplay formation={formation} />
        </section>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <span>📋</span>
              Description
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {formation.description.split("\n").map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-justify">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>

          {/* Infos complémentaires */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <span>ℹ️</span>
              Informations
            </h2>
            <FormationInfo formation={formation} />
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  // Liste des formations récupérées
  const [formations, setFormations] = useState<
    {
      _id: string;
      title: string;
      description: string;
      photoUrl?: string;
      videoUrl?: string;
    }[]
  >([]);

  // Nombre de formations non vues
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Récupérer toutes les formations
    fetch("/api/Formation")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFormations(data);

          // Récupérer IDs formations déjà vues
          const viewed = JSON.parse(localStorage.getItem("formationsViewed") || "[]");

          // Calculer combien sont nouvelles (non vues)
          const nonViewedCount = data.filter((f: any) => !viewed.includes(f._id)).length;
          setNotifCount(nonViewedCount);
        }
      })
      .catch((err) => {
        console.error("Erreur fetch formation:", err);
      });
  }, []);

  // Quand on ouvre ou ferme la dropdown notifications
  const handleNotificationsOpenChange = (open: boolean) => {
    if (open) {
      // Marquer toutes les formations actuelles comme vues (stocker leurs IDs)
      const currentIds = formations.map((f) => f._id);
      localStorage.setItem("formationsViewed", JSON.stringify(currentIds));
      setNotifCount(0);
    }
  };

  const lastFormation = formations.length > 0 ? formations[0] : null;

  const handleProfile = () => {
    router.push("/profil");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search courses, projects..." className="w-64 pl-10 bg-slate-50 border-slate-200" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={handleNotificationsOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-80 p-4" align="end" forceMount>
            <DropdownMenuLabel className="font-semibold text-lg mb-2">Dernière formation</DropdownMenuLabel>
            {lastFormation ? (
              <div>
                <h3 className="font-medium text-indigo-700">{lastFormation.title}</h3>
                <p className="text-sm text-gray-600">{lastFormation.description}</p>
                {lastFormation.photoUrl && (
                  <img
                    src={lastFormation.photoUrl}
                    alt={lastFormation.title}
                    className="mt-2 rounded max-h-36 object-cover w-full"
                  />
                )}
            
              </div>
            ) : (
              <p>Aucune formation disponible</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300">
                <AvatarFallback className="text-xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Utilisateur"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "email@exemple.com"}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>Profil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

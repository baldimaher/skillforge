"use client";

import { BarChart3, BookOpen, Code2, GraduationCap, Home, PlusCircle, Trophy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

type RoleType = "user" | "admin";

const baseMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Quizzes", url: "/quizzes", icon: BookOpen },
  { title: "Projects", url: "/projects", icon: Code2 },
  { title: "Formation", url: "/Formation", icon: GraduationCap },
  { title: "Progress", url: "/progress", icon: BarChart3 },
];

const adminMenuItems = [
  { title: "Add Quiz", url: "/admin/addquiz", icon: PlusCircle },
  { title: "Add Project", url: "/admin/addproject", icon: PlusCircle },
  { title: "Add Formation", url: "/admin/addformation", icon: PlusCircle },

];

export function AppSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<RoleType>("user");

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        // Vérifiez si role existe et est valide
        if (user.role && (user.role === "admin" || user.role === "user")) {
          setRole(user.role);
        } else {
          console.warn("Rôle non défini ou invalide dans localStorage, utilisation du rôle par défaut 'user'");
        }
      } else {
        console.warn("Aucune donnée utilisateur trouvée dans localStorage");
      }
    } catch (err) {
      console.error("Erreur lors de la lecture du rôle utilisateur dans localStorage", err);
    }
  }, []);

  const menuItems = role === "admin" ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">SkillForge</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
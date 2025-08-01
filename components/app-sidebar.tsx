"use client";

import {
  BarChart3,
  BookOpen,
  Code2,
  FileText,
  GraduationCap,
  Home,
  MessageCircle,
  PlusCircle,
  Trophy,
  User
} from "lucide-react";
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
  { title: "Tableau de bord", url: "/dashboard", icon: Home },
  { title: "Quiz", url: "/quizzes", icon: BookOpen },
  { title: "Projets", url: "/projects", icon: Code2 },
  { title: "Formation", url: "/formation", icon: GraduationCap },
  { title: "Progression", url: "/progress", icon: BarChart3 },
];

const adminMenuItems = [
  { title: "Gestion des utilisateurs", url: "/admin/users", icon: PlusCircle },
  { title: "Ajouter une formation", url: "/admin/addformation", icon: PlusCircle },
  { title: "Ajouter un quiz", url: "/admin/addquiz", icon: PlusCircle },
  { title: "Ajouter un projet", url: "/admin/addproject", icon: PlusCircle },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<RoleType>("user");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role || "user");
    }
  }, []);

  // Menu commun pour tous les rôles, Feedback inclus une seule fois
  const menuItems = [
    { title: "Tableau de bord", url: "/dashboard", icon: Home },
    {
      title: "Progression",
      url: role === "admin" ? "/admin/progress" : "/progress",
      icon: BarChart3,
    },
    { title: "Quiz", url: "/quizzes", icon: BookOpen },
    { title: "Projets", url: "/projects", icon: Code2 },
    { title: "Formation", url: "/Formation", icon: GraduationCap },
    { title: "Retour d'expérience", url: "/feedback", icon: MessageCircle },
  ];

if (role === "admin") {
  menuItems.push(
    { title: "Gestion des utilisateurs", url: "/admin/users", icon: User },
    { title: "Ajouter un quiz", url: "/admin/addquiz", icon: FileText },
    { title: "Ajouter un projet", url: "/admin/addproject", icon: Code2 },
    { title: "Ajouter une formation", url: "/admin/addformation", icon: GraduationCap }
  );
  }

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
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2"
                    >
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

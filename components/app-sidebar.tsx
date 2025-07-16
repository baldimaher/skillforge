"use client";

import {
  BarChart3,
  BookOpen,
  Code2,
  GraduationCap,
  Home,
  MessageCircle,
  PlusCircle,
  Trophy
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role || "user");
    }
  }, []);

  // Menu commun pour tous les rôles, Feedback inclus une seule fois
  // Menu commun pour tous les rôles, Feedback inclus une seule fois
  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    {
      title: "Progress",
      url: role === "admin" ? "/admin/progress" : "/progress",
      icon: BarChart3,
    },
    { title: "Quizzes", url: "/quizzes", icon: BookOpen },
    { title: "Projects", url: "/projects", icon: Code2 },
    { title: "Formation", url: "/Formation", icon: GraduationCap },
    { title: "Feedback", url: "/feedback", icon: MessageCircle },
  ];

  // Ajouts spécifiques pour admin (sans Feedback car déjà présent)
  // Ajouts spécifiques pour admin (sans Feedback car déjà présent)
  if (role === "admin") {
    menuItems.push(
      { title: "Add Quiz", url: "/admin/addquiz", icon: PlusCircle },
      { title: "Add Project", url: "/admin/addproject", icon: PlusCircle },
      { title: "Add Formation", url: "/admin/addformation", icon: PlusCircle }
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

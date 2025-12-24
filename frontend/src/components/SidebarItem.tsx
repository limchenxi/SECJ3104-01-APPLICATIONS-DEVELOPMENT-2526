import {
  BookOpen,
  Bot,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  FileQuestion,
  Layers,
  LayoutDashboard,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../features/Users/type";

export interface MenuItem {
  label: string;
  to?: string;
  icon?: LucideIcon;
  children?: MenuItem[];
}

export const SidebarItem: Record<UserRole, MenuItem[]> = {
  GURU: [
    { label: "Dashboard", to: "/dashboard/guru", icon: LayoutDashboard },
    { label: "Kedatangan", to: "/kedatangan", icon: CalendarCheck },
    { label: "eRPH", to: "/rph", icon: BookOpen },
    { label: "AI Quiz", to: "/quiz", icon: FileQuestion },
    { label: "Cerapan Kendiri", to: "/cerapan", icon: ClipboardList },
    { label: "Profile", to: "/profile", icon: User },
  ],

  PENTADBIR: [
    { label: "Dashboard", to: "/dashboard/pentadbir", icon: LayoutDashboard },
    {
      label: "Modul Guru",
      icon: Briefcase,
      children: [
        { label: "Kedatangan", to: "/kedatangan" },
        { label: "eRPH", to: "/rph" },
        { label: "AI Quiz", to: "/quiz" },
        { label: "Cerapan Kendiri", to: "/cerapan" },
      ],
    },
    { label: "Cerapan", to: "/pentadbir/cerapan", icon: ClipboardList },
    {
      label: "Template Rubrik",
      to: "/pentadbir/template-rubrik",
      icon: Layers,
    },
    {
      label: "Teaching Assignment",
      to: "/teaching-assignment",
      icon: BookOpen,
    },
    { label: "Pengurusan Guru", to: "/users", icon: Users },
    { label: "Profile", to: "/profile", icon: User },
  ],

  SUPERADMIN: [
    { label: "Dashboard", to: "/dashboard/superadmin", icon: LayoutDashboard },
    {
      label: "Modul Guru",
      icon: Briefcase,
      children: [
        { label: "eRPH", to: "/rph" },
        { label: "AI Quiz", to: "/quiz" },
        { label: "Cerapan Kendiri", to: "/cerapan" },
      ],
    },
    {
      label: "Modul Pentadbir",
      icon: Layers,
      children: [
        { label: "Cerapan", to: "/pentadbir/cerapan" },
        { label: "Template Rubrik", to: "/pentadbir/template-rubrik" },
        { label: "Teaching Assignment", to: "/teaching-assignment" },
        { label: "Pengurusan Pengguna", to: "/users" },
      ],
    },
    { label: "Pengurusan AI", to: "/ai", icon: Bot },
    { label: "Setting Sekolah", to: "/school/setting", icon: Settings },
    { label: "Profile", to: "/profile", icon: User },
  ],
};

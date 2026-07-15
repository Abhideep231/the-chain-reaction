import {
  Calculator,
  FileText,
  LayoutDashboard,
  Library,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import type { NavItem } from "@/types/nav"

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ask AI", href: "/ask-ai", icon: Sparkles },
  { title: "Knowledge Library", href: "/knowledge-library", icon: Library },
  { title: "PDF Viewer", href: "/pdf-viewer", icon: FileText },
  { title: "Calculations", href: "/calculations", icon: Calculator },
  { title: "Admin", href: "/admin", icon: ShieldCheck },
  { title: "Settings", href: "/settings", icon: Settings },
]

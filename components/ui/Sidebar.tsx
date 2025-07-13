// components/ui/Sidebar.tsx
"use client";

import { ChefHat, Home, ScrollText, Utensils, Settings, ClipboardList, BarChart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Receitas", icon: Utensils, href: "/receitas" },
  { name: "Fichas Técnicas", icon: ScrollText, href: "/fichas" },
  { name: "Insumos", icon: ClipboardList, href: "/insumos" },
  { name: "Produção", icon: ChefHat, href: "/producao" },
  { name: "Relatórios", icon: BarChart, href: "/relatorios" },
  { name: "Configurações", icon: Settings, href: "/configuracoes" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={clsx("bg-white border-r border-gray-200 shadow-sm transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between p-4">
        <h1 className={clsx("text-xl font-bold", collapsed && "hidden")}>Chef do Cotidiano</h1>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-800">
          ☰
        </button>
      </div>
      <nav className="space-y-2 px-2">
        {navItems.map(({ name, icon: Icon, href }) => (
          <Link key={name} href={href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
            <Icon size={20} />
            {!collapsed && <span>{name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

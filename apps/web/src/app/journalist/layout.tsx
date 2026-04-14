"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  LayoutDashboard,
  User,
  Calendar,
  Wallet,
  Archive,
  BookOpen,
  MessageSquare,
  Mic,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/journalist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journalist/profil", label: "Profil", icon: User },
  { href: "/journalist/agenda", label: "Agenda", icon: Calendar },
  { href: "/journalist/revenus", label: "Revenus", icon: Wallet },
  { href: "/journalist/archives", label: "Archives", icon: Archive },
  { href: "/journalist/annuaire", label: "Annuaire", icon: BookOpen },
  { href: "/journalist/forum", label: "Forum", icon: MessageSquare },
  { href: "/journalist/capture", label: "Capture", icon: Mic },
  { href: "/journalist/notifications", label: "Notifications", icon: Bell },
];

function getUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("heraldo_user") || "null"); } catch { return null; }
}

export default function JournalistLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = getUser();

  const selfNavPages = ["/journalist/dashboard"];
  const hasSelfNav = selfNavPages.some(p => pathname === p);

  if (hasSelfNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/journalist/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center shadow-sm">
                <Newspaper className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-extrabold text-navy tracking-tight hidden sm:inline">HERALDO</span>
            </Link>
            <span className="text-xs text-warm-gray hidden md:inline">| Journaliste</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-orange text-white shadow-md"
                      : "text-warm-gray hover:text-navy hover:bg-ivory-dark"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile nav scroll */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto scrollbar-none">
            {navItems.slice(0, 5).map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    active ? "bg-orange text-white" : "text-warm-gray"
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm shrink-0">
            {user?.fullName?.[0] || "J"}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

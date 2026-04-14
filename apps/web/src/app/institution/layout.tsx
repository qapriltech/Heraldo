"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  LayoutDashboard,
  Send,
  Mic,
  Wallet,
  Globe,
  Calendar,
  Sparkles,
  Mail,
  Users,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/institution/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/institution/communiques", label: "Communiques", icon: Send },
  { href: "/institution/agora", label: "AGORA", icon: Mic },
  { href: "/institution/fcm", label: "FCM", icon: Wallet },
  { href: "/institution/social", label: "Social", icon: Globe },
  { href: "/institution/agenda", label: "Agenda", icon: Calendar },
  { href: "/institution/studio", label: "Studio", icon: Sparkles },
  { href: "/institution/inbox", label: "Inbox", icon: Mail },
  { href: "/institution/crm", label: "CRM", icon: Users },
  { href: "/institution/briefs", label: "Briefs", icon: FileText },
];

function getUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("heraldo_user") || "null"); } catch { return null; }
}

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = getUser();

  // Pages qui gèrent leur propre nav (dashboard, new communique, new agora)
  const selfNavPages = ["/institution/dashboard", "/institution/communiques/new", "/institution/agora/new"];
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
            <Link href="/institution/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center shadow-sm">
                <Newspaper className="w-3.5 h-3.5 text-navy-dark" />
              </div>
              <span className="text-base font-extrabold text-navy tracking-tight hidden sm:inline">HERALDO</span>
            </Link>
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
                      ? "bg-navy text-white shadow-md"
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
                    active ? "bg-navy text-white" : "text-warm-gray"
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-[10px] font-extrabold text-navy-dark shadow-sm shrink-0">
            {user?.fullName?.[0] || "H"}
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

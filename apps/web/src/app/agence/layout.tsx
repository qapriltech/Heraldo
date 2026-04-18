"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper,
  LayoutDashboard,
  Users,
  Calendar,
  FileBarChart,
} from "lucide-react";

const navItems = [
  { href: "/agence/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agence/clients", label: "Clients", icon: Users },
  { href: "/agence/rapports", label: "Rapports", icon: FileBarChart },
];

function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("heraldo_user") || "null");
  } catch {
    return null;
  }
}

export default function AgenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = getUser();

  const selfNavPages = ["/agence/dashboard"];
  const hasSelfNav = selfNavPages.some((p) => pathname === p);

  if (hasSelfNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agence/dashboard"
              className="flex items-center gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #0E7490, #14B8A6)" }}
              >
                <Newspaper className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-extrabold text-navy tracking-tight hidden sm:inline">
                HERALDO
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline"
                style={{ background: "#0E7490", color: "#fff" }}
              >
                AGENCE
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "text-warm-gray hover:text-navy hover:bg-white/50"
                  }`}
                  style={active ? { background: "#0E7490" } : undefined}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy">{user.fullName}</p>
                <p className="text-[10px] text-warm-gray">{user.email}</p>
              </div>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "#0E7490" }}
            >
              {user?.fullName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "AG"}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "text-white shadow-sm"
                    : "text-warm-gray hover:text-navy"
                }`}
                style={active ? { background: "#0E7490" } : undefined}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

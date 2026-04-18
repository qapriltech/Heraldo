"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Newspaper,
  LayoutDashboard,
  Users,
  FileBarChart,
  Clock,
  TrendingUp,
  Eye,
  Send,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";

interface DashboardData {
  activeClients: number;
  totalClients: number;
  totalCommuniques: number;
  totalReach: number;
  timeLoggedThisMonth: number;
  clients: {
    id: string;
    clientName: string;
    clientSector: string;
    clientLogo: string | null;
    clientBrandColor: string | null;
    isActive: boolean;
    reportsCount: number;
    timeEntriesCount: number;
    lastReport: any;
    updatedAt: string;
  }[];
}

const TEAL = "#0E7490";
const TEAL_LIGHT = "#14B8A6";

function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("heraldo_user") || "null");
  } catch {
    return null;
  }
}

export default function AgenceDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await api.get<DashboardData>("/agency/dashboard");
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitch(clientId: string) {
    try {
      await api.post("/agency/switch/" + clientId, {});
      // Store active client in localStorage for context
      if (typeof window !== "undefined") {
        localStorage.setItem("heraldo_active_client", clientId);
      }
    } catch (err) {
      console.error("Failed to switch client", err);
    }
  }

  const kpis = data
    ? [
        {
          label: "Clients actifs",
          value: data.activeClients,
          icon: Users,
          color: TEAL,
        },
        {
          label: "Communiques totaux",
          value: data.totalCommuniques,
          icon: Send,
          color: "#D97706",
        },
        {
          label: "Portee estimee",
          value: data.totalReach.toLocaleString("fr-FR"),
          icon: Eye,
          color: "#7C3AED",
        },
        {
          label: "Temps ce mois (min)",
          value: data.timeLoggedThisMonth,
          icon: Clock,
          color: "#059669",
        },
      ]
    : [];

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Top nav bar */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/agence/dashboard" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
                }}
              >
                <Newspaper className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-extrabold text-navy tracking-tight hidden sm:inline">
                HERALDO
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white hidden sm:inline"
                style={{ background: TEAL }}
              >
                AGENCE
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {[
              { href: "/agence/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { href: "/agence/clients", label: "Clients", icon: Users },
              { href: "/agence/rapports", label: "Rapports", icon: FileBarChart },
            ].map((item) => {
              const active = item.href === "/agence/dashboard";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "text-white shadow-sm"
                      : "text-warm-gray hover:text-navy hover:bg-white/50"
                  }`}
                  style={active ? { background: TEAL } : undefined}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy">{user.fullName}</p>
                <p className="text-[10px] text-warm-gray">{user.email}</p>
              </div>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: TEAL }}
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
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">
              Tableau de bord Agence
            </h1>
            <p className="text-sm text-warm-gray mt-1">
              Vue globale de tous vos clients
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: TEAL }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="premium-card rounded-2xl p-5 bg-white/80 backdrop-blur-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: kpi.color + "15" }}
                    >
                      <kpi.icon
                        className="w-5 h-5"
                        style={{ color: kpi.color }}
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-navy">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-warm-gray mt-1">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Client Cards Grid */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">Vos clients</h2>
              <Link
                href="/agence/clients"
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-all"
                style={{ color: TEAL }}
              >
                Voir tout
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data && data.clients.length === 0 ? (
              <div className="premium-card rounded-2xl p-12 text-center bg-white/80 border border-gray-100">
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: TEAL }} />
                <h3 className="text-lg font-bold text-navy mb-2">
                  Aucun client
                </h3>
                <p className="text-sm text-warm-gray mb-4">
                  Commencez par ajouter votre premier client.
                </p>
                <Link
                  href="/agence/clients"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: TEAL }}
                >
                  Ajouter un client
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.clients.map((client) => (
                  <div
                    key={client.id}
                    className="premium-card rounded-2xl p-5 bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{
                            background:
                              client.clientBrandColor || TEAL,
                          }}
                        >
                          {client.clientName
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-navy">
                            {client.clientName}
                          </h3>
                          <p className="text-[11px] text-warm-gray">
                            {client.clientSector}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          client.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {client.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-warm-gray mb-4">
                      <span>{client.reportsCount} rapports</span>
                      <span>{client.timeEntriesCount} entrees temps</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSwitch(client.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: TEAL }}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Activer
                      </button>
                      <Link
                        href={`/agence/clients/${client.id}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-navy hover:bg-gray-50 transition-all"
                      >
                        Detail
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

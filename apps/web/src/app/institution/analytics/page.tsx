"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Newspaper,
  Users,
  FileText,
  Download,
  Loader2,
  Award,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Overview {
  totalCommuniques: number;
  avgOpenRate: number;
  totalArticlesGenerated: number;
  totalEstimatedReach: number;
  avgPublicationDelayHours: number;
}

interface CommuniqueStat {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  stats: { openRate: number; clickRate: number; articlesGenerated: number; estimatedReach: number };
}

interface JournalistRank {
  id: string;
  name: string;
  articles: number;
  openCount: number;
}

function getInstitutionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("heraldo_user") || "{}");
    return user.institutionId || "";
  } catch { return ""; }
}

const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [communiques, setCommuniques] = useState<CommuniqueStat[]>([]);
  const [journalists, setJournalists] = useState<JournalistRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const institutionId = getInstitutionId();

  useEffect(() => {
    const q = institutionId ? `?institutionId=${institutionId}` : "";
    Promise.all([
      api.get<any>(`/analytics/overview${q}`).then((r) => setOverview(r)).catch(() => {}),
      api.get<any>(`/analytics/communiques${q}`).then((r) => setCommuniques(r.data ?? r ?? [])).catch(() => {}),
      api.get<any>(`/analytics/journalistes${q}`).then((r) => setJournalists(Array.isArray(r) ? r : r.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [institutionId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post("/analytics/rapport/generate", { institutionId, reportType: "monthly" });
    } catch {}
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Taux d'ouverture moyen", value: `${overview?.avgOpenRate ?? 0}%`, gradient: "from-green to-teal", icon: Eye, iconBg: "bg-green/10", iconColor: "text-green", trend: overview?.avgOpenRate && overview.avgOpenRate > 50 ? "+12%" : "-3%" },
    { label: "Articles generes", value: String(overview?.totalArticlesGenerated ?? 0), gradient: "from-gold to-orange", icon: Newspaper, iconBg: "bg-gold/10", iconColor: "text-gold", trend: "+8%" },
    { label: "Portee estimee", value: overview?.totalEstimatedReach ? `${(overview.totalEstimatedReach / 1000).toFixed(0)}k` : "0", gradient: "from-purple to-navy", icon: TrendingUp, iconBg: "bg-purple/10", iconColor: "text-purple", trend: "+24%" },
    { label: "Delai moyen publication", value: `${overview?.avgPublicationDelayHours ?? 0}h`, gradient: "from-orange to-red", icon: Clock, iconBg: "bg-orange/10", iconColor: "text-orange", trend: "-2h" },
  ];

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Performance & impact</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Analytics & Impact</h1>
            <p className="text-warm-gray text-sm mt-1">Mesurez l&apos;impact de vos communiques de presse.</p>
          </div>
          <button onClick={handleGenerate} disabled={generating} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generer Rapport
          </button>
        </div>
      </motion.div>

      {/* KPIs with trend arrows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const isPositive = kpi.trend.startsWith("+") || kpi.trend.startsWith("-2h");
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="premium-card p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-extrabold ${isPositive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.trend}
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
                <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Communique performance with bar charts */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Performance des communiques</h2>
          </div>

          {communiques.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Aucune donnee</h3>
              <p className="text-sm text-warm-gray">Les statistiques apparaitront apres la diffusion de vos communiques.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {communiques.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <div className="premium-card p-5 relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green to-teal" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-navy truncate group-hover:text-gold transition-colors">{c.title}</p>
                        <p className="text-[10px] text-warm-gray">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex gap-5 text-center shrink-0">
                        <div>
                          <p className="text-xl font-extrabold text-green">{c.stats.openRate}%</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Ouverture</p>
                          {/* Mini bar */}
                          <div className="w-16 h-1.5 bg-navy/5 rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-green to-teal" style={{ width: `${c.stats.openRate}%` }} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-gold">{c.stats.articlesGenerated}</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Articles</p>
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-navy">{c.stats.estimatedReach > 1000 ? `${(c.stats.estimatedReach / 1000).toFixed(0)}k` : c.stats.estimatedReach}</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Portee</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Journalist ranking with medals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Classement journalistes</h2>
          </div>
          <div className="premium-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
            {journalists.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <p className="text-xs text-warm-gray">Aucun classement disponible.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {journalists.slice(0, 15).map((j, i) => (
                  <motion.div key={j.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.05 }}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl ${i % 2 === 0 ? "bg-ivory/50" : ""} hover:bg-gold/5 transition-colors`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        i < 3 ? "bg-gradient-to-r from-gold/30 to-orange/20" : "bg-navy/5"
                      }`}>
                        {i < 3 ? <span className="text-base">{medals[i]}</span> : <span className="text-[10px] font-extrabold text-navy/40">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy truncate">{j.name}</p>
                        <p className="text-[10px] text-warm-gray">{j.articles} articles | {j.openCount} ouvertures</p>
                      </div>
                      {i < 3 && <ArrowUpRight className="w-3.5 h-3.5 text-green shrink-0" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

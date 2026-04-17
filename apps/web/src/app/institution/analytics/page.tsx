"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Newspaper,
  Users,
  FileText,
  Download,
  Loader2,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const kpis = [
    { label: "Taux d'ouverture moyen", value: `${overview?.avgOpenRate ?? 0}%`, icon: Eye, color: "text-green-600" },
    { label: "Articles generes", value: String(overview?.totalArticlesGenerated ?? 0), icon: Newspaper, color: "text-gold" },
    { label: "Portee estimee", value: overview?.totalEstimatedReach ? `${(overview.totalEstimatedReach / 1000).toFixed(0)}k` : "0", icon: TrendingUp, color: "text-navy" },
    { label: "Delai moyen publication", value: `${overview?.avgPublicationDelayHours ?? 0}h`, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-gold" /> Analytics & Impact
            </h1>
            <p className="text-warm-gray text-sm mt-1">Mesurez l'impact de vos communiques de presse.</p>
          </div>
          <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold shadow-md hover:bg-navy/90 transition-all disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generer Rapport
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover={false} padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-navy">{kpi.value}</div>
                  <div className="text-[11px] text-warm-gray font-medium">{kpi.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Communique performance */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" /> Performance des communiques
          </h2>
          <div className="space-y-3">
            {communiques.length === 0 && (
              <Card hover={false}><p className="text-sm text-warm-gray text-center py-4">Aucun communique avec statistiques.</p></Card>
            )}
            {communiques.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card padding="sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy truncate">{c.title}</p>
                      <p className="text-[10px] text-warm-gray">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex gap-4 text-center shrink-0">
                      <div>
                        <p className="text-lg font-extrabold text-green-600">{c.stats.openRate}%</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider">Ouverture</p>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-gold">{c.stats.articlesGenerated}</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider">Articles</p>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-navy">{c.stats.estimatedReach > 1000 ? `${(c.stats.estimatedReach / 1000).toFixed(0)}k` : c.stats.estimatedReach}</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider">Portee</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journalist ranking */}
        <div>
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" /> Classement journalistes
          </h2>
          <Card hover={false}>
            {journalists.length === 0 && <p className="text-xs text-warm-gray text-center py-4">Aucun classement disponible.</p>}
            <div className="space-y-3">
              {journalists.slice(0, 15).map((j, i) => (
                <div key={j.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${i < 3 ? "bg-gold/20 text-gold" : "bg-navy/5 text-navy/40"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-navy truncate">{j.name}</p>
                    <p className="text-[10px] text-warm-gray">{j.articles} articles | {j.openCount} ouvertures</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  Bell,
  Shield,
  FileText,
  Loader2,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Mention {
  id: string;
  source: string;
  sourceUrl?: string;
  content: string;
  sentiment: string;
  score: number;
  detectedAt: string;
  isAlert: boolean;
}

interface Keyword {
  id: string;
  keyword: string;
  weight: number;
  alertThreshold: number;
}

interface Alert {
  id: string;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
  mention?: Mention;
}

function getInstitutionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("heraldo_user") || "{}");
    return user.institutionId || "";
  } catch { return ""; }
}

const sentimentConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  positive: { label: "Positif", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  negative: { label: "Negatif", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  neutral: { label: "Neutre", color: "text-yellow-600", bg: "bg-yellow-50", icon: MinusCircle },
};

export default function VeillePage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rapport, setRapport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const institutionId = getInstitutionId();

  useEffect(() => {
    const q = institutionId ? `?institutionId=${institutionId}` : "";
    Promise.all([
      api.get<any>(`/veille/mentions${q}`).then((r) => setMentions(r.data ?? r ?? [])).catch(() => {}),
      api.get<any>(`/veille/keywords${q}`).then((r) => setKeywords(Array.isArray(r) ? r : r.data ?? [])).catch(() => {}),
      api.get<any>(`/veille/alerts${q}`).then((r) => setAlerts(Array.isArray(r) ? r : r.data ?? [])).catch(() => {}),
      api.get<any>(`/veille/rapport${q}&period=daily`).then((r) => setRapport(r)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [institutionId]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const kw = await api.post<any>("/veille/keywords", { institutionId, keyword: newKeyword.trim() });
      setKeywords((prev) => [kw, ...prev]);
      setNewKeyword("");
    } catch {}
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      await api.delete(`/veille/keywords/${id}`);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch {}
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await api.patch(`/veille/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;
  const filteredMentions = sentimentFilter === "all" ? mentions : mentions.filter((m) => m.sentiment === sentimentFilter);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2">
              <Eye className="w-6 h-6 text-gold" /> Veille Media
            </h1>
            <p className="text-warm-gray text-sm mt-1">Surveillance en temps reel de votre presence mediatique.</p>
          </div>
          {unacknowledgedAlerts > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow-lg animate-pulse">
              <Shield className="w-4 h-4" /> Mode Crise ({unacknowledgedAlerts} alertes)
            </button>
          )}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Mentions totales", value: String(rapport?.totalMentions ?? mentions.length), icon: Eye, color: "text-navy" },
          { label: "Alertes actives", value: String(unacknowledgedAlerts), icon: AlertTriangle, color: "text-red-600" },
          { label: "Mots-cles", value: String(keywords.length), icon: Tag, color: "text-gold" },
          { label: "Score moyen", value: mentions.length > 0 ? String(Math.round(mentions.reduce((s, m) => s + m.score, 0) / mentions.length)) : "0", icon: Bell, color: "text-green-600" },
        ].map((kpi, i) => (
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
        {/* Mentions Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-navy">Flux de mentions</h2>
            <div className="flex gap-2">
              {["all", "positive", "negative", "neutral"].map((s) => (
                <button key={s} onClick={() => setSentimentFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sentimentFilter === s ? "bg-navy text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"}`}>
                  {s === "all" ? "Tous" : sentimentConfig[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {filteredMentions.length === 0 && (
            <Card hover={false}><p className="text-sm text-warm-gray text-center py-4">Aucune mention detectee pour le moment.</p></Card>
          )}

          {filteredMentions.map((m, i) => {
            const sc = sentimentConfig[m.sentiment] || sentimentConfig.neutral;
            const Icon = sc.icon;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card padding="sm" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy">{m.source}</span>
                      {m.isAlert && <Badge variant="warning" dot>Alerte</Badge>}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                      <Icon className="w-3 h-3" /> {sc.label}
                    </div>
                  </div>
                  <p className="text-sm text-navy/80 line-clamp-2">{m.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-warm-gray">
                    <span>{new Date(m.detectedAt).toLocaleString("fr-FR")}</span>
                    {m.sourceUrl && <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="text-gold hover:underline">Voir source</a>}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Keywords */}
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-bold text-navy">Mots-cles surveilles</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()} placeholder="Ajouter un mot-cle..." className="flex-1 px-3 py-2 rounded-lg border border-navy/10 text-sm" />
              <button onClick={handleAddKeyword} className="w-9 h-9 rounded-lg bg-navy text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {keywords.map((kw) => (
                <div key={kw.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-navy/5">
                  <div>
                    <span className="text-xs font-bold text-navy">{kw.keyword}</span>
                    <span className="text-[10px] text-warm-gray ml-2">Poids: {kw.weight}</span>
                  </div>
                  <button onClick={() => handleDeleteKeyword(kw.id)} className="text-warm-gray hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {keywords.length === 0 && <p className="text-xs text-warm-gray text-center py-2">Aucun mot-cle</p>}
            </div>
          </Card>

          {/* Alerts */}
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-navy">Alertes ({unacknowledgedAlerts})</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((a) => (
                <div key={a.id} className={`px-3 py-2 rounded-lg border ${a.acknowledged ? "border-navy/10 opacity-50" : a.severity === "crisis" ? "border-red-300 bg-red-50" : a.severity === "critical" ? "border-orange-300 bg-orange-50" : "border-yellow-300 bg-yellow-50"}`}>
                  <div className="flex items-center justify-between">
                    <Badge variant={a.severity === "crisis" || a.severity === "critical" ? "warning" : "neutral"} dot>{a.severity}</Badge>
                    {!a.acknowledged && (
                      <button onClick={() => handleAcknowledge(a.id)} className="text-[10px] font-bold text-navy hover:text-green-600">Acquitter</button>
                    )}
                  </div>
                  {a.mention && <p className="text-[10px] text-navy/60 mt-1 line-clamp-1">{a.mention.content}</p>}
                </div>
              ))}
              {alerts.length === 0 && <p className="text-xs text-warm-gray text-center py-2">Aucune alerte</p>}
            </div>
          </Card>

          {/* Daily Report Preview */}
          {rapport && (
            <Card hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-bold text-navy">Rapport du jour</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-warm-gray">Mentions</span><span className="font-bold text-navy">{rapport.totalMentions}</span></div>
                <div className="flex justify-between"><span className="text-warm-gray">Alertes</span><span className="font-bold text-navy">{rapport.totalAlerts}</span></div>
                {rapport.sentimentBreakdown?.map((s: any) => (
                  <div key={s.sentiment} className="flex justify-between">
                    <span className="text-warm-gray capitalize">{s.sentiment}</span>
                    <span className="font-bold text-navy">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

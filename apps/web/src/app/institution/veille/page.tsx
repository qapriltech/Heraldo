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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
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

const sentimentConfig: Record<string, { label: string; color: string; bg: string; cardBg: string; icon: typeof CheckCircle }> = {
  positive: { label: "Positif", color: "text-green", bg: "bg-green/10", cardBg: "bg-green-pale", icon: CheckCircle },
  negative: { label: "Negatif", color: "text-red", bg: "bg-red/10", cardBg: "bg-red-pale", icon: XCircle },
  neutral: { label: "Neutre", color: "text-gold-dark", bg: "bg-gold/10", cardBg: "bg-ivory", icon: MinusCircle },
};

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  crisis: { color: "text-red", bg: "bg-red/10", border: "border-red/30" },
  critical: { color: "text-orange", bg: "bg-orange/10", border: "border-orange/30" },
  warning: { color: "text-gold", bg: "bg-gold/10", border: "border-gold/30" },
  info: { color: "text-teal", bg: "bg-teal/10", border: "border-teal/30" },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement veille...</p>
        </div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;
  const filteredMentions = sentimentFilter === "all" ? mentions : mentions.filter((m) => m.sentiment === sentimentFilter);
  const positiveCount = mentions.filter(m => m.sentiment === "positive").length;
  const negativeCount = mentions.filter(m => m.sentiment === "negative").length;

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Surveillance mediatique</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Veille Media</h1>
            <p className="text-warm-gray text-sm mt-1">Surveillance en temps reel de votre presence mediatique.</p>
          </div>
          {unacknowledgedAlerts > 0 && (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red text-white text-sm font-extrabold shadow-lg badge-live">
              <Shield className="w-4 h-4" /> Mode Crise ({unacknowledgedAlerts} alertes)
            </button>
          )}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Mentions totales", value: String(rapport?.totalMentions ?? mentions.length), gradient: "from-navy to-purple", icon: Eye, iconBg: "bg-navy/10", iconColor: "text-navy" },
          { label: "Alertes actives", value: String(unacknowledgedAlerts), gradient: "from-red to-orange", icon: AlertTriangle, iconBg: "bg-red/10", iconColor: "text-red" },
          { label: "Mots-cles", value: String(keywords.length), gradient: "from-gold to-orange", icon: Tag, iconBg: "bg-gold/10", iconColor: "text-gold" },
          { label: "Score moyen", value: mentions.length > 0 ? String(Math.round(mentions.reduce((s, m) => s + m.score, 0) / mentions.length)) : "0", gradient: "from-green to-teal", icon: TrendingUp, iconBg: "bg-green/10", iconColor: "text-green" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mention count chart bars */}
      {mentions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="premium-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green via-gold to-red" />
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Repartition des sentiments</h3>
            </div>
            <div className="flex items-end gap-3 h-16">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-green to-green-light" style={{ height: `${mentions.length > 0 ? (positiveCount / mentions.length) * 100 : 0}%`, minHeight: "4px" }} />
                <span className="text-[9px] font-bold text-green">{positiveCount}</span>
                <span className="text-[8px] text-warm-gray">Positif</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-gold to-gold-light" style={{ height: `${mentions.length > 0 ? ((mentions.length - positiveCount - negativeCount) / mentions.length) * 100 : 0}%`, minHeight: "4px" }} />
                <span className="text-[9px] font-bold text-gold">{mentions.length - positiveCount - negativeCount}</span>
                <span className="text-[8px] text-warm-gray">Neutre</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-red to-orange" style={{ height: `${mentions.length > 0 ? (negativeCount / mentions.length) * 100 : 0}%`, minHeight: "4px" }} />
                <span className="text-[9px] font-bold text-red">{negativeCount}</span>
                <span className="text-[8px] text-warm-gray">Negatif</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mentions Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Flux de mentions</h2>
            </div>
            <div className="flex gap-2">
              {["all", "positive", "negative", "neutral"].map((s) => (
                <button key={s} onClick={() => setSentimentFilter(s)} className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${sentimentFilter === s ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray hover:text-navy border border-navy/10"}`}>
                  {s === "all" ? "Tous" : sentimentConfig[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {filteredMentions.length === 0 && (
            <div className="premium-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Aucune mention</h3>
              <p className="text-sm text-warm-gray">Ajoutez des mots-cles pour surveiller votre presence mediatique.</p>
            </div>
          )}

          {filteredMentions.map((m, i) => {
            const sc = sentimentConfig[m.sentiment] || sentimentConfig.neutral;
            const Icon = sc.icon;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                <div className={`premium-card p-5 ${sc.cardBg} border-l-4 ${
                  m.sentiment === "positive" ? "border-l-green" : m.sentiment === "negative" ? "border-l-red" : "border-l-gold"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-navy">{m.source}</span>
                      {m.isAlert && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red/10 text-[10px] font-bold text-red">
                          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" /> Alerte
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                      <Icon className="w-3 h-3" /> {sc.label}
                    </div>
                  </div>
                  <p className="text-sm text-navy/80 line-clamp-2 mb-2">{m.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-warm-gray">
                    <span>{new Date(m.detectedAt).toLocaleString("fr-FR")}</span>
                    {m.sourceUrl && <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="text-gold font-bold hover:underline">Voir source</a>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Keywords */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Mots-cles surveilles</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
              <div className="flex gap-2 mb-4">
                <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()} placeholder="Ajouter un mot-cle..." className="flex-1 px-3 py-2.5 rounded-xl border border-navy/10 text-sm" />
                <button onClick={handleAddKeyword} className="w-10 h-10 rounded-xl gradient-gold text-navy-dark flex items-center justify-center shadow-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {keywords.map((kw) => (
                  <div key={kw.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-ivory/50 border border-navy/5 group">
                    <div>
                      <span className="text-xs font-bold text-navy">{kw.keyword}</span>
                      <span className="text-[10px] text-warm-gray ml-2">Poids: {kw.weight}</span>
                    </div>
                    <button onClick={() => handleDeleteKeyword(kw.id)} className="text-warm-gray hover:text-red transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-center py-4">
                    <Tag className="w-5 h-5 text-warm-gray/30 mx-auto mb-2" />
                    <p className="text-xs text-warm-gray">Aucun mot-cle</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Alertes ({unacknowledgedAlerts})</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red to-orange" />
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.map((a) => {
                  const sev = severityConfig[a.severity] || severityConfig.info;
                  return (
                    <div key={a.id} className={`px-3 py-2.5 rounded-xl border ${a.acknowledged ? "border-navy/10 opacity-50" : `${sev.border} ${sev.bg}`}`}>
                      <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sev.bg} ${sev.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.color === "text-red" ? "bg-red" : sev.color === "text-orange" ? "bg-orange" : sev.color === "text-gold" ? "bg-gold" : "bg-teal"}`} />
                          {a.severity}
                        </span>
                        {!a.acknowledged && (
                          <button onClick={() => handleAcknowledge(a.id)} className="text-[10px] font-extrabold text-navy hover:text-green transition-colors">Acquitter</button>
                        )}
                      </div>
                      {a.mention && <p className="text-[10px] text-navy/60 mt-1.5 line-clamp-1">{a.mention.content}</p>}
                    </div>
                  );
                })}
                {alerts.length === 0 && (
                  <div className="text-center py-4">
                    <Shield className="w-5 h-5 text-warm-gray/30 mx-auto mb-2" />
                    <p className="text-xs text-warm-gray">Aucune alerte</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Daily Report Preview */}
          {rapport && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gold" />
                <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Rapport du jour</h2>
              </div>
              <div className="premium-card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-navy" />
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-navy/5"><span className="text-warm-gray">Mentions</span><span className="font-extrabold text-navy">{rapport.totalMentions}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-navy/5"><span className="text-warm-gray">Alertes</span><span className="font-extrabold text-navy">{rapport.totalAlerts}</span></div>
                  {rapport.sentimentBreakdown?.map((s: any) => (
                    <div key={s.sentiment} className="flex justify-between items-center py-2 border-b border-navy/5 last:border-0">
                      <span className="text-warm-gray capitalize">{s.sentiment}</span>
                      <span className="font-extrabold text-navy">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

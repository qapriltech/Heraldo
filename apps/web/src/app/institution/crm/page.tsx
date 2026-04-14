"use client";

import { motion } from "framer-motion";
import {
  Users,
  Search,
  Heart,
  TrendingUp,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Filter,
  Cake,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type Tier = "cold" | "warm" | "hot" | "engaged";

interface JournalistCRM {
  id: string;
  name: string;
  media: string;
  mediaType: string;
  photo: string;
  tier: Tier;
  score: number;
  specialties: string[];
  lastInteraction: string;
  interactions90d: number;
  publications: number;
  fcmTotal: string;
  preferredContact: string;
  birthday?: string;
}

const tierConfig: Record<Tier, { label: string; color: string; bg: string; ring: string }> = {
  cold: { label: "Dormant", color: "text-warm-gray", bg: "bg-warm-gray/10", ring: "ring-warm-gray/30" },
  warm: { label: "Regulier", color: "text-orange", bg: "bg-orange/10", ring: "ring-orange/30" },
  hot: { label: "Actif", color: "text-gold", bg: "bg-gold/10", ring: "ring-gold/30" },
  engaged: { label: "Fidele", color: "text-green", bg: "bg-green/10", ring: "ring-green/30" },
};

const defaultKpis = [
  { label: "Journalistes suivis", value: "0", icon: Users, color: "text-navy" },
  { label: "Relations actives", value: "0", icon: TrendingUp, color: "text-green" },
  { label: "Interactions ce mois", value: "0", icon: BarChart3, color: "text-gold" },
  { label: "Publications generees", value: "0", icon: Star, color: "text-orange" },
];

const contactIcon: Record<string, typeof Phone> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
};

export default function CrmPage() {
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [search, setSearch] = useState("");
  const [mockJournalists, setMockJournalists] = useState<JournalistCRM[]>([]);
  const [kpis, setKpis] = useState(defaultKpis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/crm/journalists").then((res) => setMockJournalists(res.data ?? [])).catch(() => {}),
      api.get<any>("/crm/dashboard").then((res) => {
        const d = res.data ?? res;
        if (d && typeof d === "object" && !Array.isArray(d)) {
          setKpis([
            { label: "Journalistes suivis", value: String(d.totalJournalists ?? "0"), icon: Users, color: "text-navy" },
            { label: "Relations actives", value: String(d.activeRelations ?? "0"), icon: TrendingUp, color: "text-green" },
            { label: "Interactions ce mois", value: String(d.interactionsThisMonth ?? "0"), icon: BarChart3, color: "text-gold" },
            { label: "Publications generees", value: String(d.publicationsGenerated ?? "0"), icon: Star, color: "text-orange" },
          ]);
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const upcomingBirthdays = mockJournalists.filter(j => j.birthday);

  const filtered = mockJournalists.filter(j => {
    if (tierFilter !== "all" && j.tier !== tierFilter) return false;
    if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.media.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">CRM Journalistes</h1>
        <p className="text-warm-gray text-sm mt-1">Gerez vos relations avec les journalistes et medias.</p>
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main list */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="text" placeholder="Rechercher un journaliste ou media..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/10 bg-white text-sm" />
              </div>
              <div className="flex gap-2">
                {(["all", "engaged", "hot", "warm", "cold"] as const).map(t => (
                  <button key={t} onClick={() => setTierFilter(t)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${tierFilter === t ? "bg-navy text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"}`}>
                    {t === "all" ? "Tous" : tierConfig[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Journalist cards */}
            <div className="space-y-3">
              {filtered.map((j, i) => {
                const tc = tierConfig[j.tier];
                const ContactIcon = contactIcon[j.preferredContact] || Mail;
                return (
                  <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card padding="sm" className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-full ${tc.bg} ring-2 ${tc.ring} flex items-center justify-center text-sm font-extrabold ${tc.color} shrink-0`}>
                          {j.photo}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-navy truncate">{j.name}</p>
                            <Badge variant={j.tier === "engaged" ? "success" : j.tier === "hot" ? "gold" : j.tier === "warm" ? "warning" : "neutral"} dot>{tc.label}</Badge>
                          </div>
                          <p className="text-xs text-warm-gray truncate">{j.media} — {j.mediaType}</p>
                          <div className="flex gap-1 mt-1">
                            {j.specialties.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-navy/5 text-navy/60 font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="w-32 shrink-0">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-bold text-warm-gray">Score</span>
                          <span className={`font-extrabold ${tc.color}`}>{j.score}/100</span>
                        </div>
                        <div className="h-2 bg-navy/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${j.score}%`, background: j.tier === "engaged" ? "#1A7A3C" : j.tier === "hot" ? "#C8A45C" : j.tier === "warm" ? "#E8742E" : "#8A8278" }} />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-center shrink-0">
                        <div>
                          <p className="text-lg font-extrabold text-navy">{j.interactions90d}</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider">Interactions</p>
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-gold">{j.publications}</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider">Publications</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green">{j.fcmTotal}</p>
                          <p className="text-[9px] text-warm-gray uppercase tracking-wider">FCM verse</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center">
                          <ContactIcon className="w-4 h-4 text-navy/50" />
                        </div>
                        <span className="text-[10px] text-warm-gray">{j.lastInteraction}</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Birthdays */}
            <Card hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <Cake className="w-4 h-4 text-orange" />
                <h3 className="text-sm font-bold text-navy">Anniversaires a venir</h3>
              </div>
              {upcomingBirthdays.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBirthdays.map(j => (
                    <div key={j.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-[10px] font-bold text-orange">{j.photo}</div>
                      <div>
                        <p className="text-xs font-bold text-navy">{j.name}</p>
                        <p className="text-[10px] text-warm-gray">{j.birthday}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-warm-gray">Aucun anniversaire dans les 14 prochains jours</p>
              )}
            </Card>

            {/* Tier distribution */}
            <Card hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-bold text-navy">Repartition</h3>
              </div>
              {(["engaged", "hot", "warm", "cold"] as Tier[]).map(t => {
                const count = mockJournalists.filter(j => j.tier === t).length;
                const pct = Math.round((count / mockJournalists.length) * 100);
                const tc = tierConfig[t];
                return (
                  <div key={t} className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${tc.bg} ring-1 ${tc.ring}`} />
                    <span className="text-xs font-medium text-navy flex-1">{tc.label}</span>
                    <span className="text-xs font-bold text-warm-gray">{count}</span>
                    <div className="w-16 h-1.5 bg-navy/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t === "engaged" ? "#1A7A3C" : t === "hot" ? "#C8A45C" : t === "warm" ? "#E8742E" : "#8A8278" }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
    </>
  );
}

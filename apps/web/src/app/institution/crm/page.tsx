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
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
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

const tierConfig: Record<Tier, { label: string; color: string; bg: string; ring: string; gradient: string }> = {
  cold: { label: "Dormant", color: "text-warm-gray", bg: "bg-warm-gray/10", ring: "ring-warm-gray/30", gradient: "from-warm-gray to-warm-gray-light" },
  warm: { label: "Regulier", color: "text-orange", bg: "bg-orange/10", ring: "ring-orange/30", gradient: "from-orange to-gold" },
  hot: { label: "Actif", color: "text-gold", bg: "bg-gold/10", ring: "ring-gold/30", gradient: "from-gold to-orange" },
  engaged: { label: "Fidele", color: "text-green", bg: "bg-green/10", ring: "ring-green/30", gradient: "from-green to-teal" },
};

const defaultKpis = [
  { label: "Journalistes suivis", value: "0", gradient: "from-navy to-purple", icon: Users, iconBg: "bg-navy/10", iconColor: "text-navy" },
  { label: "Relations actives", value: "0", gradient: "from-green to-teal", icon: TrendingUp, iconBg: "bg-green/10", iconColor: "text-green" },
  { label: "Interactions ce mois", value: "0", gradient: "from-gold to-orange", icon: BarChart3, iconBg: "bg-gold/10", iconColor: "text-gold" },
  { label: "Publications generees", value: "0", gradient: "from-orange to-red", icon: Star, iconBg: "bg-orange/10", iconColor: "text-orange" },
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
            { label: "Journalistes suivis", value: String(d.totalJournalists ?? "0"), gradient: "from-navy to-purple", icon: Users, iconBg: "bg-navy/10", iconColor: "text-navy" },
            { label: "Relations actives", value: String(d.activeRelations ?? "0"), gradient: "from-green to-teal", icon: TrendingUp, iconBg: "bg-green/10", iconColor: "text-green" },
            { label: "Interactions ce mois", value: String(d.interactionsThisMonth ?? "0"), gradient: "from-gold to-orange", icon: BarChart3, iconBg: "bg-gold/10", iconColor: "text-gold" },
            { label: "Publications generees", value: String(d.publicationsGenerated ?? "0"), gradient: "from-orange to-red", icon: Star, iconBg: "bg-orange/10", iconColor: "text-orange" },
          ]);
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement CRM...</p>
        </div>
      </div>
    );
  }

  const upcomingBirthdays = mockJournalists.filter(j => j.birthday);
  const filtered = mockJournalists.filter(j => {
    if (tierFilter !== "all" && j.tier !== tierFilter) return false;
    if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.media.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Relations medias</span>
        </div>
        <h1 className="text-3xl font-serif text-navy tracking-tight">CRM Journalistes</h1>
        <p className="text-warm-gray text-sm mt-1">Gerez vos relations avec les journalistes et medias.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
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

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main list */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input type="text" placeholder="Rechercher un journaliste ou media..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-navy/10 bg-white text-sm placeholder:text-warm-gray/50" />
            </div>
            <div className="flex gap-2">
              {(["all", "engaged", "hot", "warm", "cold"] as const).map(t => (
                <button key={t} onClick={() => setTierFilter(t)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${tierFilter === t ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray hover:text-navy border border-navy/10"}`}>
                  {t === "all" ? "Tous" : tierConfig[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Contacts journalistes</h2>
          </div>

          {/* Journalist cards */}
          <div className="space-y-3">
            {filtered.map((j, i) => {
              const tc = tierConfig[j.tier];
              const ContactIcon = contactIcon[j.preferredContact] || Mail;
              return (
                <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <div className="premium-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group cursor-pointer">
                    {/* Avatar with tier gradient ring */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-full ${tc.bg} ring-3 ${tc.ring} flex items-center justify-center text-sm font-extrabold ${tc.color} shrink-0 relative`}>
                        {j.photo}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r ${tc.gradient} border-2 border-white`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-navy truncate group-hover:text-gold transition-colors">{j.name}</p>
                          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tc.bg} ${tc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tc.color === "text-green" ? "bg-green" : tc.color === "text-gold" ? "bg-gold" : tc.color === "text-orange" ? "bg-orange" : "bg-warm-gray"}`} />
                            {tc.label}
                          </span>
                        </div>
                        <p className="text-xs text-warm-gray truncate">{j.media} -- {j.mediaType}</p>
                        <div className="flex gap-1.5 mt-1.5">
                          {j.specialties.map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-navy/5 text-navy/60 font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Score bar with gradient */}
                    <div className="w-36 shrink-0">
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="font-bold text-warm-gray uppercase tracking-wider">Score</span>
                        <span className={`font-extrabold ${tc.color}`}>{j.score}/100</span>
                      </div>
                      <div className="h-2.5 bg-navy/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all bg-gradient-to-r ${tc.gradient}`}
                          style={{ width: `${j.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-5 text-center shrink-0">
                      <div>
                        <p className="text-xl font-extrabold text-navy">{j.interactions90d}</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Interactions</p>
                      </div>
                      <div>
                        <p className="text-xl font-extrabold text-gold">{j.publications}</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Publications</p>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-green">{j.fcmTotal}</p>
                        <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">FCM verse</p>
                      </div>
                    </div>

                    {/* Contact + timeline dot */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center hover:bg-gold/10 transition-colors">
                        <ContactIcon className="w-4 h-4 text-navy/50" />
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="w-2 h-2 rounded-full bg-gold mb-1" />
                        <span className="text-[10px] text-warm-gray">{j.lastInteraction}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="premium-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-serif text-navy mb-2">Aucun journaliste</h3>
                <p className="text-sm text-warm-gray">Ajoutez des journalistes a votre CRM pour commencer a suivre vos relations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Birthdays */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-2 mb-4">
              <Cake className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Anniversaires</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange to-red" />
              {upcomingBirthdays.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBirthdays.map(j => (
                    <div key={j.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange/10 flex items-center justify-center text-xs font-extrabold text-orange">{j.photo}</div>
                      <div>
                        <p className="text-xs font-bold text-navy">{j.name}</p>
                        <p className="text-[10px] text-warm-gray">{j.birthday}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Cake className="w-6 h-6 text-warm-gray/30 mx-auto mb-2" />
                  <p className="text-xs text-warm-gray">Aucun anniversaire dans les 14 prochains jours</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tier distribution */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Repartition</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-navy" />
              {(["engaged", "hot", "warm", "cold"] as Tier[]).map(t => {
                const count = mockJournalists.filter(j => j.tier === t).length;
                const pct = mockJournalists.length > 0 ? Math.round((count / mockJournalists.length) * 100) : 0;
                const tc = tierConfig[t];
                return (
                  <div key={t} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${tc.gradient}`} />
                    <span className="text-xs font-bold text-navy flex-1">{tc.label}</span>
                    <span className="text-xs font-extrabold text-navy">{count}</span>
                    <div className="w-20 h-2 bg-navy/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${tc.gradient}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

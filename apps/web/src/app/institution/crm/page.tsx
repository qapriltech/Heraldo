"use client";

import { motion } from "framer-motion";
import {
  Newspaper,
  ArrowLeft,
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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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

const mockJournalists: JournalistCRM[] = [
  { id: "1", name: "Aminata Coulibaly", media: "Fraternite Matin", mediaType: "Presse ecrite", photo: "AC", tier: "engaged", score: 88, specialties: ["Politique", "Economie"], lastInteraction: "Il y a 2j", interactions90d: 14, publications: 6, fcmTotal: "127 500 F", preferredContact: "whatsapp", birthday: "18 avril" },
  { id: "2", name: "Sekou Diallo", media: "RTI", mediaType: "Television", photo: "SD", tier: "hot", score: 72, specialties: ["Societe", "Culture"], lastInteraction: "Il y a 5j", interactions90d: 8, publications: 3, fcmTotal: "85 000 F", preferredContact: "email" },
  { id: "3", name: "Marie Konan", media: "RFI Abidjan", mediaType: "Radio", photo: "MK", tier: "warm", score: 38, specialties: ["International", "Politique"], lastInteraction: "Il y a 3 sem.", interactions90d: 3, publications: 1, fcmTotal: "10 000 F", preferredContact: "phone" },
  { id: "4", name: "Ibrahim Traore", media: "Abidjan.net", mediaType: "Web", photo: "IT", tier: "hot", score: 65, specialties: ["Economie", "Tech"], lastInteraction: "Il y a 1 sem.", interactions90d: 6, publications: 4, fcmTotal: "68 000 F", preferredContact: "whatsapp" },
  { id: "5", name: "Fatou Bamba", media: "L'Intelligent d'Abidjan", mediaType: "Presse ecrite", photo: "FB", tier: "cold", score: 12, specialties: ["Societe"], lastInteraction: "Il y a 4 mois", interactions90d: 0, publications: 0, fcmTotal: "0 F", preferredContact: "email" },
  { id: "6", name: "Kouadio Yao", media: "NCI", mediaType: "Television", photo: "KY", tier: "engaged", score: 91, specialties: ["Politique", "Economie", "Sport"], lastInteraction: "Aujourd'hui", interactions90d: 18, publications: 9, fcmTotal: "195 000 F", preferredContact: "whatsapp", birthday: "22 avril" },
];

const upcomingBirthdays = mockJournalists.filter(j => j.birthday);

const kpis = [
  { label: "Journalistes suivis", value: "156", icon: Users, color: "text-navy" },
  { label: "Relations actives", value: "42", icon: TrendingUp, color: "text-green" },
  { label: "Interactions ce mois", value: "89", icon: BarChart3, color: "text-gold" },
  { label: "Publications generees", value: "23", icon: Star, color: "text-orange" },
];

const contactIcon: Record<string, typeof Phone> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
};

export default function CrmPage() {
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockJournalists.filter(j => {
    if (tierFilter !== "all" && j.tier !== tierFilter) return false;
    if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.media.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/institution/dashboard" className="p-2 hover:bg-navy/5 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-navy" />
            </Link>
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">CRM Journalistes</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}

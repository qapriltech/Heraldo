"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Users,
  Wallet,
  Eye,
  Plus,
  ArrowUpRight,
  FileText,
  Video,
  CreditCard,
  Clock,
  TrendingUp,
  Newspaper,
  Mic,
  BarChart3,
  Calendar,
  CheckCircle2,
  Loader2,
  Zap,
  Globe,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface DashboardData {
  institution: { id: string; name: string; logoUrl?: string } | null;
  kpis: {
    communiques: { total: number; sent: number; draft: number };
    agora: { total: number; live: number; scheduled: number };
    fcm: { totalFunded: number; totalSpent: number; activePools: number; remaining: number };
    reach: { totalJournalists: number; estimatedReach: number };
  };
  recentActivity: { type: string; title: string; description: string; date: string; status: string }[];
  upcomingRooms: { id: string; title: string; roomType: string; status: string; scheduledAt: string; _count: { participants: number } }[];
}

const fmt = (n: number) => n.toLocaleString("fr-FR");
const fmtShort = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-green/10", text: "text-green", dot: "bg-green" },
  live: { bg: "bg-red/10", text: "text-red", dot: "bg-red" },
  info: { bg: "bg-teal/10", text: "text-teal", dot: "bg-teal" },
  neutral: { bg: "bg-warm-gray/10", text: "text-warm-gray", dot: "bg-warm-gray" },
  gold: { bg: "bg-gold/10", text: "text-gold", dot: "bg-gold" },
};

function getUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("heraldo_user") || "null"); } catch { return null; }
}

export default function InstitutionDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    api.get<DashboardData>("/institutions/dashboard")
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement du cockpit...</p>
        </div>
      </div>
    );
  }

  const k = data?.kpis;

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-sm">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-navy">HERALDO</span>
              <span className="text-sm text-warm-gray ml-2 hidden sm:inline">| {data?.institution?.name || "Cockpit"}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/institution/dashboard" className="text-navy border-b-2 border-gold pb-0.5">Dashboard</Link>
            <Link href="/institution/communiques" className="text-warm-gray hover:text-navy transition-colors">Communiques</Link>
            <Link href="/institution/agora" className="text-warm-gray hover:text-navy transition-colors">AGORA</Link>
            <Link href="/institution/fcm" className="text-warm-gray hover:text-navy transition-colors">FCM</Link>
            <Link href="/institution/social" className="text-warm-gray hover:text-navy transition-colors hidden lg:block">Social</Link>
            <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center text-xs font-extrabold text-navy-dark shadow-md">
              {user?.fullName?.[0] || "H"}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] font-extrabold text-warm-gray uppercase tracking-[0.3em]">Cockpit en temps reel</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">
            Bonjour, <span className="text-gradient-gold">{user?.fullName?.split(" ")[0] || "Bienvenue"}</span>
          </h1>
          <p className="text-warm-gray mt-1">Voici l&apos;activite de {data?.institution?.name || "votre institution"} sur HERALDO.</p>
        </motion.div>

        {/* KPI Cards — Bento Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Communiques */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-gold" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center"><Send className="w-5 h-5 text-gold" /></div>
                <Link href="/institution/communiques" className="text-warm-gray hover:text-gold transition-colors"><ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{k?.communiques.total || 0}</div>
              <div className="text-xs font-semibold text-warm-gray">Communiques</div>
              <div className="flex gap-3 mt-3 text-[10px]">
                <span className="text-green font-bold">{k?.communiques.sent || 0} diffuses</span>
                <span className="text-warm-gray">{k?.communiques.draft || 0} brouillons</span>
              </div>
            </div>
          </motion.div>

          {/* AGORA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange to-red" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange/10 flex items-center justify-center"><Mic className="w-5 h-5 text-orange" /></div>
                <Link href="/institution/agora" className="text-warm-gray hover:text-orange transition-colors"><ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{k?.agora.total || 0}</div>
              <div className="text-xs font-semibold text-warm-gray">Salles AGORA</div>
              <div className="flex gap-3 mt-3 text-[10px]">
                {(k?.agora.live || 0) > 0 && <span className="text-red font-bold badge-live flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red" />EN DIRECT</span>}
                <span className="text-teal font-bold">{k?.agora.scheduled || 0} planifiees</span>
              </div>
            </div>
          </motion.div>

          {/* FCM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green to-teal" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-green/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-green" /></div>
                <Link href="/institution/fcm" className="text-warm-gray hover:text-green transition-colors"><ArrowUpRight className="w-4 h-4" /></Link>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{fmtShort(k?.fcm.totalFunded || 0)} <span className="text-base font-normal text-warm-gray">F</span></div>
              <div className="text-xs font-semibold text-warm-gray">Fonds FCM</div>
              <div className="flex gap-3 mt-3 text-[10px]">
                <span className="text-green font-bold">{fmtShort(k?.fcm.remaining || 0)} F restants</span>
                <span className="text-warm-gray">{k?.fcm.activePools || 0} pool(s)</span>
              </div>
            </div>
          </motion.div>

          {/* Portee */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-navy" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple/10 flex items-center justify-center"><Eye className="w-5 h-5 text-purple" /></div>
                <TrendingUp className="w-4 h-4 text-green" />
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{fmtShort(k?.reach.estimatedReach || 0)}</div>
              <div className="text-xs font-semibold text-warm-gray">Portee estimee</div>
              <div className="mt-3 text-[10px]">
                <span className="text-purple font-bold">{k?.reach.totalJournalists || 0} journalistes touches</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold" />
                Actions rapides
              </h2>
              {[
                { label: "Nouveau communique", desc: "Rediger et diffuser", icon: FileText, href: "/institution/communiques/new", gradient: "from-gold/20 to-orange/10", iconColor: "text-gold" },
                { label: "Nouvelle salle AGORA", desc: "Conference de presse virtuelle", icon: Video, href: "/institution/agora/new", gradient: "from-orange/20 to-red/10", iconColor: "text-orange" },
                { label: "Creer un fonds FCM", desc: "Couverture mediatique a la preuve", icon: CreditCard, href: "/institution/fcm", gradient: "from-green/20 to-teal/10", iconColor: "text-green" },
                { label: "Publication sociale", desc: "Facebook, Instagram, LinkedIn", icon: Globe, href: "/institution/social/new", gradient: "from-purple/20 to-navy/10", iconColor: "text-purple" },
              ].map((action, i) => (
                <motion.div key={action.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  <Link href={action.href}>
                    <div className={`premium-card p-4 flex items-center gap-4 cursor-pointer group bg-gradient-to-r ${action.gradient}`}>
                      <div className="w-12 h-12 rounded-xl bg-white/80 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-navy text-sm">{action.label}</p>
                        <p className="text-[11px] text-warm-gray">{action.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-warm-gray group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Upcoming AGORA */}
            {data?.upcomingRooms && data.upcomingRooms.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-orange" />
                  Prochaines salles
                </h2>
                <div className="space-y-3">
                  {data.upcomingRooms.map(room => (
                    <div key={room.id} className="premium-card p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${room.status === "LIVE" ? "bg-red badge-live" : "bg-teal"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-navy truncate">{room.title}</p>
                          <p className="text-[10px] text-warm-gray">
                            {room.roomType} — {room._count.participants} invite(s) — {new Date(room.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gold" />
              Activite recente
            </h2>
            <div className="premium-card p-6">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100/80">
                  {data.recentActivity.map((item, i) => {
                    const sc = statusColors[item.status] || statusColors.neutral;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.06 }}
                        className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className={`w-2 h-2 rounded-full ${sc.dot} mt-2 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy text-sm truncate">{item.title}</p>
                          <p className="text-[11px] text-warm-gray mt-0.5">{item.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                            {item.status === "success" ? "Diffuse" : item.status === "live" ? "LIVE" : item.status === "info" ? "Planifie" : "Brouillon"}
                          </span>
                          <p className="text-[10px] text-warm-gray mt-1">
                            {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-lg font-extrabold text-navy mb-2">Bienvenue sur HERALDO !</h3>
                  <p className="text-sm text-warm-gray max-w-md mx-auto mb-6">
                    Commencez par creer votre premier communique de presse ou planifier une salle AGORA pour voir votre activite ici.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/institution/communiques/new">
                      <Button size="sm"><FileText className="w-4 h-4" /> Nouveau communique</Button>
                    </Link>
                    <Link href="/institution/agora/new">
                      <Button size="sm" variant="outline"><Mic className="w-4 h-4" /> Salle AGORA</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modules grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {[
                { label: "Social", icon: Globe, href: "/institution/social", color: "text-purple", bg: "bg-purple/10" },
                { label: "Agenda", icon: Calendar, href: "/institution/agenda", color: "text-teal", bg: "bg-teal/10" },
                { label: "Studio", icon: Sparkles, href: "/institution/studio", color: "text-gold", bg: "bg-gold/10" },
                { label: "Inbox", icon: FileText, href: "/institution/inbox", color: "text-orange", bg: "bg-orange/10" },
                { label: "CRM", icon: Users, href: "/institution/crm", color: "text-navy", bg: "bg-navy/10" },
                { label: "Briefs", icon: ShieldCheck, href: "/institution/briefs", color: "text-green", bg: "bg-green/10" },
              ].map((mod, i) => (
                <motion.div key={mod.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
                  <Link href={mod.href}>
                    <div className="premium-card p-4 text-center cursor-pointer group hover:shadow-lg transition-all">
                      <div className={`w-10 h-10 rounded-xl ${mod.bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <mod.icon className={`w-5 h-5 ${mod.color}`} />
                      </div>
                      <p className="text-xs font-bold text-navy">{mod.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Eye,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Newspaper,
  Users,
  Loader2,
  Sparkles,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const platformConfig: Record<string, { icon: typeof Facebook; gradient: string; color: string; bg: string; brandColor: string }> = {
  Facebook: { icon: Facebook, gradient: "from-[#1877F2] to-[#0D65D9]", color: "text-[#1877F2]", bg: "bg-[#1877F2]/10", brandColor: "#1877F2" },
  Instagram: { icon: Instagram, gradient: "from-[#E4405F] via-[#C13584] to-[#F77737]", color: "text-[#E4405F]", bg: "bg-[#E4405F]/10", brandColor: "#E4405F" },
  LinkedIn: { icon: Linkedin, gradient: "from-[#0A66C2] to-[#004182]", color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", brandColor: "#0A66C2" },
};

const platformIcon = (name: string) => platformConfig[name]?.icon || Globe;

export default function SocialDashboard() {
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [recentPublications, setRecentPublications] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/social/accounts").then((res) => {
        const data = res.data ?? res;
        setConnectedAccounts(Array.isArray(data) ? data : []);
      }).catch(() => {}),
      api.get<any>("/social/posts").then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) {
          setRecentPublications(data.filter((p: any) => p.status === "published"));
          setScheduledPosts(data.filter((p: any) => p.status === "scheduled"));
        }
        if (res.kpis) setKpis(res.kpis);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement social...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Gestion multi-plateforme</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Reseaux Sociaux</h1>
            <p className="text-warm-gray text-sm mt-1">Gerez vos publications et suivez votre audience.</p>
          </div>
          <Link href="/institution/social/new">
            <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouvelle publication
            </button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi: any, i: number) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="premium-card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-navy" />
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${kpi.bg || "bg-purple/10"} flex items-center justify-center`}>
                    {kpi.icon ? <kpi.icon className={`w-5 h-5 ${kpi.color || "text-purple"}`} /> : <BarChart3 className="w-5 h-5 text-purple" />}
                  </div>
                  <TrendingUp className="w-4 h-4 text-green" />
                </div>
                <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
                <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
                {kpi.change && <div className="text-[10px] text-green font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{kpi.change}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Connected Accounts with brand colors */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-4 h-4 text-gold" />
        <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Comptes connectes</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {connectedAccounts.map((account, i) => {
          const pConf = platformConfig[account.platform] || { gradient: "from-navy to-navy-light", color: "text-navy", bg: "bg-navy/10", brandColor: "#0D1B3E" };
          const PIcon = platformIcon(account.platform);
          return (
            <motion.div key={account.platform} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <div className="premium-card overflow-hidden group">
                <div className={`h-16 bg-gradient-to-r ${pConf.gradient} flex items-center px-5 gap-3`}>
                  <PIcon className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm">{account.platform}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-warm-gray truncate">{account.handle}</p>
                      <p className="text-2xl font-extrabold text-navy mt-1">{account.followers}</p>
                      <p className="text-[10px] text-warm-gray font-semibold">Abonnes</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-green" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green">Actif</span>
                    </div>
                  </div>
                  {/* Engagement sparkline (CSS bars) */}
                  <div className="flex items-end gap-0.5 mt-4 h-8">
                    {[40, 65, 55, 80, 70, 90, 60].map((h, idx) => (
                      <div key={idx} className="flex-1 rounded-t" style={{ height: `${h}%`, background: pConf.brandColor, opacity: 0.15 + (idx / 10) }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Publications */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Publications recentes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recentPublications.map((pub, i) => {
              const pConf = platformConfig[pub.platform] || { gradient: "from-navy to-navy-light", color: "text-navy", bg: "bg-navy/10" };
              const PIcon = platformIcon(pub.platform);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <div className="premium-card overflow-hidden cursor-pointer group">
                    <div className="w-full h-28 bg-gradient-to-br from-navy/5 to-gold/10 flex items-center justify-center relative">
                      <Newspaper className="w-10 h-10 text-navy/15" />
                      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full ${pConf.bg}`}>
                        <PIcon className={`w-3 h-3 ${pConf.color}`} />
                        <span className={`text-[10px] font-bold ${pConf.color}`}>{pub.platform}</span>
                      </div>
                      <span className="absolute top-3 right-3 text-[10px] text-warm-gray bg-white/80 px-2 py-0.5 rounded-full">{pub.date}</span>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-navy text-sm mb-3 truncate group-hover:text-gold transition-colors">{pub.title}</p>
                      <div className="flex items-center gap-4 text-xs text-warm-gray">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red/50" /> {pub.likes?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {pub.comments}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {pub.shares}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {recentPublications.length === 0 && (
            <div className="premium-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Aucune publication</h3>
              <p className="text-sm text-warm-gray mb-6">Publiez sur vos reseaux sociaux pour voir les performances ici.</p>
              <Link href="/institution/social/new">
                <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Publier
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Scheduled / Timeline */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Publications planifiees</h2>
          </div>
          <div className="premium-card p-5">
            {scheduledPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gold" />
                </div>
                <p className="text-sm text-warm-gray">Aucune publication planifiee</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gold/20" />
                {scheduledPosts.map((post, i) => {
                  const pConf = platformConfig[post.platform] || { color: "text-navy", bg: "bg-navy/10" };
                  const PIcon = platformIcon(post.platform);
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 z-10 border-2 border-white">
                        <Clock className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-navy truncate">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${pConf.bg} ${pConf.color}`}>
                            <PIcon className="w-3 h-3" /> {post.platform}
                          </span>
                          <span className="text-[10px] text-warm-gray">{post.date}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/10 text-[10px] font-bold uppercase tracking-wider text-teal shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal" /> Planifie
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Loader2,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  diffuse: { label: "DIFFUSE", color: "text-green", bg: "bg-green/10", dot: "bg-green", border: "border-l-green" },
  en_attente: { label: "EN ATTENTE", color: "text-gold", bg: "bg-gold/10", dot: "bg-gold", border: "border-l-gold" },
  brouillon: { label: "BROUILLON", color: "text-warm-gray", bg: "bg-warm-gray/10", dot: "bg-warm-gray", border: "border-l-warm-gray" },
  expire: { label: "EXPIRE", color: "text-red", bg: "bg-red/10", dot: "bg-red", border: "border-l-red" },
};

const formatColors: Record<string, { bg: string; text: string }> = {
  Long: { bg: "bg-navy/10", text: "text-navy" },
  Court: { bg: "bg-gold/10", text: "text-gold-dark" },
  Flash: { bg: "bg-orange/10", text: "text-orange" },
};

export default function CommuniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [communiques, setCommuniques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/communiques")
      .then((res) => setCommuniques(res.data ?? []))
      .catch(() => setCommuniques([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement des communiques...</p>
        </div>
      </div>
    );
  }

  const filtered = communiques.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSent = communiques.filter(c => c.status === "diffuse").length;
  const totalDraft = communiques.filter(c => c.status === "brouillon").length;
  const avgOpenRate = communiques.length > 0
    ? Math.round(communiques.reduce((acc, c) => acc + (parseFloat(c.openRate) || 0), 0) / communiques.length)
    : 0;

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Send className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Gestion des communiques</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Communiques de Presse</h1>
            <p className="text-warm-gray text-sm mt-1">Redigez, diffusez et suivez l&apos;impact de vos communiques.</p>
          </div>
          <Link href="/institution/communiques/new">
            <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau communique
            </button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: communiques.length, gradient: "from-gold to-orange", icon: FileText, iconBg: "bg-gold/10", iconColor: "text-gold" },
          { label: "Diffuses", value: totalSent, gradient: "from-green to-teal", icon: CheckCircle, iconBg: "bg-green/10", iconColor: "text-green" },
          { label: "Brouillons", value: totalDraft, gradient: "from-warm-gray to-warm-gray-light", icon: Clock, iconBg: "bg-warm-gray/10", iconColor: "text-warm-gray" },
          { label: "Taux ouverture moy.", value: `${avgOpenRate}%`, gradient: "from-purple to-navy", icon: Eye, iconBg: "bg-purple/10", iconColor: "text-purple" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                {typeof kpi.value === "number" && kpi.value > 0 && <TrendingUp className="w-4 h-4 text-green" />}
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="premium-card p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="Rechercher un communique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm text-navy placeholder:text-warm-gray/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm text-navy font-semibold"
              >
                <option value="all">Tous les statuts</option>
                <option value="diffuse">Diffuse</option>
                <option value="en_attente">En attente</option>
                <option value="brouillon">Brouillon</option>
                <option value="expire">Expire</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-gold" />
        <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Liste des communiques</h2>
      </div>

      {/* Communiques list */}
      <div className="space-y-3">
        {filtered.map((cp, i) => {
          const cfg = statusConfig[cp.status] || statusConfig.brouillon;
          const fmt = formatColors[cp.format] || { bg: "bg-navy/10", text: "text-navy" };
          return (
            <motion.div
              key={cp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <div className={`premium-card p-5 border-l-4 ${cfg.border} flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer group`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[10px] font-mono text-warm-gray/60">{cp.id}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${fmt.bg} ${fmt.text}`}>
                      {cp.format}
                    </span>
                  </div>
                  <h3 className="font-bold text-navy truncate group-hover:text-gold transition-colors">{cp.title}</h3>
                  <p className="text-xs text-warm-gray mt-1">{cp.date}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center hidden md:block">
                    <div className="text-lg font-extrabold text-navy">{cp.recipients}</div>
                    <div className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Destinataires</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-lg font-extrabold text-navy">{cp.openRate}</div>
                    <div className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Ouverture</div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-gold/10 transition-colors cursor-pointer">
                    <MoreHorizontal className="w-4 h-4 text-warm-gray group-hover:text-gold transition-colors" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="premium-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-serif text-navy mb-2">Aucun communique trouve</h3>
            <p className="text-sm text-warm-gray max-w-md mx-auto mb-6">
              Modifiez vos filtres ou creez votre premier communique de presse pour commencer a informer les medias.
            </p>
            <Link href="/institution/communiques/new">
              <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Creer un communique
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}

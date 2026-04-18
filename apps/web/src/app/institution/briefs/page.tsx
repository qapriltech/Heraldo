"use client";

import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Mic,
  Tv,
  Radio,
  Globe,
  Podcast,
  Clock,
  CheckCircle2,
  Loader2,
  Archive,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type BriefStatus = "draft" | "generating" | "ready" | "used" | "archived";
type MediaType = "press" | "radio" | "tv" | "web" | "podcast";

interface Brief {
  id: string;
  mediaName: string;
  journalistName: string;
  mediaType: MediaType;
  intervieweeName: string;
  intervieweeRole: string;
  topic: string;
  scheduledAt: string;
  status: BriefStatus;
  questionsCount: number;
  keyMessages: string[];
  createdAt: string;
}

const statusConfig: Record<BriefStatus, { label: string; color: string; bg: string; gradient: string; dot: string }> = {
  draft: { label: "Brouillon", color: "text-warm-gray", bg: "bg-warm-gray/10", gradient: "from-warm-gray to-warm-gray-light", dot: "bg-warm-gray" },
  generating: { label: "Generation...", color: "text-gold", bg: "bg-gold/10", gradient: "from-gold to-orange", dot: "bg-gold" },
  ready: { label: "Pret", color: "text-green", bg: "bg-green/10", gradient: "from-green to-teal", dot: "bg-green" },
  used: { label: "Utilise", color: "text-gold-dark", bg: "bg-gold/10", gradient: "from-gold to-orange", dot: "bg-gold-dark" },
  archived: { label: "Archive", color: "text-teal", bg: "bg-teal/10", gradient: "from-teal to-navy", dot: "bg-teal" },
};

const mediaIcon: Record<MediaType, typeof Mic> = {
  press: FileText,
  radio: Radio,
  tv: Tv,
  web: Globe,
  podcast: Podcast,
};

const mediaLabel: Record<MediaType, string> = {
  press: "Presse ecrite",
  radio: "Radio",
  tv: "Television",
  web: "Web",
  podcast: "Podcast",
};

export default function BriefsPage() {
  const [statusFilter, setStatusFilter] = useState<BriefStatus | "all">("all");
  const [mockBriefs, setMockBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/briefs")
      .then((res) => setMockBriefs(res.data ?? []))
      .catch(() => setMockBriefs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement briefs...</p>
        </div>
      </div>
    );
  }

  const filtered = mockBriefs.filter(b => statusFilter === "all" || b.status === statusFilter);
  const readyCount = mockBriefs.filter(b => b.status === "ready").length;
  const generatingCount = mockBriefs.filter(b => b.status === "generating").length;
  const usedCount = mockBriefs.filter(b => b.status === "used").length;

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Propulse par Claude AI</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Briefs d&apos;interview</h1>
            <p className="text-warm-gray text-sm mt-1">Questions probables, reponses suggerees, elements de langage et pieges a eviter.</p>
          </div>
          <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau brief
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Briefs ce mois", value: String(mockBriefs.length), gradient: "from-navy to-purple", icon: FileText, iconBg: "bg-navy/10", iconColor: "text-navy" },
          { label: "Prets", value: String(readyCount), gradient: "from-green to-teal", icon: CheckCircle2, iconBg: "bg-green/10", iconColor: "text-green" },
          { label: "En generation", value: String(generatingCount), gradient: "from-gold to-orange", icon: Loader2, iconBg: "bg-gold/10", iconColor: "text-gold" },
          { label: "Utilises", value: String(usedCount), gradient: "from-orange to-red", icon: Sparkles, iconBg: "bg-orange/10", iconColor: "text-orange" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{s.value}</div>
              <div className="text-[10px] text-warm-gray font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "ready", "generating", "draft", "used", "archived"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${statusFilter === s ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray hover:text-navy border border-navy/10"}`}>
            {s === "all" ? "Tous" : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-gold" />
        <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Briefs generes</h2>
      </div>

      {/* Briefs list */}
      <div className="space-y-4">
        {filtered.map((brief, i) => {
          const sc = statusConfig[brief.status];
          const MediaIcon = mediaIcon[brief.mediaType];

          return (
            <motion.div key={brief.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <div className="premium-card overflow-hidden">
                {/* Status gradient header */}
                <div className={`h-1.5 bg-gradient-to-r ${sc.gradient} ${brief.status === "generating" ? "animate-shimmer" : ""}`} />
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Left -- Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                          <MediaIcon className="w-5 h-5 text-navy/50" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-navy truncate">{brief.mediaName}</p>
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                              {brief.status === "generating" && <Loader2 className="w-3 h-3 animate-spin" />}
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-xs text-warm-gray">{brief.journalistName} -- {mediaLabel[brief.mediaType]}</p>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-navy mb-3">{brief.topic}</p>

                      <div className="flex flex-wrap gap-3 text-[11px] text-warm-gray">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ivory/80">
                          <AlertCircle className="w-3 h-3 text-gold" /> {brief.intervieweeName} -- {brief.intervieweeRole}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ivory/80">
                          <Calendar className="w-3 h-3 text-gold" /> {brief.scheduledAt}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ivory/80">
                          <Clock className="w-3 h-3 text-gold" /> {brief.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Right -- Preview */}
                    <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-navy/5 pt-4 lg:pt-0 lg:pl-5">
                      {brief.questionsCount > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-gold" />
                            <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em]">{brief.questionsCount} questions generees</span>
                          </div>
                          {/* Question preview pills */}
                          <div className="space-y-2 mb-4">
                            <p className="text-[10px] font-extrabold text-navy uppercase tracking-wider">Messages cles :</p>
                            {brief.keyMessages.map((msg, idx) => (
                              <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-gold/5 border border-gold/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                <span className="text-[11px] text-navy/70 leading-tight">{msg}</span>
                              </div>
                            ))}
                          </div>
                          <button className="flex items-center gap-1 text-[11px] font-extrabold text-gold hover:text-gold-dark transition-colors">
                            Voir le brief complet <ChevronRight className="w-3 h-3" />
                          </button>
                        </>
                      ) : brief.status === "generating" ? (
                        <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-3">
                            <Loader2 className="w-6 h-6 text-gold animate-spin" />
                          </div>
                          <p className="text-[11px] font-semibold text-warm-gray">Claude analyse le contexte...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-3">
                            <Sparkles className="w-6 h-6 text-gold" />
                          </div>
                          <p className="text-[11px] text-warm-gray mb-3">Lancez la generation pour obtenir votre brief</p>
                          <button className="gradient-gold text-navy-dark font-bold text-xs px-4 py-2 rounded-2xl shadow-lg">Generer</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="premium-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-serif text-navy mb-2">Aucun brief</h3>
            <p className="text-sm text-warm-gray max-w-md mx-auto mb-6">Creez votre premier brief d&apos;interview pour preparer vos porte-paroles.</p>
            <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Creer un brief
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

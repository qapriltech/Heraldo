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
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
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

const statusConfig: Record<BriefStatus, { label: string; variant: "neutral" | "warning" | "success" | "gold" | "info"; icon: typeof Clock }> = {
  draft: { label: "Brouillon", variant: "neutral", icon: FileText },
  generating: { label: "Generation...", variant: "warning", icon: Loader2 },
  ready: { label: "Pret", variant: "success", icon: CheckCircle2 },
  used: { label: "Utilise", variant: "gold", icon: CheckCircle2 },
  archived: { label: "Archive", variant: "info", icon: Archive },
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const filtered = mockBriefs.filter(b => statusFilter === "all" || b.status === statusFilter);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <p className="text-xs font-extrabold text-gold uppercase tracking-[0.2em]">Propulse par Claude AI</p>
            </div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Briefs d&apos;interview</h1>
            <p className="text-warm-gray text-sm mt-1">Questions probables, reponses suggerees, elements de langage et pieges a eviter.</p>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Nouveau brief
          </Button>
        </div>
      </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Briefs ce mois", value: "7", color: "text-navy" },
            { label: "Prets", value: "4", color: "text-green" },
            { label: "En generation", value: "1", color: "text-orange" },
            { label: "Utilises", value: "2", color: "text-gold" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover={false} padding="sm">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-warm-gray font-medium uppercase tracking-wider">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "ready", "generating", "draft", "used", "archived"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-navy text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"}`}>
              {s === "all" ? "Tous" : statusConfig[s].label}
            </button>
          ))}
        </div>

        {/* Briefs list */}
        <div className="space-y-4">
          {filtered.map((brief, i) => {
            const sc = statusConfig[brief.status];
            const StatusIcon = sc.icon;
            const MediaIcon = mediaIcon[brief.mediaType];

            return (
              <motion.div key={brief.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="overflow-hidden">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Left — Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                          <MediaIcon className="w-5 h-5 text-navy/50" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-navy truncate">{brief.mediaName}</p>
                            <Badge variant={sc.variant} dot>
                              {brief.status === "generating" && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                              {sc.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-warm-gray">
                            {brief.journalistName} — {mediaLabel[brief.mediaType]}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-navy mb-2">{brief.topic}</p>

                      <div className="flex flex-wrap gap-3 text-[11px] text-warm-gray">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {brief.intervieweeName} — {brief.intervieweeRole}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {brief.scheduledAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {brief.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Right — Preview */}
                    <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-navy/5 pt-4 lg:pt-0 lg:pl-5">
                      {brief.questionsCount > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-gold" />
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{brief.questionsCount} questions generees</span>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            <p className="text-[10px] font-bold text-navy uppercase tracking-wider">Messages cles :</p>
                            {brief.keyMessages.map((msg, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                                <span className="text-[11px] text-warm-gray leading-tight">{msg}</span>
                              </div>
                            ))}
                          </div>
                          <button className="flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-dark transition-colors">
                            Voir le brief complet <ChevronRight className="w-3 h-3" />
                          </button>
                        </>
                      ) : brief.status === "generating" ? (
                        <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                          <Loader2 className="w-6 h-6 text-gold animate-spin mb-2" />
                          <p className="text-[11px] text-warm-gray">Claude analyse le contexte...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                          <Sparkles className="w-6 h-6 text-navy/20 mb-2" />
                          <p className="text-[11px] text-warm-gray">Lancez la generation pour obtenir votre brief</p>
                          <Button size="sm" variant="outline" className="mt-2">Generer</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
    </>
  );
}

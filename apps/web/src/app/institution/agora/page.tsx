"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Video,
  Calendar,
  Users,
  Clock,
  Play,
  CheckCircle,
  MoreHorizontal,
  Loader2,
  Mic,
  Sparkles,
  TrendingUp,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const typeGradients: Record<string, { gradient: string; bg: string; text: string }> = {
  Standard: { gradient: "from-navy to-navy-light", bg: "bg-navy/10", text: "text-navy" },
  Premium: { gradient: "from-gold to-orange", bg: "bg-gold/10", text: "text-gold-dark" },
  Nationale: { gradient: "from-purple to-navy", bg: "bg-purple/10", text: "text-purple" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  upcoming: { label: "A VENIR", color: "text-teal", bg: "bg-teal/10", dot: "bg-teal" },
  live: { label: "EN DIRECT", color: "text-red", bg: "bg-red/10", dot: "bg-red" },
  completed: { label: "TERMINEE", color: "text-warm-gray", bg: "bg-warm-gray/10", dot: "bg-warm-gray" },
};

export default function AgoraPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/agora/rooms")
      .then((res) => setRooms(res.data ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  const liveCount = rooms.filter(r => r.status === "live").length;
  const upcomingCount = rooms.filter(r => r.status === "upcoming").length;
  const totalJournalists = rooms.reduce((acc, r) => acc + (r.journalists || 0), 0);

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Salles de presse virtuelles</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">AGORA</h1>
            <p className="text-warm-gray text-sm mt-1">Conferences de presse virtuelles et debats en direct.</p>
          </div>
          <Link href="/institution/agora/new">
            <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle salle
            </button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Salles totales", value: rooms.length, gradient: "from-gold to-orange", icon: Video, iconBg: "bg-gold/10", iconColor: "text-gold" },
          { label: "A venir", value: upcomingCount, gradient: "from-teal to-green", icon: Calendar, iconBg: "bg-teal/10", iconColor: "text-teal" },
          { label: "Journalistes invites", value: totalJournalists, gradient: "from-purple to-navy", icon: Users, iconBg: "bg-purple/10", iconColor: "text-purple" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.value > 0 && <TrendingUp className="w-4 h-4 text-green" />}
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{stat.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* LIVE banner */}
      {liveCount > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <div className="premium-card p-4 bg-gradient-to-r from-red/5 to-orange/5 border-red/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center badge-live">
              <Radio className="w-5 h-5 text-red" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-extrabold text-red">{liveCount} salle{liveCount > 1 ? "s" : ""} en direct</span>
              <p className="text-xs text-warm-gray">Des conferences sont actuellement en cours.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-4 h-4 text-gold" />
        <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Toutes les salles</h2>
      </div>

      {/* Rooms grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, i) => {
          const cfg = statusConfig[room.status] || statusConfig.upcoming;
          const typeConf = typeGradients[room.type] || typeGradients.Standard;
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div className="premium-card overflow-hidden group cursor-pointer">
                {/* Type gradient header */}
                <div className={`h-20 bg-gradient-to-r ${typeConf.gradient} relative flex items-end p-4`}>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{room.type}</span>
                  {room.status === "live" && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red text-white text-[10px] font-extrabold badge-live">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy truncate mb-2 group-hover:text-gold transition-colors">{room.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-warm-gray mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {room.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {room.duration}</span>
                  </div>

                  {/* Participant avatars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(room.journalists || 0, 4) }).map((_, idx) => (
                          <div key={idx} className="w-7 h-7 rounded-full bg-gradient-to-br from-navy/20 to-gold/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-navy/50">
                            J{idx + 1}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-warm-gray">{room.journalists} journalistes</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${room.status === "live" ? "animate-pulse" : ""}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  {room.status === "live" ? (
                    <Link href={`/institution/agora/${room.id}/live`} className="block">
                      <button className="w-full gradient-gold text-navy-dark font-bold text-sm py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" /> Rejoindre
                      </button>
                    </Link>
                  ) : room.status === "upcoming" ? (
                    <Link href={`/institution/agora/${room.id}/live`} className="block">
                      <button className="w-full bg-navy/5 text-navy font-bold text-sm py-2.5 rounded-2xl hover:bg-navy/10 transition-all flex items-center justify-center gap-2">
                        Gerer la salle
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full bg-warm-gray/5 text-warm-gray font-bold text-sm py-2.5 rounded-2xl flex items-center justify-center gap-2" disabled>
                      <CheckCircle className="w-4 h-4" /> Terminee
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {rooms.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="premium-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-serif text-navy mb-2">Aucune salle AGORA</h3>
            <p className="text-sm text-warm-gray max-w-md mx-auto mb-6">
              Creez votre premiere salle de conference de presse virtuelle pour interagir avec les journalistes en direct.
            </p>
            <Link href="/institution/agora/new">
              <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Creer une salle
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </>
  );
}

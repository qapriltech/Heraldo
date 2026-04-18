"use client";

import { motion } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Flag,
  Star,
  AlertTriangle,
  Mic,
  Users,
  Zap,
  MessageSquare,
  Sparkles,
  Loader2,
  Flame,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type EventType = "inauguration" | "conference" | "reaction" | "crise" | "interview" | "communique";
type Priority = "low" | "medium" | "high" | "critical";

interface AgendaEvent {
  id: string;
  title: string;
  date: number;
  time: string;
  type: EventType;
  priority: Priority;
  description: string;
}

const eventTypeConfig: Record<EventType, { label: string; color: string; bg: string; border: string; icon: typeof Mic }> = {
  inauguration: { label: "Inauguration", color: "text-gold-dark", bg: "bg-gold/15", border: "border-l-gold", icon: Star },
  conference: { label: "Conference", color: "text-teal", bg: "bg-teal/15", border: "border-l-teal", icon: Users },
  reaction: { label: "Reaction", color: "text-orange", bg: "bg-orange/15", border: "border-l-orange", icon: Zap },
  crise: { label: "Crise", color: "text-red", bg: "bg-red/15", border: "border-l-red", icon: AlertTriangle },
  interview: { label: "Interview", color: "text-purple", bg: "bg-purple/15", border: "border-l-purple", icon: Mic },
  communique: { label: "Communique", color: "text-green", bg: "bg-green/15", border: "border-l-green", icon: MessageSquare },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; flames: number }> = {
  low: { label: "Faible", color: "text-warm-gray", bg: "bg-warm-gray/10", flames: 0 },
  medium: { label: "Moyen", color: "text-teal", bg: "bg-teal/10", flames: 0 },
  high: { label: "Eleve", color: "text-orange", bg: "bg-orange/10", flames: 1 },
  critical: { label: "Critique", color: "text-red", bg: "bg-red/10", flames: 2 },
};

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState(14);
  const currentMonth = "Avril 2026";
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [suggestions, setSuggestions] = useState<{ date: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/agenda/items").then((res) => setEvents(res.data ?? [])).catch(() => {}),
      api.get<any>("/agenda/recurring-suggestions").then((res) => setSuggestions(res.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const daysInMonth = 30;
  const startOffset = 2;
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const eventsForDay = events.filter((e) => e.date === selectedDay);
  const eventDays = new Set(events.map((e) => e.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Planification editoriale</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Agenda Editorial</h1>
            <p className="text-warm-gray text-sm mt-1">Planifiez et coordonnez votre communication institutionnelle.</p>
          </div>
          <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel evenement
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="premium-card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
              <div className="flex items-center justify-between mb-6">
                <button className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-navy" />
                </button>
                <h2 className="text-xl font-serif text-navy flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gold" />
                  {currentMonth}
                </h2>
                <button className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-navy" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((d) => (
                  <div key={d} className="text-center text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="h-16" />;
                  const hasEvents = eventDays.has(day);
                  const isSelected = day === selectedDay;
                  const isToday = day === 12;
                  const dayEvents = events.filter((e) => e.date === day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "gradient-gold text-navy-dark shadow-lg"
                          : isToday
                            ? "bg-gold/15 text-navy font-bold ring-2 ring-gold/30"
                            : "hover:bg-navy/5 text-navy"
                      }`}
                    >
                      <span className="text-sm font-semibold">{day}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5">
                          {dayEvents.slice(0, 3).map((evt, idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-navy-dark/50" :
                                evt.type === "crise" ? "bg-red" :
                                evt.type === "inauguration" ? "bg-gold" :
                                evt.type === "conference" ? "bg-teal" :
                                evt.type === "interview" ? "bg-purple" :
                                "bg-orange"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Dates cles a venir</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.05 }}>
                  <div className="premium-card p-4 flex items-center gap-3 cursor-pointer group border-l-4 border-l-gold">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy truncate group-hover:text-gold transition-colors">{s.title}</p>
                      <p className="text-[10px] text-warm-gray">{s.date}</p>
                    </div>
                    <button className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-gold" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {suggestions.length === 0 && (
                <div className="col-span-2 premium-card p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-gold" />
                  </div>
                  <p className="text-sm text-warm-gray">Aucune suggestion pour le moment.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Side Panel - Events for Selected Day */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">{selectedDay} {currentMonth.split(" ")[0]}</h2>
          </div>
          {eventsForDay.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="premium-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-sm font-serif text-navy mb-2">Aucun evenement ce jour</h3>
                <p className="text-xs text-warm-gray mb-4">Ajoutez un evenement pour organiser votre communication.</p>
                <button className="gradient-gold text-navy-dark font-bold text-xs px-4 py-2 rounded-2xl shadow-lg inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {eventsForDay.map((event, i) => {
                const typeConf = eventTypeConfig[event.type];
                const prioConf = priorityConfig[event.priority];
                const TypeIcon = typeConf.icon;
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                    <div className={`premium-card p-4 border-l-4 ${typeConf.border} cursor-pointer group`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${typeConf.bg} flex items-center justify-center shrink-0`}>
                          <TypeIcon className={`w-4 h-4 ${typeConf.color}`} />
                        </div>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${prioConf.bg} ${prioConf.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${prioConf.color === "text-red" ? "bg-red" : prioConf.color === "text-orange" ? "bg-orange" : prioConf.color === "text-teal" ? "bg-teal" : "bg-warm-gray"}`} />
                          {prioConf.label}
                        </span>
                        {prioConf.flames > 0 && (
                          <span className="text-sm">{Array.from({ length: prioConf.flames }).map(() => "\uD83D\uDD25").join("")}</span>
                        )}
                      </div>
                      <p className="font-bold text-navy text-sm mb-1 group-hover:text-gold transition-colors">{event.title}</p>
                      <p className="text-xs text-warm-gray mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-warm-gray">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${typeConf.bg} ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

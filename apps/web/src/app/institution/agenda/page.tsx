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
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type EventType =
  | "inauguration"
  | "conference"
  | "reaction"
  | "crise"
  | "interview"
  | "communique";
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

const eventTypeConfig: Record<
  EventType,
  { label: string; color: string; bg: string; icon: typeof Mic }
> = {
  inauguration: {
    label: "Inauguration",
    color: "text-gold-dark",
    bg: "bg-gold/15",
    icon: Star,
  },
  conference: {
    label: "Conference",
    color: "text-blue-600",
    bg: "bg-blue-500/15",
    icon: Users,
  },
  reaction: {
    label: "Reaction",
    color: "text-orange",
    bg: "bg-orange/15",
    icon: Zap,
  },
  crise: {
    label: "Crise",
    color: "text-red",
    bg: "bg-red/15",
    icon: AlertTriangle,
  },
  interview: {
    label: "Interview",
    color: "text-purple",
    bg: "bg-purple/15",
    icon: Mic,
  },
  communique: {
    label: "Communique",
    color: "text-green",
    bg: "bg-green/15",
    icon: MessageSquare,
  },
};

const priorityConfig: Record<
  Priority,
  { label: string; variant: "neutral" | "info" | "warning" | "error" }
> = {
  low: { label: "Faible", variant: "neutral" },
  medium: { label: "Moyen", variant: "info" },
  high: { label: "Eleve", variant: "warning" },
  critical: { label: "Critique", variant: "error" },
};

const defaultEvents: AgendaEvent[] = [];
const defaultSuggestions: { date: string; title: string }[] = [];

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState(14);
  const currentMonth = "Avril 2026";
  const [events, setEvents] = useState<AgendaEvent[]>(defaultEvents);
  const [suggestions, setSuggestions] = useState<{ date: string; title: string }[]>(defaultSuggestions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/agenda/items").then((res) => setEvents(res.data ?? [])).catch(() => {}),
      api.get<any>("/agenda/recurring-suggestions").then((res) => setSuggestions(res.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Build calendar grid for April 2026 (starts on Wednesday)
  const daysInMonth = 30;
  const startOffset = 2; // Wednesday = index 2
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const eventsForDay = events.filter((e) => e.date === selectedDay);
  const eventDays = new Set(events.map((e) => e.date));

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Agenda Editorial</h1>
            <p className="text-warm-gray text-sm mt-1">Planifiez et coordonnez votre communication institutionnelle.</p>
          </div>
          <Button>
            <Plus className="w-4 h-4" />
            Nouvel evenement
          </Button>
        </div>
      </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <ChevronLeft className="w-4 h-4 text-navy" />
                  </button>
                  <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold" />
                    {currentMonth}
                  </h2>
                  <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <ChevronRight className="w-4 h-4 text-navy" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-semibold text-warm-gray py-2"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="h-16" />;
                    }
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
                            ? "bg-navy text-white shadow-md"
                            : isToday
                              ? "bg-gold/15 text-navy font-bold"
                              : "hover:bg-gray-100 text-navy"
                        }`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {hasEvents && (
                          <div className="flex gap-0.5">
                            {dayEvents.slice(0, 3).map((evt, idx) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? "bg-gold"
                                    : evt.type === "crise"
                                      ? "bg-red"
                                      : evt.type === "inauguration"
                                        ? "bg-gold"
                                        : evt.type === "conference"
                                          ? "bg-blue-500"
                                          : "bg-orange"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Dates cles a venir
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                  >
                    <Card padding="sm" className="flex items-center gap-3 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">
                          {s.title}
                        </p>
                        <p className="text-xs text-warm-gray">{s.date}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Side Panel - Events for Selected Day */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-gold" />
              {selectedDay} {currentMonth.split(" ")[0]}
            </h2>
            {eventsForDay.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card hover={false}>
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-warm-gray/30 mx-auto mb-3" />
                    <p className="text-sm text-warm-gray">
                      Aucun evenement ce jour
                    </p>
                    <Button variant="ghost" size="sm" className="mt-3">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {eventsForDay.map((event, i) => {
                  const typeConf = eventTypeConfig[event.type];
                  const prioConf = priorityConfig[event.priority];
                  const TypeIcon = typeConf.icon;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <Card padding="sm" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg ${typeConf.bg} flex items-center justify-center shrink-0`}
                          >
                            <TypeIcon
                              className={`w-4 h-4 ${typeConf.color}`}
                            />
                          </div>
                          <Badge variant={prioConf.variant} dot>
                            {prioConf.label}
                          </Badge>
                        </div>
                        <p className="font-semibold text-navy text-sm mb-1">
                          {event.title}
                        </p>
                        <p className="text-xs text-warm-gray mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-warm-gray">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeConf.bg} ${typeConf.color}`}
                          >
                            {typeConf.label}
                          </span>
                        </div>
                      </Card>
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

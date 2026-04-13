"use client";

import { motion } from "framer-motion";
import {
  Newspaper,
  ArrowLeft,
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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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

const events: AgendaEvent[] = [
  {
    id: "1",
    title: "Inauguration Pont Henri Konan Bedie",
    date: 14,
    time: "09:00",
    type: "inauguration",
    priority: "high",
    description: "Ceremonie officielle avec le PM. Couverture media complete.",
  },
  {
    id: "2",
    title: "Conference presse Q1 2026",
    date: 14,
    time: "14:00",
    type: "conference",
    priority: "high",
    description: "Presentation des resultats economiques du premier trimestre.",
  },
  {
    id: "3",
    title: "Interview RFI - Reforme fiscale",
    date: 16,
    time: "10:30",
    type: "interview",
    priority: "medium",
    description:
      "Interview en direct avec Marie Dupont sur la nouvelle reforme.",
  },
  {
    id: "4",
    title: "Reaction - Rapport FMI",
    date: 18,
    time: "08:00",
    type: "reaction",
    priority: "critical",
    description:
      "Communique de reaction suite a la publication du rapport FMI.",
  },
  {
    id: "5",
    title: "Communique budget 2027",
    date: 20,
    time: "11:00",
    type: "communique",
    priority: "medium",
    description: "Envoi du communique sur les orientations budgetaires 2027.",
  },
  {
    id: "6",
    title: "Gestion crise - Greve portuaire",
    date: 22,
    time: "07:00",
    type: "crise",
    priority: "critical",
    description: "Plan de communication de crise activable.",
  },
  {
    id: "7",
    title: "Inauguration usine textile Bouake",
    date: 25,
    time: "10:00",
    type: "inauguration",
    priority: "medium",
    description: "Visite officielle et discours du Ministre.",
  },
  {
    id: "8",
    title: "Conference investisseurs UEMOA",
    date: 28,
    time: "09:00",
    type: "conference",
    priority: "high",
    description: "Forum annuel des investisseurs de la zone UEMOA.",
  },
];

const suggestions = [
  { date: "17 avr", title: "Journee mondiale de la lutte contre le paludisme" },
  { date: "25 avr", title: "Fete du travail - preparation" },
  { date: "1 mai", title: "Fete du travail" },
  { date: "7 mai", title: "Anniversaire independance (preparation)" },
];

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState(14);
  const currentMonth = "Avril 2026";

  // Build calendar grid for April 2026 (starts on Wednesday)
  const daysInMonth = 30;
  const startOffset = 2; // Wednesday = index 2
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const eventsForDay = events.filter((e) => e.date === selectedDay);
  const eventDays = new Set(events.map((e) => e.date));

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <span className="text-sm text-warm-gray ml-2 hidden sm:inline">
              | Agenda Editorial
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/institution/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Tableau de bord
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
              IN
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-navy mb-1">
              Agenda Editorial
            </h1>
            <p className="text-warm-gray">
              Planifiez et coordonnez votre communication institutionnelle.
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4" />
            Nouvel evenement
          </Button>
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
      </main>
    </div>
  );
}

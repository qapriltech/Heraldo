"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Clock,
  Mic,
  Users,
  AlertCircle,
  User,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type EventType = "agora" | "interview" | "deadline" | "personal";

interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  institution?: string;
  description?: string;
}

const eventColors: Record<EventType, { dot: string; bg: string; label: string; badge: "warning" | "info" | "error" | "neutral" }> = {
  agora: { dot: "bg-orange", bg: "bg-orange/10", label: "AGORA", badge: "warning" },
  interview: { dot: "bg-blue-500", bg: "bg-blue-500/10", label: "Interview", badge: "info" },
  deadline: { dot: "bg-red", bg: "bg-red-pale", label: "Deadline", badge: "error" },
  personal: { dot: "bg-warm-gray", bg: "bg-warm-gray/10", label: "Personnel", badge: "neutral" },
};

const MONTHS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", type: "personal" as EventType, description: "" });

  useEffect(() => {
    api.get<any>("/journalist-agenda/items")
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({ day: d, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredEvents = useMemo(() => {
    if (selectedDate) return events.filter(e => e.date === selectedDate);
    const today = new Date();
    if (filter === "today") return events.filter(e => e.date === todayStr);
    if (filter === "week") {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return events.filter(e => {
        const d = new Date(e.date);
        return d >= today && d <= weekEnd;
      });
    }
    return events;
  }, [events, selectedDate, filter, todayStr]);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    const created: AgendaEvent = { ...newEvent, id: `temp-${Date.now()}` };
    setEvents(prev => [...prev, created]);
    setShowModal(false);
    setNewEvent({ title: "", date: "", time: "", type: "personal", description: "" });
    try {
      await api.post("/journalist-agenda/items", newEvent);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Agenda</h1>
          <p className="text-warm-gray text-sm mt-1">Votre calendrier presse personnel.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange hover:bg-orange-light text-white">
          <Plus className="w-4 h-4" /> Creer un evenement
        </Button>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {(Object.entries(eventColors) as [EventType, typeof eventColors.agora][]).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            <span className="text-xs font-medium text-navy">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "all" as const, label: "Tout" },
          { key: "today" as const, label: "Aujourd'hui" },
          { key: "week" as const, label: "7 prochains jours" },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setSelectedDate(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === f.key && !selectedDate ? "bg-orange text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card hover={false}>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-navy" />
              </button>
              <h2 className="text-lg font-bold text-navy">{MONTHS[month]} {year}</h2>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-navy" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-warm-gray uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      !cell.isCurrentMonth ? "opacity-30" : ""
                    } ${isSelected ? "bg-orange text-white ring-2 ring-orange/30" : isToday ? "bg-orange/10 text-orange font-bold" : "hover:bg-navy/5"}`}
                  >
                    <span className={`text-sm ${isSelected ? "font-extrabold" : "font-medium"} ${!isSelected ? "text-navy" : ""}`}>
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, j) => (
                          <span key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : eventColors[e.type]?.dot ?? "bg-warm-gray"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side panel - events for selected day */}
        <div>
          <h2 className="text-sm font-bold text-navy mb-4">
            {selectedDate
              ? `Evenements du ${new Date(selectedDate + "T00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`
              : filter === "today"
                ? "Evenements aujourd'hui"
                : filter === "week"
                  ? "7 prochains jours"
                  : "Tous les evenements"}
          </h2>
          <div className="space-y-3">
            {filteredEvents.length > 0 ? filteredEvents.map((event, i) => {
              const cfg = eventColors[event.type] ?? eventColors.personal;
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card padding="sm">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        {event.type === "agora" ? <Mic className="w-5 h-5 text-orange" /> :
                         event.type === "interview" ? <Users className="w-5 h-5 text-blue-500" /> :
                         event.type === "deadline" ? <AlertCircle className="w-5 h-5 text-red" /> :
                         <User className="w-5 h-5 text-warm-gray" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={cfg.badge}>{cfg.label}</Badge>
                          {event.type === "agora" && <Badge variant="gold" dot>AGORA</Badge>}
                        </div>
                        <p className="text-sm font-semibold text-navy">{event.title}</p>
                        {event.institution && <p className="text-xs text-warm-gray">{event.institution}</p>}
                        <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray">
                          <Clock className="w-3 h-3" />
                          <span>{event.date} {event.time && `- ${event.time}`}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            }) : (
              <Card hover={false}>
                <p className="text-sm text-warm-gray text-center py-4">Aucun evenement</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy">Nouvel evenement</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center hover:bg-navy/10 cursor-pointer">
                  <X className="w-4 h-4 text-navy" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-warm-gray">Titre</label>
                  <input type="text" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Titre de l'evenement" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-warm-gray">Date</label>
                    <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-warm-gray">Heure</label>
                    <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-warm-gray">Type</label>
                  <div className="flex gap-2 mt-1">
                    {(["personal", "interview", "deadline"] as EventType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setNewEvent(p => ({ ...p, type: t }))}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          newEvent.type === t ? "bg-orange text-white" : "bg-navy/5 text-navy/60"
                        }`}
                      >
                        {eventColors[t].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-warm-gray">Description</label>
                  <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Description optionnelle..." className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm resize-none" />
                </div>
                <Button onClick={handleCreateEvent} className="w-full bg-orange hover:bg-orange-light text-white">
                  Creer l&apos;evenement
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

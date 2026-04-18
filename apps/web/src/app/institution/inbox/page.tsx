"use client";

import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Search,
  Reply,
  UserPlus,
  Archive,
  Clock,
  Inbox,
  Loader2,
  Sparkles,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Channel = "gmail" | "whatsapp" | "outlook" | "web";
type MsgCategory = "interview" | "info" | "invitation" | "reclamation";
type Priority = "urgent" | "high" | "medium" | "low";
type StatusFilter = "all" | "unread" | "urgent" | "archived";

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  channel: Channel;
  category: MsgCategory;
  priority: Priority;
  time: string;
  read: boolean;
  archived: boolean;
}

const channelConfig: Record<Channel, { label: string; color: string; bg: string }> = {
  gmail: { label: "Gmail", color: "text-red", bg: "bg-red/10" },
  whatsapp: { label: "WhatsApp", color: "text-green", bg: "bg-green/10" },
  outlook: { label: "Outlook", color: "text-[#0078D4]", bg: "bg-[#0078D4]/10" },
  web: { label: "Web", color: "text-purple", bg: "bg-purple/10" },
};

const categoryConfig: Record<MsgCategory, { label: string; color: string; bg: string }> = {
  interview: { label: "Interview", color: "text-gold-dark", bg: "bg-gold/10" },
  info: { label: "Info", color: "text-teal", bg: "bg-teal/10" },
  invitation: { label: "Invitation", color: "text-orange", bg: "bg-orange/10" },
  reclamation: { label: "Reclamation", color: "text-warm-gray", bg: "bg-warm-gray/10" },
};

const priorityConfig: Record<Priority, { color: string; border: string; dot: string }> = {
  urgent: { color: "text-red", border: "border-l-red", dot: "bg-red" },
  high: { color: "text-orange", border: "border-l-orange", dot: "bg-orange" },
  medium: { color: "text-teal", border: "border-l-teal", dot: "bg-teal" },
  low: { color: "text-warm-gray-light", border: "border-l-warm-gray-light", dot: "bg-warm-gray-light" },
};

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/inbox/messages").then((res) => {
        const data = res.data ?? [];
        setMessages(data);
        if (data.length > 0) setSelectedMessage(data[0].id);
      }).catch(() => {}),
      api.get<any>("/inbox/stats").then((res) => setStats(res.data ?? res)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement inbox...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read).length;
  const urgentCount = messages.filter(m => m.priority === "urgent").length;

  const statusFilters: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "all", label: "Tous", count: messages.length },
    { id: "unread", label: "Non lus", count: unreadCount },
    { id: "urgent", label: "Urgent", count: urgentCount },
    { id: "archived", label: "Archives" },
  ];

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === "unread") return !m.read;
    if (activeFilter === "urgent") return m.priority === "urgent";
    if (activeFilter === "archived") return m.archived;
    return !m.archived;
  });

  const selected = messages.find((m) => m.id === selectedMessage);

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Inbox className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Centre de messages</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Boite de reception</h1>
            <p className="text-warm-gray text-sm mt-1">Tous vos messages centralises en un seul endroit.</p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/10">
              <Bell className="w-4 h-4 text-gold" />
              <span className="text-sm font-extrabold text-gold">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Status Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeFilter === f.id
                ? "gradient-gold text-navy-dark shadow-lg"
                : "bg-white text-warm-gray hover:text-navy border border-navy/10"
            }`}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                activeFilter === f.id ? "bg-navy-dark/20 text-navy-dark" : "bg-navy/10 text-navy"
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un message, un expediteur..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-navy/10 bg-white text-sm text-navy placeholder:text-warm-gray/50"
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {filteredMessages.map((msg, i) => {
              const chConf = channelConfig[msg.channel];
              const catConf = categoryConfig[msg.category];
              const prioConf = priorityConfig[msg.priority];
              const isActive = selectedMessage === msg.id;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <button
                    onClick={() => setSelectedMessage(msg.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer border-l-4 ${prioConf.border} ${
                      isActive ? "premium-card shadow-lg border-l-4" : "bg-white hover:bg-ivory/50"
                    } ${!msg.read ? "bg-gold/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 shrink-0">
                        <span className={`block w-2.5 h-2.5 rounded-full ${prioConf.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-sm truncate ${!msg.read ? "font-extrabold text-navy" : "font-medium text-navy/60"}`}>
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-warm-gray whitespace-nowrap">{msg.time}</span>
                        </div>
                        <p className={`text-sm truncate mb-2 ${!msg.read ? "font-bold text-navy" : "text-navy/50"}`}>{msg.subject}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${chConf.bg} ${chConf.color}`}>
                            {chConf.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${catConf.bg} ${catConf.color}`}>
                            {catConf.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="premium-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-sm font-serif text-navy mb-2">Aucun message</h3>
                <p className="text-xs text-warm-gray">Votre boite de reception est vide pour ce filtre.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="premium-card p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  selected.priority === "urgent" ? "from-red to-orange" :
                  selected.priority === "high" ? "from-orange to-gold" :
                  selected.priority === "medium" ? "from-teal to-green" :
                  "from-warm-gray to-warm-gray-light"
                }`} />
                <div className="flex items-start justify-between mb-5 pb-4 border-b border-navy/5">
                  <div>
                    <h2 className="text-xl font-serif text-navy mb-2">{selected.subject}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold text-warm-gray">{selected.sender}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${channelConfig[selected.channel].bg} ${channelConfig[selected.channel].color}`}>
                        {channelConfig[selected.channel].label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${categoryConfig[selected.category].bg} ${categoryConfig[selected.category].color}`}>
                        {categoryConfig[selected.category].label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${priorityConfig[selected.priority].dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${priorityConfig[selected.priority].color}`}>{selected.priority}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-warm-gray flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5" /> {selected.time}
                  </p>
                  <div className="bg-ivory/50 rounded-2xl p-5 border border-navy/5">
                    <p className="text-sm text-navy leading-relaxed">{selected.preview}</p>
                    <p className="text-sm text-navy leading-relaxed mt-3">
                      Nous restons a votre disposition pour convenir d&apos;un creneau. Cordialement.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="gradient-gold text-navy-dark font-bold text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Reply className="w-4 h-4" /> Repondre
                  </button>
                  <button className="bg-navy/5 text-navy font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-navy/10 transition-all flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Assigner
                  </button>
                  <button className="text-warm-gray font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-warm-gray/10 transition-all flex items-center gap-2">
                    <Archive className="w-4 h-4" /> Archiver
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="premium-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Selectionnez un message</h3>
              <p className="text-sm text-warm-gray">Cliquez sur un message dans la liste pour le consulter.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

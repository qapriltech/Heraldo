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
  AlertCircle,
  Inbox,
  Filter,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
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
  outlook: { label: "Outlook", color: "text-blue-600", bg: "bg-blue-500/10" },
  web: { label: "Web", color: "text-purple", bg: "bg-purple/10" },
};

const categoryConfig: Record<MsgCategory, { label: string; variant: "gold" | "info" | "warning" | "neutral" }> = {
  interview: { label: "Demande interview", variant: "gold" },
  info: { label: "Demande info", variant: "info" },
  invitation: { label: "Invitation", variant: "warning" },
  reclamation: { label: "Reclamation", variant: "neutral" },
};

const priorityColors: Record<Priority, string> = {
  urgent: "bg-red",
  high: "bg-orange",
  medium: "bg-blue-500",
  low: "bg-warm-gray-light",
};

const defaultStatusFilters: { id: StatusFilter; label: string; count?: number }[] = [
  { id: "all", label: "Tous" },
  { id: "unread", label: "Non lus" },
  { id: "urgent", label: "Urgent" },
  { id: "archived", label: "Archives" },
];

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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const statusFilters: { id: StatusFilter; label: string; count?: number }[] = [
    { id: "all", label: "Tous", count: messages.length },
    { id: "unread", label: "Non lus", count: messages.filter(m => !m.read).length },
    { id: "urgent", label: "Urgent", count: messages.filter(m => m.priority === "urgent").length },
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Boite de reception</h1>
        <p className="text-warm-gray text-sm mt-1">Tous vos messages centralises en un seul endroit.</p>
      </motion.div>

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeFilter === f.id
                  ? "bg-navy text-white shadow-md"
                  : "bg-white text-warm-gray hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span
                  className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                    activeFilter === f.id
                      ? "bg-gold text-navy-dark"
                      : "bg-gray-200 text-warm-gray"
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un message, un expediteur..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-navy placeholder:text-warm-gray/50"
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
                const isActive = selectedMessage === msg.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                  >
                    <button
                      onClick={() => setSelectedMessage(msg.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? "glass-card border-gold/30 shadow-md"
                          : "bg-white border-transparent hover:bg-gray-50"
                      } ${!msg.read ? "border-l-4 border-l-gold" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <span
                            className={`block w-2.5 h-2.5 rounded-full ${priorityColors[msg.priority]}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-sm truncate ${!msg.read ? "font-bold text-navy" : "font-medium text-navy/70"}`}
                            >
                              {msg.sender}
                            </span>
                            <span className="text-[10px] text-warm-gray whitespace-nowrap">
                              {msg.time}
                            </span>
                          </div>
                          <p
                            className={`text-sm truncate mb-1.5 ${!msg.read ? "font-semibold text-navy" : "text-navy/60"}`}
                          >
                            {msg.subject}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${chConf.bg} ${chConf.color}`}
                            >
                              {chConf.label}
                            </span>
                            <Badge variant={catConf.variant}>
                              {catConf.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hover={false}>
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-lg font-bold text-navy mb-1">
                        {selected.subject}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-warm-gray">
                          {selected.sender}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${channelConfig[selected.channel].bg} ${channelConfig[selected.channel].color}`}
                        >
                          {channelConfig[selected.channel].label}
                        </span>
                        <Badge variant={categoryConfig[selected.category].variant}>
                          {categoryConfig[selected.category].label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${priorityColors[selected.priority]}`}
                      />
                      <span className="text-xs text-warm-gray capitalize">
                        {selected.priority}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-warm-gray flex items-center gap-2 mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      {selected.time}
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-navy leading-relaxed">
                        {selected.preview}
                      </p>
                      <p className="text-sm text-navy leading-relaxed mt-3">
                        Nous restons a votre disposition pour convenir d&apos;un
                        creneau. Cordialement.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">
                      <Reply className="w-4 h-4" />
                      Repondre
                    </Button>
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4" />
                      Assigner
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                      Archiver
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card hover={false}>
                <div className="text-center py-16">
                  <Inbox className="w-12 h-12 text-warm-gray/30 mx-auto mb-3" />
                  <p className="text-sm text-warm-gray">
                    Selectionnez un message pour le lire
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
    </>
  );
}

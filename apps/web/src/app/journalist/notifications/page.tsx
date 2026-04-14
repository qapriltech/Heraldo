"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Mail,
  Wallet,
  MessageSquare,
  Settings,
  Check,
  CheckCheck,
  Loader2,
  Mic,
  AlertCircle,
  Clock,
  Smartphone,
  AtSign,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type NotificationType = "invitation" | "fcm" | "forum" | "system" | "agora";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotifPreference {
  type: string;
  label: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  invitation: { icon: Mail, color: "text-orange", bg: "bg-orange/10", label: "Invitation" },
  fcm: { icon: Wallet, color: "text-green", bg: "bg-green/10", label: "FCM" },
  forum: { icon: MessageSquare, color: "text-navy", bg: "bg-navy/10", label: "Forum" },
  system: { icon: Settings, color: "text-warm-gray", bg: "bg-warm-gray/10", label: "Systeme" },
  agora: { icon: Mic, color: "text-gold", bg: "bg-gold/10", label: "AGORA" },
};

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "invitation", label: "Invitations" },
  { key: "fcm", label: "FCM" },
  { key: "forum", label: "Forum" },
  { key: "system", label: "Systeme" },
];

const defaultPreferences: NotifPreference[] = [
  { type: "invitation", label: "Invitations (AGORA, communiques)", push: true, email: true, sms: false },
  { type: "fcm", label: "Revenus FCM", push: true, email: true, sms: true },
  { type: "forum", label: "Forum (mentions, reponses)", push: true, email: false, sms: false },
  { type: "system", label: "Systeme (mises a jour, securite)", push: true, email: true, sms: false },
  { type: "agora", label: "AGORA (rappels, demarrage)", push: true, email: false, sms: false },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotifPreference[]>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [dndStart, setDndStart] = useState("22:00");
  const [dndEnd, setDndEnd] = useState("07:00");
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<any>("/journalist-notifications").then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setNotifications(data);
      }).catch(() => {}),
      api.get<any>("/journalist-notifications/preferences").then((res) => {
        const data = res.data ?? res;
        if (data?.preferences) setPreferences(data.preferences);
        if (data?.dnd) { setDndStart(data.dnd.start ?? "22:00"); setDndEnd(data.dnd.end ?? "07:00"); }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.post("/journalist-notifications/mark-all-read").catch(() => {});
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.post(`/journalist-notifications/${id}/read`).catch(() => {});
  };

  const togglePref = (index: number, channel: "push" | "email" | "sms") => {
    setPreferences(prev => prev.map((p, i) => i === index ? { ...p, [channel]: !p[channel] } : p));
  };

  const filtered = useMemo(() => {
    if (tab === "all") return notifications;
    if (tab === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === tab);
  }, [notifications, tab]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Notifications</h1>
          <p className="text-warm-gray text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}` : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPrefs(!showPrefs)} variant={showPrefs ? "secondary" : "ghost"} size="sm">
            <Settings className="w-4 h-4" /> Preferences
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="ghost" size="sm">
              <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
            </Button>
          )}
        </div>
      </motion.div>

      {/* Preferences panel */}
      {showPrefs && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 overflow-hidden">
          <Card hover={false}>
            <h2 className="text-sm font-bold text-navy mb-4">Preferences de notification</h2>

            {/* Notification type toggles */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-warm-gray uppercase tracking-wider">
                <span>Type</span>
                <span className="text-center">Push</span>
                <span className="text-center">Email</span>
                <span className="text-center">SMS</span>
              </div>
              {preferences.map((pref, idx) => (
                <div key={pref.type} className="grid grid-cols-4 gap-2 items-center">
                  <span className="text-sm text-navy">{pref.label}</span>
                  {(["push", "email", "sms"] as const).map(channel => (
                    <div key={channel} className="flex justify-center">
                      <button
                        onClick={() => togglePref(idx, channel)}
                        className={`w-10 h-6 rounded-full transition-all cursor-pointer ${
                          pref[channel] ? "bg-orange" : "bg-navy/10"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${
                          pref[channel] ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* DND */}
            <div className="border-t border-navy/5 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <BellOff className="w-4 h-4 text-orange" />
                <h3 className="text-sm font-bold text-navy">Ne pas deranger</h3>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] font-bold text-warm-gray">De</label>
                  <input
                    type="time"
                    value={dndStart}
                    onChange={e => setDndStart(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm"
                  />
                </div>
                <span className="text-warm-gray mt-4">-</span>
                <div>
                  <label className="text-[10px] font-bold text-warm-gray">A</label>
                  <input
                    type="time"
                    value={dndEnd}
                    onChange={e => setDndEnd(e.target.value)}
                    className="block mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              tab === t.key ? "bg-orange text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"
            }`}
          >
            {t.label}
            {t.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-white/20 text-[10px] inline-flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((notif, i) => {
          const cfg = typeConfig[notif.type] ?? typeConfig.system;
          const Icon = cfg.icon;
          return (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                padding="sm"
                className={`flex items-start gap-3 cursor-pointer ${!notif.read ? "border-l-4 border-l-orange" : ""}`}
                hover={false}
              >
                <button onClick={() => markRead(notif.id)} className="contents cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={notif.type === "invitation" ? "warning" : notif.type === "fcm" ? "success" : notif.type === "forum" ? "info" : "neutral"}>
                        {cfg.label}
                      </Badge>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-orange" />}
                    </div>
                    <p className={`text-sm ${notif.read ? "text-warm-gray" : "font-semibold text-navy"}`}>{notif.title}</p>
                    <p className="text-xs text-warm-gray mt-0.5">{notif.body}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-warm-gray shrink-0 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{notif.time}</span>
                  </div>
                </button>
              </Card>
            </motion.div>
          );
        }) : (
          <Card hover={false}>
            <div className="text-center py-12">
              <Bell className="w-10 h-10 text-navy/10 mx-auto mb-3" />
              <p className="text-sm text-warm-gray">Aucune notification {tab === "unread" ? "non lue" : ""}</p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

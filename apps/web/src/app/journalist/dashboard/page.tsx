"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Mail,
  Video,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  DollarSign,
  Star,
  Bell,
  Loader2,
  User,
  Camera,
  Mic,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

function getUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("heraldo_user") || "null"); } catch { return null; }
}

export default function JournalistDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [kpis, setKpis] = useState({
    pendingInvitations: 0,
    upcomingEvents: 0,
    fcmThisMonth: "0 F",
    profileScore: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [upcomingAgoras, setUpcomingAgoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    Promise.all([
      api.get<any>("/journalist-profile/me").then((res) => {
        const d = res.data ?? res;
        setProfile(d);
        if (d?.profileCompletion) {
          setKpis(prev => ({ ...prev, profileScore: d.profileCompletion }));
        }
      }).catch(() => {}),
      api.get<any>("/journalist-agenda/upcoming").then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) {
          setUpcomingAgoras(data.filter((e: any) => e.type === "AGORA").slice(0, 4));
          setKpis(prev => ({ ...prev, upcomingEvents: data.length }));
        }
      }).catch(() => {}),
      api.get<any>("/journalist/revenues/dashboard").then((res) => {
        const d = res.data ?? res;
        if (d?.kpis) {
          setKpis(prev => ({
            ...prev,
            pendingInvitations: d.kpis.pendingInvitations ?? 0,
            fcmThisMonth: d.kpis.fcmThisMonth ?? "0 F",
          }));
        }
      }).catch(() => {}),
      api.get<any>("/journalist-notifications/unread-count").then((res) => {
        const d = res.data ?? res;
        if (d?.notifications) setNotifications(d.notifications.slice(0, 5));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-mesh">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    );
  }

  const displayName = profile?.name ?? user?.fullName ?? "Journaliste";
  const displayRole = profile?.media ?? "Journaliste accredite(e)";
  const displayInitials = (profile?.name ?? user?.fullName ?? "J").charAt(0);

  const kpiCards = [
    { label: "Invitations en attente", value: String(kpis.pendingInvitations), icon: Mail, color: "text-orange", bg: "bg-orange/10" },
    { label: "Prochains evenements", value: String(kpis.upcomingEvents), icon: Calendar, color: "text-navy", bg: "bg-navy/10" },
    { label: "Revenus FCM ce mois", value: kpis.fcmThisMonth, icon: Wallet, color: "text-green", bg: "bg-green/10" },
    { label: "Score profil", value: `${kpis.profileScore}%`, icon: Star, color: "text-gold", bg: "bg-gold/10" },
  ];

  const quickActions = [
    { label: "Voir invitations", href: "/journalist/agenda", icon: Mail, color: "bg-orange/10 text-orange" },
    { label: "Soumettre preuve FCM", href: "/journalist/revenus", icon: Camera, color: "bg-green/10 text-green" },
    { label: "Completer profil", href: "/journalist/profil", icon: User, color: "bg-gold/10 text-gold-dark" },
  ];

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/journalist/dashboard">
              <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
            </Link>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <span className="text-sm text-warm-gray ml-2 hidden sm:inline">| Espace Journaliste</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/journalist/notifications" className="relative p-2 rounded-lg hover:bg-ivory transition-colors">
              <Bell className="w-5 h-5 text-navy" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Link>
            <Link href="/journalist/profil">
              <div className="w-9 h-9 rounded-full bg-orange text-white flex items-center justify-center text-sm font-semibold">
                {displayInitials}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-navy">Bonjour, {displayName}</h1>
            <Badge variant="warning" dot>Journaliste</Badge>
          </div>
          <p className="text-warm-gray">{displayRole}</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card hover={false}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-navy">{kpi.value}</div>
                <div className="text-sm text-warm-gray">{kpi.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-lg font-semibold text-navy mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={action.label} href={action.href}>
                <Card padding="sm" className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-navy">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-warm-gray ml-auto" />
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notifications feed */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange" />
              Notifications recentes
            </h2>
            <div className="space-y-3">
              {notifications.length > 0 ? notifications.map((n: any, i: number) => (
                <motion.div key={n.id ?? i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card padding="sm" className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-navy/5" : "bg-orange/10"}`}>
                      {n.type === "invitation" ? <Mail className="w-4 h-4 text-orange" /> :
                       n.type === "fcm" ? <Wallet className="w-4 h-4 text-green" /> :
                       <Bell className="w-4 h-4 text-navy" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${n.read ? "text-warm-gray" : "font-semibold text-navy"}`}>{n.title ?? n.message}</p>
                      <p className="text-xs text-warm-gray">{n.body ?? ""}</p>
                    </div>
                    <span className="text-[10px] text-warm-gray shrink-0">{n.time ?? ""}</span>
                  </Card>
                </motion.div>
              )) : (
                <Card hover={false}>
                  <p className="text-sm text-warm-gray text-center py-4">Aucune notification recente</p>
                </Card>
              )}
              <Link href="/journalist/notifications">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Voir toutes les notifications <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Upcoming AGORA rooms */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-orange" />
              AGORAs a venir
            </h2>
            <div className="space-y-3">
              {upcomingAgoras.length > 0 ? upcomingAgoras.map((agora: any, i: number) => (
                <motion.div key={agora.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                  <Card padding="sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-navy truncate">{agora.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray">
                          <Calendar className="w-3 h-3" />
                          <span>{agora.date}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )) : (
                <Card hover={false}>
                  <p className="text-sm text-warm-gray text-center py-4">Aucune AGORA prevue</p>
                </Card>
              )}
              <Link href="/journalist/agenda">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Voir l&apos;agenda complet <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

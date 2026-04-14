"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Mail,
  Video,
  Wallet,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  DollarSign,
  Star,
  Bell,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const fallbackKpis = [
  { label: "Invitations en attente", value: "5", icon: Mail, color: "text-orange", bg: "bg-orange/10" },
  { label: "AGORAs a venir", value: "3", icon: Video, color: "text-gold", bg: "bg-gold/10" },
  { label: "Gains FCM total", value: "875 000 F", icon: Wallet, color: "text-green", bg: "bg-green/10" },
  { label: "Score credibilite", value: "94/100", icon: Star, color: "text-gold", bg: "bg-gold/10" },
];

const fallbackInvitations = [
  { id: 1, institution: "Ministere de l'Economie", type: "Communique", title: "Resultats financiers T1 2026", date: "12 avr. 2026", fcmAmount: "150 000 F" },
  { id: 2, institution: "Orange Cote d'Ivoire", type: "AGORA", title: "Lancement 5G - Conference de presse", date: "15 avr. 2026", fcmAmount: "200 000 F" },
  { id: 3, institution: "Banque Mondiale", type: "Communique", title: "Rapport economique Afrique de l'Ouest", date: "14 avr. 2026", fcmAmount: "100 000 F" },
  { id: 4, institution: "Gouvernement CI", type: "AGORA", title: "Point presse budget 2026", date: "18 avr. 2026", fcmAmount: "250 000 F" },
  { id: 5, institution: "SODECI", type: "Communique", title: "Programme d'investissement 2026-2030", date: "20 avr. 2026", fcmAmount: "120 000 F" },
];

const fallbackAgoras = [
  { title: "Lancement 5G - Orange CI", date: "15 avr. 2026, 10:00", type: "Premium", journalists: 45 },
  { title: "Point presse budget - Gouvernement", date: "18 avr. 2026, 14:30", type: "Nationale", journalists: 120 },
  { title: "Bilan annuel CIE", date: "22 avr. 2026, 09:00", type: "Standard", journalists: 28 },
];

const fallbackFcmHistory = [
  { description: "Article publie - Ministere Economie", amount: "+150 000 F", date: "11 avr.", status: "completed" },
  { description: "Reportage video - Orange CI", amount: "+200 000 F", date: "8 avr.", status: "completed" },
  { description: "Article en cours de validation", amount: "100 000 F", date: "12 avr.", status: "pending" },
  { description: "Couverture conference SODECI", amount: "+75 000 F", date: "5 avr.", status: "completed" },
];

export default function JournalistDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [kpis, setKpis] = useState(fallbackKpis);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>(fallbackInvitations);
  const [upcomingAgoras, setUpcomingAgoras] = useState<any[]>(fallbackAgoras);
  const [fcmHistory, setFcmHistory] = useState<any[]>(fallbackFcmHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/journalist-profile/me").then((res) => {
        setProfile(res.data ?? res);
      }).catch(() => {}),
      api.get<any>("/journalist-agenda/upcoming").then((res) => {
        const data = res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          setPendingInvitations(data.filter((i: any) => i.type === "Communique" || i.type === "AGORA") ?? []);
          setUpcomingAgoras(data.filter((i: any) => i.roomType || i.type === "AGORA") ?? []);
        }
      }).catch(() => {}),
      api.get<any>("/journalist/revenues/dashboard").then((res) => {
        const d = res.data ?? res;
        if (d) {
          if (d.history && Array.isArray(d.history)) setFcmHistory(d.history);
          if (d.kpis) {
            setKpis([
              { label: "Invitations en attente", value: String(d.kpis.pendingInvitations ?? "0"), icon: Mail, color: "text-orange", bg: "bg-orange/10" },
              { label: "AGORAs a venir", value: String(d.kpis.upcomingAgoras ?? "0"), icon: Video, color: "text-gold", bg: "bg-gold/10" },
              { label: "Gains FCM total", value: d.kpis.totalFcm ?? "0 F", icon: Wallet, color: "text-green", bg: "bg-green/10" },
              { label: "Score credibilite", value: d.kpis.credibilityScore ?? "0/100", icon: Star, color: "text-gold", bg: "bg-gold/10" },
            ]);
          }
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const displayName = profile?.name ?? "Marie Dupont";
  const displayRole = profile?.role ?? "Journaliste accreditee - RFI | Specialite : Economie";
  const displayInitials = profile?.initials ?? "MD";

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <span className="text-sm text-warm-gray ml-2 hidden sm:inline">| Espace Journaliste</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-ivory transition-colors cursor-pointer">
              <Bell className="w-5 h-5 text-navy" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                5
              </span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gold text-navy-dark flex items-center justify-center text-sm font-semibold">
              {displayInitials}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-1">Bonjour, {displayName}</h1>
          <p className="text-warm-gray">{displayRole}</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending invitations */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange" />
              Invitations en attente
            </h2>
            <div className="space-y-3">
              {pendingInvitations.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card padding="sm">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                        ${inv.type === "AGORA" ? "bg-gold/10" : "bg-navy/10"}`}>
                        {inv.type === "AGORA" ? <Video className="w-5 h-5 text-gold" /> : <FileText className="w-5 h-5 text-navy" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant={inv.type === "AGORA" ? "gold" : "info"}>
                            {inv.type}
                          </Badge>
                          <span className="text-xs text-warm-gray">{inv.date}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-navy truncate">{inv.title}</h3>
                        <p className="text-xs text-warm-gray">{inv.institution}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-green flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> FCM: {inv.fcmAmount}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button size="sm" variant="primary">Accepter</Button>
                        <Button size="sm" variant="ghost">Decliner</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Upcoming AGORAs */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-gold" />
                AGORAs a venir
              </h2>
              <div className="space-y-3">
                {upcomingAgoras.map((agora, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                    <Card padding="sm" className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-navy truncate">{agora.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-warm-gray">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {agora.date}</span>
                          <Badge variant="gold">{agora.type}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Rejoindre</Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FCM History */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green" />
                Historique FCM
              </h2>
              <Card hover={false}>
                <div className="divide-y divide-gray-100">
                  {fcmHistory.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${item.status === "completed" ? "bg-green/10" : "bg-orange/10"}`}>
                        {item.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">{item.description}</p>
                        <p className="text-xs text-warm-gray">{item.date}</p>
                      </div>
                      <span className={`text-sm font-bold ${item.status === "completed" ? "text-green" : "text-orange"}`}>
                        {item.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

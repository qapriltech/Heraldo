"use client";

import { motion } from "framer-motion";
import {
  Send,
  Users,
  Wallet,
  Eye,
  Plus,
  ArrowUpRight,
  FileText,
  Video,
  CreditCard,
  Clock,
  TrendingUp,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const kpis = [
  {
    label: "Communiques envoyes",
    value: "47",
    change: "+12 ce mois",
    icon: Send,
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Salles AGORA",
    value: "8",
    change: "3 a venir",
    icon: Users,
    color: "text-orange",
    bg: "bg-orange/10",
  },
  {
    label: "Solde FCM",
    value: "2 450 000 F",
    change: "4 pools actifs",
    icon: Wallet,
    color: "text-green",
    bg: "bg-green/10",
  },
  {
    label: "Portee estimee",
    value: "1.2M",
    change: "+18% vs mois dernier",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

const quickActions = [
  {
    label: "Nouveau communique",
    icon: FileText,
    href: "/communiques/new",
    color: "bg-gold",
  },
  {
    label: "Nouvelle salle AGORA",
    icon: Video,
    href: "/agora/new",
    color: "bg-orange",
  },
  {
    label: "Alimenter FCM",
    icon: CreditCard,
    href: "/fcm",
    color: "bg-green",
  },
];

const recentActivity = [
  {
    title: "Communique #CP-2026-047 diffuse",
    description: "Envoye a 156 journalistes - 89% ouvert",
    time: "Il y a 2h",
    status: "success" as const,
    statusLabel: "Diffuse",
  },
  {
    title: "Salle AGORA planifiee",
    description: "Conference Q1 Results - 14 avril 2026, 10h00",
    time: "Il y a 5h",
    status: "info" as const,
    statusLabel: "Planifiee",
  },
  {
    title: "FCM - Preuve validee",
    description: "Article publie par Le Monde Afrique - 150 000 F libere",
    time: "Hier",
    status: "gold" as const,
    statusLabel: "Valide",
  },
  {
    title: "Communique #CP-2026-046 en cours",
    description: "En attente de validation editoriale",
    time: "Hier",
    status: "warning" as const,
    statusLabel: "En attente",
  },
  {
    title: "Nouveau journaliste dans le RESEAU",
    description: "Marie Dupont (RFI) a accepte votre invitation",
    time: "Il y a 2j",
    status: "neutral" as const,
    statusLabel: "Info",
  },
];

export default function InstitutionDashboard() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Top navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <span className="text-sm text-warm-gray ml-2 hidden sm:inline">
              | Espace Institution
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="text-navy border-b-2 border-gold pb-0.5"
              >
                Tableau de bord
              </Link>
              <Link
                href="/communiques"
                className="text-warm-gray hover:text-navy transition-colors"
              >
                Communiques
              </Link>
              <Link
                href="/agora"
                className="text-warm-gray hover:text-navy transition-colors"
              >
                AGORA
              </Link>
              <Link
                href="/fcm"
                className="text-warm-gray hover:text-navy transition-colors"
              >
                FCM
              </Link>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
              IN
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-navy mb-1">
            Bonjour, Ministere de l&apos;Economie
          </h1>
          <p className="text-warm-gray">
            Voici un apercu de votre activite sur HERALDO.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover={false}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}
                  >
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green" />
                </div>
                <div className="text-2xl font-bold text-navy mb-0.5">
                  {kpi.value}
                </div>
                <div className="text-sm text-warm-gray">{kpi.label}</div>
                <div className="text-xs text-green font-medium mt-2">
                  {kpi.change}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Actions rapides
            </h2>
            <div className="space-y-3">
              {quickActions.map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Link href={action.href}>
                    <Card
                      className="flex items-center gap-4 cursor-pointer group"
                      padding="sm"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center shrink-0`}
                      >
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-navy flex-1">
                        {action.label}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-warm-gray group-hover:text-gold transition-colors" />
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              Activite recente
            </h2>
            <Card hover={false}>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={item.status} dot>
                        {item.statusLabel}
                      </Badge>
                      <span className="text-xs text-warm-gray whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

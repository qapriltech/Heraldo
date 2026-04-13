"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Shield,
  Users,
  FileCheck,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Building2,
  Pen,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const platformStats = [
  { label: "Institutions actives", value: "512", change: "+24 ce mois", icon: Building2, color: "text-navy", bg: "bg-navy/10" },
  { label: "Journalistes accredites", value: "2 147", change: "+89 ce mois", icon: UserCheck, color: "text-gold", bg: "bg-gold/10" },
  { label: "Communiques diffuses", value: "15 432", change: "+347 cette semaine", icon: Newspaper, color: "text-orange", bg: "bg-orange/10" },
  { label: "Volume FCM total", value: "245M F", change: "+18M ce mois", icon: Shield, color: "text-green", bg: "bg-green/10" },
];

const pendingAccreditations = [
  {
    id: 1,
    name: "Kouadio Yao",
    media: "L'Intelligent d'Abidjan",
    type: "Journaliste",
    submittedDate: "11 avr. 2026",
    documents: 3,
    status: "pending",
  },
  {
    id: 2,
    name: "SOTRA SA",
    media: null,
    type: "Institution",
    submittedDate: "10 avr. 2026",
    documents: 5,
    status: "pending",
  },
  {
    id: 3,
    name: "Aminata Coulibaly",
    media: "Africa24",
    type: "Journaliste",
    submittedDate: "10 avr. 2026",
    documents: 4,
    status: "pending",
  },
  {
    id: 4,
    name: "Agence Ebene",
    media: null,
    type: "Agence",
    submittedDate: "9 avr. 2026",
    documents: 6,
    status: "pending",
  },
  {
    id: 5,
    name: "Ibrahim Kone",
    media: "RTI 2",
    type: "Journaliste",
    submittedDate: "8 avr. 2026",
    documents: 3,
    status: "review",
  },
];

const fcmProofsToValidate = [
  {
    id: "PRF-001",
    journalist: "Marie Dupont",
    institution: "Ministere Economie",
    type: "Article publie",
    url: "lemonde.fr/afrique/...",
    amount: "150 000 F",
    submittedDate: "12 avr. 2026",
  },
  {
    id: "PRF-002",
    journalist: "Amadou Diallo",
    institution: "Orange CI",
    type: "Reportage TV",
    url: "rti.ci/replay/...",
    amount: "200 000 F",
    submittedDate: "11 avr. 2026",
  },
  {
    id: "PRF-003",
    journalist: "Fatou Keita",
    institution: "Banque Mondiale",
    type: "Article publie",
    url: "jeuneafrique.com/...",
    amount: "100 000 F",
    submittedDate: "11 avr. 2026",
  },
  {
    id: "PRF-004",
    journalist: "Jean-Pierre Kouame",
    institution: "SODECI",
    type: "Podcast",
    url: "rfiaudio.com/...",
    amount: "75 000 F",
    submittedDate: "10 avr. 2026",
  },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"accreditations" | "proofs">("accreditations");

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
              <Shield className="w-4 h-4 text-gold" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <Badge variant="error">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm font-medium">
              <span className="text-navy border-b-2 border-gold pb-0.5 cursor-pointer">Tableau de bord</span>
              <span className="text-warm-gray hover:text-navy transition-colors cursor-pointer">Utilisateurs</span>
              <span className="text-warm-gray hover:text-navy transition-colors cursor-pointer">Moderation</span>
              <span className="text-warm-gray hover:text-navy transition-colors cursor-pointer">Parametres</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy text-gold flex items-center justify-center text-sm font-semibold">
              AD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-1 flex items-center gap-3">
            <Activity className="w-8 h-8 text-gold" />
            Administration HERALDO
          </h1>
          <p className="text-warm-gray">Vue d&apos;ensemble de la plateforme et actions en attente</p>
        </motion.div>

        {/* Platform stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {platformStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card hover={false}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green" />
                </div>
                <div className="text-2xl font-bold text-navy">{stat.value}</div>
                <div className="text-sm text-warm-gray">{stat.label}</div>
                <div className="text-xs text-green font-medium mt-1">{stat.change}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card hover={false} className="mb-8 border-l-4 border-l-orange">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">
                  {pendingAccreditations.length} accreditations en attente | {fcmProofsToValidate.length} preuves FCM a valider
                </p>
                <p className="text-xs text-warm-gray mt-0.5">Des actions administratives requierent votre attention</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection("accreditations")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
              ${activeSection === "accreditations" ? "bg-navy text-white" : "bg-white text-warm-gray hover:text-navy"}`}
          >
            <UserCheck className="w-4 h-4" />
            Accreditations ({pendingAccreditations.length})
          </button>
          <button
            onClick={() => setActiveSection("proofs")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
              ${activeSection === "proofs" ? "bg-navy text-white" : "bg-white text-warm-gray hover:text-navy"}`}
          >
            <FileCheck className="w-4 h-4" />
            Preuves FCM ({fcmProofsToValidate.length})
          </button>
        </div>

        {/* Accreditations */}
        {activeSection === "accreditations" && (
          <div className="space-y-3">
            {pendingAccreditations.map((acc, i) => (
              <motion.div key={acc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                      ${acc.type === "Journaliste" ? "bg-gold/10" : acc.type === "Institution" ? "bg-navy/10" : "bg-orange/10"}`}>
                      {acc.type === "Journaliste" ? <Pen className="w-6 h-6 text-gold" /> :
                       acc.type === "Institution" ? <Building2 className="w-6 h-6 text-navy" /> :
                       <Users className="w-6 h-6 text-orange" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={acc.type === "Journaliste" ? "gold" : acc.type === "Institution" ? "info" : "warning"}>
                          {acc.type}
                        </Badge>
                        <Badge variant={acc.status === "pending" ? "warning" : "info"} dot>
                          {acc.status === "pending" ? "En attente" : "En revue"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-navy">{acc.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-warm-gray">
                        {acc.media && <span>Media: {acc.media}</span>}
                        <span>Soumis le {acc.submittedDate}</span>
                        <span>{acc.documents} document(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                        Examiner
                      </Button>
                      <Button variant="primary" size="sm">
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </Button>
                      <Button variant="danger" size="sm">
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* FCM Proofs */}
        {activeSection === "proofs" && (
          <div className="space-y-3">
            {fcmProofsToValidate.map((proof, i) => (
              <motion.div key={proof.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center shrink-0">
                      <FileCheck className="w-6 h-6 text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-warm-gray">{proof.id}</span>
                        <Badge variant="warning" dot>A valider</Badge>
                      </div>
                      <h3 className="font-semibold text-navy">{proof.type} — {proof.journalist}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-warm-gray">
                        <span>Institution: {proof.institution}</span>
                        <span>Soumis le {proof.submittedDate}</span>
                      </div>
                      <div className="mt-2">
                        <a href="#" className="text-xs text-gold hover:text-gold-dark font-medium underline">
                          {proof.url}
                        </a>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-green mb-2">{proof.amount}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm">
                          <CheckCircle className="w-4 h-4" />
                          Valider
                        </Button>
                        <Button variant="danger" size="sm">
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

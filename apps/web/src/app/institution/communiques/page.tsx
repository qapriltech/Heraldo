"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const communiques = [
  {
    id: "CP-2026-047",
    title: "Resultats financiers T1 2026 - Croissance de 12%",
    format: "Long",
    date: "12 avr. 2026",
    recipients: 156,
    openRate: "89%",
    status: "diffuse",
  },
  {
    id: "CP-2026-046",
    title: "Nomination du nouveau Directeur General",
    format: "Court",
    date: "10 avr. 2026",
    recipients: 0,
    openRate: "-",
    status: "en_attente",
  },
  {
    id: "CP-2026-045",
    title: "Partenariat strategique avec la Banque Mondiale",
    format: "Long",
    date: "8 avr. 2026",
    recipients: 203,
    openRate: "92%",
    status: "diffuse",
  },
  {
    id: "CP-2026-044",
    title: "FLASH - Mise au point sur les rumeurs de privatisation",
    format: "Flash",
    date: "5 avr. 2026",
    recipients: 312,
    openRate: "95%",
    status: "diffuse",
  },
  {
    id: "CP-2026-043",
    title: "Lancement du programme de formation professionnelle",
    format: "Long",
    date: "2 avr. 2026",
    recipients: 145,
    openRate: "78%",
    status: "diffuse",
  },
  {
    id: "CP-2026-042",
    title: "Rapport annuel 2025 disponible",
    format: "Court",
    date: "28 mars 2026",
    recipients: 0,
    openRate: "-",
    status: "brouillon",
  },
  {
    id: "CP-2026-041",
    title: "Inauguration du nouveau siege regional",
    format: "Long",
    date: "25 mars 2026",
    recipients: 89,
    openRate: "85%",
    status: "expire",
  },
];

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "neutral" | "error" | "info"; icon: typeof Send }
> = {
  diffuse: { label: "Diffuse", variant: "success", icon: CheckCircle },
  en_attente: { label: "En attente", variant: "warning", icon: Clock },
  brouillon: { label: "Brouillon", variant: "neutral", icon: FileText },
  expire: { label: "Expire", variant: "error", icon: XCircle },
};

const formatColors: Record<string, string> = {
  Long: "bg-navy/10 text-navy",
  Court: "bg-gold/10 text-gold-dark",
  Flash: "bg-orange/10 text-orange",
};

export default function CommuniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = communiques.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-ivory">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-warm-gray hover:text-navy transition-colors"
            >
              Tableau de bord
            </Link>
            <Link
              href="/communiques"
              className="text-navy border-b-2 border-gold pb-0.5"
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
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Communiques</h1>
            <p className="text-warm-gray mt-1">
              Gerez et diffusez vos communiques de presse
            </p>
          </div>
          <Link href="/communiques/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nouveau communique
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card hover={false} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="Rechercher un communique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-warm-gray" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-navy"
              >
                <option value="all">Tous les statuts</option>
                <option value="diffuse">Diffuse</option>
                <option value="en_attente">En attente</option>
                <option value="brouillon">Brouillon</option>
                <option value="expire">Expire</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Communiques list */}
        <div className="space-y-3">
          {filtered.map((cp, i) => {
            const cfg = statusConfig[cp.status];
            return (
              <motion.div
                key={cp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-warm-gray">
                        {cp.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${formatColors[cp.format]}`}
                      >
                        {cp.format}
                      </span>
                    </div>
                    <h3 className="font-semibold text-navy truncate">
                      {cp.title}
                    </h3>
                    <p className="text-xs text-warm-gray mt-1">
                      {cp.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center hidden md:block">
                      <div className="text-sm font-semibold text-navy">
                        {cp.recipients}
                      </div>
                      <div className="text-xs text-warm-gray">
                        Destinataires
                      </div>
                    </div>
                    <div className="text-center hidden md:block">
                      <div className="text-sm font-semibold text-navy">
                        {cp.openRate}
                      </div>
                      <div className="text-xs text-warm-gray">
                        Taux ouverture
                      </div>
                    </div>
                    <Badge variant={cfg.variant} dot>
                      {cfg.label}
                    </Badge>
                    <button className="p-2 rounded-lg hover:bg-ivory transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4 text-warm-gray" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-warm-gray/30 mx-auto mb-4" />
            <p className="text-warm-gray font-medium">
              Aucun communique trouve
            </p>
            <p className="text-sm text-warm-gray/70 mt-1">
              Modifiez vos filtres ou creez un nouveau communique
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

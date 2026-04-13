"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  AlertTriangle,
  Newspaper,
  CreditCard,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const pools = [
  {
    id: "FCM-001",
    title: "Couverture lancement produit Alpha",
    totalFunded: "500 000 F",
    released: "320 000 F",
    remaining: "180 000 F",
    proofs: 4,
    proofsValidated: 3,
    status: "active",
  },
  {
    id: "FCM-002",
    title: "Campagne institutionnelle Q1",
    totalFunded: "1 200 000 F",
    released: "750 000 F",
    remaining: "450 000 F",
    proofs: 8,
    proofsValidated: 5,
    status: "active",
  },
  {
    id: "FCM-003",
    title: "Conference resultats T4 2025",
    totalFunded: "300 000 F",
    released: "300 000 F",
    remaining: "0 F",
    proofs: 3,
    proofsValidated: 3,
    status: "completed",
  },
  {
    id: "FCM-004",
    title: "Crise communication - Mise au point",
    totalFunded: "750 000 F",
    released: "200 000 F",
    remaining: "550 000 F",
    proofs: 6,
    proofsValidated: 2,
    status: "active",
  },
];

const transactions = [
  {
    id: "TX-001",
    description: "Depot FCM - Campagne Q1",
    amount: "+1 200 000 F",
    type: "deposit",
    date: "12 avr. 2026",
    status: "completed",
  },
  {
    id: "TX-002",
    description: "Liberation - Article Le Monde Afrique",
    amount: "-150 000 F",
    type: "release",
    date: "11 avr. 2026",
    status: "completed",
  },
  {
    id: "TX-003",
    description: "Liberation - Reportage RTI",
    amount: "-200 000 F",
    type: "release",
    date: "10 avr. 2026",
    status: "completed",
  },
  {
    id: "TX-004",
    description: "Depot FCM - Lancement Alpha",
    amount: "+500 000 F",
    type: "deposit",
    date: "8 avr. 2026",
    status: "completed",
  },
  {
    id: "TX-005",
    description: "Liberation - Article Jeune Afrique",
    amount: "-100 000 F",
    type: "release",
    date: "7 avr. 2026",
    status: "pending",
  },
];

export default function FCMPage() {
  const [activeTab, setActiveTab] = useState<"pools" | "transactions">("pools");

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="text-warm-gray hover:text-navy transition-colors">Tableau de bord</Link>
            <Link href="/communiques" className="text-warm-gray hover:text-navy transition-colors">Communiques</Link>
            <Link href="/agora" className="text-warm-gray hover:text-navy transition-colors">AGORA</Link>
            <Link href="/fcm" className="text-navy border-b-2 border-gold pb-0.5">FCM</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-green" />
              Fonds de Couverture Mediatique
            </h1>
            <p className="text-warm-gray mt-1">Gerez vos pools FCM et suivez les preuves de couverture</p>
          </div>
          <Button>
            <Plus className="w-4 h-4" />
            Nouveau pool FCM
          </Button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total depose", value: "2 750 000 F", icon: Wallet, color: "text-green", bg: "bg-green/10" },
            { label: "Total libere", value: "1 570 000 F", icon: ArrowUpRight, color: "text-gold", bg: "bg-gold/10" },
            { label: "En escrow", value: "1 180 000 F", icon: ShieldCheck, color: "text-navy", bg: "bg-navy/10" },
            { label: "Preuves validees", value: "13/21", icon: FileCheck, color: "text-orange", bg: "bg-orange/10" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card hover={false} padding="sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-navy">{kpi.value}</div>
                    <div className="text-xs text-warm-gray">{kpi.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pools")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
              ${activeTab === "pools" ? "bg-navy text-white" : "bg-white text-warm-gray hover:text-navy"}`}
          >
            Pools actifs
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
              ${activeTab === "transactions" ? "bg-navy text-white" : "bg-white text-warm-gray hover:text-navy"}`}
          >
            Transactions
          </button>
        </div>

        {/* Pools */}
        {activeTab === "pools" && (
          <div className="space-y-4">
            {pools.map((pool, i) => (
              <motion.div key={pool.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-warm-gray">{pool.id}</span>
                        <Badge variant={pool.status === "active" ? "success" : "neutral"} dot>
                          {pool.status === "active" ? "Actif" : "Termine"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-navy">{pool.title}</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-6 shrink-0">
                      <div className="text-center">
                        <div className="text-sm font-bold text-navy">{pool.totalFunded}</div>
                        <div className="text-xs text-warm-gray">Depose</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-green">{pool.released}</div>
                        <div className="text-xs text-warm-gray">Libere</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-gold-dark">{pool.remaining}</div>
                        <div className="text-xs text-warm-gray">Restant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-navy">
                          {pool.proofsValidated}/{pool.proofs}
                        </div>
                        <div className="text-xs text-warm-gray">Preuves</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-warm-gray mb-2">
                      <span>Progression des liberations</span>
                      <span>{Math.round((pool.proofsValidated / pool.proofs) * 100)}%</span>
                    </div>
                    <div className="w-full bg-ivory rounded-full h-2">
                      <div
                        className="bg-green rounded-full h-2 transition-all"
                        style={{ width: `${(pool.proofsValidated / pool.proofs) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Transactions */}
        {activeTab === "transactions" && (
          <Card hover={false}>
            <div className="divide-y divide-gray-100">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${tx.type === "deposit" ? "bg-green/10" : "bg-orange/10"}`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownRight className="w-5 h-5 text-green" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{tx.description}</p>
                    <p className="text-xs text-warm-gray mt-0.5">{tx.date}</p>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === "deposit" ? "text-green" : "text-orange"}`}>
                    {tx.amount}
                  </div>
                  <Badge variant={tx.status === "completed" ? "success" : "warning"} dot>
                    {tx.status === "completed" ? "Confirme" : "En attente"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

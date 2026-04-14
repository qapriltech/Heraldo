"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Loader2,
  Building2,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  institution: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "validated";
  eventTitle?: string;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface InstitutionTotal {
  name: string;
  total: number;
  count: number;
}

export default function RevenusPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"transactions" | "institutions">("transactions");
  const [totalLifetime, setTotalLifetime] = useState(0);
  const [totalYear, setTotalYear] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [institutionTotals, setInstitutionTotals] = useState<InstitutionTotal[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<any>("/journalist/revenues/dashboard").then((res) => {
        const d = res.data ?? res;
        if (d) {
          setTotalLifetime(d.totalLifetime ?? 0);
          setTotalYear(d.totalYear ?? 0);
          setTotalMonth(d.totalMonth ?? 0);
          setPendingAmount(d.pendingAmount ?? 0);
          if (d.monthly) setMonthlyData(d.monthly);
          if (d.byInstitution) setInstitutionTotals(d.byInstitution);
        }
      }).catch(() => {}),
      api.get<any>("/journalist/revenues/by-event").then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setTransactions(data);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const formatAmount = (n: number) => n.toLocaleString("fr-FR") + " F";

  const maxMonthly = useMemo(() => Math.max(...monthlyData.map(m => m.amount), 1), [monthlyData]);

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
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Revenus FCM</h1>
          <p className="text-warm-gray text-sm mt-1">Suivez vos gains de Frais de Couverture Mediatique.</p>
        </div>
        <Button variant="outline" className="border-orange text-orange hover:bg-orange hover:text-white">
          <Download className="w-4 h-4" /> Export fiscal
        </Button>
      </motion.div>

      {/* Big KPI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <Card hover={false} className="gradient-card-gold">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-warm-gray mb-2">Total des gains (depuis l&apos;inscription)</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-gradient-gold">{formatAmount(totalLifetime)}</p>
          </div>
        </Card>
      </motion.div>

      {/* 3 smaller KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Cette annee", value: formatAmount(totalYear), icon: Calendar, color: "text-navy", bg: "bg-navy/10" },
          { label: "Ce mois", value: formatAmount(totalMonth), icon: TrendingUp, color: "text-green", bg: "bg-green/10" },
          { label: "En attente de validation", value: formatAmount(pendingAmount), icon: Clock, color: "text-orange", bg: "bg-orange/10" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <Card hover={false} padding="sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-navy">{kpi.value}</div>
                  <div className="text-[11px] text-warm-gray font-medium">{kpi.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      {monthlyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <Card hover={false}>
            <h2 className="text-sm font-bold text-navy mb-6">Evolution mensuelle (12 derniers mois)</h2>
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map((m, i) => {
                const heightPct = Math.max((m.amount / maxMonthly) * 100, 4);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-navy">{m.amount > 0 ? formatAmount(m.amount) : ""}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                      className="w-full rounded-t-lg"
                      style={{ background: "linear-gradient(180deg, #E8742E, #C8A45C)", minHeight: 4 }}
                    />
                    <span className="text-[9px] text-warm-gray font-medium">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "transactions" as const, label: "Transactions recentes" },
          { key: "institutions" as const, label: "Par institution" },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              tab === t.key ? "bg-orange text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      {tab === "transactions" && (
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map((tx, i) => (
            <motion.div key={tx.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm" className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.status === "completed" ? "bg-green/10" : tx.status === "validated" ? "bg-gold/10" : "bg-orange/10"
                }`}>
                  {tx.status === "completed" ? <CheckCircle className="w-5 h-5 text-green" /> :
                   tx.status === "validated" ? <ArrowUpRight className="w-5 h-5 text-gold" /> :
                   <Clock className="w-5 h-5 text-orange" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{tx.eventTitle ?? tx.institution}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Building2 className="w-3 h-3 text-warm-gray" />
                    <span className="text-xs text-warm-gray">{tx.institution}</span>
                    <span className="text-xs text-warm-gray">- {tx.date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${tx.status === "completed" ? "text-green" : "text-orange"}`}>
                    {tx.status === "completed" ? "+" : ""}{formatAmount(tx.amount)}
                  </p>
                  <Badge variant={tx.status === "completed" ? "success" : tx.status === "validated" ? "gold" : "warning"}>
                    {tx.status === "completed" ? "Paye" : tx.status === "validated" ? "Valide" : "En attente"}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )) : (
            <Card hover={false}>
              <p className="text-sm text-warm-gray text-center py-8">Aucune transaction pour le moment</p>
            </Card>
          )}
        </div>
      )}

      {/* By institution */}
      {tab === "institutions" && (
        <div className="space-y-3">
          {institutionTotals.length > 0 ? institutionTotals.map((inst, i) => (
            <motion.div key={inst.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm" className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy">{inst.name}</p>
                  <p className="text-xs text-warm-gray">{inst.count} evenement{inst.count > 1 ? "s" : ""}</p>
                </div>
                <p className="text-lg font-extrabold text-green shrink-0">{formatAmount(inst.total)}</p>
              </Card>
            </motion.div>
          )) : (
            <Card hover={false}>
              <p className="text-sm text-warm-gray text-center py-8">Aucune donnee par institution</p>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

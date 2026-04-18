"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Plus,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  Eye,
  Loader2,
  Sparkles,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";

const fmtMoney = (n: number | string) => {
  const num = typeof n === "string" ? parseInt(n.replace(/\D/g, "")) : n;
  return isNaN(num) ? "0" : num.toLocaleString("fr-FR");
};

export default function FCMPage() {
  const [activeTab, setActiveTab] = useState<"pools" | "transactions">("pools");
  const [pools, setPools] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/fcm/pools").then((res) => setPools(res.data ?? [])).catch(() => setPools([])),
      api.get<any>("/fcm/transactions").then((res) => setTransactions(res.data ?? [])).catch(() => setTransactions([])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement FCM...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Couverture mediatique</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Fonds de Couverture Mediatique</h1>
            <p className="text-warm-gray text-sm mt-1">Gerez vos pools FCM et suivez les preuves de couverture.</p>
          </div>
          <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau pool FCM
          </button>
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total depose", value: "2 750 000 F", gradient: "from-green to-teal", icon: Wallet, iconBg: "bg-green/10", iconColor: "text-green" },
          { label: "Total libere", value: "1 570 000 F", gradient: "from-gold to-orange", icon: ArrowUpRight, iconBg: "bg-gold/10", iconColor: "text-gold" },
          { label: "En escrow", value: "1 180 000 F", gradient: "from-navy to-purple", icon: ShieldCheck, iconBg: "bg-navy/10", iconColor: "text-navy" },
          { label: "Preuves validees", value: "13/21", gradient: "from-orange to-red", icon: FileCheck, iconBg: "bg-orange/10", iconColor: "text-orange" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-6">
        {[
          { key: "pools" as const, label: "Pools actifs", icon: CreditCard },
          { key: "transactions" as const, label: "Transactions", icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.key
                ? "gradient-gold text-navy-dark shadow-lg"
                : "bg-white text-warm-gray hover:text-navy border border-navy/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Pools */}
      {activeTab === "pools" && (
        <div className="space-y-4">
          {pools.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="premium-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-serif text-navy mb-2">Aucun pool FCM</h3>
                <p className="text-sm text-warm-gray max-w-md mx-auto mb-6">Creez votre premier fonds pour financer la couverture mediatique.</p>
                <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Creer un pool
                </button>
              </div>
            </motion.div>
          )}
          {pools.map((pool, i) => (
            <motion.div key={pool.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
              <div className="premium-card p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${pool.status === "active" ? "from-green to-teal" : "from-warm-gray to-warm-gray-light"}`} />
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono text-warm-gray/60">{pool.id}</span>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pool.status === "active" ? "bg-green/10 text-green" : "bg-warm-gray/10 text-warm-gray"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pool.status === "active" ? "bg-green" : "bg-warm-gray"}`} />
                        {pool.status === "active" ? "Actif" : "Termine"}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy text-lg">{pool.title}</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-6 shrink-0">
                    {[
                      { label: "Depose", value: pool.totalFunded, color: "text-navy" },
                      { label: "Libere", value: pool.released, color: "text-green" },
                      { label: "Restant", value: pool.remaining, color: "text-gold-dark" },
                      { label: "Preuves", value: `${pool.proofsValidated}/${pool.proofs}`, color: "text-orange" },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <div className={`text-sm font-extrabold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <button className="px-4 py-2.5 rounded-2xl bg-navy/5 text-navy font-bold text-sm hover:bg-navy/10 transition-all flex items-center gap-2 shrink-0">
                    <Eye className="w-4 h-4" /> Details
                  </button>
                </div>
                {/* Progress bar with gradient */}
                <div className="mt-5 pt-4 border-t border-navy/5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-warm-gray font-semibold">Progression des liberations</span>
                    <span className="font-extrabold text-navy">{Math.round((pool.proofsValidated / pool.proofs) * 100)}%</span>
                  </div>
                  <div className="w-full bg-navy/5 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-gradient-to-r from-green to-teal"
                      style={{ width: `${(pool.proofsValidated / pool.proofs) * 100}%` }}
                    />
                  </div>
                </div>
                {/* Commission breakdown */}
                <div className="mt-3 flex gap-4 text-[10px]">
                  <span className="text-warm-gray">Commission HERALDO: <strong className="text-navy">5%</strong></span>
                  <span className="text-warm-gray">Commission plateforme: <strong className="text-navy">2%</strong></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Transactions */}
      {activeTab === "transactions" && (
        <div className="premium-card p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Aucune transaction</h3>
              <p className="text-sm text-warm-gray">Les transactions apparaitront ici apres votre premier depot.</p>
            </div>
          ) : (
            <div className="divide-y divide-navy/5">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className={`flex items-center gap-4 py-4 first:pt-0 last:pb-0 ${i % 2 === 1 ? "bg-ivory/30 -mx-6 px-6 rounded-xl" : ""}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "deposit" ? "bg-green/10" : "bg-orange/10"
                  }`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownRight className="w-5 h-5 text-green" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy">{tx.description}</p>
                    <p className="text-[10px] text-warm-gray mt-0.5">{tx.date}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-extrabold ${
                    tx.type === "deposit" ? "bg-green/10 text-green" : "bg-orange/10 text-orange"
                  }`}>
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    tx.status === "completed" ? "bg-green/10 text-green" : "bg-gold/10 text-gold"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "completed" ? "bg-green" : "bg-gold"}`} />
                    {tx.status === "completed" ? "Confirme" : "En attente"}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

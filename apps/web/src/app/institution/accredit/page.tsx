"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  BarChart3,
  Sparkles,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AccreditCard {
  id: string;
  journalistId: string;
  accreditationType: string;
  validFrom: string;
  validUntil?: string;
  qrCode: string;
  status: string;
  eventName?: string;
  issuedAt: string;
  revokedAt?: string;
  revokedReason?: string;
}

interface Stats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
  byType: { type: string; count: number }[];
}

function getInstitutionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("heraldo_user") || "{}");
    return user.institutionId || "";
  } catch { return ""; }
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "text-green", bg: "bg-green/10", dot: "bg-green", icon: CheckCircle },
  revoked: { label: "Revoquee", color: "text-red", bg: "bg-red/10", dot: "bg-red", icon: XCircle },
  expired: { label: "Expiree", color: "text-warm-gray", bg: "bg-warm-gray/10", dot: "bg-warm-gray", icon: Clock },
};

const typeLabels: Record<string, string> = {
  permanent: "Permanente",
  annual: "Annuelle",
  event: "Evenement",
};

export default function AccreditPage() {
  const [cards, setCards] = useState<AccreditCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showIssue, setShowIssue] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const [journalistId, setJournalistId] = useState("");
  const [accType, setAccType] = useState("annual");
  const [eventName, setEventName] = useState("");
  const [issuing, setIssuing] = useState(false);

  const institutionId = getInstitutionId();

  useEffect(() => {
    const q = institutionId ? `?institutionId=${institutionId}` : "";
    Promise.all([
      api.get<any>(`/accredit/cards${q}`).then((r) => setCards(r.data ?? r ?? [])).catch(() => {}),
      api.get<any>(`/accredit/stats${q}`).then((r) => setStats(r)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [institutionId]);

  const handleIssue = async () => {
    if (!journalistId.trim()) return;
    setIssuing(true);
    try {
      const card = await api.post<any>("/accredit/cards", {
        institutionId, journalistId, accreditationType: accType,
        eventName: accType === "event" ? eventName : undefined,
      });
      setCards((prev) => [card, ...prev]);
      setShowIssue(false);
      setJournalistId("");
      setEventName("");
    } catch {}
    setIssuing(false);
  };

  const handleRevoke = async (id: string) => {
    const reason = prompt("Raison de la revocation:");
    if (reason === null) return;
    try {
      await api.patch(`/accredit/cards/${id}/revoke`, { reason });
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "revoked", revokedReason: reason } : c)));
    } catch {}
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    try {
      const result = await api.get<any>(`/accredit/verify/${verifyCode.trim()}`);
      setVerifyResult(result);
    } catch {
      setVerifyResult({ valid: false, message: "QR code invalide" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement accreditations...</p>
        </div>
      </div>
    );
  }

  const filteredCards = cards.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (typeFilter !== "all" && c.accreditationType !== typeFilter) return false;
    return true;
  });

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Gestion des accreditations</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Accreditations</h1>
            <p className="text-warm-gray text-sm mt-1">Gerez les accreditations presse avec QR codes verifiables.</p>
          </div>
          <button onClick={() => setShowIssue(!showIssue)} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Emettre
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: String(stats?.total ?? 0), gradient: "from-navy to-purple", icon: CreditCard, iconBg: "bg-navy/10", iconColor: "text-navy" },
          { label: "Actives", value: String(stats?.active ?? 0), gradient: "from-green to-teal", icon: UserCheck, iconBg: "bg-green/10", iconColor: "text-green" },
          { label: "Revoquees", value: String(stats?.revoked ?? 0), gradient: "from-red to-orange", icon: UserX, iconBg: "bg-red/10", iconColor: "text-red" },
          { label: "Expirees", value: String(stats?.expired ?? 0), gradient: "from-warm-gray to-warm-gray-light", icon: Clock, iconBg: "bg-warm-gray/10", iconColor: "text-warm-gray" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Issue form */}
      {showIssue && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="premium-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
            <h3 className="text-sm font-extrabold text-navy mb-5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold" /> Emettre une accreditation
            </h3>
            <div className="space-y-4">
              <input type="text" value={journalistId} onChange={(e) => setJournalistId(e.target.value)} placeholder="ID du journaliste" className="w-full px-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm" />
              <div>
                <label className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-2 block">Type</label>
                <div className="flex gap-2">
                  {["permanent", "annual", "event"].map((t) => (
                    <button key={t} onClick={() => setAccType(t)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${accType === t ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              {accType === "event" && (
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nom de l'evenement" className="w-full px-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm" />
              )}
              <button onClick={handleIssue} disabled={issuing || !journalistId.trim()} className="w-full py-3.5 rounded-2xl gradient-gold text-navy-dark font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Emettre l&apos;accreditation
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cards list */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-1">
              {["all", "active", "revoked"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${statusFilter === s ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                  {s === "all" ? "Tous" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {["all", "permanent", "annual", "event"].map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${typeFilter === t ? "bg-navy text-white shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                  {t === "all" ? "Tous types" : typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Cartes d&apos;accreditation</h2>
          </div>

          <div className="space-y-3">
            {filteredCards.length === 0 && (
              <div className="premium-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-serif text-navy mb-2">Aucune accreditation</h3>
                <p className="text-sm text-warm-gray mb-6">Emettez votre premiere accreditation pour un journaliste.</p>
                <button onClick={() => setShowIssue(true)} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Emettre
                </button>
              </div>
            )}
            {filteredCards.map((c, i) => {
              const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
              const sc = isExpired && c.status === "active" ? statusConfig.expired : (statusConfig[c.status] || statusConfig.active);
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                  <div className="premium-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group cursor-pointer relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      c.status === "active" && !isExpired ? "from-green to-teal" : c.status === "revoked" ? "from-red to-orange" : "from-warm-gray to-warm-gray-light"
                    }`} />
                    {/* QR Code visual */}
                    <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center shrink-0 relative">
                      <QrCode className="w-7 h-7 text-gold" />
                      {/* Traffic light dot */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${sc.dot} border-2 border-white shadow-sm`} />
                    </div>
                    {/* Journalist photo circle */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy/10 to-gold/10 flex items-center justify-center shrink-0 ring-2 ring-navy/10">
                      <User className="w-5 h-5 text-navy/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-extrabold text-navy group-hover:text-gold transition-colors">Journaliste: {c.journalistId.substring(0, 8)}...</p>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-warm-gray">
                        {typeLabels[c.accreditationType]} {c.eventName ? `-- ${c.eventName}` : ""} | QR: <span className="font-mono">{c.qrCode.substring(0, 12)}...</span>
                      </p>
                      <p className="text-[10px] text-warm-gray mt-0.5">
                        Valide: {new Date(c.validFrom).toLocaleDateString("fr-FR")} {c.validUntil ? `-- ${new Date(c.validUntil).toLocaleDateString("fr-FR")}` : "-- illimitee"}
                      </p>
                    </div>
                    {c.status === "active" && !isExpired && (
                      <button onClick={() => handleRevoke(c.id)} className="text-[10px] font-extrabold text-red hover:text-red/80 px-3 py-1.5 rounded-xl hover:bg-red/5 transition-all shrink-0">
                        Revoquer
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Verify */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Verifier un QR code</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
              <div className="flex gap-2 mb-4">
                <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleVerify()} placeholder="Coller le QR code..." className="flex-1 px-3 py-2.5 rounded-xl border border-navy/10 text-sm font-mono" />
                <button onClick={handleVerify} className="px-4 py-2.5 rounded-xl gradient-gold text-navy-dark text-xs font-bold shadow-lg">
                  Verifier
                </button>
              </div>
              {verifyResult && (
                <div className={`p-4 rounded-xl ${verifyResult.valid ? "bg-green-pale border border-green/20" : "bg-red-pale border border-red/20"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.valid ? <CheckCircle className="w-5 h-5 text-green" /> : <XCircle className="w-5 h-5 text-red" />}
                    <span className={`text-sm font-extrabold ${verifyResult.valid ? "text-green" : "text-red"}`}>
                      {verifyResult.valid ? "Accreditation valide" : "Accreditation invalide"}
                    </span>
                  </div>
                  {verifyResult.valid && (
                    <div className="text-[10px] text-warm-gray space-y-1 mt-2">
                      <div className="flex justify-between"><span>Type:</span> <strong className="text-navy">{typeLabels[verifyResult.accreditationType]}</strong></div>
                      <div className="flex justify-between"><span>Statut:</span> <strong className="text-navy">{verifyResult.status}</strong></div>
                      {verifyResult.eventName && <div className="flex justify-between"><span>Evenement:</span> <strong className="text-navy">{verifyResult.eventName}</strong></div>}
                      <div className="flex justify-between"><span>Valide du:</span> <strong className="text-navy">{new Date(verifyResult.validFrom).toLocaleDateString("fr-FR")}</strong></div>
                      {verifyResult.validUntil && <div className="flex justify-between"><span>Au:</span> <strong className="text-navy">{new Date(verifyResult.validUntil).toLocaleDateString("fr-FR")}</strong></div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Type distribution */}
          {stats && stats.byType.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gold" />
                <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Repartition par type</h2>
              </div>
              <div className="premium-card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-navy" />
                {stats.byType.map((t) => {
                  const pct = stats.total > 0 ? Math.round((t.count / stats.total) * 100) : 0;
                  return (
                    <div key={t.type} className="flex items-center gap-3 mb-3 last:mb-0">
                      <span className="text-xs font-bold text-navy flex-1">{typeLabels[t.type] || t.type}</span>
                      <span className="text-xs font-extrabold text-navy">{t.count}</span>
                      <div className="w-20 h-2 bg-navy/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold to-orange" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  UserCheck,
  UserX,
  Shield,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
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

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  revoked: { label: "Revoquee", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  expired: { label: "Expiree", color: "text-warm-gray", bg: "bg-gray-50", icon: Clock },
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

  // Issue form
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
        institutionId,
        journalistId,
        accreditationType: accType,
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const filteredCards = cards.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (typeFilter !== "all" && c.accreditationType !== typeFilter) return false;
    return true;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-gold" /> Accreditations
            </h1>
            <p className="text-warm-gray text-sm mt-1">Gerez les accreditations presse avec QR codes verifiables.</p>
          </div>
          <button onClick={() => setShowIssue(!showIssue)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold shadow-md hover:bg-navy/90 transition-all">
            <Plus className="w-4 h-4" /> Emettre
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: String(stats?.total ?? 0), icon: CreditCard, color: "text-navy" },
          { label: "Actives", value: String(stats?.active ?? 0), icon: UserCheck, color: "text-green-600" },
          { label: "Revoquees", value: String(stats?.revoked ?? 0), icon: UserX, color: "text-red-600" },
          { label: "Expirees", value: String(stats?.expired ?? 0), icon: Clock, color: "text-warm-gray" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover={false} padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-navy">{kpi.value}</div>
                  <div className="text-[11px] text-warm-gray font-medium">{kpi.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Issue form */}
      {showIssue && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card hover={false}>
            <h3 className="text-sm font-bold text-navy mb-4">Emettre une accreditation</h3>
            <div className="space-y-4">
              <input type="text" value={journalistId} onChange={(e) => setJournalistId(e.target.value)} placeholder="ID du journaliste" className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm" />
              <div>
                <label className="text-xs font-bold text-navy mb-2 block">Type</label>
                <div className="flex gap-2">
                  {["permanent", "annual", "event"].map((t) => (
                    <button key={t} onClick={() => setAccType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${accType === t ? "bg-navy text-white" : "bg-white text-warm-gray border border-navy/10"}`}>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              {accType === "event" && (
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nom de l'evenement" className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm" />
              )}
              <button onClick={handleIssue} disabled={issuing || !journalistId.trim()} className="w-full py-3 rounded-xl bg-navy text-white font-bold text-sm shadow-md hover:bg-navy/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Emettre l'accreditation
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cards list */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-1">
              {["all", "active", "revoked"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-navy text-white" : "bg-white text-warm-gray border border-navy/10"}`}>
                  {s === "all" ? "Tous" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {["all", "permanent", "annual", "event"].map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === t ? "bg-gold text-navy-dark" : "bg-white text-warm-gray border border-navy/10"}`}>
                  {t === "all" ? "Tous types" : typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCards.length === 0 && (
              <Card hover={false}><p className="text-sm text-warm-gray text-center py-4">Aucune accreditation.</p></Card>
            )}
            {filteredCards.map((c, i) => {
              const sc = statusConfig[c.status] || statusConfig.active;
              const Icon = sc.icon;
              const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
              const displayStatus = isExpired && c.status === "active" ? statusConfig.expired : sc;
              const DisplayIcon = displayStatus.icon;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card padding="sm" className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-navy">Journaliste: {c.journalistId.substring(0, 8)}...</p>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${displayStatus.bg} ${displayStatus.color}`}>
                          <DisplayIcon className="w-3 h-3" /> {displayStatus.label}
                        </div>
                      </div>
                      <p className="text-[10px] text-warm-gray">
                        {typeLabels[c.accreditationType]} {c.eventName ? `- ${c.eventName}` : ""} | QR: {c.qrCode.substring(0, 12)}...
                      </p>
                      <p className="text-[10px] text-warm-gray">
                        Valide: {new Date(c.validFrom).toLocaleDateString("fr-FR")} {c.validUntil ? `- ${new Date(c.validUntil).toLocaleDateString("fr-FR")}` : "- illimitee"}
                      </p>
                    </div>
                    {c.status === "active" && (
                      <button onClick={() => handleRevoke(c.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 shrink-0">
                        Revoquer
                      </button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: QR Verify */}
        <div className="space-y-6">
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-bold text-navy">Verifier un QR code</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleVerify()} placeholder="Coller le QR code..." className="flex-1 px-3 py-2 rounded-lg border border-navy/10 text-sm font-mono" />
              <button onClick={handleVerify} className="px-3 py-2 rounded-lg bg-navy text-white text-xs font-bold">
                Verifier
              </button>
            </div>
            {verifyResult && (
              <div className={`p-3 rounded-lg ${verifyResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {verifyResult.valid ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className={`text-xs font-bold ${verifyResult.valid ? "text-green-600" : "text-red-600"}`}>
                    {verifyResult.valid ? "Accreditation valide" : "Accreditation invalide"}
                  </span>
                </div>
                {verifyResult.valid && (
                  <div className="text-[10px] text-warm-gray space-y-0.5 mt-2">
                    <div>Type: <strong>{typeLabels[verifyResult.accreditationType]}</strong></div>
                    <div>Statut: <strong>{verifyResult.status}</strong></div>
                    {verifyResult.eventName && <div>Evenement: <strong>{verifyResult.eventName}</strong></div>}
                    <div>Valide du: <strong>{new Date(verifyResult.validFrom).toLocaleDateString("fr-FR")}</strong></div>
                    {verifyResult.validUntil && <div>Au: <strong>{new Date(verifyResult.validUntil).toLocaleDateString("fr-FR")}</strong></div>}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Type distribution */}
          {stats && stats.byType.length > 0 && (
            <Card hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-bold text-navy">Repartition par type</h3>
              </div>
              {stats.byType.map((t) => (
                <div key={t.type} className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-navy">{typeLabels[t.type] || t.type}</span>
                  <span className="text-xs font-bold text-warm-gray">{t.count}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

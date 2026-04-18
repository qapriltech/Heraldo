"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Eye,
  Clock,
  FileBarChart,
  Plus,
  Loader2,
  Settings,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";

const TEAL = "#0E7490";

interface ClientDetail {
  id: string;
  clientName: string;
  clientSector: string;
  clientLogo: string | null;
  clientBrandColor: string | null;
  clientBrief: string | null;
  clientTone: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  isActive: boolean;
  reports: any[];
  whiteLabel: any | null;
  _count: { reports: number; timeEntries: number };
}

interface TimeEntry {
  id: string;
  description: string;
  durationMinutes: number;
  date: string;
  billable: boolean;
}

export default function AgenceClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [savingTime, setSavingTime] = useState(false);
  const [timeForm, setTimeForm] = useState({
    description: "",
    durationMinutes: 30,
    billable: true,
  });

  // White label state
  const [showWlForm, setShowWlForm] = useState(false);
  const [savingWl, setSavingWl] = useState(false);
  const [wlForm, setWlForm] = useState({
    senderName: "",
    senderEmail: "",
    emailSignatureHtml: "",
    reportBranding: "client",
  });

  useEffect(() => {
    loadClient();
    loadTimeEntries();
  }, [clientId]);

  async function loadClient() {
    setLoading(true);
    try {
      const res = await api.get<ClientDetail>(`/agency/clients/${clientId}`);
      setClient(res);
      if (res.whiteLabel) {
        setWlForm({
          senderName: res.whiteLabel.senderName || "",
          senderEmail: res.whiteLabel.senderEmail || "",
          emailSignatureHtml: res.whiteLabel.emailSignatureHtml || "",
          reportBranding: res.whiteLabel.reportBranding || "client",
        });
      }
    } catch (err) {
      console.error("Failed to load client", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeEntries() {
    try {
      const res = await api.get<{ data: TimeEntry[] }>(
        `/agency/clients/${clientId}/time-entries`
      );
      setTimeEntries(res.data);
    } catch (err) {
      console.error("Failed to load time entries", err);
    }
  }

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      await api.post(`/agency/clients/${clientId}/report/generate`, {});
      loadClient();
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogTime(e: React.FormEvent) {
    e.preventDefault();
    setSavingTime(true);
    try {
      await api.post(`/agency/clients/${clientId}/time-entries`, timeForm);
      setShowTimeForm(false);
      setTimeForm({ description: "", durationMinutes: 30, billable: true });
      loadTimeEntries();
    } catch (err) {
      console.error("Failed to log time", err);
    } finally {
      setSavingTime(false);
    }
  }

  async function handleSaveWhiteLabel(e: React.FormEvent) {
    e.preventDefault();
    setSavingWl(true);
    try {
      await api.post(`/agency/clients/${clientId}/white-label`, wlForm);
      loadClient();
      setShowWlForm(false);
    } catch (err) {
      console.error("Failed to save white label", err);
    } finally {
      setSavingWl(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-warm-gray">Client introuvable.</p>
        <Link href="/agence/clients" className="text-sm font-semibold mt-2" style={{ color: TEAL }}>
          Retour aux clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/agence/clients"
        className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      {/* Client Header */}
      <div className="premium-card rounded-2xl p-6 bg-white/80 backdrop-blur-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
              style={{ background: client.clientBrandColor || TEAL }}
            >
              {client.clientName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-navy">
                {client.clientName}
              </h1>
              <p className="text-sm text-warm-gray">{client.clientSector}</p>
              <p className="text-xs text-warm-gray mt-1">
                {client.contactName} - {client.contactEmail}
                {client.contactPhone ? ` - ${client.contactPhone}` : ""}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              client.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {client.isActive ? "Actif" : "Inactif"}
          </span>
        </div>

        {client.clientBrief && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 text-sm text-warm-gray">
            <span className="font-semibold text-navy">Brief: </span>
            {client.clientBrief}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Rapports generes",
            value: client._count.reports,
            icon: FileBarChart,
          },
          {
            label: "Entrees temps",
            value: client._count.timeEntries,
            icon: Clock,
          },
          {
            label: "Dernier rapport",
            value:
              client.reports.length > 0
                ? client.reports[0].reportMonth
                : "N/A",
            icon: Send,
          },
          {
            label: "Portee estimee",
            value:
              client.reports.length > 0
                ? client.reports[0].estimatedReach.toLocaleString("fr-FR")
                : "0",
            icon: Eye,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="premium-card rounded-2xl p-4 bg-white/80 border border-gray-100"
          >
            <kpi.icon className="w-5 h-5 mb-2" style={{ color: TEAL }} />
            <p className="text-lg font-extrabold text-navy">{kpi.value}</p>
            <p className="text-[11px] text-warm-gray">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Section */}
        <div className="premium-card rounded-2xl p-5 bg-white/80 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy">Rapports</h2>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: TEAL }}
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Generer un rapport
            </button>
          </div>

          {client.reports.length === 0 ? (
            <p className="text-sm text-warm-gray text-center py-6">
              Aucun rapport genere.
            </p>
          ) : (
            <div className="space-y-2">
              {client.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <div>
                    <p className="text-xs font-bold text-navy">
                      {report.reportMonth}
                    </p>
                    <p className="text-[11px] text-warm-gray">
                      {report.communiquesSent} communiques -{" "}
                      {report.estimatedReach.toLocaleString("fr-FR")} portee
                    </p>
                  </div>
                  {report.pdfUrl && (
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: TEAL }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Entries Section */}
        <div className="premium-card rounded-2xl p-5 bg-white/80 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy">Suivi du temps</h2>
            <button
              onClick={() => setShowTimeForm(!showTimeForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: TEAL }}
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {showTimeForm && (
            <form
              onSubmit={handleLogTime}
              className="mb-4 p-3 rounded-xl bg-gray-50 space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Description de la tache"
                value={timeForm.description}
                onChange={(e) =>
                  setTimeForm({ ...timeForm, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  required
                  min={1}
                  value={timeForm.durationMinutes}
                  onChange={(e) =>
                    setTimeForm({
                      ...timeForm,
                      durationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
                />
                <span className="text-xs text-warm-gray">minutes</span>
                <label className="flex items-center gap-1.5 text-xs text-navy">
                  <input
                    type="checkbox"
                    checked={timeForm.billable}
                    onChange={(e) =>
                      setTimeForm({
                        ...timeForm,
                        billable: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  Facturable
                </label>
                <button
                  type="submit"
                  disabled={savingTime}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: TEAL }}
                >
                  {savingTime ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          )}

          {timeEntries.length === 0 ? (
            <p className="text-sm text-warm-gray text-center py-6">
              Aucune entree de temps.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <div>
                    <p className="text-xs font-bold text-navy">
                      {entry.description}
                    </p>
                    <p className="text-[11px] text-warm-gray">
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                      {entry.billable ? " - Facturable" : ""}
                    </p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: TEAL }}>
                    {entry.durationMinutes} min
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* White Label Section */}
      <div className="premium-card rounded-2xl p-5 bg-white/80 border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" style={{ color: TEAL }} />
            <h2 className="text-sm font-bold text-navy">
              Configuration White Label
            </h2>
          </div>
          <button
            onClick={() => setShowWlForm(!showWlForm)}
            className="text-xs font-semibold"
            style={{ color: TEAL }}
          >
            {showWlForm ? "Fermer" : client.whiteLabel ? "Modifier" : "Configurer"}
          </button>
        </div>

        {client.whiteLabel && !showWlForm && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[11px] text-warm-gray">Expediteur</p>
              <p className="text-xs font-bold text-navy">
                {client.whiteLabel.senderName}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[11px] text-warm-gray">Email</p>
              <p className="text-xs font-bold text-navy">
                {client.whiteLabel.senderEmail}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[11px] text-warm-gray">Branding rapport</p>
              <p className="text-xs font-bold text-navy">
                {client.whiteLabel.reportBranding === "client"
                  ? "Au nom du client"
                  : "Au nom de l'agence"}
              </p>
            </div>
          </div>
        )}

        {showWlForm && (
          <form onSubmit={handleSaveWhiteLabel} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Nom expediteur *
                </label>
                <input
                  type="text"
                  required
                  value={wlForm.senderName}
                  onChange={(e) =>
                    setWlForm({ ...wlForm, senderName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">
                  Email expediteur *
                </label>
                <input
                  type="email"
                  required
                  value={wlForm.senderEmail}
                  onChange={(e) =>
                    setWlForm({ ...wlForm, senderEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Branding rapport
              </label>
              <select
                value={wlForm.reportBranding}
                onChange={(e) =>
                  setWlForm({ ...wlForm, reportBranding: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
              >
                <option value="client">Au nom du client</option>
                <option value="agency">Au nom de l&apos;agence</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Signature email HTML
              </label>
              <textarea
                value={wlForm.emailSignatureHtml}
                onChange={(e) =>
                  setWlForm({
                    ...wlForm,
                    emailSignatureHtml: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingWl}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                style={{ background: TEAL }}
              >
                {savingWl && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {!client.whiteLabel && !showWlForm && (
          <p className="text-sm text-warm-gray text-center py-4">
            Aucune configuration white label.
          </p>
        )}
      </div>
    </div>
  );
}

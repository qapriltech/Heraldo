"use client";

import { useState, useEffect } from "react";
import {
  FileBarChart,
  Download,
  Loader2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

const TEAL = "#0E7490";

interface Client {
  id: string;
  clientName: string;
  clientBrandColor: string | null;
}

interface Report {
  id: string;
  agencyClientId: string;
  reportMonth: string;
  communiquesSent: number;
  avgOpenRate: number;
  estimatedReach: number;
  mentions: number;
  pdfUrl: string | null;
  generatedAt: string;
  clientName?: string;
  clientColor?: string | null;
}

export default function AgenceRapportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      // First load all clients, then load reports for each
      const clientsRes = await api.get<{ data: Client[] }>("/agency/clients");
      const allReports: Report[] = [];

      for (const client of clientsRes.data) {
        try {
          const reports = await api.get<any[]>(
            `/agency/clients/${client.id}/reports`
          );
          for (const report of reports) {
            allReports.push({
              ...report,
              clientName: client.clientName,
              clientColor: client.clientBrandColor,
            });
          }
        } catch {
          // skip clients with no reports
        }
      }

      // Sort by generatedAt desc
      allReports.sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() -
          new Date(a.generatedAt).getTime()
      );

      setReports(allReports);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy">Rapports</h1>
        <p className="text-sm text-warm-gray mt-1">
          Tous les rapports generes pour vos clients
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
        </div>
      ) : reports.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center bg-white/80 border border-gray-100">
          <FileBarChart
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: TEAL }}
          />
          <h3 className="text-lg font-bold text-navy mb-2">
            Aucun rapport
          </h3>
          <p className="text-sm text-warm-gray">
            Generez un rapport depuis la fiche d&apos;un client.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="premium-card rounded-2xl p-5 bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: report.clientColor || TEAL,
                  }}
                >
                  {(report.clientName || "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">
                    {report.clientName}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-warm-gray mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.reportMonth}
                    </span>
                    <span>{report.communiquesSent} communiques</span>
                    <span>
                      {report.estimatedReach.toLocaleString("fr-FR")} portee
                    </span>
                    <span>{report.mentions} mentions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-warm-gray">
                  {new Date(report.generatedAt).toLocaleDateString("fr-FR")}
                </span>
                {report.pdfUrl ? (
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: TEAL }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </a>
                ) : (
                  <span className="text-[11px] text-warm-gray italic">
                    Pas de PDF
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

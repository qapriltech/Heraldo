"use client";

import { motion } from "framer-motion";
import {
  Archive,
  Search,
  Upload,
  FileText,
  Shield,
  Download,
  Hash,
  Calendar,
  Tag,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Document {
  id: string;
  title: string;
  documentType: string;
  contentText?: string;
  sha256Hash?: string;
  certifiedAt?: string;
  isPublic: boolean;
  tags: string[];
  fileUrl?: string;
  createdAt: string;
}

function getInstitutionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("heraldo_user") || "{}");
    return user.institutionId || "";
  } catch { return ""; }
}

const docTypes = [
  { key: "all", label: "Tous" },
  { key: "communique", label: "Communiques" },
  { key: "discours", label: "Discours" },
  { key: "arrete", label: "Arretes" },
  { key: "circulaire", label: "Circulaires" },
  { key: "conference", label: "Conferences" },
  { key: "rapport", label: "Rapports" },
];

export default function ArchivePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [certificate, setCertificate] = useState<any>(null);

  const institutionId = getInstitutionId();

  const loadDocuments = async (q?: string, docType?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (institutionId) params.set("institutionId", institutionId);
      if (q) params.set("q", q);
      if (docType && docType !== "all") params.set("documentType", docType);
      const r = await api.get<any>(`/archive/documents?${params.toString()}`);
      setDocuments(r.data ?? r ?? []);
      setTotal(r.meta?.total ?? (r.data ?? []).length);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadDocuments(); }, [institutionId]);

  const handleSearch = () => { loadDocuments(searchQuery, typeFilter); };

  const handleViewCertificate = async (id: string) => {
    try {
      const cert = await api.get<any>(`/archive/documents/${id}/certificate`);
      setCertificate(cert);
    } catch {}
  };

  const handleImport = () => {
    const title = prompt("Titre du document:");
    if (!title) return;
    const docType = prompt("Type (communique, discours, arrete, circulaire, conference, rapport):");
    if (!docType) return;
    api.post("/archive/documents", { institutionId, title, documentType: docType })
      .then((doc: any) => setDocuments((prev) => [doc, ...prev]))
      .catch(() => {});
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2">
              <Archive className="w-6 h-6 text-gold" /> Archives Certifiees
            </h1>
            <p className="text-warm-gray text-sm mt-1">Documents officiels avec certification SHA-256.</p>
          </div>
          <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold shadow-md hover:bg-navy/90 transition-all">
            <Plus className="w-4 h-4" /> Archiver un document
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Recherche plein texte dans les archives..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/10 bg-white text-sm"
          />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 rounded-xl bg-gold text-navy-dark text-sm font-bold">
          Rechercher
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
        {docTypes.map((dt) => (
          <button
            key={dt.key}
            onClick={() => { setTypeFilter(dt.key); loadDocuments(searchQuery, dt.key); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${typeFilter === dt.key ? "bg-navy text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"}`}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-xs text-warm-gray">
        <span><strong className="text-navy">{total}</strong> documents</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 && (
            <div className="col-span-full">
              <Card hover={false}><p className="text-sm text-warm-gray text-center py-8">Aucun document dans les archives.</p></Card>
            </div>
          )}
          {documents.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm" className="flex flex-col gap-3 h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-[10px] font-bold text-warm-gray uppercase">{doc.documentType}</span>
                  </div>
                  {doc.sha256Hash && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[9px] font-bold">
                      <Shield className="w-3 h-3" /> Certifie
                    </div>
                  )}
                </div>
                <p className="font-bold text-navy text-sm line-clamp-2">{doc.title}</p>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-navy/5 text-navy/60 font-medium">{t}</span>
                    ))}
                  </div>
                )}
                {doc.sha256Hash && (
                  <div className="flex items-center gap-1 text-[9px] text-warm-gray font-mono truncate">
                    <Hash className="w-3 h-3 shrink-0" /> {doc.sha256Hash.substring(0, 16)}...
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-navy/5">
                  <span className="text-[10px] text-warm-gray">{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewCertificate(doc.id)} className="text-[10px] font-bold text-gold hover:underline flex items-center gap-0.5">
                      <Shield className="w-3 h-3" /> Certificat
                    </button>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} className="text-[10px] font-bold text-navy hover:underline flex items-center gap-0.5">
                        <Download className="w-3 h-3" /> Telecharger
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate modal */}
      {certificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCertificate(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-navy">Certificat d'authenticite</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-warm-gray">Document:</span> <span className="font-bold text-navy">{certificate.title}</span></div>
              <div><span className="text-warm-gray">Type:</span> <span className="font-bold text-navy">{certificate.documentType}</span></div>
              <div><span className="text-warm-gray">Certifie le:</span> <span className="font-bold text-navy">{certificate.certifiedAt ? new Date(certificate.certifiedAt).toLocaleString("fr-FR") : "-"}</span></div>
              <div className="p-3 rounded-lg bg-navy/5 font-mono text-xs break-all">
                <span className="text-warm-gray">SHA-256:</span><br />{certificate.sha256Hash}
              </div>
            </div>
            <button onClick={() => setCertificate(null)} className="w-full mt-4 py-2 rounded-xl bg-navy text-white text-sm font-bold">Fermer</button>
          </motion.div>
        </div>
      )}
    </>
  );
}

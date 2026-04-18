"use client";

import { motion } from "framer-motion";
import {
  Archive,
  Search,
  FileText,
  Shield,
  Download,
  Hash,
  Loader2,
  Plus,
  Eye,
  Sparkles,
  CheckCircle,
  BookOpen,
  ScrollText,
  FileCheck,
  Gavel,
} from "lucide-react";
import { useState, useEffect } from "react";
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

const docTypeIcons: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  communique: { icon: FileText, color: "text-gold", bg: "bg-gold/10" },
  discours: { icon: BookOpen, color: "text-purple", bg: "bg-purple/10" },
  arrete: { icon: Gavel, color: "text-red", bg: "bg-red/10" },
  circulaire: { icon: ScrollText, color: "text-teal", bg: "bg-teal/10" },
  conference: { icon: FileCheck, color: "text-orange", bg: "bg-orange/10" },
  rapport: { icon: FileText, color: "text-navy", bg: "bg-navy/10" },
};

export default function ArchivePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Archive className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Coffre-fort numerique</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Archives Certifiees</h1>
            <p className="text-warm-gray text-sm mt-1">Documents officiels avec certification SHA-256.</p>
          </div>
          <button onClick={handleImport} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Archiver un document
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="premium-card p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Recherche plein texte dans les archives..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm placeholder:text-warm-gray/50"
              />
            </div>
            <button onClick={handleSearch} className="gradient-gold text-navy-dark font-bold text-sm px-5 py-3 rounded-2xl shadow-lg">
              Rechercher
            </button>
          </div>
        </div>
      </motion.div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {docTypes.map((dt) => (
          <button
            key={dt.key}
            onClick={() => { setTypeFilter(dt.key); loadDocuments(searchQuery, dt.key); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${typeFilter === dt.key ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray hover:text-navy border border-navy/10"}`}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 mb-4">
        <Archive className="w-4 h-4 text-gold" />
        <span className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">{total} documents</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 && (
            <div className="col-span-full">
              <div className="premium-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-lg font-serif text-navy mb-2">Aucun document</h3>
                <p className="text-sm text-warm-gray mb-6">Archivez votre premier document officiel pour commencer.</p>
                <button onClick={handleImport} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Archiver
                </button>
              </div>
            </div>
          )}
          {documents.map((doc, i) => {
            const dtConf = docTypeIcons[doc.documentType] || { icon: FileText, color: "text-gold", bg: "bg-gold/10" };
            const DIcon = dtConf.icon;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <div className="premium-card p-5 flex flex-col gap-3 h-full group cursor-pointer relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    doc.documentType === "arrete" ? "from-red to-orange" :
                    doc.documentType === "discours" ? "from-purple to-navy" :
                    doc.documentType === "circulaire" ? "from-teal to-green" :
                    "from-gold to-orange"
                  }`} />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl ${dtConf.bg} flex items-center justify-center shrink-0`}>
                        <DIcon className={`w-4 h-4 ${dtConf.color}`} />
                      </div>
                      <span className="text-[10px] font-extrabold text-warm-gray uppercase tracking-wider">{doc.documentType}</span>
                    </div>
                    {doc.sha256Hash && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green/10">
                        <Shield className="w-3 h-3 text-green" />
                        <span className="text-[9px] font-extrabold text-green uppercase tracking-wider">Certifie</span>
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-navy text-sm line-clamp-2 group-hover:text-gold transition-colors">{doc.title}</p>
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((t) => (
                        <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-navy/5 text-navy/60 font-bold">{t}</span>
                      ))}
                    </div>
                  )}
                  {doc.sha256Hash && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/5 border border-gold/10">
                      <Shield className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="text-[9px] text-navy font-mono truncate">{doc.sha256Hash.substring(0, 20)}...</span>
                    </div>
                  )}
                  {doc.certifiedAt && (
                    <div className="flex items-center gap-1 text-[10px] text-green font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Certifie le {new Date(doc.certifiedAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-navy/5">
                    <span className="text-[10px] text-warm-gray">{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewCertificate(doc.id)} className="text-[10px] font-extrabold text-gold hover:text-gold-dark transition-colors flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> Certificat
                      </button>
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} className="text-[10px] font-extrabold text-navy hover:text-gold transition-colors flex items-center gap-0.5">
                          <Download className="w-3 h-3" /> Telecharger
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Certificate modal */}
      {certificate && (
        <div className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setCertificate(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green to-teal" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green" />
              </div>
              <h3 className="font-serif text-navy text-lg">Certificat d&apos;authenticite</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-navy/5"><span className="text-warm-gray">Document</span> <span className="font-bold text-navy">{certificate.title}</span></div>
              <div className="flex justify-between py-2 border-b border-navy/5"><span className="text-warm-gray">Type</span> <span className="font-bold text-navy">{certificate.documentType}</span></div>
              <div className="flex justify-between py-2 border-b border-navy/5"><span className="text-warm-gray">Certifie le</span> <span className="font-bold text-navy">{certificate.certifiedAt ? new Date(certificate.certifiedAt).toLocaleString("fr-FR") : "-"}</span></div>
              <div className="p-4 rounded-xl bg-navy/5 font-mono text-xs break-all">
                <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider block mb-1">SHA-256</span>
                {certificate.sha256Hash}
              </div>
            </div>
            <button onClick={() => setCertificate(null)} className="w-full mt-5 py-3 rounded-2xl gradient-gold text-navy-dark font-extrabold text-sm shadow-lg">Fermer</button>
          </motion.div>
        </div>
      )}
    </>
  );
}

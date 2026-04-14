"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Zap,
  AlignLeft,
  Upload,
  Image,
  Video,
  File,
  Target,
  Globe,
  MapPin,
  Tags,
  Send,
  Save,
  Eye,
  Newspaper,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type PreviewTab = "presse" | "web" | "social";

interface Journalist {
  id: string;
  user: { fullName: string; avatarUrl?: string };
  mediaOrganization?: { name: string; type: string };
  specialties: string[];
  tier: string;
}

const regions = ["Abidjan", "Bouake", "Yamoussoukro", "San Pedro", "Korhogo", "National", "International"];

function getUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("heraldo_user") || "null"); } catch { return null; }
}

export default function NewCommuniquePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [chapeau, setChapeau] = useState("");
  const [content, setContent] = useState("");
  const [contactPresse, setContactPresse] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("presse");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [diffusing, setDiffusing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; hash?: string } | null>(null);
  // RÉSEAU — sélection journalistes
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [selectedJournalists, setSelectedJournalists] = useState<string[]>([]);
  const [journalistSearch, setJournalistSearch] = useState("");
  const [loadingJournalists, setLoadingJournalists] = useState(false);
  const [journalistsLoaded, setJournalistsLoaded] = useState(false);

  // Charger les journalistes depuis l'API RÉSEAU
  const loadJournalists = async (search?: string) => {
    setLoadingJournalists(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await api.get<{ data: Journalist[]; meta: any }>(`/reseau/journalists?${params}`);
      setJournalists(res.data);
      setJournalistsLoaded(true);
    } catch { /* silencieux */ }
    finally { setLoadingJournalists(false); }
  };

  // Charger au premier rendu
  useEffect(() => { loadJournalists(); }, []);

  const toggleJournalist = (id: string) =>
    setSelectedJournalists(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);

  const toggleRegion = (r: string) =>
    setSelectedRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const isValid = title.length > 0 && content.length > 0 && chapeau.length > 0;

  // Sauvegarder en brouillon
  const handleSave = async () => {
    if (!title || !content) { setError("Le titre et le contenu sont obligatoires"); return; }
    setSaving(true); setError(null);
    try {
      const user = getUser();
      const res = await api.post<any>("/communiques", {
        title, chapeau, bodyContent: content, contactPresse,
        ...(user?.institution?.id ? { institutionId: user.institution.id } : {}),
      });
      setSuccess({ id: res.id });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  // Sauvegarder + Diffuser
  const handleDiffuse = async () => {
    if (!isValid) { setError("Titre, chapeau et contenu sont obligatoires (RG-EMI-02)"); return; }
    setDiffusing(true); setError(null);
    try {
      const user = getUser();
      // Créer le communiqué
      const cp = await api.post<any>("/communiques", {
        title, chapeau, bodyContent: content, contactPresse,
        ...(user?.institution?.id ? { institutionId: user.institution.id } : {}),
      });

      // Diffuser aux journalistes sélectionnés
      await api.post<any>(`/communiques/${cp.id}/diffuse`, {
        channels: ["EMAIL", "WHATSAPP"],
        journalistIds: selectedJournalists,
      });

      // Récupérer le hash
      const hash = await api.get<any>(`/communiques/${cp.id}/hash`);

      setSuccess({ id: cp.id, hash: hash.sha256Hash });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la diffusion");
    } finally { setDiffusing(false); }
  };

  // Ecran de succès
  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
          <Card hover={false} padding="lg">
            <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green" />
            </div>
            <h2 className="text-2xl font-extrabold text-navy mb-2">
              {success.hash ? "Communique diffuse !" : "Brouillon sauvegarde !"}
            </h2>
            <p className="text-warm-gray mb-6">
              {success.hash
                ? "Votre communique a ete certifie SHA-256 et diffuse aux medias cibles."
                : "Votre communique a ete sauvegarde. Vous pouvez le modifier et le diffuser plus tard."}
            </p>
            {success.hash && (
              <div className="bg-ivory rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Certificat SHA-256</span>
                </div>
                <code className="text-[11px] text-navy/60 break-all font-mono">{success.hash}</code>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/institution/communiques")}>
                Voir mes communiques
              </Button>
              <Button className="flex-1" onClick={() => { setSuccess(null); setTitle(""); setChapeau(""); setContent(""); setContactPresse(""); }}>
                Nouveau communique
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/institution/communiques" className="p-2 rounded-lg hover:bg-ivory transition-colors">
              <ArrowLeft className="w-5 h-5 text-navy" />
            </Link>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold" />
              <span className="text-lg font-bold text-navy">Nouveau communique</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" />
              Brouillon
            </Button>
            <Button size="sm" onClick={handleDiffuse} loading={diffusing} disabled={!isValid}>
              <Send className="w-4 h-4" />
              Diffuser
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-3 rounded-xl bg-red/10 text-red text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red/60 hover:text-red cursor-pointer">✕</button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card hover={false}>
              <label className="block text-sm font-semibold text-navy mb-2">Titre du communique *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Inauguration du centre de sante de Cocody Angre" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/50" />
            </Card>

            {/* Chapeau — RG-EMI-02 */}
            <Card hover={false}>
              <label className="block text-sm font-semibold text-navy mb-1">Chapeau *</label>
              <p className="text-[11px] text-warm-gray mb-2">Resume en 2 a 5 lignes — obligatoire pour la diffusion (RG-EMI-02)</p>
              <textarea value={chapeau} onChange={e => setChapeau(e.target.value)} rows={3} placeholder="Resume concis du communique en 2 a 5 lignes..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/40 resize-none" />
            </Card>

            {/* Content */}
            <Card hover={false}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-navy">Corps du communique *</label>
                <span className={`text-xs font-medium ${wordCount >= 150 && wordCount <= 800 ? "text-green" : "text-warm-gray"}`}>
                  {wordCount} mot{wordCount > 1 ? "s" : ""} {wordCount < 150 ? "(min. 150)" : wordCount > 800 ? "(max. 800)" : ""}
                </span>
              </div>
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-ivory rounded-t-xl border border-b-0 border-gray-200">
                {["B", "I", "U", "H1", "H2", "UL", "OL", "Link", "Quote"].map(tool => (
                  <button key={tool} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-navy hover:bg-white transition-colors cursor-pointer">{tool}</button>
                ))}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} placeholder="Redigez le corps de votre communique ici..." className="w-full px-4 py-3 rounded-b-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/40 resize-none" />
            </Card>

            {/* Contact presse */}
            <Card hover={false}>
              <label className="block text-sm font-semibold text-navy mb-2">Contact presse</label>
              <input type="text" value={contactPresse} onChange={e => setContactPresse(e.target.value)} placeholder="Ex: Direction Communication — comm@institution.ci — +225 07 08 09 10 11" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/50" />
            </Card>

            {/* File upload */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold" />
                Pieces jointes
              </h2>
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => { e.preventDefault(); setDragActive(false); }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"}`}
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center"><Image className="w-5 h-5 text-warm-gray" /></div>
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center"><Video className="w-5 h-5 text-warm-gray" /></div>
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center"><File className="w-5 h-5 text-warm-gray" /></div>
                </div>
                <p className="text-sm font-medium text-navy">Glissez vos fichiers ici</p>
                <p className="text-xs text-warm-gray mt-1">Photos HD, videos, PDF — Max 50 Mo</p>
              </div>
            </Card>

            {/* Preview tabs — 3 formats auto-générés */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gold" />
                Apercu des 3 formats (F-EMI-01)
              </h2>
              <div className="flex gap-2 mb-4">
                {([
                  { id: "presse" as PreviewTab, label: "Presse ecrite" },
                  { id: "web" as PreviewTab, label: "Web SEO" },
                  { id: "social" as PreviewTab, label: "Reseaux sociaux" },
                ]).map(f => (
                  <button key={f.id} onClick={() => setPreviewTab(f.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${previewTab === f.id ? "bg-navy text-white" : "bg-ivory text-warm-gray hover:text-navy"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={previewTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="rounded-xl border border-gray-200 bg-white p-6 min-h-[200px]">
                  {previewTab === "presse" && (
                    <div className="space-y-3">
                      <Badge variant="gold">Communique de presse</Badge>
                      <h3 className="text-xl font-bold text-navy">{title || "Titre du communique"}</h3>
                      {chapeau && <p className="text-sm text-navy/80 font-medium italic border-l-3 border-gold pl-3">{chapeau}</p>}
                      <p className="text-sm text-warm-gray leading-relaxed whitespace-pre-wrap">{content || "Le corps de votre communique..."}</p>
                      {contactPresse && <p className="text-xs text-warm-gray border-t border-gray-100 pt-3 mt-4">Contact : {contactPresse}</p>}
                      <p className="text-[10px] text-gold italic">Communique diffuse via HERALDO</p>
                    </div>
                  )}
                  {previewTab === "web" && (
                    <div className="space-y-3">
                      <Badge variant="info">Format Web SEO</Badge>
                      <p className="text-[11px] text-green font-mono">&lt;title&gt;{(title || "Titre").substring(0, 60)}&lt;/title&gt;</p>
                      <p className="text-[11px] text-warm-gray font-mono">&lt;meta description=&quot;{(chapeau || content || "...").substring(0, 155)}&quot;&gt;</p>
                      <h3 className="text-xl font-bold text-navy mt-4">{title || "Titre"}</h3>
                      <p className="text-sm text-warm-gray leading-relaxed">{content ? content.substring(0, 500) + (content.length > 500 ? "..." : "") : "Contenu optimise SEO..."}</p>
                    </div>
                  )}
                  {previewTab === "social" && (
                    <div className="space-y-3 max-w-sm mx-auto">
                      <Badge variant="warning">Format Reseaux Sociaux</Badge>
                      <div className="bg-ivory rounded-xl p-4">
                        <p className="text-sm font-bold text-navy mb-2">{title || "Titre"}</p>
                        <p className="text-sm text-warm-gray">{(chapeau || content || "...").substring(0, 250)}{(chapeau || content || "").length > 250 ? "..." : ""}</p>
                        <p className="text-xs text-gold mt-2 font-medium">#HERALDO</p>
                      </div>
                      <p className="text-[10px] text-warm-gray text-center">{((chapeau || content || "").length + (title || "").length)} / 280 caracteres</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Sélecteur de journalistes — RÉSEAU */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-gold" />
                Journalistes cibles
              </h2>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Rechercher un journaliste ou media..."
                  value={journalistSearch}
                  onChange={e => { setJournalistSearch(e.target.value); loadJournalists(e.target.value); }}
                  className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {loadingJournalists && !journalistsLoaded ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 text-gold animate-spin mx-auto" />
                  </div>
                ) : journalists.length === 0 ? (
                  <p className="text-xs text-warm-gray text-center py-4">Aucun journaliste trouve</p>
                ) : (
                  journalists.map(j => {
                    const selected = selectedJournalists.includes(j.id);
                    return (
                      <label key={j.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${selected ? "bg-gold/10 ring-1 ring-gold/30" : "hover:bg-ivory"}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleJournalist(j.id)} className="w-4 h-4 rounded accent-gold shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{j.user.fullName}</p>
                          <p className="text-[10px] text-warm-gray truncate">{j.mediaOrganization?.name || "Independant"} — {j.specialties.join(", ")}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${j.tier === "tier1" ? "bg-gold/20 text-gold-dark" : j.tier === "tier2" ? "bg-navy/10 text-navy" : "bg-ivory text-warm-gray"}`}>
                          {j.tier === "tier1" ? "TOP" : j.tier === "tier2" ? "STD" : "LOC"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-warm-gray">
                  {selectedJournalists.length === 0 ? "Selectionnez les destinataires" : `${selectedJournalists.length} journaliste(s) selectionne(s)`}
                </p>
                {journalists.length > 0 && (
                  <button onClick={() => setSelectedJournalists(selectedJournalists.length === journalists.length ? [] : journalists.map(j => j.id))} className="text-[10px] font-bold text-gold cursor-pointer">
                    {selectedJournalists.length === journalists.length ? "Deselectionner tout" : "Tout selectionner"}
                  </button>
                )}
              </div>
            </Card>

            {/* Geographic targeting */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                Zone geographique
              </h2>
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <button key={region} onClick={() => toggleRegion(region)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${selectedRegions.includes(region) ? "bg-navy text-white" : "bg-ivory text-warm-gray hover:text-navy"}`}>
                    {region}
                  </button>
                ))}
              </div>
            </Card>

            {/* Summary card */}
            <Card hover={false} dark>
              <h2 className="text-sm font-semibold text-gold mb-4">Resume de diffusion</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Titre</span>
                  <span className="text-white font-medium truncate ml-4 max-w-[150px]">{title || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chapeau</span>
                  <span className={`font-medium ${chapeau ? "text-green-light" : "text-red/60"}`}>{chapeau ? "OK" : "Manquant"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Corps</span>
                  <span className={`font-medium ${wordCount >= 150 ? "text-green-light" : "text-orange"}`}>{wordCount} mots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Journalistes</span>
                  <span className={`font-medium ${selectedJournalists.length > 0 ? "text-green-light" : "text-warm-gray"}`}>{selectedJournalists.length || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zones</span>
                  <span className="text-white font-medium">{selectedRegions.join(", ") || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact presse</span>
                  <span className={`font-medium ${contactPresse ? "text-green-light" : "text-warm-gray"}`}>{contactPresse ? "OK" : "Optionnel"}</span>
                </div>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  <span className="text-xs text-gold font-bold uppercase tracking-wider">Certification SHA-256 auto</span>
                </div>
              </div>

              <Button className="w-full" size="md" onClick={handleDiffuse} loading={diffusing} disabled={!isValid}>
                <Send className="w-4 h-4" />
                Diffuser le communique
              </Button>

              {!isValid && (
                <p className="text-[10px] text-red/60 text-center mt-2">Titre, chapeau et corps requis</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

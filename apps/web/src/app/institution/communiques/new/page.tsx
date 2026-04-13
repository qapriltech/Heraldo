"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

type Format = "long" | "court" | "flash";

const formats: { id: Format; label: string; icon: typeof FileText; desc: string }[] = [
  {
    id: "long",
    label: "Long",
    icon: FileText,
    desc: "Communique complet avec details, citations et annexes",
  },
  {
    id: "court",
    label: "Court",
    icon: AlignLeft,
    desc: "Resume concis pour diffusion rapide",
  },
  {
    id: "flash",
    label: "Flash",
    icon: Zap,
    desc: "Information urgente en quelques lignes",
  },
];

const mediaTypes = [
  { id: "presse_ecrite", label: "Presse ecrite", count: 245 },
  { id: "radio", label: "Radio", count: 89 },
  { id: "television", label: "Television", count: 67 },
  { id: "presse_en_ligne", label: "Presse en ligne", count: 312 },
  { id: "agences", label: "Agences de presse", count: 34 },
];

const regions = [
  "Abidjan",
  "Bouake",
  "Yamoussoukro",
  "San Pedro",
  "Korhogo",
  "National",
  "International",
];

export default function NewCommuniquePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeFormat, setActiveFormat] = useState<Format>("long");
  const [previewTab, setPreviewTab] = useState<Format>("long");
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const toggleMedia = (id: string) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleRegion = (r: string) => {
    setSelectedRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/communiques"
              className="p-2 rounded-lg hover:bg-ivory transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-navy" />
            </Link>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold" />
              <span className="text-lg font-bold text-navy">
                Nouveau communique
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Save className="w-4 h-4" />
              Brouillon
            </Button>
            <Button size="sm">
              <Send className="w-4 h-4" />
              Diffuser
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format selection */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                Format du communique
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFormat(f.id)}
                    className={`p-4 rounded-xl text-left transition-all cursor-pointer border-2
                      ${
                        activeFormat === f.id
                          ? "border-gold bg-gold/5"
                          : "border-transparent bg-ivory hover:bg-ivory-dark"
                      }`}
                  >
                    <f.icon
                      className={`w-5 h-5 mb-2 ${activeFormat === f.id ? "text-gold" : "text-warm-gray"}`}
                    />
                    <div className="font-semibold text-navy text-sm">
                      {f.label}
                    </div>
                    <div className="text-xs text-warm-gray mt-1">
                      {f.desc}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Title */}
            <Card hover={false}>
              <label className="block text-sm font-semibold text-navy mb-2">
                Titre du communique
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Resultats financiers T1 2026..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/50"
              />
            </Card>

            {/* WYSIWYG Editor */}
            <Card hover={false}>
              <label className="block text-sm font-semibold text-navy mb-2">
                Contenu
              </label>
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-ivory rounded-t-xl border border-b-0 border-gray-200">
                {["B", "I", "U", "H1", "H2", "UL", "OL", "Link", "Quote"].map(
                  (tool) => (
                    <button
                      key={tool}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-navy hover:bg-white transition-colors cursor-pointer"
                    >
                      {tool}
                    </button>
                  ),
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Redigez votre communique ici...

Utilisez la barre d'outils ci-dessus pour formater votre texte. Vous pouvez ajouter des titres, des listes, des liens et des citations."
                className="w-full px-4 py-3 rounded-b-xl border border-gray-200 bg-white text-navy placeholder-warm-gray/40 resize-none"
              />
            </Card>

            {/* File upload */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold" />
                Pieces jointes
              </h2>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${dragActive ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"}`}
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center">
                    <Image className="w-5 h-5 text-warm-gray" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center">
                    <Video className="w-5 h-5 text-warm-gray" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-ivory flex items-center justify-center">
                    <File className="w-5 h-5 text-warm-gray" />
                  </div>
                </div>
                <p className="text-sm font-medium text-navy">
                  Glissez vos fichiers ici
                </p>
                <p className="text-xs text-warm-gray mt-1">
                  Images, videos, PDF — Max 25 Mo par fichier
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Parcourir
                </Button>
              </div>
            </Card>

            {/* Preview tabs */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gold" />
                Apercu multi-format
              </h2>
              <div className="flex gap-2 mb-4">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPreviewTab(f.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                      ${previewTab === f.id ? "bg-navy text-white" : "bg-ivory text-warm-gray hover:text-navy"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-xl border border-gray-200 bg-white p-6 min-h-[200px]"
                >
                  {previewTab === "long" && (
                    <div className="space-y-3">
                      <Badge variant="gold">Communique de presse</Badge>
                      <h3 className="text-xl font-bold text-navy">
                        {title || "Titre du communique"}
                      </h3>
                      <p className="text-sm text-warm-gray leading-relaxed whitespace-pre-wrap">
                        {content ||
                          "Le contenu complet de votre communique apparaitra ici avec tous les details, citations et annexes."}
                      </p>
                    </div>
                  )}
                  {previewTab === "court" && (
                    <div className="space-y-3">
                      <Badge variant="info">Resume</Badge>
                      <h3 className="text-lg font-bold text-navy">
                        {title || "Titre du communique"}
                      </h3>
                      <p className="text-sm text-warm-gray">
                        {content
                          ? content.substring(0, 280) + (content.length > 280 ? "..." : "")
                          : "Version courte du communique (280 caracteres max)."}
                      </p>
                    </div>
                  )}
                  {previewTab === "flash" && (
                    <div className="space-y-3 text-center">
                      <Badge variant="warning">FLASH INFO</Badge>
                      <h3 className="text-lg font-bold text-navy">
                        {title || "Titre du communique"}
                      </h3>
                      <p className="text-sm text-warm-gray">
                        {content
                          ? content.substring(0, 140) + (content.length > 140 ? "..." : "")
                          : "Message flash urgent (140 caracteres max)."}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>

          {/* Right: Targeting sidebar */}
          <div className="space-y-6">
            {/* Media targeting */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-gold" />
                Ciblage media
              </h2>
              <div className="space-y-2">
                {mediaTypes.map((media) => (
                  <label
                    key={media.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-ivory transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(media.id)}
                      onChange={() => toggleMedia(media.id)}
                      className="w-4 h-4 rounded accent-gold"
                    />
                    <span className="flex-1 text-sm font-medium text-navy">
                      {media.label}
                    </span>
                    <span className="text-xs text-warm-gray bg-ivory px-2 py-1 rounded-md">
                      {media.count}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-warm-gray">
                  <Globe className="w-3 h-3 inline mr-1" />
                  {selectedMedia.length === 0
                    ? "Selectionnez les types de medias cibles"
                    : `${selectedMedia.length} type(s) selectionne(s)`}
                </p>
              </div>
            </Card>

            {/* Geographic targeting */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                Zone geographique
              </h2>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                      ${
                        selectedRegions.includes(region)
                          ? "bg-navy text-white"
                          : "bg-ivory text-warm-gray hover:text-navy"
                      }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </Card>

            {/* Thematic tags */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Tags className="w-4 h-4 text-gold" />
                Thematiques
              </h2>
              <input
                type="text"
                placeholder="Ajouter une thematique..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {["Economie", "Finance", "Gouvernance"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>

            {/* Summary */}
            <Card hover={false} dark>
              <h2 className="text-sm font-semibold text-gold mb-4">Resume</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Format</span>
                  <span className="text-white font-medium capitalize">
                    {activeFormat}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Medias cibles</span>
                  <span className="text-white font-medium">
                    {selectedMedia.length || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zones</span>
                  <span className="text-white font-medium">
                    {selectedRegions.length || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audience estimee</span>
                  <span className="text-gold font-semibold">~450</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="md">
                <Send className="w-4 h-4" />
                Diffuser le communique
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

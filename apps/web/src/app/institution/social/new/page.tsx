"use client";

import { motion } from "framer-motion";
import {
  Newspaper,
  ArrowLeft,
  Facebook,
  Instagram,
  Linkedin,
  Upload,
  Calendar,
  Send,
  Eye,
  Link2,
  UserCheck,
  Image,
  Clock,
  Type,
  CheckSquare,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    bg: "bg-blue-600",
    maxChars: 63206,
    format: "Post avec image/video",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-500",
    maxChars: 2200,
    format: "Carre 1080x1080",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-700",
    maxChars: 3000,
    format: "Post professionnel",
  },
];

const validators = [
  { id: "1", name: "Dir. Communication", role: "Directeur" },
  { id: "2", name: "Chef de Cabinet", role: "Validateur" },
  { id: "3", name: "Conseiller Media", role: "Reviseur" },
];

const linkedItems = [
  { id: "cp-047", label: "CP-2026-047 - Bilan economique Q1" },
  { id: "cp-046", label: "CP-2026-046 - Reforme fiscale" },
  { id: "ag-012", label: "Agenda - Inauguration port autonome" },
  { id: "ag-013", label: "Agenda - Conference investisseurs" },
];

export default function NewSocialPost() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "facebook",
  ]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule">("now");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState("");
  const [linkedItem, setLinkedItem] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const minMaxChars = Math.min(
    ...platforms
      .filter((p) => selectedPlatforms.includes(p.id))
      .map((p) => p.maxChars)
  );

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-lg font-bold text-navy">HERALDO</span>
            <span className="text-sm text-warm-gray ml-2 hidden sm:inline">
              | Nouvelle publication
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/institution/social">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
              IN
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-navy mb-1">
            Nouvelle publication
          </h1>
          <p className="text-warm-gray">
            Redigez et planifiez votre publication multi-plateforme.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Editor Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Platform Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-gold" />
                Plateformes
              </h2>
              <div className="flex flex-wrap gap-3">
                {platforms.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        active
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p.icon
                        className={`w-5 h-5 ${active ? p.color : "text-warm-gray"}`}
                      />
                      <div className="text-left">
                        <div
                          className={`text-sm font-semibold ${active ? "text-navy" : "text-warm-gray"}`}
                        >
                          {p.name}
                        </div>
                        <div className="text-xs text-warm-gray">
                          {p.format}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Text Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-gold" />
                Contenu
              </h2>
              <Card hover={false}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Redigez votre publication ici..."
                  className="w-full h-40 bg-transparent resize-none text-navy placeholder:text-warm-gray/50 focus:outline-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-medium ${content.length > minMaxChars ? "text-red" : "text-warm-gray"}`}
                    >
                      {content.length}
                    </span>
                    <span className="text-xs text-warm-gray">
                      / {minMaxChars.toLocaleString()} caracteres
                    </span>
                  </div>
                  {content.length > minMaxChars && (
                    <Badge variant="error">Limite depassee</Badge>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Media Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-gold" />
                Media
              </h2>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-gold/40 transition-colors cursor-pointer bg-white/50">
                <Upload className="w-10 h-10 text-warm-gray/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-navy mb-1">
                  Glissez-deposez vos fichiers ici
                </p>
                <p className="text-xs text-warm-gray">
                  PNG, JPG, MP4 - Max 50 Mo
                </p>
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" />
                Programmation
              </h2>
              <Card hover={false}>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setScheduleMode("now")}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      scheduleMode === "now"
                        ? "bg-gold text-navy-dark shadow-sm"
                        : "bg-gray-100 text-warm-gray hover:bg-gray-200"
                    }`}
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Publier maintenant
                  </button>
                  <button
                    onClick={() => setScheduleMode("schedule")}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      scheduleMode === "schedule"
                        ? "bg-gold text-navy-dark shadow-sm"
                        : "bg-gray-100 text-warm-gray hover:bg-gray-200"
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Programmer
                  </button>
                </div>
                {scheduleMode === "schedule" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-warm-gray mb-1 block">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-warm-gray mb-1 block">
                        Heure
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy bg-white"
                      />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Approval */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gold" />
                Validation
              </h2>
              <Card hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-navy font-medium">
                    Soumettre a validation
                  </span>
                  <button
                    onClick={() => setNeedsApproval(!needsApproval)}
                    className={`w-12 h-7 rounded-full transition-all duration-200 cursor-pointer ${
                      needsApproval ? "bg-gold" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        needsApproval
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {needsApproval && (
                  <select
                    value={selectedValidator}
                    onChange={(e) => setSelectedValidator(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy bg-white"
                  >
                    <option value="">Choisir un validateur...</option>
                    {validators.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} - {v.role}
                      </option>
                    ))}
                  </select>
                )}
              </Card>
            </motion.div>

            {/* Link to Item */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gold" />
                Lier a un element (optionnel)
              </h2>
              <Card hover={false}>
                <select
                  value={linkedItem}
                  onChange={(e) => setLinkedItem(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy bg-white"
                >
                  <option value="">Aucun element lie</option>
                  {linkedItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Card>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button className="flex-1">
                <Send className="w-4 h-4" />
                {scheduleMode === "now"
                  ? "Publier maintenant"
                  : "Programmer la publication"}
              </Button>
              <Button variant="outline">
                Brouillon
              </Button>
            </motion.div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              Apercu par plateforme
            </h2>
            <div className="space-y-4 sticky top-24">
              {platforms
                .filter((p) => selectedPlatforms.includes(p.id))
                .map((platform, i) => (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Card hover={false} padding="sm">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <div
                          className={`w-8 h-8 rounded-lg ${platform.bg} flex items-center justify-center`}
                        >
                          <platform.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-navy">
                          {platform.name}
                        </span>
                        <Badge variant="neutral">{platform.format}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-navy/10" />
                        <div>
                          <div className="text-xs font-semibold text-navy">
                            Ministere de l&apos;Economie
                          </div>
                          <div className="text-[10px] text-warm-gray">
                            A l&apos;instant
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-navy/70 mb-2 min-h-[40px] whitespace-pre-wrap">
                        {content || "Votre texte apparaitra ici..."}
                      </p>
                      <div className="w-full h-32 rounded-lg bg-gradient-to-br from-navy/5 to-gold/10 flex items-center justify-center">
                        <Image className="w-8 h-8 text-navy/15" />
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100 text-[10px] text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> J&apos;aime
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Commenter
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> Partager
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

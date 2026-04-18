"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Palette,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Smartphone,
  Clock,
  Download,
  Eye,
  Type,
  Loader2,
  Grid3X3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Category = "all" | "annonces" | "evenements" | "citations" | "realisations" | "voeux" | "crise";
type Format = "square" | "portrait" | "story" | "landscape";

interface Template {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  format: Format;
  colors: string[];
  uses: number;
}

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "annonces", label: "Annonces" },
  { id: "evenements", label: "Evenements" },
  { id: "citations", label: "Citations" },
  { id: "realisations", label: "Realisations" },
  { id: "voeux", label: "Voeux" },
  { id: "crise", label: "Crise" },
];

const formatConfig: Record<Format, { label: string; icon: typeof Square; ratio: string }> = {
  square: { label: "Carre", icon: Square, ratio: "aspect-square" },
  portrait: { label: "Portrait", icon: RectangleVertical, ratio: "aspect-[3/4]" },
  story: { label: "Story", icon: Smartphone, ratio: "aspect-[9/16]" },
  landscape: { label: "Paysage", icon: RectangleHorizontal, ratio: "aspect-video" },
};

const defaultBrandKit = {
  colors: ["#0D1B3E", "#C8A45C", "#E8742E", "#FFFFFF", "#1A7A3C"],
  fonts: ["DM Sans", "DM Serif Display"],
};

export default function StudioPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentVisuals, setRecentVisuals] = useState<{ title: string; date: string; format: Format }[]>([]);
  const [brandKit, setBrandKit] = useState<{ colors: string[]; fonts: string[] }>(defaultBrandKit);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/studio/templates").then((res) => setTemplates(res.data ?? [])).catch(() => {}),
      api.get<any>("/studio/brand-kit").then((res) => setBrandKit(res.data ?? res ?? defaultBrandKit)).catch(() => {}),
      api.get<any>("/studio/visuals").then((res) => setRecentVisuals(res.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement studio...</p>
        </div>
      </div>
    );
  }

  const filtered = activeCategory === "all" ? templates : templates.filter((t) => t.category === activeCategory);

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Creation visuelle</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Studio Visuel</h1>
            <p className="text-warm-gray text-sm mt-1">Creez des visuels professionnels pour votre communication.</p>
          </div>
          <button className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Generer un visuel
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Category Tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? "gradient-gold text-navy-dark shadow-lg"
                    : "bg-white text-warm-gray hover:text-navy border border-navy/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Section header */}
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="w-4 h-4 text-gold" />
            <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Galerie de templates</h2>
          </div>

          {/* Template Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((template, i) => {
              const fConf = formatConfig[template.format];
              const FIcon = fConf.icon;
              return (
                <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <div className="premium-card overflow-hidden cursor-pointer group">
                    <div
                      className={`w-full ${template.format === "story" ? "aspect-[9/16] max-h-48" : template.format === "portrait" ? "aspect-[3/4] max-h-48" : template.format === "landscape" ? "aspect-video" : "aspect-square"} flex items-center justify-center relative overflow-hidden`}
                      style={{
                        background: `linear-gradient(135deg, ${template.colors[0]}30, ${template.colors[1] || template.colors[0]}40)`,
                      }}
                    >
                      {/* Color swatches preview */}
                      <div className="flex gap-1.5">
                        {template.colors.map((c, idx) => (
                          <div key={idx} className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      {/* Format overlay badge */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 shadow-sm">
                        <FIcon className="w-3 h-3 text-navy" />
                        <span className="text-[9px] font-bold text-navy uppercase">{fConf.label}</span>
                      </div>
                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                        <button className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                          <Eye className="w-3.5 h-3.5 text-navy" />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                          <Download className="w-3.5 h-3.5 text-navy" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-navy mb-1 truncate group-hover:text-gold transition-colors">{template.title}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-navy/5 text-navy/60`}>
                          {template.category}
                        </span>
                        <span className="text-[10px] text-warm-gray font-semibold">{template.uses} utilisations</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="premium-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-navy mb-2">Aucun template</h3>
              <p className="text-sm text-warm-gray">Aucun template disponible dans cette categorie.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Brand Kit */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Charte graphique</h2>
            </div>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
              {/* Logo Placeholder */}
              <div className="w-full h-20 rounded-xl bg-navy flex items-center justify-center mb-5">
                <span className="text-gold font-serif text-xl">LOGO</span>
              </div>
              {/* Colors */}
              <div className="mb-5">
                <p className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-3">Couleurs</p>
                <div className="flex gap-2">
                  {brandKit.colors.map((c, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="w-10 h-10 rounded-xl border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-warm-gray opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {c}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Fonts */}
              <div>
                <p className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-3">Typographies</p>
                <div className="space-y-2">
                  {brandKit.fonts.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ivory/50 border border-navy/5">
                      <Type className="w-4 h-4 text-gold" />
                      <span className="text-sm font-semibold text-navy" style={{ fontFamily: f }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Visuals */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gold" />
              <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Visuels recents</h2>
            </div>
            <div className="premium-card p-5">
              {recentVisuals.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Image className="w-6 h-6 text-gold" />
                  </div>
                  <p className="text-xs text-warm-gray">Aucun visuel recent</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {recentVisuals.map((v, i) => {
                    const fConf = formatConfig[v.format];
                    return (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.05 }}>
                        <div className="rounded-xl bg-gradient-to-br from-navy/5 to-gold/10 aspect-square flex flex-col items-center justify-center p-2 cursor-pointer hover:shadow-md transition-all group">
                          <Image className="w-5 h-5 text-navy/20 mb-1 group-hover:text-gold transition-colors" />
                          <p className="text-[9px] font-bold text-navy truncate text-center w-full">{v.title}</p>
                          <p className="text-[8px] text-warm-gray">{v.date}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

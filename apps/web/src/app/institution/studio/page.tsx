"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Palette,
  Grid3X3,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Smartphone,
  Clock,
  Download,
  Eye,
  Type,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type Category =
  | "all"
  | "annonces"
  | "evenements"
  | "citations"
  | "realisations"
  | "voeux"
  | "crise";

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

const formatConfig: Record<
  Format,
  { label: string; icon: typeof Square; ratio: string }
> = {
  square: { label: "Carre", icon: Square, ratio: "aspect-square" },
  portrait: { label: "Portrait", icon: RectangleVertical, ratio: "aspect-[3/4]" },
  story: { label: "Story", icon: Smartphone, ratio: "aspect-[9/16]" },
  landscape: {
    label: "Paysage",
    icon: RectangleHorizontal,
    ratio: "aspect-video",
  },
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

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const filtered =
    activeCategory === "all"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Studio Visuel</h1>
            <p className="text-warm-gray text-sm mt-1">Creez des visuels professionnels pour votre communication.</p>
          </div>
          <Button>
            <Sparkles className="w-4 h-4" />
            Generer un visuel
          </Button>
        </div>
      </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-navy text-white shadow-md"
                      : "bg-white text-warm-gray hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </motion.div>

            {/* Template Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((template, i) => {
                const fConf = formatConfig[template.format];
                const FIcon = fConf.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                  >
                    <Card padding="sm" className="cursor-pointer group">
                      <div
                        className={`w-full ${template.format === "story" ? "aspect-[9/16] max-h-48" : template.format === "portrait" ? "aspect-[3/4] max-h-48" : template.format === "landscape" ? "aspect-video" : "aspect-square"} rounded-xl mb-3 flex items-center justify-center relative overflow-hidden`}
                        style={{
                          background: `linear-gradient(135deg, ${template.colors[0]}20, ${template.colors[1] || template.colors[0]}30)`,
                        }}
                      >
                        <div className="flex gap-1">
                          {template.colors.map((c, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                            <Eye className="w-3.5 h-3.5 text-navy" />
                          </button>
                          <button className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                            <Download className="w-3.5 h-3.5 text-navy" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-navy mb-1 truncate">
                        {template.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FIcon className="w-3 h-3 text-warm-gray" />
                          <span className="text-xs text-warm-gray">
                            {fConf.label}
                          </span>
                        </div>
                        <span className="text-xs text-warm-gray">
                          {template.uses} utilisations
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Kit */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-gold" />
                Charte graphique
              </h2>
              <Card hover={false}>
                {/* Logo Placeholder */}
                <div className="w-full h-20 rounded-xl bg-navy flex items-center justify-center mb-4">
                  <span className="text-gold font-bold text-lg">LOGO</span>
                </div>
                {/* Colors */}
                <div className="mb-4">
                  <p className="text-xs text-warm-gray font-semibold mb-2">
                    Couleurs
                  </p>
                  <div className="flex gap-2">
                    {brandKit.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                {/* Fonts */}
                <div>
                  <p className="text-xs text-warm-gray font-semibold mb-2">
                    Typographies
                  </p>
                  <div className="space-y-2">
                    {brandKit.fonts.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50"
                      >
                        <Type className="w-3.5 h-3.5 text-gold" />
                        <span
                          className="text-sm text-navy"
                          style={{ fontFamily: f }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Visuals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Visuels recents
              </h2>
              <Card hover={false}>
                <div className="space-y-3">
                  {recentVisuals.map((v, i) => {
                    const fConf = formatConfig[v.format];
                    const FIcon = fConf.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy/5 to-gold/10 flex items-center justify-center shrink-0">
                          <Image className="w-4 h-4 text-navy/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">
                            {v.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <FIcon className="w-3 h-3 text-warm-gray" />
                            <span className="text-xs text-warm-gray">
                              {v.date}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
    </>
  );
}

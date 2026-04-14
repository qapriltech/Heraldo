"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Search,
  Plus,
  Loader2,
  FileText,
  Tv,
  Radio,
  Globe,
  Headphones,
  Star,
  Calendar,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

type MediaType = "article" | "tv" | "radio" | "web" | "podcast";

interface Publication {
  id: string;
  title: string;
  media: string;
  type: MediaType;
  date: string;
  image?: string;
  featured?: boolean;
  url?: string;
}

const typeConfig: Record<MediaType, { label: string; icon: typeof FileText; color: string; bg: string; badge: "info" | "warning" | "success" | "gold" | "neutral" }> = {
  article: { label: "Article", icon: FileText, color: "text-navy", bg: "bg-navy/10", badge: "info" },
  tv: { label: "TV", icon: Tv, color: "text-gold", bg: "bg-gold/10", badge: "gold" },
  radio: { label: "Radio", icon: Radio, color: "text-orange", bg: "bg-orange/10", badge: "warning" },
  web: { label: "Web", icon: Globe, color: "text-green", bg: "bg-green/10", badge: "success" },
  podcast: { label: "Podcast", icon: Headphones, color: "text-purple", bg: "bg-purple/10", badge: "neutral" },
};

const TABS = [
  { key: "all", label: "Tous" },
  { key: "article", label: "Articles" },
  { key: "tv", label: "TV" },
  { key: "radio", label: "Radio" },
  { key: "web", label: "Web" },
  { key: "podcast", label: "Podcast" },
];

export default function ArchivesPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<any>("/journalist-profile/me/publications")
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setPublications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return publications.filter(p => {
      if (tab !== "all" && p.type !== tab) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.media.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [publications, tab, search]);

  const featured = filtered.filter(p => p.featured);
  const regular = filtered.filter(p => !p.featured);

  // Stats
  const totalCount = publications.length;
  const byYear = useMemo(() => {
    const map: Record<string, number> = {};
    publications.forEach(p => {
      const y = p.date?.split("-")[0] ?? "N/A";
      map[y] = (map[y] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [publications]);
  const byMedia = useMemo(() => {
    const map: Record<string, number> = {};
    publications.forEach(p => { map[p.media] = (map[p.media] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [publications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Archives</h1>
          <p className="text-warm-gray text-sm mt-1">Votre portfolio de publications.</p>
        </div>
        <Button className="bg-orange hover:bg-orange-light text-white">
          <Plus className="w-4 h-4" /> Ajouter une publication
        </Button>
      </motion.div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Rechercher une publication..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/10 bg-white text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                tab === t.key ? "bg-orange text-white" : "bg-white text-warm-gray hover:bg-navy/5 border border-navy/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Featured publications */}
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold" /> En vedette
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {featured.map((pub, i) => {
                  const cfg = typeConfig[pub.type] ?? typeConfig.article;
                  return (
                    <motion.div key={pub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <Card padding="sm" className="overflow-hidden">
                        <div className="h-36 rounded-xl bg-navy/5 flex items-center justify-center mb-3 overflow-hidden">
                          {pub.image ? (
                            <img src={pub.image} alt={pub.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-navy/20" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={cfg.badge}>{cfg.label}</Badge>
                          <Badge variant="gold" dot>Vedette</Badge>
                        </div>
                        <h3 className="text-sm font-bold text-navy line-clamp-2">{pub.title}</h3>
                        <p className="text-xs text-warm-gray mt-1">{pub.media} - {pub.date}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular publications grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.length > 0 ? regular.map((pub, i) => {
              const cfg = typeConfig[pub.type] ?? typeConfig.article;
              const Icon = cfg.icon;
              return (
                <motion.div key={pub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card padding="sm">
                    <div className="h-24 rounded-xl bg-navy/5 flex items-center justify-center mb-3 overflow-hidden">
                      {pub.image ? (
                        <img src={pub.image} alt={pub.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className={`w-8 h-8 ${cfg.color} opacity-30`} />
                      )}
                    </div>
                    <Badge variant={cfg.badge} className="mb-2">{cfg.label}</Badge>
                    <h3 className="text-sm font-semibold text-navy line-clamp-2">{pub.title}</h3>
                    <p className="text-xs text-warm-gray mt-1">{pub.media}</p>
                    <p className="text-[10px] text-warm-gray mt-0.5">{pub.date}</p>
                  </Card>
                </motion.div>
              );
            }) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <Card hover={false}>
                  <p className="text-sm text-warm-gray text-center py-8">Aucune publication trouvee</p>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-orange" />
              <h3 className="text-sm font-bold text-navy">Statistiques</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-extrabold text-navy">{totalCount}</p>
              <p className="text-xs text-warm-gray">publications totales</p>
            </div>
            <div className="space-y-2">
              {(Object.keys(typeConfig) as MediaType[]).map(type => {
                const count = publications.filter(p => p.type === type).length;
                const cfg = typeConfig[type];
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-xs text-navy flex items-center gap-2">
                      <cfg.icon className={`w-3 h-3 ${cfg.color}`} /> {cfg.label}
                    </span>
                    <span className="text-xs font-bold text-warm-gray">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-bold text-navy">Par annee</h3>
            </div>
            <div className="space-y-2">
              {byYear.map(([year, count]) => (
                <div key={year} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-navy">{year}</span>
                  <span className="text-xs font-bold text-warm-gray">{count}</span>
                </div>
              ))}
              {byYear.length === 0 && <p className="text-xs text-warm-gray">Aucune donnee</p>}
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Archive className="w-4 h-4 text-navy" />
              <h3 className="text-sm font-bold text-navy">Par media</h3>
            </div>
            <div className="space-y-2">
              {byMedia.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-navy truncate">{name}</span>
                  <span className="text-xs font-bold text-warm-gray">{count}</span>
                </div>
              ))}
              {byMedia.length === 0 && <p className="text-xs text-warm-gray">Aucune donnee</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  UserMinus,
  Loader2,
  Filter,
  TrendingUp,
  Users,
  Newspaper,
  MapPin,
  Star,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Journalist {
  id: string;
  name: string;
  media: string;
  photo?: string;
  specialties: string[];
  zone?: string;
  mediaType?: string;
  experience?: string;
  followers: number;
  following?: boolean;
  trending?: boolean;
}

const SPECIALTIES = ["politique", "economie", "sport", "culture", "societe", "international"];
const ZONES = ["Abidjan", "Bouake", "Yamoussoukro", "National", "International"];
const MEDIA_TYPES = ["Presse ecrite", "TV", "Radio", "Web", "Podcast"];
const EXPERIENCE_LEVELS = ["Junior (0-3 ans)", "Confirme (3-7 ans)", "Senior (7+ ans)"];

export default function AnnuairePage() {
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get<any>("/journalist-directory/search")
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setJournalists(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = (id: string) => {
    setJournalists(prev => prev.map(j =>
      j.id === id ? { ...j, following: !j.following, followers: j.following ? j.followers - 1 : j.followers + 1 } : j
    ));
    api.post(`/journalist-directory/${id}/follow`).catch(() => {});
  };

  const filtered = useMemo(() => {
    return journalists.filter(j => {
      if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.media.toLowerCase().includes(search.toLowerCase())) return false;
      if (specialtyFilter && !j.specialties.includes(specialtyFilter)) return false;
      if (zoneFilter && j.zone !== zoneFilter) return false;
      if (mediaTypeFilter && j.mediaType !== mediaTypeFilter) return false;
      if (experienceFilter && j.experience !== experienceFilter) return false;
      return true;
    });
  }, [journalists, search, specialtyFilter, zoneFilter, mediaTypeFilter, experienceFilter]);

  const trending = journalists.filter(j => j.trending).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Annuaire des journalistes</h1>
        <p className="text-warm-gray text-sm mt-1">Decouvrez et suivez vos confreres.</p>
      </motion.div>

      {/* Search + Filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Rechercher par nom ou media..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-navy/10 bg-white text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            showFilters ? "bg-orange text-white" : "bg-white text-warm-gray border border-navy/10 hover:bg-navy/5"
          }`}
        >
          <Filter className="w-4 h-4" /> Filtres
        </button>
      </div>

      {/* Filters row */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 overflow-hidden">
          <Card hover={false} padding="sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-warm-gray uppercase tracking-wider">Specialite</label>
                <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm">
                  <option value="">Toutes</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-gray uppercase tracking-wider">Zone</label>
                <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm">
                  <option value="">Toutes</option>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-gray uppercase tracking-wider">Type de media</label>
                <select value={mediaTypeFilter} onChange={e => setMediaTypeFilter(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm">
                  <option value="">Tous</option>
                  {MEDIA_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-warm-gray uppercase tracking-wider">Experience</label>
                <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 bg-white text-sm">
                  <option value="">Tous niveaux</option>
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Journalist cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length > 0 ? filtered.map((j, i) => (
              <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card padding="sm" className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-3">
                    {j.photo ? (
                      <img src={j.photo} alt={j.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-xl font-extrabold text-orange">{j.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-navy">{j.name}</h3>
                  <p className="text-xs text-warm-gray flex items-center justify-center gap-1 mt-0.5">
                    <Newspaper className="w-3 h-3" /> {j.media}
                  </p>
                  {j.zone && (
                    <p className="text-[10px] text-warm-gray flex items-center justify-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {j.zone}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {j.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-orange/10 text-orange font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-3 text-xs text-warm-gray">
                    <Users className="w-3 h-3" />
                    <span className="font-bold text-navy">{j.followers}</span> abonne{j.followers > 1 ? "s" : ""}
                  </div>
                  <button
                    onClick={() => toggleFollow(j.id)}
                    className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      j.following
                        ? "bg-navy/5 text-warm-gray hover:bg-red-pale hover:text-red"
                        : "bg-orange text-white hover:bg-orange-light"
                    }`}
                  >
                    {j.following ? (
                      <span className="flex items-center justify-center gap-1"><UserMinus className="w-3 h-3" /> Suivi</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1"><UserPlus className="w-3 h-3" /> Suivre</span>
                    )}
                  </button>
                </Card>
              </motion.div>
            )) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <Card hover={false}>
                  <p className="text-sm text-warm-gray text-center py-8">Aucun journaliste trouve</p>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Trending sidebar */}
        <div>
          <Card hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-orange" />
              <h3 className="text-sm font-bold text-navy">Trending ce mois</h3>
            </div>
            {trending.length > 0 ? (
              <div className="space-y-3">
                {trending.map((j, i) => (
                  <div key={j.id} className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-orange w-5">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-orange">{j.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{j.name}</p>
                      <p className="text-[10px] text-warm-gray">{j.media}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-warm-gray">Aucune tendance ce mois</p>
            )}
          </Card>

          <Card hover={false} className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-bold text-navy">Votre reseau</h3>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-navy">{journalists.filter(j => j.following).length}</p>
              <p className="text-xs text-warm-gray">journalistes suivis</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

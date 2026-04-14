"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Save,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const SPECIALTIES = ["politique", "economie", "sport", "culture", "societe", "international"];
const COVERAGE_ZONES = ["Abidjan", "Bouake", "Yamoussoukro", "National", "International"];
const LANGUAGES = ["Francais", "Anglais", "Espagnol", "Arabe", "Dioula", "Baoule"];

interface ProfileData {
  name: string;
  bio: string;
  photo: string;
  coverPhoto: string;
  specialties: string[];
  coverageZones: string[];
  languages: string[];
  socialLinks: { twitter: string; linkedin: string; instagram: string; website: string };
  currentEmployer: string;
  previousEmployers: string[];
  education: string[];
  profileCompletion: number;
  publications: any[];
}

const defaultProfile: ProfileData = {
  name: "",
  bio: "",
  photo: "",
  coverPhoto: "",
  specialties: [],
  coverageZones: [],
  languages: [],
  socialLinks: { twitter: "", linkedin: "", instagram: "", website: "" },
  currentEmployer: "",
  previousEmployers: [],
  education: [],
  profileCompletion: 0,
  publications: [],
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmployer, setNewEmployer] = useState("");
  const [newEducation, setNewEducation] = useState("");

  useEffect(() => {
    api.get<any>("/journalist-profile/me")
      .then((res) => {
        const d = res.data ?? res;
        setProfile({ ...defaultProfile, ...d });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/journalist-profile/me", profile);
    } catch {}
    setSaving(false);
  };

  const toggleArray = (field: "specialties" | "coverageZones" | "languages", value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value],
    }));
  };

  const addToList = (field: "previousEmployers" | "education", value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setProfile(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setter("");
  };

  const removeFromList = (field: "previousEmployers" | "education", index: number) => {
    setProfile(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // Calculate completion
  const completionFields = [
    profile.name, profile.bio, profile.photo, profile.specialties.length > 0,
    profile.coverageZones.length > 0, profile.currentEmployer,
    profile.socialLinks.twitter || profile.socialLinks.linkedin,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

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
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Mon Profil</h1>
        <p className="text-warm-gray text-sm mt-1">Editez votre profil public visible par les institutions.</p>
      </motion.div>

      {/* Profile Completion Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        <Card hover={false}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-navy">Completion du profil</span>
            <span className="text-lg font-extrabold text-orange">{completionPct}%</span>
          </div>
          <div className="h-3 bg-navy/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #E8742E, #C8A45C)" }}
            />
          </div>
          <p className="text-xs text-warm-gray mt-2">
            {completionPct < 100
              ? "Completez votre profil pour augmenter votre visibilite aupres des institutions."
              : "Votre profil est complet !"}
          </p>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Photos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-orange/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange/5 transition-colors">
                  <Camera className="w-8 h-8 text-orange mb-2" />
                  <p className="text-sm font-medium text-navy">Photo de profil</p>
                  <p className="text-xs text-warm-gray mt-1">Cliquez pour telecharger</p>
                </div>
                <div className="border-2 border-dashed border-navy/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-navy/5 transition-colors">
                  <ImageIcon className="w-8 h-8 text-navy/40 mb-2" />
                  <p className="text-sm font-medium text-navy">Photo de couverture</p>
                  <p className="text-xs text-warm-gray mt-1">Cliquez pour telecharger</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bio */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Biographie</h2>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value.slice(0, 500) }))}
                placeholder="Decrivez votre parcours, vos domaines d'expertise..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm resize-none"
              />
              <div className="text-right mt-1">
                <span className={`text-xs font-medium ${profile.bio.length >= 450 ? "text-orange" : "text-warm-gray"}`}>
                  {profile.bio.length}/500
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Specialties */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Specialites</h2>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => {
                  const selected = profile.specialties.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleArray("specialties", s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        selected
                          ? "bg-orange text-white shadow-md"
                          : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Coverage Zones */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Zones de couverture</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COVERAGE_ZONES.map(z => {
                  const checked = profile.coverageZones.includes(z);
                  return (
                    <label key={z} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArray("coverageZones", z)}
                        className="w-4 h-4 rounded border-navy/20 text-orange accent-orange"
                      />
                      <span className="text-sm text-navy">{z}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Languages */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Langues</h2>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map(l => {
                  const checked = profile.languages.includes(l);
                  return (
                    <label key={l} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArray("languages", l)}
                        className="w-4 h-4 rounded border-navy/20 text-orange accent-orange"
                      />
                      <span className="text-sm text-navy">{l}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Social Links */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4">Liens sociaux</h2>
              <div className="space-y-3">
                {[
                  { key: "twitter" as const, icon: Twitter, placeholder: "https://twitter.com/..." },
                  { key: "linkedin" as const, icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                  { key: "instagram" as const, icon: Instagram, placeholder: "https://instagram.com/..." },
                  { key: "website" as const, icon: Globe, placeholder: "https://monsite.com" },
                ].map(({ key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-navy/50" />
                    </div>
                    <input
                      type="url"
                      value={profile.socialLinks[key]}
                      onChange={e => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                      }))}
                      placeholder={placeholder}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Experience */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange" /> Experience
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-warm-gray">Employeur actuel</label>
                  <input
                    type="text"
                    value={profile.currentEmployer}
                    onChange={e => setProfile(prev => ({ ...prev, currentEmployer: e.target.value }))}
                    placeholder="Ex: RFI, Fraternite Matin..."
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-warm-gray">Employeurs precedents</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newEmployer}
                      onChange={e => setNewEmployer(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addToList("previousEmployers", newEmployer, setNewEmployer)}
                      placeholder="Ajouter un employeur..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm"
                    />
                    <button
                      onClick={() => addToList("previousEmployers", newEmployer, setNewEmployer)}
                      className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange hover:bg-orange/20 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.previousEmployers.map((emp, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-navy/5 rounded-lg text-sm text-navy">
                        {emp}
                        <button onClick={() => removeFromList("previousEmployers", i)} className="text-warm-gray hover:text-red cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Education */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card hover={false}>
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-orange" /> Formation
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEducation}
                  onChange={e => setNewEducation(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addToList("education", newEducation, setNewEducation)}
                  placeholder="Ex: Master Journalisme - Universite de Cocody"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-navy/10 bg-white text-sm"
                />
                <button
                  onClick={() => addToList("education", newEducation, setNewEducation)}
                  className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange hover:bg-orange/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {profile.education.map((edu, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-navy/5 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-navy/40 shrink-0" />
                    <span className="text-sm text-navy flex-1">{edu}</span>
                    <button onClick={() => removeFromList("education", i)} className="text-warm-gray hover:text-red cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Save */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button onClick={handleSave} loading={saving} size="lg" className="w-full bg-orange hover:bg-orange-light text-white">
              <Save className="w-5 h-5" />
              Enregistrer le profil
            </Button>
          </motion.div>
        </div>

        {/* Sidebar - Publications Portfolio */}
        <div className="space-y-6">
          <Card hover={false}>
            <h3 className="text-sm font-bold text-navy mb-4">Apercu du profil</h3>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-3">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-orange" />
                )}
              </div>
              <p className="font-bold text-navy">{profile.name || "Votre nom"}</p>
              <p className="text-xs text-warm-gray mt-1">{profile.currentEmployer || "Employeur"}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {profile.specialties.map(s => (
                  <Badge key={s} variant="warning">{s}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="text-sm font-bold text-navy mb-4">Publications en vedette</h3>
            {profile.publications && profile.publications.length > 0 ? (
              <div className="space-y-3">
                {profile.publications.slice(0, 5).map((pub: any, i: number) => (
                  <div key={pub.id ?? i} className="flex gap-3">
                    <div className="w-16 h-12 rounded-lg bg-navy/5 flex items-center justify-center shrink-0">
                      <LinkIcon className="w-4 h-4 text-navy/30" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-navy truncate">{pub.title}</p>
                      <p className="text-[10px] text-warm-gray">{pub.media} - {pub.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-warm-gray text-center py-4">Aucune publication pour le moment</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

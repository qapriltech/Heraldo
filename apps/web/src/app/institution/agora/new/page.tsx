"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Video,
  Crown,
  Globe,
  Palette,
  Calendar,
  Clock,
  Upload,
  Users,
  Search,
  X,
  Newspaper,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

type RoomType = "STANDARD" | "PREMIUM" | "NATIONALE";

interface Journalist {
  id: string;
  user: { fullName: string };
  mediaOrganization?: { name: string; type: string };
  specialties: string[];
  tier: string;
}

const roomTypes: { id: RoomType; label: string; icon: typeof Video; desc: string; features: string[]; price: string; priceFcfa: number }[] = [
  {
    id: "STANDARD", label: "Standard", icon: Video, desc: "Conference de presse classique",
    features: ["50 participants max", "Duree 3 heures", "Replay 30 jours", "Chat + Q&A", "Enregistrement auto"],
    price: "75 000 F", priceFcfa: 75000,
  },
  {
    id: "PREMIUM", label: "Premium", icon: Crown, desc: "Conference avec branding complet",
    features: ["200 participants max", "Duree 6 heures", "Replay 60 jours", "Kit media inclus", "Branding personnalise"],
    price: "150 000 F", priceFcfa: 150000,
  },
  {
    id: "NATIONALE", label: "Nationale", icon: Globe, desc: "Evenement d'envergure nationale",
    features: ["500+ participants", "Duree illimitee", "Replay 90 jours", "Streaming pro", "Support dedie"],
    price: "350 000 F", priceFcfa: 350000,
  },
];

export default function NewAgoraPage() {
  const router = useRouter();
  const [roomType, setRoomType] = useState<RoomType>("STANDARD");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [primaryColor, setPrimaryColor] = useState("#0D1B3E");

  // Journalistes
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [journalistSearch, setJournalistSearch] = useState("");
  const [loadingJ, setLoadingJ] = useState(false);
  const [jLoaded, setJLoaded] = useState(false);

  // Submit
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  // Charger les journalistes
  const loadJournalists = async (search?: string) => {
    setLoadingJ(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await api.get<{ data: Journalist[] }>(`/reseau/journalists?${params}`);
      setJournalists(res.data);
      setJLoaded(true);
    } catch { /* silencieux */ }
    finally { setLoadingJ(false); }
  };

  useEffect(() => { loadJournalists(); }, []);

  const toggleJ = (id: string) =>
    setInvitedIds(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);

  const isValid = title.length > 0 && date.length > 0;

  const handleCreate = async () => {
    if (!isValid) { setError("Le titre et la date sont obligatoires"); return; }
    setCreating(true); setError(null);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await api.post<any>("/agora/rooms", {
        title, description, roomType, scheduledAt,
        brandingColor: roomType !== "STANDARD" ? primaryColor : undefined,
        journalistIds: invitedIds,
      });
      setSuccess(res);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la creation");
    } finally { setCreating(false); }
  };

  // Ecran succes
  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
          <Card hover={false} padding="lg">
            <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green" />
            </div>
            <h2 className="text-2xl font-extrabold text-navy mb-2">Salle AGORA creee !</h2>
            <p className="text-warm-gray mb-2">"{success.title}" — {roomTypes.find(r => r.id === success.roomType)?.label}</p>
            <p className="text-sm text-warm-gray mb-6">{success._count?.participants || invitedIds.length} journaliste(s) invite(s)</p>

            <div className="bg-ivory rounded-xl p-4 mb-6 text-left text-sm space-y-2">
              <div className="flex justify-between"><span className="text-warm-gray">Date</span><span className="font-medium text-navy">{new Date(success.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
              <div className="flex justify-between"><span className="text-warm-gray">Lien invitation</span><span className="font-mono text-[10px] text-gold truncate ml-4">{success.invitationToken?.substring(0, 20)}...</span></div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push("/institution/agora")}>Voir mes salles</Button>
              <Button className="flex-1" onClick={() => { setSuccess(null); setTitle(""); setDescription(""); setDate(""); setInvitedIds([]); }}>Nouvelle salle</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/institution/agora" className="p-2 rounded-lg hover:bg-ivory transition-colors">
              <ArrowLeft className="w-5 h-5 text-navy" />
            </Link>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-orange" />
              <span className="text-lg font-bold text-navy">Nouvelle salle AGORA</span>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate} loading={creating} disabled={!isValid}>
            <Check className="w-4 h-4" />
            Creer la salle
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-4 py-3 rounded-xl bg-red/10 text-red text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={() => setError(null)} className="ml-auto cursor-pointer">✕</button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Room type */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-orange" />
                Type de salle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roomTypes.map(rt => (
                  <button key={rt.id} onClick={() => setRoomType(rt.id)} className={`p-5 rounded-xl text-left transition-all cursor-pointer border-2 ${roomType === rt.id ? "border-gold bg-gold/5" : "border-transparent bg-ivory hover:bg-ivory-dark"}`}>
                    <rt.icon className={`w-6 h-6 mb-3 ${roomType === rt.id ? "text-gold" : "text-warm-gray"}`} />
                    <div className="font-semibold text-navy text-sm">{rt.label}</div>
                    <div className="text-xs text-warm-gray mt-1 mb-3">{rt.desc}</div>
                    <div className="text-lg font-bold text-gold mb-3">{rt.price}</div>
                    <ul className="space-y-1.5">
                      {rt.features.map(f => (
                        <li key={f} className="text-xs text-warm-gray flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-green mt-0.5 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </Card>

            {/* Details */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4">Details de la salle</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Titre *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Conference de presse — Resultats annuels" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Decrivez le sujet de la conference..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date *</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Heure</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Branding */}
            {roomType !== "STANDARD" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <Card hover={false}>
                  <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gold" />
                    Branding personnalise
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1.5">Couleur principale</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1.5">Logo</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gold/50 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-warm-gray mx-auto mb-1" />
                        <p className="text-xs text-warm-gray">PNG ou SVG</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Journalist invitations from RÉSEAU */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                Inviter des journalistes
              </h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input type="text" value={journalistSearch} onChange={e => { setJournalistSearch(e.target.value); loadJournalists(e.target.value); }} placeholder="Rechercher..." className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm" />
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {loadingJ && !jLoaded ? (
                  <div className="text-center py-4"><Loader2 className="w-5 h-5 text-gold animate-spin mx-auto" /></div>
                ) : journalists.map(j => {
                  const selected = invitedIds.includes(j.id);
                  return (
                    <button key={j.id} onClick={() => toggleJ(j.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${selected ? "bg-gold/10 ring-1 ring-gold/30" : "hover:bg-ivory"}`}>
                      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-[10px] font-bold text-navy shrink-0">
                        {j.user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-navy truncate">{j.user.fullName}</div>
                        <div className="text-[10px] text-warm-gray truncate">{j.mediaOrganization?.name || "Independant"}</div>
                      </div>
                      {selected && <Check className="w-4 h-4 text-gold shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {invitedIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-navy mb-2">{invitedIds.length} invite(s)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {invitedIds.map(id => {
                      const j = journalists.find(jj => jj.id === id);
                      if (!j) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-navy/10 text-xs font-medium text-navy">
                          {j.user.fullName.split(" ")[0]}
                          <button onClick={() => toggleJ(id)} className="cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Summary */}
            <Card hover={false} dark>
              <h2 className="text-sm font-semibold text-gold mb-4">Resume</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="text-white font-medium">{roomTypes.find(r => r.id === roomType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="text-white font-medium">{date || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Heure</span><span className="text-white font-medium">{time || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Journalistes</span><span className="text-gold font-semibold">{invitedIds.length}</span></div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400">Cout</span>
                  <span className="text-gold font-bold text-lg">{roomTypes.find(r => r.id === roomType)?.price}</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="md" onClick={handleCreate} loading={creating} disabled={!isValid}>
                <Video className="w-4 h-4" />
                Creer la salle AGORA
              </Button>
              {!isValid && <p className="text-[10px] text-red/60 text-center mt-2">Titre et date requis</p>}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

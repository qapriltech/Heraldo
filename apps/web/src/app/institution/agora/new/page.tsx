"use client";

import { useState } from "react";
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
  Plus,
  X,
  Newspaper,
  Check,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type RoomType = "standard" | "premium" | "nationale";

const roomTypes: {
  id: RoomType;
  label: string;
  icon: typeof Video;
  desc: string;
  features: string[];
  price: string;
}[] = [
  {
    id: "standard",
    label: "Standard",
    icon: Video,
    desc: "Conference de presse classique",
    features: [
      "Jusqu'a 50 journalistes",
      "Duree max 60 min",
      "Chat en direct",
      "Enregistrement",
    ],
    price: "150 000 F",
  },
  {
    id: "premium",
    label: "Premium",
    icon: Crown,
    desc: "Conference avec branding complet",
    features: [
      "Jusqu'a 200 journalistes",
      "Duree illimitee",
      "Branding personnalise",
      "Press kit integre",
      "Replay HD",
      "Moderation avancee",
    ],
    price: "450 000 F",
  },
  {
    id: "nationale",
    label: "Nationale",
    icon: Globe,
    desc: "Evenement d'envergure nationale",
    features: [
      "Journalistes illimites",
      "Diffusion multi-canal",
      "Traduction simultanee",
      "Dashboard analytics",
      "Support dedie",
      "Replay + VOD",
    ],
    price: "1 200 000 F",
  },
];

const mockJournalists = [
  { id: 1, name: "Marie Dupont", media: "RFI", specialty: "Economie" },
  { id: 2, name: "Amadou Diallo", media: "Fraternite Matin", specialty: "Politique" },
  { id: 3, name: "Fatou Keita", media: "RTI", specialty: "Societe" },
  { id: 4, name: "Jean-Pierre Kouame", media: "Jeune Afrique", specialty: "Finance" },
  { id: 5, name: "Aissatou Ba", media: "AFP", specialty: "General" },
];

export default function NewAgoraPage() {
  const [roomType, setRoomType] = useState<RoomType>("standard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [primaryColor, setPrimaryColor] = useState("#0D1B3E");
  const [journalistSearch, setJournalistSearch] = useState("");
  const [invitedJournalists, setInvitedJournalists] = useState<number[]>([]);

  const toggleJournalist = (id: number) => {
    setInvitedJournalists((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );
  };

  const filteredJournalists = mockJournalists.filter(
    (j) =>
      j.name.toLowerCase().includes(journalistSearch.toLowerCase()) ||
      j.media.toLowerCase().includes(journalistSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-ivory">
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agora" className="p-2 rounded-lg hover:bg-ivory transition-colors">
              <ArrowLeft className="w-5 h-5 text-navy" />
            </Link>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold" />
              <span className="text-lg font-bold text-navy">Nouvelle salle AGORA</span>
            </div>
          </div>
          <Button size="sm">
            <Check className="w-4 h-4" />
            Creer la salle
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Room type selection */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-orange" />
                Type de salle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roomTypes.map((rt) => (
                  <button
                    key={rt.id}
                    onClick={() => setRoomType(rt.id)}
                    className={`p-5 rounded-xl text-left transition-all cursor-pointer border-2
                      ${roomType === rt.id ? "border-gold bg-gold/5" : "border-transparent bg-ivory hover:bg-ivory-dark"}`}
                  >
                    <rt.icon className={`w-6 h-6 mb-3 ${roomType === rt.id ? "text-gold" : "text-warm-gray"}`} />
                    <div className="font-semibold text-navy text-sm">{rt.label}</div>
                    <div className="text-xs text-warm-gray mt-1 mb-3">{rt.desc}</div>
                    <div className="text-lg font-bold text-gold mb-3">{rt.price}</div>
                    <ul className="space-y-1.5">
                      {rt.features.map((f) => (
                        <li key={f} className="text-xs text-warm-gray flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-green mt-0.5 shrink-0" />
                          {f}
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
                  <label className="block text-sm font-medium text-navy mb-1.5">Titre</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Conference de presse - Resultats annuels"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Decrivez le sujet de la conference..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Heure
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Duree (min)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-navy text-sm"
                    >
                      <option value="30">30 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">120 min</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Branding */}
            {(roomType === "premium" || roomType === "nationale") && (
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
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono"
                        />
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

            {/* Press Kit Upload */}
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold" />
                Press Kit
              </h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gold/50 transition-colors">
                <Upload className="w-8 h-8 text-warm-gray mx-auto mb-3" />
                <p className="text-sm font-medium text-navy">Deposez votre press kit</p>
                <p className="text-xs text-warm-gray mt-1">PDF, ZIP, images — Les journalistes y auront acces avant la salle</p>
                <Button variant="outline" size="sm" className="mt-4">Parcourir les fichiers</Button>
              </div>
            </Card>
          </div>

          {/* Sidebar: Journalist invitations */}
          <div className="space-y-6">
            <Card hover={false}>
              <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                Inviter depuis le RESEAU
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input
                  type="text"
                  value={journalistSearch}
                  onChange={(e) => setJournalistSearch(e.target.value)}
                  placeholder="Rechercher un journaliste..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredJournalists.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => toggleJournalist(j.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer
                      ${invitedJournalists.includes(j.id) ? "bg-gold/10 border border-gold/30" : "hover:bg-ivory border border-transparent"}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-xs font-semibold text-navy shrink-0">
                      {j.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy truncate">{j.name}</div>
                      <div className="text-xs text-warm-gray">{j.media} - {j.specialty}</div>
                    </div>
                    {invitedJournalists.includes(j.id) && (
                      <Check className="w-4 h-4 text-gold shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {invitedJournalists.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-navy mb-2">
                    {invitedJournalists.length} journaliste(s) invite(s)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {invitedJournalists.map((id) => {
                      const j = mockJournalists.find((jj) => jj.id === id)!;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-navy/10 text-xs font-medium text-navy"
                        >
                          {j.name.split(" ")[0]}
                          <button onClick={() => toggleJournalist(id)} className="cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Summary */}
            <Card hover={false} dark>
              <h2 className="text-sm font-semibold text-gold mb-4">Resume de la salle</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white font-medium capitalize">{roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white font-medium">{date || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Heure</span>
                  <span className="text-white font-medium">{time || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duree</span>
                  <span className="text-white font-medium">{duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Journalistes</span>
                  <span className="text-gold font-semibold">{invitedJournalists.length}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400">Cout</span>
                  <span className="text-gold font-bold">
                    {roomTypes.find((r) => r.id === roomType)?.price}
                  </span>
                </div>
              </div>
              <Button className="w-full mt-6" size="md">
                <Video className="w-4 h-4" />
                Creer la salle AGORA
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

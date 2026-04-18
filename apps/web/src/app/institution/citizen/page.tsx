"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  Users,
  Upload,
  Send,
  MessageSquare,
  Phone,
  MapPin,
  Loader2,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Subscriber {
  id: string;
  phone: string;
  commune?: string;
  quartier?: string;
  channel: string;
  createdAt: string;
}

interface Message {
  id: string;
  title: string;
  content: string;
  messageType: string;
  channels: string[];
  targetCommunes: string[];
  recipientCount: number;
  sentAt: string;
}

function getInstitutionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("heraldo_user") || "{}");
    return user.institutionId || "";
  } catch { return ""; }
}

const messageTypeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Info; border: string }> = {
  alert: { label: "Alerte", color: "text-red", bg: "bg-red/10", icon: AlertTriangle, border: "border-l-red" },
  info: { label: "Information", color: "text-teal", bg: "bg-teal/10", icon: Info, border: "border-l-teal" },
  official: { label: "Officiel", color: "text-navy", bg: "bg-navy/10", icon: CheckCircle, border: "border-l-navy" },
  event: { label: "Evenement", color: "text-gold", bg: "bg-gold/10", icon: Calendar, border: "border-l-gold" },
};

const communesList = ["Abobo", "Adjame", "Attiecoube", "Cocody", "Koumassi", "Marcory", "Plateau", "Port-Bouet", "Treichville", "Yopougon"];

export default function CitizenPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [channels, setChannels] = useState<string[]>(["sms"]);
  const [targetCommunes, setTargetCommunes] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);

  const institutionId = getInstitutionId();

  useEffect(() => {
    const q = institutionId ? `?institutionId=${institutionId}` : "";
    Promise.all([
      api.get<any>(`/citizen/subscribers${q}`).then((r) => {
        setSubscribers(r.data ?? []);
        setSubscriberTotal(r.meta?.total ?? (r.data ?? []).length);
      }).catch(() => {}),
      api.get<any>(`/citizen/messages${q}`).then((r) => setMessages(r.data ?? r ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [institutionId]);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    try {
      const msg = await api.post<any>("/citizen/messages", { institutionId, title, content, messageType, channels, targetCommunes });
      setMessages((prev) => [msg, ...prev]);
      setTitle("");
      setContent("");
      setShowComposer(false);
    } catch {}
    setSending(false);
  };

  const handleImport = () => {
    const phones = prompt("Entrez les numeros (separes par des virgules):");
    if (!phones) return;
    const list = phones.split(",").map((p) => ({ phone: p.trim() }));
    api.post("/citizen/subscribers/import", { institutionId, subscribers: list }).then(() => window.location.reload()).catch(() => {});
  };

  const toggleChannel = (ch: string) => setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  const toggleCommune = (c: string) => setTargetCommunes((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-warm-gray uppercase tracking-widest">Chargement citoyen...</p>
        </div>
      </div>
    );
  }

  const smsCount = subscribers.filter((s) => s.channel === "sms" || s.channel === "both").length;
  const whatsappCount = subscribers.filter((s) => s.channel === "whatsapp" || s.channel === "both").length;

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-extrabold text-gold uppercase tracking-[0.2em]">Communication directe</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-navy tracking-tight">Communication Citoyenne</h1>
            <p className="text-warm-gray text-sm mt-1">Informez vos citoyens par SMS et WhatsApp.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImport} className="bg-navy/5 text-navy font-bold text-sm px-5 py-3 rounded-2xl hover:bg-navy/10 transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" /> Importer
            </button>
            <button onClick={() => setShowComposer(!showComposer)} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
              <Send className="w-4 h-4" /> Nouveau message
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPIs with growth indicator */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Abonnes", value: String(subscriberTotal), gradient: "from-navy to-purple", icon: Users, iconBg: "bg-navy/10", iconColor: "text-navy", growth: "+12%" },
          { label: "Messages envoyes", value: String(messages.length), gradient: "from-gold to-orange", icon: MessageSquare, iconBg: "bg-gold/10", iconColor: "text-gold", growth: null },
          { label: "Canal SMS", value: String(smsCount), gradient: "from-orange to-red", icon: Phone, iconBg: "bg-orange/10", iconColor: "text-orange", growth: null },
          { label: "Canal WhatsApp", value: String(whatsappCount), gradient: "from-green to-teal", icon: MessageSquare, iconBg: "bg-green/10", iconColor: "text-green", growth: null },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="premium-card p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                {kpi.growth && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green/10 text-[10px] font-extrabold text-green">
                    <TrendingUp className="w-3 h-3" /> {kpi.growth}
                  </div>
                )}
              </div>
              <div className="text-3xl font-extrabold text-navy mb-0.5">{kpi.value}</div>
              <div className="text-xs font-semibold text-warm-gray">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Composer */}
      {showComposer && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="premium-card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-orange" />
            <h3 className="text-sm font-extrabold text-navy mb-5 flex items-center gap-2">
              <Send className="w-4 h-4 text-gold" /> Composer un message
            </h3>
            <div className="space-y-4">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du message" className="w-full px-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm" />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu du message..." rows={4} className="w-full px-4 py-3 rounded-2xl border border-navy/10 bg-ivory/50 text-sm resize-none" />

              {/* Type */}
              <div>
                <label className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-2 block">Type de message</label>
                <div className="flex gap-2">
                  {Object.entries(messageTypeConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setMessageType(key)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${messageType === key ? "gradient-gold text-navy-dark shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel toggle pills */}
              <div>
                <label className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-2 block">Canaux</label>
                <div className="flex gap-2">
                  <button onClick={() => toggleChannel("sms")} className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${channels.includes("sms") ? "bg-orange text-white shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                    <Phone className="w-3.5 h-3.5" /> SMS
                  </button>
                  <button onClick={() => toggleChannel("whatsapp")} className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${channels.includes("whatsapp") ? "bg-green text-white shadow-lg" : "bg-white text-warm-gray border border-navy/10"}`}>
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Target communes */}
              <div>
                <label className="text-[10px] font-extrabold text-gold uppercase tracking-[0.15em] mb-2 block">Communes ciblees (vide = toutes)</label>
                <div className="flex flex-wrap gap-2">
                  {communesList.map((c) => (
                    <button key={c} onClick={() => toggleCommune(c)} className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1 ${targetCommunes.includes(c) ? "gradient-gold text-navy-dark shadow-md" : "bg-navy/5 text-warm-gray hover:text-navy"}`}>
                      <MapPin className="w-3 h-3" />{c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSend} disabled={sending || !title.trim() || !content.trim()} className="w-full py-3.5 rounded-2xl gradient-gold text-navy-dark font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer le message
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-gold" />
        <h2 className="text-[11px] font-extrabold text-gold uppercase tracking-[0.2em]">Messages envoyes</h2>
      </div>

      {/* Sent messages */}
      <div className="space-y-3">
        {messages.length === 0 && (
          <div className="premium-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-lg font-serif text-navy mb-2">Aucun message envoye</h3>
            <p className="text-sm text-warm-gray mb-6">Envoyez votre premier message pour informer vos citoyens.</p>
            <button onClick={() => setShowComposer(true)} className="gradient-gold text-navy-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> Composer
            </button>
          </div>
        )}
        {messages.map((m, i) => {
          const tc = messageTypeConfig[m.messageType] || messageTypeConfig.info;
          const Icon = tc.icon;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <div className={`premium-card p-5 border-l-4 ${tc.border} flex flex-col sm:flex-row items-start sm:items-center gap-4`}>
                <div className={`w-11 h-11 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy truncate">{m.title}</p>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.bg} ${tc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tc.color === "text-red" ? "bg-red" : tc.color === "text-teal" ? "bg-teal" : tc.color === "text-navy" ? "bg-navy" : "bg-gold"}`} />
                      {tc.label}
                    </span>
                  </div>
                  <p className="text-xs text-warm-gray truncate mt-0.5">{m.content}</p>
                </div>
                {/* Delivery stats */}
                <div className="flex gap-5 text-center shrink-0">
                  <div>
                    <p className="text-xl font-extrabold text-navy">{m.recipientCount}</p>
                    <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Destinataires</p>
                  </div>
                  <div>
                    <div className="flex gap-1 justify-center mb-0.5">
                      {m.channels.map(ch => (
                        <span key={ch} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ch === "sms" ? "bg-orange/10 text-orange" : "bg-green/10 text-green"}`}>
                          {ch.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] text-warm-gray uppercase tracking-wider font-semibold">Canaux</p>
                  </div>
                </div>
                <span className="text-[10px] text-warm-gray shrink-0">{m.sentAt ? new Date(m.sentAt).toLocaleDateString("fr-FR") : "-"}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

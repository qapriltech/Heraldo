"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  Users,
  Upload,
  Trash2,
  Send,
  MessageSquare,
  Phone,
  MapPin,
  Loader2,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
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

const messageTypeConfig: Record<string, { label: string; color: string; icon: typeof Info }> = {
  alert: { label: "Alerte", color: "text-red-600", icon: AlertTriangle },
  info: { label: "Information", color: "text-blue-600", icon: Info },
  official: { label: "Officiel", color: "text-navy", icon: CheckCircle },
  event: { label: "Evenement", color: "text-gold", icon: Calendar },
};

const communesList = ["Abobo", "Adjame", "Attiecoube", "Cocody", "Koumassi", "Marcory", "Plateau", "Port-Bouet", "Treichville", "Yopougon"];

export default function CitizenPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscriberTotal, setSubscriberTotal] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Composer state
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
      const msg = await api.post<any>("/citizen/messages", {
        institutionId,
        title,
        content,
        messageType,
        channels,
        targetCommunes,
      });
      setMessages((prev) => [msg, ...prev]);
      setTitle("");
      setContent("");
      setShowComposer(false);
    } catch {}
    setSending(false);
  };

  const handleImport = () => {
    // Placeholder: in production this would open a file picker
    const phones = prompt("Entrez les numeros (separes par des virgules):");
    if (!phones) return;
    const list = phones.split(",").map((p) => ({ phone: p.trim() }));
    api.post("/citizen/subscribers/import", { institutionId, subscribers: list })
      .then(() => window.location.reload())
      .catch(() => {});
  };

  const toggleChannel = (ch: string) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const toggleCommune = (c: string) => {
    setTargetCommunes((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-gold" /> Communication Citoyenne
            </h1>
            <p className="text-warm-gray text-sm mt-1">Informez vos citoyens par SMS et WhatsApp.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-navy/10 text-sm font-bold text-navy hover:bg-navy/5 transition-all">
              <Upload className="w-4 h-4" /> Importer
            </button>
            <button onClick={() => setShowComposer(!showComposer)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-bold shadow-md hover:bg-navy/90 transition-all">
              <Send className="w-4 h-4" /> Nouveau message
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Abonnes", value: String(subscriberTotal), icon: Users, color: "text-navy" },
          { label: "Messages envoyes", value: String(messages.length), icon: MessageSquare, color: "text-gold" },
          { label: "Canal SMS", value: String(subscribers.filter((s) => s.channel === "sms" || s.channel === "both").length), icon: Phone, color: "text-green-600" },
          { label: "Canal WhatsApp", value: String(subscribers.filter((s) => s.channel === "whatsapp" || s.channel === "both").length), icon: MessageSquare, color: "text-green-500" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card hover={false} padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-navy">{kpi.value}</div>
                  <div className="text-[11px] text-warm-gray font-medium">{kpi.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Composer */}
      {showComposer && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card hover={false}>
            <h3 className="text-sm font-bold text-navy mb-4">Composer un message</h3>
            <div className="space-y-4">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du message" className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm" />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu du message..." rows={4} className="w-full px-4 py-3 rounded-xl border border-navy/10 text-sm resize-none" />

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-navy mb-2 block">Type de message</label>
                <div className="flex gap-2">
                  {Object.entries(messageTypeConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setMessageType(key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${messageType === key ? "bg-navy text-white" : "bg-white text-warm-gray border border-navy/10"}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="text-xs font-bold text-navy mb-2 block">Canaux</label>
                <div className="flex gap-2">
                  {["sms", "whatsapp"].map((ch) => (
                    <button key={ch} onClick={() => toggleChannel(ch)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${channels.includes(ch) ? "bg-green-600 text-white" : "bg-white text-warm-gray border border-navy/10"}`}>
                      {ch === "sms" ? "SMS" : "WhatsApp"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target communes */}
              <div>
                <label className="text-xs font-bold text-navy mb-2 block">Communes ciblees (vide = toutes)</label>
                <div className="flex flex-wrap gap-2">
                  {communesList.map((c) => (
                    <button key={c} onClick={() => toggleCommune(c)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${targetCommunes.includes(c) ? "bg-gold text-navy-dark" : "bg-navy/5 text-warm-gray"}`}>
                      <MapPin className="w-3 h-3 inline mr-0.5" />{c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSend} disabled={sending || !title.trim() || !content.trim()} className="w-full py-3 rounded-xl bg-navy text-white font-bold text-sm shadow-md hover:bg-navy/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer le message
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sent messages */}
      <h2 className="text-lg font-bold text-navy mb-4">Messages envoyes</h2>
      <div className="space-y-3">
        {messages.length === 0 && (
          <Card hover={false}><p className="text-sm text-warm-gray text-center py-4">Aucun message envoye.</p></Card>
        )}
        {messages.map((m, i) => {
          const tc = messageTypeConfig[m.messageType] || messageTypeConfig.info;
          const Icon = tc.icon;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm" className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-navy truncate">{m.title}</p>
                    <Badge variant="neutral">{tc.label}</Badge>
                  </div>
                  <p className="text-xs text-warm-gray truncate">{m.content}</p>
                </div>
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <p className="text-lg font-extrabold text-navy">{m.recipientCount}</p>
                    <p className="text-[9px] text-warm-gray uppercase tracking-wider">Destinataires</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-gray">{m.channels.join(", ")}</p>
                    <p className="text-[9px] text-warm-gray uppercase tracking-wider">Canaux</p>
                  </div>
                </div>
                <span className="text-[10px] text-warm-gray shrink-0">{m.sentAt ? new Date(m.sentAt).toLocaleDateString("fr-FR") : "-"}</span>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

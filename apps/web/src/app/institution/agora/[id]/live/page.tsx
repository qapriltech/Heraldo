"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Users,
  Clock,
  Radio,
  StopCircle,
  Loader2,
  MessageSquare,
  Hand,
  Copy,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";

interface LiveData {
  roomId: string;
  title: string;
  status: string;
  provider: string;
  liveUrl: string;
  jitsiConfig: {
    roomName: string;
    subject: string;
    displayName: string;
    brandingColor: string;
  };
}

export default function AgoraLivePage() {
  const params = useParams();
  const roomId = params.id as string;
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    api.get<LiveData>(`/agora/rooms/${roomId}/live-url`)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Timer
  useEffect(() => {
    if (!data || data.status !== "LIVE") return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [data]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      await api.post(`/agora/rooms/${roomId}/start`);
      setData(prev => prev ? { ...prev, status: "LIVE" } : prev);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await api.post(`/agora/rooms/${roomId}/end`);
      setData(prev => prev ? { ...prev, status: "ENDED" } : prev);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnding(false);
    }
  };

  const copyLink = () => {
    if (data?.liveUrl) {
      navigator.clipboard.writeText(data.liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
        <Card padding="lg" className="text-center max-w-md">
          <Radio className="w-12 h-12 text-red mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-navy mb-2">Salle introuvable</h2>
          <p className="text-warm-gray mb-4">{error || "Cette salle n'existe pas."}</p>
          <Link href="/institution/agora"><Button variant="secondary">Retour aux salles</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Header */}
      <nav className="bg-navy border-b border-navy-light/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/institution/agora" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-white font-bold text-lg">{data.title}</h1>
                {data.status === "LIVE" && (
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red/20">
                    <span className="w-2 h-2 rounded-full bg-red" />
                    <span className="text-red text-xs font-bold uppercase tracking-wider">En direct</span>
                  </motion.div>
                )}
                {data.status === "SCHEDULED" && (
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">Planifiee</span>
                )}
                {data.status === "ENDED" && (
                  <span className="px-3 py-1 rounded-full bg-warm-gray/20 text-warm-gray text-xs font-bold">Terminee</span>
                )}
              </div>
              {data.status === "LIVE" && (
                <div className="flex items-center gap-4 mt-1 text-gray-400 text-xs">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(elapsed)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={copyLink} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-light text-gray-300 text-xs font-medium hover:bg-navy-light/80 transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copie !" : "Copier le lien"}
            </button>

            {data.status === "SCHEDULED" && (
              <Button size="sm" onClick={handleStart}>
                <Radio className="w-4 h-4" />
                Demarrer le direct
              </Button>
            )}

            {data.status === "LIVE" && (
              <Button size="sm" variant="danger" onClick={handleEnd} loading={ending}>
                <StopCircle className="w-4 h-4" />
                Terminer
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        {data.status === "SCHEDULED" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Mic className="w-12 h-12 text-gold" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-3">Salle prete</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Cliquez sur &quot;Demarrer le direct&quot; pour lancer la conference. Les journalistes invites recevront une notification.
              </p>
              <Button size="lg" onClick={handleStart}>
                <Radio className="w-5 h-5" />
                Demarrer le direct
              </Button>
            </motion.div>
          </div>
        )}

        {data.status === "LIVE" && (
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Jitsi iframe */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
                <iframe
                  src={`${data.liveUrl}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.subject=${encodeURIComponent(data.title)}&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.DEFAULT_BACKGROUND=%23${(data.jitsiConfig.brandingColor || '#0D1B3E').replace('#', '')}`}
                  className="w-full h-full absolute inset-0"
                  allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                  style={{ border: 0 }}
                />
              </div>

              {/* Share link */}
              <div className="mt-4 flex items-center gap-3 bg-navy rounded-xl p-4">
                <ExternalLink className="w-5 h-5 text-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Lien de la salle — partagez avec les journalistes</p>
                  <p className="text-sm text-white font-mono truncate">{data.liveUrl}</p>
                </div>
                <button onClick={copyLink} className="px-4 py-2 rounded-lg gradient-gold text-navy-dark text-xs font-bold shrink-0">
                  {copied ? "Copie !" : "Copier"}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Participants */}
              <div className="bg-navy rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gold" />
                  Participants
                </h3>
                <p className="text-xs text-gray-400">Les participants sont geres directement dans la visio Jitsi.</p>
              </div>

              {/* Q&A */}
              <div className="bg-navy rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Hand className="w-4 h-4 text-orange" />
                  Questions
                </h3>
                <p className="text-xs text-gray-400">Utilisez le chat Jitsi pour les questions-reponses en direct.</p>
              </div>

              {/* Chat */}
              <div className="bg-navy rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-green" />
                  Chat
                </h3>
                <p className="text-xs text-gray-400">Le chat est integre dans la fenetre Jitsi a gauche.</p>
              </div>
            </div>
          </div>
        )}

        {data.status === "ENDED" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-white mb-2">Conference terminee</h2>
              <p className="text-gray-400 mb-6">La salle a ete fermee. Les participants ont ete deconnectes.</p>
              <Link href="/institution/agora"><Button variant="secondary">Retour aux salles</Button></Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Loader2,
  Clock,
  FileAudio,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Tag,
  CheckCircle,
  AlertCircle,
  Volume2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  transcriptionStatus: "pending" | "processing" | "completed" | "failed";
  transcription?: string;
  tags?: string[];
}

export default function CapturePage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState([3, 5, 8, 4, 7, 6, 3, 5, 9, 4, 6, 7]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const levelsRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.get<any>("/journalist/recordings")
      .then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) setRecordings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    levelsRef.current = setInterval(() => {
      setAudioLevels(prev => prev.map(() => Math.floor(Math.random() * 10) + 1));
    }, 150);
  };

  const pauseRecording = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (levelsRef.current) clearInterval(levelsRef.current);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    levelsRef.current = setInterval(() => {
      setAudioLevels(prev => prev.map(() => Math.floor(Math.random() * 10) + 1));
    }, 150);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (levelsRef.current) clearInterval(levelsRef.current);
    setRecordingTime(0);
    setAudioLevels([3, 5, 8, 4, 7, 6, 3, 5, 9, 4, 6, 7]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const transcriptionBadge: Record<string, { variant: "success" | "warning" | "info" | "error"; label: string }> = {
    pending: { variant: "warning", label: "En attente" },
    processing: { variant: "info", label: "Transcription..." },
    completed: { variant: "success", label: "Transcrit" },
    failed: { variant: "error", label: "Echec" },
  };

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
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Capture Audio</h1>
        <p className="text-warm-gray text-sm mt-1">Enregistrez et transcrivez vos interviews terrain.</p>
      </motion.div>

      {/* Mobile notice */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <Card hover={false} padding="sm" className="bg-orange-pale border-orange/20">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-orange shrink-0" />
            <div>
              <p className="text-sm font-semibold text-navy">Enregistrement optimise sur l&apos;app mobile</p>
              <p className="text-xs text-warm-gray">L&apos;enregistrement audio utilise les API natives du telephone. Utilisez l&apos;application mobile HERALDO pour une experience optimale.</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recorder UI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <Card hover={false} className="text-center py-8">
          {/* Audio level visualization */}
          <div className="flex items-end justify-center gap-1 h-20 mb-6">
            {audioLevels.map((level, i) => (
              <motion.div
                key={i}
                animate={{ height: isRecording && !isPaused ? `${level * 8}px` : "12px" }}
                transition={{ duration: 0.15 }}
                className="w-2 rounded-full"
                style={{
                  background: isRecording
                    ? `linear-gradient(180deg, #E8742E, #C8A45C)`
                    : "#E8ECF4",
                  minHeight: 4,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <p className="text-4xl font-extrabold text-navy font-mono">{formatTime(recordingTime)}</p>
              {isPaused && <p className="text-sm text-orange font-semibold mt-1">En pause</p>}
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-red flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer glow-orange"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            ) : (
              <>
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center hover:bg-navy/20 transition-all cursor-pointer"
                >
                  {isPaused ? <Play className="w-6 h-6 text-navy" /> : <Pause className="w-6 h-6 text-navy" />}
                </button>
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <Square className="w-8 h-8 text-white" />
                </button>
              </>
            )}
          </div>

          {!isRecording && (
            <p className="text-sm text-warm-gray mt-4">Appuyez pour commencer l&apos;enregistrement</p>
          )}
        </Card>
      </motion.div>

      {/* Recordings list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-orange" />
          Enregistrements passes
        </h2>

        <div className="space-y-3">
          {recordings.length > 0 ? recordings.map((rec, i) => {
            const isExpanded = expandedId === rec.id;
            const tBadge = transcriptionBadge[rec.transcriptionStatus] ?? transcriptionBadge.pending;
            return (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card padding="sm">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="w-full flex items-center gap-3 cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                      <FileAudio className="w-5 h-5 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{rec.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-warm-gray">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.duration}</span>
                        <span>{rec.date}</span>
                      </div>
                    </div>
                    <Badge variant={tBadge.variant}>{tBadge.label}</Badge>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-warm-gray shrink-0" /> : <ChevronRight className="w-4 h-4 text-warm-gray shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-navy/5">
                          {/* Play button */}
                          <div className="flex items-center gap-3 mb-4">
                            <button className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-orange-light transition-all">
                              <Play className="w-5 h-5 ml-0.5" />
                            </button>
                            <div className="flex-1 h-2 bg-navy/5 rounded-full overflow-hidden">
                              <div className="h-full w-0 bg-orange rounded-full" />
                            </div>
                            <span className="text-xs text-warm-gray font-mono">{rec.duration}</span>
                          </div>

                          {/* Transcription */}
                          {rec.transcription ? (
                            <div className="bg-navy/5 rounded-xl p-4 mb-3">
                              <p className="text-xs font-bold text-navy mb-2">Transcription</p>
                              <p className="text-sm text-navy/70 leading-relaxed">{rec.transcription}</p>
                            </div>
                          ) : rec.transcriptionStatus === "processing" ? (
                            <div className="flex items-center gap-2 text-sm text-warm-gray mb-3">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Transcription en cours...
                            </div>
                          ) : null}

                          {/* Tags */}
                          {rec.tags && rec.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Tag className="w-3 h-3 text-warm-gray" />
                              {rec.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-orange/10 text-orange font-medium">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          }) : (
            <Card hover={false}>
              <p className="text-sm text-warm-gray text-center py-8">Aucun enregistrement pour le moment</p>
            </Card>
          )}
        </div>
      </motion.div>
    </>
  );
}

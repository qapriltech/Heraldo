"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Video,
  Calendar,
  Users,
  Clock,
  Play,
  CheckCircle,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const typeColors: Record<string, string> = {
  Standard: "bg-navy/10 text-navy",
  Premium: "bg-gold/10 text-gold-dark",
  Nationale: "bg-orange/10 text-orange",
};

const statusConfig: Record<string, { label: string; variant: "info" | "success" | "neutral"; icon: typeof Play }> = {
  upcoming: { label: "A venir", variant: "info", icon: Clock },
  live: { label: "En direct", variant: "success", icon: Play },
  completed: { label: "Terminee", variant: "neutral", icon: CheckCircle },
};

export default function AgoraPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/agora/rooms")
      .then((res) => setRooms(res.data ?? []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Salles AGORA</h1>
            <p className="text-warm-gray text-sm mt-1">Vos salles de presse virtuelles</p>
          </div>
          <Link href="/institution/agora/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nouvelle salle
            </Button>
          </Link>
        </div>
      </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Salles totales", value: "8", icon: Video },
            { label: "A venir", value: "2", icon: Calendar },
            { label: "Journalistes invites", value: "293", icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover={false} padding="sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-navy">{stat.value}</div>
                    <div className="text-xs text-warm-gray">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rooms list */}
        <div className="space-y-3">
          {rooms.map((room, i) => {
            const cfg = statusConfig[room.status];
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-warm-gray">{room.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${typeColors[room.type]}`}>
                        {room.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-navy truncate">{room.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-warm-gray">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {room.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.journalists} journalistes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {room.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                    {room.status === "upcoming" && (
                      <Link href={`/institution/agora/${room.id}/live`}>
                        <Button variant="outline" size="sm">Gerer</Button>
                      </Link>
                    )}
                    {room.status === "live" && (
                      <Link href={`/institution/agora/${room.id}/live`}>
                        <Button size="sm"><Video className="w-4 h-4" /> Rejoindre</Button>
                      </Link>
                    )}
                    <button className="p-2 rounded-lg hover:bg-ivory-dark transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4 text-warm-gray" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
    </>
  );
}

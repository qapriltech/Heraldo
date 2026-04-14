"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "neutral" | "error" | "info"; icon: typeof Send }
> = {
  diffuse: { label: "Diffuse", variant: "success", icon: CheckCircle },
  en_attente: { label: "En attente", variant: "warning", icon: Clock },
  brouillon: { label: "Brouillon", variant: "neutral", icon: FileText },
  expire: { label: "Expire", variant: "error", icon: XCircle },
};

const formatColors: Record<string, string> = {
  Long: "bg-navy/10 text-navy",
  Court: "bg-gold/10 text-gold-dark",
  Flash: "bg-orange/10 text-orange",
};

export default function CommuniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [communiques, setCommuniques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/communiques")
      .then((res) => setCommuniques(res.data ?? []))
      .catch(() => setCommuniques([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  const filtered = communiques.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Communiques</h1>
            <p className="text-warm-gray text-sm mt-1">Gerez et diffusez vos communiques de presse</p>
          </div>
          <Link href="/institution/communiques/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nouveau communique
            </Button>
          </Link>
        </div>
      </motion.div>

        {/* Filters */}
        <Card hover={false} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="Rechercher un communique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-warm-gray" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-navy"
              >
                <option value="all">Tous les statuts</option>
                <option value="diffuse">Diffuse</option>
                <option value="en_attente">En attente</option>
                <option value="brouillon">Brouillon</option>
                <option value="expire">Expire</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Communiques list */}
        <div className="space-y-3">
          {filtered.map((cp, i) => {
            const cfg = statusConfig[cp.status];
            return (
              <motion.div
                key={cp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-mono text-warm-gray">
                        {cp.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${formatColors[cp.format]}`}
                      >
                        {cp.format}
                      </span>
                    </div>
                    <h3 className="font-semibold text-navy truncate">
                      {cp.title}
                    </h3>
                    <p className="text-xs text-warm-gray mt-1">
                      {cp.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center hidden md:block">
                      <div className="text-sm font-semibold text-navy">
                        {cp.recipients}
                      </div>
                      <div className="text-xs text-warm-gray">
                        Destinataires
                      </div>
                    </div>
                    <div className="text-center hidden md:block">
                      <div className="text-sm font-semibold text-navy">
                        {cp.openRate}
                      </div>
                      <div className="text-xs text-warm-gray">
                        Taux ouverture
                      </div>
                    </div>
                    <Badge variant={cfg.variant} dot>
                      {cfg.label}
                    </Badge>
                    <button className="p-2 rounded-lg hover:bg-ivory-dark transition-colors cursor-pointer">
                      <MoreHorizontal className="w-4 h-4 text-warm-gray" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-warm-gray/30 mx-auto mb-4" />
            <p className="text-warm-gray font-medium">
              Aucun communique trouve
            </p>
            <p className="text-sm text-warm-gray/70 mt-1">
              Modifiez vos filtres ou creez un nouveau communique
            </p>
          </div>
        )}
    </>
  );
}

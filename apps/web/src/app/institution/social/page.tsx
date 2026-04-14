"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Eye,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Newspaper,
  Users,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";

const platformIcon = (name: string) => {
  if (name === "Facebook") return Facebook;
  if (name === "Instagram") return Instagram;
  return Linkedin;
};

export default function SocialDashboard() {
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [recentPublications, setRecentPublications] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/social/accounts").then((res) => {
        const data = res.data ?? res;
        setConnectedAccounts(Array.isArray(data) ? data : []);
      }).catch(() => {}),
      api.get<any>("/social/posts").then((res) => {
        const data = res.data ?? res;
        if (Array.isArray(data)) {
          setRecentPublications(data.filter((p: any) => p.status === "published"));
          setScheduledPosts(data.filter((p: any) => p.status === "scheduled"));
        }
        if (res.kpis) setKpis(res.kpis);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy tracking-tight">Reseaux Sociaux</h1>
            <p className="text-warm-gray text-sm mt-1">Gerez vos publications et suivez votre audience.</p>
          </div>
          <Link href="/institution/social/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nouvelle publication
            </Button>
          </Link>
        </div>
      </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover={false}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}
                  >
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green" />
                </div>
                <div className="text-2xl font-bold text-navy mb-0.5">
                  {kpi.value}
                </div>
                <div className="text-sm text-warm-gray">{kpi.label}</div>
                <div className="text-xs text-green font-medium mt-2">
                  {kpi.change}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Connected Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold" />
            Comptes connectes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {connectedAccounts.map((account, i) => (
              <motion.div
                key={account.platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <Card padding="sm" className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${account.bg} flex items-center justify-center shrink-0`}
                  >
                    <account.icon className={`w-5 h-5 ${account.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy text-sm">
                      {account.platform}
                    </div>
                    <div className="text-xs text-warm-gray truncate">
                      {account.handle}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-navy text-sm">
                      {account.followers}
                    </div>
                    <Badge variant="success" dot>
                      Actif
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Publications */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" />
              Publications recentes
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentPublications.map((pub, i) => {
                const PIcon = platformIcon(pub.platform);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                  >
                    <Card padding="sm" className="cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <PIcon className="w-4 h-4 text-warm-gray" />
                          <span className="text-xs text-warm-gray">
                            {pub.platform}
                          </span>
                        </div>
                        <span className="text-xs text-warm-gray">
                          {pub.date}
                        </span>
                      </div>
                      <div className="w-full h-24 rounded-xl bg-gradient-to-br from-navy/5 to-gold/10 mb-3 flex items-center justify-center">
                        <Newspaper className="w-8 h-8 text-navy/20" />
                      </div>
                      <p className="font-medium text-navy text-sm mb-3 truncate">
                        {pub.title}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {pub.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {pub.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" />
                          {pub.shares}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Posts */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              Publications planifiees
            </h2>
            <Card hover={false}>
              <div className="space-y-4">
                {scheduledPosts.map((post, i) => {
                  const PIcon = platformIcon(post.platform);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <PIcon className="w-3 h-3 text-warm-gray" />
                          <span className="text-xs text-warm-gray">
                            {post.date}
                          </span>
                        </div>
                      </div>
                      <Badge variant="info" dot>
                        Planifie
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
    </>
  );
}

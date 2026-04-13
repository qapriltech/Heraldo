"use client";

import { motion } from "framer-motion";
import {
  Send,
  Users,
  ShieldCheck,
  ArrowRight,
  Newspaper,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const features = [
  {
    icon: Send,
    title: "EMISSION",
    subtitle: "Communiques de presse",
    description:
      "Diffusez vos communiques en 3 formats (long, court, flash) vers un reseau certifie de journalistes. Ciblage par media, thematique et zone geographique.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Users,
    title: "AGORA",
    subtitle: "Salle de presse virtuelle",
    description:
      "Organisez des conferences de presse en ligne avec branding personnalise, press kit integre et moderation en temps reel.",
    color: "text-orange",
    bg: "bg-orange/10",
  },
  {
    icon: ShieldCheck,
    title: "FCM",
    subtitle: "Fonds de couverture mediatique",
    description:
      "Deposez des fonds en escrow. Les journalistes sont remuneres sur preuve de couverture validee. Transparence totale.",
    color: "text-green",
    bg: "bg-green/10",
  },
];

const stats = [
  { value: "500+", label: "Institutions" },
  { value: "2 000+", label: "Journalistes certifies" },
  { value: "15 000+", label: "Communiques diffuses" },
  { value: "98%", label: "Taux de delivrabilite" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-navy-dark" />
            </div>
            <span className="text-xl font-bold text-navy tracking-tight">
              HERALDO
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-warm-gray hover:text-navy transition-colors"
            >
              Fonctionnalites
            </a>
            <a
              href="#stats"
              className="text-sm font-medium text-warm-gray hover:text-navy transition-colors"
            >
              Chiffres
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative gradient-hero min-h-screen flex items-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/3 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold-light">
                Plateforme de relations presse nouvelle generation
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-4">
              H
              <span className="text-gradient-gold inline-block">E</span>
              RALDO
            </h1>
            <p className="text-2xl md:text-3xl text-gold-light font-light mb-6 tracking-wide">
              Votre message, notre mission
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              La plateforme qui connecte institutions et journalistes.
              Communiques, conferences virtuelles et fonds de couverture
              mediatique reunis en une seule solution premium.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" variant="primary">
                  Espace Institution
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Espace Journaliste
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-gold/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-navy mb-4">
              Trois piliers, une plateforme
            </h2>
            <p className="text-warm-gray text-lg max-w-2xl mx-auto">
              HERALDO reunit tous les outils dont les institutions ont besoin
              pour communiquer efficacement avec les medias.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full" padding="lg">
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-1 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gold font-medium mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-warm-gray leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 gradient-hero">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-ivory">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-navy mb-4">
              Pret a transformer vos relations presse ?
            </h2>
            <p className="text-warm-gray text-lg mb-10">
              Rejoignez les institutions et journalistes qui font confiance a
              HERALDO pour diffuser et couvrir l&apos;information.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Commencer maintenant</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost">
                  Demander une demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-navy-dark" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                HERALDO
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-gold transition-colors">
                Conditions
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                Confidentialite
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm text-gray-600">
              &copy; 2026 HERALDO. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

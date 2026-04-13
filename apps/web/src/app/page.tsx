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
  ChevronRight,
  Play,
  BarChart3,
  Mic,
  FileText,
  Banknote,
  Star,
  Building2,
  Radio,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Send,
    title: "EMISSION",
    subtitle: "Communiques de presse",
    description: "Redigez et diffusez vos communiques en 3 formats simultanement vers un reseau certifie de journalistes accredites.",
    color: "#C8A45C",
    gradient: "from-gold/20 to-orange/10",
    accent: "border-gold/30",
  },
  {
    icon: Mic,
    title: "AGORA",
    subtitle: "Salle de presse virtuelle",
    description: "Organisez des conferences de presse en ligne avec branding personnalise, Q&A moderee et replay automatique.",
    color: "#E8742E",
    gradient: "from-orange/20 to-red/10",
    accent: "border-orange/30",
  },
  {
    icon: Banknote,
    title: "FCM",
    subtitle: "Fonds de couverture media",
    description: "Remplacez les per diems cash par un mecanisme digital transparent. Paiement a la preuve de couverture uniquement.",
    color: "#1A7A3C",
    gradient: "from-green/20 to-teal/10",
    accent: "border-green/30",
  },
  {
    icon: BarChart3,
    title: "IMPACT",
    subtitle: "Mesure en temps reel",
    description: "Mesurez la portee de chaque action : tirage presse, audience web, reach social, couverture TV et radio.",
    color: "#0E7490",
    gradient: "from-teal/20 to-navy/10",
    accent: "border-teal/30",
  },
];

const stats = [
  { value: "201", label: "Communes CI", icon: Building2 },
  { value: "255", label: "Deputes & Elus", icon: Star },
  { value: "500+", label: "Medias accredites", icon: Radio },
  { value: "1 200+", label: "Entreprises cibles", icon: TrendingUp },
];

const plans = [
  { name: "ELU", price: "240 000", desc: "Deputes, Conseillers", includes: "4 communiques/mois + 1 salle/trim" },
  { name: "MAIRIE", price: "480 000", desc: "Communes & Collectivites", includes: "8 communiques/mois + 1 salle/mois" },
  { name: "ENTREPRISE", price: "720 000", desc: "PME, Grandes entreprises, Groupes", includes: "12 communiques/mois + 2 salles/mois + Amplification 360", popular: true },
  { name: "INSTITUTION", price: "900 000", desc: "Ministeres, Directions, ONG", includes: "Illimite + 3 salles/mois + API + Studio editorial" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ivory overflow-hidden">
      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-sm">
              <Newspaper className="w-4.5 h-4.5 text-navy-dark" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-navy tracking-tight">HERALDO</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#modules" className="text-sm font-semibold text-warm-gray hover:text-navy transition-all">Modules</a>
            <a href="#tarifs" className="text-sm font-semibold text-warm-gray hover:text-navy transition-all">Tarifs</a>
            <a href="#chiffres" className="text-sm font-semibold text-warm-gray hover:text-navy transition-all">Chiffres</a>
            <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy-light transition-all shadow-md hover:shadow-lg">
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative gradient-hero min-h-screen flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/8 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange/6 rounded-full blur-[120px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] border border-gold/8 rounded-full" style={{ transform: "translate(-50%, -50%)", animation: "ring-rotate 60s linear infinite" }} />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] border border-gold/5 rounded-full" style={{ transform: "translate(-50%, -50%)", animation: "ring-rotate-reverse 45s linear infinite" }} />
          {/* Dot grid */}
          <div className="absolute inset-0 bg-dots opacity-30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                <span className="text-xs font-bold text-gold-light uppercase tracking-widest">Institutions &middot; Entreprises &middot; Collectivites</span>
              </motion.div>

              <h1 className="font-serif text-7xl md:text-8xl text-white tracking-tight mb-2 leading-[0.95]">
                H<span className="text-gradient-gold">E</span>RALDO
              </h1>
              <p className="text-2xl text-gold-light font-light mb-6 tracking-wide italic">
                &laquo; Votre message, notre mission &raquo;
              </p>
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed mb-10">
                La plateforme qui connecte institutions, entreprises et medias en Cote d&apos;Ivoire.
                Communiques de presse, conferences virtuelles AGORA et fonds de couverture mediatique — une solution premium pour toute organisation qui communique.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login" className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl gradient-gold text-navy-dark font-extrabold text-base shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 transition-all hover:-translate-y-0.5">
                  Espace Institution
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/auth/login" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-gold/30 text-gold font-bold text-base hover:bg-gold/10 transition-all">
                  <Play className="w-4 h-4" />
                  Espace Journaliste
                </Link>
              </div>
            </motion.div>

            {/* Right — Visual Card Stack */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="hidden lg:block relative">
              <div className="relative w-full h-[480px]">
                {/* Card 1 — Communique */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-0 left-0 right-12 glass-card-dark rounded-3xl p-6 z-30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Communique #CP-2026-047</p>
                      <p className="text-gray-400 text-xs">Ministere de l&apos;Economie</p>
                    </div>
                    <div className="ml-auto px-3 py-1 rounded-full bg-green/20 text-green-light text-xs font-bold">Diffuse</div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div><p className="text-2xl font-extrabold text-white">156</p><p className="text-[10px] text-gray-500 uppercase tracking-wider">Journalistes</p></div>
                    <div><p className="text-2xl font-extrabold text-gold">89%</p><p className="text-[10px] text-gray-500 uppercase tracking-wider">Ouverture</p></div>
                    <div><p className="text-2xl font-extrabold text-orange">12</p><p className="text-[10px] text-gray-500 uppercase tracking-wider">Articles</p></div>
                  </div>
                </motion.div>

                {/* Card 2 — AGORA Live */}
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute top-40 left-8 right-0 glass-card-dark rounded-3xl p-6 z-20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-orange" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Salle AGORA Premium</p>
                      <p className="text-gray-400 text-xs">Conference de presse Q1</p>
                    </div>
                    <div className="ml-auto px-3 py-1 rounded-full bg-red/20 text-red-pale text-xs font-bold badge-live flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red" />
                      LIVE
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-navy-dark -ml-1 first:ml-0">
                        {i <= 4 ? ["MD", "SK", "AB", "LN"][i-1] : "+82"}
                      </div>
                    ))}
                    <span className="text-xs text-gray-400 ml-2">87 participants connectes</span>
                  </div>
                </motion.div>

                {/* Card 3 — FCM Payment */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }} className="absolute top-72 left-4 right-8 glass-card-dark rounded-3xl p-6 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green/20 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-green" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">FCM — Paiement valide</p>
                      <p className="text-gray-400 text-xs">Preuve article verifiee par Admin HERALDO</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-green-light">8 500 F</p>
                      <p className="text-[10px] text-gray-500">Wave CI</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-gold/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== MODULES ===== */}
      <section id="modules" className="py-28 gradient-mesh relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <p className="text-xs font-extrabold text-gold uppercase tracking-[0.3em] mb-4">Plateforme complete</p>
            <h2 className="font-serif text-5xl text-navy mb-5">Quatre piliers, une mission</h2>
            <p className="text-warm-gray text-lg max-w-2xl mx-auto leading-relaxed">
              HERALDO reunit tous les outils dont les institutions ont besoin pour communiquer avec les medias de maniere structuree, tracable et efficace.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <div className={`premium-card p-8 h-full bg-gradient-to-br ${f.gradient} border ${f.accent}`}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `${f.color}15`, boxShadow: `0 8px 24px -4px ${f.color}25` }}>
                      <f.icon className="w-7 h-7" style={{ color: f.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-extrabold text-navy tracking-wide">{f.title}</h3>
                        <span className="text-xs font-bold text-warm-gray uppercase tracking-widest">{f.subtitle}</span>
                      </div>
                      <p className="text-warm-gray leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLIENTS ===== */}
      <section className="py-16 bg-ivory border-t border-ivory-dark/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-xs font-extrabold text-warm-gray uppercase tracking-[0.3em] mb-10">
            Concu pour toute organisation qui communique
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: Building2, label: "Mairies", sub: "201 communes" },
              { icon: Star, label: "Elus", sub: "Deputes, Conseillers" },
              { icon: Globe, label: "Ministeres", sub: "40+ directions" },
              { icon: Zap, label: "Entreprises", sub: "PME & Grands groupes" },
              { icon: Users, label: "Agences RP", sub: "Cabinets conseil" },
              { icon: ShieldCheck, label: "ONG", sub: "Fondations, Assoc." },
              { icon: Radio, label: "Federations", sub: "Ordres, Syndicats" },
            ].map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="text-center p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-navy/5 group-hover:bg-gold/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <c.icon className="w-5 h-5 text-navy/40 group-hover:text-gold transition-colors" />
                </div>
                <p className="text-sm font-bold text-navy">{c.label}</p>
                <p className="text-[11px] text-warm-gray">{c.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="chiffres" className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-xs font-extrabold text-gold/60 uppercase tracking-[0.3em] mb-12">
            Marche adressable Cote d&apos;Ivoire
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-gradient-gold mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TARIFS ===== */}
      <section id="tarifs" className="py-28 bg-ivory relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-extrabold text-gold uppercase tracking-[0.3em] mb-4">Tarification</p>
            <h2 className="font-serif text-5xl text-navy mb-5">Abonnements annuels</h2>
            <p className="text-warm-gray text-lg">Des formules adaptees a chaque type d&apos;institution</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`premium-card p-8 text-center relative ${p.popular ? "ring-2 ring-gold shadow-xl shadow-gold/10" : ""}`}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-gold text-navy-dark text-xs font-extrabold uppercase tracking-widest shadow-md">
                      Populaire
                    </div>
                  )}
                  <p className="text-xs font-extrabold text-gold uppercase tracking-[0.2em] mb-1">HERALDO</p>
                  <h3 className="text-2xl font-extrabold text-navy mb-1">{p.name}</h3>
                  <p className="text-sm text-warm-gray mb-6">{p.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-navy">{p.price}</span>
                    <span className="text-warm-gray text-sm ml-1">FCFA/an</span>
                  </div>
                  <p className="text-sm text-warm-gray mb-8">{p.includes}</p>
                  <Link href="/auth/login" className={`block w-full py-3.5 rounded-xl font-bold text-sm transition-all ${p.popular ? "gradient-gold text-navy-dark shadow-lg shadow-gold/20 hover:shadow-xl" : "bg-navy text-white hover:bg-navy-light"}`}>
                    Commencer
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gold/20">
              <Globe className="w-8 h-8 text-navy-dark" />
            </div>
            <h2 className="font-serif text-5xl text-white mb-5">Pret a transformer vos relations presse ?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez les institutions et entreprises ivoiriennes qui font confiance a HERALDO pour diffuser et couvrir l&apos;information de maniere professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login" className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl gradient-gold text-navy-dark font-extrabold text-lg shadow-2xl shadow-gold/25 hover:-translate-y-1 transition-all">
                Demander une demo
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="mailto:contact@heraldo.ci" className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl border border-gold/20 text-gold font-bold hover:bg-gold/5 transition-all">
                contact@heraldo.ci
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-navy-dark py-16 border-t border-navy-light/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                  <Newspaper className="w-4.5 h-4.5 text-navy-dark" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">HERALDO</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Infrastructure nationale de communication mediatique — Cote d&apos;Ivoire &amp; UEMOA.</p>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gold uppercase tracking-[0.2em] mb-4">Plateforme</h4>
              <div className="space-y-2.5 text-sm text-gray-500">
                <a href="#" className="block hover:text-gold transition-colors">Emission</a>
                <a href="#" className="block hover:text-gold transition-colors">Agora</a>
                <a href="#" className="block hover:text-gold transition-colors">FCM</a>
                <a href="#" className="block hover:text-gold transition-colors">Impact</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gold uppercase tracking-[0.2em] mb-4">Ressources</h4>
              <div className="space-y-2.5 text-sm text-gray-500">
                <a href="#" className="block hover:text-gold transition-colors">Documentation API</a>
                <a href="#" className="block hover:text-gold transition-colors">App Journaliste</a>
                <a href="#" className="block hover:text-gold transition-colors">Guide utilisateur</a>
                <a href="#" className="block hover:text-gold transition-colors">Assistance</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-gold uppercase tracking-[0.2em] mb-4">Legal</h4>
              <div className="space-y-2.5 text-sm text-gray-500">
                <a href="#" className="block hover:text-gold transition-colors">Conditions generales</a>
                <a href="#" className="block hover:text-gold transition-colors">Confidentialite</a>
                <a href="#" className="block hover:text-gold transition-colors">CNPCI / HACA</a>
              </div>
            </div>
          </div>
          <div className="border-t border-navy-light/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; 2026 HERALDO Technologies SA. Tous droits reserves. Abidjan, Cote d&apos;Ivoire.</p>
            <p className="text-xs text-gray-700 font-semibold">Partenaire : Association des Directeurs de Publications CI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

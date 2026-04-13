"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Mail,
  Lock,
  Building2,
  Pen,
  Landmark,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Role = "institution" | "journaliste" | "agence";

const roles: { id: Role; label: string; icon: typeof Building2; desc: string }[] = [
  {
    id: "institution",
    label: "Institution",
    icon: Building2,
    desc: "Entreprises, ONG, gouvernements",
  },
  {
    id: "journaliste",
    label: "Journaliste",
    icon: Pen,
    desc: "Journalistes et redactions",
  },
  {
    id: "agence",
    label: "Agence",
    icon: Landmark,
    desc: "Agences de communication",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("institution");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate with API
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-orange/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-navy-dark" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              HERALDO
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Votre message,
            <br />
            <span className="text-gradient-gold">notre mission.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Connectez-vous a votre espace pour diffuser vos communiques,
            organiser des conferences AGORA et gerer vos fonds de couverture
            mediatique.
          </p>
        </motion.div>
      </div>

      {/* Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-navy-dark" />
              </div>
              <span className="text-xl font-bold text-navy">HERALDO</span>
            </div>

            <h2 className="text-2xl font-bold text-navy mb-1">Connexion</h2>
            <p className="text-warm-gray text-sm mb-8">
              Accedez a votre espace HERALDO
            </p>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all cursor-pointer
                    ${
                      role === r.id
                        ? "bg-navy text-white shadow-lg"
                        : "bg-ivory hover:bg-ivory-dark text-warm-gray"
                    }`}
                >
                  <r.icon className="w-5 h-5" />
                  {r.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={role}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-warm-gray text-center mb-6"
              >
                {roles.find((r) => r.id === role)?.desc}
              </motion.p>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-navy placeholder-warm-gray/50 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 text-navy placeholder-warm-gray/50 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-navy cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-warm-gray cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-gold"
                  />
                  Se souvenir de moi
                </label>
                <a
                  href="#"
                  className="text-sm text-gold hover:text-gold-dark font-medium"
                >
                  Mot de passe oublie ?
                </a>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-warm-gray">
                Pas encore de compte ?{" "}
                <a
                  href="#"
                  className="text-gold font-semibold hover:text-gold-dark"
                >
                  Demander un acces
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Retour a l&apos;accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

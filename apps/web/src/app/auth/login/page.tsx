"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Mail,
  ArrowRight,
  Building2,
  Pen,
  Landmark,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

type Role = "INSTITUTION" | "JOURNALIST";
type Step = "email" | "otp" | "success";

const roles: { id: Role; label: string; icon: typeof Building2; desc: string }[] = [
  { id: "INSTITUTION", label: "Organisation", icon: Building2, desc: "Mairies, Ministeres, Entreprises, ONG, Agences RP" },
  { id: "JOURNALIST", label: "Journaliste & Media", icon: Pen, desc: "Presse, Radio, TV, Web, Influenceurs" },
];

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("INSTITUTION");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Etape 1 — Envoyer l'email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; message: string; devCode?: string }>("/auth/request-otp", { email, role });
      if (res.devCode) setDevCode(res.devCode);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  // Etape 2 — Verifier le code OTP
  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; user: { id: string; email: string; fullName: string; role: string }; accessToken: string; refreshToken: string }>("/auth/verify-otp", { email, code: finalCode });
      // Stocker les tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("heraldo_access_token", res.accessToken);
        localStorage.setItem("heraldo_refresh_token", res.refreshToken);
        localStorage.setItem("heraldo_user", JSON.stringify(res.user));
      }
      setStep("success");
      // Rediriger apres 1.5s
      setTimeout(() => {
        const dest = res.user.role === "JOURNALIST" ? "/journalist/dashboard" : "/institution/dashboard";
        window.location.href = dest;
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Code invalide ou expire");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Gestion des inputs OTP (6 cases)
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quand les 6 chiffres sont saisis
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Coller un code complet
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      handleVerifyOtp(pasted);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-orange/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-dots opacity-20" />
        </div>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold/20">
              <Newspaper className="w-6 h-6 text-navy-dark" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">HERALDO</span>
          </div>
          <h1 className="font-serif text-5xl text-white mb-4 leading-tight">
            Votre message,<br />
            <span className="text-gradient-gold">notre mission.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Connectez-vous pour diffuser vos communiques, organiser des conferences AGORA et gerer vos fonds de couverture mediatique.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["MK", "SD", "AC", "IT"].map((initials, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-navy-light border-2 border-navy-dark flex items-center justify-center text-[10px] font-bold text-gold">{initials}</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-white">500+ institutions</p>
              <p className="text-xs text-gray-500">font confiance a HERALDO</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-navy-dark" />
              </div>
              <span className="text-xl font-extrabold text-navy">HERALDO</span>
            </div>

            <AnimatePresence mode="wait">
              {/* ===== STEP 1: EMAIL ===== */}
              {step === "email" && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-extrabold text-navy mb-1">Connexion</h2>
                  <p className="text-warm-gray text-sm mb-8">Entrez votre email — nous vous enverrons un code de connexion.</p>

                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer
                          ${role === r.id ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-ivory hover:bg-ivory-dark text-warm-gray"}`}
                      >
                        <r.icon className="w-5 h-5" />
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p key={role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-warm-gray text-center mb-6">
                      {roles.find((r) => r.id === role)?.desc}
                    </motion.p>
                  </AnimatePresence>

                  <form onSubmit={handleRequestOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Adresse email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vous@entreprise.com"
                          required
                          autoFocus
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/80 text-navy placeholder-warm-gray/50 text-sm"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="px-4 py-3 rounded-xl bg-red/10 text-red text-sm font-medium">{error}</div>
                    )}

                    <Button type="submit" loading={loading} className="w-full" size="lg">
                      Recevoir mon code
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ===== STEP 2: OTP ===== */}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => { setStep("email"); setError(null); setOtp(["","","","","",""]); }} className="flex items-center gap-1 text-sm text-warm-gray hover:text-navy mb-6 transition-colors cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-gold" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-navy mb-2">Verification</h2>
                    <p className="text-warm-gray text-sm">
                      Entrez le code a 6 chiffres envoye a<br />
                      <span className="font-bold text-navy">{email}</span>
                    </p>
                  </div>

                  {/* Dev mode — show code */}
                  {devCode && (
                    <div className="px-4 py-3 rounded-xl bg-gold/10 text-gold-dark text-sm font-medium text-center mb-4">
                      Mode dev — Code: <span className="font-extrabold tracking-widest">{devCode}</span>
                    </div>
                  )}

                  {/* OTP inputs */}
                  <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-extrabold rounded-xl border-2 transition-all
                          ${digit ? "border-gold bg-gold/5 text-navy" : "border-gray-200 bg-white text-navy"}
                          focus:border-gold focus:ring-2 focus:ring-gold/20`}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-xl bg-red/10 text-red text-sm font-medium text-center mb-4">{error}</div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-warm-gray mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verification en cours...
                    </div>
                  )}

                  <div className="text-center">
                    <button onClick={handleRequestOtp as any} className="text-sm text-gold hover:text-gold-dark font-semibold cursor-pointer">
                      Renvoyer le code
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 3: SUCCESS ===== */}
              {step === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-navy mb-2">Connexion reussie</h2>
                  <p className="text-warm-gray text-sm mb-4">Redirection vers votre espace...</p>
                  <Loader2 className="w-5 h-5 text-gold animate-spin mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Retour a l&apos;accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

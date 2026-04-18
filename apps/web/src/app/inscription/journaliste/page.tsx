"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Mail,
  Phone,
  User,
  Building2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Mic,
  Banknote,
  FileText,
  Users,
  Download,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

type Step = "form" | "otp" | "success";

const SPECIALTIES = [
  "Politique",
  "Economie",
  "Societe",
  "Sport",
  "Culture",
  "International",
  "Tech",
  "Justice",
];

const COVERAGE_ZONES = [
  "Abidjan",
  "Bouake",
  "Yamoussoukro",
  "San Pedro",
  "Korhogo",
  "National",
  "International",
];

const LANGUAGES = ["Francais", "Anglais", "Baoule", "Dioula", "Bete"];

const BENEFITS = [
  {
    icon: FileText,
    title: "Recevez les communiques en premier",
    desc: "Acces prioritaire aux communiques de presse des institutions et entreprises.",
  },
  {
    icon: Mic,
    title: "Participez aux salles AGORA",
    desc: "Conferences de presse virtuelles avec Q&A en direct et replay.",
  },
  {
    icon: Banknote,
    title: "Gagnez des revenus FCM",
    desc: "Fonds de couverture mediatique : paiement digital a la preuve de couverture.",
  },
  {
    icon: Users,
    title: "Outils pro : capture, forum, annuaire",
    desc: "Capture audio, forum journaliste, annuaire des medias et des sources.",
  },
];

export default function InscriptionJournalistePage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [coverageZones, setCoverageZones] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["Francais"]);
  const [pressCardFile, setPressCardFile] = useState<File | null>(null);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (specialties.length === 0) {
      setError("Selectionnez au moins une specialite.");
      return;
    }
    if (coverageZones.length === 0) {
      setError("Selectionnez au moins une zone de couverture.");
      return;
    }
    if (languages.length === 0) {
      setError("Selectionnez au moins une langue.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        email,
        fullName,
        phone,
        mediaName,
        specialties,
        coverageZones,
        languages,
      };

      // Note: pressCardUrl upload would be handled separately via a file upload endpoint
      // For now we send without the file — the user can upload later in their profile

      const res = await api.post<{
        success: boolean;
        message: string;
        devCode?: string;
      }>("/auth/register-journalist", payload);

      if (res.devCode) setDevCode(res.devCode);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la creation du compte");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) handleVerifyOtp(code);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code || otp.join("");
    if (finalCode.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        user: {
          id: string;
          email: string;
          fullName: string;
          role: string;
        };
        accessToken: string;
        refreshToken: string;
      }>("/auth/verify-otp", { email, code: finalCode });

      if (typeof window !== "undefined") {
        localStorage.setItem("heraldo_access_token", res.accessToken);
        localStorage.setItem("heraldo_refresh_token", res.refreshToken);
        localStorage.setItem("heraldo_user", JSON.stringify(res.user));
      }
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Code invalide ou expire");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange/6 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-dots opacity-20" />
      </div>

      {/* Header */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-sm">
            <Newspaper className="w-4.5 h-4.5 text-navy-dark" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">
            HERALDO
          </span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-gold hover:text-gold-light transition-colors"
        >
          Deja inscrit ? Se connecter
        </Link>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title */}
              <div className="text-center mb-10">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-4xl md:text-5xl text-white mb-3"
                >
                  Rejoignez le reseau{" "}
                  <span className="text-gradient-gold">HERALDO</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-lg max-w-xl mx-auto"
                >
                  Creez votre compte journaliste gratuit et accedez a tout
                  l&apos;ecosysteme presse de Cote d&apos;Ivoire.
                </motion.p>
              </div>

              <div className="grid lg:grid-cols-5 gap-10 items-start">
                {/* Left panel — Benefits (desktop only) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="hidden lg:block lg:col-span-2 space-y-5 pt-4"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-gold" />
                    <span className="text-xs font-extrabold text-gold uppercase tracking-[0.2em]">
                      Avantages journaliste
                    </span>
                  </div>
                  {BENEFITS.map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="glass rounded-2xl p-5 flex gap-4 items-start"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                        <b.icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">
                          {b.title}
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {b.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Right panel — Registration form */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-3"
                >
                  <form onSubmit={handleSubmit}>
                    <div className="glass-card-dark rounded-3xl p-8 md:p-10 space-y-6">
                      {/* Error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red/10 border border-red/20 rounded-xl p-4 text-red-pale text-sm"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* Nom complet */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Nom complet *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean-Marc Kouame"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light/50 border border-navy-light text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Email professionnel *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="prenom.nom@media.ci"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light/50 border border-navy-light text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Telephone */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Telephone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+225 07 00 00 00 00"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light/50 border border-navy-light text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Media / Redaction */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Media / Redaction *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            required
                            value={mediaName}
                            onChange={(e) => setMediaName(e.target.value)}
                            placeholder="Fraternite Matin, RTI, Freelance..."
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light/50 border border-navy-light text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Specialites */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Specialites * (au moins 1)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALTIES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                toggleItem(specialties, setSpecialties, s)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                specialties.includes(s)
                                  ? "bg-gold/20 text-gold border border-gold/40"
                                  : "bg-navy-light/50 text-gray-400 border border-navy-light hover:border-gray-500"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zones de couverture */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Zones de couverture * (au moins 1)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COVERAGE_ZONES.map((z) => (
                            <button
                              key={z}
                              type="button"
                              onClick={() =>
                                toggleItem(
                                  coverageZones,
                                  setCoverageZones,
                                  z,
                                )
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                coverageZones.includes(z)
                                  ? "bg-gold/20 text-gold border border-gold/40"
                                  : "bg-navy-light/50 text-gray-400 border border-navy-light hover:border-gray-500"
                              }`}
                            >
                              {z}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Langues */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Langues *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES.map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() =>
                                toggleItem(languages, setLanguages, l)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                languages.includes(l)
                                  ? "bg-gold/20 text-gold border border-gold/40"
                                  : "bg-navy-light/50 text-gray-400 border border-navy-light hover:border-gray-500"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Carte de presse / Justificatif */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Carte de presse / Justificatif
                        </label>
                        <div
                          className="border-2 border-dashed border-navy-light rounded-xl p-6 text-center cursor-pointer hover:border-gold/30 transition-colors"
                          onClick={() =>
                            document.getElementById("pressCardInput")?.click()
                          }
                        >
                          <input
                            id="pressCardInput"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              setPressCardFile(e.target.files?.[0] || null)
                            }
                          />
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          {pressCardFile ? (
                            <p className="text-gold text-sm font-semibold">
                              {pressCardFile.name}
                            </p>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm">
                                Cliquez ou deposez un fichier ici
                              </p>
                              <p className="text-gray-600 text-xs mt-1">
                                Facultatif pour l&apos;inscription, requis pour
                                l&apos;accreditation complete
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full py-4 rounded-2xl gradient-gold text-navy-dark font-extrabold text-base shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Creer mon compte HERALDO
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-gray-600 text-xs">
                        En creant un compte, vous acceptez les{" "}
                        <a href="#" className="text-gold hover:underline">
                          conditions generales
                        </a>{" "}
                        et la{" "}
                        <a href="#" className="text-gold hover:underline">
                          politique de confidentialite
                        </a>{" "}
                        de HERALDO.
                      </p>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto mt-16"
            >
              <div className="glass-card-dark rounded-3xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-gold" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Verifiez votre email
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  Un code a 6 chiffres a ete envoye a{" "}
                  <span className="text-gold font-semibold">{email}</span>
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red/10 border border-red/20 rounded-xl p-3 text-red-pale text-sm mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {devCode && (
                  <div className="bg-gold/10 border border-gold/20 rounded-xl p-3 text-gold text-sm mb-6">
                    Mode dev — Code : <span className="font-mono font-bold">{devCode}</span>
                  </div>
                )}

                {/* OTP inputs */}
                <div className="flex justify-center gap-3 mb-8">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-navy-light/50 border border-navy-light text-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all"
                    />
                  ))}
                </div>

                <motion.button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join("").length !== 6}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-4 rounded-2xl gradient-gold text-navy-dark font-extrabold text-base shadow-xl shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verifier le code"
                  )}
                </motion.button>

                <button
                  onClick={() => {
                    setStep("form");
                    setError(null);
                  }}
                  className="mt-4 text-sm text-gray-500 hover:text-gold transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg mx-auto mt-16"
            >
              <div className="glass-card-dark rounded-3xl p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green/15 flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle2 className="w-10 h-10 text-green" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif text-3xl text-white mb-3"
                >
                  Bienvenue sur{" "}
                  <span className="text-gradient-gold">HERALDO</span> !
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 mb-10"
                >
                  <p className="text-gray-300 text-base">
                    Votre compte est cree. Votre accreditation est en cours de
                    validation.
                  </p>
                  <p className="text-gray-500 text-sm">
                    En attendant, vous pouvez explorer la plateforme.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Link
                    href="/journalist/dashboard"
                    className="group w-full py-4 rounded-2xl gradient-gold text-navy-dark font-extrabold text-base shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 transition-all flex items-center justify-center gap-3"
                  >
                    Acceder a mon espace
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="https://heraldo.ci/app/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl border-2 border-gold/30 text-gold font-bold text-base hover:bg-gold/10 transition-all flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Telecharger l&apos;app mobile
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

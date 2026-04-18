"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

const TEAL = "#0E7490";

interface Client {
  id: string;
  clientName: string;
  clientSector: string;
  clientLogo: string | null;
  clientBrandColor: string | null;
  isActive: boolean;
  updatedAt: string;
  _count: { reports: number; timeEntries: number };
}

export default function AgenceClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientSector: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    clientBrandColor: "#0E7490",
  });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await api.get<{ data: Client[]; total: number }>(
        "/agency/clients"
      );
      setClients(res.data);
    } catch (err) {
      console.error("Failed to load clients", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/agency/clients", form);
      setShowModal(false);
      setForm({
        clientName: "",
        clientSector: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        clientBrandColor: "#0E7490",
      });
      loadClients();
    } catch (err) {
      console.error("Failed to create client", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Clients</h1>
          <p className="text-sm text-warm-gray mt-1">
            Gerez votre portefeuille de clients
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: TEAL }} />
        </div>
      ) : clients.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center bg-white/80 border border-gray-100">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: TEAL }} />
          <h3 className="text-lg font-bold text-navy mb-2">
            Aucun client pour le moment
          </h3>
          <p className="text-sm text-warm-gray mb-4">
            Ajoutez votre premier client pour commencer.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: TEAL }}
          >
            <Plus className="w-4 h-4" />
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/agence/clients/${client.id}`}
              className="premium-card rounded-2xl p-5 bg-white/80 backdrop-blur-sm border border-gray-100 hover:shadow-lg transition-all block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: client.clientBrandColor || TEAL,
                    }}
                  >
                    {client.clientName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy">
                      {client.clientName}
                    </h3>
                    <p className="text-[11px] text-warm-gray">
                      {client.clientSector}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    client.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {client.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-warm-gray mb-3">
                <span>{client._count.reports} rapports</span>
                <span>{client._count.timeEntries} entrees temps</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-warm-gray">
                  Mis a jour{" "}
                  {new Date(client.updatedAt).toLocaleDateString("fr-FR")}
                </span>
                <ArrowRight className="w-4 h-4 text-warm-gray" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal — Nouveau client */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-warm-gray hover:text-navy"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-extrabold text-navy mb-1">
              Nouveau client
            </h2>
            <p className="text-sm text-warm-gray mb-6">
              Renseignez les informations de votre client.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Secteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.clientSector}
                    onChange={(e) =>
                      setForm({ ...form, clientSector: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy"
                    placeholder="Tech, Sante, Finance..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Contact principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={(e) =>
                      setForm({ ...form, contactName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Email contact *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({ ...form, contactEmail: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy"
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Telephone
                  </label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm({ ...form, contactPhone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-navy"
                    placeholder="+225 07 00 00 00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Couleur de marque
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.clientBrandColor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          clientBrandColor: e.target.value,
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <span className="text-xs text-warm-gray">
                      {form.clientBrandColor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-warm-gray hover:text-navy border border-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: TEAL }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Creer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

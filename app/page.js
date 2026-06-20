"use client";

import { useState } from "react";
import { Sparkles, Loader2, Download, Eye, Code2, ArrowRight, Palette, Building2, FileText, Check } from "lucide-react";

const SECTEURS = [
  "E-commerce / Boutique en ligne",
  "Restaurant / Café",
  "Coach / Consultant",
  "Artisan / BTP",
  "Salon de beauté / Bien-être",
  "Tech / SaaS / Startup",
  "Immobilier",
  "Autre",
];

const PALETTES = [
  { name: "Onyx", colors: ["#0A0A0A", "#F5F5F0", "#C9A227"] },
  { name: "Terracotta", colors: ["#F4F1EA", "#1A1A1A", "#C45D3C"] },
  { name: "Émeraude", colors: ["#0D2818", "#F8F6F0", "#2E8B57"] },
  { name: "Cobalt", colors: ["#0B1226", "#FFFFFF", "#3D5AFE"] },
  { name: "Rose poudré", colors: ["#FFF7F5", "#2B2118", "#E8927C"] },
  { name: "Mono", colors: ["#FFFFFF", "#111111", "#666666"] },
];

const STEPS = ["Identité", "Secteur & ton", "Style", "Génération"];

export default function SiteGen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nom: "",
    secteur: SECTEURS[0],
    description: "",
    ton: "Professionnel",
    palette: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");
  const [view, setView] = useState("preview");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.nom.trim().length > 1;
    if (step === 1) return form.description.trim().length > 5;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setHtml("");
    setStep(3);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          secteur: form.secteur,
          description: form.description,
          ton: form.ton,
          palette: PALETTES[form.palette],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
      setHtml(data.html);
    } catch (e) {
      setError(e?.message || "Erreur inconnue lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.nom.replace(/\s+/g, "-").toLowerCase() || "site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#F2F0EB] font-sans">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#D9A23B] flex items-center justify-center">
            <Sparkles size={15} className="text-black" />
          </div>
          <span className="font-semibold tracking-tight">SiteGen</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-white/40">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className={i <= step ? "text-[#D9A23B]" : ""}>{s}</span>
              {i < STEPS.length - 1 && <ArrowRight size={10} className="mx-1" />}
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 0 && (
          <Card title="Comment s'appelle ton business ?" icon={<Building2 size={18} />}>
            <input
              autoFocus
              value={form.nom}
              onChange={(e) => update("nom", e.target.value)}
              placeholder="Ex : BubbleLux, Studio Atlas, Café des Sens..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-lg outline-none focus:border-[#D9A23B] transition placeholder:text-white/30"
            />
            <NextButton onClick={() => setStep(1)} disabled={!canNext()} />
          </Card>
        )}

        {step === 1 && (
          <Card title="Parle-moi de ton secteur" icon={<FileText size={18} />}>
            <label className="block text-xs uppercase tracking-wide text-white/40 mb-2">Secteur</label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SECTEURS.map((s) => (
                <button
                  key={s}
                  onClick={() => update("secteur", s)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition ${
                    form.secteur === s
                      ? "border-[#D9A23B] bg-[#D9A23B]/10 text-[#D9A23B]"
                      : "border-white/10 text-white/70 hover:border-white/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="block text-xs uppercase tracking-wide text-white/40 mb-2">
              Décris ton business en 2-3 phrases
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              placeholder="Ex : Je vends des fauteuils bubble premium pour intérieurs cosy, livraison en France, positionnement haut de gamme..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-[#D9A23B] transition placeholder:text-white/30 resize-none mb-6"
            />

            <label className="block text-xs uppercase tracking-wide text-white/40 mb-2">Ton du site</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {["Professionnel", "Chaleureux", "Premium / luxe", "Fun / décontracté"].map((t) => (
                <button
                  key={t}
                  onClick={() => update("ton", t)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    form.ton === t
                      ? "border-[#D9A23B] bg-[#D9A23B]/10 text-[#D9A23B]"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <BackButton onClick={() => setStep(0)} />
              <NextButton onClick={() => setStep(2)} disabled={!canNext()} />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Choisis un style visuel" icon={<Palette size={18} />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {PALETTES.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => update("palette", i)}
                  className={`rounded-xl border p-3 transition ${
                    form.palette === i ? "border-[#D9A23B] bg-[#D9A23B]/10" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex gap-1.5 mb-3">
                    {p.colors.map((c) => (
                      <div key={c} className="w-6 h-6 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    {form.palette === i && <Check size={12} className="text-[#D9A23B]" />}
                    {p.name}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <BackButton onClick={() => setStep(1)} />
              <button
                onClick={generate}
                className="flex items-center gap-2 bg-[#D9A23B] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#e8b350] transition"
              >
                <Sparkles size={16} /> Générer le site
              </button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-white/60">
                <Loader2 className="animate-spin mb-4" size={28} />
                <p>Génération du site pour « {form.nom} »...</p>
                <p className="text-xs text-white/30 mt-1">Ça prend 15-30 secondes</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16 px-4">
                <p className="text-red-400 mb-2 font-medium">Génération impossible</p>
                <p className="text-red-400/70 text-sm mb-4 max-w-md mx-auto break-words">{error}</p>
                <button onClick={generate} className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40">
                  Réessayer
                </button>
              </div>
            )}

            {!loading && html && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <ToggleBtn active={view === "preview"} onClick={() => setView("preview")} icon={<Eye size={14} />}>
                      Aperçu
                    </ToggleBtn>
                    <ToggleBtn active={view === "code"} onClick={() => setView("code")} icon={<Code2 size={14} />}>
                      Code
                    </ToggleBtn>
                  </div>
                  <button
                    onClick={download}
                    className="flex items-center gap-2 bg-[#D9A23B] text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e8b350] transition"
                  >
                    <Download size={14} /> Télécharger le .html
                  </button>
                </div>

                {view === "preview" ? (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white" style={{ height: "70vh" }}>
                    <iframe srcDoc={html} title="preview" className="w-full h-full" sandbox="allow-scripts" />
                  </div>
                ) : (
                  <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs overflow-auto" style={{ height: "70vh" }}>
                    {html}
                  </pre>
                )}

                <button
                  onClick={() => {
                    setStep(0);
                    setHtml("");
                    setForm({ nom: "", secteur: SECTEURS[0], description: "", ton: "Professionnel", palette: 0 });
                  }}
                  className="mt-4 text-sm text-white/40 hover:text-white/70 transition"
                >
                  ← Générer un nouveau site
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6 text-white/50">
        {icon}
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function NextButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex items-center gap-2 bg-[#D9A23B] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#e8b350] transition disabled:opacity-30 disabled:cursor-not-allowed"
    >
      Suivant <ArrowRight size={16} />
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 text-white/50 hover:text-white/80 transition">
      ← Retour
    </button>
  );
}

function ToggleBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition ${
        active ? "border-[#D9A23B] bg-[#D9A23B]/10 text-[#D9A23B]" : "border-white/10 text-white/60 hover:border-white/30"
      }`}
    >
      {icon} {children}
    </button>
  );
}

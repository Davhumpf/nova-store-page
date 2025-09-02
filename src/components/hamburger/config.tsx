import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Loader2 } from "lucide-react";

/**
 * Config simple y útil:
 * - Tema: claro/oscuro (persistencia localStorage + Firestore si hay login)
 * - Moneda para formateo: COP | USD
 * - Densidad de tarjetas: normal | compacta
 */
type Settings = {
  theme: "dark" | "light";
  currency: "COP" | "USD";
  density: "normal" | "compact";
};

const DEFAULTS: Settings = { theme: "dark", currency: "COP", density: "normal" };

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem("nova_settings_theme", theme);
}

export default function ConfigPage() {
  const u = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState<Settings>(DEFAULTS);

  // cargar de localStorage y luego de Firestore
  useEffect(() => {
    const localTheme = (localStorage.getItem("nova_settings_theme") as "dark" | "light") || "dark";
    applyTheme(localTheme);
    setS(prev => ({ ...prev, theme: localTheme }));
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!u) { setLoading(false); return; }
      const ref = doc(db, "users", u.uid, "private", "settings");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Settings;
        setS({ ...DEFAULTS, ...data });
        applyTheme((data.theme || "dark") as "dark" | "light");
      }
      setLoading(false);
    };
    run();
  }, [u]);

  async function save() {
    setSaving(true);
    try {
      applyTheme(s.theme);
      if (u) {
        const ref = doc(db, "users", u.uid, "private", "settings");
        await setDoc(ref, s, { merge: true });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-white flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Cargando…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-lg font-semibold mb-4">Configuración</h2>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-5">
        <section>
          <div className="text-sm text-slate-300 mb-1">Tema</div>
          <div className="flex gap-3">
            <button
              onClick={() => setS(prev => ({ ...prev, theme: "dark" }))}
              className={`px-4 py-2 rounded-xl border ${s.theme === "dark" ? "border-yellow-400 text-yellow-400" : "border-slate-600 text-white"}`}
            >
              Oscuro
            </button>
            <button
              onClick={() => setS(prev => ({ ...prev, theme: "light" }))}
              className={`px-4 py-2 rounded-xl border ${s.theme === "light" ? "border-yellow-400 text-yellow-400" : "border-slate-600 text-white"}`}
            >
              Claro
            </button>
          </div>
        </section>

        <section>
          <div className="text-sm text-slate-300 mb-1">Moneda preferida</div>
          <select
            value={s.currency}
            onChange={(e) => setS(prev => ({ ...prev, currency: e.target.value as Settings["currency"] }))}
            className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm"
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
          </select>
        </section>

        <section>
          <div className="text-sm text-slate-300 mb-1">Densidad</div>
          <select
            value={s.density}
            onChange={(e) => setS(prev => ({ ...prev, density: e.target.value as Settings["density"] }))}
            className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm"
          >
            <option value="normal">Normal</option>
            <option value="compact">Compacta</option>
          </select>
          <div className="text-xs text-slate-400 mt-1">
            Algunas listas pueden mostrarse más “apretadas” en modo compacto.
          </div>
        </section>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-yellow-400 text-slate-900 font-semibold rounded-xl px-4 py-3 hover:bg-yellow-300 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar
        </button>
      </div>
    </div>
  );
}

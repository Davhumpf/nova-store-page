import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Check, Loader2, Gift, Ticket, ArrowLeft } from "lucide-react";

type FbTimestamp = { seconds: number; nanoseconds: number };

type UserDoc = {
  displayName?: string;
  email: string;
  photoURL?: string;
  points?: number;
  createdAt?: string | FbTimestamp;
};

type Reward = {
  id: string;
  title: string;
  value: number;         // ej: 10
  type: "percent" | "amount";
  costPoints: number;    // ej: 100
  active: boolean;
  createdAt?: string | FbTimestamp;
  expiresAt?: string | FbTimestamp;
};

const WAPP_NUMBER_E164 = "573027214125";

function toDate(v?: string | FbTimestamp) {
  if (!v) return undefined;
  if (typeof v === "string") return new Date(v);
  if (typeof v === "object" && "seconds" in v) return new Date(v.seconds * 1000);
  return undefined;
}

function openWhatsApp(text: string) {
  const url = `https://wa.me/${WAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

export default function UserPage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const [userDocRef, setUserDocRef] = useState<ReturnType<typeof doc> | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [displayName, setDisplayName] = useState("");

  const [rewards, setRewards] = useState<Reward[]>([]);

  // cargar user doc por UID; si no, buscar por email; si no existe, crear
  useEffect(() => {
    const run = async () => {
      if (!currentUser?.email) { setLoading(false); return; }

      const byUid = doc(db, "users", currentUser.uid);
      const byUidSnap = await getDoc(byUid);

      if (byUidSnap.exists()) {
        const data = byUidSnap.data() as UserDoc;
        setUserDocRef(byUid);
        setUserData(data);
        setDisplayName(data.displayName || currentUser.displayName || "");
        setLoading(false);
        return;
      }

      const qEmail = query(collection(db, "users"), where("email", "==", currentUser.email));
      const qs = await getDocs(qEmail);
      if (!qs.empty) {
        const d = qs.docs[0];
        const ref = doc(db, "users", d.id);
        setUserDocRef(ref);
        const data = d.data() as UserDoc;
        setUserData(data);
        setDisplayName(data.displayName || currentUser.displayName || "");
      } else {
        const ref = doc(db, "users", currentUser.uid);
        const payload: UserDoc = {
          email: currentUser.email,
          displayName: currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
          points: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(ref, payload);
        setUserDocRef(ref);
        setUserData(payload);
      }
      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cargar recompensas
  useEffect(() => {
    const run = async () => {
      const qRewards = query(collection(db, "rewards"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qRewards);
      const list: Reward[] = [];
      snap.forEach(d => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          title: data.title,
          value: Number(data.value || 0),
          type: (data.type || "percent") as "percent" | "amount",
          costPoints: Number(data.costPoints || 0),
          active: !!data.active,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt
        });
      });
      setRewards(list);
    };
    run();
  }, []);

  const points = userData?.points ?? 0;

  const visibleRewards = useMemo(() => {
    const now = new Date();
    return rewards.filter(r => {
      if (!r.active) return false;
      const exp = toDate(r.expiresAt);
      if (exp && exp < now) return false;
      return true;
    });
  }, [rewards]);

  async function saveDisplayName() {
    if (!currentUser || !userDocRef) return;
    const newName = displayName.trim();
    if (!newName) return;

    setSaving(true);
    try {
      // Actualiza en Auth
      await updateProfile(currentUser, { displayName: newName });
      // Asegura reflejo inmediato en otros componentes que lean auth.currentUser
      await currentUser.reload();

      // Actualiza en Firestore
      await updateDoc(userDocRef, { displayName: newName });

      // Estado local
      setUserData(prev => prev ? { ...prev, displayName: newName } : prev);

      // Notifica al resto de la app (hamburguesa)
      localStorage.setItem("menuDisplayName", newName);
      window.dispatchEvent(new CustomEvent("menu-name-changed", { detail: { displayName: newName } }));
    } finally {
      setSaving(false);
    }
  }

  // Canje con prechequeo: siempre permite clic. Si no alcanza, solo WhatsApp ayuda.
  async function redeem(reward: Reward) {
    if (!currentUser || !userDocRef) return;
    setRedeeming(reward.id);

    const userLabel =
      currentUser.displayName || userData?.displayName || currentUser.email || "Cliente";

    // faltan puntos → WhatsApp de ayuda y salir
    const currentPts = userData?.points ?? 0;
    if (currentPts < reward.costPoints) {
      const helpMsg =
        `Hola, soy ${userLabel}. Intenté canjear una recompensa pero no tengo puntos suficientes. ` +
        `¿Cómo puedo ganar más puntos?`;
      openWhatsApp(helpMsg);
      setRedeeming(null);
      return;
    }

    try {
      // transacción: valida, descuenta y registra
      await runTransaction(db, async (trx) => {
        const snap = await trx.get(userDocRef);
        const data = snap.data() as UserDoc | undefined;
        const current = data?.points ?? 0;
        if (current < reward.costPoints) throw new Error("SIN_PUNTOS");

        trx.update(userDocRef, { points: current - reward.costPoints });

        const redemptionRef = doc(collection(db, "users", currentUser.uid, "redemptions"));
        trx.set(redemptionRef, {
          rewardId: reward.id,
          title: reward.title,
          type: reward.type,
          value: reward.value,
          costPoints: reward.costPoints,
          redeemedAt: serverTimestamp()
        });
      });

      // refresca puntos
      const fresh = await getDoc(userDocRef);
      setUserData(fresh.data() as UserDoc);

      // WhatsApp confirmación
      const msgOk =
        `Hola, soy ${userLabel}. Ya canjeé la recompensa "${reward.title}" en mi perfil y ` +
        `quiero aplicarla en mi próxima compra. ¿Me ayudas a validarla?`;
      openWhatsApp(msgOk);
    } catch {
      alert("No se pudo canjear.");
    } finally {
      setRedeeming(null);
    }
  }

  if (!currentUser) {
    return <div className="p-6 text-white">Debes iniciar sesión.</div>;
  }

  if (loading || !userData) {
    return (
      <div className="p-6 text-white flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Cargando…
      </div>
    );
  }

  // Datos adicionales de Auth
  const meta = currentUser.metadata;
  const lastLogin = meta?.lastSignInTime ? new Date(meta.lastSignInTime) : undefined;
  const providers = (currentUser.providerData || [])
    .map(p => p.providerId?.replace(".com", ""))
    .join(", ");

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      {/* Volver */}
      <button
        onClick={() => (typeof navigate === "function" ? navigate(-1) : window.history.back())}
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-yellow-400"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header perfil */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
        <img
          src={currentUser.photoURL || userData.photoURL || ""}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover border border-slate-600"
        />
        <div className="flex-1">
          <div className="text-xs text-slate-400">{userData.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:ring-1 focus:ring-yellow-400"
              placeholder="Nombre para mostrar"
            />
            <button
              onClick={saveDisplayName}
              disabled={saving}
              className="bg-yellow-400 text-slate-900 text-sm font-semibold rounded-lg px-3 py-2 hover:bg-yellow-300 disabled:opacity-60 flex items-center gap-1"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Guardar
            </button>
          </div>
        </div>
        <div className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-slate-300">Puntos</div>
          <div className="text-xl font-bold text-yellow-400">{userData.points ?? 0}</div>
        </div>
      </div>

      {/* Datos de cuenta */}
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <InfoRow label="Correo" value={userData.email} />
        <InfoRow label="UID" value={auth.currentUser?.uid || "—"} />
        <InfoRow label="Creado (users.createdAt)" value={toDate(userData.createdAt)?.toLocaleString() || "—"} />
        <InfoRow label="Último inicio de sesión" value={lastLogin?.toLocaleString() || "—"} />
        <InfoRow label="Proveedor(es)" value={providers || "—"} />
      </div>

      {/* Recompensas */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={16} className="text-yellow-400" />
          <h3 className="font-semibold">Recompensas disponibles</h3>
        </div>

        {visibleRewards.length === 0 && (
          <div className="text-slate-400 text-sm">No hay recompensas activas.</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {visibleRewards.map((r) => {
            const exp = toDate(r.expiresAt);
            const canRedeem = (userData?.points ?? 0) >= r.costPoints;
            return (
              <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-yellow-400" />
                  <div className="font-semibold">{r.title}</div>
                </div>
                <div className="text-slate-300 text-sm mt-1">
                  Valor: {r.type === "percent" ? `${r.value}%` : `$${r.value}`}
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Costo: {r.costPoints} pts {exp ? `• vence: ${exp.toLocaleString()}` : ""}
                </div>
                <button
                  onClick={() => redeem(r)}
                  aria-disabled={redeeming === r.id}
                  className={`mt-3 w-full bg-yellow-400 text-slate-900 font-semibold rounded-xl px-4 py-2 hover:bg-yellow-300
                    ${!canRedeem ? "opacity-60" : ""} ${redeeming === r.id ? "pointer-events-none" : ""}`}
                >
                  {redeeming === r.id ? "Canjeando..." : canRedeem ? "Canjear" : "Puntos insuficientes"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canjes del usuario */}
      <UserRedemptions />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm break-all">{value || "—"}</div>
    </div>
  );
}

function UserRedemptions() {
  const u = auth.currentUser;
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const run = async () => {
      if (!u) return;
      const snap = await getDocs(query(collection(db, "users", u.uid, "redemptions")));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
      setItems(list.sort((a,b) => (a.redeemedAt?.seconds || 0) < (b.redeemedAt?.seconds || 0) ? 1 : -1));
    };
    run();
  }, [u]);

  if (!u) return null;

  return (
    <div className="mt-8">
      <div className="font-semibold mb-2">Mis canjes</div>
      {items.length === 0 ? (
        <div className="text-slate-400 text-sm">Aún no has canjeado recompensas.</div>
      ) : (
        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.id} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span>{it.title}</span>
                <span className="text-slate-400">
                  {it.redeemedAt?.seconds
                    ? new Date(it.redeemedAt.seconds * 1000).toLocaleString()
                    : "—"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

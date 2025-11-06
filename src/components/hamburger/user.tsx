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
import { Check, Loader2, Gift, Ticket, ArrowRight } from "lucide-react";

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
  value: number;
  type: "percent" | "amount";
  costPoints: number;
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const [userDocRef, setUserDocRef] = useState<ReturnType<typeof doc> | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [displayName, setDisplayName] = useState("");

  const [rewards, setRewards] = useState<Reward[]>([]);

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
      await updateProfile(currentUser, { displayName: newName });
      await currentUser.reload();
      await updateDoc(userDocRef, { displayName: newName });
      setUserData(prev => prev ? { ...prev, displayName: newName } : prev);
      localStorage.setItem("menuDisplayName", newName);
      window.dispatchEvent(new CustomEvent("menu-name-changed", { detail: { displayName: newName } }));
    } finally {
      setSaving(false);
    }
  }

  async function redeem(reward: Reward) {
    if (!currentUser || !userDocRef) return;
    setRedeeming(reward.id);

    const userLabel =
      currentUser.displayName || userData?.displayName || currentUser.email || "Cliente";

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

      const fresh = await getDoc(userDocRef);
      setUserData(fresh.data() as UserDoc);

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
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center p-4">
        <div className="text-[#5A5A5A] text-sm font-light">Debes iniciar sesión.</div>
      </div>
    );
  }

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#5A5A5A] text-xs">
          <Loader2 className="animate-spin" size={14} /> Cargando…
        </div>
      </div>
    );
  }

  const meta = currentUser.metadata;
  const lastLogin = meta?.lastSignInTime ? new Date(meta.lastSignInTime) : undefined;
  const providers = (currentUser.providerData || [])
    .map(p => p.providerId?.replace(".com", ""))
    .join(", ");

  return (
    <div className="min-h-screen bg-[#E8E8E8] py-3 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Botón volver estilo Apple */}
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#BA68C8] hover:text-[#9C27B0] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Volver</span>
        </button>

        {/* Header perfil */}
        <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <img
              src={currentUser.photoURL || userData.photoURL || ""}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#D0D0D0]"
            />
            <div className="flex-1 w-full sm:w-auto">
              <div className="text-[10px] text-[#8A8A8A] font-light mb-1">{userData.email}</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full sm:max-w-xs bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] focus:border-[#BA68C8] focus:outline-none transition-colors"
                  placeholder="Nombre para mostrar"
                />
                <button
                  onClick={saveDisplayName}
                  disabled={saving}
                  className="bg-[#BA68C8] text-white text-xs font-medium rounded-md px-3 py-1.5 hover:bg-[#9C27B0] disabled:opacity-50 flex items-center gap-1 transition-colors shadow-[0_2px_8px_rgba(186,104,200,0.25)] shrink-0"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Guardar
                </button>
              </div>
            </div>
            <div className="bg-white border border-[#D0D0D0] rounded-md px-4 py-2.5 text-center shrink-0">
              <div className="text-[9px] text-[#8A8A8A] font-light">Puntos</div>
              <div className="text-lg font-bold text-[#BA68C8]">{userData.points ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Datos de cuenta */}
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          <InfoRow label="Correo" value={userData.email} />
          <InfoRow label="UID" value={auth.currentUser?.uid || "—"} />
          <InfoRow label="Creado" value={toDate(userData.createdAt)?.toLocaleDateString() || "—"} />
          <InfoRow label="Último acceso" value={lastLogin?.toLocaleDateString() || "—"} />
          <InfoRow label="Proveedor" value={providers || "—"} />
        </div>

        {/* Recompensas */}
        <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <Gift size={14} className="text-[#BA68C8]" />
            <h3 className="font-medium text-sm text-[#2A2A2A]">Recompensas disponibles</h3>
          </div>

          {visibleRewards.length === 0 ? (
            <div className="text-[#8A8A8A] text-xs font-light">No hay recompensas activas.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {visibleRewards.map((r) => {
                const exp = toDate(r.expiresAt);
                const canRedeem = (userData?.points ?? 0) >= r.costPoints;
                return (
                  <div key={r.id} className="bg-white border border-[#D0D0D0] rounded-md p-3 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Ticket size={12} className="text-[#BA68C8]" />
                      <div className="font-medium text-xs text-[#2A2A2A] truncate">{r.title}</div>
                    </div>
                    <div className="text-[#5A5A5A] text-[10px] font-light mb-1">
                      Valor: {r.type === "percent" ? `${r.value}%` : `$${r.value}`}
                    </div>
                    <div className="text-[#8A8A8A] text-[9px] font-light mb-2">
                      Costo: {r.costPoints} pts {exp ? `• vence: ${exp.toLocaleDateString()}` : ""}
                    </div>
                    <button
                      onClick={() => redeem(r)}
                      aria-disabled={redeeming === r.id}
                      className={`w-full bg-[#BA68C8] text-white font-medium rounded-md px-3 py-1.5 hover:bg-[#9C27B0] transition-colors text-[10px] shadow-[0_2px_8px_rgba(186,104,200,0.25)]
                        ${!canRedeem ? "opacity-50" : ""} ${redeeming === r.id ? "pointer-events-none" : ""}`}
                    >
                      {redeeming === r.id ? "Canjeando..." : canRedeem ? "Canjear" : "Puntos insuficientes"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Canjes del usuario */}
        <UserRedemptions />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-md px-3 py-2">
      <div className="text-[9px] text-[#8A8A8A] font-light">{label}</div>
      <div className="text-[10px] text-[#2A2A2A] break-all">{value || "—"}</div>
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
    <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="font-medium text-sm text-[#2A2A2A] mb-2">Mis canjes</div>
      {items.length === 0 ? (
        <div className="text-[#8A8A8A] text-xs font-light">Aún no has canjeado recompensas.</div>
      ) : (
        <ul className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {items.map(it => (
            <li key={it.id} className="bg-white border border-[#D0D0D0] rounded-md px-3 py-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-medium text-[#2A2A2A]">{it.title}</span>
                <span className="text-[#8A8A8A] text-[9px]">
                  {it.redeemedAt?.seconds
                    ? new Date(it.redeemedAt.seconds * 1000).toLocaleDateString()
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
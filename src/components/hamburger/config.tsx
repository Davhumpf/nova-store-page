import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  Loader2,
  HelpCircle,
  Copy,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Ticket as TicketIcon,
  Users,
  Link as LinkIcon,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WAPP_NUMBER_E164 = "573027214125";

function openWhatsApp(text: string) {
  const url = `https://wa.me/${WAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt?: any;
};

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "¿Cómo puedo pagar mi suscripción?",
    a: "Aceptamos tarjeta, PSE y otros métodos locales. El pago queda asociado a tu cuenta de inmediato.",
  },
  {
    q: "¿Cómo gano puntos?",
    a: "Por cada $10,000 COP gastados acumulas 100 puntos. También recibes puntos por referidos cuando completen su primera compra.",
  },
  {
    q: "¿Cómo canjeo recompensas?",
    a: "Ve a tu perfil, entra a Recompensas, elige una y confirma. Si no alcanzan tus puntos, te guiamos por WhatsApp.",
  },
  {
    q: "¿Cómo funcionan los envíos de productos físicos?",
    a: "Despachamos a la dirección registrada. Recibirás estado de envío y número de guía en tu correo.",
  },
  {
    q: "¿Qué hago si algo falla?",
    a: "Abre un ticket aquí y/o escríbenos por WhatsApp. Respondemos lo antes posible.",
  },
];

export default function ConfigPage() {
  const u = auth.currentUser;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // --- Soporte/Tickets ---
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // --- Referidos (contador en el doc del usuario) ---
  const [refCount, setRefCount] = useState<number | null>(null);
  const [activeRefCount, setActiveRefCount] = useState<number | null>(null);

  const inviteUrl = useMemo(() => {
    const base = window.location.origin; // https://tu-dominio.com
    const path = "/register";            // ajusta si tu ruta de registro es distinta
    const uid = u?.uid || "guest";
    return `${base}${path}?ref=${uid}`;
  }, [u?.uid]);

  // Carga inicial: tickets + suscripción en tiempo real a mi doc (refCount/activeRefCount)
  useEffect(() => {
    const run = async () => {
      try {
        if (!u) {
          setLoading(false);
          return;
        }

        // 1) Cargar últimos tickets del usuario
        const qTickets = query(
          collection(db, "support-tickets"),
          where("userId", "==", u.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snapT = await getDocs(qTickets);
        const listT: Ticket[] = [];
        snapT.forEach((d) => {
          const data = d.data() as any;
          listT.push({
            id: d.id,
            subject: data.subject || "",
            message: data.message || "",
            status: (data.status as Ticket["status"]) || "pending",
            createdAt: data.createdAt,
          });
        });
        setTickets(listT);

        // 2) Suscribirse a mi documento para leer refCount/activeRefCount en tiempo real
        const meRef = doc(db, "users", u.uid);
        const unsub = onSnapshot(meRef, (snap) => {
          const data = snap.data() as any;
          setRefCount(
            typeof data?.refCount === "number" ? data.refCount : 0
          );
          setActiveRefCount(
            typeof data?.activeRefCount === "number" ? data.activeRefCount : 0
          );
        });

        return () => unsub();
      } finally {
        setLoading(false);
      }
    };

    const cleanup = run();
    return () => {
      // Si run devolvió una función (unsub), llámala
      if (typeof cleanup === "function") cleanup();
    };
  }, [u]);

  async function submitTicket() {
    if (!u) {
      alert("Debes iniciar sesión.");
      return;
    }
    const s = subject.trim();
    const m = message.trim();
    if (!s || !m) {
      alert("Por favor completa el asunto y la descripción.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "support-tickets"), {
        userId: u.uid,
        email: u.email || "",
        subject: s,
        message: m,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubject("");
      setMessage("");

      // Refresco optimista de la lista
      setTickets((prev) => [
        {
          id: `tmp-${Date.now()}`,
          subject: s,
          message: m,
          status: "pending",
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...prev,
      ]);
    } catch (e) {
      alert("No se pudo enviar el ticket. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyInvite() {
    navigator.clipboard.writeText(inviteUrl);
  }

  if (!u) {
    return (
      <div className="p-6 text-white">
        Debes iniciar sesión para ver esta sección.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-white flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Cargando…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      {/* Barra superior con botón de inicio */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-semibold rounded-xl px-4 py-2 hover:bg-yellow-300 transition"
          title="Volver al inicio"
        >
          <Home size={16} />
          Inicio
        </button>
      </div>

      {/* --- Soporte / Ayuda rápida --- */}
      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={18} className="text-yellow-400" />
          <h2 className="font-semibold">Soporte / Ayuda rápida</h2>
        </div>

        {/* FAQ */}
        <div className="space-y-2">
          {FAQS.map((f, idx) => {
            const open = faqOpenIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setFaqOpenIndex((prev) => (prev === idx ? null : idx))
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/40"
                >
                  <span className="font-medium">{f.q}</span>
                  {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {open && (
                  <div className="px-4 pb-3 text-sm text-slate-300">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp soporte */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              openWhatsApp(
                `Hola, soy ${u.displayName || u.email}. Necesito ayuda con: `
              )
            }
            className="inline-flex items-center gap-2 bg-green-400 text-slate-900 font-semibold rounded-xl px-4 py-2 hover:bg-green-300"
          >
            <MessageCircle size={16} />
            WhatsApp de soporte
          </button>
          <span className="text-sm text-slate-400">
            Respuestas rápidas por WhatsApp.
          </span>
        </div>

        {/* Crear ticket */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <TicketIcon size={16} className="text-yellow-400" />
            <h3 className="font-semibold">Crear ticket</h3>
          </div>
          <div className="grid gap-3">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm"
              placeholder="Asunto (ej. problema con pago/envío)"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm"
              placeholder="Describe tu problema o pregunta…"
            />
            <button
              onClick={submitTicket}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-semibold rounded-xl px-4 py-2 hover:bg-yellow-300 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar ticket
            </button>
          </div>
        </div>

        {/* Tus tickets */}
        <div className="mt-6">
          <div className="font-semibold mb-2">Mis tickets</div>
          {tickets.length === 0 ? (
            <div className="text-slate-400 text-sm">
              Aún no has creado tickets.
            </div>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.subject}</div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-slate-300 mt-1 line-clamp-3">
                    {t.message}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    {t.createdAt?.seconds
                      ? new Date(t.createdAt.seconds * 1000).toLocaleString()
                      : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* --- Invita y gana --- */}
      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-yellow-400" />
          <h2 className="font-semibold">Invita y gana</h2>
        </div>

        <div className="grid gap-3">
          <div className="text-sm text-slate-300">
            Comparte tu link personal. Cuando tus amigos se registren y hagan su
            primera compra, ¡ganas puntos extra!
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-xs break-all">
              {inviteUrl}
            </div>
            <button
              onClick={copyInvite}
              className="inline-flex items-center gap-2 bg-slate-200 text-slate-900 font-semibold rounded-xl px-4 py-2 hover:bg-white"
            >
              <Copy size={16} /> Copiar
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm">
              <LinkIcon size={14} className="text-yellow-400" />
              <span>
                Referidos: <b>{refCount === null ? "—" : refCount}</b>
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm">
              <LinkIcon size={14} className="text-yellow-400" />
              <span>
                Referidos activos: <b>{activeRefCount === null ? "—" : activeRefCount}</b>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Tip: si aún no marcas a los referidos activos, puedes hacerlo
            guardando <code>firstPurchase: true</code> en el usuario cuando
            complete su primera compra/suscripción. Este módulo ya cuenta usando
            ese campo (o usa <code>activeRefCount</code> si lo incrementas desde tu backend).
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    pending: { text: "Pendiente", cls: "bg-amber-400 text-slate-900" },
    in_progress: { text: "En proceso", cls: "bg-blue-400 text-slate-900" },
    resolved: { text: "Resuelto", cls: "bg-emerald-400 text-slate-900" },
  } as const;

  const s = map[status] || map.pending;
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${s.cls}`}>
      {s.text}
    </span>
  );
}

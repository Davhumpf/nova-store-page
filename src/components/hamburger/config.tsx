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
  ArrowRight,
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
  { q: "¿Cómo puedo pagar mi suscripción?", a: "Aceptamos tarjeta, PSE y otros métodos locales. El pago queda asociado a tu cuenta de inmediato." },
  { q: "¿Cómo gano puntos?", a: "Por cada $10,000 COP gastados acumulas 100 puntos. También recibes puntos por referidos cuando completen su primera compra." },
  { q: "¿Cómo canjeo recompensas?", a: "Ve a tu perfil, entra a Recompensas, elige una y confirma. Si no alcanzan tus puntos, te guiamos por WhatsApp." },
  { q: "¿Cómo funcionan los envíos de productos físicos?", a: "Despachamos a la dirección registrada. Recibirás estado de envío y número de guía en tu correo." },
  { q: "¿Qué hago si algo falla?", a: "Abre un ticket aquí y/o escríbenos por WhatsApp. Respondemos lo antes posible." },
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

  // --- Referidos (conteo por queries en tiempo real) ---
  const [refCount, setRefCount] = useState<number | null>(null);
  const [activeRefCount, setActiveRefCount] = useState<number | null>(null);

  const inviteUrl = useMemo(() => {
    const base = window.location.origin;
    const path = "/register";
    const uid = u?.uid || "guest";
    return `${base}${path}?ref=${uid}`;
  }, [u?.uid]);

  useEffect(() => {
    let unsubRefs: (() => void) | undefined;
    let unsubActive: (() => void) | undefined;

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

        // 2) Referidos en tiempo real
        const qRefs = query(
          collection(db, "users"),
          where("referrerId", "==", u.uid)
        );
        unsubRefs = onSnapshot(qRefs, (snap) => {
          setRefCount(snap.size);
        });

        // 3) Referidos activos
        const qRefsActive = query(
          collection(db, "users"),
          where("referrerId", "==", u.uid),
          where("firstPurchase", "==", true)
        );
        unsubActive = onSnapshot(qRefsActive, (snap) => {
          setActiveRefCount(snap.size);
        });
      } finally {
        setLoading(false);
      }
    };

    run();

    // Cleanup
    return () => {
      unsubRefs?.();
      unsubActive?.();
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

      // Refresco optimista
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
    } catch {
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
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center p-4">
        <div className="text-[#5A5A5A] text-sm font-light">Debes iniciar sesión para ver esta sección.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#5A5A5A] text-xs">
          <Loader2 className="animate-spin" size={14} /> Cargando…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8] py-3 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Botón volver estilo Apple */}
        <button
          onClick={() => navigate("/")}
          className="mb-3 flex items-center gap-1.5 text-xs text-[#4CAF50] hover:text-[#45a049] transition-colors group"
        >
          <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-medium">Inicio</span>
        </button>

        {/* --- Soporte / Ayuda rápida --- */}
        <section className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={14} className="text-[#4CAF50]" />
            <h2 className="font-medium text-sm text-[#2A2A2A]">Soporte / Ayuda rápida</h2>
          </div>

          {/* FAQ */}
          <div className="space-y-1.5">
            {FAQS.map((f, idx) => {
              const open = faqOpenIndex === idx;
              return (
                <div key={idx} className="border border-[#D0D0D0] rounded-md overflow-hidden bg-white">
                  <button
                    onClick={() => setFaqOpenIndex((prev) => (prev === idx ? null : idx))}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#FAFAFA] transition-colors"
                  >
                    <span className="font-medium text-xs text-[#2A2A2A]">{f.q}</span>
                    {open ? <ChevronUp size={12} className="text-[#8A8A8A] shrink-0" /> : <ChevronDown size={12} className="text-[#8A8A8A] shrink-0" />}
                  </button>
                  {open && <div className="px-3 pb-2 text-[10px] text-[#5A5A5A] font-light">{f.a}</div>}
                </div>
              );
            })}
          </div>

          {/* WhatsApp soporte */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => openWhatsApp(`Hola, soy ${u.displayName || u.email}. Necesito ayuda con: `)}
              className="inline-flex items-center gap-1.5 bg-[#4CAF50] text-white font-medium rounded-md px-3 py-1.5 hover:bg-[#45a049] transition-colors text-xs shadow-[0_2px_8px_rgba(76,175,80,0.25)]"
            >
              <MessageCircle size={12} />
              WhatsApp de soporte
            </button>
            <span className="text-[10px] text-[#8A8A8A] font-light">Respuestas rápidas</span>
          </div>

          {/* Crear ticket */}
          <div className="mt-4 pt-4 border-t border-[#D0D0D0]">
            <div className="flex items-center gap-1.5 mb-2">
              <TicketIcon size={12} className="text-[#4CAF50]" />
              <h3 className="font-medium text-xs text-[#2A2A2A]">Crear ticket</h3>
            </div>
            <div className="space-y-2">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] placeholder-[#8A8A8A] focus:border-[#4CAF50] focus:outline-none transition-colors"
                placeholder="Asunto (ej. problema con pago/envío)"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-xs text-[#2A2A2A] placeholder-[#8A8A8A] focus:border-[#4CAF50] focus:outline-none transition-colors resize-none"
                placeholder="Describe tu problema o pregunta…"
              />
              <button
                onClick={submitTicket}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-[#4CAF50] text-white font-medium rounded-md px-3 py-1.5 hover:bg-[#45a049] disabled:opacity-50 transition-colors text-xs shadow-[0_2px_8px_rgba(76,175,80,0.25)]"
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Enviar ticket
              </button>
            </div>
          </div>

          {/* Tus tickets */}
          <div className="mt-4 pt-4 border-t border-[#D0D0D0]">
            <div className="font-medium text-xs text-[#2A2A2A] mb-2">Mis tickets</div>
            {tickets.length === 0 ? (
              <div className="text-[#8A8A8A] text-[10px] font-light">Aún no has creado tickets.</div>
            ) : (
              <ul className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    className="bg-white border border-[#D0D0D0] rounded-md px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-[#2A2A2A] text-xs truncate flex-1">{t.subject}</div>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="text-[#5A5A5A] text-[10px] line-clamp-2 font-light mb-1">{t.message}</div>
                    <div className="text-[#8A8A8A] text-[9px]">
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
        <section className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#4FC3F7]" />
            <h2 className="font-medium text-sm text-[#2A2A2A]">Invita y gana</h2>
          </div>

          <div className="space-y-2.5">
            <div className="text-[10px] text-[#5A5A5A] font-light">
              Comparte tu link personal. Cuando tus amigos se registren y hagan su primera compra, ¡ganas puntos extra!
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-[10px] break-all text-[#2A2A2A]">
                {inviteUrl}
              </div>
              <button
                onClick={copyInvite}
                className="inline-flex items-center gap-1.5 bg-[#4FC3F7] text-white font-medium rounded-md px-3 py-1.5 hover:bg-[#039BE5] transition-colors text-xs shadow-[0_2px_8px_rgba(79,195,247,0.25)] shrink-0"
              >
                <Copy size={12} /> Copiar
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-[10px]">
                <LinkIcon size={10} className="text-[#4FC3F7]" />
                <span className="text-[#5A5A5A]">Referidos: <b className="text-[#2A2A2A]">{refCount === null ? "—" : refCount}</b></span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#D0D0D0] rounded-md px-2.5 py-1.5 text-[10px]">
                <LinkIcon size={10} className="text-[#4CAF50]" />
                <span className="text-[#5A5A5A]">Activos: <b className="text-[#2A2A2A]">{activeRefCount === null ? "—" : activeRefCount}</b></span>
              </div>
            </div>

            <div className="text-[9px] text-[#8A8A8A] font-light bg-white border border-[#D0D0D0] rounded-md p-2">
              Tip: Los referidos activos son aquellos que completaron su primera compra.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const map = {
    pending: { text: "Pendiente", cls: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    in_progress: { text: "En proceso", cls: "bg-[#4FC3F7]/10 text-[#4FC3F7] border-[#4FC3F7]/20" },
    resolved: { text: "Resuelto", cls: "bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20" },
  } as const;

  const s = map[status] || map.pending;
  return <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${s.cls} shrink-0`}>{s.text}</span>;
}
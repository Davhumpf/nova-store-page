import React, { useCallback, useMemo, useRef, useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

interface LoginProps { onSuccess?: () => void; }

const mapError = (code?: string) => {
  switch (code) {
    case 'auth/invalid-email': return 'Correo inválido.';
    case 'auth/user-disabled': return 'Cuenta deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password': return 'Usuario o contraseña incorrectos.';
    case 'auth/popup-closed-by-user': return 'Popup cancelado.';
    default: return 'No fue posible iniciar sesión.';
  }
};

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // bloqueo simple tras 5 fallos por 30s
  const [fails, setFails] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const now = Date.now();
  const isBlocked = blockedUntil !== null && now < blockedUntil;

  const provider = useMemo(() => new GoogleAuthProvider(), []);
  const emailRef = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (isBlocked) { setErr('Demasiados intentos. Intenta en unos segundos.'); return; }

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || pw.length < 8) {
      setErr('Revisa el correo y la contraseña.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, normEmail, pw);
      push({ type: 'success', title: 'Bienvenido', message: 'Sesión iniciada correctamente.' });
      onSuccess?.();
    } catch (e: any) {
      const msg = mapError(e?.code);
      setErr(msg);
      const nf = fails + 1;
      setFails(nf);
      if (nf >= 5) {
        setBlockedUntil(Date.now() + 30_000);
        setFails(0);
      }
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }, [email, pw, isBlocked, fails, onSuccess, push]);

  const onGoogle = useCallback(async () => {
    setErr('');
    if (isBlocked) { setErr('Demasiados intentos. Intenta en unos segundos.'); return; }
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      push({ type: 'success', title: 'Bienvenido', message: 'Sesión iniciada con Google.' });
      onSuccess?.();
    } catch (e: any) {
      setErr(mapError(e?.code));
    } finally {
      setLoading(false);
    }
  }, [isBlocked, onSuccess, provider, push]);

  return (
    <form onSubmit={onSubmit} className="space-y-3 animate-comic-pop">
      {/* email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#B0B0B0] z-10" size={16} />
        <input
          ref={emailRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="comic-input w-full pl-10 pr-3 py-2.5 text-sm placeholder-[#8A8A8A] dark:placeholder-[#666]"
          required
        />
      </div>

      {/* password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#B0B0B0] z-10" size={16} />
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Contraseña"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="comic-input w-full pl-10 pr-10 py-2.5 text-sm placeholder-[#8A8A8A] dark:placeholder-[#666]"
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#000] dark:text-[#B0B0B0] dark:hover:text-[#FFF] transition-colors z-10"
          aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || isBlocked}
        className="comic-button w-full bg-pop-cyan text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isBlocked ? 'Bloqueado temporalmente' : loading ? 'Iniciando…' : 'Iniciar sesión'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#000] dark:border-[#FFF] opacity-20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#F5F5F5] dark:bg-[#1F1F1F] px-3 text-[#666] dark:text-[#999] font-bold uppercase">o continuar con</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading || isBlocked}
        className="comic-border w-full bg-white dark:bg-[#1F1F1F] text-[#2A2A2A] dark:text-white hover:bg-[#FAFAFA] dark:hover:bg-[#2A2A2A] py-2.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors halftone-pattern"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={16} height={16} className="relative z-10" />
        <span className="relative z-10">Continuar con Google</span>
      </button>

      {err && (
        <div className="speech-bubble bg-pop-pink text-white dark:text-black font-bold text-xs flex items-center gap-2 animate-comic-pop">
          <AlertCircle size={14} className="shrink-0" />
          <span>{err}</span>
        </div>
      )}
    </form>
  );
};

export default Login;
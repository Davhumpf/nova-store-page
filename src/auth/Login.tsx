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
    <form onSubmit={onSubmit} className="space-y-2.5">
      {/* email */}
      <div className="relative">
        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={14} />
        <input
          ref={emailRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-[#D0D0D0] rounded-md text-[#2A2A2A] text-xs placeholder-[#8A8A8A] focus:border-[#4CAF50] focus:outline-none transition-colors"
          required
        />
      </div>

      {/* password */}
      <div className="relative">
        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={14} />
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Contraseña"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full pl-9 pr-9 py-2 bg-white border border-[#D0D0D0] rounded-md text-[#2A2A2A] text-xs placeholder-[#8A8A8A] focus:border-[#4CAF50] focus:outline-none transition-colors"
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#2A2A2A] transition-colors"
          aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || isBlocked}
        className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white py-2 rounded-md font-medium text-xs disabled:opacity-50 transition-colors shadow-[0_2px_8px_rgba(76,175,80,0.25)]"
      >
        {isBlocked ? 'Bloqueado temporalmente' : loading ? 'Iniciando…' : 'Iniciar sesión'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D0D0D0]" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-[#F5F5F5] px-2 text-[#8A8A8A] font-light">o continuar con</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading || isBlocked}
        className="w-full bg-white border border-[#D0D0D0] text-[#2A2A2A] hover:bg-[#FAFAFA] py-2 rounded-md font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={14} height={14} />
        Continuar con Google
      </button>

      {err && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 text-red-500 text-[10px] flex items-center gap-1.5 font-light">
          <AlertCircle size={12} className="shrink-0" />
          <span>{err}</span>
        </div>
      )}
    </form>
  );
};

export default Login;
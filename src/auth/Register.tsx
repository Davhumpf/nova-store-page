import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import {
  Mail, Lock, CheckCircle, XCircle, Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useLocation } from 'react-router-dom';

interface RegisterProps { onSuccess?: () => void; }

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const provider = useMemo(() => new GoogleAuthProvider(), []);
  const location = useLocation();

  // ===== Validaciones =====
  const [emailValid, setEmailValid] = useState(false);
  useEffect(() => {
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()));
  }, [email]);

  const [reqs, setReqs] = useState({ length:false, upper:false, lower:false, num:false, special:false });
  useEffect(() => {
    setReqs({
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /\d/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    });
  }, [pw]);

  const match = pw.length > 0 && pw === pw2;
  const valid = emailValid && Object.values(reqs).every(Boolean) && match;

  // ===== Referido =====
  const refParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('ref') || null;
  }, [location.search]);

  const ensureUserDoc = useCallback(async (u: {
    uid: string; email: string | null; displayName: string | null; photoURL: string | null;
  }) => {
    await u.getIdToken?.(true);
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: (u.email || '').toLowerCase(),
        displayName: u.displayName || '',
        photoURL: u.photoURL || '',
        points: 0,
        refCount: 0,
        activeRefCount: 0,
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
  }, []);

  const setReferrerOnNewUser = useCallback(async (uid: string, referrerId: string) => {
    if (!referrerId || !uid || referrerId === uid) return;
    await setDoc(doc(db, 'users', uid), {
      referrerId,
      referredAt: serverTimestamp(),
    }, { merge: true });
  }, []);

  // ===== Email/Contraseña =====
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!valid) { setErr('Revisa los campos.'); return; }
    setLoading(true);
    try {
      const normEmail = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, normEmail, pw);

      try {
        await ensureUserDoc(cred.user);
      } catch (w: any) {
        console.error('ensureUserDoc error:', w);
        if (w?.code === 'permission-denied') {
          push?.({ type: 'warning', title: 'Cuenta creada', message: 'No se pudo inicializar tu perfil aún (reglas). Intenta recargar.' });
        } else {
          throw w;
        }
      }

      if (refParam) {
        try {
          await setReferrerOnNewUser(cred.user.uid, refParam);
        } catch (w: any) {
          console.error('setReferrerOnNewUser error:', w);
          if (w?.code !== 'permission-denied') throw w;
        }
      }

      push({ type: 'success', title: 'Cuenta creada', message: 'Registro exitoso. Sesión iniciada.' });
      onSuccess?.();
    } catch (e: any) {
      console.error("Error en registro:", e);
      const code = e?.code;
      const msg =
        code === 'auth/email-already-in-use' ? 'Este correo ya está en uso.' :
        code === 'auth/invalid-email' ? 'Correo inválido.' :
        code === 'auth/weak-password' ? 'Contraseña muy débil.' :
        code ? `Error: ${code}` : 'No fue posible crear la cuenta.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [valid, email, pw, onSuccess, push, ensureUserDoc, refParam, setReferrerOnNewUser]);

  // ===== Google =====
  const onGoogle = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);

      try {
        await ensureUserDoc(res.user);
      } catch (w: any) {
        console.error('ensureUserDoc(G) error:', w);
        if (w?.code === 'permission-denied') {
          push?.({ type: 'warning', title: 'Sesión iniciada', message: 'No se pudo inicializar tu perfil aún (reglas). Intenta recargar.' });
        } else {
          throw w;
        }
      }

      const info = getAdditionalUserInfo(res);
      const isNew = !!info?.isNewUser;
      if (isNew && refParam) {
        try {
          await setReferrerOnNewUser(res.user.uid, refParam);
        } catch (w: any) {
          console.error('setReferrerOnNewUser(G) error:', w);
          if (w?.code !== 'permission-denied') throw w;
        }
      }

      push({
        type: 'success',
        title: isNew ? 'Cuenta creada' : 'Bienvenido',
        message: isNew ? 'Registro con Google exitoso.' : 'Sesión iniciada con Google.',
      });
      onSuccess?.();
    } catch (e: any) {
      console.error("Error en Google Sign-In:", e);
      setErr(e?.code ? `Error: ${e.code}` : 'Error con Google.');
    } finally {
      setLoading(false);
    }
  }, [provider, ensureUserDoc, onSuccess, push, refParam, setReferrerOnNewUser]);

  return (
    <form onSubmit={onSubmit} className="space-y-3 animate-comic-pop">
      {/* email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#B0B0B0] z-10" size={16} />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`comic-input w-full pl-10 pr-10 py-2.5 text-sm placeholder-[#8A8A8A] dark:placeholder-[#666] ${
            email ? (emailValid ? '!border-pop-green' : '!border-pop-red') : ''
          }`}
          required
        />
        {email && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {emailValid ? <CheckCircle size={16} className="text-pop-green" /> : <XCircle size={16} className="text-pop-red" />}
          </div>
        )}
      </div>

      {/* password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#B0B0B0] z-10" size={16} />
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Contraseña segura"
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

      {/* requisitos */}
      {pw && (
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-3 space-y-2 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
          <div className="text-xs text-[#000] dark:text-[#FFF] font-bold uppercase relative z-10">Requisitos:</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium relative z-10">
            <div className={`flex items-center gap-1.5 ${reqs.length ? 'text-pop-green' : 'text-pop-red'}`}>
              {reqs.length ? <CheckCircle size={12} /> : <XCircle size={12} />} 8+ caracteres
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.upper ? 'text-pop-green' : 'text-pop-red'}`}>
              {reqs.upper ? <CheckCircle size={12} /> : <XCircle size={12} />} Mayúscula
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.lower ? 'text-pop-green' : 'text-pop-red'}`}>
              {reqs.lower ? <CheckCircle size={12} /> : <XCircle size={12} />} Minúscula
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.num ? 'text-pop-green' : 'text-pop-red'}`}>
              {reqs.num ? <CheckCircle size={12} /> : <XCircle size={12} />} Número
            </div>
            <div className={`flex items-center gap-1.5 col-span-2 ${reqs.special ? 'text-pop-green' : 'text-pop-red'}`}>
              {reqs.special ? <CheckCircle size={12} /> : <XCircle size={12} />} Carácter especial
            </div>
          </div>
        </div>
      )}

      {/* confirmar */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] dark:text-[#B0B0B0] z-10" size={16} />
        <input
          type={showPw2 ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Confirmar contraseña"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          className={`comic-input w-full pl-10 pr-10 py-2.5 text-sm placeholder-[#8A8A8A] dark:placeholder-[#666] ${
            pw2 ? (match ? '!border-pop-green' : '!border-pop-red') : ''
          }`}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw2(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#000] dark:text-[#B0B0B0] dark:hover:text-[#FFF] transition-colors z-10"
          aria-label={showPw2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* submit */}
      <button
        type="submit"
        disabled={loading || !valid}
        className={`w-full border-4 border-black dark:border-white text-sm font-black uppercase py-2.5 shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)] ${
          valid ? 'bg-white dark:bg-black text-pop-yellow' : 'bg-white dark:bg-black text-[#8A8A8A] dark:text-[#666] cursor-not-allowed opacity-60'
        }`}
      >
        {loading ? 'Creando…' : 'Crear cuenta'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#000] dark:border-[#FFF] opacity-20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-black px-3 text-[#666] dark:text-[#999] font-bold uppercase">o continuar con</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="w-full border-4 border-black dark:border-white bg-white dark:bg-black text-[#2A2A2A] dark:text-white hover:shadow-[6px_6px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.5)] py-2.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={16} height={16} className="relative z-10" />
        <span className="relative z-10">Continuar con Google</span>
      </button>

      {err && (
        <div className="border-4 border-black dark:border-white bg-white dark:bg-black px-3 py-2 font-bold text-xs flex items-center gap-2 animate-comic-pop shadow-[4px_4px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
          <AlertCircle size={14} className="shrink-0 text-pop-pink" />
          <span className="text-pop-pink">{err}</span>
        </div>
      )}
    </form>
  );
};

export default Register;
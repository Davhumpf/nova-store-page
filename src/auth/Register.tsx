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
    <form onSubmit={onSubmit} className="space-y-2.5">
      {/* email */}
      <div className="relative">
        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={14} />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full pl-9 pr-9 py-2 bg-white border rounded-md text-[#2A2A2A] text-xs placeholder-[#8A8A8A] focus:outline-none transition-colors ${
            email ? (emailValid ? 'border-[#4CAF50]' : 'border-red-500') : 'border-[#D0D0D0] focus:border-[#4CAF50]'
          }`}
          required
        />
        {email && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {emailValid ? <CheckCircle size={14} className="text-[#4CAF50]" /> : <XCircle size={14} className="text-red-500" />}
          </div>
        )}
      </div>

      {/* password */}
      <div className="relative">
        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={14} />
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Contraseña segura"
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

      {/* requisitos */}
      {pw && (
        <div className="bg-[#F5F5F5] border border-[#D0D0D0] rounded-md p-2 space-y-1">
          <div className="text-[10px] text-[#8A8A8A] font-light mb-1">Requisitos:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div className={`flex items-center gap-1 ${reqs.length ? 'text-[#4CAF50]' : 'text-red-500'}`}>
              {reqs.length ? <CheckCircle size={10} /> : <XCircle size={10} />} 8+ caracteres
            </div>
            <div className={`flex items-center gap-1 ${reqs.upper ? 'text-[#4CAF50]' : 'text-red-500'}`}>
              {reqs.upper ? <CheckCircle size={10} /> : <XCircle size={10} />} Mayúscula
            </div>
            <div className={`flex items-center gap-1 ${reqs.lower ? 'text-[#4CAF50]' : 'text-red-500'}`}>
              {reqs.lower ? <CheckCircle size={10} /> : <XCircle size={10} />} Minúscula
            </div>
            <div className={`flex items-center gap-1 ${reqs.num ? 'text-[#4CAF50]' : 'text-red-500'}`}>
              {reqs.num ? <CheckCircle size={10} /> : <XCircle size={10} />} Número
            </div>
            <div className={`flex items-center gap-1 col-span-2 ${reqs.special ? 'text-[#4CAF50]' : 'text-red-500'}`}>
              {reqs.special ? <CheckCircle size={10} /> : <XCircle size={10} />} Carácter especial
            </div>
          </div>
        </div>
      )}

      {/* confirmar */}
      <div className="relative">
        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" size={14} />
        <input
          type={showPw2 ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Confirmar contraseña"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          className={`w-full pl-9 pr-9 py-2 bg-white border rounded-md text-[#2A2A2A] text-xs placeholder-[#8A8A8A] focus:outline-none transition-colors ${
            pw2 ? (match ? 'border-[#4CAF50]' : 'border-red-500') : 'border-[#D0D0D0] focus:border-[#4CAF50]'
          }`}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw2(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#2A2A2A] transition-colors"
          aria-label={showPw2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* submit */}
      <button
        type="submit"
        disabled={loading || !valid}
        className={`w-full py-2 rounded-md font-medium text-xs transition-colors shadow-[0_2px_8px_rgba(76,175,80,0.25)] ${
          valid ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white' : 'bg-[#E8E8E8] text-[#8A8A8A] cursor-not-allowed'
        }`}
      >
        {loading ? 'Creando…' : 'Crear cuenta'}
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
        disabled={loading}
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

export default Register;
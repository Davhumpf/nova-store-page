import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';


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

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!valid) { setErr('Revisa los campos.'); return; }
    setLoading(true);
    try {
      const normEmail = email.trim().toLowerCase();
      await createUserWithEmailAndPassword(auth, normEmail, pw);
      push({ type: 'success', title: 'Cuenta creada', message: 'Registro exitoso. Sesión iniciada.' });
      onSuccess?.();
    } catch (e: any) {
      const code = e?.code;
      const msg =
        code === 'auth/email-already-in-use' ? 'Este correo ya está en uso.' :
        code === 'auth/invalid-email' ? 'Correo inválido.' :
        code === 'auth/weak-password' ? 'Contraseña muy débil.' :
        'No fue posible crear la cuenta.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [valid, email, pw, onSuccess, push]);

  const onGoogle = useCallback(async () => {
    setErr('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      push({ type: 'success', title: 'Bienvenido', message: 'Sesión iniciada con Google.' });
      onSuccess?.();
    } catch (e: any) {
      setErr('Error con Google.');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, provider, push]);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border rounded-lg text-slate-100 text-sm focus:outline-none transition-colors ${
            email ? (emailValid ? 'border-green-400' : 'border-red-400') : 'border-slate-700 focus:border-yellow-400'
          }`}
          required
        />
        {email && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {emailValid ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
          </div>
        )}
      </div>

      {/* password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Contraseña segura"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-yellow-400 focus:outline-none"
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* requisitos */}
      {pw && (
        <div className="bg-slate-800/30 rounded-lg p-2.5 space-y-1">
          <div className="text-xs text-slate-400 mb-1">Requisitos:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={`flex items-center gap-1 ${reqs.length ? 'text-green-400' : 'text-red-400'}`}>
              {reqs.length ? <CheckCircle size={12} /> : <XCircle size={12} />} 8+ caracteres
            </div>
            <div className={`flex items-center gap-1 ${reqs.upper ? 'text-green-400' : 'text-red-400'}`}>
              {reqs.upper ? <CheckCircle size={12} /> : <XCircle size={12} />} Mayúscula
            </div>
            <div className={`flex items-center gap-1 ${reqs.lower ? 'text-green-400' : 'text-red-400'}`}>
              {reqs.lower ? <CheckCircle size={12} /> : <XCircle size={12} />} Minúscula
            </div>
            <div className={`flex items-center gap-1 ${reqs.num ? 'text-green-400' : 'text-red-400'}`}>
              {reqs.num ? <CheckCircle size={12} /> : <XCircle size={12} />} Número
            </div>
            <div className={`flex items-center gap-1 col-span-2 ${reqs.special ? 'text-green-400' : 'text-red-400'}`}>
              {reqs.special ? <CheckCircle size={12} /> : <XCircle size={12} />} Carácter especial
            </div>
          </div>
        </div>
      )}

      {/* confirmar */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type={showPw2 ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Confirmar contraseña"
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border rounded-lg text-slate-100 text-sm focus:outline-none transition-colors ${
            pw2 ? (match ? 'border-green-400' : 'border-red-400') : 'border-slate-700 focus:border-yellow-400'
          }`}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw2(s => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          aria-label={showPw2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* submit */}
      <button
        type="submit"
        disabled={loading || !valid}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
          valid ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-900' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Creando…' : 'Crear cuenta'}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-slate-800/50 px-2 text-slate-400">o</span></div>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="w-full bg-white text-slate-900 hover:opacity-90 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={16} height={16} />
        Continuar con Google
      </button>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{err}</span>
        </div>
      )}
    </form>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, Lock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Validaciones en tiempo real
  const [emailValid, setEmailValid] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Validar email en tiempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Validar contraseña en tiempo real
  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  // Validar que las contraseñas coincidan
  useEffect(() => {
    setPasswordsMatch(password === confirmPassword && confirmPassword.length > 0);
  }, [password, confirmPassword]);

  const isFormValid = emailValid && 
    Object.values(passwordRequirements).every(req => req) && 
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!isFormValid) {
      setError("Por favor completa todos los requisitos.");
      return;
    }
    
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Este correo ya está en uso.");
      } else {
        setError("Error al crear la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError("Error con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border rounded-lg text-white text-sm focus:outline-none transition-colors ${
            email && emailValid ? 'border-green-400' : 
            email && !emailValid ? 'border-red-400' : 
            'border-slate-700 focus:border-yellow-400'
          }`}
          required
        />
        {email && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {emailValid ? 
              <CheckCircle className="text-green-400" size={16} /> : 
              <XCircle className="text-red-400" size={16} />
            }
          </div>
        )}
      </div>
      
      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="password"
          placeholder="Contraseña segura"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
          required
        />
      </div>

      {/* Password Requirements - Solo si se está escribiendo */}
      {password && (
        <div className="bg-slate-800/30 rounded-lg p-2.5 space-y-1">
          <div className="text-xs text-gray-400 mb-1">Requisitos de contraseña:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-400' : 'text-red-400'}`}>
              {passwordRequirements.length ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>8+ caracteres</span>
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-400' : 'text-red-400'}`}>
              {passwordRequirements.uppercase ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>Mayúscula</span>
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-400' : 'text-red-400'}`}>
              {passwordRequirements.lowercase ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>Minúscula</span>
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-400' : 'text-red-400'}`}>
              {passwordRequirements.number ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>Número</span>
            </div>
            <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-400' : 'text-red-400'} col-span-2`}>
              {passwordRequirements.special ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>Carácter especial (!@#$%...)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border rounded-lg text-white text-sm focus:outline-none transition-colors ${
            confirmPassword && passwordsMatch ? 'border-green-400' : 
            confirmPassword && !passwordsMatch ? 'border-red-400' : 
            'border-slate-700 focus:border-yellow-400'
          }`}
          required
        />
        {confirmPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {passwordsMatch ? 
              <CheckCircle className="text-green-400" size={16} /> : 
              <XCircle className="text-red-400" size={16} />
            }
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <button 
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
          isFormValid 
            ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900' 
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
        type="submit"
        disabled={loading || !isFormValid}
      >
        {loading ? "Creando..." : "Crear Cuenta"}
      </button>
      
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-900 px-2 text-gray-400">o</span>
        </div>
      </div>
      
      {/* Google Button */}
      <button 
        type="button" 
        onClick={handleGoogle} 
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        disabled={loading}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
          <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
          <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
          <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.40-3.067Z" />
        </svg>
        Google
      </button>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};
export default Register;
import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, Lock, UserPlus, AlertCircle } from "lucide-react";

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
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
      setError("Hubo un error con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <div className="relative flex items-center bg-slate-800/40 border border-slate-600/30 rounded-lg overflow-hidden">
            <div className="p-3 text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 pl-0 w-full bg-transparent text-white outline-none placeholder-gray-400 text-sm"
              required
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div>
          <div className="relative flex items-center bg-slate-800/40 border border-slate-600/30 rounded-lg overflow-hidden">
            <div className="p-3 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Contraseña (6+ caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 pl-0 w-full bg-transparent text-white outline-none placeholder-gray-400 text-sm"
              required
            />
          </div>
        </div>
        
        {/* Confirm Password Field */}
        <div>
          <div className="relative flex items-center bg-slate-800/40 border border-slate-600/30 rounded-lg overflow-hidden">
            <div className="p-3 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="p-3 pl-0 w-full bg-transparent text-white outline-none placeholder-gray-400 text-sm"
              required
            />
          </div>
          
          {/* Password Match Indicator */}
          {password && confirmPassword && password !== confirmPassword && (
            <div className="mt-2 text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Las contraseñas no coinciden</span>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button 
          className={`w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            loading || password !== confirmPassword || password.length < 6 ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
          }`} 
          type="submit"
          disabled={loading || password !== confirmPassword || password.length < 6}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm">Creando...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span className="text-sm">Crear Cuenta</span>
            </>
          )}
        </button>
        
        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600/50"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900/80 px-3 py-1 text-xs text-gray-400 rounded-full">
              O
            </span>
          </div>
        </div>
        
        {/* Google Button */}
        <button 
          type="button" 
          onClick={handleGoogle} 
          className={`w-full bg-white/10 text-white border border-white/20 rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/20'
          }`}
          disabled={loading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
            <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
            <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
            <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.40-3.067Z" />
          </svg>
          <span className="text-sm">Google</span>
        </button>
        
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};
export default Register;
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; title?: string; message: string; type: ToastType; timeout?: number };

const ToastCtx = createContext<{ push:(t: Omit<Toast,'id'>)=>void } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast,'id'>) => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), timeout: 2500, ...t }]);
  }, []);
  const remove = useCallback((id:number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => remove(t.id), t.timeout));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts, remove]);

  const icon = (type:ToastType) =>
    type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
    type === 'error'   ? <AlertCircle   className="w-5 h-5 text-red-400" />   :
                         <Info          className="w-5 h-5 text-blue-400" />;

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}

      {/* Contenedor de toasts */}
      <div
        aria-live="polite" aria-atomic="true"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 px-2 w-full pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto mx-auto max-w-sm w-[92%] sm:w-[26rem]
                       rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur
                       text-slate-200 shadow-lg shadow-black/20 p-3"
          >
            <div className="flex items-start gap-3">
              {icon(t.type)}
              <div className="flex-1 min-w-0">
                {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                <div className="text-sm text-slate-300 break-words">{t.message}</div>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-200 text-sm"
                aria-label="Cerrar notificación"
              >✕</button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

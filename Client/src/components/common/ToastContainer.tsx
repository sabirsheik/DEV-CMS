import React from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCmsStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        };

        const borderColors = {
          success: 'border-emerald-500/30',
          error: 'border-red-500/30',
          warning: 'border-amber-500/30',
          info: 'border-blue-500/30'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-[#0f172a] border ${borderColors[toast.type]} rounded-lg shadow-xl text-slate-100 text-xs animate-in slide-in-from-right-4 duration-200`}
            role="status"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100">{toast.title}</div>
              {toast.message && <div className="text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 -mr-1 rounded"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

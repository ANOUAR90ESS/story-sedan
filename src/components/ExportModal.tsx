import { motion } from "motion/react";
import {Video as VideoIcon} from "lucide-react";

export function ExportModal({ progress, message, onClose, downloadUrl }: { progress: number; message: string; onClose: () => void; downloadUrl?: string | null }) {
  const done = progress === 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 max-w-md w-full border-white/20 space-y-8"
      >
        <div className="space-y-2">
          <h3 className="text-xl font-serif font-black text-amber-accent flex items-center gap-3">
             <VideoIcon size={24} /> {done ? "PRODUCTION COMPLETE" : "CHRONICLE EXPORTING"}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
            {done ? "Thy epic artifact is ready for distribution" : "Forging cinematic assets into a single timeline"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="h-full bg-amber-accent rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            />
          </div>
          <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
            <span className="text-amber-accent animate-pulse">{message}</span>
            <span className="text-white">{progress}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          {done && downloadUrl && (
            <a 
              href={downloadUrl} 
              download 
              className="w-full bg-amber-accent text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-muted active:scale-95 transition-all text-xs tracking-widest uppercase amber-shadow"
            >
              Download Master File
            </a>
          )}
          <button 
            onClick={onClose}
            className="w-full bg-white/5 text-gray-400 font-black py-4 rounded-xl text-xs tracking-widest uppercase hover:bg-white/10 transition-all border border-white/10"
          >
            {done ? "Close Production" : "Close & Keep Processing"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}


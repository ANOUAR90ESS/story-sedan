import React, { useEffect, useState } from "react";
import { checkHeyGenVideoStatus } from "../services/heygenService";
import { motion } from "motion/react";
import { Loader2, CheckCircle2, AlertTriangle, Download, Video as VideoIcon } from "lucide-react";

interface HeyGenStatusPollerProps {
  taskId: string;
  onComplete?: (url: string) => void;
  onClose?: () => void;
}

export function HeyGenStatusPoller({ taskId, onComplete, onClose }: HeyGenStatusPollerProps) {
  const [status, setStatus] = useState<string>("Initializing...");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: any;

    const poll = async () => {
      try {
        const res = await checkHeyGenVideoStatus(taskId);
        if (!isMounted) return;

        const currentStatus = res.status;
        setStatus(currentStatus);

        if (currentStatus === "completed" || currentStatus === "success") {
          setProgress(100);
          setVideoUrl(res.video_url || res.url);
          if (onComplete) onComplete(res.video_url || res.url);
          clearInterval(pollInterval);
        } else if (currentStatus === "failed") {
          setError(res.error?.message || "HeyGen video generation failed.");
          clearInterval(pollInterval);
        } else if (currentStatus === "processing") {
          // Fake progress or use res.progress if available
          setProgress((prev) => (prev < 90 ? prev + 5 : 90));
        } else {
          // pending or waiting
          setProgress(10);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to poll HeyGen status.");
          clearInterval(pollInterval);
        }
      }
    };

    poll(); // Initial check
    pollInterval = setInterval(poll, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [taskId, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 z-[100] glass-card p-4 rounded-2xl border border-amber-accent/30 w-80 shadow-[0_0_25px_rgba(251,191,36,0.15)] flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-accent font-black tracking-widest text-xs uppercase">
          <VideoIcon size={16} />
          <span>HeyGen Status</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            &times;
          </button>
        )}
      </div>

      {error ? (
        <div className="flex items-start gap-3 text-red-400 text-xs">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : videoUrl ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 size={16} />
            <span>Ready</span>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-amber-accent text-black font-black py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-muted active:scale-95 transition-all text-[10px] tracking-widest uppercase amber-shadow"
          >
            <Download size={14} /> Open Video
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300 text-xs uppercase tracking-widest font-semibold">
            <Loader2 size={14} className="animate-spin text-amber-accent" />
            <span>{status}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-amber-accent rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Clapperboard, Brain, FileText, Film, Headphones, Sparkles } from 'lucide-react';

interface CinematicLoadingProps {
  isGenerating: boolean;
  isProducing: boolean;
}

export function CinematicLoading({ isGenerating, isProducing }: CinematicLoadingProps) {
  const [progress, setProgress] = useState(15);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 5;
        if (next > 95) return 95;
        return next;
      });
      setActiveStep(s => (s + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020202] overflow-hidden font-sans">
      
      {/* Background Glow */}
      <motion.div 
        className="absolute w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(255,153,0,0.15),transparent_70%)] rounded-full"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: '10%', delay: 0 },
          { left: '30%', delay: 1 },
          { left: '50%', delay: 2 },
          { left: '70%', delay: 3 },
          { left: '85%', delay: 4 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#ffb300] rounded-full shadow-[0_0_10px_#ffb300]"
            style={{ left: p.left, top: '100%' }}
            animate={{ 
              y: [0, -1000],
              opacity: [0, 1, 0],
              scale: [1, 1, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      <div className="relative w-[390px] p-8 rounded-[34px] bg-[#0a0a0d]/90 border border-amber-500/15 backdrop-blur-[20px] overflow-hidden shadow-[0_0_80px_rgba(255,153,0,0.12),inset_0_0_30px_rgba(255,170,0,0.05)]">
        
        {/* Top */}
        <div className="flex justify-between items-center mb-8 hidden">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff9900] to-[#ffcc00] flex justify-center items-center text-black shadow-[0_0_25px_rgba(255,170,0,0.5)]">
              <Clapperboard size={20} fill="black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">EpicHistory AI</h2>
              <p className="text-[13px] text-white/60">Cinematic Generator</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-10">
            <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff9900] to-[#ffcc00] flex justify-center items-center text-black shadow-[0_0_20px_rgba(255,170,0,0.5)]">
                     <Clapperboard size={20} fill="black" className="text-black" />
                </div>
                <div>
                     <h2 className="text-base font-bold text-white tracking-wide">EpicHistory AI</h2>
                     <p className="text-[11px] text-white/60 uppercase tracking-widest font-black">Generator</p>
                </div>
            </div>
          <motion.div 
             animate={{ opacity: [1, 0.4, 1] }} 
             transition={{ duration: 1.5, repeat: Infinity }}
             className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#ffb300] text-xs font-bold tracking-widest"
          >
            {isGenerating ? "ANALYZING" : "FORGING"}
          </motion.div>
        </div>

        {/* Center */}
        <div className="text-center py-5 pb-8">
          <div className="w-[170px] h-[170px] mx-auto rounded-full relative flex justify-center items-center bg-[radial-gradient(circle_at_center,rgba(255,170,0,0.2),transparent_70%)]">
            <motion.div 
               className="absolute -inset-2 rounded-full border-2 border-amber-500/15 border-t-[#ffb300]"
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
               className="absolute inset-3 rounded-full border border-dashed border-amber-500/30"
               animate={{ rotate: -360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <Brain size={50} className="text-[#ffb300] drop-shadow-[0_0_15px_rgba(255,170,0,0.8)]" />
          </div>

          <small className="block mt-8 text-[#ffb300] tracking-[3px] text-xs uppercase font-black">AI AT WORK</small>
          <h1 className="mt-3 text-3xl md:text-[38px] leading-[1.05] font-black text-white uppercase tracking-tighter">
            {isGenerating ? "TRANSCRIBING SCROLLS" : "FORGING ASSETS"}
          </h1>
          <p className="mt-4 text-white/60 leading-[1.7] text-[15px] font-medium">
            {isGenerating 
              ? "Our historians are gathering data from across the ages." 
              : "Preparing scenes, scripts, voices, transitions and visual effects."}
          </p>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between mb-3 text-[13px] text-[#ffb300] font-black tracking-widest">
            <span>PROGRESS</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden relative">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-[#ff9900] to-[#ffd000] relative"
              initial={{ width: "15%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#ffd000] shadow-[0_0_20px_#ffb300]" />
            </motion.div>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-8 flex justify-between gap-2.5">
          {[
            { icon: FileText, label: "Analyzing" },
            { icon: Film, label: "Scenes" },
            { icon: Headphones, label: "Audio" },
            { icon: Sparkles, label: "FX" }
          ].map((item, i) => (
            <div key={i} className={`flex-1 text-center ${activeStep >= i ? 'active' : ''}`}>
               <div className={`w-12 h-12 md:w-[58px] md:h-[58px] mx-auto rounded-2xl flex justify-center items-center text-[22px] mb-3 transition duration-400 border ${
                 activeStep >= i 
                   ? 'bg-gradient-to-br from-[#ff9900] to-[#ffd000] text-black shadow-[0_0_25px_rgba(255,170,0,0.5)] border-transparent -translate-y-1' 
                   : 'bg-white/5 border-white/5 text-white/40'
               }`}>
                  <item.icon size={20} className={activeStep >= i ? "text-black" : ""} strokeWidth={activeStep >= i ? 3 : 2} />
               </div>
               <p className={`text-xs font-bold leading-[1.4] transition-colors ${activeStep >= i ? 'text-white' : 'text-white/55'}`}>
                 {item.label}
               </p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-7 p-4 rounded-[18px] bg-white/5 border border-white/5 text-[13px] text-white/60 flex items-center gap-2 font-medium">
          <Sparkles size={16} className="text-amber-accent shrink-0" />
          Tip: Detailed prompts create more cinematic results.
        </div>
      </div>
    </div>
  );
}

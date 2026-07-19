import React, { useState } from "react";
import { Play, Calendar, User as UserIcon, Clock, Heart, Edit3, ChevronDown, ChevronUp, Image as ImageIcon, Music, CheckCircle2, Bookmark, Lightbulb, ScrollText, ChevronRight, Video as VideoIcon, Eye, Sparkles, Trash2, History as HistoryIcon, Copy } from "lucide-react";
import { Idea, DURATION_METRICS } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { SafeImage } from "./SafeImage";
import { getWordCount, WPM } from "../lib/utils";

export interface IdeaCardProps {
  idea: Idea;
  isSaved: boolean;
  onToggleSave: () => void;
  index: number;
  onStartProduction: (idea: Idea) => void;
  key?: string | number;
}

export function IdeaCard({ idea, isSaved, onToggleSave, index, onStartProduction }: IdeaCardProps) {

  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyScript = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const titleSection = `Title: ${idea.title}\n\nHook: ${idea.hook}\n\n`;
    
    let scriptContent = "";
    if (idea.fullScript) {
      scriptContent = idea.fullScript;
    } else {
      scriptContent = `[Deep Hook Narration]\n${idea.structure.hook_narration}\n\n[Act 1: The Setup]\n${idea.structure.act1}\n\n[The Crisis]\n${idea.structure.crisis}\n\n[The Climax]\n${idea.structure.climax}\n\n[The Legacy]\n${idea.structure.legacy}`;
    }
    
    const fullTextToCopy = `${titleSection}--- NARRATIVE SCRIPT ---\n\n${scriptContent}`;
    
    navigator.clipboard.writeText(fullTextToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const totalWords = 
    getWordCount(idea.structure.hook_narration) + 
    getWordCount(idea.structure.act1) + 
    getWordCount(idea.structure.crisis) + 
    getWordCount(idea.structure.climax) + 
    getWordCount(idea.structure.legacy);
  
  const metrics = DURATION_METRICS[idea.metadata.duration];
  const isValidCount = totalWords >= metrics.minWords;
  const estimatedMin = Math.ceil(totalWords / WPM);
  const targetMinStr = idea.metadata.duration.split("-")[0].trim().split(" ")[0];
  const targetMin = parseInt(targetMinStr) || 20;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        layout: { type: "spring", stiffness: 180, damping: 24, mass: 1 },
        opacity: { duration: 0.5, ease: "easeOut" },
        scale: { duration: 0.5, ease: "easeOut" },
        y: { duration: 0.5, ease: "easeOut" },
        delay: index * 0.05 
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="glass-card p-5 md:p-8 flex flex-col gap-6 md:gap-8 group hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/60 relative overflow-hidden cursor-pointer select-none"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 md:gap-8 relative z-10">
        <div className="space-y-4 flex-1 w-full">
          <div className="flex gap-2 flex-wrap items-center w-full">
            <span className="bg-amber-accent/10 text-amber-accent px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-amber-accent/20 shadow-sm whitespace-nowrap">
              Idea #{index + 1}
            </span>
            <span className="bg-white/5 text-gray-400 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-sm whitespace-nowrap">
              {idea.metadata.style}
            </span>
            <span className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm transition-all whitespace-nowrap ${
              isValidCount 
                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {isValidCount ? "✅ OPTIMAL" : `⚠️ SHORT (-${targetMin - estimatedMin}m)`}
            </span>
            <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest block pt-1 sm:pt-0 sm:pl-2">
              {totalWords.toLocaleString()} Words / ~{estimatedMin} MIN
            </span>
            <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 bg-white/[0.03] text-gray-400 px-3 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all group-hover:border-amber-accent/30 group-hover:text-amber-accent">
              {isExpanded ? "Collapse" : "Expand"}
              <ChevronDown size={11} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-serif font-black leading-[1.1] bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent group-hover:via-amber-accent/80 transition-all duration-700">
            {idea.title}
          </h2>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`p-4 md:p-5 rounded-2xl border transition-all shadow-2xl flex-shrink-0 group/btn ${isSaved ? 'bg-amber-accent text-black border-amber-accent' : 'bg-white/5 border-white/10 text-amber-accent hover:bg-amber-accent hover:text-black'}`}
        >
          <Bookmark size={24} md:size={28} fill={isSaved ? "currentColor" : "none"} className={`transition-transform duration-300 ${isSaved ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 relative z-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="p-6 bg-black/50 rounded-2xl border-l-[6px] border-amber-accent shadow-2xl backdrop-blur-md">
            <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
              <ScrollText size={14} className="text-amber-accent" /> THE HOOK (OPENING SENTENCE)
            </p>
            <p className="text-xl lg:text-2xl text-paper leading-relaxed italic font-serif">"{idea.hook}"</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-10">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-accent shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                  <h4 className="text-[11px] font-black text-amber-accent uppercase tracking-widest">Rare Angle & Perspective</h4>
               </div>
               <p className="text-sm text-gray-300 leading-relaxed font-medium pl-3.5 border-l border-white/10">{idea.rareAngle}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Crucial Historical Data</h4>
              </div>
              <div className="space-y-3 pl-3.5 border-l border-white/10">
                {idea.historicalFacts.map((fact, i) => (
                  <div key={i} className="flex gap-3 text-xs text-gray-400 group/fact">
                    <HistoryIcon size={12} className="text-amber-accent/30 mt-0.5 group-hover/fact:text-amber-accent transition-colors" />
                    <span className="leading-tight">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Structure Progress Bar */}
          <div className="space-y-5 pt-4">
            <div className="flex justify-between items-center">
               <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">The Narrative Arc</h4>
               <span className="text-[9px] font-black text-amber-accent/60 uppercase tracking-widest transition-all">
                 {isExpanded ? "Click card to collapse" : "Click card to expand"}
               </span>
            </div>
            <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-black text-gray-500 px-1 tracking-widest">
              <span className={isExpanded ? "text-amber-accent" : ""}>Act I</span>
              <span>Crisis</span>
              <span>Climax</span>
              <span>Legacy</span>
            </div>
            <div className="h-2.5 md:h-3.5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/10 shadow-inner group/bar p-0.5">
              <div className="h-full w-1/4 bg-amber-muted/20 border-r border-black/40 rounded-l-full"></div>
              <div className="h-full w-1/4 bg-amber-muted/40 border-r border-black/40"></div>
              <div className="h-full w-1/4 bg-amber-muted/60 border-r border-black/40"></div>
              <div className="h-full w-1/4 bg-amber-accent rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: "spring", stiffness: 180, damping: 24, mass: 1 },
                  opacity: { duration: 0.25, ease: "easeInOut" }
                }}
                className="space-y-8 md:space-y-10 pt-6 md:pt-10 overflow-hidden border-t border-white/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-6 md:space-y-8">
                    {[
                      { l: "Deep Hook Narration", c: idea.structure.hook_narration },
                      { l: "Act 1: The Setup", c: idea.structure.act1 },
                      { l: "The Crisis (Tension)", c: idea.structure.crisis },
                      { l: "The Climax (Resolution)", c: idea.structure.climax },
                      { l: "The Legacy (Impact)", c: idea.structure.legacy },
                    ].map((step, i) => {
                      const words = getWordCount(step.c);
                      const time = Math.ceil(words / WPM);
                      return (
                        <div key={i} className="space-y-2 group/step">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-amber-accent uppercase tracking-widest">{step.l}</span>
                             <div className="h-[1px] flex-1 bg-white/5 group-hover/step:bg-amber-accent/20 transition-all"></div>
                             <span className="text-[9px] text-gray-500 font-mono">{words} words / ~{time}m</span>
                          </div>
                          <p className="text-[15px] text-gray-400 leading-relaxed font-serif italic">{step.c}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-8">
                    <h4 className="text-[11px] font-black text-amber-accent uppercase tracking-widest mb-4 flex items-center gap-3">
                       <VideoIcon size={14} /> SUGGESTED VISUALS
                       <div className="h-[1px] flex-1 bg-amber-accent/10"></div>
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {idea.visuals.map((v, i) => (
                        <div key={i} className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-xs text-gray-300 leading-relaxed hover:bg-white/[0.05] transition-all flex gap-3 items-start">
                          <Eye size={14} className="text-amber-accent/40 mt-0.5 flex-shrink-0" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-amber-accent/10 to-transparent border border-amber-accent/10 space-y-3">
                       <div className="flex items-center gap-2 text-amber-accent font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                          <Sparkles size={14} md:size={16} /> Strategy Note
                       </div>
                       <p className="text-[11px] md:text-xs text-gray-300 leading-tight"> 
                          Ensure high-contrast color grading to emphasize the transition from Act I to Crisis. Use deep cinematic shadows in the Climax scene.
                       </p>
                    </div>
                  </div>
                </div>
                 <div className="flex flex-col sm:flex-row justify-end gap-3 pt-10 border-t border-white/5">
                  <button 
                    onClick={handleCopyScript}
                    className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-[11px] font-black tracking-widest transition-all ${copied ? "border-green-500/35 bg-green-500/10 text-green-400" : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={13} />} 
                    {copied ? "COPIED!" : "COPY SCRIPT"}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl text-[11px] font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all tracking-widest"
                  >
                    <Trash2 size={14} /> SCRAP CONCEPT
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartProduction(idea);
                    }}
                    className="flex items-center justify-center gap-2 px-8 py-4 sm:py-3 bg-amber-accent text-black font-black rounded-xl text-[11px] tracking-widest hover:bg-amber-muted transition-all amber-shadow active:scale-95"
                  >
                    <Play size={14} fill="currentColor" /> {idea.scenes && idea.scenes.length > 0 ? "RESUME PRODUCTION" : "START PRODUCTION"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex flex-col gap-10">
          <div className="aspect-[4/3] w-full rounded-2xl glass-card border-white/5 flex items-center justify-center p-12 text-center group/preview relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-[#000] opacity-40 z-0"></div>
             {/* Abstract pattern */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-accent opacity-10 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 blur-3xl"></div>
             
             <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 backdrop-blur-xl group-hover/preview:scale-110 transition-all duration-500">
                   <Eye className="text-amber-accent group-hover/preview:animate-pulse" size={32} />
                </div>
                <div className="space-y-1">
                   <span className="block text-[11px] text-white font-black uppercase tracking-[0.3em]">Cinematic Ref</span>
                   <span className="block text-[9px] text-gray-500 uppercase tracking-[0.1em]">Atmospheric Visualization</span>
                </div>
             </div>
          </div>
          
          <div className="glass-card p-6 border-white/10 space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Metadata Feed</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] tracking-widest">
                   <span className="text-gray-500 uppercase">Topic Saturation</span>
                   <span className="text-amber-accent">LOW</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-1/3 bg-amber-accent opacity-60"></div>
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] tracking-widest">
                   <span className="text-gray-500 uppercase">Avg View Interest</span>
                   <span className="text-white">EXTREME</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-[95%] bg-amber-accent"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


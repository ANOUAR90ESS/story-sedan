import React, { useState, useEffect, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { motion, AnimatePresence } from "motion/react";
import { Idea, Scene } from "../types";
import { ChevronLeft, ChevronRight, Brain, Sparkles, ScrollText, Clock, Square, Video as VideoIcon, Music, Settings, AlertTriangle, Check, Layers, Image as ImageIcon, Mic, Loader2, Play, Download, Settings as SettingsIcon, Plus, Lock, Unlock } from "lucide-react";
import { generateSceneImage } from "../services/geminiService";
import { generateVideoWithKling, generateVideoWithLuma, generateVideoWithSeedance, generateVideoWithHeyGen } from "../services/videoAPI";
import { generateHeyGenVideo, checkHeyGenVideoStatus } from "../services/heygenService";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { SafeImage } from "./SafeImage";
import JSZip from "jszip";
import { ExportModal } from "./ExportModal";
import { HeyGenStatusPoller } from "./HeyGenStatusPoller";
import { getWordCount } from "../lib/utils";

const VOICE_PROFILES = [
  { id: "se_brian", name: "Brian (UK Male)", type: "Standard", provider: "streamelements", voiceId: "Brian" },
  { id: "se_amy", name: "Amy (UK Female)", type: "Standard", provider: "streamelements", voiceId: "Amy" },
  { id: "se_matthew", name: "Matthew (US Male)", type: "Standard", provider: "streamelements", voiceId: "Matthew" },
  { id: "se_joanna", name: "Joanna (US Female)", type: "Standard", provider: "streamelements", voiceId: "Joanna" },
  { id: "se_russell", name: "Russell (AU Male)", type: "Standard", provider: "streamelements", voiceId: "Russell" },
  { id: "el_adam", name: "Adam (US Male)", type: "Premium", provider: "elevenlabs", voiceId: "pNInz6obpgDQGcFmaJgB" },
  { id: "el_antoni", name: "Antoni (US Male)", type: "Premium", provider: "elevenlabs", voiceId: "ErXwobaYiN019PkySvjV" },
  { id: "el_bella", name: "Bella (US Female)", type: "Premium", provider: "elevenlabs", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  { id: "el_rachel", name: "Rachel (US Female)", type: "Premium", provider: "elevenlabs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
];

const motionAnimations: Record<string, {
  animate: any;
  transition: any;
  label: string;
  arrow: string;
}> = {
  zoom_in: {
    animate: { scale: [1, 1.25, 1] },
    transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
    label: "Zoom In",
    arrow: "🔍+"
  },
  zoom_out: {
    animate: { scale: [1.25, 1, 1.25] },
    transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
    label: "Zoom Out",
    arrow: "🔍-"
  },
  pan_horizontal: {
    animate: { x: [-15, 15, -15] },
    transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
    label: "Horizontal Pan",
    arrow: "↔️"
  },
  pan_vertical: {
    animate: { y: [-10, 10, -10] },
    transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
    label: "Vertical Pan",
    arrow: "↕️"
  },
  push_in: {
    animate: { scale: [1, 1.4, 1] },
    transition: { repeat: Infinity, duration: 2.0, ease: "easeInOut" },
    label: "Deep Push",
    arrow: "✨"
  },
  action_shake: {
    animate: { 
      x: [-3, 3, -2, 2, -3, 3, 0],
      y: [-2, 2, -3, 3, -2, 2, 0]
    },
    transition: { repeat: Infinity, duration: 0.5, ease: "linear" },
    label: "Action Shake",
    arrow: "⚡"
  },
  slow_drift: {
    animate: { 
      x: [-10, 10, -10],
      y: [-6, 6, -6],
      scale: [1.05, 1.12, 1.05]
    },
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    label: "Slow Drift",
    arrow: "💨"
  }
};

function MotionPreviewTooltip({ type }: { type: string }) {
  const config = motionAnimations[type] || motionAnimations.zoom_in;
  
  return (
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none p-2 bg-[#0c0d12]/95 backdrop-blur-md border border-amber-accent/40 rounded-xl shadow-2xl w-36 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Mini Viewport */}
      <div className="w-full h-20 rounded-lg bg-black/60 border border-white/10 overflow-hidden relative flex items-center justify-center">
        {/* Animated Background */}
        <motion.div 
          animate={config.animate}
          transition={config.transition}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {/* Cyberpunk grid with glowing scenery shapes to show motion clearly */}
          <div className="relative w-full h-full bg-gradient-to-tr from-amber-500/20 via-amber-200/5 to-transparent flex flex-col justify-end p-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:12px_12px] opacity-60 pointer-events-none" />
            
            {/* Minimalist mountain silhouettes in perspective */}
            <div className="flex items-end justify-between w-full h-12 opacity-50">
              <div className="w-8 h-8 bg-gradient-to-t from-amber-500/20 to-transparent clip-triangle" />
              <div className="w-12 h-12 bg-gradient-to-t from-amber-400/30 to-transparent clip-triangle" />
              <div className="w-10 h-10 bg-gradient-to-t from-amber-500/20 to-transparent clip-triangle" />
            </div>

            {/* Glowing cosmic star */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 blur-[0.5px] opacity-85 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          </div>
        </motion.div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .clip-triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }
        `}} />

        {/* Indicator Badge */}
        <div className="absolute right-1.5 top-1.5 bg-black/85 border border-amber-accent/20 text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold text-amber-accent shadow-md">
          {config.arrow}
        </div>
      </div>
      
      {/* Title */}
      <span className="text-[10px] font-black uppercase text-amber-accent tracking-widest leading-none drop-shadow">{config.label}</span>
    </div>
  );
}

export function ProductionDashboard({ 
  idea,
  elevenLabsKey,
  klingKey,
  onBack,
  onUpdateIdea,
  globalExportState
}: { 
  idea: Idea;
  elevenLabsKey: string;
  klingKey: string;
  onBack: () => void;
  onUpdateIdea: (idea: Idea) => void;
  globalExportState: {
    isExporting: boolean;
    setIsExporting: (v: boolean) => void;
    exportProgress: number;
    setExportProgress: (v: number) => void;
    exportMessage: string;
    setExportMessage: (v: string) => void;
    downloadUrl: string | null;
    setDownloadUrl: (v: string | null) => void;
    ffmpegRef: React.MutableRefObject<FFmpeg>;
  }
}) {
  const { 
    isExporting, setIsExporting, 
    exportProgress, setExportProgress, 
    exportMessage, setExportMessage, 
    downloadUrl, setDownloadUrl,
    ffmpegRef
  } = globalExportState;

  const [currentIdea, setCurrentIdea] = useState<Idea>(idea);
  const [activeStep, setActiveStep] = useState<"script" | "visuals" | "timeline" | "export">("script");
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [totalToGenerate, setTotalToGenerate] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [generatingSceneIds, setGeneratingSceneIds] = useState<number[]>([]);
  const [videoMenuOpenSceneIdx, setVideoMenuOpenSceneIdx] = useState<number | null>(null);
  const [imageMenuOpenSceneIdx, setImageMenuOpenSceneIdx] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(idea.selectedVoice || "se_brian");
  const [selectedImageEngine, setSelectedImageEngine] = useState<'chatgpt' | 'flux' | 'gemini_3_1_pro'>('chatgpt');
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);

  useEffect(() => {
    setCurrentIdea(idea);
    if (idea.selectedVoice) {
      setSelectedVoice(idea.selectedVoice);
    }
  }, [idea.id, idea.selectedVoice]);

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    const updatedIdea = { ...currentIdea, selectedVoice: voiceId };
    setCurrentIdea(updatedIdea);
    onUpdateIdea(updatedIdea);
  };

  const toggleSceneSelection = (idx: number) => {
    setSelectedScenes(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const generateMissingVideos = async (engine: 'ffmpeg' | 'kling' | 'luma' | 'seedance') => {
    if (!currentIdea.scenes) return;
    setVideoMenuOpenSceneIdx(null);
    for (let i = 0; i < currentIdea.scenes.length; i++) {
        const scene = currentIdea.scenes[i];
        if (!scene.videoUrl && scene.imageUrl && !scene.locked) {
            await generateSceneVideo(i, engine);
        }
    }
  };

  const generateSelectedVideos = async (engine: 'ffmpeg' | 'kling' | 'luma' | 'seedance') => {
    if (!currentIdea.scenes || selectedScenes.length === 0) return;
    setVideoMenuOpenSceneIdx(null);
    
    if (engine === 'ffmpeg') {
        // Process sequentially to avoid browser crash with FFmpeg
        for (const idx of selectedScenes) {
            const scene = currentIdea.scenes[idx];
            if (scene && !scene.videoUrl && scene.imageUrl && !scene.locked) {
                await generateSceneVideo(idx, engine);
            }
        }
    } else {
        // Concurrent processing for remote APIs
        const promises = selectedScenes.map(idx => {
            const scene = currentIdea.scenes![idx];
            if (scene && !scene.videoUrl && scene.imageUrl && !scene.locked) {
                 return generateSceneVideo(idx, engine);
            }
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
    
    setSelectionMode(false);
    setSelectedScenes([]);
  };
  const [selectedVideoEngine, setSelectedVideoEngine] = useState<'ffmpeg' | 'kling' | 'luma' | 'seedance'>(() => {
    if (klingKey && klingKey.length > 5) {
      if (klingKey.startsWith('luma-')) return 'luma';
      if (klingKey.startsWith('seedance-')) return 'seedance';
      return 'kling';
    }
    return 'ffmpeg';
  });
  const [exportJobId, setExportJobId] = useState<string | null>(null);

  const [isAutoPilotMode, setIsAutoPilotMode] = useState(false);
  const [isAutoPilotRunning, setIsAutoPilotRunning] = useState(false);
  const [autoPilotLogs, setAutoPilotLogs] = useState<{ id: string; text: string; status: 'running' | 'completed' }[]>([]);
  const autoPilotLogsEndRef = useRef<HTMLDivElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPilotLogsEndRef.current) {
      autoPilotLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoPilotLogs]);

  // Auto-slideshow when autopilot is open but idle or finished
  useEffect(() => {
    if (!isAutoPilotMode || !currentIdea.scenes || currentIdea.scenes.length <= 1) return;
    
    // Stop slideshow immediately during active script, visual or voice generation tasks
    if (isAutoPilotRunning) return;

    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % currentIdea.scenes!.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [isAutoPilotMode, isAutoPilotRunning, currentIdea.scenes]);

  // Keyboard navigation for Autopilot view (Left/Right Arrow keys)
  useEffect(() => {
    if (!isAutoPilotMode || !currentIdea.scenes || currentIdea.scenes.length <= 1) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveSceneIndex((prev) => (prev - 1 + currentIdea.scenes!.length) % currentIdea.scenes!.length);
      } else if (e.key === "ArrowRight") {
        setActiveSceneIndex((prev) => (prev + 1) % currentIdea.scenes!.length);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAutoPilotMode, currentIdea.scenes]);

  const startAutoPilot = async () => {
    if (isAutoPilotRunning) {
      setIsAutoPilotMode(true);
      return;
    }
    setIsAutoPilotRunning(true);
    setIsAutoPilotMode(true);
    let logs: { id: string; text: string; status: 'running' | 'completed' }[] = [];
    
    const addLog = (text: string) => {
      const id = Date.now().toString() + Math.random();
      logs = [...logs, { id, text, status: 'running' }];
      setAutoPilotLogs(logs);
      return id;
    };
    
    const completeLog = (id: string) => {
      logs = logs.map(l => l.id === id ? { ...l, status: 'completed' } : l);
      setAutoPilotLogs(logs);
    };

    const l1 = addLog("Checking director workflow");
    completeLog(l1);

    const l2 = addLog("Formatting cinematic script");
    completeLog(l2);

    const l3 = addLog("Reviewing episode continuity");
    completeLog(l3);

    const l5 = addLog("Preparing asset prompts");
    completeLog(l5);

    // Generate Images sequentially (batch size 1) to avoid 429 rate limit
    let currentScenes = [...currentIdea.scenes!];
    const imgBatchSize = 1;
    for (let i = 0; i < currentScenes.length; i += imgBatchSize) {
        const batch = currentScenes.slice(i, i + imgBatchSize);
        const lbatch = addLog(`Synthesizing Visuals (${i+1}/${currentScenes.length})`);
        
        await Promise.all(batch.map(async (scene, batchIdx) => {
            const actualIdx = i + batchIdx;
            setActiveSceneIndex(actualIdx);
            if (!scene.imageUrl && !scene.locked) {
                try {
                    const imageUrl = await generateSceneImage(scene.visualPrompt, currentIdea.visualStyle, currentIdea.metadata?.aspectRatio, selectedImageEngine);
                    currentScenes[actualIdx] = { ...scene, imageUrl };
                    // Add a delay to prevent 429 Too Many Requests
                    await new Promise(r => setTimeout(r, 1500));
                } catch (err) {
                    console.error("Image generation failed", err);
                }
            } else {
                await new Promise(r => setTimeout(r, 400));
            }
        }));
        
        // Update states after batch
        const updatedIdea = { ...currentIdea, scenes: [...currentScenes] };
        setCurrentIdea(updatedIdea);
        onUpdateIdea(updatedIdea);
        completeLog(lbatch);
    }

    // Generate Videos sequentially without stale context (progress sequentially)
    const vidBatchSize = 1;
    for (let i = 0; i < currentScenes.length; i += vidBatchSize) {
        const lid = addLog(`Animating Scenes (${i+1}/${currentScenes.length})`);
        const batch = currentScenes.slice(i, i + vidBatchSize);
        
        for (let batchIdx = 0; batchIdx < batch.length; batchIdx++) {
            const actualIdx = i + batchIdx;
            setActiveSceneIndex(actualIdx);
            if (!currentScenes[actualIdx].videoUrl && currentScenes[actualIdx].imageUrl && !currentScenes[actualIdx].locked) {
                try {
                    let url;
                    try {
                        if ((selectedVideoEngine === 'kling' || selectedVideoEngine === 'luma' || selectedVideoEngine === 'seedance') && klingKey && klingKey.length > 5) {
                            addLog(`Requesting AI motion (${selectedVideoEngine})...`);
                            if (selectedVideoEngine === 'luma') {
                                const lumaKey = klingKey.replace(/^(luma-|seedance-)/, '');
                                url = await generateVideoWithLuma(lumaKey, currentScenes[actualIdx].visualPrompt, currentScenes[actualIdx].imageUrl!);
                            } else if (selectedVideoEngine === 'seedance') {
                                const sKey = klingKey.replace(/^(luma-|seedance-)/, '');
                                url = await generateVideoWithSeedance(sKey, currentScenes[actualIdx].visualPrompt, currentScenes[actualIdx].imageUrl!);
                            } else {
                                const kKey = klingKey.replace(/^(luma-|seedance-)/, '');
                                url = await generateVideoWithKling(kKey, currentScenes[actualIdx].visualPrompt, currentScenes[actualIdx].imageUrl!);
                            }
                        } else {
                            throw new Error("No API key or FFmpeg selected");
                        }
                    } catch (apiErr) {
                        console.warn("Video API failed or FFmpeg selected, falling back to FFmpeg zoompan:", apiErr);
                        try {
                            await loadFFmpeg();
                            const ffmpeg = ffmpegRef.current;
                            
                            let imgData;
                            try {
                              const response = await fetch(currentScenes[actualIdx].imageUrl, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' });
                              if (!response.ok) throw new Error("HTTP error");
                              imgData = new Uint8Array(await response.arrayBuffer());
                            } catch (e) {
                              imgData = await fetchFile(currentScenes[actualIdx].imageUrl!);
                            }
                            
                            await ffmpeg.writeFile("input.jpg", imgData);
                            const duration = Math.min(currentScenes[actualIdx].durationSeconds || 5, 10);
                            const isVertical = currentIdea.metadata?.aspectRatio === "9:16";
                            const resWidth = isVertical ? 720 : 1280;
                            const resHeight = isVertical ? 1280 : 720;
                            const resStr = `${resWidth}x${resHeight}`;
                            const fps = 24;
                            const durationFrames = Math.max(1, Math.round(duration * fps));
                            
                            let filter = "";
                            const motion = currentScenes[actualIdx].motionType || "zoom_in";
                            switch(motion) {
                              case "zoom_in":
                              case "push_in":
                                filter = `zoompan=z='min(zoom+0.0015,1.5)':d=${durationFrames}:s=${resStr}`;
                                break;
                              case "zoom_out":
                                filter = `zoompan=z='max(1.5-0.0015*on,1)':d=${durationFrames}:s=${resStr}`;
                                break;
                              case "pan_horizontal":
                                filter = `zoompan=z=1.3:x='if(lte(on,1),(iw-iw/zoom)/2,x+1)':y='(ih-ih/zoom)/2':d=${durationFrames}:s=${resStr}`;
                                break;
                              case "pan_vertical":
                                filter = `zoompan=z=1.3:x='(iw-iw/zoom)/2':y='if(lte(on,1),(ih-ih/zoom)/2,y+1)':d=${durationFrames}:s=${resStr}`;
                                break;
                              case "action_shake":
                                filter = `zoompan=z=1.2:x='(iw-iw/zoom)/2 + 10*sin(on*2)':y='(ih-ih/zoom)/2 + 10*cos(on*3)':d=${durationFrames}:s=${resStr}`;
                                break;
                              case "slow_drift":
                                filter = `zoompan=z=1.2:x='x+0.5':y='y+0.5':d=${durationFrames}:s=${resStr}`;
                                break;
                              default:
                                filter = `zoompan=z='min(zoom+0.001,1.3)':d=${durationFrames}:s=${resStr}`;
                            }
            
                            await ffmpeg.exec([
                              "-i", "input.jpg",
                              "-vf", `scale=${resWidth}*2:${resHeight}*2:force_original_aspect_ratio=increase,crop=${resWidth}*2:${resHeight}*2,${filter}`,
                              "-c:v", "libx264",
                              "-pix_fmt", "yuv420p",
                              "-preset", "ultrafast",
                              "-t", duration.toString(),
                              "preview.mp4"
                            ]);
            
                            const data = await ffmpeg.readFile("preview.mp4");
                            url = URL.createObjectURL(new Blob([(data as any).buffer], { type: "video/mp4" }));
                        } catch (ffmpegErr) {
                            console.warn("Auto-pilot FFmpeg scene generation failed. Falling back to native canvas engine:", ffmpegErr);
                            url = await generateSceneVideoCanvasNative(actualIdx);
                        }
                    }
                    currentScenes[actualIdx] = { ...currentScenes[actualIdx], videoUrl: url };
                    const updatedIdea = { ...currentIdea, scenes: [...currentScenes] };
                    setCurrentIdea(updatedIdea);
                    onUpdateIdea(updatedIdea);
                } catch (err) {
                    console.error(err);
                }
            }
        }
        completeLog(lid);
    }

    const lexp = addLog("Forging Cinematic Timeline...");
    await exportVideo(currentScenes);
    completeLog(lexp);

    const lfin = addLog("PRODUCTION COMPLETED");
    completeLog(lfin);
    setIsAutoPilotRunning(false);
  };

  const isVertical = idea.metadata?.aspectRatio === "9:16";
  const [exportRes, setExportRes] = useState(isVertical ? { id: '720p', label: '720p', width: 720, height: 1280 } : { id: '720p', label: '720p (HD)', width: 1280, height: 720 });
  const [exportFps, setExportFps] = useState(30);
  const [exportMusic, setExportMusic] = useState("none");
  const [exportEngineType, setExportEngineType] = useState<'canvas' | 'ffmpeg' | 'heygen'>('canvas');
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeHeyGenTaskId, setActiveHeyGenTaskId] = useState<string | null>(null);
  const [hoveredMotionSceneIdx, setHoveredMotionSceneIdx] = useState<number | null>(null);

  const MUSIC_TRACKS = [
    { id: 'none', label: 'No Music', url: '' },
    { id: 'epic', label: 'Cinematic Epic', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_29a285d18d.mp3' },
    { id: 'mysterious', label: 'Dark Investigation', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { id: 'documentary', label: 'Tension Build', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_a1240c5f59.mp3' }
  ];

  const RESOLUTIONS = isVertical ? [
    { id: '720p', label: '720p', width: 720, height: 1280 },
    { id: '1080p', label: '1080p', width: 1080, height: 1920 },
    { id: '4k', label: '4K', width: 2160, height: 3840 },
  ] : [
    { id: '720p', label: '720p (HD)', width: 1280, height: 720 },
    { id: '1080p', label: '1080p (FHD)', width: 1920, height: 1080 },
    { id: '4k', label: '4K (UHD)', width: 3840, height: 2160 },
  ];

  useEffect(() => {
    // Keep resolution in sync if orientation flips
    if (isVertical && exportRes.width > exportRes.height) {
        setExportRes(RESOLUTIONS[0]);
    } else if (!isVertical && exportRes.height > exportRes.width) {
        setExportRes(RESOLUTIONS[0]);
    }
  }, [isVertical]);

  const FRAMERATES = [24, 30, 60];

  useEffect(() => {
    loadFFmpeg().catch(err => {
      console.warn("Pre-loading FFmpeg on mount failed or timed out. System will use native fallback engines dynamically:", err);
    });
  }, []);

  const speak = async (text: string) => {
    window.speechSynthesis.cancel();
    if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = "";
    }
    
    setIsPlayingVoice(true);

    try {
        const activeProfile = VOICE_PROFILES.find(v => v.id === selectedVoice) || VOICE_PROFILES[0];
        let audioRes: Response;
        
        if (activeProfile.provider === 'elevenlabs' && elevenLabsKey && elevenLabsKey.trim().length > 5) {
            audioRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeProfile.voiceId}`, {
                method: 'POST',
                headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, model_id: "eleven_monolingual_v1" })
            });
        } else {
            const voiceToUse = activeProfile.provider === 'streamelements' ? activeProfile.voiceId : 'Brian';
            const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceToUse}&text=${encodeURIComponent(text)}`;
            audioRes = await fetch(ttsUrl, { referrerPolicy: 'no-referrer' });
        }

        if (audioRes.ok) {
            const audioBlob = await audioRes.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            previewAudioRef.current = audio;
            audio.onended = () => setIsPlayingVoice(false);
            audio.onerror = () => setIsPlayingVoice(false);
            await audio.play();
            return;
        }
    } catch(e) {
        console.warn("API TTS failed, falling back to browser synthesis.", e);
    }

    try {
        const msg = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        msg.onstart = () => setIsPlayingVoice(true);
        msg.onend = () => setIsPlayingVoice(false);
        msg.onerror = () => setIsPlayingVoice(false);
        
        const profile = VOICE_PROFILES.find(v => v.id === selectedVoice);
        
        if (profile?.name.includes('Female')) {
          msg.pitch = 1.2;
          msg.rate = 0.95;
          const femaleVoice = voices.find(v => 
            v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google US English")
          );
          if (femaleVoice) msg.voice = femaleVoice;
        } else {
          msg.pitch = 0.8;
          msg.rate = 0.9;
          const maleVoice = voices.find(v => 
            v.name.includes("Male") || v.name.includes("Daniel") || v.name.includes("Google UK English Male")
          );
          if (maleVoice) msg.voice = maleVoice;
        }
        
        window.speechSynthesis.speak(msg);
    } catch (e) {
        console.warn("SpeechSynthesis error:", e);
        setIsPlayingVoice(false);
    }
  };

  const loadFFmpeg = async () => {
    let ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
        // Wait a bit for App to initialize it
        await new Promise(r => setTimeout(r, 500));
        ffmpeg = ffmpegRef.current;
        if (!ffmpeg) throw new Error("FFmpeg not initialized properly.");
    }
    if (ffmpeg.loaded) return;
    
    // Strict 4s timeout to prevent hanging on sandboxed frames without COOP/COEP headers
    const loadPromise = (async () => {
      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
      } catch (error) {
        console.warn("FFmpeg primary load failed, trying backup...", error);
        try {
          const altURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
          await ffmpeg.load({
            coreURL: await toBlobURL(`${altURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${altURL}/ffmpeg-core.wasm`, "application/wasm"),
          });
        } catch (retryError) {
          console.error("FFmpeg secondary load failed:", retryError);
          throw new Error("FFmpeg system could not be initialized. Please check your internet connection.");
        }
      }
    })();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("FFmpeg load timed out (likely due to iframe sandbox or security headers restriction).")), 4000)
    );

    await Promise.race([loadPromise, timeoutPromise]);
  };


  const generateSceneVideoCanvasNative = async (sceneIndex: number): Promise<string> => {
    const scene = currentIdea.scenes![sceneIndex];
    if (!scene.imageUrl) throw new Error("No image found for the scene");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = scene.imageUrl;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });

    const isVertical = currentIdea.metadata?.aspectRatio === "9:16";
    const width = isVertical ? 720 : 1280;
    const height = isVertical ? 1280 : 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    const stream = canvas.captureStream(24);
    const mimes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4"
    ];
    let supportedMime = "video/webm";
    for (const m of mimes) {
        if (MediaRecorder.isTypeSupported(m)) {
            supportedMime = m;
            break;
        }
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: supportedMime });
    recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };

    const duration = Math.min(scene.durationSeconds || 5, 10);
    const totalFrames = duration * 24;
    const intervalTime = 1000 / 24;

    const onStopPromise = new Promise<string>((resolve) => {
        recorder.onstop = () => {
            const completedBlob = new Blob(chunks, { type: supportedMime });
            resolve(URL.createObjectURL(completedBlob));
        };
    });

    recorder.start();

    for (let frame = 0; frame <= totalFrames; frame++) {
        const progress = frame / totalFrames;
        
        ctx.fillStyle = "#0c0d12";
        ctx.fillRect(0, 0, width, height);

        if (img.complete && img.width > 0) {
            ctx.save();
            const motion = scene.motionType || "zoom_in";
            let scale = 1.0;
            let dx = 0;
            let dy = 0;

            if (motion === "zoom_in" || motion === "push_in") {
                scale = 1.0 + progress * 0.15;
            } else if (motion === "zoom_out") {
                scale = 1.15 - progress * 0.15;
            } else if (motion === "pan_horizontal") {
                scale = 1.15;
                dx = (progress - 0.5) * 50;
            } else if (motion === "pan_vertical") {
                scale = 1.15;
                dy = (progress - 0.5) * 50;
            } else if (motion === "action_shake") {
                scale = 1.1;
                dx = Math.sin(progress * duration * 15) * 8;
                dy = Math.cos(progress * duration * 18) * 8;
            } else if (motion === "slow_drift") {
                scale = 1.1;
                dx = progress * 20;
                dy = progress * 20;
            } else {
                scale = 1.0 + progress * 0.1;
            }

            const canvasAspect = width / height;
            const imgAspect = img.width / img.height;
            let drawWidth = width;
            let drawHeight = height;
            if (imgAspect > canvasAspect) {
                drawWidth = height * imgAspect;
            } else {
                drawHeight = width / imgAspect;
            }

            ctx.translate(width / 2 + dx, height / 2 + dy);
            ctx.scale(scale, scale);
            ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();
        }

        setExportProgress(Math.round((frame / totalFrames) * 100));

        await new Promise((resolve) => setTimeout(resolve, intervalTime));
    }

    recorder.stop();
    return await onStopPromise;
  };


  const generateSceneVideo = async (sceneIndex: number, engine: 'ffmpeg' | 'kling' | 'luma' | 'seedance') => {
    const scene = currentIdea.scenes![sceneIndex];
    if (scene.locked) return;
    if (!scene.imageUrl) {
        alert("Please generate an image first.");
        return;
    }

    setGeneratingSceneIds(prev => [...prev, sceneIndex]);
    setExportProgress(0);

    try {
      let isAiVideoGenerated = false;
      let url = "";

      if (engine === 'kling' || engine === 'luma' || engine === 'seedance') {
         if (klingKey && klingKey.length > 5) {
             setExportProgress(10); // Indicate starting
             try {
                const promptWithMotion = `${scene.visualPrompt}${scene.motionType ? `. Camera motion: ${scene.motionType.replace('_', ' ')}` : ''}`;
                if (engine === 'luma') {
                   const lumaKey = klingKey.replace(/^(luma-|seedance-)/, '');
                   url = await generateVideoWithLuma(lumaKey, promptWithMotion, scene.imageUrl);
                } else if (engine === 'seedance') {
                   const sKey = klingKey.replace(/^(luma-|seedance-)/, '');
                   url = await generateVideoWithSeedance(sKey, promptWithMotion, scene.imageUrl);
                } else {
                   const kKey = klingKey.replace(/^(luma-|seedance-)/, ''); 
                   url = await generateVideoWithKling(kKey, promptWithMotion, scene.imageUrl);
                }
                isAiVideoGenerated = true;
             } catch (aiErr) {
                 console.warn("AI Video API failed, falling back to FFmpeg:", aiErr);
             }
         } else {
             alert(`Please provide an API Key in Settings to use ${engine === 'luma' ? 'Luma AI' : engine === 'seedance' ? 'Seedance AI' : 'Kling AI'}. Falling back to FFmpeg.`);
         }
      }

      if (!isAiVideoGenerated) {
          try {
              await loadFFmpeg();
              const ffmpeg = ffmpegRef.current;
        
              setExportProgress(10);
              
              // Robust fetch for the image
              let imgData;
              try {
                const response = await fetch(scene.imageUrl, {
                  mode: 'cors',
                  credentials: 'omit',
                  referrerPolicy: 'no-referrer'
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const buffer = await response.arrayBuffer();
                imgData = new Uint8Array(buffer);
              } catch (fetchError) {
                console.warn("Fetch failed, trying fallback...", fetchError);
                // Fallback for CORS issues: some images can be fetched via fetchFile if it uses a more permissive method or if we use a proxy
                imgData = await fetchFile(scene.imageUrl); 
              }
        
              await ffmpeg.writeFile("input.jpg", imgData);
              setExportProgress(30);
        
              const duration = Math.min(scene.durationSeconds || 5, 10);
              const isVertical = currentIdea.metadata?.aspectRatio === "9:16";
              const resWidth = isVertical ? 720 : 1280;
              const resHeight = isVertical ? 1280 : 720;
              const resStr = `${resWidth}x${resHeight}`;
              const fps = 24;
              const durationFrames = Math.max(1, Math.round(duration * fps));
              
              let filter = "";
              const motion = scene.motionType || "zoom_in";
              switch(motion) {
                case "zoom_in":
                case "push_in":
                  filter = `zoompan=z='min(zoom+0.0015,1.5)':d=${durationFrames}:s=${resStr}`;
                  break;
                case "zoom_out":
                  filter = `zoompan=z='max(1.5-0.0015*on,1)':d=${durationFrames}:s=${resStr}`;
                  break;
                case "pan_horizontal":
                  filter = `zoompan=z=1.3:x='if(lte(on,1),(iw-iw/zoom)/2,x+1)':y='(ih-ih/zoom)/2':d=${durationFrames}:s=${resStr}`;
                  break;
                case "pan_vertical":
                  filter = `zoompan=z=1.3:x='(iw-iw/zoom)/2':y='if(lte(on,1),(ih-ih/zoom)/2,y+1)':d=${durationFrames}:s=${resStr}`;
                  break;
                case "action_shake":
                  filter = `zoompan=z=1.2:x='(iw-iw/zoom)/2 + 10*sin(on*2)':y='(ih-ih/zoom)/2 + 10*cos(on*3)':d=${durationFrames}:s=${resStr}`;
                  break;
                case "slow_drift":
                  filter = `zoompan=z=1.2:x='x+0.5':y='y+0.5':d=${durationFrames}:s=${resStr}`;
                  break;
                default:
                  filter = `zoompan=z='min(zoom+0.001,1.3)':d=${durationFrames}:s=${resStr}`;
              }
        
              await ffmpeg.exec([
                "-i", "input.jpg",
                "-vf", `scale=${resWidth}*2:${resHeight}*2:force_original_aspect_ratio=increase,crop=${resWidth}*2:${resHeight}*2,${filter}`,
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "ultrafast",
                "-t", duration.toString(),
                "preview.mp4"
              ]);
        
              const data = await ffmpeg.readFile("preview.mp4");
              url = URL.createObjectURL(new Blob([(data as any).buffer], { type: "video/mp4" }));
          } catch (ffmpegErr) {
              console.warn("FFmpeg single scene generation failed or timed out. Falling back to native high-performance Web Canvas Engine...", ffmpegErr);
              url = await generateSceneVideoCanvasNative(sceneIndex);
          }
      }

      const newScenes = [...currentIdea.scenes!];
      newScenes[sceneIndex] = { ...scene, videoUrl: url };
      const updatedIdea = { ...currentIdea, scenes: newScenes };
      setCurrentIdea(updatedIdea);
      onUpdateIdea(updatedIdea);
      
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingSceneIds(prev => prev.filter(id => id !== sceneIndex));
      setExportProgress(0);
    }
  };

  const generateMissingImages = async (engine: 'chatgpt' | 'flux' | 'gemini_3_1_pro') => {
    const imagesNeeded = currentIdea.scenes!.filter(s => !s.imageUrl && !s.locked).length;
    if (imagesNeeded === 0) return;

    setImageMenuOpenSceneIdx(null);
    setIsGeneratingImages(true);
    setGenerationProgress(0);
    setTotalToGenerate(imagesNeeded);
    
    let completed = 0;
    const newScenes = [...currentIdea.scenes!];
    for (let i = 0; i < newScenes.length; i++) {
        if (!newScenes[i].imageUrl && !newScenes[i].locked) {
            try {
              const imageUrl = await generateSceneImage(newScenes[i].visualPrompt, currentIdea.visualStyle, currentIdea.metadata?.aspectRatio, engine);
              newScenes[i] = { ...newScenes[i], imageUrl };
              completed++;
              setGenerationProgress(completed);
              
              const updatedIdea = { ...currentIdea, scenes: [...newScenes] };
              setCurrentIdea(updatedIdea);
              onUpdateIdea(updatedIdea);
              // Wait 2.5 seconds between images to prevent Pollinations 429 Too Many Requests
              await new Promise(r => setTimeout(r, 2500)); 
            } catch (err) {
              console.error(err);
            }
        }
    }
    
    setTimeout(() => {
      setIsGeneratingImages(false);
      setGenerationProgress(0);
    }, 1500);
  };

  const generateSelectedImages = async (engine: 'chatgpt' | 'flux' | 'gemini_3_1_pro') => {
    if (!currentIdea.scenes || selectedScenes.length === 0) return;
    
    setImageMenuOpenSceneIdx(null);
    setIsGeneratingImages(true);
    setGenerationProgress(0);
    setTotalToGenerate(selectedScenes.length);
    
    let completed = 0;
    const newScenes = [...currentIdea.scenes!];
    
    // Sequential generation for Pollinations to avoid rate limits
    for (const idx of selectedScenes) {
        const scene = newScenes[idx];
        if (!scene.imageUrl && !scene.locked) {
            try {
                const imageUrl = await generateSceneImage(scene.visualPrompt, currentIdea.visualStyle, currentIdea.metadata?.aspectRatio, engine);
                newScenes[idx] = { ...scene, imageUrl };
                completed++;
                setGenerationProgress(completed);
                
                const updatedIdea = { ...currentIdea, scenes: [...newScenes] };
                setCurrentIdea(updatedIdea);
                onUpdateIdea(updatedIdea);
                // Wait to avoid rate limits
                await new Promise(r => setTimeout(r, 2500));
            } catch (err) {
                console.error(err);
            }
        } else {
            completed++;
            setGenerationProgress(completed);
        }
    }
    
    setTimeout(() => {
      setIsGeneratingImages(false);
      setGenerationProgress(0);
      setSelectionMode(false);
      setSelectedScenes([]);
    }, 1500);
  };

  const generateSingleSceneImage = async (sceneIndex: number, engine: 'chatgpt' | 'flux' | 'gemini_3_1_pro') => {
    const scene = currentIdea.scenes![sceneIndex];
    if (scene.locked) return;

    setImageMenuOpenSceneIdx(null);
    setIsGeneratingImages(true);
    setGeneratingSceneIds(prev => [...prev, sceneIndex]);
    
    try {
      const imageUrl = await generateSceneImage(scene.visualPrompt, currentIdea.visualStyle, currentIdea.metadata?.aspectRatio, engine);
      const newScenes = [...currentIdea.scenes!];
      newScenes[sceneIndex] = { ...scene, imageUrl };
      
      const updatedIdea = { ...currentIdea, scenes: newScenes };
      setCurrentIdea(updatedIdea);
      onUpdateIdea(updatedIdea);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setGeneratingSceneIds(prev => prev.filter(id => id !== sceneIndex));
      setIsGeneratingImages(false);
    }
  };

  const exportVideoCanvasNative = async (scenesToProcess: typeof currentIdea.scenes) => {
    if (!scenesToProcess) return;
    setExportMessage("Initializing Native Web Engine...");
    setExportProgress(5);

    const loadedImages: HTMLImageElement[] = [];
    const narrationBlobs: (Blob | null)[] = [];

    // Setup Web Audio Context
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();

    try {
        setExportMessage("Acquiring Cinematic Assets...");
        
        // 1. Fetch and load images in parallel
        await Promise.all(scenesToProcess.map(async (scene, i) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = scene.imageUrl!;
            
            await new Promise<void>((resolve) => {
                img.onload = () => {
                    loadedImages[i] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Fallback: Failed to load image for scene ${i}`);
                    resolve();
                };
            });

            // 2. Fetch narration audio in parallel
            try {
                let audioBlob: Blob;
                const activeProfile = VOICE_PROFILES.find(v => v.id === selectedVoice) || VOICE_PROFILES[0];
                
                if (activeProfile.provider === 'elevenlabs' && elevenLabsKey && elevenLabsKey.trim().length > 5) {
                   const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeProfile.voiceId}`, {
                      method: 'POST',
                      headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: scene.narration, model_id: "eleven_monolingual_v1" })
                   });
                   if (!res.ok) throw new Error("ElevenLabs API failed");
                   audioBlob = await res.blob();
                } else {
                   const voiceToUse = activeProfile.provider === 'streamelements' ? activeProfile.voiceId : 'Brian';
                   const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceToUse}&text=${encodeURIComponent(scene.narration)}`;
                   const res = await fetch(ttsUrl, { referrerPolicy: 'no-referrer' });
                   if (!res.ok) throw new Error("TTS failed");
                   audioBlob = await res.blob();
                }
                narrationBlobs[i] = audioBlob;
            } catch (e) {
                console.warn(`Speech synthesis error for scene ${i}:`, e);
                narrationBlobs[i] = null;
            }

            const currentLoadedPct = Math.round(5 + (i / scenesToProcess.length) * 40);
            setExportProgress(currentLoadedPct);
        }));

        setExportMessage("Stitching Soundtrack...");
        setExportProgress(45);

        // Decode BGM if selected
        let bgmBuffer: AudioBuffer | null = null;
        if (exportMusic !== "none") {
            const track = MUSIC_TRACKS.find(m => m.id === exportMusic);
            if (track && track.url) {
                try {
                    const bgmRes = await fetch(track.url);
                    const bgmArrBuf = await bgmRes.arrayBuffer();
                    bgmBuffer = await audioCtx.decodeAudioData(bgmArrBuf);
                } catch (e) {
                    console.warn("BGM buffer decoding failed", e);
                }
            }
        }

        // Decode narrations into audio buffers
        const narrationBuffers = await Promise.all(narrationBlobs.map(async (blob) => {
            if (!blob) return null;
            try {
                const arrBuf = await blob.arrayBuffer();
                return await audioCtx.decodeAudioData(arrBuf);
            } catch (decErr) {
                console.warn("Narration buffer decoding error:", decErr);
                return null;
            }
        }));

        setExportMessage("Assembling Visual Canvas...");
        setExportProgress(55);

        // Setup hidden canvas
        const canvas = document.createElement("canvas");
        canvas.width = exportRes.width;
        canvas.height = exportRes.height;
        const ctx = canvas.getContext("2d")!;

        // Record stream setup
        const canvasStream = canvas.captureStream(exportFps);
        const combinedStream = new MediaStream();
        canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        dest.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

        const mimes = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
            "video/mp4"
        ];
        let supportedMime = "video/webm";
        for (const m of mimes) {
            if (MediaRecorder.isTypeSupported(m)) {
                supportedMime = m;
                break;
            }
        }

        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(combinedStream, { mimeType: supportedMime });
        recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };

        const onStopPromise = new Promise<Blob>((resolve) => {
            recorder.onstop = () => {
                const completedBlob = new Blob(chunks, { type: supportedMime });
                resolve(completedBlob);
            };
        });

        // Trigger BGM node
        if (bgmBuffer) {
            const bgmSource = audioCtx.createBufferSource();
            bgmSource.buffer = bgmBuffer;
            bgmSource.loop = true;
            const bgmGain = audioCtx.createGain();
            bgmGain.gain.value = 0.12; // lower volume mix
            bgmSource.connect(bgmGain);
            bgmGain.connect(dest);
            bgmGain.connect(audioCtx.destination);
            bgmSource.start(0);
        }

        // Trigger sequence narrations
        let currentOffset = 0;
        narrationBuffers.forEach((buffer, i) => {
            const sceneDuration = scenesToProcess[i].durationSeconds;
            if (buffer) {
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(dest);
                source.connect(audioCtx.destination);
                source.start(audioCtx.currentTime + currentOffset);
            }
            currentOffset += sceneDuration;
        });

        // Start Recording
        recorder.start();

        const totalDuration = scenesToProcess.reduce((sum, s) => sum + s.durationSeconds, 0);
        const startTime = performance.now();
        const intervalTime = 1000 / exportFps;

        const drawTimelineFrame = (elapsed: number) => {
            // Match current scene index
            let accum = 0;
            let activeIdx = 0;
            for (let idx = 0; idx < scenesToProcess.length; idx++) {
                accum += scenesToProcess[idx].durationSeconds;
                if (elapsed < accum) {
                    activeIdx = idx;
                    break;
                }
            }

            const activeScene = scenesToProcess[activeIdx];
            if (!activeScene) return;

            const sceneStart = scenesToProcess.slice(0, activeIdx).reduce((sum, sc) => sum + sc.durationSeconds, 0);
            const relativeTime = elapsed - sceneStart;
            const progress = relativeTime / activeScene.durationSeconds;

            // Clear Canvas
            ctx.fillStyle = "#0c0d12";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image with active cinematic motion
            const img = loadedImages[activeIdx];
            if (img && img.complete && img.width > 0) {
                ctx.save();
                
                const motion = activeScene.motionType || (activeIdx % 2 === 0 ? "zoom_in" : "zoom_out");
                let scale = 1.0;
                let dx = 0;
                let dy = 0;

                if (motion === "zoom_in" || motion === "push_in") {
                    scale = 1.0 + progress * 0.15;
                } else if (motion === "zoom_out") {
                    scale = 1.15 - progress * 0.15;
                } else if (motion === "pan_horizontal") {
                    scale = 1.15;
                    dx = (progress - 0.5) * 50;
                } else if (motion === "pan_vertical") {
                    scale = 1.15;
                    dy = (progress - 0.5) * 50;
                } else if (motion === "action_shake") {
                    scale = 1.1;
                    dx = Math.sin(relativeTime * 15) * 8;
                    dy = Math.cos(relativeTime * 18) * 8;
                } else if (motion === "slow_drift") {
                    scale = 1.1;
                    dx = progress * 20;
                    dy = progress * 20;
                } else {
                    scale = 1.0 + progress * 0.1;
                }

                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                let drawWidth = canvas.width;
                let drawHeight = canvas.height;
                if (imgAspect > canvasAspect) {
                    drawWidth = canvas.height * imgAspect;
                } else {
                    drawHeight = canvas.width / imgAspect;
                }

                ctx.translate(canvas.width / 2 + dx, canvas.height / 2 + dy);
                ctx.scale(scale, scale);
                ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                ctx.restore();
            }

            // Cross-fade with previous scene
            if (relativeTime < 0.5 && activeIdx > 0) {
                const prevImg = loadedImages[activeIdx - 1];
                if (prevImg && prevImg.complete && prevImg.width > 0) {
                    const alpha = 1.0 - (relativeTime / 0.5);
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    
                    const canvasAspect = canvas.width / canvas.height;
                    const imgAspect = prevImg.width / prevImg.height;
                    let drawWidth = canvas.width;
                    let drawHeight = canvas.height;
                    if (imgAspect > canvasAspect) {
                        drawWidth = canvas.height * imgAspect;
                    } else {
                        drawHeight = canvas.width / imgAspect;
                    }
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.drawImage(prevImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                    ctx.restore();
                }
            }

            // Render Subtitles
            if (showSubtitles) {
                const text = activeScene.narration;
                ctx.save();
                ctx.font = `bold ${Math.round(canvas.height / 24)}px Inter, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                
                const textX = canvas.width / 2;
                const textY = canvas.height - (canvas.height / 10);
                const maxWidth = canvas.width * 0.85;

                const words = text.split(" ");
                let line = "";
                const lines: string[] = [];
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + " ";
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(line.trim());
                        line = words[n] + " ";
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line.trim());

                const lineHeight = Math.round(canvas.height / 18);
                const totalSubHeight = lines.length * lineHeight;

                // Backing rect
                ctx.fillStyle = "rgba(0,0,0,0.65)";
                ctx.fillRect(
                    canvas.width * 0.05,
                    textY - totalSubHeight - 15,
                    canvas.width * 0.9,
                    totalSubHeight + 30
                );

                ctx.strokeStyle = "rgba(251,191,36,0.3)";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    canvas.width * 0.05,
                    textY - totalSubHeight - 15,
                    canvas.width * 0.9,
                    totalSubHeight + 30
                );

                ctx.fillStyle = "#ffffff";
                lines.forEach((l, k) => {
                    ctx.fillText(l, textX, textY - (lines.length - 1 - k) * lineHeight);
                });

                ctx.restore();
            }
        };

        // Render looping mechanism with dynamic drift-correcting frame throttling to prevent CPU exhaustion and browser out-of-memory crashes
        await new Promise<void>((resolve) => {
            let active = true;
            const runLoop = () => {
                if (!active) return;
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed >= totalDuration) {
                    active = false;
                    recorder.stop();
                    audioCtx.close();
                    resolve();
                    return;
                }
                drawTimelineFrame(elapsed);
                
                const pct = Math.round(55 + (elapsed / totalDuration) * 43);
                setExportProgress(Math.min(98, pct));
                setExportMessage(`Stitching Chronicle (${Math.round(elapsed)}s / ${Math.round(totalDuration)}s)...`);
                
                // Correctly throttle and yield the thread to the target export FPS (e.g., 30 FPS = 33.33ms per frame)
                // This ensures smooth recording, proper video/audio sync, and prevents browser/renderer process crash due to memory build up
                const currentFrameNumber = Math.floor(elapsed * exportFps);
                const nextFrameTime = startTime + (currentFrameNumber + 1) * intervalTime;
                const delay = Math.max(1, nextFrameTime - performance.now());
                setTimeout(runLoop, delay);
            };
            setTimeout(runLoop, intervalTime);
        });

        const completedBlob = await onStopPromise;
        const finalUrl = URL.createObjectURL(completedBlob);
        setDownloadUrl(finalUrl);
        setExportProgress(100);
        setExportMessage("Chronicle Master Rendered!");
    } catch (err) {
        console.error("Canvas native rendering failed: ", err);
        throw err;
    } finally {
        setIsExporting(false);
    }
  };

  const exportVideo = async (overrideScenes?: typeof currentIdea.scenes) => {
    const scenesToProcess = Array.isArray(overrideScenes) ? overrideScenes : currentIdea.scenes;
    if (!scenesToProcess?.every(s => s.imageUrl)) {
        alert("Please generate all images before exporting.");
        return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setShowExportModal(true);

    if (exportEngineType === 'heygen') {
        try {
            setExportMessage("Initiating HeyGen Avatar Cloud Build...");
            setExportProgress(10);
            
            const uploadBlobToStorage = async (url: string | null | undefined): Promise<string | null> => {
                if (!url) return null;
                if (!url.startsWith('blob:')) return url; // Might be public already
                setExportMessage("Uploading assets to cloud...");
                try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const ext = blob.type.split('/')[1] || 'bin';
                    const filename = `heygen_assets/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                    const storageRef = ref(storage, filename);
                    await uploadBytes(storageRef, blob);
                    return await getDownloadURL(storageRef);
                } catch (e) {
                    console.error("Failed to upload blob to Firebase", e);
                    return null;
                }
            };

            const heygenAvatarId = localStorage.getItem("heygen_avatar_id") || "f34f8d0d40a646af8e640ba2e3873cea";
            const heygenVoiceId = localStorage.getItem("heygen_voice_id") || "AlQ0ntbSy8M9v4PUN6ZR";

            // Map scenes to inputs sequentially to handle async uploads
            const videoInputs = [];
            for (let i = 0; i < scenesToProcess.length; i++) {
                const scene = scenesToProcess[i];
                let bgVideoUrl = null;
                let bgImageUrl = null;
                
                if (scene.videoUrl) {
                    bgVideoUrl = await uploadBlobToStorage(scene.videoUrl);
                }
                if (!bgVideoUrl && scene.imageUrl) {
                    bgImageUrl = await uploadBlobToStorage(scene.imageUrl);
                }

                videoInputs.push({
                    character: {
                        type: "avatar",
                        avatar_id: heygenAvatarId,
                        avatar_style: "normal"
                    },
                    voice: {
                        type: "text",
                        voice_id: heygenVoiceId,
                        input_text: scene.narration || "...",
                        speed: 1.0
                    },
                    background: bgVideoUrl ? {
                        type: "video",
                        url: bgVideoUrl
                    } : bgImageUrl ? {
                        type: "image",
                        url: bgImageUrl
                    } : {
                        type: "color",
                        value: "#000000"
                    }
                });
            }

            const payload = {
                title: currentIdea.title || "My Studio Video",
                caption: showSubtitles,
                dimension: {
                    width: exportRes.width,
                    height: exportRes.height
                },
                video_inputs: videoInputs
            };

            setExportMessage("Submitting to HeyGen API...");
            const response = await generateHeyGenVideo(payload);
            const videoId = response.video_id;
            
            console.log("HeyGen response:", response);
            setActiveHeyGenTaskId(videoId);
            setIsExporting(false); // Stop the canvas/ffmpeg export UI
            setShowExportModal(false);
            setExportMessage("");
            setExportProgress(0);
        } catch (e: any) {
            console.error("HeyGen render failed", e);
            setExportMessage(`HeyGen API failed: ${e.message}`);
            // Keep export modal open so user sees error
        }
        return;
    }

    // If canvas engine is selected, proceed with high-performance native rendering
    if (exportEngineType === 'canvas') {
        try {
            await exportVideoCanvasNative(scenesToProcess);
        } catch (e) {
            console.error("Native canvas render failed, trying legacy FFmpeg...", e);
            setExportEngineType('ffmpeg');
            // Continue below
        }
        return;
    }

    setExportMessage("Initializing FFmpeg Core...");

    try {
        await loadFFmpeg();
        setExportMessage("Loading Assets...");
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on("progress", ({ progress }) => {
            const p = Math.round(progress * 100);
            setExportProgress(p);
            if (p < 20) setExportMessage("Loading Assets...");
            else if (p < 50) setExportMessage("Synthesizing Visuals...");
            else if (p < 80) setExportMessage("Forging Narrative Audio...");
            else if (p < 95) setExportMessage("Applying Cinematic Motion...");
            else setExportMessage("Finalizing MP4 Wrapper...");
        });

        // Write images and fetch narration audio in parallel
        setExportMessage("Acquiring Cinematic Assets...");

        let fontLoaded = false;
        let musicLoaded = false;
        
        const preTasks = [];
        if (showSubtitles) {
           preTasks.push((async () => {
             try {
               const fontData = await fetchFile("https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Black.ttf");
               await ffmpeg.writeFile('font.ttf', fontData);
               fontLoaded = true;
             } catch (e) {
               console.warn("Failed to load font. Subtitles will be disabled.", e);
             }
           })());
        }
        
        if (exportMusic !== "none") {
           preTasks.push((async () => {
             try {
                const track = MUSIC_TRACKS.find(m => m.id === exportMusic);
                if (track && track.url) {
                   const audioData = await fetchFile(track.url);
                   await ffmpeg.writeFile('bgm.mp3', audioData);
                   musicLoaded = true;
                }
             } catch (e) {
                console.warn("BGM load failed", e);
             }
           })());
        }
        
        await Promise.all(preTasks);
        
        const assetTasks = scenesToProcess.map(async (scene, i) => {
            // Fetch Image with robustness
            const imgTask = (async () => {
              try {
                const response = await fetch(scene.imageUrl!, { 
                  mode: 'cors',
                  credentials: 'omit',
                  referrerPolicy: 'no-referrer'
                });
                if (!response.ok) throw new Error("CORS image fetch failed");
                const buffer = await response.arrayBuffer();
                await ffmpeg.writeFile(`img${i}.jpg`, new Uint8Array(buffer));
              } catch (e) {
                console.warn("Robust image fetch failed for scene", i, e);
                const data = await fetchFile(scene.imageUrl!);
                await ffmpeg.writeFile(`img${i}.jpg`, data);
              }
            })();
            
            // Narration Audio
            const audioTask = (async () => {
              try {
                let audioBlob: Blob;
                const activeProfile = VOICE_PROFILES.find(v => v.id === selectedVoice) || VOICE_PROFILES[0];
                
                if (activeProfile.provider === 'elevenlabs' && elevenLabsKey && elevenLabsKey.trim().length > 5) {
                   const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${activeProfile.voiceId}`, {
                      method: 'POST',
                      headers: { 'xi-api-key': elevenLabsKey, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: scene.narration, model_id: "eleven_monolingual_v1" })
                   });
                   if (!res.ok) throw new Error("ElevenLabs API failed");
                   audioBlob = await res.blob();
                } else {
                   // Fallback to streamelements
                   const voiceToUse = activeProfile.provider === 'streamelements' ? activeProfile.voiceId : 'Brian';
                   const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceToUse}&text=${encodeURIComponent(scene.narration)}`;
                   const res = await fetch(ttsUrl, { referrerPolicy: 'no-referrer' });
                   if (!res.ok) throw new Error("TTS failed");
                   audioBlob = await res.blob();
                }
                const data = await fetchFile(audioBlob);
                await ffmpeg.writeFile(`audio${i}.mp3`, data);
              } catch (e) {
                console.warn("TTS fetch failed for scene", i, e);
                // Fallback to silence if TTS fails
                await ffmpeg.exec(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", (scene.durationSeconds || 5).toString(), `audio${i}.mp3`]);
              }
            })();

            return Promise.all([imgTask, audioTask]);
        });

        await Promise.all(assetTasks);

        setExportMessage("Forging Cinematic Timeline...");
        
        const resWidth = exportRes.width;
        const resHeight = exportRes.height;
        const resStr = `${resWidth}x${resHeight}`;

        // Construct the complex filter
        // 1. Zoompan for each video segment
        const videoSegments = scenesToProcess.map((s, i) => {
            const durationFrames = Math.max(1, Math.round(s.durationSeconds * exportFps));
            let filter = "";
            
            const motion = s.motionType || (i % 2 === 0 ? "zoom_in" : "zoom_out");

            switch(motion) {
              case "zoom_in":
              case "push_in":
                filter = `zoompan=z='min(zoom+0.0015,1.5)':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              case "zoom_out":
                filter = `zoompan=z='max(1.5-0.0015*on,1)':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              case "pan_horizontal":
                filter = `zoompan=z=1.3:x='if(lte(on,1),(iw-iw/zoom)/2,x+1)':y='(ih-ih/zoom)/2':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              case "pan_vertical":
                filter = `zoompan=z=1.3:x='(iw-iw/zoom)/2':y='if(lte(on,1),(ih-ih/zoom)/2,y+1)':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              case "action_shake":
                // Simulate shake using random-ish jitter on x and y
                filter = `zoompan=z=1.2:x='(iw-iw/zoom)/2 + 10*sin(on*2)':y='(ih-ih/zoom)/2 + 10*cos(on*3)':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              case "slow_drift":
                filter = `zoompan=z=1.2:x='x+0.5':y='y+0.5':d=${durationFrames}:s=${resStr}[v${i}]`;
                break;
              default:
                filter = `zoompan=z='min(zoom+0.001,1.3)':d=${durationFrames}:s=${resStr}[v${i}]`;
            }

            // Add Fade In/Out
            const dur = s.durationSeconds;
            const fadeIn = i === 0 ? "" : `,fade=t=in:st=0:d=0.5`;
            const fadeOut = i === scenesToProcess.length - 1 ? "" : `,fade=t=out:st=${dur - 0.5}:d=0.5`;

            // Drawtext for Subtitles
            let textOverlay = "";
            if (fontLoaded) {
               // A very basic subtitle, replacing single quotes so FFmpeg doesn't break
               const cleanText = s.narration.replace(/'/g, "").replace(/:/g, "");
               // Break text into max 30 chars
               const chunks = cleanText.match(/.{1,30}(\s|$)/g) || [cleanText];
               const wrappedText = chunks.join("\\n").trim();

               textOverlay = `,drawtext=fontfile=font.ttf:text='${wrappedText}':fontcolor=white:fontsize=(h/24):x=(w-text_w)/2:y=(h-(h/10)):bordercolor=black:borderw=3:shadowcolor=black:shadowx=2:shadowy=2`;
            }

            // We double the scale source to improve zoompan quality before the filter
            return `[${i}:v]scale=${resWidth * 2}:${resHeight * 2}:force_original_aspect_ratio=increase,crop=${resWidth * 2}:${resHeight * 2},${filter.replace(`[v${i}]`, '')}${fadeIn}${fadeOut}${textOverlay}[v${i}]`;
        }).join("; ");

        // 2. Concatenate video and audio
        const videoConcat = scenesToProcess.map((_, i) => `[v${i}]`).join("");
        const audioConcat = scenesToProcess.map((_, i) => `[${scenesToProcess.length + i}:a]`).join("");
        
        let filterComplex = `${videoSegments}; ${videoConcat}concat=n=${scenesToProcess.length}:v=1:a=0[outv]; ${audioConcat}concat=n=${scenesToProcess.length}:v=0:a=1[narracao]`;

        const imageInputs = scenesToProcess.flatMap((_, i) => ["-i", `img${i}.jpg`]);
        const audioInputs = scenesToProcess.flatMap((_, i) => ["-i", `audio${i}.mp3`]);
        
        let execArgs = [];
        if (musicLoaded) {
            // [narracao] is the voice. The bgm is the last input.
            const bgmIndex = scenesToProcess.length * 2;
            filterComplex += `; [${bgmIndex}:a]volume=0.2[bgm]; [narracao][bgm]amix=inputs=2:duration=first:dropout_transition=2[outa]`;
            execArgs = [
                ...imageInputs,
                ...audioInputs,
                "-i", "bgm.mp3",
                "-filter_complex", filterComplex,
                "-map", "[outv]",
                "-map", "[outa]"
            ];
        } else {
            filterComplex += `; [narracao]anull[outa]`;
            execArgs = [
                ...imageInputs,
                ...audioInputs,
                "-filter_complex", filterComplex,
                "-map", "[outv]",
                "-map", "[outa]"
            ];
        }
        
        await ffmpeg.exec([
            ...execArgs,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-preset", "ultrafast",
            "-r", exportFps.toString(),
            "-s", resStr,
            "output.mp4"
        ]);

        setExportProgress(100);
        setExportMessage("Chronicle Master Rendered");

        const data = await ffmpeg.readFile("output.mp4");
        const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: "video/mp4" }));
        setDownloadUrl(url);
    } catch (error) {
        console.warn("FFmpeg export failed, automatically switching to Native Web Engine...", error);
        setExportMessage("Switching to Native Web Engine...");
        try {
            await exportVideoCanvasNative(scenesToProcess);
        } catch (fallbackError) {
            console.error("Everything failed: ", fallbackError);
            setExportMessage("Critical Failure in Forge");
            alert("Export failed. Please check browser permissions or try a different browser.");
            setIsExporting(false);
        }
    }
  };

  const totalDuration = currentIdea.scenes?.reduce((acc, s) => acc + s.durationSeconds, 0) || 0;

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-sans">
      <AnimatePresence>
        {activeHeyGenTaskId && (
          <HeyGenStatusPoller 
            taskId={activeHeyGenTaskId} 
            onClose={() => setActiveHeyGenTaskId(null)} 
          />
        )}
        {isExporting && showExportModal && !isAutoPilotMode && (
          <ExportModal 
            progress={exportProgress} 
            message={exportMessage || (exportProgress < 100 ? "Forging..." : "Artifact Ready")} 
            onClose={() => setShowExportModal(false)} 
            downloadUrl={downloadUrl}
          />
        )}

        {isExporting && !showExportModal && !isAutoPilotMode && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            onClick={() => setShowExportModal(true)}
            className="fixed bottom-6 right-6 z-[95] bg-[#0c0d12]/90 backdrop-blur-md border border-amber-accent/30 p-4 rounded-2xl flex items-center gap-3 cursor-pointer shadow-[0_0_25px_rgba(251,191,36,0.2)] hover:border-amber-accent hover:shadow-[0_0_35px_rgba(251,191,36,0.3)] hover:scale-105 transition-all text-left"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                <circle cx="20" cy="20" r="16" stroke="#fbbf24" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - exportProgress / 100)}`} fill="transparent" className="transition-all duration-300" />
              </svg>
              <span className="absolute text-[8px] font-black text-amber-accent tracking-tighter">{exportProgress}%</span>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Forging Chronicle...</p>
              <p className="text-[8px] text-gray-400 uppercase mt-1 tracking-wider truncate max-w-[130px]">{exportMessage || (exportProgress < 100 ? "Forging..." : "Artifact Ready")}</p>
            </div>
          </motion.div>
        )}
        
        {isAutoPilotMode && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[100] flex flex-col lg:grid lg:grid-cols-2 bg-black overflow-hidden"
          >
             {/* Mobile Back Button */}
             <button 
               onClick={() => setIsAutoPilotMode(false)}
               className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/10"
             >
               <ChevronLeft size={20} />
             </button>
             
             <div className="flex-none lg:flex-1 relative bg-[#0a0a0d] border-b lg:border-b-0 lg:border-r border-white/10 p-4 lg:p-10 flex flex-col justify-center lg:justify-between h-[35vh] lg:h-auto shrink-0">
                <div className="hidden lg:block space-y-6">
                  <div className="flex items-center gap-4 text-amber-accent flex-wrap">
                    <Sparkles size={32} />
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">AI Director <br/> Auto-Pilot</h1>
                  </div>
                  <p className="text-gray-400 font-serif text-lg md:text-xl italic max-w-md">
                    Orchestrating script formatting, cinematic asset synthesis, motion generation, and finalizing the timeline... Please wait.
                  </p>
                </div>
                
                {/* Real-time Preview Area */}
                <div className="w-full max-w-2xl mx-auto h-full lg:h-auto lg:aspect-video rounded-xl lg:rounded-2xl border border-white/10 bg-black overflow-hidden relative shadow-2xl lg:mt-8 flex-shrink-0 group/preview">
                     {currentIdea.scenes && currentIdea.scenes[activeSceneIndex]?.videoUrl ? (
                        <video 
                          key={currentIdea.scenes[activeSceneIndex].videoUrl}
                          src={currentIdea.scenes[activeSceneIndex].videoUrl} 
                          autoPlay loop muted playsInline
                          className="w-full h-full object-cover" 
                        />
                     ) : currentIdea.scenes && currentIdea.scenes[activeSceneIndex]?.imageUrl ? (
                        <SafeImage 
                          src={currentIdea.scenes[activeSceneIndex].imageUrl!} 
                           loading="eager"
                           className="w-full h-full object-cover"
                           alt="preview"
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-black tracking-widest text-xs">
                           <Loader2 size={24} className="animate-spin text-amber-accent absolute" />
                        </div>
                     )}
                     
                      {/* Manual Navigation Chevrons */}
                      {currentIdea.scenes && currentIdea.scenes.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSceneIndex((prev) => (prev - 1 + currentIdea.scenes!.length) % currentIdea.scenes!.length);
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-accent hover:text-black border border-white/20 flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover/preview:opacity-100 active:scale-95 shadow-lg text-white"
                            title="Previous Scene"
                          >
                            <ChevronLeft size={16} strokeWidth={3} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSceneIndex((prev) => (prev + 1) % currentIdea.scenes!.length);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-accent hover:text-black border border-white/20 flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover/preview:opacity-100 active:scale-95 shadow-lg text-white"
                            title="Next Scene"
                          >
                            <ChevronRight size={16} strokeWidth={3} />
                          </button>
                        </>
                      )}

                     <div className="absolute bottom-4 left-4 right-4 flex gap-1 bg-black/60 backdrop-blur pb-1 px-1 rounded">
                       {currentIdea.scenes?.map((_, idx) => (
                           <div 
                             key={idx} 
                             className={`h-1.5 flex-1 rounded-sm cursor-pointer transition-all ${idx === activeSceneIndex ? 'bg-amber-accent' : 'bg-white/20'}`}
                             onClick={() => setActiveSceneIndex(idx)}
                           />
                       ))}
                     </div>
                </div>
             </div>

             <div className="flex flex-col h-full min-h-0 bg-[#050608] relative">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-10 flex-shrink-0">
                   <div className="flex flex-col">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em]">{currentIdea.title}</h2>
                      <span className="text-[10px] text-amber-accent tracking-widest font-bold">WORKFLOW LOG</span>
                   </div>
                   
                   <button 
                      onClick={() => setIsAutoPilotMode(false)}
                      className="px-4 py-2 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded hover:bg-white/10"
                   >
                     {isAutoPilotRunning ? "HIDE" : "CLOSE"}
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 space-y-4 custom-scrollbar">
                   {autoPilotLogs.map((log) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                         <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            log.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-500 animate-pulse'
                         }`}>
                           {log.status === 'completed' ? <Check size={12} strokeWidth={3} /> : <Loader2 size={12} className="animate-spin" />}
                         </div>
                         <p className="text-sm tracking-wide font-medium text-gray-200">
                           {log.text}
                         </p>
                      </motion.div>
                   ))}
                   <div ref={autoPilotLogsEndRef} className="h-4" />
                </div>
                
                {/* Fake prompt bar similar to chat UI - In flow to prevent overlap */}
                <div className="flex-shrink-0 border-t border-white/10 bg-[#050608] p-4 md:p-8">
                   <div className="max-w-xl mx-auto h-12 bg-white/5 border border-white/10 rounded-full flex items-center px-6">
                      <span className="text-xs text-gray-500 tracking-widest uppercase font-bold animate-pulse">Director AI is working...</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar (already mostly updated) */}
      <header className="min-h-16 py-4 md:py-0 border-b border-white/5 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-400 hover:text-white flex-shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-[1px] bg-white/10 mx-1 md:mx-2 flex-shrink-0"></div>
          <div className="flex gap-2 relative flex-shrink-0">
            {(["script", "visuals", "timeline", "export"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveStep(s)}
                className={`relative px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeStep === s 
                    ? "text-black z-10" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {activeStep === s && (
                  <motion.div 
                    layoutId="activeStep"
                    className="absolute inset-0 bg-amber-accent rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {s}
              </button>
            ))}
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-1 md:mx-2 flex-shrink-0"></div>
          <div className="flex-shrink-0 max-w-[150px] md:max-w-none">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] truncate">{currentIdea.title}</h1>
            <p className="text-[9px] text-amber-accent font-black tracking-widest uppercase mt-0.5 truncate">Phase 2/3: Production</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button 
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 border rounded-lg text-[10px] md:text-xs font-black tracking-widest transition-all whitespace-nowrap ${
                showSubtitles ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-gray-500"
            }`}
          >
            {showSubtitles ? "SUBS ON" : "SUBS OFF"}
          </button>
          <button 
            onClick={startAutoPilot}
            disabled={isAutoPilotMode}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 bg-amber-accent text-black rounded-lg text-[10px] md:text-xs font-black tracking-widest hover:bg-amber-muted transition-all disabled:opacity-50 whitespace-nowrap ${!isAutoPilotRunning ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse' : ''} hover:animate-none`}
          >
            {isAutoPilotMode ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
            {isAutoPilotRunning ? "VIEW AUTO-PILOT" : "AUTO-PILOT"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step Navigation Content */}
        <AnimatePresence mode="wait">
          {activeStep === "script" && (
            <motion.div 
              key="script"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/5"
            >
            <div className="w-full md:w-1/2 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8 md:space-y-12">
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ScrollText size={18} className="text-amber-accent" />
                    <h2 className="text-lg font-black uppercase tracking-[0.2em]">Full Narrative Script</h2>
                  </div>
                </div>
                <div className="glass-card p-6 md:p-8 bg-white/[0.02] border-white/10 leading-relaxed text-gray-300 font-serif text-base md:text-lg italic whitespace-pre-wrap">
                  {currentIdea.fullScript}
                </div>
              </section>
            </div>
            <div className="w-full md:w-1/2 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-4">
              <h2 className="text-lg font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <ImageIcon size={18} className="text-amber-accent" /> Scene Structure
              </h2>
              {currentIdea.scenes?.map((scene, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-accent">{scene.timestamp} ({scene.durationSeconds}s)</span>
                  </div>
                  <p className="text-sm text-gray-300 font-serif leading-relaxed italic">{scene.narration}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeStep === "visuals" && (
          <motion.div 
            key="visuals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-10"
          >
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em]">Visual Asset Management</h2>
                {currentIdea.visualStyle && (
                  <p className="text-[10px] text-amber-accent font-black tracking-widest uppercase mb-4">
                    <Sparkles size={10} className="inline mr-1" /> Style Theme: {currentIdea.visualStyle}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
                {isGeneratingImages && (
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-amber-accent animate-pulse">Generating Cinematic Visuals...</span>
                      <span>{Math.round((generationProgress / totalToGenerate) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        className="h-full bg-amber-accent shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(generationProgress / totalToGenerate) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {!isGeneratingImages && generationProgress === totalToGenerate && totalToGenerate > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-[9px] font-black uppercase tracking-widest"
                  >
                    <Sparkles size={12} /> Visuals 100% Forged
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => {
                       setSelectionMode(!selectionMode);
                       setSelectedScenes([]);
                    }}
                    className={`flex-1 px-4 py-2 border ${selectionMode ? 'bg-amber-accent/20 border-amber-accent text-amber-accent' : 'border-white/10 text-white hover:bg-white/5'} rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap`}
                  >
                    {selectionMode ? "CANCEL BATCH" : "BATCH SELECT"}
                  </button>
                  <button 
                    onClick={async () => {
                      const zip = new JSZip();
                      setIsGeneratingImages(true);
                      for (let i = 0; i < (currentIdea.scenes?.length || 0); i++) {
                        const scene = currentIdea.scenes![i];
                        if (scene.imageUrl) {
                          try {
                            const response = await fetch(scene.imageUrl, { referrerPolicy: 'no-referrer' });
                            const blob = await response.blob();
                            zip.file(`scene_${i+1}.jpg`, blob);
                          } catch (e) { console.error(e); }
                        }
                      }
                      const content = await zip.generateAsync({ type: "blob" });
                      const url = URL.createObjectURL(content);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${currentIdea.title.replace(/\s+/g, "_")}_assets.zip`;
                      link.click();
                      setIsGeneratingImages(false);
                    }}
                    disabled={isGeneratingImages || !currentIdea.scenes?.some(s => s.imageUrl)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Download size={14} /> ZIP Assets
                  </button>
                  <button 
                    onClick={() => generateMissingImages(selectedImageEngine)}
                    disabled={isGeneratingImages}
                    className="flex-1 px-4 py-2 bg-amber-accent text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-muted transition-all whitespace-nowrap"
                  >
                    {isGeneratingImages ? "Forge..." : "REGEN MISSING"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {selectionMode && selectedScenes.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 bg-[#0a0a0d]/95 backdrop-blur-xl border border-amber-accent/50 rounded-2xl shadow-2xl z-50 flex items-center gap-6">
                  <div className="text-white font-black tracking-widest text-[10px] uppercase">
                     {selectedScenes.length} Selected
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setSelectionMode(false)} className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-white font-black text-[9px] uppercase tracking-widest transition-colors">Cancel</button>
                     <button onClick={() => generateSelectedImages(selectedImageEngine)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-colors">Gen Images</button>
                     <button onClick={() => generateSelectedVideos(selectedVideoEngine)} className="px-6 py-2 bg-amber-accent text-black hover:bg-amber-muted rounded-lg font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all">Gen Videos</button>
                  </div>
                </div>
              )}
              {currentIdea.scenes?.map((scene, idx) => (
                <div key={idx} className={`glass-card overflow-hidden border-white/10 group relative transition-all ${selectionMode && selectedScenes.includes(idx) ? 'ring-2 ring-amber-accent scale-[0.98]' : ''}`}>
                  {selectionMode && (
                     <div className="absolute top-3 left-3 z-30" onClick={(e) => { e.stopPropagation(); toggleSceneSelection(idx); }}>
                        <div className={`w-6 h-6 rounded border-2 shadow-lg flex items-center justify-center cursor-pointer transition-colors ${selectedScenes.includes(idx) ? 'bg-amber-accent border-amber-accent text-black' : 'border-white/50 bg-black/50 hover:border-amber-accent'}`}>
                            {selectedScenes.includes(idx) && <Check size={14} strokeWidth={4} />}
                        </div>
                     </div>
                  )}
                  {selectionMode && <div className="absolute inset-0 z-20 cursor-pointer" onClick={() => toggleSceneSelection(idx)} />}
                  <div className={`aspect-video relative bg-[#0a0a0d] ${scene.locked ? (scene.imageUrl ? 'cursor-default' : 'cursor-not-allowed') : 'cursor-pointer'}`} onClick={() => !scene.imageUrl && !scene.locked && !selectionMode && setImageMenuOpenSceneIdx(idx)}>
                    {scene.videoUrl ? (
                      <video 
                        src={scene.videoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : scene.imageUrl ? (
                      <SafeImage 
                        src={scene.imageUrl!} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        alt={`Scene ${idx}`} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        {isGeneratingImages ? <Loader2 className="animate-spin text-amber-accent/20" /> : <ImageIcon size={24} className="text-white/5" />}
                        <span className="text-[9px] text-gray-600 font-black tracking-widest uppercase">Null Asset</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-amber-accent">
                        SCENE #{idx + 1}
                      </div>
                      <div className="px-2 py-1 bg-amber-accent/80 backdrop-blur-md rounded text-[9px] font-black text-black uppercase tracking-tighter">
                        {scene.motionType?.replace("_", " ")}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newScenes = [...currentIdea.scenes!];
                        newScenes[idx] = { ...scene, locked: !scene.locked };
                        const updatedIdea = { ...currentIdea, scenes: newScenes };
                        setCurrentIdea(updatedIdea);
                        onUpdateIdea(updatedIdea);
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 border ${scene.locked ? 'bg-amber-accent text-black border-amber-accent' : 'bg-black/60 text-white/50 border-white/20 hover:bg-white/10 hover:text-white'}`}
                      title={scene.locked ? "Unlock Scene" : "Lock Scene (Protect from Auto-Pilot)"}
                    >
                      {scene.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{scene.visualPrompt}</p>
                     
                     <div className="flex flex-col gap-1.5">
                        <label 
                           className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] relative cursor-help"
                           onMouseEnter={() => setHoveredMotionSceneIdx(idx)}
                           onMouseLeave={() => setHoveredMotionSceneIdx(null)}
                         >
                           Cinematic Motion
                           {hoveredMotionSceneIdx === idx && (
                             <MotionPreviewTooltip type={scene.motionType || "zoom_in"} />
                           )}
                         </label>
                        <select 
                          value={scene.motionType || "zoom_in"}

                          onChange={(e) => {
                            const newScenes = [...currentIdea.scenes!];
                            newScenes[idx] = { ...scene, motionType: e.target.value as any };
                            onUpdateIdea({ ...currentIdea, scenes: newScenes });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-bold text-amber-accent transition-colors outline-none hover:border-amber-accent/30 cursor-pointer"
                        >
                          <option value="zoom_in" className="bg-[#0a0a0d]">Zoom In</option>
                          <option value="zoom_out" className="bg-[#0a0a0d]">Zoom Out</option>
                          <option value="pan_horizontal" className="bg-[#0a0a0d]">Horizontal Pan</option>
                          <option value="pan_vertical" className="bg-[#0a0a0d]">Vertical Pan</option>
                          <option value="push_in" className="bg-[#0a0a0d]">Deep Push In</option>
                          <option value="action_shake" className="bg-[#0a0a0d]">Action Shake</option>
                          <option value="slow_drift" className="bg-[#0a0a0d]">Slow Drift</option>
                        </select>
                     </div>
                     <div className="flex gap-2">
                        {imageMenuOpenSceneIdx === idx ? (
                          <div className="flex-1 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 absolute bottom-2 left-2 right-2 bg-[#0a0a0d]/95 backdrop-blur rounded-xl p-2 z-20 border border-green-500/30 shadow-2xl">
                             <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-[9px] text-green-400 uppercase tracking-widest font-black">Select Image Engine</span>
                                <button onClick={() => setImageMenuOpenSceneIdx(null)} className="text-gray-400 hover:text-white"><Settings size={12}/></button>
                             </div>
                             <div className="flex gap-1 mb-1">
                                 <button onClick={() => setSelectedImageEngine('chatgpt')} className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedImageEngine === 'chatgpt' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>ChatGPT</button>
                                 <button onClick={() => setSelectedImageEngine('flux')} className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedImageEngine === 'flux' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>Flux</button>
                                 <button onClick={() => setSelectedImageEngine('gemini_3_1_pro')} className={`flex-[1.5] py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedImageEngine === 'gemini_3_1_pro' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>Gemini 3.1 Pro</button>
                             </div>
                             <div className="flex gap-1 mt-1">
                                 <button onClick={() => { generateSingleSceneImage(idx, selectedImageEngine); setImageMenuOpenSceneIdx(null); }} className="flex-1 py-2 text-[8px] font-black uppercase bg-white/10 text-white hover:bg-white/20 rounded-lg">Gen This</button>
                                 <button onClick={() => generateMissingImages(selectedImageEngine)} className="flex-[2] py-2 text-[8px] font-black uppercase bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg whitespace-nowrap">+ Apply to All</button>
                             </div>
                          </div>
                        ) : null}
                        <button 
                          disabled={scene.locked || isGeneratingImages}
                          onClick={() => setImageMenuOpenSceneIdx(idx)}
                          className={`flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${(scene.locked || isGeneratingImages) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        >
                          <ImageIcon size={12} /> {scene.imageUrl ? 'Upd Image' : `Gen (${selectedImageEngine})`}
                        </button>
                        {videoMenuOpenSceneIdx === idx ? (
                          <div className="flex-1 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 absolute bottom-2 left-2 right-2 bg-[#0a0a0d]/95 backdrop-blur rounded-xl p-2 z-20 border border-amber-500/30 shadow-2xl">
                             <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-[9px] text-amber-accent uppercase tracking-widest font-black">Select Engine</span>
                                <button onClick={() => setVideoMenuOpenSceneIdx(null)} className="text-gray-400 hover:text-white"><Settings size={12}/></button>
                             </div>
                             <div className="flex gap-1">
                                 <button onClick={() => setSelectedVideoEngine('luma')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedVideoEngine === 'luma' ? 'bg-amber-accent text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>Luma</button>
                                 <button onClick={() => setSelectedVideoEngine('kling')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedVideoEngine === 'kling' ? 'bg-amber-accent text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>Kling</button>
                                 <button onClick={() => setSelectedVideoEngine('seedance')} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg ${selectedVideoEngine === 'seedance' ? 'bg-amber-accent text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>Seedance</button>
                             </div>
                             <div className="flex gap-1 mt-1">
                                 <button onClick={() => { generateSceneVideo(idx, selectedVideoEngine); setVideoMenuOpenSceneIdx(null); }} className="flex-1 py-2 text-[8px] font-black uppercase bg-white/10 text-white hover:bg-white/20 rounded-lg">Gen This</button>
                                 <button onClick={() => generateMissingVideos(selectedVideoEngine)} className="flex-[2] py-2 text-[8px] font-black uppercase bg-amber-accent/20 text-amber-300 hover:bg-amber-accent/30 rounded-lg whitespace-nowrap">+ Apply {selectedVideoEngine} to All</button>
                             </div>
                          </div>
                        ) : null}
                        <button 
                          onClick={() => setVideoMenuOpenSceneIdx(idx)}
                          disabled={generatingSceneIds.includes(idx) || scene.locked}
                          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                            scene.locked || generatingSceneIds.includes(idx) 
                              ? "bg-white/10 text-gray-400 cursor-not-allowed opacity-50"
                              : scene.videoUrl 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                : "bg-amber-accent text-black hover:bg-amber-muted"
                          }`}
                        >
                          {generatingSceneIds.includes(idx) ? (
                             <Loader2 size={12} className="animate-spin" />
                          ) : (
                             <VideoIcon size={12} />
                          )}
                          {generatingSceneIds.includes(idx) ? "Forging..." : (scene.videoUrl ? `Upd Video` : `Gen (${selectedVideoEngine})`)}
                        </button>
                        {scene.imageUrl && (
                          <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(scene.imageUrl!, { referrerPolicy: 'no-referrer' });
                              const blob = await response.blob();
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `scene_${idx+1}.jpg`;
                              link.click();
                            } catch (e) {
                              console.error("Single download failed", e);
                              // Fallback
                              window.open(scene.imageUrl, "_blank");
                            }
                          }}
                            className="w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-amber-accent hover:text-black transition-all"
                          >
                            <Download size={14} />
                          </button>
                        )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeStep === "timeline" && (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-h-0 h-full flex flex-col lg:flex-row overflow-hidden"
          >
            {/* LEFT PANEL: SCENES (Second on mobile, Left on desktop) */}
            <div className="order-2 lg:order-1 w-full flex-1 lg:flex-none lg:w-[35%] xl:w-[25%] flex-col flex min-h-0 lg:h-full overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-[#0a0a0d] border-t lg:border-t-0 lg:border-r border-white/5">
                <section className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-amber-accent" />
                    <h2 className="text-lg font-black uppercase tracking-[0.2em]">Cinematic Sequence</h2>
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                          Timeline: {Math.floor((currentIdea.scenes?.reduce((acc, s) => acc + s.durationSeconds, 0) || 0) / 60)}m {Math.floor((currentIdea.scenes?.reduce((acc, s) => acc + s.durationSeconds, 0) || 0) % 60)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pb-2xl md:pb-20">
                  {currentIdea.scenes?.map((scene, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveSceneIndex(idx)}
                      className={`group p-4 md:p-6 rounded-2xl border transition-all cursor-pointer ${
                        activeSceneIndex === idx 
                          ? "bg-amber-accent/10 border-amber-accent/30" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-amber-accent/60 uppercase tracking-widest bg-amber-accent/5 px-2 py-1 rounded">Scene #{idx + 1} • {scene.timestamp}</span>
                        <span className="hidden sm:block text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{scene.motionType?.replace("_", " ")}</span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {scene.imageUrl ? (
                            <SafeImage 
                              src={scene.imageUrl!} 
                              className="w-full aspect-video object-cover rounded-lg border border-white/10" 
                              alt={`Scene ${idx}`} 
                            />
                        ) : (
                            <div className="w-full aspect-video bg-black/40 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                                <ImageIcon size={20} className="text-white/10" />
                            </div>
                        )}
                        <div className="flex-1 space-y-2">
                            <p className="text-sm text-gray-300 leading-relaxed font-serif italic">{scene.narration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT PANEL: VIDEO PREVIEW (First on mobile, Right on desktop) */}
            <div className="order-1 lg:order-2 w-full shrink-0 lg:flex-1 flex flex-col min-h-0 min-w-0 p-4 md:p-6 lg:p-8 lg:py-8 gap-4 lg:gap-6 lg:overflow-hidden bg-[#0A0B0E]">
               <div className="w-full lg:h-full flex flex-col gap-4 lg:gap-6 lg:justify-center items-center min-h-0">
                 {/* Main Preview Screen */}
                 <div className="relative shrink min-h-0 aspect-video w-full max-w-full max-h-full rounded-2xl overflow-hidden glass-card border-white/10 group shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center bg-black/50">
                {currentIdea.scenes![activeSceneIndex]?.videoUrl ? (
                   <video 
                     key={activeSceneIndex}
                     src={currentIdea.scenes![activeSceneIndex].videoUrl} 
                     autoPlay 
                     loop 
                     muted 
                     playsInline
                     className="w-full h-full object-cover shadow-2xl" 
                   />
                ) : currentIdea.scenes![activeSceneIndex]?.imageUrl ? (
                  <div className="w-full h-full overflow-hidden">
                    <motion.div 
                      key={activeSceneIndex}
                      initial={activeSceneIndex % 3 === 1 ? { scale: 1.2 } : { scale: 1, x: activeSceneIndex % 3 === 2 ? -20 : 0 }}
                      animate={
                        activeSceneIndex % 3 === 0 
                          ? { scale: 1.2 } 
                          : activeSceneIndex % 3 === 1 
                            ? { scale: 1 } 
                            : { x: 20 }
                      }
                      transition={{ 
                        duration: currentIdea.scenes![activeSceneIndex].durationSeconds,
                        ease: "linear"
                      }}
                      className="w-full h-full"
                    >
                      <SafeImage 
                        src={currentIdea.scenes![activeSceneIndex].imageUrl!} 
                        loading="eager"
                        className="w-full h-full object-cover shadow-2xl"
                      />
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0a0a0d]">
                    <Loader2 size={40} className="text-amber-accent/20 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Visual Feed Offline</span>
                  </div>
                )}
                
                {showSubtitles && (
                  <div className="absolute inset-x-0 bottom-16 flex justify-center px-12 pointer-events-none">
                    <motion.div
                      key={activeSceneIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/80 px-6 py-2 rounded-xl border border-white/10 text-center"
                    >
                      <p className="text-xl font-serif font-black text-amber-accent italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-tight">
                        {currentIdea.scenes![activeSceneIndex]?.narration}
                      </p>
                    </motion.div>
                  </div>
                )}
                
                <button
                  onClick={() => setActiveSceneIndex(Math.max(0, activeSceneIndex - 1))}
                  disabled={activeSceneIndex === 0}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 disabled:opacity-0 transition-all opacity-100 border border-white/10 hover:border-amber-accent z-10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setActiveSceneIndex(Math.min((currentIdea.scenes?.length || 0) - 1, activeSceneIndex + 1))}
                  disabled={activeSceneIndex === (currentIdea.scenes?.length || 0) - 1}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 disabled:opacity-0 transition-all opacity-100 border border-white/10 hover:border-amber-accent z-10"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Audio Panel */}
              <div className="glass-card w-full max-w-5xl p-4 border-white/10 space-y-4 shadow-xl shrink-0 mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
                  <div className="flex items-center gap-3">
                      <Mic size={18} className="text-amber-accent" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Voiceover Engine</h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      {VOICE_PROFILES.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => handleVoiceChange(v.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            selectedVoice === v.id ? "bg-amber-accent text-black border-amber-accent shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                          } ${v.provider === 'elevenlabs' && (!elevenLabsKey || elevenLabsKey.trim().length <= 5) ? "opacity-50" : ""}`}
                          title={v.provider === 'elevenlabs' && (!elevenLabsKey || elevenLabsKey.trim().length <= 5) ? "Requires ElevenLabs API Key" : v.name}
                        >
                          {v.provider === 'elevenlabs' && <Sparkles size={8} className={selectedVoice === v.id ? "text-black" : "text-amber-accent/50"} />}
                          {v.name}
                        </button>
                      ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <button 
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                        isPlayingVoice 
                          ? "bg-red-500 text-white shadow-red-500/20 animate-pulse" 
                          : "bg-amber-accent text-black shadow-amber-accent/20 hover:scale-105"
                      }`}
                      onClick={() => {
                        if (isPlayingVoice) {
                          window.speechSynthesis.cancel();
                          if (previewAudioRef.current) {
                              previewAudioRef.current.pause();
                              previewAudioRef.current.src = "";
                          }
                          setIsPlayingVoice(false);
                        } else {
                          speak(currentIdea.scenes![activeSceneIndex].narration);
                        }
                      }}
                  >
                    {isPlayingVoice ? <Square size={20} md:size={24} fill="currentColor" /> : <Play size={20} md:size={24} fill="currentColor" />}
                  </button>
                  <div className="flex-1 flex items-end gap-1 h-10 overflow-hidden">
                    {Array.from({length: 24}).map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: "10%" }}
                        animate={{ 
                          height: isPlayingVoice 
                            ? `${Math.random() * (i % 2 === 0 ? 80 : 40) + 10}%` 
                            : "10%" 
                        }}
                        transition={{ 
                          duration: isPlayingVoice ? (0.4 + Math.random() * 0.4) : 0.8, 
                          repeat: Infinity, 
                          repeatType: "mirror",
                          ease: "easeInOut"
                        }}
                        className={`flex-1 min-w-[2px] rounded-full transition-colors duration-500 ${
                          isPlayingVoice ? "bg-amber-accent" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
             </div>
            </div>
          </motion.div>
        )}

        {activeStep === "export" && (
          <motion.div 
            key="export"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10"
          >
            <div className="min-h-full flex flex-col items-center justify-center py-8">
               <div className="max-w-2xl w-full glass-card p-6 md:p-12 border-white/10 space-y-6 md:space-y-10 text-center animate-in fade-in zoom-in duration-500 shrink-0">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-amber-accent/10 flex items-center justify-center mx-auto border border-amber-accent/20 shadow-2xl shadow-amber-accent/10">
                <VideoIcon size={32} md:size={48} className="text-amber-accent" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl md:text-4xl font-serif font-black text-white px-0 md:px-10">Ready to Finalize the Masterwork?</h2>
                <p className="text-gray-400 max-w-sm mx-auto text-xs md:text-sm leading-relaxed">
                  We are about to forge all visual assets, narrations, and cinematic transitions into a high-definition MP4 chronicle.
                </p>
              </div>

              {/* 2x2 Grid Preview of Visual Output */}
              <div className="max-w-sm mx-auto space-y-3">
                <span className="block text-[8px] md:text-[10px] font-black text-amber-accent uppercase tracking-[0.2em] text-center">Chronicle Canvas Preview</span>
                <div className="grid grid-cols-2 gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-2xl aspect-[16/10] sm:aspect-video relative overflow-hidden">
                  {[0, 1, 2, 3].map((index) => {
                    const scene = currentIdea.scenes?.[index];
                    return (
                      <div 
                        key={index} 
                        className="relative bg-black/40 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center group/preview"
                      >
                        {scene ? (
                          <>
                            {scene.videoUrl ? (
                              <video 
                                src={scene.videoUrl} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover"
                              />
                            ) : scene.imageUrl ? (
                              <img 
                                src={scene.imageUrl} 
                                alt={`Scene ${index + 1}`} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-105"
                              />
                            ) : (
                              <div className="text-gray-600 flex flex-col items-center justify-center gap-1 p-2">
                                <span className="text-[8px] font-black uppercase text-gray-500">Scene {index + 1}</span>
                                <span className="text-[6px] tracking-tight text-gray-600 uppercase">Empty Canvas</span>
                              </div>
                            )}
                            {/* Small Number Badge */}
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[6px] font-black text-amber-accent border border-white/5 z-10">
                              #{index + 1}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-800 flex flex-col items-center justify-center gap-1 p-2">
                            <span className="text-[8px] font-black uppercase text-gray-700">Scene {index + 1}</span>
                            <span className="text-[6px] tracking-tight text-gray-800 uppercase">None</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 p-4 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl mx-auto max-w-6xl">
                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Master Resolution</span>
                  <div className="flex flex-col gap-2">
                    {RESOLUTIONS.map(r => (
                      <button 
                        key={r.id}
                        onClick={() => setExportRes(r)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                          exportRes.id === r.id ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Target Frame Rate</span>
                  <div className="flex flex-col gap-2">
                    {FRAMERATES.map(f => (
                      <button 
                        key={f}
                        onClick={() => setExportFps(f)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                          exportFps === f ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Render Engine</span>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setExportEngineType('canvas')}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                        exportEngineType === 'canvas' ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      Web Canvas (Fast)
                    </button>
                    <button 
                      onClick={() => setExportEngineType('ffmpeg')}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                        exportEngineType === 'ffmpeg' ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      FFmpeg WASM
                    </button>
                    <button 
                      onClick={() => setExportEngineType('heygen')}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                        exportEngineType === 'heygen' ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      Export to HeyGen
                    </button>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Background Music</span>
                  <div className="flex flex-col gap-2">
                    {MUSIC_TRACKS.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setExportMusic(m.id)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border ${
                          exportMusic === m.id ? "bg-amber-accent text-black border-amber-accent shadow-lg shadow-amber-accent/20" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Scene Inventory</span>
                  <div className="h-[70px] md:h-[92px] bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1">
                    <span className="text-xl md:text-2xl font-black text-white">{currentIdea.scenes?.length}</span>
                    <span className="text-[7px] md:text-[8px] font-bold text-gray-500 uppercase">Sequence Shots</span>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-left">
                  <span className="block text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Media Format</span>
                  <div className="h-[70px] md:h-[92px] bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1">
                    <span className="text-xl md:text-2xl font-black text-white">MP4</span>
                    <span className="text-[7px] md:text-[8px] font-bold text-gray-500 uppercase">H.264 Encoder</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 md:pt-8 space-y-4">
                <button 
                  onClick={exportVideo}
                  disabled={isExporting}
                  className="w-full bg-amber-accent text-black font-black py-4 md:py-6 rounded-2xl text-base md:text-lg tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all amber-shadow shadow-amber-accent/20 flex items-center justify-center gap-4 group"
                >
                  {isExporting ? <Loader2 className="animate-spin" /> : <Sparkles className="group-hover:rotate-12 transition-transform" size={20} md:size={24} />}
                  Forge Final Video
                </button>
                {isExporting && (
                  <button 
                    onClick={onBack}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all"
                  >
                    Return to Generator while forging
                  </button>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}


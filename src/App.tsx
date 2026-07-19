/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { auth, db, loginWithGoogle, logout, OperationType, handleFirestoreError } from "./lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { User, onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  ScrollText, 
  Sparkles, 
  Bookmark, 
  History as HistoryIcon, 
  Languages, 
  Clock, 
  Video as VideoIcon, 
  Search,
  Loader2,
  Trash2,
  Share2,
  ChevronRight,
  Eye,
  Menu,
  X,
  Play,
  Square,
  Image as ImageIcon,
  Mic,
  Settings,
  Settings as SettingsIcon,
  ChevronLeft,
  Download,
  AlertTriangle,
  Check,
  Brain,
  LayoutTemplate,
  Lightbulb,
  Dices
} from "lucide-react";
import JSZip from "jszip";
import { 
  Category, 
  Duration, 
  ProductionStyle, 
  Language, 
  Idea, 
  Scene,
  AspectRatio,
  CATEGORIES, 
  DURATIONS, 
  STYLES, 
  LANGUAGES,
  DURATION_METRICS
} from "./types.ts";
import { generateIdeas, generateProductionDetails, generateSceneImage } from "./services/geminiService";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const WPM = 150; // Words Per Minute average

function getWordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

function pollinationsUrl(prompt: string, seed: number) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt + ". Cinematic historical. Dramatic lighting. No text."
  )}?width=1280&height=720&nologo=true&seed=${seed}&enhance=true`;
}

import { SafeImage } from "./components/SafeImage";
import { IdeaCard } from "./components/IdeaCard";
import { ProductionDashboard } from "./components/ProductionDashboard";
import { CinematicLoading } from "./components/CinematicLoading";
import { PRESET_IDEAS } from "./services/presetIdeas";
import { AlternateHistoryLab } from "./components/AlternateHistoryLab";
import { AlternateHistoryProject } from "./services/geminiService";
import { HeyGenConfig } from "./components/HeyGenConfig";

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "saved" | "settings" | "divergence">("generator");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [duration, setDuration] = useState<Duration>(DURATIONS[0]);
  const [style, setStyle] = useState<ProductionStyle>(STYLES[0]);
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [count, setCount] = useState(3);
  const [keyword, setKeyword] = useState("");

  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem("clio_elevenlabs_key") || "");
  const [klingKey, setKlingKey] = useState(localStorage.getItem("clio_kling_key") || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>(() => {
    const session = localStorage.getItem("clio_session_generated");
    if (session) {
      try {
        const parsed = JSON.parse(session) as Idea[];
        const filteredPresets = PRESET_IDEAS.filter(preset => !parsed.some(item => item.id === preset.id));
        return [...filteredPresets, ...parsed];
      } catch (e) {
        console.error("Error loading session generated ideas", e);
      }
    }
    return PRESET_IDEAS;
  });
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  const [producingIdea, setProducingIdea] = useState<Idea | null>(null);
  const [isProducing, setIsProducing] = useState(false);

  // Global Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const lastDownloadedUrl = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    try {
      import('@ffmpeg/ffmpeg').then(({ FFmpeg }) => {
        ffmpegRef.current = new FFmpeg();
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-save generated ideas to session storage
  useEffect(() => {
    localStorage.setItem("clio_session_generated", JSON.stringify(generatedIdeas));
  }, [generatedIdeas]);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Saved Ideas from Firestore
  useEffect(() => {
    if (!user) {
      setSavedIdeas([]);
      return;
    }

    const q = query(collection(db, "ideas"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => ({ ...doc.data() } as Idea));
      setSavedIdeas(ideas.sort((a, b) => (b.metadata.timestamp || 0) - (a.metadata.timestamp || 0)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "ideas");
    });

    return () => unsubscribe();
  }, [user]);

  // Migrate LocalStorage to Firestore on first login
  useEffect(() => {
    if (user && localStorage.getItem("clio_saved_ideas")) {
      const localSaved = JSON.parse(localStorage.getItem("clio_saved_ideas")!) as Idea[];
      if (localSaved.length > 0) {
        localSaved.forEach(async (idea) => {
          const ideaRef = doc(db, "ideas", idea.id);
          try {
            await setDoc(ideaRef, {
              ...idea,
              userId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error("Migration error:", e);
          }
        });
        localStorage.removeItem("clio_saved_ideas");
      }
    }
  }, [user]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const results = await generateIdeas(category, duration, style, language, count, keyword);
      const ideasWithIds = results.map((idea, idx) => ({
        ...idea,
        id: crypto.randomUUID() || `idea-${Date.now()}-${idx}`,
        metadata: {
          category,
          duration,
          style,
          language,
          aspectRatio,
          timestamp: Date.now()
        }
      })) as Idea[];
      setGeneratedIdeas(ideasWithIds);
      setActiveTab("generator");
    } catch (error) {
      console.error(error);
      alert("Failed to generate ideas. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSave = async (idea: Idea) => {
    if (!user) {
      alert("Please login to save your masterpieces to the cloud.");
      loginWithGoogle();
      return;
    }

    const isSaved = savedIdeas.some(item => item.id === idea.id);
    const ideaRef = doc(db, "ideas", idea.id);

    try {
      if (isSaved) {
        await deleteDoc(ideaRef);
      } else {
        const sanitizedIdea = JSON.parse(JSON.stringify(idea));
        await setDoc(ideaRef, {
          ...sanitizedIdea,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          metadata: {
            ...sanitizedIdea.metadata,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, isSaved ? OperationType.DELETE : OperationType.WRITE, `ideas/${idea.id}`);
    }
  };

  const isIdeaSaved = (id: string) => savedIdeas.some(item => item.id === id);

  const startProduction = async (idea: Idea) => {
    setActiveIdea(idea);
    setProducingIdea(idea);
    
    // Check if the idea already has production details generated (scenes and fullScript)
    if (idea.scenes && idea.scenes.length > 0 && idea.fullScript) {
      // Just open dashboard immediately without regenerating details
      return;
    }

    setIsProducing(true);
    try {
      const details = await generateProductionDetails(idea);
      const updatedIdea = { ...idea, ...details };
      setActiveIdea(updatedIdea);
      setProducingIdea(updatedIdea);

      // Auto-save when production starts if user is logged in
      if (user) {
        const ideaRef = doc(db, "ideas", updatedIdea.id);
        try {
          const docData = JSON.parse(JSON.stringify(updatedIdea));
          delete docData.createdAt;
          delete docData.userId;
          
          if (isIdeaSaved(updatedIdea.id)) {
            await updateDoc(ideaRef, {
              ...docData,
              updatedAt: serverTimestamp()
            });
          } else {
            await setDoc(ideaRef, {
              ...docData,
              userId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `ideas/${updatedIdea.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start production. Check Gemini API key.");
    } finally {
      setIsProducing(false);
    }
  };

  const forgeDivergenceIntoVideo = async (project: AlternateHistoryProject) => {
    setIsProducing(true);
    try {
      const scenes: Scene[] = project.nodes.map((node, idx) => {
        const times = ["00:00", "00:15", "00:30", "00:45"];
        return {
          id: `scene-${Date.now()}-${idx}`,
          timestamp: times[idx] || "00:00",
          durationSeconds: 15,
          description: node.description,
          narration: node.description,
          visualPrompt: node.visualPrompt,
          motionType: "push_in"
        };
      });

      const formattedIdea: Idea = {
        id: `divergence-${Date.now()}`,
        title: project.title,
        hook: project.divergencePoint,
        rareAngle: project.catalystExplanation,
        fullScript: project.epicNarration,
        visualStyle: project.nodes[0]?.visualPrompt || "Cinematic historical alternate documentary style",
        scenes: scenes,
        structure: {
          hook_narration: project.catalystExplanation,
          act1: project.nodes[1]?.description || "",
          crisis: project.nodes[2]?.description || "",
          climax: project.nodes[3]?.description || "",
          legacy: project.epicNarration,
        },
        visuals: project.nodes.map(n => n.visualPrompt),
        historicalFacts: [project.realBaselineCompare],
        metadata: {
          category: "Alternative Timeline",
          duration: "20-40 min",
          style: "Epic Narrated",
          language: language,
          aspectRatio: aspectRatio,
          timestamp: Date.now()
        }
      };

      setActiveIdea(formattedIdea);
      setProducingIdea(formattedIdea);

      if (user) {
        const ideaRef = doc(db, "ideas", formattedIdea.id);
        try {
          await setDoc(ideaRef, {
            ...formattedIdea,
            userId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Error saving forged divergence to database:", err);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to formulate video track from counterfactual simulation.");
    } finally {
      setIsProducing(false);
    }
  };

  const notifyExportComplete = useCallback(() => {
    try {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Chronicle Ready!", {
            body: "Your epic history video has been forged and is ready for download.",
            icon: "/favicon.ico"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }, []);

  useEffect(() => {
    if (exportProgress === 100 && downloadUrl && downloadUrl !== lastDownloadedUrl.current) {
      lastDownloadedUrl.current = downloadUrl;
      notifyExportComplete();
      try {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `historigen-production-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.warn("Auto-download failed:", err);
      }
    }
  }, [exportProgress, downloadUrl, notifyExportComplete]);

  if (activeIdea && activeIdea.scenes) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="w-full h-screen overflow-hidden flex flex-col items-stretch"
        >
          <ProductionDashboard 
            idea={activeIdea}
            elevenLabsKey={elevenLabsKey}
            klingKey={klingKey}
            onBack={() => setActiveIdea(null)} 
            onUpdateIdea={async (updated) => {
              setActiveIdea(updated);
              setProducingIdea(updated);
              
              // Local state update so that drafts/session progress is preserved
              setGeneratedIdeas(prev => prev.map(item => item.id === updated.id ? updated : item));
              
              if (user) {
                const ideaRef = doc(db, "ideas", updated.id);
                // Strip out undefined values to prevent Firestore errors
                const docData = JSON.parse(JSON.stringify(updated));
                delete docData.createdAt;
                delete docData.userId;
                try {
                  // Attempt update first
                  await updateDoc(ideaRef, {
                    ...docData,
                    updatedAt: serverTimestamp()
                  });
                } catch (error) {
                  // Fallback to setDoc if the document doesn't exist yet
                  try {
                    await setDoc(ideaRef, {
                      ...docData,
                      userId: user.uid,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp()
                    });
                  } catch (innerError) {
                    handleFirestoreError(innerError, OperationType.WRITE, `ideas/${updated.id}`);
                  }
                }
              }
            }}
            globalExportState={{
              isExporting, setIsExporting,
              exportProgress, setExportProgress,
              exportMessage, setExportMessage,
              downloadUrl, setDownloadUrl,
              ffmpegRef
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen overflow-hidden font-sans selection:bg-amber-accent/30 tracking-tight"
    >
      {/* Background Export Monitor */}
      <AnimatePresence>
        {isExporting && activeTab !== "generator" && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={() => {
              if (producingIdea) setActiveIdea(producingIdea);
            }}
            className="fixed bottom-6 right-6 z-[100] glass-card p-4 border-amber-accent/30 amber-shadow cursor-pointer hover:scale-105 transition-all w-64"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="animate-spin text-amber-accent" size={18} />
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{exportProgress}%</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">Background Forge</p>
                <p className="text-[9px] text-amber-accent/70 uppercase font-bold truncate">{exportMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card border-white/20 text-amber-accent"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Controls */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-40 w-80 glass-panel border-r border-white/10 lg:relative flex flex-col p-6 overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-amber-accent flex items-center justify-center font-bold text-black border border-white/20 shadow-lg shadow-amber-accent/20">
            H
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">HistoriGen</h1>
            <p className="text-[10px] text-amber-accent block uppercase mt-1 font-semibold tracking-widest">Pro v1.0</p>
          </div>
        </div>

        <nav className="space-y-8">
          {/* User Auth */}
          <div className="space-y-4">
            {!user ? (
               <button 
                onClick={loginWithGoogle}
                className="w-full py-4 glass-card border-white/20 flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
               >
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <HistoryIcon size={14} className="text-amber-accent" />
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Login to Cloud</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase">Sync assets across ages</p>
                 </div>
               </button>
            ) : (
              <div className="flex items-center gap-3 p-3 glass-card border-white/10">
                <SafeImage 
                  src={user.photoURL || ""} 
                  className="w-10 h-10 rounded-full border border-amber-accent/30" 
                />
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black text-white truncate uppercase">{user.displayName}</p>
                   <button onClick={logout} className="text-[8px] text-amber-accent font-bold tracking-widest uppercase hover:underline">Logout Archive</button>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Alternate History Special Lab Banner */}
          <button 
            onClick={() => { setActiveTab("divergence"); setIsSidebarOpen(false); }}
            className={`w-full py-4 rounded-xl border flex items-center justify-start gap-4 px-4 transition-all group relative overflow-hidden text-left ${activeTab === 'divergence' ? 'bg-gradient-to-r from-amber-accent/15 to-transparent border-amber-accent/30 shadow-md shadow-amber-accent/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeTab === 'divergence' ? 'bg-amber-accent text-black border-amber-accent' : 'bg-white/5 border-white/10 text-amber-accent'}`}>
               <Clock size={14} className={`${activeTab === "divergence" ? "animate-spin" : "group-hover:animate-pulse"}`} style={{ animationDuration: '4s' }} />
            </div>
            <div className="text-left min-w-0 flex-1">
               <div className="flex items-center gap-1.5 flex-wrap">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">{language === "AR" ? "مختبر التاريخ" : "Divergence Lab"}</p>
                 <span className="bg-amber-accent/20 border border-amber-accent/30 text-[8px] px-1 rounded-md text-amber-accent font-black tracking-normal uppercase">New</span>
               </div>
               <p className="text-[8px] text-gray-500 font-bold uppercase mt-0.5 truncate">{language === "AR" ? "مصفوفة الأكوان المعكوسة" : "Counterfactual Realities"}</p>
            </div>
          </button>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              onClick={() => { setActiveTab("generator"); setIsSidebarOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-wider transition-all rounded-lg ${activeTab === 'generator' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-gray-400'}`}
            >
              <Sparkles size={14} /> GENERATOR
            </button>
            <button
              onClick={() => { setActiveTab("saved"); setIsSidebarOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-wider transition-all rounded-lg ${activeTab === 'saved' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-gray-400'}`}
            >
              <Bookmark size={14} /> SAVED
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-wider transition-all rounded-lg ${activeTab === 'settings' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-gray-400'}`}
            >
              <SettingsIcon size={14} /> PRO
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-1">
            {activeTab === 'generator' && (
              <div className="space-y-6 mt-6">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Tema / Categoría (Escribe o Selecciona)</label>
            <div className="relative">
              <input 
                type="text"
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="E.g. Empires & Civilizations, Cyberpunk, Mitos..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-10 text-sm text-paper focus:outline-none focus:border-amber-accent/50 transition-colors"
              />
              <button 
                onClick={() => setCategory(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)])}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-amber-accent hover:bg-amber-accent/10 rounded-md transition-colors"
                title="Sugerencia Aleatoria"
              >
                <Dices size={16} />
              </button>
            </div>
            <datalist id="category-options">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>

            <div className="flex flex-wrap gap-1.5 mt-3 px-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1 mr-1">
                 <Lightbulb size={10} /> Ideas:
              </span>
              {["Secret Societies", "Medieval Legends", "Lost Cities", "Cyberpunk Histories"].map(s => (
                <button
                  key={s}
                  onClick={() => setCategory(s)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md border-dashed text-[10px] text-gray-300 transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`text-[10px] font-bold py-2.5 border rounded-lg transition-all ${duration === d ? 'bg-amber-accent text-black border-amber-accent shadow-md shadow-amber-accent/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      {d.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Format / Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  className={`text-[10px] font-bold py-2.5 border rounded-lg transition-all flex items-center justify-center gap-2 ${aspectRatio === "16:9" ? 'bg-amber-accent text-black border-amber-accent shadow-md shadow-amber-accent/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <LayoutTemplate size={14} /> YouTube (16:9)
                </button>
                <button
                  onClick={() => setAspectRatio("9:16")}
                  className={`text-[10px] font-bold py-2.5 border rounded-lg transition-all flex items-center justify-center gap-2 ${aspectRatio === "9:16" ? 'bg-amber-accent text-black border-amber-accent shadow-md shadow-amber-accent/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <div className="w-2.5 h-3.5 border-2 border-inherit rounded-sm"></div> Reels/Shorts (9:16)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Production Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ProductionStyle)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-paper focus:outline-none focus:border-amber-accent/50 transition-colors cursor-pointer"
                >
                  {STYLES.map(s => <option key={s} value={s} className="bg-[#050608]">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${language === l ? 'bg-amber-accent/20 text-amber-accent border-amber-accent/40 shadow-sm shadow-amber-accent/10' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-1 block mb-2">Keyword Guidance</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Constantinople..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-paper focus:outline-none focus:border-amber-accent/50 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-amber-accent text-black font-black py-4 rounded-xl hover:bg-amber-muted hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group amber-shadow uppercase tracking-widest text-xs"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Forge Epic Ideas</>
              )}
            </button>
            </div>
            )}

            {activeTab === 'saved' && (
              <div className="flex flex-col space-y-4 mt-6">
                {savedIdeas.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                     <Bookmark size={24} className="mx-auto mb-2 opacity-50" />
                     <p className="text-xs">No saved arcs</p>
                  </div>
                ) : (
                  savedIdeas.map((idea, idx) => (
                    <div key={idea.id} className="p-3 glass-card rounded-xl border border-white/5 hover:border-white/20 transition-all flex justify-between items-center group cursor-pointer" onClick={() => setActiveIdea(idea)}>
                       <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{idea.title}</h4>
                          <p className="text-[8px] text-gray-400 mt-1">{idea.metadata.category}</p>
                       </div>
                       <button
                         onClick={(e) => { e.stopPropagation(); toggleSave(idea); }}
                         className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400/20 rounded-md"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 mt-6">
                <HeyGenConfig />
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-amber-accent flex items-center gap-2 font-black px-1 block mb-2">
                    <Brain size={12} /> ElevenLabs API Key
                  </label>
                  <p className="text-[9px] text-gray-500 px-1 mb-2">Unlock cinematic AI voiceovers instead of browser TTS.</p>
                  <div className="relative">
                    <input 
                      type="password"
                      value={elevenLabsKey}
                      onChange={(e) => {
                         setElevenLabsKey(e.target.value);
                         localStorage.setItem("clio_elevenlabs_key", e.target.value);
                      }}
                      placeholder="sk-..."
                      className="w-full bg-black/40 border border-amber-accent/20 rounded-xl py-3 px-3 text-sm text-paper focus:outline-none focus:border-amber-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-amber-accent flex items-center gap-2 font-black px-1 block mb-2">
                    <VideoIcon size={12} /> Kling AI / Luma Key
                  </label>
                  <p className="text-[9px] text-gray-500 px-1 mb-2">Ultra-realistic motion generation override.</p>
                  <div className="relative">
                    <input 
                      type="password"
                      value={klingKey}
                      onChange={(e) => {
                         setKlingKey(e.target.value);
                         localStorage.setItem("clio_kling_key", e.target.value);
                      }}
                      placeholder="sk-..."
                      className="w-full bg-black/40 border border-amber-accent/20 rounded-xl py-3 px-3 text-sm text-paper focus:outline-none focus:border-amber-accent/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto pt-4 text-[9px] text-gray-500 text-center tracking-[0.3em] uppercase">
          Chronicle Archive v1.0
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 h-full">
          {/* Header Controls */}
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
             <div className="flex gap-4 md:gap-6 flex-wrap">
                <button 
                  onClick={() => setActiveTab("generator")}
                  className={`text-sm font-bold tracking-tight transition-all border-b-2 pb-1 ${activeTab === 'generator' ? 'border-amber-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {language === "AR" ? "مخزن الأفكار" : "Current Drafts"}
                </button>
                <button 
                  onClick={() => setActiveTab("divergence")}
                  className={`text-sm font-bold tracking-tight transition-all border-b-2 pb-1 ${activeTab === 'divergence' ? 'border-amber-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {language === "AR" ? "مختبر التاريخ البديل ⏳" : "Divergence Lab ⏳"}
                </button>
                <button 
                  onClick={() => setActiveTab("saved")}
                  className={`text-sm font-bold tracking-tight transition-all border-b-2 pb-1 ${activeTab === 'saved' ? 'border-amber-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {language === "AR" ? "الأرشيفات والمصادق" : "Archives"} ({savedIdeas.length})
                </button>
             </div>
             <div className="hidden sm:block">
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  {activeTab === "divergence" ? (language === "AR" ? "محاكاة الأكوان المتصدعة" : "DIVERGENT REALITIES SIMULATOR") : (language === "AR" ? "1 إلى 5 أفكار لكل طلب" : "1 to 5 Ideas Per Request")}
                </span>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'generator' ? (
              <motion.div
                key="gen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-8"
              >
                {generatedIdeas.length === 0 && !isGenerating ? (
                  <div className="py-32 text-center glass-card p-12 border-dashed flex flex-col items-center justify-center gap-6">
                    <HistoryIcon size={64} className="text-white/5" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white tracking-widest uppercase">The Archive is Silent</h3>
                       <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Tune the parameters in the scriptorium and forge thy next viral epic using our AI historians.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {generatedIdeas.map((idea, idx) => (
                      <IdeaCard 
                        key={idea.id} 
                        idea={idea} 
                        isSaved={isIdeaSaved(idea.id)} 
                        onToggleSave={() => toggleSave(idea)}
                        index={idx}
                        onStartProduction={startProduction}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'divergence' ? (
              <motion.div
                key="divergence-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full text-white"
              >
                <AlternateHistoryLab 
                  language={language}
                  onForgeIntoVideo={forgeDivergenceIntoVideo}
                />
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-12"
              >
                {savedIdeas.length === 0 ? (
                  <div className="py-32 text-center glass-card p-12 border-dashed flex flex-col items-center justify-center gap-6">
                    <Bookmark size={64} className="text-white/5" />
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white tracking-widest uppercase">Empty Archives</h3>
                       <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Thou hast not saved any chronicles yet. Return to the generator to begin thy collection.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {savedIdeas.map((idea, idx) => (
                      <IdeaCard 
                        key={idea.id} 
                        idea={idea} 
                        isSaved={true} 
                        onToggleSave={() => toggleSave(idea)} 
                        index={idx}
                        onStartProduction={startProduction}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {(isGenerating || isProducing) && (
            <CinematicLoading isGenerating={isGenerating} isProducing={isProducing} />
          )}
        </div>
      </main>
    </motion.div>
  );
}


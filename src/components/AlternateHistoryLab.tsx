import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Dices, 
  HelpCircle, 
  Activity, 
  Clock, 
  Compass, 
  TrendingUp, 
  Fingerprint, 
  Tv, 
  ArrowRight,
  Shield, 
  Cpu, 
  Heart, 
  Leaf,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Language } from "../types";
import { generateAlternateHistory, AlternateHistoryProject, AlternateTimelineNode } from "../services/geminiService";

interface AlternateHistoryLabProps {
  language: Language;
  onForgeIntoVideo: (project: AlternateHistoryProject) => void;
}

const PRESETS: Record<Language, { title: string; prompt: string; desc: string }[]> = {
  AR: [
    {
      title: "انتصار المحور ⚔️",
      prompt: "ماذا لو خسرت قوات الحلفاء الحرب العالمية الثانية وسيطرت ألمانيا واليابان على خريطة العالم بأكملها وقسمتا القارات؟",
      desc: "سيناريو ديستوبي يستعرض تقاسيم القوى العظمى وتبخر الحريات الفردية وتطور تكنولوجيا عسكرية بديلة."
    },
    {
      title: "خلود روما 🏛️",
      prompt: "ماذا لو لم تسقط الإمبراطورية الرومانية مطلقاً، وصمدت تحت راية قياصرتها وازدهرت تكنولوجياً وثقافياً واجتماعياً حتى وصلت لغزو الفضاء في العصر الحديث؟",
      desc: "مزيج مذهل من الهندسة الكلاسيكية العتيقة، المدن الرخامية المعلقة، وسفن فضاء رومانية عظيمة."
    },
    {
      title: "بلاط الشهداء 🕌",
      prompt: "ماذا لو انتصر المسلمون في معركة بلاط الشهداء بقيادة عبد الرحمن الغافقي وفتحوا باريس وشمال أوروبا بأكمله لتأسيس النهضة الإسلامية الأوروبية مبكراً؟",
      desc: "استكشاف نهضة علمية مذهلة وقباب أندلسية تزين شوارع باريس ولندن القرون الوسطى."
    },
    {
      title: "كهرباء الأهرامات ⚡",
      prompt: "ماذا لو نجح الفراعنة قدماء المصريين في تسخير الطاقة الكهربائية الحيوية وبناء محركات بخارية ثقيلة لتشغيل الرافعات وتطوير إضاءة منزلية داخل الأهرامات؟",
      desc: "عالم ستيمبانك فرعوني مذهل يدمج الطقوس المقدسة مع المولدات النحاسية وتكنولوجيات النيل العظيمة."
    }
  ],
  EN: [
    {
      title: "Axis Dominance ⚔️",
      prompt: "What if the Allied forces lost World War II, and Germany and Japan carved up the entire globe into partition zones?",
      desc: "A gritty speculative look at a dystopian division of superpowers, rapid alternative military technology, and absolute total controls."
    },
    {
      title: "Eternal Rome 🏛️",
      prompt: "What if the Roman Empire never fell, holding tight under Caesars to conquer the space age with marble spacecrafts and ancient senate rules?",
      desc: "A breathtaking universe blending classical architectures with vacuum engines, hover chariots, and solar conquest."
    },
    {
      title: "Tours Expansion 🕌",
      prompt: "What if the Battle of Tours was won by the Umayyad armies, leading to the rapid islamicization of medieval Paris and London?",
      desc: "A rich narrative of golden-era scientific academies, astro-libraries, and gorgeous Cordoban rib vaults scaling northern europe."
    },
    {
      title: "Pharaonic Steam ⚡",
      prompt: "What if Ancient Egypt discovered electricity and harnessed copper-wired steam engines to illuminate temples and automate Nile sailing?",
      desc: "An epic Egyptian Steampunk aesthetic fusing micro-circuits into golden obelisks and copper electric scarabs."
    }
  ],
  ES: [
    {
      title: "Dominio del Eje ⚔️",
      prompt: "¿Qué pasaría si las fuerzas aliadas perdieran la Segunda Guerra Mundial y Alemania y Japón dividieran el mundo entero en zonas de ocupación?",
      desc: "Una mirada especulativa a una sombría división mundial con tecnología militar alternativa extrema."
    },
    {
      title: "Roma Eterna 🏛️",
      prompt: "¿Qué pasaría si el Imperio Romano nunca hubiera caído, floreciendo hasta alcanzar la era espacial con naves espaciales de mármol y senadores clásicos?",
      desc: "Fusión de arquitectura clásica y motores cuánticos, cuadrigas flotantes y colonización solar."
    },
    {
      title: "Preservación de Alejandría 📚",
      prompt: "¿Qué pasaría si la Gran Biblioteca de Alejandría nunca hubiera sido incendiada, acelerando el renacimiento científico global por más de un milenio?",
      desc: "Un mundo de computación medieval y viajes interestelares iniciados en el s. XII impulsados por sabiduría antigua."
    },
    {
      title: "Egipto Steampunk ⚡",
      prompt: "¿Qué pasaría si los antiguos egipcios descubrieran pilas eléctricas y motores de vapor para automatizar la construcción de pirámides?",
      desc: "Estilo steampunk egipcio con dínamos de cobre incrustados en obelisks dorados y jeroglíficos energizados."
    }
  ],
  FR: [
    {
      title: "Hégémonie de l'Axe ⚔️",
      prompt: "Et si les forces alliées avaient perdu la Seconde Guerre mondiale, laissant l'Allemagne et le Japon diviser les continents en zones d'occupation militaire ?",
      desc: "Scénario uchronique sombre décrivant un ordre impitoyable et des technologies oppressives alternatives."
    },
    {
      title: "Rome Éternelle 🏛️",
      prompt: "Et si l'Empire romain n'était jamais tombé, conservant ses césars et son sénat pour conquérir l'espace avec des astronefs en marbre et des légions orbitales ?",
      desc: "Un univers mêlant l'esthétique classique antique et la technologie spatiale de pointe."
    },
    {
      title: "L'Islam d'Europe 🕌",
      prompt: "Et si la bataille de Poitiers avait été remportée par le califat omeyyade, établissant une renaissance scientifique et architecturale à Paris et Londres ?",
      desc: "Bibliothèques colossales, académies d'astronomie médiévale et coupoles andalouses en pays scandinave."
    },
    {
      title: "Égypte Électrique ⚡",
      prompt: "Et si l'Égypte antique avait découvert l'électricité et conçu des machines à vapeur en cuivre pour illuminer les temples sacrés ?",
      desc: "Un style steampunk pharaonique mêlant pyramides câblées, scarabées de cuivre chargés et dômes sacrés."
    }
  ]
};

const LAB_TEXTS = {
  AR: {
    heading: "مختبر التاريخ البديل ⏳",
    subheading: "حطّم جدار الزمن محاكياً عوالم متصدعة وأحداثاً معكوسة لصناعة وثائقي مذهل",
    inputLabel: "اكتب سيناريو التصدع التاريخي (أو اختر قالباً جاهزاً)",
    placeholder: "ماذا لو بقيت مكتبة الإسكندرية قائمة ولم تحترق مطلقاً؟...",
    chaosLabel: "تأثير الفراشة (درجة الفوضى الجيوسياسية)",
    chaosLow: "خفيف - تصدعات إقليمية محصورة",
    chaosMed: "متوسط - موجات تغيير دولية متدافعة",
    chaosHigh: "مدمر - إعادة رصف كاملة للجغرافيا والوعي",
    eraLabel: "الحقبة الزمنية المستهدفة للمحاكاة",
    eraDecades: "العقود الأولى - تداعيات مباشرة",
    eraCentury: "بعد قرن كامل - استقرار النظام الجديد",
    eraModern: "العصر الحديث البديل - واقع موازٍ معاصر",
    vibeLabel: "مزاج الطابع السردي والبصري",
    vibeMystery: "Speculative / غموض وتشويق تاريخي",
    vibeDystopia: "Grimdark / ديستوبيا وقمع عسكري مظلم",
    vibeUtopia: "Solarpunk / يوتوبيا علمية وتناغم طبيعي",
    btnSimulate: "تحفيز نسيج الزمن البديل 🧬",
    btnSimulating: "يتم فك طلاسم التاريخ ومحاكاة الأكوان...",
    baselineLabel: "الواقع التاريخي الحقيقي المقابل",
    catalystLabel: "ميكانيكية التصدع التاريخي المفصلية",
    statsTitle: "لوحة معايير العالم البديل 📊",
    statsDesc: "تقييم تحليلي دقيق لمدى تطور هذا الخط الزمني مقارنة بحاضرنا المعاصر",
    statStability: "الاستقرار والنظام الجيوسياسي",
    statTech: "السرعة العلمية والتكنولوجية",
    statFreedom: "الحريات الفردية وحقوق الإنسان",
    statEnv: "التوازن البيئي وتناغم الطبيعة",
    timelineHeading: "مسار التشعبات التاريخية البديلة",
    socialLabel: "الحياة اليومية للبشر",
    btnForge: "صناعة فيديو للملحمة الموازية 🎬",
    btnForgeDesc: "تصدير السكربت والمسار فوراً لمحرك الفيديو والسيناريوهات لبدء رصف وتحريك اللقطات"
  },
  EN: {
    heading: "Temporal Divergence Lab ⏳",
    subheading: "Shatter historical constants, simulate alternate timelines, and forge epic documentaries.",
    inputLabel: "Describe your counterfactual twist (or choose a preset matrix)",
    placeholder: "What if the Library of Alexandria never burned down?...",
    chaosLabel: "Butterfly Effect (Geopolitical Chaos Chaos)",
    chaosLow: "Localized - subtle and contained ripples",
    chaosMed: "Waves - regional shifts and cascading alliances",
    chaosHigh: "Cataclysmic - complete structural overwrite of human memory",
    eraLabel: "Target Era Zoom",
    eraDecades: "First Decades - immediate fallout and military skirmishes",
    eraCentury: "Decades Later - stabilization of the new order",
    eraModern: "Contemporary Alternate - current day with alternate tech/states",
    vibeLabel: "Narrative Mood & Visual Filter",
    vibeMystery: "Speculative / Suspense and intense research speculation",
    vibeDystopia: "Grimdark / Authoritarian control and alternative industries",
    vibeUtopia: "Aetherpunk / Accelerated ecological harmony and bright futures",
    btnSimulate: "Simulate Temporal Divergence 🧬",
    btnSimulating: "Rerouting flow of time, consult speculates...",
    baselineLabel: "Baseline Real History Compare",
    catalystLabel: "The Historic Snapping point",
    statsTitle: "Alternate World Metrics 📊",
    statsDesc: "Analytical projection of how this timeline stacks up against our baseline current year.",
    statStability: "Geopolitical Stability & Order",
    statTech: "Scientific & Technological Velocity",
    statFreedom: "Individual Liberties & Human Equity",
    statEnv: "Environmental Balance & Earth Care",
    timelineHeading: "Chronological Sequence of Alternate Ripples",
    socialLabel: "Everyday Human Experience",
    btnForge: "Forge Video Production 🎬",
    btnForgeDesc: "Exhaustively format this timeline into continuous acts & visual scenes to stitch in the compiler."
  },
  ES: {
    heading: "Laboratorio de Divergencia Temporal ⏳",
    subheading: "Rompe constantes históricas, simula universos ucrónicos y crea producciones espectaculares.",
    inputLabel: "Describe tu anomalía histórica (o elige una matriz)",
    placeholder: "¿Qué pasaría si la imprenta se inventara tres siglos antes?...",
    chaosLabel: "Efecto Mariposa (Nivel de Caos Geopolítico)",
    chaosLow: "Leve - fisuras locales limitadas",
    chaosMed: "Moderado - oleadas de cambio internacional",
    chaosHigh: "Extremo - reconstrucción absoluta de la geografía mundial",
    eraLabel: "Progreso de la Era Temporal",
    eraDecades: "Primeras Décadas - impacto directo inmediato",
    eraCentury: "Medio Siglo Después - consolidación del nuevo orden",
    eraModern: "Era Moderna Alternativa - mundo de hoy bajo otra línea",
    vibeLabel: "Tono Narrativo y Estilo",
    vibeMystery: "Especulativo / Suspenso e investigación histórica",
    vibeDystopia: "Grimdark / Control absoluto militar, corporativo o imperial",
    vibeUtopia: "Aetherpunk / Armonía científica acelerada con la Tierra",
    btnSimulate: "Simular Divergencia Temporal 🧬",
    btnSimulating: "Reescribiendo anales del destino...",
    baselineLabel: "Contraste con la Historia Real",
    catalystLabel: "Mecanismo de Ruptura Histórica",
    statsTitle: "Métricas del Mundo Alternativo 📊",
    statsDesc: "Evaluación analítica del estado de este universo alternativo comparado con el nuestro.",
    statStability: "Estabilidad Geopolítica y Orden",
    statTech: "Velocidad Científica y Tecnológica",
    statFreedom: "Libertades Individuales y Equidad",
    statEnv: "Equilibrio Ecológico y Armonía Natural",
    timelineHeading: "Secuencia Cronológica de Impactos",
    socialLabel: "Vida Humana Cotidiana",
    btnForge: "Forjar Producción de Video 🎬",
    btnForgeDesc: "Exportar cronología y narrativa de manera directa al simulador multicapas de video."
  },
  FR: {
    heading: "Laboratoire de Divergence Temporelle ⏳",
    subheading: "Brisez le cours du temps, simulez des uchronies fascinantes et forgez des films d'histoire.",
    inputLabel: "Décrivez votre anomalie historique (ou choisissez un modèle)",
    placeholder: "Et si l'empire d'Alexandre le Grand avait survécu à sa mort ?...",
    chaosLabel: "Effet Papillon (Niveau de Chaos Géo-temporel)",
    chaosLow: "Faible - remous locaux et discrets",
    chaosMed: "Modéré - vagues de réformes régionales dominantes",
    chaosHigh: "Extrême - refondation absolue des langues et frontières",
    eraLabel: "Progression Temporelle de l'Uchronie",
    eraDecades: "Premières Décades - répercussions directes et tensions",
    eraCentury: "Un Siècle Après - stabilisation de la nouvelle puissance",
    eraModern: "Époque Moderne Alternative - notre présent dominé par l'uchronie",
    vibeLabel: "Filtre Narratif & Atmosphère",
    vibeMystery: "Spéculatif / Exploration scientifique et suspense uchronique",
    vibeDystopia: "Grimdark / Autoritarisme de fer et ère industrielle sombre",
    vibeUtopia: "Aetherpunk / Progrès scientifique bienveillant et solarpunk éco",
    btnSimulate: "Simuler la Divergence 🧬",
    btnSimulating: "Recalcul du destin mondial en cours...",
    baselineLabel: "Comparatif Ligne Temporelle Réelle",
    catalystLabel: "Le Point de Rupture Historique",
    statsTitle: "Indicateurs du Monde Alternatif 📊",
    statsDesc: "Projection analytique du développement de cette ligne par rapport au présent réel.",
    statStability: "Stabilité Géopolitique & Cohésion",
    statTech: "Vitesse Scientifique & Technologique",
    statFreedom: "Libertés Individuelles & Droits Humains",
    statEnv: "Équilibre Environnemental & Écologie",
    timelineHeading: "Séquence Chronologique des Ondes de Choc",
    socialLabel: "Expérience Humaine au Quotidien",
    btnForge: "Forger Documentaire Vidéo 🎬",
    btnForgeDesc: "Transférer directement ce script et ces scènes illustrées dans le monteur vidéo."
  }
};

export function AlternateHistoryLab({ language, onForgeIntoVideo }: AlternateHistoryLabProps) {
  const [prompt, setPrompt] = useState("");
  const [chaosLevel, setChaosLevel] = useState<"minimal" | "moderate" | "extreme">("moderate");
  const [eraProgression, setEraProgression] = useState<"decades" | "century" | "modern">("modern");
  const [vibe, setVibe] = useState<"mystery" | "dystopia" | "utopia">("dystopia");

  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<AlternateHistoryProject | null>(null);

  const texts = LAB_TEXTS[language] || LAB_TEXTS.EN;
  const presets = PRESETS[language] || PRESETS.EN;

  const handleSimulate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setProject(null);
    try {
      const data = await generateAlternateHistory(prompt, chaosLevel, eraProgression, vibe, language);
      setProject(data);
    } catch (err) {
      console.error(err);
      alert(language === "AR" ? "فشل الاتصال بخادم المحاكاة التاريخية. يرجى مراجعة إعدادات مفتاح Gemini." : "Chronicle Simulation failed. Please check your Gemini API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (val: number) => {
    if (val >= 75) return "bg-green-500 shadow-green-500/30";
    if (val >= 45) return "bg-amber-accent shadow-amber-accent/30";
    return "bg-red-500 shadow-red-500/30";
  };

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* Introduction Header */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row shadow-[0_4px_30px_rgba(0,0,0,0.4)] md:items-center justify-between gap-6 bg-gradient-to-br from-black/60 to-white/[0.01]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-accent">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Alpha Temporal Scriptorium</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
            {texts.heading}
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            {texts.subheading}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-accent/10 border border-amber-accent/20 flex items-center justify-center text-amber-accent animate-pulse shrink-0">
          <Clock size={22} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 bg-black/40">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-3 px-1">
                {texts.inputLabel}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={texts.placeholder}
                rows={4}
                dir={language === "AR" ? "rtl" : "ltr"}
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-accent/40 focus:ring-1 focus:ring-amber-accent/20 transition-all placeholder:text-gray-700 min-h-[100px] custom-scrollbar"
              />
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-[8px] font-bold tracking-widest text-amber-accent uppercase block px-1 flex items-center gap-1.5">
                <Dices size={12} /> {language === "AR" ? "أو حمل قالباً مشحوناً" : "Or load a divergent seed"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(preset.prompt);
                    }}
                    className="p-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-all bg-white/[0.02] border border-white/5 hover:border-amber-accent/25 hover:bg-amber-accent/[0.02] rounded-xl flex flex-col justify-between h-[100px]"
                  >
                    <span className="text-[9px] font-black text-white font-mono uppercase block">{preset.title}</span>
                    <span className="text-[8px] text-gray-500 font-medium line-clamp-3 leading-tight">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Harmony / Chaos Control */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block px-1">
                {texts.chaosLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                {(["minimal", "moderate", "extreme"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setChaosLevel(lvl)}
                    className={`py-2 px-1 text-[8px] sm:text-[9px] rounded-lg font-bold tracking-tight uppercase transition-all ${chaosLevel === lvl ? 'bg-amber-accent text-black border border-amber-accent/20 shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
                  >
                    {lvl === "minimal" ? (language === "AR" ? "خفيف" : "Minimal") :
                     lvl === "moderate" ? (language === "AR" ? "متوسط" : "Moderate") :
                     (language === "AR" ? "عنيف" : "Extreme")}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-gray-500 px-1 italic">
                {chaosLevel === "minimal" ? texts.chaosLow :
                 chaosLevel === "moderate" ? texts.chaosMed :
                 texts.chaosHigh}
              </p>
            </div>

            {/* Era Progression */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block px-1">
                {texts.eraLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                {(["decades", "century", "modern"] as const).map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setEraProgression(prog)}
                    className={`py-2 px-1 text-[8px] sm:text-[9px] rounded-lg font-bold tracking-tight uppercase transition-all ${eraProgression === prog ? 'bg-amber-accent text-black border border-amber-accent/20 shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
                  >
                    {prog === "decades" ? (language === "AR" ? "عقود أولى" : "Decades") :
                     prog === "century" ? (language === "AR" ? "قرن كامل" : "Century") :
                     (language === "AR" ? "معاصر" : "Modern")}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-gray-500 px-1 italic">
                {eraProgression === "decades" ? texts.eraDecades :
                 eraProgression === "century" ? texts.eraCentury :
                 texts.eraModern}
              </p>
            </div>

            {/* Vibe Selector */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block px-1">
                {texts.vibeLabel}
              </label>
              <div className="grid grid-cols-3 gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                {(["mystery", "dystopia", "utopia"] as const).map((vb) => (
                  <button
                    key={vb}
                    onClick={() => setVibe(vb)}
                    className={`py-2 px-1 text-[8px] sm:text-[9px] rounded-lg font-bold tracking-tight uppercase transition-all ${vibe === vb ? 'bg-amber-accent text-black border border-amber-accent/20 shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
                  >
                    {vb === "mystery" ? (language === "AR" ? "مخفي" : "Speculative") :
                     vb === "dystopia" ? (language === "AR" ? "صعب" : "Grimdark") :
                     (language === "AR" ? "مثالي" : "Aether")}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-gray-500 px-1 italic">
                {vibe === "mystery" ? texts.vibeMystery :
                 vibe === "dystopia" ? texts.vibeDystopia :
                 texts.vibeUtopia}
              </p>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-amber-accent text-black hover:bg-amber-muted disabled:opacity-40 disabled:cursor-not-allowed uppercase font-black py-4 rounded-2xl tracking-widest text-xs transition-all active:scale-95 shadow-md shadow-amber-accent/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>{texts.btnSimulating}</span>
                </>
              ) : (
                <>
                  <Compass size={16} />
                  <span>{texts.btnSimulate}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Results Sandbox */}
        <div className="lg:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-lab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full h-[500px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 bg-black/20 gap-4"
              >
                <div className="relative w-16 h-16">
                  {/* Floating matrix grids */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-4 border-amber-accent/20 border-t-amber-accent rounded-full"
                  />
                  <div className="absolute inset-2 border border-white/5 animate-ping rounded-full" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-widest font-black text-amber-accent animate-pulse">
                    {language === "AR" ? "جاري محاكاة الفراشة الجغرافية..." : "Simulating temporal turbulence..."}
                  </h4>
                  <p className="text-[10px] text-gray-500 max-w-xs font-medium uppercase">
                    {language === "AR" ? "يتم تقييم تغيرات التحالفات، رصف الجداول الزمنية، وحساب مؤشرات البقاء..." : "Evaluating geopolitical collapse, generating sequences, balancing carbon levels."}
                  </p>
                </div>
              </motion.div>
            ) : project ? (
              <motion.div
                key="timeline-dashboard"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Result Title */}
                <div className="glass-card p-6 rounded-3xl border border-amber-accent/20 relative shadow-lg bg-[#0e0f11]">
                  <h3 className="text-lg md:text-xl font-black text-amber-accent leading-snug">
                    {project.title}
                  </h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                    <div className="space-y-1">
                      <span className="block text-[8px] text-gray-500 uppercase font-black text-[9px]">{texts.catalystLabel}</span>
                      <p className="text-gray-300 font-medium leading-relaxed" dir={language === "AR" ? "rtl" : "ltr"}>
                        {project.catalystExplanation}
                      </p>
                    </div>
                    <div className="space-y-1 md:border-l md:border-dashed md:border-white/10 md:pl-4">
                      <span className="block text-[8px] text-gray-500 uppercase font-black text-[9px]">{texts.baselineLabel}</span>
                      <p className="text-gray-400 italic leading-relaxed" dir={language === "AR" ? "rtl" : "ltr"}>
                        {project.realBaselineCompare}
                      </p>
                    </div>
                  </div>
                </div>

                {/* World Indicators */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 bg-black/40">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-1.5">
                      <Activity size={12} className="text-amber-accent" /> {texts.statsTitle}
                    </h4>
                    <span className="block text-[8px] text-gray-500 uppercase font-bold">{texts.statsDesc}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Geopolitics Order */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-gray-400 uppercase flex items-center gap-1"><Shield size={10} /> {texts.statStability}</span>
                        <span className="text-amber-accent font-mono font-black">{project.metrics.stability}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.metrics.stability}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full rounded-full ${getMetricColor(project.metrics.stability)}`}
                        />
                      </div>
                    </div>

                    {/* Technological velocity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-gray-400 uppercase flex items-center gap-1"><Cpu size={10} /> {texts.statTech}</span>
                        <span className="text-amber-accent font-mono font-black">{project.metrics.technology}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.metrics.technology}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full rounded-full ${getMetricColor(project.metrics.technology)}`}
                        />
                      </div>
                    </div>

                    {/* Civil liberties */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-gray-400 uppercase flex items-center gap-1"><Heart size={10} /> {texts.statFreedom}</span>
                        <span className="text-amber-accent font-mono font-black">{project.metrics.freedom}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.metrics.freedom}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full rounded-full ${getMetricColor(project.metrics.freedom)}`}
                        />
                      </div>
                    </div>

                    {/* Environment stability */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-gray-400 uppercase flex items-center gap-1"><Leaf size={10} /> {texts.statEnv}</span>
                        <span className="text-amber-accent font-mono font-black">{project.metrics.environment}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.metrics.environment}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full rounded-full ${getMetricColor(project.metrics.environment)}`}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 font-medium border-t border-white/5 pt-3 leading-relaxed" dir={language === "AR" ? "rtl" : "ltr"}>
                    {project.metricsExplanation}
                  </p>
                </div>

                {/* Timeline Node Sequential Lists */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-white tracking-widest pl-1">{texts.timelineHeading}</h4>
                  
                  <div className="relative pl-3 md:pl-6 border-l border-white/10 space-y-6">
                    {project.nodes.map((node, index) => {
                      const imageSeed = index * 42 + 1092;
                      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
                        node.visualPrompt + ". Cinematic historical documentary, highly detailed, dramatic atmospheric lighting, authentic vintage styling, no words"
                      )}?width=720&height=400&nologo=true&seed=${imageSeed}&enhance=true`;

                      return (
                        <div key={index} className="relative group/node text-xs">
                          {/* Dot Badge */}
                          <div className="absolute -left-[19px] md:-left-[31px] top-1.5 w-3 h-3 rounded-full bg-amber-accent shadow-[0_0_10px_rgba(251,191,36,0.3)] border-2 border-black z-20" />
                          
                          <div className="glass-card p-4 rounded-2xl border border-white/5 hover:border-white/10 bg-[#07070a]/90 transition-all space-y-3 shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-accent/10 border border-amber-accent/20 rounded-md text-[8px] font-black text-amber-accent font-mono tracking-widest uppercase">
                                  {node.era}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 font-mono">
                                  [{node.year}]
                                </span>
                              </div>
                              <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{node.title}</h5>
                            </div>

                            <p className="text-gray-300 leading-relaxed font-normal" dir={language === "AR" ? "rtl" : "ltr"}>
                              {node.description}
                            </p>

                            {/* Node Image Box */}
                            <div className="aspect-[16/9] w-full max-w-md mx-auto relative rounded-xl overflow-hidden border border-white/5 bg-black/40">
                              <img 
                                src={imageUrl} 
                                alt={node.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/node:scale-102 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                              <span className="absolute bottom-2 left-2 right-2 text-[8px] sm:text-[9px] font-mono text-white/50 bg-black/50 backdrop-blur-md p-1.5 rounded border border-white/5 max-h-12 overflow-hidden truncate">
                                PROMPT: {node.visualPrompt}
                              </span>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                              <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest">{texts.socialLabel}</span>
                              <p className="text-[10px] text-gray-400 leading-snug mt-1" dir={language === "AR" ? "rtl" : "ltr"}>
                                {node.societalImpact}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Massive Action Scriptorium Anchor Forge */}
                <div className="p-6 md:p-8 rounded-3xl border border-amber-accent/30 bg-gradient-to-br from-[#120e03] to-[#040508] relative overflow-hidden space-y-4 amber-shadow">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-black text-amber-accent tracking-widest flex items-center gap-1.5">
                      <Tv size={14} className="animate-bounce" /> {texts.btnForge}
                    </h4>
                    <p className="text-[10px] text-white/60">
                      {texts.btnForgeDesc}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onForgeIntoVideo(project)}
                    className="w-full py-4 bg-amber-accent hover:bg-amber-muted text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    <span>{language === "AR" ? "تصدير وبدء خَبْز الملحمة البديلة! ⚙️" : "Forge Counterfactual Chronicles Video!"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-lab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full h-[500px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 bg-black/10 gap-4"
              >
                <HelpCircle size={44} className="text-white/10" />
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-widest font-black text-gray-500">
                    {language === "AR" ? "المحاكاة معبأة ومستعدة" : "Ready for Temporal Interference"}
                  </h4>
                  <p className="text-[10px] text-gray-600 max-w-sm font-medium leading-relaxed">
                    {language === "AR" ? "اختر أحد القوالب السريعة أو اكتب تصدعاً تاريخياً خاصاً بك في لوحة الإعدادات الجانبية لتشغيل المحاكي." : "Input a speculative historical pivot or select one of our premium pre-configured nodes to ignite the timeline compiler."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

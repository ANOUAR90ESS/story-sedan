/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Category, Duration, ProductionStyle, Language, Idea, Scene, DURATION_METRICS } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const IDEA_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "An epic clickbait-style title" },
      hook: { type: Type.STRING, description: "The opening sentence designed to grab attention immediately" },
      rareAngle: { type: Type.STRING, description: "A unique and unexpected perspective on the topic" },
      structure: {
        type: Type.OBJECT,
        properties: {
          hook_narration: { type: Type.STRING, description: "Dramatic opening narration (min. 200 words)" },
          act1: { type: Type.STRING, description: "Setup of conflict" },
          crisis: { type: Type.STRING, description: "Maximum tension" },
          climax: { type: Type.STRING, description: "Resolution" },
          legacy: { type: Type.STRING, description: "Long-term impact" },
        },
        required: ["hook_narration", "act1", "crisis", "climax", "legacy"],
      },
      visuals: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Suggested cinematic visual elements"
      },
      historicalFacts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Two or three impactful historical facts"
      },
    },
    required: ["title", "hook", "rareAngle", "structure", "visuals", "historicalFacts"],
  },
};

const PRODUCTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullScript: { type: Type.STRING, description: "The complete narration text for the entire video" },
    visualStyle: { type: Type.STRING, description: "A few keywords describing the global aesthetic: lighting (e.g., 'Golden hour'), palette (e.g., 'Teal and Orange'), camera (e.g., 'Anamorphic lens')" },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "MM:SS format" },
          durationSeconds: { type: Type.NUMBER, description: "Duration based on speaking time AND emotional pacing. MUST BE MAXIMUM 15 SECONDS." },
          description: { type: Type.STRING, description: "What is happening visually" },
          narration: { type: Type.STRING, description: "The specific voiceover for this scene" },
          visualPrompt: { type: Type.STRING, description: "A highly descriptive prompt for high-end image generation" },
          motionType: { 
            type: Type.STRING, 
            enum: ["zoom_in", "zoom_out", "pan_horizontal", "pan_vertical", "push_in", "action_shake", "slow_drift"],
            description: "Dynamic camera motion matching the emotional arc" 
          }
        },
        required: ["timestamp", "durationSeconds", "description", "narration", "visualPrompt", "motionType"],
      },
    },
  },
  required: ["fullScript", "visualStyle", "scenes"],
};

export async function generateIdeas(
  category: Category,
  duration: Duration,
  productionStyle: ProductionStyle,
  language: Language,
  count: number = 3,
  keyword?: string
): Promise<Partial<Idea>[]> {
  const metrics = DURATION_METRICS[duration];
  
  const prompt = `Generate ${count} high-quality, epic YouTube video ideas for the channel focusing on "${category}".
  Target Duration Rank: ${duration} (MINIMUM Word Count Required: ${metrics.minWords} words for a full script).
  Production Style: ${productionStyle}
  Language: ${language}
  ${keyword ? `Specific keyword/topic for guidance: "${keyword}"` : ""}

  CRITICAL INSTRUCTIONS FOR NARRATIVE DEPTH:
  - For a ${duration} video, the detail in each Act must be EXTENSIVE.
  - Act I (Setup): Provide an exhaustive atmospheric setup (Historical context, socio-political atmosphere).
  - Crisis: Elaborate on multiple complex layers of tension and key actors in extreme detail.
  - Climax: Describe the resolution with cinematic intensity.
  - Legacy: Connect the events to global history and modern times with profound insight.
  
  Total expected detail level: Each structure section should be multiple paragraphs long to ensure the target duration is achievable.
  Language: ${language}.
  Return the response as a JSON array matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: IDEA_SCHEMA,
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    const rawIdeas = JSON.parse(jsonStr);

    return rawIdeas.map((idea: any) => ({
      ...idea,
      id: Math.random().toString(36).substr(2, 9),
      metadata: {
        category,
        duration,
        style: productionStyle,
        language,
        timestamp: Date.now(),
      },
    }));
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
}

export async function generateProductionDetails(idea: Idea): Promise<{ fullScript: string, visualStyle: string, scenes: Scene[] }> {
  const metrics = DURATION_METRICS[idea.metadata.duration];

  const prompt = `Act as an expert documentary producer. For the following video idea, generate a complete script and a detailed scene breakdown.
  Target Duration: ${idea.metadata.duration} (${metrics.minWords}-${metrics.maxWords} words).
  Title: ${idea.title}
  Language: ${idea.metadata.language}
  
  STRICT PRODUCTION REQUIREMENTS:
  1. Full Script: Write a massive, detailed, and dramatic narrator script. It MUST be extremely long to hit the ${idea.metadata.duration} target. DO NOT SUMMARIZE OR SHORTEN THE SCRIPT.
  2. Visual Style: Define a global visual aesthetic for all images.
  3. Scene Breakdown:
     - You MUST break the ENTIRE full script into scenes.
     - Generate as many scenes as necessary to cover the *complete* full script (EXPECTED: 80-200 scenes). Do NOT truncate the story just because there are many scenes.
     - 'timestamp': Start time in MM:SS format.
     - 'durationSeconds': Exact duration. MUST BE 15 SECONDS OR LESS. If a part of the narration takes longer than 15s, break it down into multiple scenes.
     - 'description': Visual action description.
     - 'narration': The continuous segment of the full script that matches this scene.
     - 'visualPrompt': A MASTERPIECE visual prompt.
     - 'motionType': Dynamic camera motion.
  
  Idea Context:
  - Hook Summary: ${idea.hook}
  - Rare Angle: ${idea.rareAngle}
  - Opening Narration: ${idea.structure.hook_narration}
  - Act 1: ${idea.structure.act1}
  - Crisis: ${idea.structure.crisis}
  - Climax: ${idea.structure.climax}
  - Legacy: ${idea.structure.legacy}
  
  IMPORTANT: Output MUST be in ${idea.metadata.language}.
  Total words must exceed ${metrics.minWords}.
  Return the response as JSON matching the PRODUCTION_SCHEMA.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PRODUCTION_SCHEMA,
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating production details:", error);
    throw error;
  }
}

export async function generateScenesAPI(
  prompt: string, 
  count: number = 3
): Promise<{ scenes: Scene[] }> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique scene ID (e.g., scene_1)" },
            timestamp: { type: Type.STRING },
            durationSeconds: { type: Type.NUMBER, description: "Duration matching emotional pacing. MUST BE MAXIMUM 15 SECONDS. If longer is needed, break into multiple scenes." },
            description: { type: Type.STRING, description: "Visual description" },
            narration: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            motionType: { 
              type: Type.STRING, 
              enum: ["zoom_in", "zoom_out", "pan_horizontal", "pan_vertical", "push_in", "action_shake", "slow_drift"],
              description: "Dynamic motion based on scene tension/emotion"
            }
          },
          required: ["id", "timestamp", "durationSeconds", "description", "narration", "visualPrompt", "motionType"],
        }
      }
    },
    required: ["scenes"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} video scenes based on this prompt: "${prompt}". Suggest dynamic camera motions and scene durations based on the implied emotional arc/tension. Scene 'durationSeconds' MUST be 15s or less. If a scene needs more time, break it down. DO NOT skip or summarize any part of the prompt just to save scenes. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonStr = response.text?.trim() || "{\"scenes\":[]}";
    const data = JSON.parse(jsonStr) as { scenes: Scene[] };
    return {
      scenes: data.scenes.map(s => ({
        ...s,
        video_url: "",
        voice_url: "",
        music_url: ""
      }))
    };
  } catch (error) {
    console.error("Error generating standalone scenes:", error);
    return { scenes: [] };
  }
}

export async function generateSceneImage(prompt: string, visualStyle?: string, aspectRatio?: "16:9" | "9:16", engine?: string): Promise<string> {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const fullPrompt = `${prompt}. ${visualStyle || "Cinematic historical documentary"}. highly detailed, 8k, epic lighting`;
    const dims = aspectRatio === "9:16" ? "width=720&height=1280" : "width=1280&height=720";
    
    // Pollinations model mapping
    let modelStr = "";
    if (engine) {
      // mapped internally if needed, normally chatgpt maps to dall-e-3
      if (engine === 'chatgpt') modelStr = "&model=dall-e-3";
      else if (engine === 'flux') modelStr = "&model=flux";
      else if (engine === 'gemini_3_1_pro') modelStr = "&model=flux"; // fallback since gemini isn't supported directly by pollinations image api
      else modelStr = `&model=${engine}`;
    }

    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?${dims}&nologo=true&seed=${seed}&enhance=true${modelStr}`;
  } catch (error) {
    console.error("Error generating scene image:", error);
    return "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1280";
  }
}

export interface AlternateTimelineNode {
  era: string;
  year: string;
  title: string;
  description: string;
  visualPrompt: string;
  societalImpact: string;
}

export interface AlternateHistoryProject {
  title: string;
  divergencePoint: string;
  catalystExplanation: string;
  realBaselineCompare: string;
  nodes: AlternateTimelineNode[];
  metrics: {
    stability: number;
    technology: number;
    freedom: number;
    environment: number;
  };
  metricsExplanation: string;
  epicNarration: string;
}

export async function generateAlternateHistory(
  eventPrompt: string,
  chaosLevel: "minimal" | "moderate" | "extreme",
  eraProgression: "decades" | "century" | "modern",
  vibe: "mystery" | "dystopia" | "utopia",
  language: Language
): Promise<AlternateHistoryProject> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A highly dramatic, cinematic alternate history title" },
      divergencePoint: { type: Type.STRING, description: "The central counterfactual question or statement" },
      catalystExplanation: { type: Type.STRING, description: "Detailed story of the catalyst or turning point where history snapped" },
      realBaselineCompare: { type: Type.STRING, description: "A quick contrast showing the real timeline history versus the snapping point" },
      nodes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            era: { type: Type.STRING, description: "E.g., Snapping Point, T+5 Years, T+50 Years, Alternative Modern" },
            year: { type: Type.STRING, description: "The alternate year number" },
            title: { type: Type.STRING, description: "Dramatic event or transformation title" },
            description: { type: Type.STRING, description: "Vivid, engaging description of how society, borders, or state changed" },
            visualPrompt: { type: Type.STRING, description: "Super detailed cinematic historical image prompt for image generators" },
            societalImpact: { type: Type.STRING, description: "Short summary statement of daily human life" }
          },
          required: ["era", "year", "title", "description", "visualPrompt", "societalImpact"]
        }
      },
      metrics: {
        type: Type.OBJECT,
        properties: {
          stability: { type: Type.INTEGER, description: "Score out of 100 for geopolitical order" },
          technology: { type: Type.INTEGER, description: "Score out of 100 for scientific progress/speed" },
          freedom: { type: Type.INTEGER, description: "Score out of 100 for human rights and democracy" },
          environment: { type: Type.INTEGER, description: "Score out of 100 for nature and safety" }
        },
        required: ["stability", "technology", "freedom", "environment"]
      },
      metricsExplanation: { type: Type.STRING, description: "Thoughtful summary explaining why the alternate timeline developed these score ratings" },
      epicNarration: { type: Type.STRING, description: "Exhaustive, epic, multiple-paragraph continuous documentary voiceover script suitable to be made into a full-scale video production (Minimum 500 words)." }
    },
    required: ["title", "divergencePoint", "catalystExplanation", "realBaselineCompare", "nodes", "metrics", "metricsExplanation", "epicNarration"]
  };

  const prompt = `Assume the role of an expert speculative historian and alternate history novelist.
  Simulate the alternate universe stemming from this historical divergence: "${eventPrompt}".
  
  Parameters for the simulation:
  - Chaos Level (Butterfly Effect Cascade): ${chaosLevel} (how drastically and quickly the butterfly effect disrupts unrelated historical structures)
  - Scale of Timeline Era: ${eraProgression} (how far down the lineage we explore: immediate decades, century after, or full alternative modern transition)
  - Narrative Tone Vibe: ${vibe} (mystery/speculative suspense, grimdark dystopia, or high-tech scientific utopia)
  - Target Language: ${language}
  
  Ensure all texts are high quality, dramatically narrated, and written strictly in "${language}".
  Generate exactly 4 sequence timeline nodes tracing this alternate history timeline sequentially:
    Node 1: The Snapping Point (T+0 Years)
    Node 2: The Aftermath Shockwaves (T+5 to T+10 Years)
    Node 3: The Hegemonic Legacy Shift (T+25 to T+50 Years)
    Node 4: The Ultimate Modern Diverged Reality (T+100+ Years)

  Provide detailed visualPrompts that describe specific setting assets, architecture aesthetics, and lighting without any embedded text.
  Provide an epicNarration script that reads like a professional, chilling, or awe-inspiring documentary narrator.

  Return response as JSON matching the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr) as AlternateHistoryProject;
  } catch (error) {
    console.error("Error simulating counterfactual timeline:", error);
    throw error;
  }
}

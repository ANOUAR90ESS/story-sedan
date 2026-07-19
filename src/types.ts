/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = string;

export type Duration = "20-40 min" | "40-60 min" | "90+ min";

export type ProductionStyle = "Cinematic" | "Documentary" | "Animation" | "Epic Narrated";

export type Language = "EN" | "ES" | "AR" | "FR";

export interface Scene {
  id?: string;
  locked?: boolean;
  timestamp: string; // e.g., "00:00"
  durationSeconds: number;
  description: string;
  narration: string;
  visualPrompt: string;
  motionType: "zoom_in" | "zoom_out" | "pan_horizontal" | "pan_vertical" | "push_in" | "action_shake" | "slow_drift";
  imageUrl?: string;
  videoUrl?: string;
  // Node-based fields
  video_url?: string;
  voice_url?: string;
  music_url?: string;
  subtitle?: string;
  duration?: number;
}

export type AspectRatio = "16:9" | "9:16";

export interface Idea {
  id: string;
  title: string;
  hook: string;
  rareAngle: string;
  visualStyle?: string; // Global visual consistency prompt
  selectedVoice?: string; // Stored narration voice profile ID
  fullScript?: string;
  scenes?: Scene[];
  structure: {
    hook_narration: string;
    act1: string;
    crisis: string;
    climax: string;
    legacy: string;
  };

  visuals: string[];
  historicalFacts: string[];
  metadata: {
    category: Category;
    duration: Duration;
    style: ProductionStyle;
    language: Language;
    aspectRatio?: AspectRatio;
    timestamp: number;
  };
}

export const SECTION_COLORS = {
  hook: "#c9a84c",
  act1: "#5c7a6e",
  crisis: "#4a6fa5",
  climax: "#b04a2a",
  legacy: "#7a4fa5",
};

export const CATEGORIES: Category[] = [
  "Empires & Civilizations",
  "Space History & Tech",
  "Military Battles",
  "Forgotten Figures",
  "Architectural Wonders",
  "Scientific Revolutions",
  "Ancient Mysteries",
  "Natural Disasters"
];

export const DURATIONS: Duration[] = ["20-40 min", "40-60 min", "90+ min"];

export const DURATION_METRICS: Record<Duration, { minWords: number; maxWords: number; targetMin: number }> = {
  "20-40 min": { minWords: 3000, maxWords: 6000, targetMin: 20 },
  "40-60 min": { minWords: 6000, maxWords: 9000, targetMin: 40 },
  "90+ min": { minWords: 13500, maxWords: 20000, targetMin: 90 },
};

export const STYLES: ProductionStyle[] = ["Cinematic", "Documentary", "Animation", "Epic Narrated"];

export const LANGUAGES: Language[] = ["EN", "ES", "AR", "FR"];

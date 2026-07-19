import fs from 'fs';

const appCode = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = appCode.split('\n');

const appStart = lines.findIndex(l => l.startsWith('export default function App()'));
const ideaCardStart = lines.findIndex(l => l.startsWith('interface IdeaCardProps {'));
const productionDashboardStart = lines.findIndex(l => l.startsWith('function ProductionDashboard({'));
const endOfFile = lines.length;

if (!fs.existsSync('src/components')) {
  fs.mkdirSync('src/components');
}

const safeImageStart = lines.findIndex(l => l.startsWith('function SafeImage({'));
const safeImageEnd = lines.findIndex((l, i) => i > safeImageStart && l.startsWith('}')) + 1;
const safeImageCode = lines.slice(safeImageStart, safeImageEnd).join('\n');

const ideaCardCode = lines.slice(ideaCardStart, productionDashboardStart).join('\n');
const productionDashboardCode = lines.slice(productionDashboardStart).join('\n');

let imports = lines.slice(0, safeImageStart).join('\n');

// 1. Create SafeImage.tsx
fs.writeFileSync('src/components/SafeImage.tsx', `import { useState, useEffect } from "react";\n\nexport ${safeImageCode}\n`);

// 2. Create IdeaCard.tsx
fs.writeFileSync('src/components/IdeaCard.tsx', `import { useState } from "react";
import { Play, Calendar, User as UserIcon, Clock, Heart, Edit3, ChevronDown, ChevronUp, Image as ImageIcon, Music, CheckCircle2, Bookmark, Lightbulb } from "lucide-react";
import { Idea } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { SafeImage } from "./SafeImage";

export ${ideaCardCode}\n`);

// 3. Create ProductionDashboard.tsx
fs.writeFileSync('src/components/ProductionDashboard.tsx', `import { useState, useEffect, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { motion, AnimatePresence } from "motion/react";
import { Idea, Scene } from "../types";
import { ChevronLeft, Brain, Video, Music, Settings, AlertTriangle, Check, Layers, Image as ImageIcon, Mic, Loader2, Play, Download, Settings as SettingsIcon } from "lucide-react";
import { generateSceneImage } from "../services/geminiService";
import { SafeImage } from "./SafeImage";
import JSZip from "jszip";

export ${productionDashboardCode}\n`);

// 4. Update App.tsx
const appImports = imports + `\nimport { SafeImage } from "./components/SafeImage";\nimport { IdeaCard } from "./components/IdeaCard";\nimport { ProductionDashboard } from "./components/ProductionDashboard";\n`;

const appComponentCode = lines.slice(safeImageEnd, ideaCardStart).join('\n'); // which contains 'export default function App()'

fs.writeFileSync('src/App.tsx', appImports + appComponentCode);


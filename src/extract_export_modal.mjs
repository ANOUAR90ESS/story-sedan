import fs from 'fs';

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = appCode.split('\n');
const exportModalStart = lines.findIndex(l => l.startsWith('function ExportModal({'));

if (exportModalStart !== -1) {
  const exportModalCode = lines.slice(exportModalStart).join('\n');
  const appComponentCode = lines.slice(0, exportModalStart).join('\n');
  
  fs.writeFileSync('src/components/ExportModal.tsx', `import { motion } from "motion/react";\nimport { Video } from "lucide-react";\n\nexport ${exportModalCode}\n`);
  fs.writeFileSync('src/App.tsx', appComponentCode + '\n');
}

// Ensure ProductionDashboard imports ExportModal
let pdCode = fs.readFileSync('src/components/ProductionDashboard.tsx', 'utf-8');
if (!pdCode.includes('import { ExportModal }')) {
  pdCode = pdCode.replace('import JSZip from "jszip";', 'import JSZip from "jszip";\nimport { ExportModal } from "./ExportModal";\nimport { getWordCount } from "../lib/utils";');
  fs.writeFileSync('src/components/ProductionDashboard.tsx', pdCode);
}

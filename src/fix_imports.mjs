import fs from "fs";

let pdCode = fs.readFileSync("src/components/ProductionDashboard.tsx", "utf-8");
pdCode = pdCode.replace("ChevronLeft, Brain", "ChevronLeft, Brain, Sparkles, ScrollText, Clock, Square");
pdCode = pdCode.replace("React.ChangeEvent", "import('react').ChangeEvent");
fs.writeFileSync("src/components/ProductionDashboard.tsx", pdCode);

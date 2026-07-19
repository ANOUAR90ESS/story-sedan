import fs from "fs";

let pdCode = fs.readFileSync("src/components/ProductionDashboard.tsx", "utf-8");
pdCode = pdCode.replace('import { useState, useEffect, useRef, useCallback } from "react";', 'import React, { useState, useEffect, useRef, useCallback } from "react";');
fs.writeFileSync("src/components/ProductionDashboard.tsx", pdCode);

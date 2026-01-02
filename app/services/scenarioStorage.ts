/**
 * Scenario Storage Service
 * 
 * Handles persistence of scenarios to localStorage and JSON import/export.
 * This enables reproducibility - key requirement for research artifact.
 */

import { ScenarioParameters } from "../context/types";
import { DEFAULT_SCENARIO_VALUES } from "../schemas/schema";

const STORAGE_KEY = "tco_scenarios";
const STORAGE_VERSION = "1.0";

/**
 * Storage wrapper with version tracking
 */
interface StorageWrapper {
  version: string;
  lastUpdated: string;
  scenarios: ScenarioParameters[];
}

/**
 * Save scenarios to localStorage
 */
export function saveScenarios(scenarios: ScenarioParameters[]): void {
  if (typeof window === "undefined") return;
  
  const wrapper: StorageWrapper = {
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
    scenarios,
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapper));
  } catch (error) {
    console.error("Failed to save scenarios to localStorage:", error);
  }
}

/**
 * Load scenarios from localStorage
 */
export function loadScenarios(): ScenarioParameters[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const wrapper: StorageWrapper = JSON.parse(stored);
    
    // Validate and migrate if needed
    if (wrapper.version !== STORAGE_VERSION) {
      console.warn(`Migrating scenarios from version ${wrapper.version} to ${STORAGE_VERSION}`);
      // Add migration logic here if schema changes
    }
    
    return wrapper.scenarios || [];
  } catch (error) {
    console.error("Failed to load scenarios from localStorage:", error);
    return [];
  }
}

/**
 * Clear all scenarios from localStorage
 */
export function clearScenarios(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export a single scenario to JSON string
 */
export function exportScenarioToJSON(scenario: ScenarioParameters): string {
  const exportData = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    type: "single_scenario",
    scenario,
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export multiple scenarios to JSON string
 */
export function exportScenariosToJSON(scenarios: ScenarioParameters[]): string {
  const exportData = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    type: "multiple_scenarios",
    count: scenarios.length,
    scenarios,
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a scenario from JSON string
 * Returns null if validation fails
 */
export function importScenarioFromJSON(json: string): ScenarioParameters | null {
  try {
    const data = JSON.parse(json);
    
    // Handle both single scenario and export wrapper formats
    let scenario: ScenarioParameters;
    
    if (data.type === "single_scenario" && data.scenario) {
      scenario = data.scenario;
    } else if (data.id && data.name) {
      // Direct scenario object
      scenario = data;
    } else {
      console.error("Invalid scenario JSON format");
      return null;
    }
    
    // Validate required fields
    if (!validateScenario(scenario)) {
      console.error("Scenario validation failed");
      return null;
    }
    
    return scenario;
  } catch (error) {
    console.error("Failed to parse scenario JSON:", error);
    return null;
  }
}

/**
 * Import multiple scenarios from JSON string
 */
export function importScenariosFromJSON(json: string): ScenarioParameters[] {
  try {
    const data = JSON.parse(json);
    
    let scenarios: ScenarioParameters[] = [];
    
    if (data.type === "multiple_scenarios" && Array.isArray(data.scenarios)) {
      scenarios = data.scenarios;
    } else if (Array.isArray(data)) {
      scenarios = data;
    } else if (data.scenarios && Array.isArray(data.scenarios)) {
      scenarios = data.scenarios;
    }
    
    // Validate each scenario
    return scenarios.filter(validateScenario);
  } catch (error) {
    console.error("Failed to parse scenarios JSON:", error);
    return [];
  }
}

/**
 * Validate a scenario object has required fields
 */
export function validateScenario(scenario: unknown): scenario is ScenarioParameters {
  if (!scenario || typeof scenario !== "object") return false;
  
  const s = scenario as Record<string, unknown>;
  
  // Check required fields
  if (typeof s.id !== "string" || !s.id) return false;
  if (typeof s.name !== "string" || !s.name) return false;
  if (!["EU", "US", "Global"].includes(s.region as string)) return false;
  
  // Check nested objects exist
  if (!s.time || typeof s.time !== "object") return false;
  if (!s.workload || typeof s.workload !== "object") return false;
  if (!s.security || typeof s.security !== "object") return false;
  if (!s.risk || typeof s.risk !== "object") return false;
  
  return true;
}

/**
 * Create a scenario with filled-in defaults for any missing fields
 */
export function fillScenarioDefaults(
  partial: Partial<ScenarioParameters>
): ScenarioParameters {
  const now = new Date().toISOString();
  
  return {
    id: partial.id || crypto.randomUUID?.() || `scenario-${Date.now()}`,
    name: partial.name || "Untitled Scenario",
    description: partial.description,
    region: partial.region || DEFAULT_SCENARIO_VALUES.region,
    time: {
      year: partial.time?.year ?? DEFAULT_SCENARIO_VALUES.time.year,
      escalationRate: partial.time?.escalationRate ?? DEFAULT_SCENARIO_VALUES.time.escalationRate,
      shockFactor: partial.time?.shockFactor ?? DEFAULT_SCENARIO_VALUES.time.shockFactor,
      shockEnabled: partial.time?.shockEnabled ?? DEFAULT_SCENARIO_VALUES.time.shockEnabled,
    },
    workload: {
      utilizationClass: partial.workload?.utilizationClass ?? DEFAULT_SCENARIO_VALUES.workload.utilizationClass,
      aiEnabled: partial.workload?.aiEnabled ?? DEFAULT_SCENARIO_VALUES.workload.aiEnabled,
    },
    regulatoryIntensity: partial.regulatoryIntensity || DEFAULT_SCENARIO_VALUES.regulatoryIntensity,
    security: {
      annualInvestment: partial.security?.annualInvestment ?? DEFAULT_SCENARIO_VALUES.security.annualInvestment,
      siemPerNode: partial.security?.siemPerNode ?? DEFAULT_SCENARIO_VALUES.security.siemPerNode,
      iamPerUser: partial.security?.iamPerUser ?? DEFAULT_SCENARIO_VALUES.security.iamPerUser,
      encryptionPerTB: partial.security?.encryptionPerTB ?? DEFAULT_SCENARIO_VALUES.security.encryptionPerTB,
      incidentResponseRetainer: partial.security?.incidentResponseRetainer ?? DEFAULT_SCENARIO_VALUES.security.incidentResponseRetainer,
      userCount: partial.security?.userCount ?? DEFAULT_SCENARIO_VALUES.security.userCount,
    },
    risk: {
      baseIncidentProbability: partial.risk?.baseIncidentProbability ?? DEFAULT_SCENARIO_VALUES.risk.baseIncidentProbability,
      averageImpactCost: partial.risk?.averageImpactCost ?? DEFAULT_SCENARIO_VALUES.risk.averageImpactCost,
      maxSecurityReduction: partial.risk?.maxSecurityReduction ?? DEFAULT_SCENARIO_VALUES.risk.maxSecurityReduction,
    },
    isBaseline: partial.isBaseline ?? false,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
  };
}

/**
 * Download a JSON file to the user's computer
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download CSV content
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert scenario comparison to CSV format
 */
export function comparisonToCSV(
  scenarioA: ScenarioParameters,
  scenarioB: ScenarioParameters,
  breakdownA: { totals: Record<string, number> },
  breakdownB: { totals: Record<string, number> }
): string {
  const headers = ["Metric", scenarioA.name, scenarioB.name, "Delta", "% Change"];
  const rows: string[][] = [headers];
  
  const metrics = ["baseTCO", "adjustments", "compliance", "security", "risk", "grandTotal"];
  const labels: Record<string, string> = {
    baseTCO: "Base TCO",
    adjustments: "Adjustments",
    compliance: "Compliance",
    security: "Security",
    risk: "Risk (EAL)",
    grandTotal: "Grand Total",
  };
  
  for (const metric of metrics) {
    const valA = breakdownA.totals[metric] || 0;
    const valB = breakdownB.totals[metric] || 0;
    const delta = valB - valA;
    const pctChange = valA !== 0 ? ((delta / valA) * 100).toFixed(2) : "N/A";
    
    rows.push([
      labels[metric] || metric,
      valA.toFixed(2),
      valB.toFixed(2),
      delta.toFixed(2),
      pctChange + "%",
    ]);
  }
  
  return rows.map((row) => row.join(",")).join("\n");
}

/**
 * Preset scenarios for quick start
 */
export const PRESET_SCENARIOS: Partial<ScenarioParameters>[] = [
  {
    name: "EU 2024 Baseline",
    description: "European Union baseline scenario with standard compliance",
    region: "EU",
    time: { year: 2024, escalationRate: 0.025, shockEnabled: false, shockFactor: 1.5 },
    workload: { utilizationClass: "Medium", aiEnabled: false },
    regulatoryIntensity: "Medium",
  },
  {
    name: "US 2024 Baseline",
    description: "United States baseline scenario",
    region: "US",
    time: { year: 2024, escalationRate: 0.025, shockEnabled: false, shockFactor: 1.5 },
    workload: { utilizationClass: "Medium", aiEnabled: false },
    regulatoryIntensity: "Medium",
  },
  {
    name: "EU 2027 High Regulation",
    description: "Future EU scenario with high regulatory requirements",
    region: "EU",
    time: { year: 2027, escalationRate: 0.03, shockEnabled: false, shockFactor: 1.5 },
    workload: { utilizationClass: "Medium", aiEnabled: false },
    regulatoryIntensity: "High",
  },
  {
    name: "US AI Datacenter 2025",
    description: "AI-accelerated datacenter in the US",
    region: "US",
    time: { year: 2025, escalationRate: 0.025, shockEnabled: false, shockFactor: 1.5 },
    workload: { utilizationClass: "High", aiEnabled: true },
    regulatoryIntensity: "Medium",
  },
  {
    name: "Global AI 2026 + Energy Shock",
    description: "Global AI deployment with energy price shock scenario",
    region: "Global",
    time: { year: 2026, escalationRate: 0.03, shockEnabled: true, shockFactor: 1.5 },
    workload: { utilizationClass: "High", aiEnabled: true },
    regulatoryIntensity: "Medium",
  },
];

/**
 * Get a preset scenario with all defaults filled in
 */
export function getPresetScenario(index: number): ScenarioParameters | null {
  if (index < 0 || index >= PRESET_SCENARIOS.length) return null;
  return fillScenarioDefaults(PRESET_SCENARIOS[index]);
}


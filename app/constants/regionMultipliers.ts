/**
 * Region-Specific Multipliers
 * 
 * These multipliers adjust costs based on geographic region.
 * Values are scenario parameters for comparative analysis, not predictions.
 * 
 * Baseline: US = 1.0 for all factors
 * 
 * Sources/assumptions documented for each region.
 */

import { Region } from "../context/types";

export interface RegionMultiplierConfig {
  /** Multiplier for energy costs (electricity prices) */
  energy: number;
  /** Multiplier for labor costs (wages, benefits) */
  labor: number;
  /** Multiplier for compliance costs (regulatory overhead) */
  compliance: number;
  /** Description of assumptions */
  assumptions: string[];
}

/**
 * Region multiplier configuration
 * 
 * Assumptions:
 * - US is baseline (1.0) as most TCO data originates from US markets
 * - EU has higher energy costs and stricter compliance requirements
 * - Global represents a weighted average for distributed deployments
 * 
 * These are scenario parameters, not forecasts. Adjust for your specific context.
 */
export const REGION_MULTIPLIERS: Record<Region, RegionMultiplierConfig> = {
  US: {
    energy: 1.0,
    labor: 1.0,
    compliance: 1.0,
    assumptions: [
      "Baseline reference region",
      "Average US commercial electricity rates",
      "US labor market rates (Bureau of Labor Statistics)",
      "Standard SOC2/HIPAA compliance level",
    ],
  },
  
  EU: {
    energy: 1.35,
    labor: 1.15,
    compliance: 1.4,
    assumptions: [
      "EU electricity ~35% higher than US average (Eurostat data)",
      "Western European tech salaries ~15% higher than US average",
      "GDPR compliance overhead adds ~40% to compliance costs",
      "Additional regulatory frameworks (NIS2, DORA) increase compliance burden",
    ],
  },
  
  Global: {
    energy: 1.1,
    labor: 0.85,
    compliance: 1.15,
    assumptions: [
      "Weighted average across regions",
      "Includes lower-cost regions (APAC, LATAM)",
      "Labor cost reduction from global distribution",
      "Moderate compliance overhead for multi-region operations",
    ],
  },
};

/**
 * Get human-readable description of region multipliers
 */
export function getRegionDescription(region: Region): string {
  const descriptions: Record<Region, string> = {
    US: "United States - Baseline reference with standard commercial rates",
    EU: "European Union - Higher energy costs, stricter compliance (GDPR, NIS2)",
    Global: "Global distribution - Mixed cost profile with labor arbitrage",
  };
  return descriptions[region];
}

/**
 * Get the cost impact summary for a region
 */
export function getRegionImpactSummary(region: Region): string {
  const config = REGION_MULTIPLIERS[region];
  const parts: string[] = [];
  
  if (config.energy !== 1.0) {
    const pct = ((config.energy - 1) * 100).toFixed(0);
    parts.push(`Energy: ${config.energy > 1 ? "+" : ""}${pct}%`);
  }
  if (config.labor !== 1.0) {
    const pct = ((config.labor - 1) * 100).toFixed(0);
    parts.push(`Labor: ${config.labor > 1 ? "+" : ""}${pct}%`);
  }
  if (config.compliance !== 1.0) {
    const pct = ((config.compliance - 1) * 100).toFixed(0);
    parts.push(`Compliance: ${config.compliance > 1 ? "+" : ""}${pct}%`);
  }
  
  return parts.length > 0 ? parts.join(", ") : "No adjustments (baseline)";
}


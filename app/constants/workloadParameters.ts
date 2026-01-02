/**
 * Workload Class Parameters
 * 
 * Coarse utilization multipliers for scenario modeling.
 * These affect energy consumption, cooling overhead, and monitoring volume.
 * 
 * Key design decisions:
 * - No application-level workload simulation
 * - No performance metrics required
 * - Treat as utilization scenario, not app simulation
 */

import { WorkloadClass } from "../context/types";

export interface WorkloadConfig {
  /** Multiplier for energy consumption */
  energy: number;
  /** Multiplier for cooling overhead */
  cooling: number;
  /** Multiplier for monitoring/security costs */
  monitoring: number;
  /** Description of this workload class */
  description: string;
  /** Example use cases */
  examples: string[];
}

/**
 * Workload class multipliers
 * 
 * Baseline: Medium = 1.0 for all factors
 * 
 * These represent coarse utilization scenarios:
 * - Low: Development, testing, disaster recovery
 * - Medium: Standard production workloads
 * - High: High-performance, compute-intensive workloads
 */
export const WORKLOAD_PARAMETERS: Record<WorkloadClass | "AI_accelerated", WorkloadConfig> = {
  Low: {
    energy: 0.6,
    cooling: 0.7,
    monitoring: 0.8,
    description: "Low utilization - Development, testing, or standby systems",
    examples: [
      "Development and test environments",
      "Disaster recovery standby",
      "Archive storage systems",
      "Batch processing during off-hours",
    ],
  },
  
  Medium: {
    energy: 1.0,
    cooling: 1.0,
    monitoring: 1.0,
    description: "Medium utilization - Standard production workloads",
    examples: [
      "Enterprise applications",
      "Web services and APIs",
      "Database servers",
      "Standard business workloads",
    ],
  },
  
  High: {
    energy: 1.4,
    cooling: 1.3,
    monitoring: 1.2,
    description: "High utilization - Compute-intensive production workloads",
    examples: [
      "High-traffic web applications",
      "Real-time analytics",
      "Scientific computing",
      "Financial trading systems",
    ],
  },
  
  /**
   * AI/ML workload multiplier
   * Applied ON TOP of the utilization class multiplier
   */
  AI_accelerated: {
    energy: 1.8,
    cooling: 1.5,
    monitoring: 1.3,
    description: "AI/ML accelerated workloads - GPU-intensive processing",
    examples: [
      "Large language model training",
      "Deep learning inference",
      "Computer vision processing",
      "AI/ML pipeline processing",
    ],
  },
};

/**
 * Get combined workload multipliers
 * @param utilizationClass - Base utilization class
 * @param aiEnabled - Whether AI workloads are enabled
 * @returns Combined multipliers
 */
export function getWorkloadMultipliers(
  utilizationClass: WorkloadClass,
  aiEnabled: boolean
): WorkloadConfig {
  const base = WORKLOAD_PARAMETERS[utilizationClass];
  
  if (!aiEnabled) {
    return base;
  }
  
  const ai = WORKLOAD_PARAMETERS.AI_accelerated;
  
  return {
    energy: base.energy * ai.energy,
    cooling: base.cooling * ai.cooling,
    monitoring: base.monitoring * ai.monitoring,
    description: `${base.description} with AI acceleration`,
    examples: [...base.examples, ...ai.examples],
  };
}

/**
 * Get description of workload impact
 */
export function getWorkloadImpactDescription(
  utilizationClass: WorkloadClass,
  aiEnabled: boolean
): string {
  const config = getWorkloadMultipliers(utilizationClass, aiEnabled);
  
  const energyPct = ((config.energy - 1) * 100).toFixed(0);
  const coolingPct = ((config.cooling - 1) * 100).toFixed(0);
  const monitoringPct = ((config.monitoring - 1) * 100).toFixed(0);
  
  let impact = `Workload: ${utilizationClass}`;
  if (aiEnabled) impact += " + AI";
  impact += "\n";
  
  if (config.energy !== 1) {
    impact += `Energy: ${config.energy > 1 ? "+" : ""}${energyPct}%\n`;
  }
  if (config.cooling !== 1) {
    impact += `Cooling: ${config.cooling > 1 ? "+" : ""}${coolingPct}%\n`;
  }
  if (config.monitoring !== 1) {
    impact += `Monitoring: ${config.monitoring > 1 ? "+" : ""}${monitoringPct}%\n`;
  }
  
  return impact;
}

/**
 * Disclaimer for workload parameters
 */
export const WORKLOAD_DISCLAIMER = `
Workload classes are coarse utilization scenarios for comparative analysis.

They do NOT represent:
- Application-level performance modeling
- Actual measured utilization
- Workload trace analysis

Use these parameters to compare scenarios at different utilization levels,
not to simulate specific application behavior.
`.trim();


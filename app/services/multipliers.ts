/**
 * Multipliers Service
 * 
 * Provides multiplier maps for different scenario parameters.
 * Each multiplier affects specific cost buckets, documented for transparency.
 * 
 * Multiplier value of 1.0 = no change (baseline)
 * Multiplier value > 1.0 = cost increase
 * Multiplier value < 1.0 = cost decrease
 */

import {
  Region,
  WorkloadClass,
  WorkloadParameters,
  TimeParameters,
  RegulatoryIntensity,
  MultiplierSet,
} from "../context/types";
import { REGION_MULTIPLIERS } from "../constants/regionMultipliers";
import { TIME_PARAMETERS } from "../constants/timeParameters";
import { WORKLOAD_PARAMETERS } from "../constants/workloadParameters";
import { REGULATORY_PARAMETERS } from "../constants/regulatoryParameters";

/**
 * Get multipliers for a specific region
 * 
 * Affects:
 * - Energy costs (electricity prices vary by region)
 * - Labor costs (wages vary by region)
 * - Compliance costs (regulatory overhead varies by region)
 */
export function getRegionMultipliers(region: Region): MultiplierSet {
  const regionConfig = REGION_MULTIPLIERS[region];
  return {
    energy: regionConfig.energy,
    labor: regionConfig.labor,
    compliance: regionConfig.compliance,
    cooling: 1.0, // Cooling not region-dependent in this model
    monitoring: 1.0, // Monitoring not region-dependent in this model
  };
}

/**
 * Get multipliers for time-based escalation
 * 
 * Affects OPEX items only (items that recur annually):
 * - Energy costs (escalate)
 * - Labor costs (escalate)
 * - Software licenses (escalate if recurring)
 * 
 * Does NOT affect CAPEX items:
 * - Hardware (servers, storage, network)
 * - Infrastructure (power distribution, building)
 */
export function getTimeMultipliers(time: TimeParameters): MultiplierSet {
  const yearsFromBaseline = time.year - TIME_PARAMETERS.baselineYear;
  
  // Calculate escalation factor: (1 + rate) ^ years
  const escalationFactor = Math.pow(1 + time.escalationRate, yearsFromBaseline);
  
  // Apply shock factor to energy only (if enabled)
  const energyShockMultiplier = time.shockEnabled ? (time.shockFactor || 1) : 1;
  
  return {
    energy: escalationFactor * energyShockMultiplier,
    labor: escalationFactor,
    compliance: 1.0, // Compliance escalation handled separately
    cooling: escalationFactor, // Cooling costs tied to energy
    monitoring: 1.0, // Monitoring not time-escalated
  };
}

/**
 * Get multipliers for workload utilization class
 * 
 * Affects:
 * - Energy consumption (higher utilization = more power)
 * - Cooling overhead (higher utilization = more heat)
 * - Monitoring volume (higher utilization = more monitoring)
 */
export function getWorkloadMultipliers(workload: WorkloadParameters): MultiplierSet {
  const classConfig = WORKLOAD_PARAMETERS[workload.utilizationClass];
  
  // Start with class-based multipliers
  let multipliers: MultiplierSet = {
    energy: classConfig.energy,
    labor: 1.0, // Workload doesn't directly affect labor
    compliance: 1.0, // Workload doesn't directly affect compliance
    cooling: classConfig.cooling,
    monitoring: classConfig.monitoring,
  };
  
  // Apply AI multiplier if enabled
  if (workload.aiEnabled) {
    const aiConfig = WORKLOAD_PARAMETERS.AI_accelerated;
    multipliers = {
      energy: multipliers.energy * aiConfig.energy,
      labor: multipliers.labor,
      compliance: multipliers.compliance,
      cooling: multipliers.cooling * aiConfig.cooling,
      monitoring: multipliers.monitoring * aiConfig.monitoring,
    };
  }
  
  return multipliers;
}

/**
 * Get multipliers for regulatory intensity
 * 
 * Affects:
 * - Compliance costs (audit frequency, documentation overhead)
 * 
 * Note: Most regulatory impact is in explicit compliance line items,
 * not multipliers. This multiplier is for baseline compliance overhead
 * built into operational costs.
 */
export function getRegulatoryMultipliers(intensity: RegulatoryIntensity): MultiplierSet {
  const regConfig = REGULATORY_PARAMETERS[intensity];
  
  return {
    energy: 1.0,
    labor: 1.0,
    compliance: regConfig.complianceMultiplier,
    cooling: 1.0,
    monitoring: 1.0,
  };
}

/**
 * Combine multiple multiplier sets
 * Multipliers are multiplicative: combined = m1 * m2 * m3 * ...
 */
export function combineMultipliers(multiplierSets: MultiplierSet[]): MultiplierSet {
  const combined: MultiplierSet = {
    energy: 1.0,
    labor: 1.0,
    compliance: 1.0,
    cooling: 1.0,
    monitoring: 1.0,
  };
  
  for (const set of multiplierSets) {
    combined.energy *= set.energy;
    combined.labor *= set.labor;
    combined.compliance *= set.compliance;
    combined.cooling *= set.cooling;
    combined.monitoring *= set.monitoring;
  }
  
  return combined;
}

/**
 * Format multiplier for display (e.g., 1.15 -> "+15%")
 */
export function formatMultiplier(value: number): string {
  if (value === 1) return "±0%";
  const percentage = (value - 1) * 100;
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}%`;
}

/**
 * Get human-readable description of what a multiplier affects
 */
export function getMultiplierAffects(type: keyof MultiplierSet): string[] {
  const affects: Record<keyof MultiplierSet, string[]> = {
    energy: ["Power costs", "Energy consumption costs", "Data center electricity"],
    labor: ["Workforce costs", "Salaries and benefits", "Contractor costs"],
    compliance: ["Compliance overhead", "Built-in regulatory costs"],
    cooling: ["Cooling infrastructure", "HVAC costs", "PUE-related costs"],
    monitoring: ["Security monitoring", "SIEM costs", "Logging infrastructure"],
  };
  
  return affects[type];
}

/**
 * Get documentation for all multipliers in a scenario
 * Useful for the assumption transparency panel
 */
export function getMultiplierDocumentation(
  region: Region,
  time: TimeParameters,
  workload: WorkloadParameters,
  regulatoryIntensity: RegulatoryIntensity
) {
  const regionMults = getRegionMultipliers(region);
  const timeMults = getTimeMultipliers(time);
  const workloadMults = getWorkloadMultipliers(workload);
  const regMults = getRegulatoryMultipliers(regulatoryIntensity);
  const combined = combineMultipliers([regionMults, timeMults, workloadMults, regMults]);
  
  return {
    region: {
      source: `Region: ${region}`,
      multipliers: regionMults,
      affects: ["Energy", "Labor", "Compliance"],
    },
    time: {
      source: `Year ${time.year} (${time.year - TIME_PARAMETERS.baselineYear} years from baseline)`,
      escalationRate: time.escalationRate,
      shockEnabled: time.shockEnabled,
      shockFactor: time.shockFactor,
      multipliers: timeMults,
      affects: ["Energy (OPEX)", "Labor (OPEX)", "Cooling (OPEX)"],
      note: "CAPEX items do not escalate",
    },
    workload: {
      source: `${workload.utilizationClass} utilization${workload.aiEnabled ? " + AI" : ""}`,
      multipliers: workloadMults,
      affects: ["Energy consumption", "Cooling", "Monitoring"],
    },
    regulatory: {
      source: `Regulatory intensity: ${regulatoryIntensity}`,
      multipliers: regMults,
      affects: ["Compliance overhead"],
      note: "Most compliance costs are explicit line items",
    },
    combined: {
      description: "Combined effect of all multipliers",
      multipliers: combined,
    },
  };
}


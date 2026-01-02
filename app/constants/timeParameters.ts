/**
 * Time-Based Parameters
 * 
 * Parameters for time-based scenario modeling.
 * Implements escalation for OPEX items without forecasting.
 * 
 * Key distinction:
 * - This is a SCENARIO TIME INDEX, not a forecast
 * - Escalation represents what-if analysis, not prediction
 * - No CPI or energy price forecasting
 */

/**
 * Baseline year for all time calculations
 */
export const TIME_PARAMETERS = {
  /** Baseline year (all escalation calculated from this point) */
  baselineYear: 2024,
  
  /** Default annual escalation rate (2.5% = 0.025) */
  defaultEscalationRate: 0.025,
  
  /** Minimum escalation rate allowed */
  minEscalationRate: 0,
  
  /** Maximum escalation rate allowed (20%) */
  maxEscalationRate: 0.2,
  
  /** Minimum year for scenarios */
  minYear: 2020,
  
  /** Maximum year for scenarios */
  maxYear: 2040,
  
  /** Default shock factor for energy price shocks */
  defaultShockFactor: 1.5,
  
  /** Maximum shock factor allowed */
  maxShockFactor: 3.0,
};

/**
 * Which cost categories escalate over time
 * 
 * OPEX items escalate: These are recurring annual costs
 * CAPEX items do NOT escalate: These are one-time purchases
 */
export const COST_ESCALATION_CATEGORIES = {
  // OPEX - Escalates
  energy: {
    escalates: true,
    category: "OPEX",
    description: "Annual energy/electricity costs",
    shockApplies: true,
  },
  labor: {
    escalates: true,
    category: "OPEX",
    description: "Annual workforce costs (salaries, benefits)",
    shockApplies: false,
  },
  softwareLicenses: {
    escalates: true,
    category: "OPEX",
    description: "Recurring software license fees",
    shockApplies: false,
  },
  maintenance: {
    escalates: true,
    category: "OPEX",
    description: "Annual maintenance and support contracts",
    shockApplies: false,
  },
  compliance: {
    escalates: true,
    category: "OPEX",
    description: "Recurring compliance and audit costs",
    shockApplies: false,
  },
  
  // CAPEX - Does NOT escalate
  servers: {
    escalates: false,
    category: "CAPEX",
    description: "Server hardware purchase",
    shockApplies: false,
  },
  storage: {
    escalates: false,
    category: "CAPEX",
    description: "Storage hardware purchase",
    shockApplies: false,
  },
  network: {
    escalates: false,
    category: "CAPEX",
    description: "Network equipment purchase",
    shockApplies: false,
  },
  powerDistribution: {
    escalates: false,
    category: "CAPEX",
    description: "Power infrastructure (one-time)",
    shockApplies: false,
  },
  building: {
    escalates: false,
    category: "CAPEX",
    description: "Land and building costs (one-time or amortized)",
    shockApplies: false,
  },
};

/**
 * Calculate escalation factor for a given year
 * @param targetYear - The year to calculate escalation for
 * @param escalationRate - Annual escalation rate (e.g., 0.025 for 2.5%)
 * @returns Escalation factor (e.g., 1.05 for 5% total escalation)
 */
export function calculateEscalationFactor(
  targetYear: number,
  escalationRate: number
): number {
  const years = targetYear - TIME_PARAMETERS.baselineYear;
  if (years <= 0) return 1.0;
  return Math.pow(1 + escalationRate, years);
}

/**
 * Get a description of the time escalation for transparency
 */
export function getTimeEscalationDescription(
  targetYear: number,
  escalationRate: number,
  shockEnabled: boolean,
  shockFactor: number
): string {
  const years = targetYear - TIME_PARAMETERS.baselineYear;
  const factor = calculateEscalationFactor(targetYear, escalationRate);
  
  let description = `Year ${targetYear} (${years >= 0 ? "+" : ""}${years} years from ${TIME_PARAMETERS.baselineYear} baseline)\n`;
  description += `Escalation rate: ${(escalationRate * 100).toFixed(1)}% per year\n`;
  description += `Cumulative escalation: ${((factor - 1) * 100).toFixed(1)}%\n`;
  
  if (shockEnabled) {
    description += `Energy shock factor: ${((shockFactor - 1) * 100).toFixed(0)}% additional increase\n`;
  }
  
  return description;
}

/**
 * Disclaimer text for time-based scenarios
 */
export const TIME_SCENARIO_DISCLAIMER = `
This is a scenario time index, NOT a forecast.

The escalation parameters represent hypothetical what-if scenarios for 
comparative analysis. They do not incorporate:
- CPI or inflation predictions
- Energy price forecasts
- Market-specific trends

Use these parameters to compare scenarios at different time indices,
not to predict future costs.
`.trim();


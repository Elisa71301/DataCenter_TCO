/**
 * Computation Engine
 * 
 * Implements layered TCO calculation with transparent intermediate results.
 * 
 * Layers:
 * 1. Base TCO - Uses existing component calculations
 * 2. Multipliers Layer - Applies region/time/workload factors
 * 3. Compliance Layer - Adds explicit compliance costs
 * 4. Risk Layer - Expected annual loss calculation
 * 5. Total - Aggregate with transparent breakdown
 */

import {
  ScenarioParameters,
  ComputationBreakdown,
  ComplianceCosts,
  SecurityCosts,
  RiskCosts,
  MultiplierSet,
} from "../context/types";
import {
  getRegionMultipliers,
  getTimeMultipliers,
  getWorkloadMultipliers,
  getRegulatoryMultipliers,
  combineMultipliers,
} from "./multipliers";
import {
  COMPLIANCE_BASE_COSTS,
  REGULATORY_PARAMETERS,
} from "../constants/regulatoryParameters";

/** Base TCO costs from existing calculation (passed from components) */
export interface BaseTCOInput {
  land: number;
  servers: number;
  storage: number;
  network: number;
  powerDistribution: number;
  energy: number;
  software: number;
  labor: number;
}

/** Additional context for calculations */
export interface ComputationContext {
  /** Total number of server nodes */
  nodeCount: number;
  /** Total storage in TB */
  totalStorageTB: number;
}

/**
 * Calculate compliance costs based on regulatory intensity
 */
export function calculateComplianceCosts(
  scenario: ScenarioParameters,
  laborHourlyRate: number = 75 // Default hourly rate for documentation work
): ComplianceCosts {
  const regParams = REGULATORY_PARAMETERS[scenario.regulatoryIntensity];
  const baseCosts = COMPLIANCE_BASE_COSTS;

  const auditCosts = regParams.auditFrequency * baseCosts.costPerAudit;
  const documentationCosts = regParams.documentationHours * laborHourlyRate;
  const advisoryCosts = regParams.externalAdvisoryIncluded ? baseCosts.externalAdvisory : 0;
  const certificationCosts = baseCosts.certificationCosts * regParams.complianceMultiplier;

  return {
    auditCosts,
    documentationCosts,
    advisoryCosts,
    certificationCosts,
    total: auditCosts + documentationCosts + advisoryCosts + certificationCosts,
    breakdown: {
      auditFrequency: regParams.auditFrequency,
      costPerAudit: baseCosts.costPerAudit,
      documentationHours: regParams.documentationHours,
      hourlyRate: laborHourlyRate,
    },
  };
}

/**
 * Calculate security costs based on security parameters
 */
export function calculateSecurityCosts(
  scenario: ScenarioParameters,
  context: ComputationContext
): SecurityCosts {
  const { security } = scenario;

  const siemCosts = security.siemPerNode * context.nodeCount;
  const iamCosts = security.iamPerUser * security.userCount;
  const encryptionCosts = security.encryptionPerTB * context.totalStorageTB;
  const incidentResponseCosts = security.incidentResponseRetainer;

  return {
    siemCosts,
    iamCosts,
    encryptionCosts,
    incidentResponseCosts,
    total: siemCosts + iamCosts + encryptionCosts + incidentResponseCosts,
  };
}

/**
 * Calculate risk-adjusted expected annual loss
 * 
 * Formula:
 * EAL = adjusted_probability × average_impact_cost
 * adjusted_probability = base_probability × (1 - security_reduction_factor)
 * security_reduction_factor = min(max_reduction, investment_factor)
 * 
 * The security reduction is bounded and logarithmic to prevent unrealistic claims.
 */
export function calculateRiskCosts(
  scenario: ScenarioParameters,
  totalSecurityInvestment: number
): RiskCosts {
  const { risk, security } = scenario;

  // Calculate security reduction factor based on investment
  // Using logarithmic diminishing returns: more investment = less marginal benefit
  // Factor = min(max_reduction, log(1 + investment / reference) / log(1 + max_investment / reference))
  const referenceInvestment = 50000; // Reference point for calculation
  const maxInvestment = 500000; // Point of maximum effectiveness
  
  const investmentRatio = Math.log(1 + totalSecurityInvestment / referenceInvestment) /
    Math.log(1 + maxInvestment / referenceInvestment);
  
  const securityReductionFactor = Math.min(
    risk.maxSecurityReduction,
    investmentRatio * risk.maxSecurityReduction
  );

  // Calculate adjusted probability
  const adjustedProbability = risk.baseIncidentProbability * (1 - securityReductionFactor);

  // Calculate expected annual loss
  const expectedAnnualLoss = adjustedProbability * risk.averageImpactCost;

  return {
    expectedAnnualLoss,
    adjustedProbability,
    securityReductionFactor,
    breakdown: {
      baseIncidentProbability: risk.baseIncidentProbability,
      securityInvestment: totalSecurityInvestment,
      averageImpactCost: risk.averageImpactCost,
    },
  };
}

/**
 * Apply multipliers to base costs
 * Returns the adjustment amounts (positive = increase, negative = decrease)
 */
export function applyMultipliers(
  baseTCO: BaseTCOInput,
  multipliers: MultiplierSet
): { energyAdjustment: number; laborAdjustment: number; coolingAdjustment: number; total: number } {
  // Energy multiplier affects: energy costs
  const energyAdjustment = baseTCO.energy * (multipliers.energy - 1);

  // Labor multiplier affects: labor costs
  const laborAdjustment = baseTCO.labor * (multipliers.labor - 1);

  // Cooling multiplier affects: power distribution (cooling portion)
  // Assuming 40% of power distribution is cooling-related
  const coolingPortion = baseTCO.powerDistribution * 0.4;
  const coolingAdjustment = coolingPortion * (multipliers.cooling - 1);

  const total = energyAdjustment + laborAdjustment + coolingAdjustment;

  return {
    energyAdjustment,
    laborAdjustment,
    coolingAdjustment,
    total,
  };
}

/**
 * Main computation function - calculates full TCO breakdown
 * 
 * This is the core calculation engine that produces transparent,
 * traceable results suitable for research/thesis documentation.
 */
export function computeScenarioTCO(
  baseTCO: BaseTCOInput,
  scenario: ScenarioParameters,
  context: ComputationContext
): ComputationBreakdown {
  // Step 1: Get all multipliers
  const regionMultipliers = getRegionMultipliers(scenario.region);
  const timeMultipliers = getTimeMultipliers(scenario.time);
  const workloadMultipliers = getWorkloadMultipliers(scenario.workload);
  const regulatoryMultipliers = getRegulatoryMultipliers(scenario.regulatoryIntensity);

  // Step 2: Combine multipliers
  const combinedMultipliers = combineMultipliers([
    regionMultipliers,
    timeMultipliers,
    workloadMultipliers,
  ]);

  // Step 3: Apply multipliers to get adjustments
  const adjustments = applyMultipliers(baseTCO, combinedMultipliers);

  // Step 4: Calculate compliance costs
  const complianceCosts = calculateComplianceCosts(scenario);

  // Step 5: Calculate security costs
  const securityCosts = calculateSecurityCosts(scenario, context);

  // Step 6: Calculate risk costs
  const totalSecurityInvestment = securityCosts.total + scenario.security.annualInvestment;
  const riskCosts = calculateRiskCosts(scenario, totalSecurityInvestment);

  // Step 7: Calculate totals
  const baseTCOTotal = Object.values(baseTCO).reduce((sum, val) => sum + val, 0);
  const adjustmentsTotal = adjustments.total;
  const complianceTotal = complianceCosts.total;
  const securityTotal = securityCosts.total;
  const riskTotal = riskCosts.expectedAnnualLoss;
  const grandTotal = baseTCOTotal + adjustmentsTotal + complianceTotal + securityTotal + riskTotal;

  // Step 8: Build the complete breakdown
  const breakdown: ComputationBreakdown = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,

    baseTCO: {
      ...baseTCO,
      total: baseTCOTotal,
    },

    multipliers: {
      region: regionMultipliers,
      time: {
        escalationFactor: timeMultipliers.energy, // Using energy as representative
        shockFactor: scenario.time.shockEnabled ? scenario.time.shockFactor : 1,
      },
      workload: workloadMultipliers,
      regulatory: {
        complianceMultiplier: regulatoryMultipliers.compliance,
      },
      combined: combinedMultipliers,
    },

    adjustments: {
      ...adjustments,
    },

    complianceCosts,
    securityCosts,
    riskCosts,

    totals: {
      baseTCO: baseTCOTotal,
      adjustments: adjustmentsTotal,
      compliance: complianceTotal,
      security: securityTotal,
      risk: riskTotal,
      grandTotal,
    },

    calculatedAt: new Date().toISOString(),
  };

  return breakdown;
}

/**
 * Calculate sensitivity analysis for a parameter
 * Returns the TCO impact when the parameter is perturbed ±20%
 */
export function calculateSensitivity(
  baseTCO: BaseTCOInput,
  scenario: ScenarioParameters,
  context: ComputationContext,
  parameter: "energy" | "labor" | "security",
  perturbationPercent: number = 0.2
): { low: ComputationBreakdown; base: ComputationBreakdown; high: ComputationBreakdown } {
  // Calculate base case
  const base = computeScenarioTCO(baseTCO, scenario, context);

  // Create perturbed inputs
  let lowInput = { ...baseTCO };
  let highInput = { ...baseTCO };
  let lowScenario = { ...scenario };
  let highScenario = { ...scenario };

  switch (parameter) {
    case "energy":
      lowInput.energy = baseTCO.energy * (1 - perturbationPercent);
      highInput.energy = baseTCO.energy * (1 + perturbationPercent);
      break;
    case "labor":
      lowInput.labor = baseTCO.labor * (1 - perturbationPercent);
      highInput.labor = baseTCO.labor * (1 + perturbationPercent);
      break;
    case "security":
      lowScenario = {
        ...scenario,
        security: {
          ...scenario.security,
          annualInvestment: scenario.security.annualInvestment * (1 - perturbationPercent),
        },
      };
      highScenario = {
        ...scenario,
        security: {
          ...scenario.security,
          annualInvestment: scenario.security.annualInvestment * (1 + perturbationPercent),
        },
      };
      break;
  }

  const low = computeScenarioTCO(lowInput, lowScenario, context);
  const high = computeScenarioTCO(highInput, highScenario, context);

  return { low, base, high };
}

/**
 * Compare two scenarios and return the differences
 */
export function compareScenarios(
  breakdownA: ComputationBreakdown,
  breakdownB: ComputationBreakdown,
  scenarioA: ScenarioParameters,
  scenarioB: ScenarioParameters
) {
  const deltas = {
    baseTCO: breakdownB.totals.baseTCO - breakdownA.totals.baseTCO,
    adjustments: breakdownB.totals.adjustments - breakdownA.totals.adjustments,
    compliance: breakdownB.totals.compliance - breakdownA.totals.compliance,
    security: breakdownB.totals.security - breakdownA.totals.security,
    risk: breakdownB.totals.risk - breakdownA.totals.risk,
    grandTotal: breakdownB.totals.grandTotal - breakdownA.totals.grandTotal,
    percentageChange:
      ((breakdownB.totals.grandTotal - breakdownA.totals.grandTotal) /
        breakdownA.totals.grandTotal) *
      100,
  };

  // Find parameter differences
  const parameterDifferences: Array<{
    parameter: string;
    valueA: string | number;
    valueB: string | number;
  }> = [];

  if (scenarioA.region !== scenarioB.region) {
    parameterDifferences.push({
      parameter: "Region",
      valueA: scenarioA.region,
      valueB: scenarioB.region,
    });
  }

  if (scenarioA.time.year !== scenarioB.time.year) {
    parameterDifferences.push({
      parameter: "Year",
      valueA: scenarioA.time.year,
      valueB: scenarioB.time.year,
    });
  }

  if (scenarioA.workload.utilizationClass !== scenarioB.workload.utilizationClass) {
    parameterDifferences.push({
      parameter: "Workload Class",
      valueA: scenarioA.workload.utilizationClass,
      valueB: scenarioB.workload.utilizationClass,
    });
  }

  if (scenarioA.workload.aiEnabled !== scenarioB.workload.aiEnabled) {
    parameterDifferences.push({
      parameter: "AI Mode",
      valueA: scenarioA.workload.aiEnabled ? "Enabled" : "Disabled",
      valueB: scenarioB.workload.aiEnabled ? "Enabled" : "Disabled",
    });
  }

  if (scenarioA.regulatoryIntensity !== scenarioB.regulatoryIntensity) {
    parameterDifferences.push({
      parameter: "Regulatory Intensity",
      valueA: scenarioA.regulatoryIntensity,
      valueB: scenarioB.regulatoryIntensity,
    });
  }

  if (scenarioA.security.annualInvestment !== scenarioB.security.annualInvestment) {
    parameterDifferences.push({
      parameter: "Security Investment",
      valueA: scenarioA.security.annualInvestment,
      valueB: scenarioB.security.annualInvestment,
    });
  }

  return {
    scenarioA: {
      id: scenarioA.id,
      name: scenarioA.name,
      parameters: scenarioA,
      breakdown: breakdownA,
    },
    scenarioB: {
      id: scenarioB.id,
      name: scenarioB.name,
      parameters: scenarioB,
      breakdown: breakdownB,
    },
    deltas,
    parameterDifferences,
  };
}


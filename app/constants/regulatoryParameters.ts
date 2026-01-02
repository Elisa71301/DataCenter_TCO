/**
 * Regulatory Intensity Parameters
 * 
 * Parameters for modeling compliance and regulatory costs.
 * Abstract, thesis-aligned implementation without legal encoding.
 * 
 * Key design decisions:
 * - NO legal language implying compliance achieved
 * - NO specific regulation article logic (GDPR, HIPAA, etc.)
 * - Abstract intensity levels for scenario comparison
 */

import { RegulatoryIntensity } from "../context/types";

export interface RegulatoryConfig {
  /** Audit frequency per year (e.g., 0.5 = every 2 years, 2 = twice per year) */
  auditFrequency: number;
  /** Documentation hours required per year */
  documentationHours: number;
  /** Multiplier for baseline compliance overhead */
  complianceMultiplier: number;
  /** Whether external advisory is typically included */
  externalAdvisoryIncluded: boolean;
  /** Description of this intensity level */
  description: string;
  /** Typical scenarios for this level */
  typicalScenarios: string[];
}

/**
 * Regulatory intensity configuration
 * 
 * Baseline: Medium = 1.0 compliance multiplier
 * 
 * These are abstract intensity levels, not specific regulations.
 * Used for comparative scenario analysis.
 */
export const REGULATORY_PARAMETERS: Record<RegulatoryIntensity, RegulatoryConfig> = {
  Low: {
    auditFrequency: 0.5,
    documentationHours: 200,
    complianceMultiplier: 0.7,
    externalAdvisoryIncluded: false,
    description: "Minimal compliance requirements",
    typicalScenarios: [
      "Internal systems only",
      "No PII/sensitive data",
      "Single jurisdiction",
      "Non-regulated industry",
    ],
  },
  
  Medium: {
    auditFrequency: 1.0,
    documentationHours: 500,
    complianceMultiplier: 1.0,
    externalAdvisoryIncluded: false,
    description: "Standard compliance requirements",
    typicalScenarios: [
      "SOC2 Type II certification",
      "Basic data protection measures",
      "Single primary regulation",
      "B2B services with standard contracts",
    ],
  },
  
  High: {
    auditFrequency: 2.0,
    documentationHours: 1200,
    complianceMultiplier: 1.5,
    externalAdvisoryIncluded: true,
    description: "Intensive compliance requirements",
    typicalScenarios: [
      "Multiple overlapping regulations",
      "Cross-border data transfers",
      "Highly regulated industries (finance, healthcare)",
      "Government/public sector requirements",
    ],
  },
};

/**
 * Base compliance costs (independent of intensity)
 * These are annual costs in USD.
 */
export const COMPLIANCE_BASE_COSTS = {
  /** Cost per audit engagement */
  costPerAudit: 75000,
  /** External advisory annual retainer */
  externalAdvisory: 120000,
  /** Certification costs (SOC2, ISO27001, etc.) */
  certificationCosts: 50000,
  /** Hourly rate for documentation work (internal) */
  documentationHourlyRate: 75,
  /** Compliance training per employee per year */
  trainingPerEmployee: 500,
  /** Compliance tooling/GRC platform annual cost */
  complianceTooling: 25000,
};

/**
 * Calculate total compliance costs for a scenario
 */
export function calculateComplianceCosts(
  intensity: RegulatoryIntensity,
  employeeCount: number = 50
): {
  auditCosts: number;
  documentationCosts: number;
  advisoryCosts: number;
  certificationCosts: number;
  trainingCosts: number;
  toolingCosts: number;
  total: number;
} {
  const config = REGULATORY_PARAMETERS[intensity];
  const base = COMPLIANCE_BASE_COSTS;
  
  const auditCosts = config.auditFrequency * base.costPerAudit;
  const documentationCosts = config.documentationHours * base.documentationHourlyRate;
  const advisoryCosts = config.externalAdvisoryIncluded ? base.externalAdvisory : 0;
  const certificationCosts = base.certificationCosts * config.complianceMultiplier;
  const trainingCosts = base.trainingPerEmployee * employeeCount;
  const toolingCosts = base.complianceTooling * config.complianceMultiplier;
  
  return {
    auditCosts,
    documentationCosts,
    advisoryCosts,
    certificationCosts,
    trainingCosts,
    toolingCosts,
    total: auditCosts + documentationCosts + advisoryCosts + 
           certificationCosts + trainingCosts + toolingCosts,
  };
}

/**
 * Get description of regulatory impact
 */
export function getRegulatoryImpactDescription(intensity: RegulatoryIntensity): string {
  const config = REGULATORY_PARAMETERS[intensity];
  
  return `
Regulatory Intensity: ${intensity}

${config.description}

• Audit frequency: ${config.auditFrequency === 0.5 ? "Every 2 years" : 
                    config.auditFrequency === 1 ? "Annual" : 
                    `${config.auditFrequency}x per year`}
• Documentation hours: ${config.documentationHours}/year
• Compliance overhead: ${config.complianceMultiplier === 1 ? "Baseline" :
                        config.complianceMultiplier < 1 ? `${((1 - config.complianceMultiplier) * 100).toFixed(0)}% below baseline` :
                        `${((config.complianceMultiplier - 1) * 100).toFixed(0)}% above baseline`}
• External advisory: ${config.externalAdvisoryIncluded ? "Included" : "Not included"}

Typical scenarios:
${config.typicalScenarios.map(s => `  • ${s}`).join("\n")}
`.trim();
}

/**
 * Disclaimer for regulatory parameters
 */
export const REGULATORY_DISCLAIMER = `
IMPORTANT: This is a compliance COST model, not a compliance CHECKER.

This tool does NOT:
• Verify compliance with any regulation
• Provide legal advice
• Encode specific regulatory requirements
• Guarantee regulatory compliance

Regulatory intensity levels are abstract parameters for cost comparison.
Consult qualified legal and compliance professionals for actual 
regulatory requirements.
`.trim();


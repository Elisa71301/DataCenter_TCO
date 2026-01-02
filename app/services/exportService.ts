/**
 * Export Service
 * 
 * Provides enhanced export capabilities for scenarios and results.
 * Supports JSON, CSV, and Markdown formats.
 */

import { ScenarioParameters, ComputationBreakdown } from "../context/types";

/**
 * Download content as a file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "application/json"
): void {
  const blob = new Blob([content], { type: mimeType });
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
 * Export scenario to JSON
 */
export function exportScenarioJSON(scenario: ScenarioParameters): string {
  return JSON.stringify(
    {
      version: "1.0",
      type: "single_scenario",
      exportedAt: new Date().toISOString(),
      scenario,
    },
    null,
    2
  );
}

/**
 * Export multiple scenarios to JSON
 */
export function exportScenariosJSON(scenarios: ScenarioParameters[]): string {
  return JSON.stringify(
    {
      version: "1.0",
      type: "multiple_scenarios",
      exportedAt: new Date().toISOString(),
      count: scenarios.length,
      scenarios,
    },
    null,
    2
  );
}

/**
 * Export computation breakdown to JSON
 */
export function exportBreakdownJSON(
  scenario: ScenarioParameters,
  breakdown: ComputationBreakdown
): string {
  return JSON.stringify(
    {
      version: "1.0",
      type: "computation_result",
      exportedAt: new Date().toISOString(),
      scenario,
      breakdown,
    },
    null,
    2
  );
}

/**
 * Export breakdown to CSV format
 */
export function exportBreakdownCSV(breakdown: ComputationBreakdown): string {
  const lines: string[] = [];

  // Header
  lines.push("Scenario,Category,Item,Value");

  // Base TCO
  lines.push(`${breakdown.scenarioName},Base TCO,Land,${breakdown.baseTCO.land}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Servers,${breakdown.baseTCO.servers}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Storage,${breakdown.baseTCO.storage}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Network,${breakdown.baseTCO.network}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Power Distribution,${breakdown.baseTCO.powerDistribution}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Energy,${breakdown.baseTCO.energy}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Software,${breakdown.baseTCO.software}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Labor,${breakdown.baseTCO.labor}`);
  lines.push(`${breakdown.scenarioName},Base TCO,Total,${breakdown.baseTCO.total}`);

  // Adjustments
  lines.push(`${breakdown.scenarioName},Adjustments,Energy Adjustment,${breakdown.adjustments.energyAdjustment}`);
  lines.push(`${breakdown.scenarioName},Adjustments,Labor Adjustment,${breakdown.adjustments.laborAdjustment}`);
  lines.push(`${breakdown.scenarioName},Adjustments,Cooling Adjustment,${breakdown.adjustments.coolingAdjustment}`);
  lines.push(`${breakdown.scenarioName},Adjustments,Total,${breakdown.adjustments.total}`);

  // Compliance
  lines.push(`${breakdown.scenarioName},Compliance,Audit Costs,${breakdown.complianceCosts.auditCosts}`);
  lines.push(`${breakdown.scenarioName},Compliance,Documentation,${breakdown.complianceCosts.documentationCosts}`);
  lines.push(`${breakdown.scenarioName},Compliance,Advisory,${breakdown.complianceCosts.advisoryCosts}`);
  lines.push(`${breakdown.scenarioName},Compliance,Certification,${breakdown.complianceCosts.certificationCosts}`);
  lines.push(`${breakdown.scenarioName},Compliance,Total,${breakdown.complianceCosts.total}`);

  // Security
  lines.push(`${breakdown.scenarioName},Security,SIEM,${breakdown.securityCosts.siemCosts}`);
  lines.push(`${breakdown.scenarioName},Security,IAM,${breakdown.securityCosts.iamCosts}`);
  lines.push(`${breakdown.scenarioName},Security,Encryption,${breakdown.securityCosts.encryptionCosts}`);
  lines.push(`${breakdown.scenarioName},Security,Incident Response,${breakdown.securityCosts.incidentResponseCosts}`);
  lines.push(`${breakdown.scenarioName},Security,Total,${breakdown.securityCosts.total}`);

  // Risk
  lines.push(`${breakdown.scenarioName},Risk,Expected Annual Loss,${breakdown.riskCosts.expectedAnnualLoss}`);
  lines.push(`${breakdown.scenarioName},Risk,Adjusted Probability,${breakdown.riskCosts.adjustedProbability}`);
  lines.push(`${breakdown.scenarioName},Risk,Security Reduction,${breakdown.riskCosts.securityReductionFactor}`);

  // Totals
  lines.push(`${breakdown.scenarioName},Totals,Base TCO,${breakdown.totals.baseTCO}`);
  lines.push(`${breakdown.scenarioName},Totals,Adjustments,${breakdown.totals.adjustments}`);
  lines.push(`${breakdown.scenarioName},Totals,Compliance,${breakdown.totals.compliance}`);
  lines.push(`${breakdown.scenarioName},Totals,Security,${breakdown.totals.security}`);
  lines.push(`${breakdown.scenarioName},Totals,Risk,${breakdown.totals.risk}`);
  lines.push(`${breakdown.scenarioName},Totals,Grand Total,${breakdown.totals.grandTotal}`);

  return lines.join("\n");
}

/**
 * Export comparison to CSV
 */
export function exportComparisonCSV(
  scenarioA: ScenarioParameters,
  scenarioB: ScenarioParameters,
  breakdownA: ComputationBreakdown,
  breakdownB: ComputationBreakdown
): string {
  const lines: string[] = [];

  lines.push("Category,Scenario A,Scenario B,Delta,% Change");
  lines.push(`Scenario Name,${scenarioA.name},${scenarioB.name},,`);
  lines.push(``);

  const addRow = (category: string, valA: number, valB: number) => {
    const delta = valB - valA;
    const pctChange = valA !== 0 ? ((delta / valA) * 100).toFixed(2) : "N/A";
    lines.push(`${category},${valA.toFixed(2)},${valB.toFixed(2)},${delta.toFixed(2)},${pctChange}%`);
  };

  addRow("Base TCO", breakdownA.totals.baseTCO, breakdownB.totals.baseTCO);
  addRow("Adjustments", breakdownA.totals.adjustments, breakdownB.totals.adjustments);
  addRow("Compliance", breakdownA.totals.compliance, breakdownB.totals.compliance);
  addRow("Security", breakdownA.totals.security, breakdownB.totals.security);
  addRow("Risk (EAL)", breakdownA.totals.risk, breakdownB.totals.risk);
  addRow("Grand Total", breakdownA.totals.grandTotal, breakdownB.totals.grandTotal);

  return lines.join("\n");
}

/**
 * Export scenario and breakdown to Markdown (for thesis appendix)
 */
export function exportToMarkdown(
  scenario: ScenarioParameters,
  breakdown: ComputationBreakdown
): string {
  const lines: string[] = [];

  lines.push(`# Scenario: ${scenario.name}`);
  lines.push(``);
  lines.push(`*Exported: ${new Date().toISOString()}*`);
  lines.push(``);

  if (scenario.description) {
    lines.push(`## Description`);
    lines.push(``);
    lines.push(scenario.description);
    lines.push(``);
  }

  lines.push(`## Parameters`);
  lines.push(``);
  lines.push(`| Parameter | Value |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Region | ${scenario.region} |`);
  lines.push(`| Year | ${scenario.time.year} |`);
  lines.push(`| Escalation Rate | ${(scenario.time.escalationRate * 100).toFixed(1)}% |`);
  lines.push(`| Shock Enabled | ${scenario.time.shockEnabled ? "Yes" : "No"} |`);
  if (scenario.time.shockEnabled) {
    lines.push(`| Shock Factor | ${((scenario.time.shockFactor! - 1) * 100).toFixed(0)}% |`);
  }
  lines.push(`| Workload Class | ${scenario.workload.utilizationClass} |`);
  lines.push(`| AI Workloads | ${scenario.workload.aiEnabled ? "Enabled" : "Disabled"} |`);
  lines.push(`| Regulatory Intensity | ${scenario.regulatoryIntensity} |`);
  lines.push(`| Security Investment | $${scenario.security.annualInvestment.toLocaleString()} |`);
  lines.push(``);

  lines.push(`## Multipliers Applied`);
  lines.push(``);
  lines.push(`| Category | Multiplier |`);
  lines.push(`|----------|------------|`);
  lines.push(`| Energy | ×${breakdown.multipliers.combined.energy.toFixed(3)} |`);
  lines.push(`| Labor | ×${breakdown.multipliers.combined.labor.toFixed(3)} |`);
  lines.push(`| Compliance | ×${breakdown.multipliers.combined.compliance.toFixed(3)} |`);
  lines.push(`| Cooling | ×${breakdown.multipliers.combined.cooling.toFixed(3)} |`);
  lines.push(``);

  lines.push(`## Cost Breakdown`);
  lines.push(``);
  lines.push(`### Base TCO`);
  lines.push(``);
  lines.push(`| Component | Cost |`);
  lines.push(`|-----------|------|`);
  lines.push(`| Land & Building | $${breakdown.baseTCO.land.toLocaleString()} |`);
  lines.push(`| Servers | $${breakdown.baseTCO.servers.toLocaleString()} |`);
  lines.push(`| Storage | $${breakdown.baseTCO.storage.toLocaleString()} |`);
  lines.push(`| Network | $${breakdown.baseTCO.network.toLocaleString()} |`);
  lines.push(`| Power Distribution | $${breakdown.baseTCO.powerDistribution.toLocaleString()} |`);
  lines.push(`| Energy | $${breakdown.baseTCO.energy.toLocaleString()} |`);
  lines.push(`| Software | $${breakdown.baseTCO.software.toLocaleString()} |`);
  lines.push(`| Labor | $${breakdown.baseTCO.labor.toLocaleString()} |`);
  lines.push(`| **Total** | **$${breakdown.baseTCO.total.toLocaleString()}** |`);
  lines.push(``);

  lines.push(`### Scenario Adjustments`);
  lines.push(``);
  lines.push(`| Adjustment | Amount |`);
  lines.push(`|------------|--------|`);
  lines.push(`| Energy | $${breakdown.adjustments.energyAdjustment.toLocaleString()} |`);
  lines.push(`| Labor | $${breakdown.adjustments.laborAdjustment.toLocaleString()} |`);
  lines.push(`| Cooling | $${breakdown.adjustments.coolingAdjustment.toLocaleString()} |`);
  lines.push(`| **Total** | **$${breakdown.adjustments.total.toLocaleString()}** |`);
  lines.push(``);

  lines.push(`### Compliance Costs`);
  lines.push(``);
  lines.push(`| Item | Cost |`);
  lines.push(`|------|------|`);
  lines.push(`| Audit Costs | $${breakdown.complianceCosts.auditCosts.toLocaleString()} |`);
  lines.push(`| Documentation | $${breakdown.complianceCosts.documentationCosts.toLocaleString()} |`);
  lines.push(`| Advisory | $${breakdown.complianceCosts.advisoryCosts.toLocaleString()} |`);
  lines.push(`| Certification | $${breakdown.complianceCosts.certificationCosts.toLocaleString()} |`);
  lines.push(`| **Total** | **$${breakdown.complianceCosts.total.toLocaleString()}** |`);
  lines.push(``);

  lines.push(`### Security Costs`);
  lines.push(``);
  lines.push(`| Item | Cost |`);
  lines.push(`|------|------|`);
  lines.push(`| SIEM/Monitoring | $${breakdown.securityCosts.siemCosts.toLocaleString()} |`);
  lines.push(`| IAM/MFA | $${breakdown.securityCosts.iamCosts.toLocaleString()} |`);
  lines.push(`| Encryption/KMS | $${breakdown.securityCosts.encryptionCosts.toLocaleString()} |`);
  lines.push(`| Incident Response | $${breakdown.securityCosts.incidentResponseCosts.toLocaleString()} |`);
  lines.push(`| **Total** | **$${breakdown.securityCosts.total.toLocaleString()}** |`);
  lines.push(``);

  lines.push(`### Risk Model`);
  lines.push(``);
  lines.push(`| Parameter | Value |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Base Probability | ${(breakdown.riskCosts.breakdown.baseIncidentProbability * 100).toFixed(1)}% |`);
  lines.push(`| Security Reduction | ${(breakdown.riskCosts.securityReductionFactor * 100).toFixed(1)}% |`);
  lines.push(`| Adjusted Probability | ${(breakdown.riskCosts.adjustedProbability * 100).toFixed(2)}% |`);
  lines.push(`| Average Impact | $${breakdown.riskCosts.breakdown.averageImpactCost.toLocaleString()} |`);
  lines.push(`| **Expected Annual Loss** | **$${breakdown.riskCosts.expectedAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}** |`);
  lines.push(``);

  lines.push(`## Grand Total`);
  lines.push(``);
  lines.push(`| Category | Amount |`);
  lines.push(`|----------|--------|`);
  lines.push(`| Base TCO | $${breakdown.totals.baseTCO.toLocaleString()} |`);
  lines.push(`| + Adjustments | $${breakdown.totals.adjustments.toLocaleString()} |`);
  lines.push(`| + Compliance | $${breakdown.totals.compliance.toLocaleString()} |`);
  lines.push(`| + Security | $${breakdown.totals.security.toLocaleString()} |`);
  lines.push(`| + Risk (EAL) | $${breakdown.totals.risk.toLocaleString()} |`);
  lines.push(`| **= Grand Total** | **$${breakdown.totals.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}** |`);
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`*This document was automatically generated for reproducibility.*`);
  lines.push(`*Scenario ID: ${scenario.id}*`);
  lines.push(`*Calculated: ${breakdown.calculatedAt}*`);

  return lines.join("\n");
}

/**
 * Export assumptions to Markdown
 */
export function exportAssumptionsMarkdown(scenario: ScenarioParameters): string {
  const lines: string[] = [];

  lines.push(`# Assumptions: ${scenario.name}`);
  lines.push(``);
  lines.push(`*Exported: ${new Date().toISOString()}*`);
  lines.push(``);

  lines.push(`## Model Scope`);
  lines.push(``);
  lines.push(`This is a scenario-based TCO model for comparative analysis.`);
  lines.push(``);
  lines.push(`### Explicitly Not Modeled:`);
  lines.push(`- No forecasting or prediction (CPI/energy price prediction)`);
  lines.push(`- No legal encoding (no GDPR article logic)`);
  lines.push(`- No application-level workload simulation`);
  lines.push(`- No "absolute realism" claims`);
  lines.push(``);

  lines.push(`## Active Parameters`);
  lines.push(``);
  lines.push(`| Parameter | Value | Description |`);
  lines.push(`|-----------|-------|-------------|`);
  lines.push(`| Region | ${scenario.region} | Geographic region for cost multipliers |`);
  lines.push(`| Year | ${scenario.time.year} | Scenario time index (baseline: 2024) |`);
  lines.push(`| Escalation | ${(scenario.time.escalationRate * 100).toFixed(1)}% | Annual OPEX escalation rate |`);
  lines.push(`| Shock | ${scenario.time.shockEnabled ? `${((scenario.time.shockFactor! - 1) * 100).toFixed(0)}%` : "Off"} | Energy price shock factor |`);
  lines.push(`| Workload | ${scenario.workload.utilizationClass}${scenario.workload.aiEnabled ? " + AI" : ""} | Workload utilization class |`);
  lines.push(`| Regulatory | ${scenario.regulatoryIntensity} | Regulatory compliance intensity |`);
  lines.push(`| Security | $${scenario.security.annualInvestment.toLocaleString()} | Annual security investment |`);
  lines.push(``);

  lines.push(`## Disclaimer`);
  lines.push(``);
  lines.push(`This tool provides comparative scenario analysis, not predictions.`);
  lines.push(`Results should be interpreted as relative comparisons between scenarios.`);
  lines.push(`Consult qualified professionals for regulatory and legal requirements.`);

  return lines.join("\n");
}


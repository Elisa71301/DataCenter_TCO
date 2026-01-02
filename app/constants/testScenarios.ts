/**
 * Test Scenarios
 * 
 * Predefined scenarios for testing and validation.
 * These ensure the model behaves correctly and monotonically.
 */

import { ScenarioParameters } from "../context/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a test scenario with specified parameters
 */
function createTestScenario(
  name: string,
  overrides: Partial<ScenarioParameters>
): ScenarioParameters {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name,
    description: `Test scenario: ${name}`,
    region: "US",
    time: {
      year: 2024,
      escalationRate: 0.025,
      shockFactor: 1.5,
      shockEnabled: false,
    },
    workload: {
      utilizationClass: "Medium",
      aiEnabled: false,
    },
    regulatoryIntensity: "Medium",
    security: {
      annualInvestment: 100000,
      siemPerNode: 500,
      iamPerUser: 100,
      encryptionPerTB: 50,
      incidentResponseRetainer: 50000,
      userCount: 50,
    },
    risk: {
      baseIncidentProbability: 0.15,
      averageImpactCost: 500000,
      maxSecurityReduction: 0.8,
    },
    isBaseline: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Baseline scenario - all neutral parameters
 * Used to verify that new features don't change baseline behavior
 */
export const BASELINE_SCENARIO = createTestScenario("Baseline (Neutral)", {
  name: "Baseline (Neutral)",
  description: "All parameters at neutral/baseline values. Used for regression testing.",
  region: "US",
  time: {
    year: 2024,
    escalationRate: 0,
    shockEnabled: false,
    shockFactor: 1,
  },
  workload: {
    utilizationClass: "Medium",
    aiEnabled: false,
  },
  regulatoryIntensity: "Medium",
  isBaseline: true,
});

/**
 * Test scenarios for specific features
 */
export const TEST_SCENARIOS = {
  /**
   * Region tests
   */
  regionEU: createTestScenario("Region: EU", {
    region: "EU",
    description: "EU region with higher energy and compliance costs",
  }),
  regionGlobal: createTestScenario("Region: Global", {
    region: "Global",
    description: "Global distribution with mixed costs",
  }),

  /**
   * Time tests
   */
  time2027: createTestScenario("Time: 2027", {
    time: {
      year: 2027,
      escalationRate: 0.025,
      shockEnabled: false,
      shockFactor: 1.5,
    },
    description: "3 years from baseline with 2.5% escalation",
  }),
  timeWithShock: createTestScenario("Time: 2025 + Shock", {
    time: {
      year: 2025,
      escalationRate: 0.025,
      shockEnabled: true,
      shockFactor: 1.5,
    },
    description: "1 year from baseline with energy shock",
  }),
  timeHighEscalation: createTestScenario("Time: High Escalation", {
    time: {
      year: 2030,
      escalationRate: 0.05,
      shockEnabled: false,
      shockFactor: 1.5,
    },
    description: "6 years with high 5% escalation",
  }),

  /**
   * Workload tests
   */
  workloadLow: createTestScenario("Workload: Low", {
    workload: {
      utilizationClass: "Low",
      aiEnabled: false,
    },
    description: "Low utilization workload",
  }),
  workloadHigh: createTestScenario("Workload: High", {
    workload: {
      utilizationClass: "High",
      aiEnabled: false,
    },
    description: "High utilization workload",
  }),
  workloadAI: createTestScenario("Workload: Medium + AI", {
    workload: {
      utilizationClass: "Medium",
      aiEnabled: true,
    },
    description: "Medium utilization with AI acceleration",
  }),
  workloadHighAI: createTestScenario("Workload: High + AI", {
    workload: {
      utilizationClass: "High",
      aiEnabled: true,
    },
    description: "Maximum workload intensity",
  }),

  /**
   * Regulatory tests
   */
  regulatoryLow: createTestScenario("Regulatory: Low", {
    regulatoryIntensity: "Low",
    description: "Minimal compliance requirements",
  }),
  regulatoryHigh: createTestScenario("Regulatory: High", {
    regulatoryIntensity: "High",
    description: "High compliance requirements",
  }),

  /**
   * Security tests
   */
  securityMinimal: createTestScenario("Security: Minimal", {
    security: {
      annualInvestment: 10000,
      siemPerNode: 100,
      iamPerUser: 20,
      encryptionPerTB: 10,
      incidentResponseRetainer: 10000,
      userCount: 50,
    },
    description: "Minimal security investment",
  }),
  securityMaximum: createTestScenario("Security: Maximum", {
    security: {
      annualInvestment: 500000,
      siemPerNode: 2000,
      iamPerUser: 500,
      encryptionPerTB: 200,
      incidentResponseRetainer: 200000,
      userCount: 50,
    },
    description: "Maximum security investment",
  }),

  /**
   * Combined extreme scenarios
   */
  extremeMinimum: createTestScenario("Extreme: All Minimum", {
    region: "US",
    time: {
      year: 2024,
      escalationRate: 0,
      shockEnabled: false,
      shockFactor: 1,
    },
    workload: {
      utilizationClass: "Low",
      aiEnabled: false,
    },
    regulatoryIntensity: "Low",
    security: {
      annualInvestment: 10000,
      siemPerNode: 100,
      iamPerUser: 20,
      encryptionPerTB: 10,
      incidentResponseRetainer: 10000,
      userCount: 50,
    },
    description: "All parameters at minimum values",
  }),
  extremeMaximum: createTestScenario("Extreme: All Maximum", {
    region: "EU",
    time: {
      year: 2030,
      escalationRate: 0.1,
      shockEnabled: true,
      shockFactor: 2,
    },
    workload: {
      utilizationClass: "High",
      aiEnabled: true,
    },
    regulatoryIntensity: "High",
    security: {
      annualInvestment: 500000,
      siemPerNode: 2000,
      iamPerUser: 500,
      encryptionPerTB: 200,
      incidentResponseRetainer: 200000,
      userCount: 50,
    },
    description: "All parameters at maximum values",
  }),
};

/**
 * Validation utilities
 */

/**
 * Check that a scenario produces non-negative costs
 */
export function validateNonNegativeCosts(breakdown: {
  totals: { baseTCO: number; adjustments: number; compliance: number; security: number; risk: number; grandTotal: number };
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (breakdown.totals.baseTCO < 0) {
    errors.push("Base TCO is negative");
  }
  if (breakdown.totals.compliance < 0) {
    errors.push("Compliance costs are negative");
  }
  if (breakdown.totals.security < 0) {
    errors.push("Security costs are negative");
  }
  if (breakdown.totals.risk < 0) {
    errors.push("Risk costs are negative");
  }
  if (breakdown.totals.grandTotal < 0) {
    errors.push("Grand total is negative");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check monotonicity - increasing parameter should increase costs
 */
export function checkMonotonicity(
  lowBreakdown: { totals: { grandTotal: number } },
  highBreakdown: { totals: { grandTotal: number } },
  parameterName: string
): { valid: boolean; message: string } {
  if (highBreakdown.totals.grandTotal >= lowBreakdown.totals.grandTotal) {
    return {
      valid: true,
      message: `${parameterName}: Monotonicity check passed (${lowBreakdown.totals.grandTotal} -> ${highBreakdown.totals.grandTotal})`,
    };
  }
  return {
    valid: false,
    message: `${parameterName}: Monotonicity violated! Higher setting produced lower cost (${lowBreakdown.totals.grandTotal} -> ${highBreakdown.totals.grandTotal})`,
  };
}

/**
 * Validate that baseline scenario produces expected range of results
 */
export function validateBaselineRange(
  breakdown: { totals: { grandTotal: number } },
  expectedMin: number,
  expectedMax: number
): { valid: boolean; message: string } {
  const total = breakdown.totals.grandTotal;
  if (total >= expectedMin && total <= expectedMax) {
    return {
      valid: true,
      message: `Baseline in expected range: $${total.toLocaleString()} (expected $${expectedMin.toLocaleString()} - $${expectedMax.toLocaleString()})`,
    };
  }
  return {
    valid: false,
    message: `Baseline out of range: $${total.toLocaleString()} (expected $${expectedMin.toLocaleString()} - $${expectedMax.toLocaleString()})`,
  };
}

/**
 * Generate a test report for a set of scenarios
 */
export function generateTestReport(
  scenarios: { name: string; breakdown: { totals: { grandTotal: number } } }[]
): string {
  let report = "# Scenario Test Report\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += "## Scenario Results\n\n";
  report += "| Scenario | Grand Total |\n";
  report += "|----------|-------------|\n";

  for (const scenario of scenarios) {
    report += `| ${scenario.name} | $${scenario.breakdown.totals.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} |\n`;
  }

  return report;
}


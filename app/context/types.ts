import { ErrorObject } from "ajv";

// ============================================
// SCENARIO PARAMETER TYPES
// ============================================

/** Region for scenario modeling - affects energy, labor, and compliance costs */
export type Region = "EU" | "US" | "Global";

/** Workload utilization class - affects energy and cooling consumption */
export type WorkloadClass = "Low" | "Medium" | "High";

/** Workload mode - Traditional or AI-accelerated compute */
export type WorkloadMode = "Traditional" | "AI_accelerated";

/** Regulatory intensity level - affects compliance and audit costs */
export type RegulatoryIntensity = "Low" | "Medium" | "High";

/** Time parameters for scenario modeling */
export interface TimeParameters {
  /** Target year for the scenario (baseline: 2024) */
  year: number;
  /** Annual escalation rate for OPEX items (e.g., 0.025 = 2.5%) */
  escalationRate: number;
  /** Optional shock factor applied to energy costs only (e.g., 1.5 = 50% increase) */
  shockFactor?: number;
  /** Whether the shock factor is enabled */
  shockEnabled: boolean;
}

/** Workload parameters for scenario modeling */
export interface WorkloadParameters {
  /** Utilization class (Low/Medium/High) */
  utilizationClass: WorkloadClass;
  /** Whether AI-accelerated workloads are enabled */
  aiEnabled: boolean;
}

/** Security investment parameters */
export interface SecurityParameters {
  /** Total security investment in USD per year */
  annualInvestment: number;
  /** Monitoring/SIEM cost per node per year */
  siemPerNode: number;
  /** IAM/MFA cost per user per year */
  iamPerUser: number;
  /** Encryption/KMS cost per TB per year */
  encryptionPerTB: number;
  /** Incident response retainer (fixed annual cost) */
  incidentResponseRetainer: number;
  /** Number of users (for IAM calculation) */
  userCount: number;
}

/** Risk model parameters for expected annual loss calculation */
export interface RiskParameters {
  /** Base incident probability per year (0-1) */
  baseIncidentProbability: number;
  /** Average impact cost per incident in USD */
  averageImpactCost: number;
  /** Maximum security reduction factor (0-1, typically 0.7-0.9) */
  maxSecurityReduction: number;
}

/** Complete scenario parameters */
export interface ScenarioParameters {
  /** Unique identifier for the scenario */
  id: string;
  /** Human-readable name (e.g., "EU 2024 Baseline") */
  name: string;
  /** Optional description */
  description?: string;
  /** Region selection */
  region: Region;
  /** Time-based parameters */
  time: TimeParameters;
  /** Workload parameters */
  workload: WorkloadParameters;
  /** Regulatory intensity */
  regulatoryIntensity: RegulatoryIntensity;
  /** Security investment parameters */
  security: SecurityParameters;
  /** Risk model parameters */
  risk: RiskParameters;
  /** Whether this scenario is marked as baseline for comparison */
  isBaseline: boolean;
  /** Timestamp of creation */
  createdAt: string;
  /** Timestamp of last modification */
  updatedAt: string;
}

/** Multiplier values applied to cost buckets */
export interface MultiplierSet {
  energy: number;
  labor: number;
  compliance: number;
  cooling: number;
  monitoring: number;
}

/** Cost breakdown for a single category */
export interface CostCategory {
  /** Name of the cost category */
  name: string;
  /** Base cost before multipliers */
  baseCost: number;
  /** Cost after applying multipliers */
  adjustedCost: number;
  /** Multipliers applied to this category */
  multipliersApplied: Partial<MultiplierSet>;
  /** Formula used (for transparency) */
  formula: string;
}

/** Compliance cost breakdown */
export interface ComplianceCosts {
  /** Annual audit costs */
  auditCosts: number;
  /** Documentation labor costs */
  documentationCosts: number;
  /** External advisory costs */
  advisoryCosts: number;
  /** Certification costs */
  certificationCosts: number;
  /** Total compliance costs */
  total: number;
  /** Breakdown details for transparency */
  breakdown: {
    auditFrequency: number;
    costPerAudit: number;
    documentationHours: number;
    hourlyRate: number;
  };
}

/** Security cost breakdown */
export interface SecurityCosts {
  /** SIEM/Monitoring costs */
  siemCosts: number;
  /** IAM/MFA costs */
  iamCosts: number;
  /** Encryption/KMS costs */
  encryptionCosts: number;
  /** Incident response retainer */
  incidentResponseCosts: number;
  /** Total security costs */
  total: number;
}

/** Risk-adjusted expected annual loss */
export interface RiskCosts {
  /** Expected annual loss */
  expectedAnnualLoss: number;
  /** Incident probability after security reduction */
  adjustedProbability: number;
  /** Security reduction factor achieved */
  securityReductionFactor: number;
  /** Breakdown for transparency */
  breakdown: {
    baseIncidentProbability: number;
    securityInvestment: number;
    averageImpactCost: number;
  };
}

/** Complete computation breakdown - transparent intermediate results */
export interface ComputationBreakdown {
  /** Scenario used for this calculation */
  scenarioId: string;
  scenarioName: string;
  
  /** Base TCO (existing calculation, before scenario adjustments) */
  baseTCO: {
    land: number;
    servers: number;
    storage: number;
    network: number;
    powerDistribution: number;
    energy: number;
    software: number;
    labor: number;
    total: number;
  };
  
  /** Multipliers applied */
  multipliers: {
    region: MultiplierSet;
    time: { escalationFactor: number; shockFactor: number };
    workload: MultiplierSet;
    regulatory: { complianceMultiplier: number };
    combined: MultiplierSet;
  };
  
  /** Cost adjustments from multipliers */
  adjustments: {
    energyAdjustment: number;
    laborAdjustment: number;
    coolingAdjustment: number;
    total: number;
  };
  
  /** Compliance costs (explicit line items) */
  complianceCosts: ComplianceCosts;
  
  /** Security costs (explicit line items) */
  securityCosts: SecurityCosts;
  
  /** Risk-adjusted expected loss */
  riskCosts: RiskCosts;
  
  /** Final totals */
  totals: {
    /** Base TCO total */
    baseTCO: number;
    /** Total adjustments from multipliers */
    adjustments: number;
    /** Total compliance costs */
    compliance: number;
    /** Total security costs */
    security: number;
    /** Expected annual loss */
    risk: number;
    /** Grand total (Base + Adjustments + Compliance + Security + Risk) */
    grandTotal: number;
  };
  
  /** Timestamp of calculation */
  calculatedAt: string;
}

/** Sensitivity analysis result for a single parameter */
export interface SensitivityResult {
  parameter: string;
  baseValue: number;
  perturbedValueLow: number;
  perturbedValueHigh: number;
  resultLow: number;
  resultHigh: number;
  deltaLow: number;
  deltaHigh: number;
  percentageImpact: number;
}

/** Scenario comparison result */
export interface ScenarioComparison {
  scenarioA: {
    id: string;
    name: string;
    parameters: ScenarioParameters;
    breakdown: ComputationBreakdown;
  };
  scenarioB: {
    id: string;
    name: string;
    parameters: ScenarioParameters;
    breakdown: ComputationBreakdown;
  };
  deltas: {
    baseTCO: number;
    adjustments: number;
    compliance: number;
    security: number;
    risk: number;
    grandTotal: number;
    percentageChange: number;
  };
  parameterDifferences: Array<{
    parameter: string;
    valueA: string | number;
    valueB: string | number;
  }>;
}

// ============================================
// EXISTING DATACENTER TYPES
// ============================================

export interface Land {
  ft?: number;
  occupancy?: number;
  powerRating?: number;
  rentalRate?: number;
  cap?: number;
}

export interface ServerCluster {
  mode?: "custom" | "guided";
  cpu?: string;
  homeNodeCount?: number;
  processorsPerNode?: number;
  coresPerProcessor?: number;
  ramPerNode?: number;
  storagePerNode?: number;
  typeOfSSD?: "high" | "low" | "mid";
  gpu?: string;
  gpu_perNode?: number;
  gpu_model?: string;
  custom_cost_per_node?: number;
  custom_core_per_node?: number;
}

export interface StorageNode {
  mode?: "custom" | "guided";
  type?: "sata" | "nvme" | "hdd" | "tape";
  amount?: number;
  price?: number;
}

export interface Network {
  provider?: "infiniband" | "slingshot";
  tier?: number;
  bandwidth?: number;
  topology?: "dragonfly" | "fat-tree" | "leaf-spine";
}

export interface PowerDistributionAndCooling {
  pue?: number;
  cooling?: "liquid" | "air";
}

export interface EnergyCost {
  eCost?: number;
  choice?: "yes" | "no";
  usage?: number;
}

export interface Software {
  os?: "suse" | "rh_vm" | "rh_physical" | "custom";
  priceLicense?: number;
}

export interface Worker {
  role?: string;
  count?: number;
}

export interface Labor {
  mode?: "guided" | "custom";
  workers?: Worker[];
}

// Combine All Parts into a DataCenter Interface
export interface DataCenter {
  land: Land;
  serverClusterJson: ServerCluster[];
  storageNode: StorageNode[];
  network: Network;
  powerDistributionAndCooling: PowerDistributionAndCooling;
  energyCost: EnergyCost;
  software: Software;
  labor: Labor;
}

export interface TCOContextValue {
  land: Land;
  serverClusterJson: ServerCluster[];
  storageNode: StorageNode[];
  network: Network;
  powerDistributionAndCooling: PowerDistributionAndCooling;
  energyCost: EnergyCost;
  software: Software;
  labor: Labor;
  setLand: React.Dispatch<React.SetStateAction<Land>>;
  setServerClusterJson: React.Dispatch<React.SetStateAction<ServerCluster[]>>;
  setStorageNode: React.Dispatch<React.SetStateAction<StorageNode[]>>;
  setNetwork: React.Dispatch<React.SetStateAction<Network>>;
  setPowerDistributionAndCooling: React.Dispatch<
    React.SetStateAction<PowerDistributionAndCooling>
  >;
  setEnergyCost: React.Dispatch<React.SetStateAction<EnergyCost>>;
  setSoftware: React.Dispatch<React.SetStateAction<Software>>;
  setLabor: React.Dispatch<React.SetStateAction<Labor>>;
  loadSchema: (data: Partial<DataCenter>) => {
    success: boolean;
    errors?: ErrorObject[];
  };
}

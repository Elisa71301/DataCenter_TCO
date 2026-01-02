// ============================================
// SCENARIO SCHEMA
// ============================================

export const scenarioSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the scenario",
    },
    name: {
      type: "string",
      description: "Human-readable name",
      default: "Default Scenario",
    },
    description: {
      type: "string",
      description: "Optional description of the scenario",
    },
    region: {
      type: "string",
      enum: ["EU", "US", "Global"],
      default: "US",
      description: "Region affects energy, labor, and compliance costs",
    },
    time: {
      type: "object",
      properties: {
        year: {
          type: "integer",
          minimum: 2020,
          maximum: 2040,
          default: 2024,
          description: "Target year for scenario (baseline: 2024)",
        },
        escalationRate: {
          type: "number",
          minimum: 0,
          maximum: 0.2,
          default: 0.025,
          description: "Annual escalation rate for OPEX items (0.025 = 2.5%)",
        },
        shockFactor: {
          type: "number",
          minimum: 1,
          maximum: 3,
          default: 1.5,
          description: "Shock multiplier for energy costs (1.5 = 50% increase)",
        },
        shockEnabled: {
          type: "boolean",
          default: false,
          description: "Whether the shock factor is applied",
        },
      },
      default: {
        year: 2024,
        escalationRate: 0.025,
        shockFactor: 1.5,
        shockEnabled: false,
      },
    },
    workload: {
      type: "object",
      properties: {
        utilizationClass: {
          type: "string",
          enum: ["Low", "Medium", "High"],
          default: "Medium",
          description: "Workload utilization level",
        },
        aiEnabled: {
          type: "boolean",
          default: false,
          description: "Whether AI-accelerated workloads are enabled",
        },
      },
      default: {
        utilizationClass: "Medium",
        aiEnabled: false,
      },
    },
    regulatoryIntensity: {
      type: "string",
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      description: "Regulatory intensity affects compliance and audit costs",
    },
    security: {
      type: "object",
      properties: {
        annualInvestment: {
          type: "number",
          minimum: 0,
          default: 100000,
          description: "Total security investment in USD per year",
        },
        siemPerNode: {
          type: "number",
          minimum: 0,
          default: 500,
          description: "SIEM/Monitoring cost per node per year",
        },
        iamPerUser: {
          type: "number",
          minimum: 0,
          default: 100,
          description: "IAM/MFA cost per user per year",
        },
        encryptionPerTB: {
          type: "number",
          minimum: 0,
          default: 50,
          description: "Encryption/KMS cost per TB per year",
        },
        incidentResponseRetainer: {
          type: "number",
          minimum: 0,
          default: 50000,
          description: "Incident response retainer (fixed annual cost)",
        },
        userCount: {
          type: "integer",
          minimum: 0,
          default: 50,
          description: "Number of users for IAM calculation",
        },
      },
      default: {
        annualInvestment: 100000,
        siemPerNode: 500,
        iamPerUser: 100,
        encryptionPerTB: 50,
        incidentResponseRetainer: 50000,
        userCount: 50,
      },
    },
    risk: {
      type: "object",
      properties: {
        baseIncidentProbability: {
          type: "number",
          minimum: 0,
          maximum: 1,
          default: 0.15,
          description: "Base incident probability per year (0-1)",
        },
        averageImpactCost: {
          type: "number",
          minimum: 0,
          default: 500000,
          description: "Average impact cost per incident in USD",
        },
        maxSecurityReduction: {
          type: "number",
          minimum: 0,
          maximum: 1,
          default: 0.8,
          description: "Maximum security reduction factor (0-1)",
        },
      },
      default: {
        baseIncidentProbability: 0.15,
        averageImpactCost: 500000,
        maxSecurityReduction: 0.8,
      },
    },
    isBaseline: {
      type: "boolean",
      default: false,
      description: "Whether this scenario is marked as baseline",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["id", "name", "region"],
};

/** Default scenario values (exported for use in application) */
export const DEFAULT_SCENARIO_VALUES = {
  region: "US" as const,
  time: {
    year: 2024,
    escalationRate: 0.025,
    shockFactor: 1.5,
    shockEnabled: false,
  },
  workload: {
    utilizationClass: "Medium" as const,
    aiEnabled: false,
  },
  regulatoryIntensity: "Medium" as const,
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
};

// ============================================
// DATACENTER TCO SCHEMA
// ============================================

export const tcoSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    datacenter: {
      type: "object",
      properties: {
        land: {
          type: "object",
          properties: {
            ft: {
              type: "number",
              minimum: 0,
              default: 10,
            },
            occupancy: {
              type: "number",
              minimum: 0,
              default: 60,
            },
            powerRating: {
              type: "number",
              minimum: 0,
              default: 2,
            },
            rentalRate: {
              type: "number",
              minimum: 0,
              default: 150,
            },
            cap: {
              type: "number",
              minimum: 0,
              default: 8,
            },
          },
        },

        serverClusters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mode: {
                type: "string",
                enum: ["custom", "guided"],
                default: "guided",
              },
              cpu: {
                type: "string",
                default: "intel_gold",
              },
              homeNodeCount: {
                type: "number",
                minimum: 0,
                default: 1,
              },
              processorsPerNode: {
                type: "integer",
                enum: [1, 2],
                default: 1,
              },
              coresPerProcessor: {
                type: "integer",
                minimum: 0,
                default: 8,
              },
              ramPerNode: {
                type: "integer",
                minimum: 0,
                default: 16,
              },
              storagePerNode: {
                type: "number",
                minimum: 0,
                default: 256,
              },
              typeOfSSD: {
                type: "string",
                enum: ["high", "low", "mid"],
                default: "high",
              },
              gpu: {
                type: "string",
                default: "a100-40",
              },
              gpu_perNode: {
                type: "number",
                minimum: 0,
                default: 1,
              },
              gpu_model: {
                type: "string",
                default: "nvidia",
              },
              custom_cost_per_node: {
                type: "number",
                minimum: 0,
                default: 0,
              },
              custom_core_per_node: {
                type: "number",
                minimum: 0,
                default: 8,
              },
            },
          },
        },

        storageNodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mode: {
                type: "string",
                enum: ["custom", "guided"],
                default: "guided",
              },
              type: {
                type: "string",
                enum: ["sata", "nvme", "hdd", "tape"],
                default: "hdd",
              },
              amount: { type: "integer", minimum: 0, default: 10 },
              price: { type: "number", minimum: 0, default: 1 },
            },
          },
        },

        network: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["infiniband", "slingshot"],
              default: "infiniband",
            },
            tier: { type: "integer", enum: [1, 2, 3, 4], default: 2 },
            bandwidth: {
              type: "integer",
              enum: [50, 100, 200, 400],
              default: 100,
            },
            topology: {
              type: "string",
              enum: ["dragonfly", "fat-tree", "leaf-spine"],
              default: "spine",
            },
          },
        },

        powerDistributionAndCooling: {
          type: "object",
          properties: {
            pue: { type: "number", minimum: 0, default: 1.35 },
            cooling: {
              type: "string",
              enum: ["liquid", "air"],
              default: "liquid",
            },
          },
        },

        energyCost: {
          type: "object",
          properties: {
            eCost: { type: "number", minimum: 0, default: 0.11 },
            choice: { type: "string", enum: ["yes", "no"], default: "no" },
            usage: { type: "number", minimum: 0, default: 70 },
          },
        },

        software: {
          type: "object",
          properties: {
            os: {
              type: "string",
              enum: ["suse", "rh_vm", "rh_physical", "custom"],
              default: "suse",
            },
            priceLicense: {
              type: "number",
              minimum: 0,
              default: 0,
            },
          },
        },

        labor: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["guided", "custom"],
              default: "guided",
            },
            workers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  count: { type: "number", minimum: 0 },
                },
              },
            },
          },
        },
      },
    },
  },
  required: ["datacenter"],
};

// ============================================
// COMBINED SCHEMA (Datacenter + Scenario)
// ============================================

export const combinedSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    datacenter: tcoSchema.properties.datacenter,
    scenario: scenarioSchema,
  },
  required: ["datacenter"],
};

// ============================================
// SCHEMA DOCUMENTATION (for transparency panel)
// ============================================

export const SCHEMA_DOCUMENTATION = {
  region: {
    description: "Geographic region affecting costs",
    affects: ["Energy costs", "Labor costs", "Compliance costs"],
    values: {
      EU: "European Union - Higher energy and compliance costs",
      US: "United States - Baseline reference",
      Global: "Global average - Mixed cost profile",
    },
  },
  time: {
    description: "Scenario time parameters",
    affects: ["OPEX items (energy, labor, recurring licenses)"],
    parameters: {
      year: "Target year (baseline: 2024)",
      escalationRate: "Annual cost increase rate for OPEX",
      shockFactor: "Optional energy price shock multiplier",
    },
    notes: "CAPEX items (hardware, infrastructure) do not escalate",
  },
  workload: {
    description: "Workload utilization parameters",
    affects: ["Energy consumption", "Cooling overhead", "Monitoring costs"],
    values: {
      Low: "Low utilization (dev/test environments)",
      Medium: "Standard production workload",
      High: "High-intensity production workload",
    },
    aiMode: "AI-accelerated workloads add additional multipliers",
  },
  regulatoryIntensity: {
    description: "Level of regulatory compliance requirements",
    affects: ["Audit frequency", "Documentation overhead", "Compliance costs"],
    values: {
      Low: "Minimal compliance requirements",
      Medium: "Standard compliance (SOC2, basic certifications)",
      High: "Intensive compliance (GDPR, HIPAA, multiple certifications)",
    },
  },
  security: {
    description: "Security investment parameters",
    affects: ["Security costs", "Risk reduction factor"],
    lineItems: [
      "SIEM/Monitoring per node",
      "IAM/MFA per user",
      "Encryption/KMS per TB",
      "Incident response retainer",
    ],
  },
  risk: {
    description: "Risk model parameters for expected annual loss",
    affects: ["Expected annual loss calculation"],
    formula: "EAL = adjusted_probability × average_impact_cost",
    notes: "Security investment reduces incident probability (bounded)",
  },
  nonGoals: [
    "No forecasting or prediction (CPI/energy price prediction)",
    "No legal encoding (no GDPR article logic)",
    "No application-level workload simulation",
    "No absolute realism claims - results are comparative",
  ],
};

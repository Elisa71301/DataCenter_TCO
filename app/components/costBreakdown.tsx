"use client";

import React, { useState } from "react";
import { ComputationBreakdown } from "../context/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faBuilding,
  faServer,
  faHardDrive,
  faNetworkWired,
  faBolt,
  faCode,
  faUsers,
  faPlus,
  faShieldHalved,
  faTriangleExclamation,
  faEquals,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface CostBreakdownProps {
  className?: string;
  breakdown: ComputationBreakdown | null;
}

interface CostSection {
  id: string;
  label: string;
  icon: typeof faServer;
  color: string;
  bgColor: string;
  value: number;
  subItems?: { label: string; value: number; formula?: string }[];
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  className = "",
  breakdown,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["base", "adjustments", "compliance", "security", "risk"])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!breakdown) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
        <p className="text-gray-500 text-center py-8">
          No computation results available. Configure your datacenter to see the
          cost breakdown.
        </p>
      </div>
    );
  }

  const sections: CostSection[] = [
    {
      id: "base",
      label: "Base TCO",
      icon: faServer,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      value: breakdown.totals.baseTCO,
      subItems: [
        { label: "Land & Building", value: breakdown.baseTCO.land, formula: "ft² × rate" },
        { label: "Servers", value: breakdown.baseTCO.servers, formula: "nodes × cost/node" },
        { label: "Storage", value: breakdown.baseTCO.storage, formula: "TB × $/TB" },
        { label: "Network", value: breakdown.baseTCO.network, formula: "switches + NICs + cabling" },
        { label: "Power Distribution", value: breakdown.baseTCO.powerDistribution, formula: "kW × $/kW" },
        { label: "Energy", value: breakdown.baseTCO.energy, formula: "kWh × $/kWh × usage" },
        { label: "Software", value: breakdown.baseTCO.software, formula: "licenses × nodes" },
        { label: "Labor", value: breakdown.baseTCO.labor, formula: "FTEs × salary" },
      ],
    },
    {
      id: "adjustments",
      label: "Scenario Adjustments",
      icon: faPlus,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      value: breakdown.totals.adjustments,
      subItems: [
        {
          label: `Energy (×${breakdown.multipliers.combined.energy.toFixed(2)})`,
          value: breakdown.adjustments.energyAdjustment,
          formula: `base × (multiplier - 1)`,
        },
        {
          label: `Labor (×${breakdown.multipliers.combined.labor.toFixed(2)})`,
          value: breakdown.adjustments.laborAdjustment,
          formula: `base × (multiplier - 1)`,
        },
        {
          label: `Cooling (×${breakdown.multipliers.combined.cooling.toFixed(2)})`,
          value: breakdown.adjustments.coolingAdjustment,
          formula: `base × 40% × (multiplier - 1)`,
        },
      ],
    },
    {
      id: "compliance",
      label: "Compliance Costs",
      icon: faShieldHalved,
      color: "text-red-600",
      bgColor: "bg-red-50",
      value: breakdown.totals.compliance,
      subItems: [
        {
          label: "Audits",
          value: breakdown.complianceCosts.auditCosts,
          formula: `${breakdown.complianceCosts.breakdown.auditFrequency}×/yr × $${breakdown.complianceCosts.breakdown.costPerAudit.toLocaleString()}`,
        },
        {
          label: "Documentation",
          value: breakdown.complianceCosts.documentationCosts,
          formula: `${breakdown.complianceCosts.breakdown.documentationHours}hrs × $${breakdown.complianceCosts.breakdown.hourlyRate}/hr`,
        },
        { label: "External Advisory", value: breakdown.complianceCosts.advisoryCosts },
        { label: "Certifications", value: breakdown.complianceCosts.certificationCosts },
      ],
    },
    {
      id: "security",
      label: "Security Costs",
      icon: faShieldHalved,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      value: breakdown.totals.security,
      subItems: [
        { label: "SIEM/Monitoring", value: breakdown.securityCosts.siemCosts, formula: "$/node × nodes" },
        { label: "IAM/MFA", value: breakdown.securityCosts.iamCosts, formula: "$/user × users" },
        { label: "Encryption/KMS", value: breakdown.securityCosts.encryptionCosts, formula: "$/TB × TB" },
        { label: "Incident Response", value: breakdown.securityCosts.incidentResponseCosts, formula: "fixed retainer" },
      ],
    },
    {
      id: "risk",
      label: "Risk (Expected Annual Loss)",
      icon: faTriangleExclamation,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      value: breakdown.totals.risk,
      subItems: [
        {
          label: "Base Incident Probability",
          value: breakdown.riskCosts.breakdown.baseIncidentProbability * 100,
          formula: `${(breakdown.riskCosts.breakdown.baseIncidentProbability * 100).toFixed(1)}%`,
        },
        {
          label: "Security Reduction",
          value: breakdown.riskCosts.securityReductionFactor * 100,
          formula: `${(breakdown.riskCosts.securityReductionFactor * 100).toFixed(1)}% reduction`,
        },
        {
          label: "Adjusted Probability",
          value: breakdown.riskCosts.adjustedProbability * 100,
          formula: `${(breakdown.riskCosts.adjustedProbability * 100).toFixed(2)}%`,
        },
        {
          label: "Average Impact",
          value: breakdown.riskCosts.breakdown.averageImpactCost,
          formula: `$${breakdown.riskCosts.breakdown.averageImpactCost.toLocaleString()}`,
        },
      ],
    },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">
          Cost Breakdown
        </h3>
        <div className="text-sm text-gray-500">
          Scenario: {breakdown.scenarioName}
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full px-4 py-3 flex items-center justify-between ${section.bgColor} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={section.icon} className={section.color} />
                <span className="font-medium text-gray-800">{section.label}</span>
                {index > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded">
                    {section.value >= 0 ? "+" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${section.color}`}>
                  {section.id === "risk"
                    ? `$${section.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : section.value >= 0
                    ? `$${section.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : `-$${Math.abs(section.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </span>
                <FontAwesomeIcon
                  icon={expandedSections.has(section.id) ? faChevronDown : faChevronRight}
                  className="text-gray-400 text-sm"
                />
              </div>
            </button>

            {/* Section details */}
            <AnimatePresence>
              {expandedSections.has(section.id) && section.subItems && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-2 bg-white divide-y divide-gray-100">
                    {section.subItems.map((item, i) => (
                      <div
                        key={i}
                        className="py-2 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                          <span className="text-gray-600">{item.label}</span>
                          {item.formula && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded font-mono text-gray-500">
                              {item.formula}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-gray-800">
                          {section.id === "risk" && !item.label.includes("Impact")
                            ? typeof item.value === "number"
                              ? `${item.value.toFixed(item.value < 10 ? 2 : 1)}%`
                              : item.value
                            : `$${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Grand Total */}
        <div className="border-2 border-emerald-500 rounded-lg overflow-hidden">
          <div className="px-4 py-4 bg-emerald-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEquals} className="text-emerald-600" />
              <span className="font-bold text-gray-800 text-lg">Grand Total TCO</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              ${breakdown.totals.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="px-4 py-2 bg-emerald-25 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Base TCO</span>
              <span>${breakdown.totals.baseTCO.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Adjustments</span>
              <span>
                {breakdown.totals.adjustments >= 0 ? "+" : ""}
                ${breakdown.totals.adjustments.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>+ Compliance</span>
              <span>+${breakdown.totals.compliance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Security</span>
              <span>+${breakdown.totals.security.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Risk (EAL)</span>
              <span>+${breakdown.totals.risk.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation timestamp */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Calculated: {new Date(breakdown.calculatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default CostBreakdown;


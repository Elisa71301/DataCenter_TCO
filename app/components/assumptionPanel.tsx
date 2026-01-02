"use client";

import React, { useState } from "react";
import { useScenario } from "../context/scenarioContext";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faDownload,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { REGION_MULTIPLIERS } from "../constants/regionMultipliers";
import { TIME_PARAMETERS, COST_ESCALATION_CATEGORIES } from "../constants/timeParameters";
import { WORKLOAD_PARAMETERS } from "../constants/workloadParameters";
import { REGULATORY_PARAMETERS, REGULATORY_DISCLAIMER } from "../constants/regulatoryParameters";
import { SCHEMA_DOCUMENTATION } from "../schemas/schema";
import { downloadJSON } from "../services/scenarioStorage";

interface AssumptionPanelProps {
  className?: string;
  defaultExpanded?: boolean;
}

const AssumptionPanel: React.FC<AssumptionPanelProps> = ({
  className = "",
  defaultExpanded = false,
}) => {
  const { activeScenario, exportScenario } = useScenario();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<"parameters" | "multipliers" | "nonGoals">("parameters");

  if (!activeScenario) {
    return null;
  }

  const regionConfig = REGION_MULTIPLIERS[activeScenario.region];
  const workloadConfig = WORKLOAD_PARAMETERS[activeScenario.workload.utilizationClass];
  const regulatoryConfig = REGULATORY_PARAMETERS[activeScenario.regulatoryIntensity];

  // Calculate cumulative escalation
  const yearsFromBaseline = activeScenario.time.year - TIME_PARAMETERS.baselineYear;
  const escalationFactor = Math.pow(1 + activeScenario.time.escalationRate, yearsFromBaseline);

  const handleExportAssumptions = () => {
    const assumptions = {
      scenarioName: activeScenario.name,
      exportedAt: new Date().toISOString(),
      parameters: {
        region: activeScenario.region,
        year: activeScenario.time.year,
        escalationRate: activeScenario.time.escalationRate,
        shockEnabled: activeScenario.time.shockEnabled,
        shockFactor: activeScenario.time.shockFactor,
        workloadClass: activeScenario.workload.utilizationClass,
        aiEnabled: activeScenario.workload.aiEnabled,
        regulatoryIntensity: activeScenario.regulatoryIntensity,
        securityInvestment: activeScenario.security.annualInvestment,
      },
      multipliers: {
        region: regionConfig,
        workload: workloadConfig,
        regulatory: regulatoryConfig,
        timeEscalation: escalationFactor,
      },
      nonGoals: SCHEMA_DOCUMENTATION.nonGoals,
      disclaimer: REGULATORY_DISCLAIMER,
    };

    downloadJSON(
      JSON.stringify(assumptions, null, 2),
      `assumptions_${activeScenario.name.replace(/\s+/g, "_")}.json`
    );
  };

  const formatMultiplier = (value: number): string => {
    if (value === 1) return "±0%";
    const pct = ((value - 1) * 100).toFixed(1);
    return value > 1 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📋</span>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Assumptions & Transparency</h3>
            <p className="text-xs text-gray-500">
              Scenario: {activeScenario.name}
              {activeScenario.isBaseline && " (Baseline)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExportAssumptions();
            }}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-1" />
            Export
          </button>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {(["parameters", "multipliers", "nonGoals"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab
                        ? "bg-slate-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab === "parameters" && "Parameters"}
                    {tab === "multipliers" && "Multipliers"}
                    {tab === "nonGoals" && "Non-Goals"}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "parameters" && (
                <div className="space-y-4">
                  {/* Region */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Region</span>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm font-mono">
                        {activeScenario.region}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Affects: {SCHEMA_DOCUMENTATION.region.affects.join(", ")}
                    </p>
                    <ul className="mt-2 text-xs text-blue-700 space-y-1">
                      {regionConfig.assumptions.map((assumption, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-blue-400 mt-0.5 text-xs"
                          />
                          {assumption}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Time */}
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-amber-800">Time Index</span>
                      <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-sm font-mono">
                        {activeScenario.time.year}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
                      <div>
                        <span className="text-amber-600">Baseline Year:</span>{" "}
                        {TIME_PARAMETERS.baselineYear}
                      </div>
                      <div>
                        <span className="text-amber-600">Escalation Rate:</span>{" "}
                        {(activeScenario.time.escalationRate * 100).toFixed(1)}%/year
                      </div>
                      <div>
                        <span className="text-amber-600">Cumulative:</span>{" "}
                        {formatMultiplier(escalationFactor)}
                      </div>
                      <div>
                        <span className="text-amber-600">Shock:</span>{" "}
                        {activeScenario.time.shockEnabled
                          ? `+${((activeScenario.time.shockFactor! - 1) * 100).toFixed(0)}%`
                          : "Off"}
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 italic">
                      Note: Scenario time index, not a forecast
                    </p>
                  </div>

                  {/* Workload */}
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-emerald-800">Workload</span>
                      <span className="px-2 py-1 bg-emerald-200 text-emerald-800 rounded text-sm font-mono">
                        {activeScenario.workload.utilizationClass}
                        {activeScenario.workload.aiEnabled && " + AI"}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700">{workloadConfig.description}</p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Examples: {workloadConfig.examples.slice(0, 2).join(", ")}
                    </p>
                  </div>

                  {/* Regulatory */}
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-800">Regulatory Intensity</span>
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm font-mono">
                        {activeScenario.regulatoryIntensity}
                      </span>
                    </div>
                    <p className="text-xs text-red-700">{regulatoryConfig.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-red-600 mt-2">
                      <div>
                        Audit freq: {regulatoryConfig.auditFrequency === 0.5
                          ? "Every 2 years"
                          : regulatoryConfig.auditFrequency === 1
                          ? "Annual"
                          : `${regulatoryConfig.auditFrequency}x/year`}
                      </div>
                      <div>Doc hours: {regulatoryConfig.documentationHours}/year</div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-indigo-800">Security Investment</span>
                      <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-sm font-mono">
                        ${activeScenario.security.annualInvestment.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-indigo-600">
                      <div>SIEM/node: ${activeScenario.security.siemPerNode}/year</div>
                      <div>IAM/user: ${activeScenario.security.iamPerUser}/year</div>
                      <div>Encrypt/TB: ${activeScenario.security.encryptionPerTB}/year</div>
                      <div>IR Retainer: ${activeScenario.security.incidentResponseRetainer}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "multipliers" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These multipliers adjust base costs. Value of 1.0 = no change (baseline).
                  </p>

                  {/* Multiplier table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-medium">Source</th>
                          <th className="px-3 py-2 text-right font-medium">Energy</th>
                          <th className="px-3 py-2 text-right font-medium">Labor</th>
                          <th className="px-3 py-2 text-right font-medium">Compliance</th>
                          <th className="px-3 py-2 text-right font-medium">Cooling</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 font-medium text-blue-700">
                            Region ({activeScenario.region})
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(regionConfig.energy)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(regionConfig.labor)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(regionConfig.compliance)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-amber-700">
                            Time ({activeScenario.time.year})
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(
                              escalationFactor *
                                (activeScenario.time.shockEnabled
                                  ? activeScenario.time.shockFactor!
                                  : 1)
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(escalationFactor)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(escalationFactor)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-emerald-700">
                            Workload ({activeScenario.workload.utilizationClass}
                            {activeScenario.workload.aiEnabled && " + AI"})
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(
                              workloadConfig.energy *
                                (activeScenario.workload.aiEnabled
                                  ? WORKLOAD_PARAMETERS.AI_accelerated.energy
                                  : 1)
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(
                              workloadConfig.cooling *
                                (activeScenario.workload.aiEnabled
                                  ? WORKLOAD_PARAMETERS.AI_accelerated.cooling
                                  : 1)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-red-700">
                            Regulatory ({activeScenario.regulatoryIntensity})
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {formatMultiplier(regulatoryConfig.complianceMultiplier)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-400">
                            —
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* What escalates */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Cost Categories & Escalation
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(COST_ESCALATION_CATEGORIES).map(([key, config]) => (
                        <div
                          key={key}
                          className={`px-2 py-1 rounded ${
                            config.escalates
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {config.description}: {config.escalates ? "Escalates" : "Fixed"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "nonGoals" && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-yellow-600 mt-0.5"
                      />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-2">
                          Explicitly Not Modeled
                        </h4>
                        <ul className="space-y-2 text-sm text-yellow-700">
                          {SCHEMA_DOCUMENTATION.nonGoals.map((nonGoal, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-yellow-500">•</span>
                              {nonGoal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">Model Purpose</h4>
                    <p className="text-sm text-slate-600">
                      This tool provides <strong>comparative scenario analysis</strong> for
                      data center TCO. Results should be interpreted as relative comparisons
                      between scenarios, not absolute predictions or compliance assessments.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs">
                    <h4 className="font-medium text-red-800 mb-2">Regulatory Disclaimer</h4>
                    <pre className="whitespace-pre-wrap text-red-700 font-sans">
                      {REGULATORY_DISCLAIMER}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssumptionPanel;


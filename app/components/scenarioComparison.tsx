"use client";

import React, { useState, useMemo } from "react";
import { useScenario } from "../context/scenarioContext";
import { ComputationBreakdown, ScenarioParameters } from "../context/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faDownload,
  faBalanceScale,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { downloadCSV, comparisonToCSV } from "../services/scenarioStorage";

interface ScenarioComparisonProps {
  className?: string;
  breakdowns: Map<string, ComputationBreakdown>;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  className = "",
  breakdowns,
}) => {
  const { scenarios, activeScenarioId, getBaselineScenario } = useScenario();
  const [scenarioAId, setScenarioAId] = useState<string>("");
  const [scenarioBId, setScenarioBId] = useState<string>("");

  // Auto-select baseline and active scenario
  React.useEffect(() => {
    const baseline = getBaselineScenario();
    if (baseline && !scenarioAId) {
      setScenarioAId(baseline.id);
    }
    if (activeScenarioId && activeScenarioId !== scenarioAId && !scenarioBId) {
      setScenarioBId(activeScenarioId);
    }
  }, [scenarios, activeScenarioId, getBaselineScenario, scenarioAId, scenarioBId]);

  const scenarioA = scenarios.find((s) => s.id === scenarioAId);
  const scenarioB = scenarios.find((s) => s.id === scenarioBId);
  const breakdownA = scenarioAId ? breakdowns.get(scenarioAId) : undefined;
  const breakdownB = scenarioBId ? breakdowns.get(scenarioBId) : undefined;

  // Calculate deltas
  const comparison = useMemo(() => {
    if (!breakdownA || !breakdownB || !scenarioA || !scenarioB) return null;

    const deltas = {
      baseTCO: breakdownB.totals.baseTCO - breakdownA.totals.baseTCO,
      adjustments: breakdownB.totals.adjustments - breakdownA.totals.adjustments,
      compliance: breakdownB.totals.compliance - breakdownA.totals.compliance,
      security: breakdownB.totals.security - breakdownA.totals.security,
      risk: breakdownB.totals.risk - breakdownA.totals.risk,
      grandTotal: breakdownB.totals.grandTotal - breakdownA.totals.grandTotal,
    };

    const percentageChange =
      breakdownA.totals.grandTotal !== 0
        ? (deltas.grandTotal / breakdownA.totals.grandTotal) * 100
        : 0;

    // Find parameter differences
    const paramDiffs: Array<{
      param: string;
      valueA: string | number;
      valueB: string | number;
    }> = [];

    if (scenarioA.region !== scenarioB.region) {
      paramDiffs.push({
        param: "Region",
        valueA: scenarioA.region,
        valueB: scenarioB.region,
      });
    }
    if (scenarioA.time.year !== scenarioB.time.year) {
      paramDiffs.push({
        param: "Year",
        valueA: scenarioA.time.year,
        valueB: scenarioB.time.year,
      });
    }
    if (scenarioA.time.escalationRate !== scenarioB.time.escalationRate) {
      paramDiffs.push({
        param: "Escalation Rate",
        valueA: `${(scenarioA.time.escalationRate * 100).toFixed(1)}%`,
        valueB: `${(scenarioB.time.escalationRate * 100).toFixed(1)}%`,
      });
    }
    if (scenarioA.workload.utilizationClass !== scenarioB.workload.utilizationClass) {
      paramDiffs.push({
        param: "Workload Class",
        valueA: scenarioA.workload.utilizationClass,
        valueB: scenarioB.workload.utilizationClass,
      });
    }
    if (scenarioA.workload.aiEnabled !== scenarioB.workload.aiEnabled) {
      paramDiffs.push({
        param: "AI Mode",
        valueA: scenarioA.workload.aiEnabled ? "On" : "Off",
        valueB: scenarioB.workload.aiEnabled ? "On" : "Off",
      });
    }
    if (scenarioA.regulatoryIntensity !== scenarioB.regulatoryIntensity) {
      paramDiffs.push({
        param: "Regulatory Intensity",
        valueA: scenarioA.regulatoryIntensity,
        valueB: scenarioB.regulatoryIntensity,
      });
    }
    if (scenarioA.security.annualInvestment !== scenarioB.security.annualInvestment) {
      paramDiffs.push({
        param: "Security Investment",
        valueA: `$${scenarioA.security.annualInvestment.toLocaleString()}`,
        valueB: `$${scenarioB.security.annualInvestment.toLocaleString()}`,
      });
    }

    return { deltas, percentageChange, paramDiffs };
  }, [breakdownA, breakdownB, scenarioA, scenarioB]);

  const formatDelta = (value: number) => {
    const formatted = Math.abs(value).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
    if (value > 0) return `+$${formatted}`;
    if (value < 0) return `-$${formatted}`;
    return "$0";
  };

  const getDeltaColor = (value: number, inverted: boolean = false) => {
    if (value === 0) return "text-gray-500";
    if (inverted) {
      return value > 0 ? "text-red-600" : "text-green-600";
    }
    return value > 0 ? "text-red-600" : "text-green-600";
  };

  const handleExportCSV = () => {
    if (!scenarioA || !scenarioB || !breakdownA || !breakdownB) return;
    const csv = comparisonToCSV(scenarioA, scenarioB, breakdownA, breakdownB);
    downloadCSV(csv, `comparison_${scenarioA.name}_vs_${scenarioB.name}.csv`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faBalanceScale} className="text-blue-500" />
          Scenario Comparison
        </h3>
        {comparison && (
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-1" />
            Export CSV
          </button>
        )}
      </div>

      {/* Scenario selectors */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Scenario A</label>
          <select
            value={scenarioAId}
            onChange={(e) => setScenarioAId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select scenario...</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isBaseline && "(Baseline)"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-xl" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Scenario B</label>
          <select
            value={scenarioBId}
            onChange={(e) => setScenarioBId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select scenario...</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isBaseline && "(Baseline)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!comparison && (
        <div className="text-center py-8 text-gray-500">
          <p>Select two scenarios with computed results to compare.</p>
          <p className="text-sm mt-2">
            Make sure both scenarios have been calculated.
          </p>
        </div>
      )}

      {comparison && breakdownA && breakdownB && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Parameter differences */}
          {comparison.paramDiffs.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-3">Parameter Differences</h4>
              <div className="space-y-2">
                {comparison.paramDiffs.map((diff, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{diff.param}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-200 rounded">
                        {diff.valueA}
                      </span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-gray-400"
                      />
                      <span className="px-2 py-1 bg-blue-200 rounded">
                        {diff.valueB}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left font-medium">Cost Category</th>
                  <th className="px-4 py-3 text-right font-medium">
                    {scenarioA?.name}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {scenarioB?.name}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Delta</th>
                  <th className="px-4 py-3 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <CostRow
                  label="Base TCO"
                  valueA={breakdownA.totals.baseTCO}
                  valueB={breakdownB.totals.baseTCO}
                  delta={comparison.deltas.baseTCO}
                />
                <CostRow
                  label="Adjustments"
                  valueA={breakdownA.totals.adjustments}
                  valueB={breakdownB.totals.adjustments}
                  delta={comparison.deltas.adjustments}
                />
                <CostRow
                  label="Compliance"
                  valueA={breakdownA.totals.compliance}
                  valueB={breakdownB.totals.compliance}
                  delta={comparison.deltas.compliance}
                />
                <CostRow
                  label="Security"
                  valueA={breakdownA.totals.security}
                  valueB={breakdownB.totals.security}
                  delta={comparison.deltas.security}
                />
                <CostRow
                  label="Risk (EAL)"
                  valueA={breakdownA.totals.risk}
                  valueB={breakdownB.totals.risk}
                  delta={comparison.deltas.risk}
                />
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3 text-right">
                    ${breakdownA.totals.grandTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${breakdownB.totals.grandTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${getDeltaColor(
                      comparison.deltas.grandTotal
                    )}`}
                  >
                    {formatDelta(comparison.deltas.grandTotal)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${getDeltaColor(
                      comparison.percentageChange
                    )}`}
                  >
                    {comparison.percentageChange > 0 ? "+" : ""}
                    {comparison.percentageChange.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary card */}
          <div
            className={`p-4 rounded-lg ${
              comparison.deltas.grandTotal > 0
                ? "bg-red-50 border border-red-200"
                : comparison.deltas.grandTotal < 0
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">
                  {scenarioB?.name} vs {scenarioA?.name}
                </div>
                <div className="text-lg font-bold">
                  {comparison.deltas.grandTotal > 0
                    ? "Higher cost scenario"
                    : comparison.deltas.grandTotal < 0
                    ? "Lower cost scenario"
                    : "Same cost"}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold flex items-center gap-2 ${getDeltaColor(
                    comparison.deltas.grandTotal
                  )}`}
                >
                  {comparison.deltas.grandTotal !== 0 && (
                    <FontAwesomeIcon
                      icon={
                        comparison.deltas.grandTotal > 0 ? faArrowUp : faArrowDown
                      }
                    />
                  )}
                  {formatDelta(comparison.deltas.grandTotal)}
                </div>
                <div className="text-sm text-gray-500">
                  ({comparison.percentageChange > 0 ? "+" : ""}
                  {comparison.percentageChange.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper component for cost rows
const CostRow: React.FC<{
  label: string;
  valueA: number;
  valueB: number;
  delta: number;
}> = ({ label, valueA, valueB, delta }) => {
  const percentChange = valueA !== 0 ? (delta / valueA) * 100 : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">{label}</td>
      <td className="px-4 py-3 text-right font-mono">
        ${valueA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        ${valueB.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </td>
      <td
        className={`px-4 py-3 text-right font-mono ${
          delta > 0 ? "text-red-600" : delta < 0 ? "text-green-600" : "text-gray-500"
        }`}
      >
        {delta > 0 ? "+" : ""}
        {delta !== 0
          ? `$${delta.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          : "$0"}
      </td>
      <td
        className={`px-4 py-3 text-right ${
          delta > 0 ? "text-red-600" : delta < 0 ? "text-green-600" : "text-gray-500"
        }`}
      >
        {percentChange > 0 ? "+" : ""}
        {percentChange.toFixed(1)}%
      </td>
    </tr>
  );
};

export default ScenarioComparison;


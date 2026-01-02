"use client";

import React, { useState, useMemo } from "react";
import { useScenario } from "../context/scenarioContext";
import { ComputationBreakdown } from "../context/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSliders,
  faBolt,
  faUsers,
  faShieldHalved,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

interface SensitivityAnalysisProps {
  className?: string;
  baseBreakdown: ComputationBreakdown | null;
  baseTCOInput: {
    energy: number;
    labor: number;
  };
}

type SensitivityParam = "energy" | "labor" | "security";

interface SensitivityResult {
  param: SensitivityParam;
  label: string;
  icon: typeof faBolt;
  color: string;
  baseValue: number;
  perturbation: number;
  lowResult: number;
  highResult: number;
  delta: number;
  percentImpact: number;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  className = "",
  baseBreakdown,
  baseTCOInput,
}) => {
  const { activeScenario } = useScenario();
  const [perturbation, setPerturbation] = useState(0.2); // 20% default

  // Calculate sensitivity for each parameter
  const sensitivities = useMemo((): SensitivityResult[] => {
    if (!baseBreakdown || !activeScenario) return [];

    const baseTotal = baseBreakdown.totals.grandTotal;

    // Energy sensitivity
    const energyLow = baseTCOInput.energy * (1 - perturbation);
    const energyHigh = baseTCOInput.energy * (1 + perturbation);
    const energyDelta = baseTCOInput.energy * perturbation;

    // Labor sensitivity
    const laborLow = baseTCOInput.labor * (1 - perturbation);
    const laborHigh = baseTCOInput.labor * (1 + perturbation);
    const laborDelta = baseTCOInput.labor * perturbation;

    // Security sensitivity (affects risk calculation)
    const securityBase = activeScenario.security.annualInvestment;
    const securityLow = securityBase * (1 - perturbation);
    const securityHigh = securityBase * (1 + perturbation);
    const securityDelta = securityBase * perturbation;

    // Approximate impact (simplified - real calculation would re-run engine)
    const energyImpact = energyDelta * baseBreakdown.multipliers.combined.energy;
    const laborImpact = laborDelta * baseBreakdown.multipliers.combined.labor;

    return [
      {
        param: "energy" as SensitivityParam,
        label: "Energy Cost",
        icon: faBolt,
        color: "text-amber-500",
        baseValue: baseTCOInput.energy,
        perturbation,
        lowResult: baseTotal - energyImpact,
        highResult: baseTotal + energyImpact,
        delta: energyImpact,
        percentImpact: (energyImpact / baseTotal) * 100,
      },
      {
        param: "labor" as SensitivityParam,
        label: "Labor Cost",
        icon: faUsers,
        color: "text-blue-500",
        baseValue: baseTCOInput.labor,
        perturbation,
        lowResult: baseTotal - laborImpact,
        highResult: baseTotal + laborImpact,
        delta: laborImpact,
        percentImpact: (laborImpact / baseTotal) * 100,
      },
      {
        param: "security" as SensitivityParam,
        label: "Security Investment",
        icon: faShieldHalved,
        color: "text-indigo-500",
        baseValue: securityBase,
        perturbation,
        lowResult: baseTotal - securityDelta * 0.5, // Simplified impact
        highResult: baseTotal + securityDelta * 0.5,
        delta: securityDelta * 0.5,
        percentImpact: ((securityDelta * 0.5) / baseTotal) * 100,
      },
    ];
  }, [baseBreakdown, activeScenario, baseTCOInput, perturbation]);

  // Sort by impact for tornado chart
  const sortedSensitivities = [...sensitivities].sort(
    (a, b) => b.percentImpact - a.percentImpact
  );

  // Find max impact for chart scaling
  const maxImpact = Math.max(...sensitivities.map((s) => s.percentImpact));

  if (!baseBreakdown) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
        <p className="text-gray-500">No computation results available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faSliders} className="text-purple-500" />
          Sensitivity Analysis
        </h3>
        <div className="text-sm text-gray-500">
          Base TCO: ${baseBreakdown.totals.grandTotal.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </div>
      </div>

      {/* Info box */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        This analysis shows how the total TCO changes when individual parameters
        are perturbed. It does{" "}
        <strong>not</strong> change the baseline assumptions.
      </div>

      {/* Perturbation slider */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Perturbation Range
          </span>
          <span className="text-lg font-bold text-purple-600">
            ±{(perturbation * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min={0.05}
          max={0.5}
          step={0.05}
          value={perturbation}
          onChange={(e) => setPerturbation(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>±5%</span>
          <span>±50%</span>
        </div>
      </div>

      {/* Tornado chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Impact Ranking (Tornado Chart)
        </h4>
        <div className="space-y-3">
          {sortedSensitivities.map((s, index) => (
            <motion.div
              key={s.param}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3 mb-1">
                <FontAwesomeIcon icon={s.icon} className={`${s.color} w-4`} />
                <span className="text-sm font-medium text-gray-700">
                  {s.label}
                </span>
                <span className="text-xs text-gray-500">
                  ±${s.delta.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              {/* Bar chart */}
              <div className="flex items-center h-8">
                {/* Left bar (decrease) */}
                <div className="flex-1 flex justify-end">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(s.percentImpact / maxImpact) * 100}%`,
                    }}
                    className="h-6 bg-green-400 rounded-l flex items-center justify-start pl-2"
                  >
                    <span className="text-xs text-white font-medium">
                      -{s.percentImpact.toFixed(1)}%
                    </span>
                  </motion.div>
                </div>
                {/* Center line */}
                <div className="w-px h-8 bg-gray-400 mx-1" />
                {/* Right bar (increase) */}
                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(s.percentImpact / maxImpact) * 100}%`,
                    }}
                    className="h-6 bg-red-400 rounded-r flex items-center justify-end pr-2"
                  >
                    <span className="text-xs text-white font-medium">
                      +{s.percentImpact.toFixed(1)}%
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed results table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left font-medium">Parameter</th>
              <th className="px-3 py-2 text-right font-medium">
                -{(perturbation * 100).toFixed(0)}%
              </th>
              <th className="px-3 py-2 text-right font-medium">Base</th>
              <th className="px-3 py-2 text-right font-medium">
                +{(perturbation * 100).toFixed(0)}%
              </th>
              <th className="px-3 py-2 text-right font-medium">Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sensitivities.map((s) => (
              <tr key={s.param} className="hover:bg-gray-50">
                <td className="px-3 py-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={s.icon} className={`${s.color}`} />
                  {s.label}
                </td>
                <td className="px-3 py-2 text-right font-mono text-green-600">
                  ${s.lowResult.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  ${baseBreakdown.totals.grandTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-3 py-2 text-right font-mono text-red-600">
                  ${s.highResult.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-3 py-2 text-right font-mono text-gray-500">
                  ${(s.highResult - s.lowResult).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Key Insights</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • <strong>{sortedSensitivities[0]?.label}</strong> has the highest
            impact on TCO
          </li>
          <li>
            • A {(perturbation * 100).toFixed(0)}% change in{" "}
            {sortedSensitivities[0]?.label.toLowerCase()} results in{" "}
            {sortedSensitivities[0]?.percentImpact.toFixed(1)}% TCO change
          </li>
          <li>
            • Total TCO range:{" "}
            ${(
              baseBreakdown.totals.grandTotal -
              sensitivities.reduce((sum, s) => sum + s.delta, 0)
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
            -{" "}
            ${(
              baseBreakdown.totals.grandTotal +
              sensitivities.reduce((sum, s) => sum + s.delta, 0)
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SensitivityAnalysis;


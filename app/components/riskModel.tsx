"use client";

import React from "react";
import { useScenario } from "../context/scenarioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faShieldHalved,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

interface RiskModelProps {
  className?: string;
  totalSecurityInvestment: number;
}

const RiskModel: React.FC<RiskModelProps> = ({
  className = "",
  totalSecurityInvestment,
}) => {
  const { activeScenario, updateScenario } = useScenario();

  if (!activeScenario) {
    return null;
  }

  const { risk } = activeScenario;

  // Calculate security reduction factor (logarithmic diminishing returns)
  const referenceInvestment = 50000;
  const maxInvestment = 500000;
  const investmentRatio =
    Math.log(1 + totalSecurityInvestment / referenceInvestment) /
    Math.log(1 + maxInvestment / referenceInvestment);
  const securityReductionFactor = Math.min(
    risk.maxSecurityReduction,
    investmentRatio * risk.maxSecurityReduction
  );

  // Calculate adjusted probability
  const adjustedProbability =
    risk.baseIncidentProbability * (1 - securityReductionFactor);

  // Calculate expected annual loss
  const expectedAnnualLoss = adjustedProbability * risk.averageImpactCost;

  const updateRiskParam = (key: keyof typeof risk, value: number) => {
    updateScenario(activeScenario.id, {
      risk: { ...risk, [key]: value },
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-orange-500" />
          Risk Model
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Expected Annual Loss</div>
          <div className="text-xl font-bold text-orange-600">
            ${expectedAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        <strong>Comparative scenario insight, not prediction.</strong> This model
        provides relative risk comparisons between scenarios, not absolute risk
        predictions.
      </div>

      {/* Formula display */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg font-mono text-sm space-y-2">
        <div className="text-slate-600 text-xs uppercase tracking-wide mb-2">
          Formula
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-orange-600 font-bold">EAL</span>
            <span className="text-gray-400">=</span>
            <span className="text-blue-600">adjusted_probability</span>
            <span className="text-gray-400">×</span>
            <span className="text-purple-600">average_impact_cost</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-blue-600">adjusted_probability</span>
            <span className="text-gray-400">=</span>
            <span className="text-gray-600">base_probability</span>
            <span className="text-gray-400">×</span>
            <span className="text-gray-600">(1 - reduction_factor)</span>
          </div>
        </div>
      </div>

      {/* Visual calculation breakdown */}
      <div className="space-y-4">
        {/* Base probability */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Base Incident Probability</span>
            <span className="text-lg font-bold text-gray-900">
              {(risk.baseIncidentProbability * 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.5}
            step={0.01}
            value={risk.baseIncidentProbability}
            onChange={(e) =>
              updateRiskParam("baseIncidentProbability", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>Annual probability without security controls</span>
            <span>50%</span>
          </div>
        </div>

        {/* Security reduction */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faShieldHalved} className="text-green-500" />
            <span className="font-medium text-green-800">Security Reduction Factor</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 bg-white rounded">
              <div className="text-xs text-gray-500">Investment</div>
              <div className="font-mono font-bold text-green-700">
                ${totalSecurityInvestment.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-white rounded">
              <div className="text-xs text-gray-500">Reduction</div>
              <div className="font-mono font-bold text-green-700">
                {(securityReductionFactor * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-2 bg-white rounded">
              <div className="text-xs text-gray-500">Max Reduction</div>
              <div className="font-mono font-bold text-gray-500">
                {(risk.maxSecurityReduction * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Diminishing returns visualization */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${(securityReductionFactor / risk.maxSecurityReduction) * 100}%`,
              }}
            />
            <div
              className="absolute h-full border-r-2 border-green-800"
              style={{
                left: `${(securityReductionFactor / risk.maxSecurityReduction) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-green-600 mt-1">
            <span>0%</span>
            <span>
              Logarithmic diminishing returns (bounded at{" "}
              {(risk.maxSecurityReduction * 100).toFixed(0)}%)
            </span>
            <span>{(risk.maxSecurityReduction * 100).toFixed(0)}%</span>
          </div>

          {/* Max reduction slider */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Max Security Reduction</span>
              <span className="font-mono">
                {(risk.maxSecurityReduction * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.05}
              value={risk.maxSecurityReduction}
              onChange={(e) =>
                updateRiskParam("maxSecurityReduction", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>

        {/* Adjusted probability */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-800">Adjusted Probability</span>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-700">
                {(adjustedProbability * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-blue-600">
                {(risk.baseIncidentProbability * 100).toFixed(1)}% × (1 -{" "}
                {(securityReductionFactor * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Average impact cost */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-purple-800">Average Impact Cost</span>
            <span className="text-lg font-bold text-purple-700">
              ${risk.averageImpactCost.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={50000}
            max={5000000}
            step={50000}
            value={risk.averageImpactCost}
            onChange={(e) =>
              updateRiskParam("averageImpactCost", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-purple-400 mt-1">
            <span>$50K</span>
            <span>Average cost per security incident</span>
            <span>$5M</span>
          </div>
        </div>

        {/* Final EAL */}
        <div className="p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold text-orange-800 text-lg">
                Expected Annual Loss (EAL)
              </div>
              <div className="text-sm text-orange-600 font-mono">
                {(adjustedProbability * 100).toFixed(2)}% ×{" "}
                ${risk.averageImpactCost.toLocaleString()}
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              ${expectedAnnualLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Risk metrics */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-500">Without Security</div>
          <div className="font-bold text-red-600">
            $
            {(risk.baseIncidentProbability * risk.averageImpactCost).toLocaleString(
              undefined,
              { maximumFractionDigits: 0 }
            )}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Risk Reduction</div>
          <div className="font-bold text-green-600">
            $
            {(
              risk.baseIncidentProbability * risk.averageImpactCost -
              expectedAnnualLoss
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="text-gray-500">ROI Ratio</div>
          <div className="font-bold text-blue-600">
            {totalSecurityInvestment > 0
              ? (
                  (risk.baseIncidentProbability * risk.averageImpactCost -
                    expectedAnnualLoss) /
                  totalSecurityInvestment
                ).toFixed(2)
              : "N/A"}
            x
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskModel;


"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";

interface ModelScopeProps {
  className?: string;
}

const ModelScope: React.FC<ModelScopeProps> = ({ className = "" }) => {
  const goals = [
    "Extend the tool into a research artifact",
    "Add scenario parameters for structural variation (region, time, workload, regulation)",
    "Make assumptions explicit, exportable, and testable",
    "Enable comparative scenario analysis (A/B/C)",
    "Provide transparent cost breakdown with traceable calculations",
    "Support sensitivity analysis for key parameters",
  ];

  const nonGoals = [
    {
      item: "No forecasting or prediction",
      detail: "CPI/energy price prediction, demand forecasting are out of scope",
    },
    {
      item: "No legal encoding",
      detail: "No GDPR article logic, no checklists implying legal compliance",
    },
    {
      item: "No application-level workload simulation",
      detail: "No performance modeling or trace-based analysis",
    },
    {
      item: 'No "absolute realism" claims',
      detail: "Results are comparative and scenario-based, not predictions",
    },
  ];

  const deliverables = [
    "Scenario layer with presets and JSON import/export",
    "Parameter schema for Region / Time / Workload / Regulatory intensity",
    "Transparent breakdown: base cost + security/compliance + risk-adjusted loss",
    "Minimal sensitivity analysis (±20% sliders)",
    "Assumption transparency panel",
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faFlask} className="text-purple-500 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-800">Model Scope & Non-Goals</h2>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        {/* Purpose statement */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Purpose</h3>
          <p className="text-purple-700">
            This tool is a <strong>research artifact</strong> designed for comparative
            scenario analysis of data center Total Cost of Ownership (TCO). It models
            structural variation across regions, time periods, workload classes, and
            regulatory environments.
          </p>
        </div>

        {/* Goals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
            Goals
          </h3>
          <ul className="space-y-2">
            {goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mt-1 flex-shrink-0"
                />
                <span className="text-gray-700">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Non-Goals */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faTimes} className="text-yellow-600" />
            Explicitly Out of Scope
          </h3>
          <ul className="space-y-3">
            {nonGoals.map((ng, i) => (
              <li key={i} className="flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faTimes}
                  className="text-yellow-600 mt-1 flex-shrink-0"
                />
                <div>
                  <span className="font-medium text-yellow-800">{ng.item}</span>
                  <p className="text-sm text-yellow-700">{ng.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Deliverables */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h3>
          <ul className="space-y-2">
            {deliverables.map((d, i) => (
              <li
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"
              >
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-700">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interpretation note */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
            How to Interpret Results
          </h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>
              • Results are <strong>comparative</strong>, not absolute predictions
            </li>
            <li>
              • Use to compare scenarios (e.g., "EU vs US" or "2024 vs 2027")
            </li>
            <li>
              • All assumptions are visible and can be adjusted
            </li>
            <li>
              • Export scenarios for reproducibility and documentation
            </li>
            <li>
              • The model is transparent — all formulas are visible
            </li>
          </ul>
        </div>

        {/* Citation suggestion */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
          <p>
            <strong>For academic use:</strong> When citing results from this tool, include
            the exported scenario JSON file and reference the specific parameter values used.
            This ensures reproducibility and transparency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelScope;


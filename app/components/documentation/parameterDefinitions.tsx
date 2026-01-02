"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faClock,
  faServer,
  faShield,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { REGION_MULTIPLIERS } from "../../constants/regionMultipliers";
import { TIME_PARAMETERS } from "../../constants/timeParameters";
import { WORKLOAD_PARAMETERS } from "../../constants/workloadParameters";
import { REGULATORY_PARAMETERS } from "../../constants/regulatoryParameters";

interface ParameterDefinitionsProps {
  className?: string;
}

const ParameterDefinitions: React.FC<ParameterDefinitionsProps> = ({
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Parameter Definitions
      </h2>

      <div className="space-y-8">
        {/* Region */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="text-blue-500" />
            Region
          </h3>
          <p className="text-gray-600 mb-4">
            Geographic region affecting energy costs, labor costs, and compliance overhead.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-right">Energy</th>
                  <th className="px-4 py-2 text-right">Labor</th>
                  <th className="px-4 py-2 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(Object.keys(REGION_MULTIPLIERS) as Array<keyof typeof REGION_MULTIPLIERS>).map((region) => (
                  <tr key={region} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{region}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{REGION_MULTIPLIERS[region].energy.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{REGION_MULTIPLIERS[region].labor.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{REGION_MULTIPLIERS[region].compliance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Multipliers are applied to the base cost. Value of 1.0 = no change (US baseline).
          </div>
        </section>

        {/* Time */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-amber-500" />
            Time Index
          </h3>
          <p className="text-gray-600 mb-4">
            Time-based escalation for OPEX items. This is a scenario index, not a forecast.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-800">Baseline Year</div>
              <div className="text-2xl font-bold text-amber-700">
                {TIME_PARAMETERS.baselineYear}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-800">Default Escalation</div>
              <div className="text-2xl font-bold text-amber-700">
                {(TIME_PARAMETERS.defaultEscalationRate * 100).toFixed(1)}%/year
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              What escalates (OPEX):
            </div>
            <div className="flex flex-wrap gap-2">
              {["Energy", "Labor", "Software Licenses", "Maintenance", "Compliance"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              What does NOT escalate (CAPEX):
            </div>
            <div className="flex flex-wrap gap-2">
              {["Servers", "Storage", "Network", "Building", "Power Distribution"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            <strong>Shock Factor:</strong> Optional multiplier applied to energy costs only.
            Use for what-if analysis of energy price shocks (e.g., 1.5 = 50% increase).
          </div>
        </section>

        {/* Workload */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faServer} className="text-emerald-500" />
            Workload Class
          </h3>
          <p className="text-gray-600 mb-4">
            Coarse utilization multipliers for energy, cooling, and monitoring costs.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-right">Energy</th>
                  <th className="px-4 py-2 text-right">Cooling</th>
                  <th className="px-4 py-2 text-right">Monitoring</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(["Low", "Medium", "High"] as const).map((wc) => (
                  <tr key={wc} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{wc}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{WORKLOAD_PARAMETERS[wc].energy.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{WORKLOAD_PARAMETERS[wc].cooling.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{WORKLOAD_PARAMETERS[wc].monitoring.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {WORKLOAD_PARAMETERS[wc].description}
                    </td>
                  </tr>
                ))}
                <tr className="bg-purple-50">
                  <td className="px-4 py-2 font-medium">+ AI Mode</td>
                  <td className="px-4 py-2 text-right font-mono">
                    ×{WORKLOAD_PARAMETERS.AI_accelerated.energy.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    ×{WORKLOAD_PARAMETERS.AI_accelerated.cooling.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    ×{WORKLOAD_PARAMETERS.AI_accelerated.monitoring.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-xs text-purple-700">
                    Applied on top of class
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Regulatory */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faShield} className="text-red-500" />
            Regulatory Intensity
          </h3>
          <p className="text-gray-600 mb-4">
            Abstract compliance level affecting audit frequency and documentation overhead.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-50">
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-right">Audit Freq</th>
                  <th className="px-4 py-2 text-right">Doc Hours</th>
                  <th className="px-4 py-2 text-right">Compliance ×</th>
                  <th className="px-4 py-2 text-center">Advisory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(["Low", "Medium", "High"] as const).map((level) => (
                  <tr key={level} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{level}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      {REGULATORY_PARAMETERS[level].auditFrequency}/year
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {REGULATORY_PARAMETERS[level].documentationHours}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      ×{REGULATORY_PARAMETERS[level].complianceMultiplier.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {REGULATORY_PARAMETERS[level].externalAdvisoryIncluded ? "✓" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
            This is a cost model, not a compliance checker. Consult qualified professionals
            for actual regulatory requirements.
          </div>
        </section>

        {/* Risk */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-orange-500" />
            Risk Model
          </h3>
          <p className="text-gray-600 mb-4">
            Simple, explainable model for expected annual loss calculation.
          </p>
          <div className="p-4 bg-orange-50 rounded-lg font-mono text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-orange-600 font-bold">EAL</span>
                <span className="text-gray-600"> = </span>
                <span className="text-blue-600">adjusted_probability</span>
                <span className="text-gray-600"> × </span>
                <span className="text-purple-600">average_impact_cost</span>
              </div>
              <div className="text-xs">
                <span className="text-blue-600">adjusted_probability</span>
                <span className="text-gray-600"> = </span>
                <span>base_probability × (1 - security_reduction_factor)</span>
              </div>
              <div className="text-xs">
                <span>security_reduction_factor</span>
                <span className="text-gray-600"> = </span>
                <span>f(security_investment) [logarithmic, bounded]</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            The security reduction factor uses logarithmic diminishing returns and is
            bounded at the configured maximum (typically 70-90%). This prevents unrealistic
            claims about risk elimination.
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParameterDefinitions;


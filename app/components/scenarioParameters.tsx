"use client";

import React from "react";
import { useScenario } from "../context/scenarioContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faBolt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { TIME_PARAMETERS } from "../constants/timeParameters";

interface ScenarioParametersProps {
  className?: string;
}

const ScenarioParameters: React.FC<ScenarioParametersProps> = ({
  className = "",
}) => {
  const {
    activeScenario,
    setYear,
    setEscalationRate,
    setShockEnabled,
    setShockFactor,
    updateScenario,
  } = useScenario();

  if (!activeScenario) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
        <p className="text-gray-500">No scenario selected</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-4 space-y-5 border border-purple-200 ${className}`}>
      <h3 className="font-bold text-purple-800 text-lg mb-4">
        Scenario Parameters
      </h3>

      {/* Time Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          <FontAwesomeIcon icon={faClock} className="text-purple-500" />
          <span>Time Index</span>
          <div className="group relative">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="text-purple-400 text-sm cursor-help"
            />
            <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg left-0 top-6">
              <p className="font-medium mb-1">Time index affects OPEX:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Energy costs escalate</li>
                <li>Labor costs escalate</li>
                <li>Recurring licenses escalate</li>
              </ul>
              <p className="mt-2 text-purple-300">
                Note: This is a scenario parameter, not a forecast.
              </p>
            </div>
          </div>
        </div>

        {/* Year slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Year</span>
            <span className="font-mono font-medium text-purple-800">{activeScenario.time.year}</span>
          </div>
          <input
            type="range"
            min={TIME_PARAMETERS.minYear}
            max={TIME_PARAMETERS.maxYear}
            value={activeScenario.time.year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-purple-400">
            <span>{TIME_PARAMETERS.minYear}</span>
            <span className="text-purple-600 font-medium">
              Baseline: {TIME_PARAMETERS.baselineYear}
            </span>
            <span>{TIME_PARAMETERS.maxYear}</span>
          </div>
        </div>

        {/* Escalation rate */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Escalation Rate</span>
            <span className="font-mono font-medium text-purple-800">
              {(activeScenario.time.escalationRate * 100).toFixed(1)}%/year
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={0.1}
            step={0.005}
            value={activeScenario.time.escalationRate}
            onChange={(e) => setEscalationRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Shock toggle */}
        <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="text-purple-500" />
              <span className="text-sm font-medium text-purple-700">
                Energy Price Shock
              </span>
            </div>
            <p className="text-xs text-purple-500 mt-1">
              Optional multiplier for energy costs only
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activeScenario.time.shockEnabled}
              onChange={(e) => setShockEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {activeScenario.time.shockEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 pl-4 border-l-2 border-purple-300"
          >
            <div className="flex justify-between text-sm">
              <span className="text-purple-600">Shock Factor</span>
              <span className="font-mono font-medium text-purple-800">
                +{((activeScenario.time.shockFactor! - 1) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={activeScenario.time.shockFactor || 1.5}
              onChange={(e) => setShockFactor(parseFloat(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </motion.div>
        )}
      </div>

      {/* Description field */}
      <div className="space-y-2 pt-3 border-t border-purple-200">
        <label className="text-sm text-purple-600">Scenario Description</label>
        <textarea
          value={activeScenario.description || ""}
          onChange={(e) =>
            updateScenario(activeScenario.id, { description: e.target.value })
          }
          placeholder="Add notes about this scenario..."
          className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none bg-white"
          rows={2}
        />
      </div>
    </div>
  );
};

export default ScenarioParameters;

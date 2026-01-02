"use client";

import React, { useState } from "react";
import { useScenario } from "../context/scenarioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCopy,
  faTrash,
  faStar,
  faCheck,
  faPencil,
  faDownload,
  faUpload,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRESET_SCENARIOS,
  getPresetScenario,
  downloadJSON,
} from "../services/scenarioStorage";

interface ScenarioSelectorProps {
  className?: string;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ className = "" }) => {
  const {
    scenarios,
    activeScenarioId,
    activeScenario,
    createScenario,
    deleteScenario,
    cloneScenario,
    setActiveScenario,
    setBaseline,
    updateScenario,
    exportScenario,
    importScenario,
  } = useScenario();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const handleCreateNew = () => {
    const count = scenarios.length + 1;
    createScenario(`Scenario ${String.fromCharCode(64 + count)}`);
    setIsDropdownOpen(false);
  };

  const handleClone = () => {
    if (activeScenarioId) {
      cloneScenario(activeScenarioId);
    }
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    if (activeScenarioId && scenarios.length > 1) {
      if (confirm("Delete this scenario? This cannot be undone.")) {
        deleteScenario(activeScenarioId);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleSetBaseline = () => {
    if (activeScenarioId) {
      setBaseline(activeScenarioId);
    }
    setIsDropdownOpen(false);
  };

  const handleRename = () => {
    if (activeScenario) {
      setNewName(activeScenario.name);
      setIsRenaming(true);
    }
    setIsDropdownOpen(false);
  };

  const handleSaveRename = () => {
    if (activeScenarioId && newName.trim()) {
      updateScenario(activeScenarioId, { name: newName.trim() });
    }
    setIsRenaming(false);
  };

  const handleExport = () => {
    if (activeScenarioId) {
      const json = exportScenario(activeScenarioId);
      if (json) {
        const filename = `scenario_${activeScenario?.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
        downloadJSON(json, filename);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const imported = importScenario(content);
          if (!imported) {
            alert("Failed to import scenario. Invalid format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setIsDropdownOpen(false);
  };

  const handleLoadPreset = (index: number) => {
    const preset = getPresetScenario(index);
    if (preset) {
      const json = JSON.stringify(preset);
      importScenario(json);
    }
    setShowPresets(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">Scenario</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
            title="Load preset scenario"
          >
            Presets
          </button>
          <button
            onClick={handleImport}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Import scenario from JSON"
          >
            <FontAwesomeIcon icon={faUpload} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Preset selector */}
      <AnimatePresence>
        {showPresets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="bg-indigo-50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-indigo-700 font-medium mb-2">Load a preset scenario:</p>
              {PRESET_SCENARIOS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleLoadPreset(index)}
                  className="w-full text-left px-3 py-2 bg-white rounded border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-sm"
                >
                  <div className="font-medium text-gray-800">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario selector dropdown */}
      <div className="relative">
        {isRenaming ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveRename}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-between hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {activeScenario?.isBaseline && (
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500 text-sm"
                  title="Baseline scenario"
                />
              )}
              <span className="font-medium text-gray-800">
                {activeScenario?.name || "Select Scenario"}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""}
            </span>
          </button>
        )}

        {/* Dropdown menu */}
        <AnimatePresence>
          {isDropdownOpen && !isRenaming && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Scenario list */}
              <div className="max-h-48 overflow-y-auto">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      setActiveScenario(scenario.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      scenario.id === activeScenarioId ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {scenario.isBaseline ? (
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-yellow-500 text-sm"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="text-gray-300 text-xs"
                        />
                      )}
                      <span className="font-medium text-gray-800">
                        {scenario.name}
                      </span>
                    </div>
                    {scenario.id === activeScenarioId && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-blue-500 text-sm"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleCreateNew}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  New
                </button>
                <button
                  onClick={handleClone}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faCopy} />
                  Clone
                </button>
                <button
                  onClick={handleRename}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faPencil} />
                  Rename
                </button>
                <button
                  onClick={handleSetBaseline}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  disabled={activeScenario?.isBaseline}
                >
                  <FontAwesomeIcon icon={faStar} />
                  Baseline
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Export
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  disabled={scenarios.length <= 1}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick info */}
      {activeScenario && (
        <div className="mt-3 text-xs text-gray-500">
          <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
            {activeScenario.region}
          </span>
          <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
            {activeScenario.time.year}
          </span>
          <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
            {activeScenario.workload.utilizationClass}
            {activeScenario.workload.aiEnabled && " + AI"}
          </span>
          <span className="inline-block px-2 py-1 bg-gray-100 rounded">
            {activeScenario.regulatoryIntensity} Reg
          </span>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;


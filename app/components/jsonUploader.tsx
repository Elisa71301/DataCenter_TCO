// components/JsonUploader.tsx
"use client";
import React, { useRef, useState } from "react";
import { useTCO } from "../context/useContext";
import { useScenario } from "../context/scenarioContext";
import { faUpload, faDownload, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { downloadJSON } from "../services/scenarioStorage";

const JsonUploader: React.FC = () => {
  const { loadSchema, land, serverClusterJson, storageNode, network, powerDistributionAndCooling, energyCost, software, labor } = useTCO();
  const { activeScenario, importScenario, exportScenario } = useScenario();
  const [errorMessage, setErrorMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<"datacenter" | "scenario" | "combined">("combined");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "application/json" || file.name.endsWith(".json"))
    ) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const json = JSON.parse(e.target?.result as string);

          // Handle combined format (datacenter + scenario)
          if (json.datacenter) {
            const result = loadSchema(json.datacenter);
            if (!result.success) {
              const errorMessages = result.errors
                ?.map((err) => `${err.instancePath} ${err.message}`)
                .join("\n");
              setErrorMessage(`Invalid datacenter format:\n${errorMessages}`);
              return;
            }
          }

          // Handle scenario import
          if (json.scenario) {
            const imported = importScenario(JSON.stringify(json.scenario));
            if (!imported) {
              setErrorMessage("Failed to import scenario");
              return;
            }
          }

          // Handle standalone scenario file
          if (json.type === "single_scenario" || (json.id && json.region)) {
            const imported = importScenario(e.target?.result as string);
            if (!imported) {
              setErrorMessage("Failed to import scenario");
              return;
            }
          }

          setErrorMessage("");
        } catch (err) {
          console.error("Error parsing JSON file:", err);
          setErrorMessage("Error parsing JSON file");
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    } else {
      setErrorMessage("Please upload a valid JSON file.");
    }
  };

  const handleExportCombined = () => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      datacenter: {
        land,
        serverClusterJson,
        storageNode,
        network,
        powerDistributionAndCooling,
        energyCost,
        software,
        labor,
      },
      scenario: activeScenario,
    };

    const filename = `tco_export_${activeScenario?.name.replace(/\s+/g, "_") || "config"}_${new Date().toISOString().split("T")[0]}.json`;
    downloadJSON(JSON.stringify(exportData, null, 2), filename);
    setShowMenu(false);
  };

  const handleExportScenarioOnly = () => {
    if (activeScenario) {
      const json = exportScenario(activeScenario.id);
      if (json) {
        const filename = `scenario_${activeScenario.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
        downloadJSON(json, filename);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-1">
        {/* Upload button */}
        <div className="rounded-full bg-gray-200 p-[5px] sm:p-3 hover:scale-110 hover:border transition-all">
          <FontAwesomeIcon
            onClick={handleButtonClick}
            className="text-gray-700 hover:text-blue-800 text-lg sm:text-2xl cursor-pointer"
            icon={faUpload}
            title="Upload configuration"
          />
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>

        {/* Export button with menu */}
        <div className="rounded-full bg-gray-200 p-[5px] sm:p-3 hover:scale-110 hover:border transition-all">
          <FontAwesomeIcon
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-700 hover:text-green-800 text-lg sm:text-2xl cursor-pointer"
            icon={faDownload}
            title="Export configuration"
          />
        </div>
      </div>

      {/* Export menu */}
      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px]">
          <button
            onClick={handleExportCombined}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">📦</span>
            <div>
              <div className="font-medium">Export All</div>
              <div className="text-xs text-gray-500">Datacenter + Scenario</div>
            </div>
          </button>
          <button
            onClick={handleExportScenarioOnly}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 border-t"
          >
            <span className="text-lg">🔬</span>
            <div>
              <div className="font-medium">Scenario Only</div>
              <div className="text-xs text-gray-500">Parameters & settings</div>
            </div>
          </button>
          <button
            onClick={() => setShowMenu(false)}
            className="w-full px-4 py-2 text-center text-xs text-gray-500 hover:bg-gray-100 transition-colors border-t"
          >
            Cancel
          </button>
        </div>
      )}

      {errorMessage && (
        <pre className="absolute top-full left-0 mt-2 text-red-500 text-xs whitespace-pre-wrap bg-white p-2 rounded shadow max-w-[200px]">
          {errorMessage}
        </pre>
      )}
    </div>
  );
};

export default JsonUploader;

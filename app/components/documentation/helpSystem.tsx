"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faTimes,
  faBook,
  faFlask,
  faDownload,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import ModelScope from "./modelScope";
import ParameterDefinitions from "./parameterDefinitions";

interface HelpSystemProps {
  className?: string;
}

const HelpSystem: React.FC<HelpSystemProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"scope" | "params" | "methodology" | "export">("scope");

  const sections = [
    { id: "scope" as const, label: "Model Scope", icon: faFlask },
    { id: "params" as const, label: "Parameters", icon: faBook },
    { id: "methodology" as const, label: "Methodology", icon: faChartLine },
    { id: "export" as const, label: "Export & Reproducibility", icon: faDownload },
  ];

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all hover:scale-110 flex items-center justify-center z-40 ${className}`}
        title="Help & Documentation"
      >
        <FontAwesomeIcon icon={faQuestionCircle} className="text-xl" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faBook} />
                  Documentation & Help
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex border-b bg-gray-50">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeSection === section.id
                        ? "bg-white text-purple-600 border-b-2 border-purple-500"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <FontAwesomeIcon icon={section.icon} />
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {activeSection === "scope" && <ModelScope />}
                {activeSection === "params" && <ParameterDefinitions />}
                {activeSection === "methodology" && <MethodologySection />}
                {activeSection === "export" && <ExportSection />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Methodology section component
const MethodologySection: React.FC = () => (
  <div className="prose prose-sm max-w-none">
    <h2>Scenario Methodology</h2>
    
    <h3>Why Scenario-Based Modeling?</h3>
    <p>
      Scenario-based modeling is used because:
    </p>
    <ul>
      <li>
        <strong>Uncertainty handling:</strong> Future costs are inherently uncertain.
        Scenarios allow exploring multiple possible futures without claiming prediction.
      </li>
      <li>
        <strong>Comparative analysis:</strong> The value is in comparing scenarios,
        not in absolute numbers. "EU costs 15% more than US" is more actionable than
        "EU costs $X."
      </li>
      <li>
        <strong>Transparency:</strong> Each scenario explicitly states its assumptions,
        making the analysis reproducible and defensible.
      </li>
      <li>
        <strong>Flexibility:</strong> Parameters can be adjusted to match specific
        organizational contexts or research questions.
      </li>
    </ul>

    <h3>Computation Layers</h3>
    <p>The TCO calculation is split into transparent layers:</p>
    <ol>
      <li>
        <strong>Base TCO:</strong> Direct hardware, infrastructure, and operational costs
      </li>
      <li>
        <strong>Multipliers Layer:</strong> Region, time, and workload adjustments
      </li>
      <li>
        <strong>Compliance Layer:</strong> Audit, documentation, and certification costs
      </li>
      <li>
        <strong>Risk Layer:</strong> Expected annual loss from security incidents
      </li>
    </ol>
    <p>
      Each layer can be examined independently, enabling debugging and validation
      of the calculation.
    </p>

    <h3>Multiplier Application</h3>
    <p>
      Multipliers are applied multiplicatively. For example:
    </p>
    <pre className="bg-gray-100 p-3 rounded text-sm">
{`Energy Cost = Base Energy × Region Multiplier × Time Escalation × Workload Multiplier

Example:
$100,000 × 1.35 (EU) × 1.077 (3 years at 2.5%) × 1.4 (High workload)
= $203,490`}
    </pre>

    <h3>Limitations</h3>
    <p>
      This model explicitly does not:
    </p>
    <ul>
      <li>Predict future prices or inflation</li>
      <li>Simulate application workloads or performance</li>
      <li>Verify regulatory compliance</li>
      <li>Account for vendor-specific pricing or discounts</li>
    </ul>
  </div>
);

// Export section component
const ExportSection: React.FC = () => (
  <div className="prose prose-sm max-w-none">
    <h2>Export & Reproducibility</h2>

    <h3>Ensuring Reproducible Results</h3>
    <p>
      For academic or professional documentation, reproducibility is essential.
      This tool supports full export/import of scenarios to ensure results can
      be verified and replicated.
    </p>

    <h3>Export Formats</h3>
    <div className="space-y-4 not-prose">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-800 mb-2">JSON Export (Recommended)</h4>
        <p className="text-sm text-blue-700">
          Exports all scenario parameters in machine-readable JSON format.
          Can be re-imported to reproduce exact results.
        </p>
        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
{`{
  "version": "1.0",
  "scenario": {
    "name": "EU 2027 High Regulation",
    "region": "EU",
    "time": { "year": 2027, "escalationRate": 0.025 },
    "workload": { "utilizationClass": "Medium" },
    "regulatoryIntensity": "High"
  }
}`}
        </pre>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <h4 className="font-bold text-green-800 mb-2">CSV Export (Comparison)</h4>
        <p className="text-sm text-green-700">
          Exports scenario comparison tables in CSV format for use in
          spreadsheets or further analysis.
        </p>
      </div>

      <div className="p-4 bg-purple-50 rounded-lg">
        <h4 className="font-bold text-purple-800 mb-2">Assumption Panel Export</h4>
        <p className="text-sm text-purple-700">
          Exports all current assumptions and multiplier values. Ideal for
          including in thesis appendix or documentation.
        </p>
      </div>
    </div>

    <h3>Best Practices for Documentation</h3>
    <ol>
      <li>
        <strong>Export scenarios with results:</strong> Include the JSON export
        alongside any charts or tables in your documentation.
      </li>
      <li>
        <strong>Document baseline:</strong> Clearly identify which scenario is
        your baseline for comparisons.
      </li>
      <li>
        <strong>Version your exports:</strong> Include dates in filenames to track
        which version of parameters was used.
      </li>
      <li>
        <strong>Include the Assumption Panel:</strong> Screenshots of the assumption
        panel provide at-a-glance parameter visibility.
      </li>
    </ol>

    <h3>Import Process</h3>
    <p>
      To reproduce results from an exported scenario:
    </p>
    <ol>
      <li>Click the upload button and select the JSON file</li>
      <li>The scenario will be imported with a new ID (to avoid conflicts)</li>
      <li>Select the imported scenario from the dropdown</li>
      <li>Results should match the original export</li>
    </ol>
  </div>
);

export default HelpSystem;


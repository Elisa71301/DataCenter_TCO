"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TypeAnimation } from "react-type-animation";
import Land from "./components/land";
import Server from "./components/server";
import Network from "./components/network";
import PieChart from "./components/pieChart";
import { v4 as uuidv4 } from "uuid";
import PowerDistribution from "./components/powerDistribution";
import PowerCost from "./components/powerCost";
import SoftwareLicense from "./components/softwareLicense";
import Storage from "./components/storage";
import Labor from "./components/labor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import {
  faChevronUp,
  faChevronDown,
  faCheck,
  faUpload,
  faFlask,
  faBuilding,
  faServer,
  faBolt,
  faFileContract,
  faGlobe,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import JsonUploader from "./components/jsonUploader";
import { useTCO } from "./context/useContext";
import { useScenario } from "./context/scenarioContext";
import Link from "next/link";

// Scenario components
import ScenarioSelector from "./components/scenarioSelector";
import ScenarioParameters from "./components/scenarioParameters";
import AssumptionPanel from "./components/assumptionPanel";
import CostBreakdown from "./components/costBreakdown";
import SecurityControls from "./components/securityControls";
import RiskModel from "./components/riskModel";
import ScenarioComparison from "./components/scenarioComparison";
import SensitivityAnalysis from "./components/sensitivityAnalysis";
import HelpSystem from "./components/documentation/helpSystem";
import { computeScenarioTCO, BaseTCOInput } from "./services/computationEngine";
import { ComputationBreakdown, Region, WorkloadClass, RegulatoryIntensity } from "./context/types";
import { getRegionImpactSummary } from "./constants/regionMultipliers";
import { WORKLOAD_PARAMETERS } from "./constants/workloadParameters";
import { REGULATORY_PARAMETERS } from "./constants/regulatoryParameters";

interface serverClusterProps {
  index: string;
  modeProp: string;
  cpuProp: string;
  homeNodeCountProp: number;
  processorsPerNodeProp: number;
  coresPerProcessorProp: number;
  ramPerNodeProp: number;
  storagePerNodeProp: number;
  typeOfSSDProp: string;
  gpuProp: string;
  gpu_perNodeProp?: number;
  gpu_modelProp?: string;
  custom_cost_per_nodeProp?: number;
  custom_core_per_nodeProp?: number;
  totalCost: number;
  serverConsumption: number;
  coreNumber: number;
}

interface storageClusterProps {
  id: string;
  storage: number;
  totalCost: number;
  consumption: number;
  mode?: "custom" | "guided";
  type?: "sata" | "nvme" | "hdd" | "tape";
  price?: number;
}

// Section Header Component
const SectionHeader = ({
  icon,
  iconColor,
  title,
  description,
  isOpen,
  onToggle,
  totalCost,
}: {
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  totalCost?: number;
}) => (
  <div
    className="flex flex-row items-center justify-between cursor-pointer p-4 hover:bg-gray-50 transition-colors rounded-t-2xl"
    onClick={onToggle}
  >
    <div className="flex flex-row items-center">
      <FontAwesomeIcon icon={icon} className={`${iconColor} text-xl mr-3`} />
      <div className="font-bold text-lg">{title}</div>
      <div className="flex hoverable-button justify-center items-center w-[16px] h-[16px] ml-3 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
        i
      </div>
      <span className="z-10 display-on-hover absolute w-[90%] md:w-[75%] top-[50px] left-[0px] md:top-[50px] md:left-[50px] right-0 mx-auto p-3 text-white bg-gray-500 text-xs sm:text-sm rounded-lg shadow">
        {description}
      </span>
    </div>
    <div className="flex items-center gap-4">
      {totalCost !== undefined && (
        <div className="text-sm font-semibold text-gray-600">
          ${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
      )}
      <FontAwesomeIcon
        icon={isOpen ? faChevronUp : faChevronDown}
        className="text-gray-500"
      />
    </div>
  </div>
);

export default function Home() {
  const [serverClusters, setServerClusters] = useState<serverClusterProps[]>(
    []
  );
  const [storageCluster, setStorageClusters] = useState<storageClusterProps[]>(
    []
  );
  const [description, setDescription] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [totalNodeCount, setTotalNodeCount] = useState(0);
  const [totalGPUCount, setTotalGPUCount] = useState(0);
  const [propertyValue, setPropertyValue] = useState(0);
  const [bandwidth, setBandwidth] = useState(50);
  const [totalNetCost, setTotalNetCost] = useState(0);
  const [tier, setTier] = useState(2);
  const [totalServerConsumption, setTotalServerConsumption] = useState(0);
  const [totalNetworkConsumption, setTotalNetworkConsumption] = useState(0);
  const [totalPCost, setTotalPCost] = useState(0);
  const [costOfPower, setCostOfPower] = useState(0);
  const [totalServerCost, setTotalServerCost] = useState(0);
  const [coresNumber, setCoreNumber] = useState(0);
  const [softwareLicenseCost, setSoftwareLicenseCost] = useState(0);
  const [totalStorageCost, setTotalStorageCost] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [laborChoice, setLaborChoice] = useState(false);

  // Section collapse states
  const [section1Open, setSection1Open] = useState(true);
  const [section2Open, setSection2Open] = useState(true);
  const [section3Open, setSection3Open] = useState(true);
  const [section4Open, setSection4Open] = useState(true);

  const {
    setServerClusterJson,
    storageNode,
    serverClusterJson,
    setStorageNode,
  } = useTCO();

  const [pue, setPueValue] = useState(1.35);
  
  // Scenario state
  const [showScenarioPanel, setShowScenarioPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<"config" | "analysis">("config");
  const {
    activeScenario,
    setComputationResult,
    computationResults,
    setRegion,
    setWorkloadClass,
    setAIEnabled,
    setRegulatoryIntensity,
    setSecurityInvestment,
    updateScenario,
  } = useScenario();
  const [currentBreakdown, setCurrentBreakdown] = useState<ComputationBreakdown | null>(null);

  const regions: Region[] = ["US", "EU", "Global"];
  const workloadClasses: WorkloadClass[] = ["Low", "Medium", "High"];
  const regulatoryLevels: RegulatoryIntensity[] = ["Low", "Medium", "High"];

  const addServerCluster = () => {
    setServerClusters([
      ...serverClusters,
      {
        index: uuidv4(),
        homeNodeCountProp: 1,
        gpuProp: "no",
        modeProp: "guided",
        cpuProp: "intel_gold",
        processorsPerNodeProp: 1,
        coresPerProcessorProp: 8,
        ramPerNodeProp: 4,
        storagePerNodeProp: 64,
        typeOfSSDProp: "high_ssd",
        gpu_modelProp: "A100_40",
        totalCost: 0,
        serverConsumption: 0,
        coreNumber: 0,
      },
    ]);
  };

  const addStorageCluster = () => {
    setStorageClusters([
      ...storageCluster,
      {
        id: uuidv4(),
        storage: 10,
        totalCost: 0,
        consumption: 0,
      },
    ]);
  };

  const removeServerCluster = (index: string) => {
    setServerClusters(
      serverClusters.filter((cluster) => cluster.index !== index)
    );
  };

  const removeStorageCluster = (id: string) => {
    setStorageClusters(storageCluster.filter((cluster) => cluster.id !== id));
  };

  const updateServerCluster = useCallback((index: string, newCost: number) => {
    setServerClusters((prevClusters) =>
      prevClusters.map((cluster) =>
        cluster.index === index ? { ...cluster, totalCost: newCost } : cluster
      )
    );
  }, []);

  const updateServerNodeCluster = useCallback(
    (index: string, newNode: number) => {
      setServerClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.index === index
            ? { ...cluster, homeNodeCountProp: newNode }
            : cluster
        )
      );
    },
    []
  );

  const updateServerCoreNumber = useCallback(
    (index: string, newNode: number) => {
      setServerClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.index === index
            ? { ...cluster, coreNumber: newNode }
            : cluster
        )
      );
    },
    []
  );

  const updateServerGpuNumber = useCallback(
    (index: string, GpuNode: number) => {
      setServerClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.index === index
            ? { ...cluster, gpu_perNodeProp: GpuNode }
            : cluster
        )
      );
    },
    []
  );

  const updateServerNodeConsumption = useCallback(
    (index: string, newCons: number) => {
      setServerClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.index === index
            ? { ...cluster, serverConsumption: newCons }
            : cluster
        )
      );
    },
    []
  );

  const updateStorageNodeConsumption = useCallback(
    (id: string, newCons: number) => {
      setStorageClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.id === id ? { ...cluster, consumption: newCons } : cluster
        )
      );
    },
    []
  );

  const updateStorageAmount = useCallback((id: string, newNode: number) => {
    setStorageClusters((prevClusters) =>
      prevClusters.map((cluster) =>
        cluster.id === id ? { ...cluster, storage: newNode } : cluster
      )
    );
  }, []);

  const updateStorageClusterCost = useCallback(
    (id: string, newCost: number) => {
      setStorageClusters((prevClusters) =>
        prevClusters.map((cluster) =>
          cluster.id === id ? { ...cluster, totalCost: newCost } : cluster
        )
      );
    },
    []
  );

  const descriptionTexts = [
    "This website provides a practical and easy-to-use tool to estimate the Total Cost of Ownership (TCO) of a Data Center.",
    "The tool is still under construction as it does not yet include all costs associated with a data center, and the models to estimate costs must still be fine-tuned. However, it already serves as a good starting point.",
    "If you have some suggestions or find some errors, please send an email to mbonaf3@uic.edu. Thanks! 😊",
  ];

  // New State Variables for Typewriter Effect
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);

  // Reset typed lines and start typing when description is toggled open
  useEffect(() => {
    if (description) {
      setTypedLines([]);
      setCurrentLineIndex(0);
    }
  }, [description]);

  useEffect(() => {
    // Calculate total costs whenever dependencies change
    const totalServerCosttemp = serverClusters.reduce(
      (sum, cluster) => sum + cluster.totalCost,
      0
    );

    const totalNode = serverClusters.reduce(
      (sum, cluster) => sum + cluster.homeNodeCountProp,
      0
    );
    const totalServerP = serverClusters.reduce(
      (sum, cluster) => sum + cluster.serverConsumption,
      0
    );

    const totalCoreNumber = serverClusters.reduce(
      (sum, cluster) => sum + cluster.coreNumber,
      0
    );

    const tmp_storage = storageCluster.reduce(
      (sum, cluster) => sum + cluster.storage,
      0
    );

    const tmp_storage_consumption = storageCluster.reduce(
      (sum, cluster) => sum + cluster.consumption,
      0
    );

    const tmp_storage_cost = storageCluster.reduce(
      (sum, cluster) => sum + cluster.totalCost,
      0
    );

    let totalGPU = 0;

    serverClusters.forEach((cluster) => {
      if (cluster.gpu_perNodeProp && cluster.gpu_perNodeProp >= 2) {
        totalGPU += cluster.gpu_perNodeProp * cluster.homeNodeCountProp;
      }
    });
    setTotalGPUCount(totalGPU);
    setTotalStorageCost(tmp_storage_cost);
    setTotalStorage(tmp_storage);

    setCoreNumber(totalCoreNumber);
    setTotalServerConsumption(totalServerP + tmp_storage_consumption);
    setTotalNodeCount(totalNode);
    console.log(totalNodeCount);

    setTotalCost(
      totalServerCosttemp +
        totalNetCost +
        propertyValue +
        totalPCost +
        costOfPower +
        tmp_storage_cost +
        softwareLicenseCost +
        (laborChoice ? laborCost : 0)
    );
    setTotalServerCost(totalServerCosttemp);
  }, [
    serverClusters,
    totalNetCost,
    propertyValue,
    totalPCost,
    storageCluster,
    laborChoice,
    laborCost,
    softwareLicenseCost,
  ]);

  useEffect(() => {
    if (serverClusterJson && Array.isArray(serverClusterJson)) {
      const newClusters = serverClusterJson.map((node) => ({
        index: uuidv4(),
        homeNodeCountProp: node.homeNodeCount || 1,
        gpuProp: node.gpu || "no",
        modeProp: node.mode || "guided",
        cpuProp: node.cpu || "intel_gold",
        processorsPerNodeProp: node.processorsPerNode || 1,
        coresPerProcessorProp: node.coresPerProcessor || 8,
        ramPerNodeProp: node.ramPerNode || 4,
        storagePerNodeProp: node.storagePerNode || 64,
        typeOfSSDProp: node.typeOfSSD || "high_ssd",
        gpu_modelProp: node.gpu_model || "A100_40",
        gpu_perNodeProp: node.gpu_perNode || 1,
        totalCost: 0,
        serverConsumption: 0,
        coreNumber: 0,
      }));
      setServerClusters(newClusters);
    }
  }, [serverClusterJson]);

  useEffect(() => {
    if (storageNode && Array.isArray(storageNode)) {
      const newClusters = storageNode.map((node) => ({
        id: uuidv4(),
        storage: node.amount ?? 10,
        totalCost: 0,
        consumption: 0,
        mode: node.mode,
        price: node.price,
        type: node.type,
      }));
      setStorageClusters(newClusters);
    }
  }, [storageNode]);

  // Compute scenario TCO when relevant values change
  useEffect(() => {
    if (!activeScenario) return;

    const baseTCO: BaseTCOInput = {
      land: propertyValue,
      servers: totalServerCost,
      storage: totalStorageCost,
      network: totalNetCost,
      powerDistribution: totalPCost,
      energy: costOfPower,
      software: softwareLicenseCost,
      labor: laborChoice ? laborCost : 0,
    };

    const context = {
      nodeCount: totalNodeCount,
      totalStorageTB: totalStorage,
    };

    try {
      const breakdown = computeScenarioTCO(baseTCO, activeScenario, context);
      setCurrentBreakdown(breakdown);
      setComputationResult(activeScenario.id, breakdown);
    } catch (error) {
      console.error("Error computing scenario TCO:", error);
    }
  }, [
    activeScenario,
    propertyValue,
    totalServerCost,
    totalStorageCost,
    totalNetCost,
    totalPCost,
    costOfPower,
    softwareLicenseCost,
    laborCost,
    laborChoice,
    totalNodeCount,
    totalStorage,
    setComputationResult,
  ]);

  // Calculate section totals
  const section1Total = propertyValue;
  const section2Total = totalServerCost + totalStorageCost + totalNetCost;
  const section3Total = totalPCost + costOfPower;
  const section4Total = softwareLicenseCost + (laborChoice ? laborCost : 0);

  return (
    <main className="flex flex-col text-center justify-center space-y-8 text-sm items-center bg-gray-100 h-full pb-12 relative">
      <div
        title="Upload Json Configuration"
        className="fixed z-10 bottom-2 right-1 md:bottom-4 md:right-3 lg:bottom-6 lg:right-6"
      >
        <JsonUploader></JsonUploader>
        <Link href="/infoUpload">
          <div
            className="absolute top-0 right-[2px] mt-[-8px] mr-[2px] w-[13px] h-[13px] bg-gray-700 text-white rounded-full hover:bg-gray-600 hover:scale-125 transform transition-all duration-200 flex items-center justify-center"
            aria-label="Instructions for Uploading JSON Configuration"
            title="View Instructions"
          >
            <span className="text-xs">i</span>
          </div>
        </Link>
      </div>
      <div className="w-full max-w-4xl px-4">
        <div className="flex flex-row items-center justify-center mt-5">
          <div className="text-2xl font-bold">DATA CENTER TCO CALCULATOR</div>
          <FontAwesomeIcon
            onClick={() => setDescription(!description)}
            className="text-gray-600 text-lg ml-2 cursor-pointer"
            icon={description ? faChevronUp : faChevronDown}
          />
        </div>
        <AnimatePresence>
          {description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden mt-4 bg-white p-6 rounded-lg shadow-lg"
            >
              {/* Typewriter Animation */}
              <div>
                {typedLines.map((line, index) => (
                  <p key={index} className="block text-md font-semibold mb-2">
                    {line}
                  </p>
                ))}
                {currentLineIndex < descriptionTexts.length && (
                  <TypeAnimation
                    key={currentLineIndex} // Ensures TypeAnimation resets for each new line
                    sequence={[
                      descriptionTexts[currentLineIndex],
                      200, // Wait for 1 second after typing
                      () => {
                        setTypedLines((prev) => [
                          ...prev,
                          descriptionTexts[currentLineIndex],
                        ]);
                        setCurrentLineIndex((prev) => prev + 1);
                      },
                    ]}
                    speed={80} // Adjust typing speed as needed
                    wrapper="p"
                    cursor={true}
                    repeat={0} // Do not loop the animation
                    style={{ whiteSpace: "pre-line", fontWeight: "600" }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scenario Panel - Research Artifact Extension */}
      <div className="w-full max-w-6xl px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faFlask} className="text-purple-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-800">Scenario Analysis</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Research Mode
            </span>
          </div>
          <button
            onClick={() => setShowScenarioPanel(!showScenarioPanel)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            {showScenarioPanel ? "Hide" : "Show"} Scenario Panel
          </button>
        </div>

        <AnimatePresence>
          {showScenarioPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Tab navigation */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("config")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "config"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Configuration
                </button>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "analysis"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Analysis & Comparison
                </button>
              </div>

              {/* Config Tab */}
              {activeTab === "config" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <ScenarioSelector />
                  <ScenarioParameters className="lg:col-span-2" />
                </div>
              )}

              {/* Analysis Tab */}
              {activeTab === "analysis" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CostBreakdown breakdown={currentBreakdown} />
                    <RiskModel
                      totalSecurityInvestment={
                        currentBreakdown?.securityCosts.total || 0
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SensitivityAnalysis
                      baseBreakdown={currentBreakdown}
                      baseTCOInput={{
                        energy: costOfPower,
                        labor: laborChoice ? laborCost : 0,
                      }}
                    />
                    <ScenarioComparison breakdowns={computationResults} />
                  </div>
                </div>
              )}

              {/* Assumption Panel - Always visible in scenario mode */}
              <div className="mt-4">
                <AssumptionPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========== SECTION 1: LAND & BUILDING ========== */}
      <div className="w-7/8 bg-white text-left rounded-2xl relative shadow-md">
        <SectionHeader
          icon={faBuilding}
          iconColor="text-amber-600"
          title="LAND & BUILDING"
          description="Land and Building cost refers to the expenses associated with acquiring the land and constructing the infrastructure necessary to house all the required equipment. This section also includes Region selection which affects energy costs, labor costs, and compliance costs."
          isOpen={section1Open}
          onToggle={() => setSection1Open(!section1Open)}
          totalCost={section1Total}
        />
        <AnimatePresence>
          {section1Open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Region Selection - moved from ScenarioParameters */}
              {activeScenario && (
                <div className="px-4 pb-4 border-b border-gray-100">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <FontAwesomeIcon icon={faGlobe} className="text-amber-600" />
                      <span>Region</span>
                      <div className="group relative">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-gray-400 text-sm cursor-help"
                        />
                        <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg left-0 top-6">
                          <p className="font-medium mb-1">Region affects:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Energy costs (electricity prices)</li>
                            <li>Labor costs (wages)</li>
                            <li>Compliance costs (regulatory overhead)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() => setRegion(region)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeScenario.region === region
                              ? "bg-amber-500 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {getRegionImpactSummary(activeScenario.region)}
                    </p>
                  </div>
                </div>
              )}
              <Land
                homePropertyValue={propertyValue}
                setPropertyValue={setPropertyValue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========== SECTION 2: SERVER, STORAGE & NETWORK ========== */}
      <div className="w-7/8 bg-white text-left rounded-2xl relative shadow-md">
        <SectionHeader
          icon={faServer}
          iconColor="text-emerald-600"
          title="SERVER, STORAGE & NETWORK"
          description="This section covers all computing infrastructure costs including servers, storage systems, and networking equipment. It also includes Workload settings which affect energy consumption, cooling overhead, and monitoring requirements."
          isOpen={section2Open}
          onToggle={() => setSection2Open(!section2Open)}
          totalCost={section2Total}
        />
        <AnimatePresence>
          {section2Open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Workload Selection - moved from ScenarioParameters */}
              {activeScenario && (
                <div className="px-4 pb-4 border-b border-gray-100">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <FontAwesomeIcon icon={faServer} className="text-emerald-600" />
                      <span>Workload Class</span>
                      <div className="group relative">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-gray-400 text-sm cursor-help"
                        />
                        <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg left-0 top-6">
                          <p className="font-medium mb-1">Workload affects:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Energy consumption</li>
                            <li>Cooling overhead</li>
                            <li>Monitoring volume</li>
                          </ul>
                          <p className="mt-2 text-emerald-300">
                            Coarse utilization scenario, not app simulation.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {workloadClasses.map((wc) => (
                        <button
                          key={wc}
                          onClick={() => setWorkloadClass(wc)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeScenario.workload.utilizationClass === wc
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {wc}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {WORKLOAD_PARAMETERS[activeScenario.workload.utilizationClass].description}
                    </p>

                    {/* AI mode toggle */}
                    <div className="flex items-center justify-between p-3 bg-emerald-100 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          AI-Accelerated Workloads
                        </span>
                        <p className="text-xs text-gray-500">
                          Higher energy and cooling multipliers
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeScenario.workload.aiEnabled}
                          onChange={(e) => setAIEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Server Clusters */}
              {serverClusters.map((cluster) => (
                <div
                  className="border-b border-gray-100 pb-6 mb-4 relative"
                  key={cluster.index}
                >
                  <div className="p-4 font-bold w-full lg:text-left text-gray-700">
                    SERVER CLUSTER
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <Server
                      index={cluster.index}
                      homeNodeCountProp={cluster.homeNodeCountProp}
                      modeProp={cluster.modeProp}
                      cpuProp={cluster.cpuProp}
                      processorsPerNodeProp={cluster.processorsPerNodeProp}
                      coresPerProcessorProp={cluster.coresPerProcessorProp}
                      ramPerNodeProp={cluster.ramPerNodeProp}
                      storagePerNodeProp={cluster.storagePerNodeProp}
                      typeOfSSDProp={cluster.typeOfSSDProp}
                      gpuProp={cluster.gpuProp}
                      gpu_perNodeProp={cluster.gpu_perNodeProp || 0}
                      gpu_modelProp={cluster.gpu_modelProp || "H100"}
                      custom_core_per_nodeProp={cluster.custom_core_per_nodeProp || 1}
                      custom_cost_per_nodeProp={cluster.custom_cost_per_nodeProp || 1}
                      updateServerCluster={updateServerCluster}
                      updateServerNodeCluster={updateServerNodeCluster}
                      updateServerNodeConsumption={updateServerNodeConsumption}
                      updateServerCoreNumber={updateServerCoreNumber}
                      updateServerGpuNumber={updateServerGpuNumber}
                    />
                    <button
                      onClick={() => removeServerCluster(cluster.index)}
                      className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-700 absolute right-4 bottom-2 text-xs"
                    >
                      Remove Server
                    </button>
                  </div>
                </div>
              ))}

              {/* Storage Clusters */}
              {storageCluster.map((cluster) => (
                <div
                  className="border-b border-gray-100 pb-6 mb-4 relative"
                  key={cluster.id}
                >
                  <div className="p-4 font-bold w-full lg:text-left text-gray-700">
                    STORAGE
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <Storage
                      index={cluster.id}
                      storage={cluster.storage || 10}
                      modeProp={cluster.mode || "guided"}
                      priceProp={cluster.price || 0}
                      typeProp={cluster.type || "hdd"}
                      updateStorageClusterCost={updateStorageClusterCost}
                      updateStorageAmount={updateStorageAmount}
                      updateStorageNodeConsumption={updateStorageNodeConsumption}
                    />
                    <button
                      onClick={() => removeStorageCluster(cluster.id)}
                      className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-700 absolute right-4 bottom-2 text-xs"
                    >
                      Remove Storage
                    </button>
                  </div>
                </div>
              ))}

              {/* Add buttons */}
              <div className="flex justify-center items-center gap-4 py-4">
                <button
                  onClick={addServerCluster}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                  + Add Server Cluster
                </button>
                <button
                  onClick={addStorageCluster}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium"
                >
                  + Add Storage
                </button>
              </div>

              {/* Network */}
              <div className="border-t border-gray-100 pt-4">
                <div className="p-4 font-bold w-full text-left text-gray-700 flex items-center">
                  NETWORKING
                  <div className="flex hoverable-button justify-center items-center w-[13px] h-[13px] ml-2 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
                    i
                  </div>
                  <span className="z-10 display-on-hover absolute w-[90%] top-auto left-[5%] p-2 text-white bg-gray-400 text-xs sm:text-sm rounded-lg shadow">
                    <span className="font-bold">Networking Costs</span> cover the cost
                    for all the components of both internal and external network
                    connections of the Data center. So it includes Clusters
                    Interconnects, cabling, NICs, switches, routers, load balancers,
                    firewalls and others.
                  </span>
                </div>
                <Network
                  homeBandwidth={bandwidth}
                  setBandwidth={setBandwidth}
                  nodes={totalNodeCount}
                  tier={tier}
                  setTier={setTier}
                  totalNetCost={totalNetCost}
                  totalGpuNum={totalGPUCount}
                  setTotalNetCost={setTotalNetCost}
                  totalNetworkConsumption={totalNetworkConsumption}
                  setTotalNetworkConsumption={setTotalNetworkConsumption}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========== SECTION 3: POWER / ENERGY ========== */}
      <div className="w-7/8 bg-white text-left rounded-2xl relative shadow-md">
        <SectionHeader
          icon={faBolt}
          iconColor="text-yellow-500"
          title="POWER / ENERGY"
          description="This section covers power distribution infrastructure (transformers, PDUs, UPS, backup generators) and cooling systems, as well as ongoing energy costs for operating the facility."
          isOpen={section3Open}
          onToggle={() => setSection3Open(!section3Open)}
          totalCost={section3Total}
        />
        <AnimatePresence>
          {section3Open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Power Distribution */}
              <div className="border-b border-gray-100">
                <div className="p-4 font-bold w-full text-left text-gray-700 flex items-center">
                  POWER DISTRIBUTION & COOLING INFRASTRUCTURE
                  <div className="flex hoverable-button justify-center items-center w-[13px] h-[13px] ml-2 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
                    i
                  </div>
                  <span className="z-10 display-on-hover absolute w-[90%] top-auto left-[5%] p-2 text-white bg-gray-400 text-xs sm:text-sm rounded-lg shadow">
                    <span className="font-bold">Power Distribution Cost</span> represents
                    the cost of procuring all the components necessary to supply the
                    facility with power. This includes transformers, PDUs, power cords,
                    connectors, power breakers, UPS systems, backup generators, ATS
                    units, and more. <span className="font-bold">Cooling Infrastructure</span> covers
                    the cost of acquiring the components needed to cool down the
                    facility.
                  </span>
                </div>
                <PowerDistribution
                  tier={tier}
                  homePue={pue}
                  totalConsumption={totalNetworkConsumption + totalServerConsumption}
                  pdCost={totalPCost}
                  setPDcost={setTotalPCost}
                  setPueValue={setPueValue}
                />
              </div>

              {/* Energy Cost */}
              <div>
                <div className="p-4 font-bold w-full text-left text-gray-700 flex items-center">
                  ENERGY COST
                  <div className="flex hoverable-button justify-center items-center w-[13px] h-[13px] ml-2 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
                    i
                  </div>
                  <span className="z-10 display-on-hover absolute w-[90%] top-auto left-[5%] p-2 text-white bg-gray-400 text-xs sm:text-sm rounded-lg shadow">
                    <span className="font-bold">Energy Cost</span> encompasses the
                    energy expenses incurred by the data center to operate not only the
                    computing servers but also the entire supporting infrastructure
                    including networking equipment, cooling systems, and backup power.
                  </span>
                </div>
                <PowerCost
                  tier={tier}
                  pue={pue}
                  netConsumption={totalNetworkConsumption}
                  serverConsumption={totalServerConsumption}
                  nodeCount={totalNodeCount}
                  costOfPower={costOfPower}
                  setCostOfPower={setCostOfPower}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========== SECTION 4: LICENSE & WELFARE ========== */}
      <div className="w-7/8 bg-white text-left rounded-2xl relative shadow-md">
        <SectionHeader
          icon={faFileContract}
          iconColor="text-indigo-600"
          title="LICENSE & WELFARE"
          description="This section covers software licensing costs, workforce/labor expenses, regulatory compliance requirements, and security investments. Regulatory intensity affects audit frequency, documentation overhead, and compliance costs."
          isOpen={section4Open}
          onToggle={() => setSection4Open(!section4Open)}
          totalCost={section4Total}
        />
        <AnimatePresence>
          {section4Open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Regulatory & Security - moved from ScenarioParameters */}
              {activeScenario && (
                <div className="px-4 pb-4 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Regulatory Section */}
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                        <span className="text-lg">⚖️</span>
                        <span>Regulatory Intensity</span>
                        <div className="group relative">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-gray-400 text-sm cursor-help"
                          />
                          <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg left-0 top-6">
                            <p className="font-medium mb-1">Regulatory intensity affects:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Audit frequency</li>
                              <li>Documentation overhead</li>
                              <li>Compliance costs</li>
                            </ul>
                            <p className="mt-2 text-indigo-300">
                              Cost model only - does not verify compliance.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {regulatoryLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => setRegulatoryIntensity(level)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              activeScenario.regulatoryIntensity === level
                                ? "bg-indigo-500 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {REGULATORY_PARAMETERS[activeScenario.regulatoryIntensity].description}
                      </p>
                    </div>

                    {/* Security Investment */}
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                        <span className="text-lg">🔐</span>
                        <span>Security Investment</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-indigo-600">Annual Investment</span>
                          <span className="font-mono font-medium text-indigo-800">
                            ${activeScenario.security.annualInvestment.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={500000}
                          step={10000}
                          value={activeScenario.security.annualInvestment}
                          onChange={(e) => setSecurityInvestment(parseInt(e.target.value))}
                          className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-indigo-400">
                          <span>$0</span>
                          <span>$500K</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Controls Panel */}
                  <div className="mt-4">
                    <SecurityControls
                      nodeCount={totalNodeCount}
                      totalStorageTB={totalStorage}
                    />
                  </div>
                </div>
              )}

              {/* Software License */}
              <div className="border-b border-gray-100">
                <div className="p-4 font-bold w-full text-left text-gray-700 flex items-center">
                  SOFTWARE LICENSE
                  <div className="flex hoverable-button justify-center items-center w-[13px] h-[13px] ml-2 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
                    i
                  </div>
                  <span className="z-10 display-on-hover absolute w-[90%] top-auto left-[5%] p-2 text-white bg-gray-400 text-xs sm:text-sm rounded-lg shadow">
                    <span className="font-bold">Software License Cost</span> refer to
                    the one-time expenditure incurred from purchasing the rights to use
                    various software solutions within the data center environment,
                    including operating systems, server management tools, and security
                    software.
                  </span>
                </div>
                <SoftwareLicense
                  nodeCount={totalNodeCount}
                  cores={coresNumber}
                  softwareCost={softwareLicenseCost}
                  setSoftwareCost={setSoftwareLicenseCost}
                />
              </div>

              {/* Workforce */}
              <div>
                <div className="p-4 font-bold w-full text-left text-gray-700 flex items-center">
                  WORKFORCE
                  <div className="flex hoverable-button justify-center items-center w-[13px] h-[13px] ml-2 rounded-full bg-gray-200 text-xs leading-none cursor-pointer">
                    i
                  </div>
                  <span className="z-10 display-on-hover absolute w-[90%] top-auto left-[5%] p-2 text-white bg-gray-400 text-xs sm:text-sm rounded-lg shadow">
                    <span className="font-bold">Workforce Cost</span> represents the
                    total annual cost of the data center employees, which includes not
                    only base salary but also taxes, benefits and bonuses.
                  </span>
                </div>
                <Labor
                  nodeCount={totalNodeCount}
                  laborCost={costOfPower}
                  laborChoice={laborChoice}
                  setLaborCost={setLaborCost}
                  setLaborChoice={setLaborChoice}
                  tcoCost={
                    propertyValue +
                    totalServerCost +
                    totalNetCost +
                    totalStorageCost +
                    totalPCost
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Total Cost Summary */}
      <div className="flex flex-wrap w-7/8 bg-white p-6 rounded-2xl items-center justify-center gap-4 shadow-md">
        <div className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl shadow-lg">
          <span className="text-slate-300 font-bold text-lg mr-3">TOTAL COST</span>
          <span className="text-white font-bold text-2xl">${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 rounded-2xl shadow-lg">
          <span className="text-slate-600 font-bold text-lg mr-3">MAX POWER</span>
          <span className="text-slate-800 font-bold text-2xl">
            {((totalNetworkConsumption + totalServerConsumption) * pue).toLocaleString("en-US", { maximumFractionDigits: 0 })} W
          </span>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="flex flex-wrap justify-center items-center w-full">
        <div className="flex flex-col items-center xl:mr-[100px] 2xl:mr-0 mb-3">
          <h1 className="mb-3 font-bold text-lg">
            Total Cost Without Amortization ($
            {(
              totalServerCost +
              totalStorageCost +
              totalNetCost +
              propertyValue +
              totalPCost +
              costOfPower +
              softwareLicenseCost
            ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            )
          </h1>
          <PieChart
            serverCost={totalServerCost + totalStorageCost}
            networkCost={totalNetCost}
            buildingCost={propertyValue}
            powerAndCoolingCost={totalPCost}
            energyCost={costOfPower}
            softwareLicenseCost={softwareLicenseCost}
          />
        </div>
        <div className="flex flex-col items-center mb-3">
          <h1 className="mb-3 font-bold text-lg">
            Yearly Cost Considering Amortization ($
            {(
              (totalServerCost + totalStorageCost) / 4 +
              totalNetCost / 5 +
              propertyValue / 20 +
              totalPCost / 7 +
              costOfPower +
              softwareLicenseCost / 5
            ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            )
          </h1>
          <PieChart
            serverCost={(totalServerCost + totalStorageCost) / 4}
            networkCost={totalNetCost / 5}
            buildingCost={propertyValue / 20}
            powerAndCoolingCost={totalPCost / 7}
            energyCost={costOfPower}
            softwareLicenseCost={softwareLicenseCost / 5}
          />
        </div>
        <div className="flex flex-col items-center mb-3">
          <h1 className="mb-3 font-bold text-lg">
            Yearly Cost (w/ Salary) Considering Amortization ($
            {(
              (totalServerCost + totalStorageCost) / 4 +
              totalNetCost / 5 +
              propertyValue / 20 +
              totalPCost / 7 +
              costOfPower +
              softwareLicenseCost / 5 +
              laborCost
            ).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            )
          </h1>
          <PieChart
            serverCost={(totalServerCost + totalStorageCost) / 4}
            networkCost={totalNetCost / 5}
            buildingCost={propertyValue / 20}
            powerAndCoolingCost={totalPCost / 7}
            energyCost={costOfPower}
            softwareLicenseCost={softwareLicenseCost / 5}
            laborCost={laborCost}
          />
        </div>
      </div>

      {/* Scenario TCO Summary - shows when scenario is active */}
      {currentBreakdown && showScenarioPanel && (
        <div className="w-full max-w-4xl px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-xl shadow-sm font-semibold">
              <span className="text-purple-600 mr-2">SCENARIO TCO</span>
              <span className="text-purple-800 text-xl">
                ${currentBreakdown.totals.grandTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-xl shadow-sm text-sm font-medium">
              <span className="text-purple-500 mr-1">Base:</span>
              <span className="text-purple-800 font-mono">${currentBreakdown.totals.baseTCO.toLocaleString()}</span>
              <span className="mx-2 text-purple-300">+</span>
              <span className="text-purple-500 mr-1">Adj:</span>
              <span className="text-purple-800 font-mono">${currentBreakdown.totals.adjustments.toLocaleString()}</span>
              <span className="mx-2 text-purple-300">+</span>
              <span className="text-purple-500 mr-1">Compliance:</span>
              <span className="text-purple-800 font-mono">${currentBreakdown.totals.compliance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-md text-slate-600 dark:text-slate-300">
        <p>
          For more info about the JSON upload feature{" "}
          <Link
            href="/infoUpload"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            click here
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Scenario-driven TCO Calculator - Research Artifact
        </p>
      </footer>

      {/* Help System */}
      <HelpSystem />
    </main>
  );
}

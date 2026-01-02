"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ScenarioParameters,
  ComputationBreakdown,
  Region,
  WorkloadClass,
  RegulatoryIntensity,
} from "./types";
import { DEFAULT_SCENARIO_VALUES } from "../schemas/schema";
import {
  saveScenarios,
  loadScenarios,
  exportScenarioToJSON,
  importScenarioFromJSON,
} from "../services/scenarioStorage";

/**
 * Create a new scenario with default values
 */
export function createDefaultScenario(name?: string): ScenarioParameters {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: name || "New Scenario",
    description: "",
    region: DEFAULT_SCENARIO_VALUES.region,
    time: { ...DEFAULT_SCENARIO_VALUES.time },
    workload: { ...DEFAULT_SCENARIO_VALUES.workload },
    regulatoryIntensity: DEFAULT_SCENARIO_VALUES.regulatoryIntensity,
    security: { ...DEFAULT_SCENARIO_VALUES.security },
    risk: { ...DEFAULT_SCENARIO_VALUES.risk },
    isBaseline: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Context value interface
 */
export interface ScenarioContextValue {
  // State
  scenarios: ScenarioParameters[];
  activeScenarioId: string | null;
  activeScenario: ScenarioParameters | null;
  computationResults: Map<string, ComputationBreakdown>;
  
  // Scenario CRUD operations
  createScenario: (name?: string) => ScenarioParameters;
  updateScenario: (id: string, updates: Partial<ScenarioParameters>) => void;
  deleteScenario: (id: string) => void;
  cloneScenario: (id: string, newName?: string) => ScenarioParameters | null;
  setActiveScenario: (id: string) => void;
  setBaseline: (id: string) => void;
  
  // Quick parameter updates
  setRegion: (region: Region) => void;
  setYear: (year: number) => void;
  setEscalationRate: (rate: number) => void;
  setShockEnabled: (enabled: boolean) => void;
  setShockFactor: (factor: number) => void;
  setWorkloadClass: (workloadClass: WorkloadClass) => void;
  setAIEnabled: (enabled: boolean) => void;
  setRegulatoryIntensity: (intensity: RegulatoryIntensity) => void;
  setSecurityInvestment: (amount: number) => void;
  
  // Computation results
  setComputationResult: (scenarioId: string, result: ComputationBreakdown) => void;
  getComputationResult: (scenarioId: string) => ComputationBreakdown | undefined;
  
  // Import/Export
  exportScenario: (id: string) => string | null;
  exportAllScenarios: () => string;
  importScenario: (json: string) => ScenarioParameters | null;
  
  // Comparison
  getBaselineScenario: () => ScenarioParameters | null;
  compareWithBaseline: (scenarioId: string) => {
    scenario: ScenarioParameters;
    baseline: ScenarioParameters;
  } | null;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

interface ScenarioProviderProps {
  children: ReactNode;
}

export const ScenarioProvider: React.FC<ScenarioProviderProps> = ({ children }) => {
  const [scenarios, setScenarios] = useState<ScenarioParameters[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [computationResults, setComputationResults] = useState<Map<string, ComputationBreakdown>>(
    new Map()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    const stored = loadScenarios();
    if (stored.length > 0) {
      setScenarios(stored);
      // Set first scenario as active if none selected
      setActiveScenarioId(stored[0].id);
    } else {
      // Create default scenario
      const defaultScenario = createDefaultScenario("Default Scenario");
      defaultScenario.isBaseline = true;
      setScenarios([defaultScenario]);
      setActiveScenarioId(defaultScenario.id);
    }
    setIsInitialized(true);
  }, []);

  // Save scenarios to localStorage when they change
  useEffect(() => {
    if (isInitialized && scenarios.length > 0) {
      saveScenarios(scenarios);
    }
  }, [scenarios, isInitialized]);

  // Computed: active scenario
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || null;

  // CRUD Operations
  const createScenario = useCallback((name?: string): ScenarioParameters => {
    const newScenario = createDefaultScenario(name);
    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
    return newScenario;
  }, []);

  const updateScenario = useCallback(
    (id: string, updates: Partial<ScenarioParameters>) => {
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
            : s
        )
      );
    },
    []
  );

  const deleteScenario = useCallback(
    (id: string) => {
      setScenarios((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        // If we deleted the active scenario, select another
        if (activeScenarioId === id && filtered.length > 0) {
          setActiveScenarioId(filtered[0].id);
        }
        // If no scenarios left, create a default one
        if (filtered.length === 0) {
          const defaultScenario = createDefaultScenario("Default Scenario");
          defaultScenario.isBaseline = true;
          setActiveScenarioId(defaultScenario.id);
          return [defaultScenario];
        }
        return filtered;
      });
      // Remove computation result
      setComputationResults((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    },
    [activeScenarioId]
  );

  const cloneScenario = useCallback(
    (id: string, newName?: string): ScenarioParameters | null => {
      const original = scenarios.find((s) => s.id === id);
      if (!original) return null;

      const now = new Date().toISOString();
      const cloned: ScenarioParameters = {
        ...original,
        id: uuidv4(),
        name: newName || `${original.name} (Copy)`,
        isBaseline: false,
        createdAt: now,
        updatedAt: now,
        // Deep copy nested objects
        time: { ...original.time },
        workload: { ...original.workload },
        security: { ...original.security },
        risk: { ...original.risk },
      };

      setScenarios((prev) => [...prev, cloned]);
      setActiveScenarioId(cloned.id);
      return cloned;
    },
    [scenarios]
  );

  const setActiveScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
  }, []);

  const setBaseline = useCallback((id: string) => {
    setScenarios((prev) =>
      prev.map((s) => ({
        ...s,
        isBaseline: s.id === id,
        updatedAt: s.id === id ? new Date().toISOString() : s.updatedAt,
      }))
    );
  }, []);

  // Quick parameter update helpers
  const updateActiveScenario = useCallback(
    (updates: Partial<ScenarioParameters>) => {
      if (activeScenarioId) {
        updateScenario(activeScenarioId, updates);
      }
    },
    [activeScenarioId, updateScenario]
  );

  const setRegion = useCallback(
    (region: Region) => updateActiveScenario({ region }),
    [updateActiveScenario]
  );

  const setYear = useCallback(
    (year: number) => {
      if (activeScenario) {
        updateActiveScenario({
          time: { ...activeScenario.time, year },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setEscalationRate = useCallback(
    (escalationRate: number) => {
      if (activeScenario) {
        updateActiveScenario({
          time: { ...activeScenario.time, escalationRate },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setShockEnabled = useCallback(
    (shockEnabled: boolean) => {
      if (activeScenario) {
        updateActiveScenario({
          time: { ...activeScenario.time, shockEnabled },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setShockFactor = useCallback(
    (shockFactor: number) => {
      if (activeScenario) {
        updateActiveScenario({
          time: { ...activeScenario.time, shockFactor },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setWorkloadClass = useCallback(
    (utilizationClass: WorkloadClass) => {
      if (activeScenario) {
        updateActiveScenario({
          workload: { ...activeScenario.workload, utilizationClass },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setAIEnabled = useCallback(
    (aiEnabled: boolean) => {
      if (activeScenario) {
        updateActiveScenario({
          workload: { ...activeScenario.workload, aiEnabled },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  const setRegulatoryIntensity = useCallback(
    (regulatoryIntensity: RegulatoryIntensity) =>
      updateActiveScenario({ regulatoryIntensity }),
    [updateActiveScenario]
  );

  const setSecurityInvestment = useCallback(
    (annualInvestment: number) => {
      if (activeScenario) {
        updateActiveScenario({
          security: { ...activeScenario.security, annualInvestment },
        });
      }
    },
    [activeScenario, updateActiveScenario]
  );

  // Computation results
  const setComputationResult = useCallback(
    (scenarioId: string, result: ComputationBreakdown) => {
      setComputationResults((prev) => {
        const newMap = new Map(prev);
        newMap.set(scenarioId, result);
        return newMap;
      });
    },
    []
  );

  const getComputationResult = useCallback(
    (scenarioId: string) => computationResults.get(scenarioId),
    [computationResults]
  );

  // Import/Export
  const exportScenario = useCallback(
    (id: string): string | null => {
      const scenario = scenarios.find((s) => s.id === id);
      if (!scenario) return null;
      return exportScenarioToJSON(scenario);
    },
    [scenarios]
  );

  const exportAllScenarios = useCallback((): string => {
    return JSON.stringify(
      {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        scenarios: scenarios,
      },
      null,
      2
    );
  }, [scenarios]);

  const importScenario = useCallback((json: string): ScenarioParameters | null => {
    const imported = importScenarioFromJSON(json);
    if (!imported) return null;

    // Assign new ID to avoid conflicts
    const newScenario: ScenarioParameters = {
      ...imported,
      id: uuidv4(),
      name: `${imported.name} (Imported)`,
      isBaseline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(newScenario.id);
    return newScenario;
  }, []);

  // Comparison helpers
  const getBaselineScenario = useCallback((): ScenarioParameters | null => {
    return scenarios.find((s) => s.isBaseline) || null;
  }, [scenarios]);

  const compareWithBaseline = useCallback(
    (
      scenarioId: string
    ): { scenario: ScenarioParameters; baseline: ScenarioParameters } | null => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      const baseline = scenarios.find((s) => s.isBaseline);
      if (!scenario || !baseline) return null;
      return { scenario, baseline };
    },
    [scenarios]
  );

  const value: ScenarioContextValue = {
    scenarios,
    activeScenarioId,
    activeScenario,
    computationResults,
    createScenario,
    updateScenario,
    deleteScenario,
    cloneScenario,
    setActiveScenario,
    setBaseline,
    setRegion,
    setYear,
    setEscalationRate,
    setShockEnabled,
    setShockFactor,
    setWorkloadClass,
    setAIEnabled,
    setRegulatoryIntensity,
    setSecurityInvestment,
    setComputationResult,
    getComputationResult,
    exportScenario,
    exportAllScenarios,
    importScenario,
    getBaselineScenario,
    compareWithBaseline,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

/**
 * Hook to use scenario context
 */
export const useScenario = (): ScenarioContextValue => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
};


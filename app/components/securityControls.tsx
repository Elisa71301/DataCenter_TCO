"use client";

import React from "react";
import { useScenario } from "../context/scenarioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faUserShield,
  faLock,
  faAmbulance,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

interface SecurityControlsProps {
  className?: string;
  nodeCount: number;
  totalStorageTB: number;
}

const SecurityControls: React.FC<SecurityControlsProps> = ({
  className = "",
  nodeCount,
  totalStorageTB,
}) => {
  const { activeScenario, updateScenario } = useScenario();

  if (!activeScenario) {
    return null;
  }

  const { security } = activeScenario;

  // Calculate security costs
  const siemCost = security.siemPerNode * nodeCount;
  const iamCost = security.iamPerUser * security.userCount;
  const encryptionCost = security.encryptionPerTB * totalStorageTB;
  const irCost = security.incidentResponseRetainer;
  const totalSecurityCost = siemCost + iamCost + encryptionCost + irCost;

  const updateSecurityParam = (key: keyof typeof security, value: number) => {
    updateScenario(activeScenario.id, {
      security: { ...security, [key]: value },
    });
  };

  const SecurityLineItem = ({
    icon,
    iconColor,
    label,
    formula,
    params,
    result,
    onParamChange,
    paramKey,
    paramValue,
    paramLabel,
    paramUnit,
    paramMin,
    paramMax,
    paramStep,
  }: {
    icon: typeof faShieldHalved;
    iconColor: string;
    label: string;
    formula: string;
    params: string;
    result: number;
    onParamChange?: (value: number) => void;
    paramKey?: string;
    paramValue?: number;
    paramLabel?: string;
    paramUnit?: string;
    paramMin?: number;
    paramMax?: number;
    paramStep?: number;
  }) => (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} className={`${iconColor} text-lg`} />
          <span className="font-medium text-gray-800">{label}</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          ${result.toLocaleString()}
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">
            {formula}
          </span>
          <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400" />
        </div>
        <div className="text-gray-600">{params}</div>
      </div>

      {onParamChange && paramValue !== undefined && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{paramLabel}</span>
            <span className="font-mono">
              ${paramValue.toLocaleString()}
              {paramUnit}
            </span>
          </div>
          <input
            type="range"
            min={paramMin}
            max={paramMax}
            step={paramStep}
            value={paramValue}
            onChange={(e) => onParamChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Security Controls
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Security Cost</div>
          <div className="text-xl font-bold text-indigo-600">
            ${totalSecurityCost.toLocaleString()}/year
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Explicit security cost line items. Each shows formula and parameters for
        transparency.
      </p>

      <div className="space-y-4">
        {/* SIEM/Monitoring */}
        <SecurityLineItem
          icon={faShieldHalved}
          iconColor="text-blue-500"
          label="Monitoring / SIEM"
          formula="siemPerNode × nodeCount"
          params={`$${security.siemPerNode}/node × ${nodeCount} nodes`}
          result={siemCost}
          onParamChange={(v) => updateSecurityParam("siemPerNode", v)}
          paramValue={security.siemPerNode}
          paramLabel="Cost per node per year"
          paramUnit="/node/year"
          paramMin={100}
          paramMax={2000}
          paramStep={50}
        />

        {/* IAM/MFA */}
        <SecurityLineItem
          icon={faUserShield}
          iconColor="text-green-500"
          label="IAM / MFA"
          formula="iamPerUser × userCount"
          params={`$${security.iamPerUser}/user × ${security.userCount} users`}
          result={iamCost}
          onParamChange={(v) => updateSecurityParam("iamPerUser", v)}
          paramValue={security.iamPerUser}
          paramLabel="Cost per user per year"
          paramUnit="/user/year"
          paramMin={20}
          paramMax={500}
          paramStep={10}
        />

        {/* Encryption/KMS */}
        <SecurityLineItem
          icon={faLock}
          iconColor="text-purple-500"
          label="Encryption / KMS"
          formula="encryptionPerTB × totalStorageTB"
          params={`$${security.encryptionPerTB}/TB × ${totalStorageTB.toLocaleString()} TB`}
          result={encryptionCost}
          onParamChange={(v) => updateSecurityParam("encryptionPerTB", v)}
          paramValue={security.encryptionPerTB}
          paramLabel="Cost per TB per year"
          paramUnit="/TB/year"
          paramMin={10}
          paramMax={200}
          paramStep={5}
        />

        {/* Incident Response */}
        <SecurityLineItem
          icon={faAmbulance}
          iconColor="text-red-500"
          label="Incident Response Retainer"
          formula="fixed annual cost"
          params="Annual retainer for IR services"
          result={irCost}
          onParamChange={(v) => updateSecurityParam("incidentResponseRetainer", v)}
          paramValue={security.incidentResponseRetainer}
          paramLabel="Annual retainer"
          paramUnit=""
          paramMin={0}
          paramMax={200000}
          paramStep={5000}
        />
      </div>

      {/* User count control */}
      <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-indigo-800">User Count</span>
            <p className="text-xs text-indigo-600">
              Number of users for IAM/MFA cost calculation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateSecurityParam("userCount", Math.max(1, security.userCount - 10))
              }
              className="w-8 h-8 bg-indigo-200 text-indigo-800 rounded-lg hover:bg-indigo-300 transition-colors"
            >
              -
            </button>
            <span className="w-16 text-center font-mono font-medium">
              {security.userCount}
            </span>
            <button
              onClick={() =>
                updateSecurityParam("userCount", security.userCount + 10)
              }
              className="w-8 h-8 bg-indigo-200 text-indigo-800 rounded-lg hover:bg-indigo-300 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-100 rounded-lg">
            <div className="text-gray-500 text-xs">Total Security Spend</div>
            <div className="font-bold text-gray-800">
              ${(totalSecurityCost + security.annualInvestment).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              (Controls + General Investment)
            </div>
          </div>
          <div className="p-3 bg-indigo-100 rounded-lg">
            <div className="text-indigo-600 text-xs">Cost per Node</div>
            <div className="font-bold text-indigo-800">
              ${nodeCount > 0 ? Math.round(totalSecurityCost / nodeCount).toLocaleString() : 0}
            </div>
            <div className="text-xs text-indigo-600">/node/year</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityControls;


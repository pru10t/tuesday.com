import React from 'react';
import type { Campaign, CampaignTypeInfo, CustomerPrediction, SimulationSummary } from '../types';
import { CampaignBuilder } from './CampaignBuilder';
import { ResultsDashboard } from './ResultsDashboard';
import { Zap, ArrowLeft } from 'lucide-react';

interface SimulateViewProps {
  campaignTypes: CampaignTypeInfo[];
  onSimulate: (campaign: Campaign) => void;
  isSimulating: boolean;
  selectedCount: number;
  simulationResults: {
    summary: SimulationSummary;
    predictions: CustomerPrediction[];
  } | null;
  onBack: () => void;
}

export const SimulateView: React.FC<SimulateViewProps> = ({
  campaignTypes,
  onSimulate,
  isSimulating,
  selectedCount,
  simulationResults,
  onBack,
}) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-3xl font-bold text-black font-['Outfit'] tracking-tight">Campaign Simulation</h3>
          <p className="text-sm font-medium text-neutral-400 mt-1">
            {selectedCount > 0 
              ? `Test campaign on ${selectedCount} selected audience members`
              : 'Select audience members first to run simulation'
            }
          </p>
        </div>
      </div>

      {selectedCount === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <h4 className="text-xl font-bold text-black font-['Outfit'] mb-2">No Audience Selected</h4>
          <p className="text-neutral-500 text-sm mb-6">
            Go to the Audience view and select the customers you want to simulate this campaign for.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Select Audience
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          <CampaignBuilder
            campaignTypes={campaignTypes}
            onSimulate={onSimulate}
            isSimulating={isSimulating}
            selectedCount={selectedCount}
          />
          
          <ResultsDashboard
            summary={simulationResults?.summary || null}
            predictions={simulationResults?.predictions || []}
            isVisible={simulationResults !== null}
          />
        </div>
      )}
    </div>
  );
};

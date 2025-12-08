import React, { useState } from 'react';
import type { Campaign, CampaignTypeInfo, SimulationSummary } from '../types';
import { api } from '../services/api';
import { 
  GitCompare, ArrowLeft, TrendingUp, TrendingDown, Minus,
  Mail, Clock, Type, Sparkles
} from 'lucide-react';

interface ABCompareViewProps {
  campaignTypes: CampaignTypeInfo[];
  selectedCount: number;
  selectedIds: Set<number>;
  onBack: () => void;
}

interface CampaignConfig {
  type: string;
  subject_line: string;
  send_hour: number;
}

interface CompareResults {
  a: SimulationSummary | null;
  b: SimulationSummary | null;
}

const defaultCampaign: CampaignConfig = {
  type: 'Promo',
  subject_line: '',
  send_hour: 10
};

export const ABCompareView: React.FC<ABCompareViewProps> = ({
  campaignTypes,
  selectedCount,
  selectedIds,
  onBack,
}) => {
  const [campaignA, setCampaignA] = useState<CampaignConfig>({ 
    ...defaultCampaign, 
    subject_line: 'Flash Sale: 50% Off Today Only!' 
  });
  const [campaignB, setCampaignB] = useState<CampaignConfig>({ 
    ...defaultCampaign, 
    subject_line: 'Your Exclusive Members-Only Discount' 
  });
  
  const [results, setResults] = useState<CompareResults>({ a: null, b: null });
  const [isRunning, setIsRunning] = useState(false);

  const runComparison = async () => {
    if (selectedCount === 0) return;
    
    setIsRunning(true);
    try {
      const customerIds = Array.from(selectedIds);
      
      // Run both simulations in parallel
      const [resA, resB] = await Promise.all([
        api.simulate(customerIds, {
          type: campaignA.type as Campaign['type'],
          subject_line: campaignA.subject_line,
          send_hour: campaignA.send_hour
        }),
        api.simulate(customerIds, {
          type: campaignB.type as Campaign['type'],
          subject_line: campaignB.subject_line,
          send_hour: campaignB.send_hour
        })
      ]);
      
      setResults({ a: resA.summary, b: resB.summary });
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const formatRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

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
          <h3 className="text-3xl font-bold text-black font-['Outfit'] tracking-tight">A/B Compare</h3>
          <p className="text-sm font-medium text-neutral-400 mt-1">
            {selectedCount > 0 
              ? `Running on ${selectedCount.toLocaleString()} profiles`
              : 'Select audience members first'
            }
          </p>
        </div>
      </div>

      {selectedCount === 0 ? (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitCompare className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="text-lg font-semibold text-neutral-900 mb-2">No Audience Selected</h4>
          <p className="text-neutral-500 text-sm mb-6">
            Go to the Audience view and select customers to compare campaigns.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Select Audience
          </button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Campaign Configuration */}
          <div className="grid grid-cols-2 gap-6">
            {/* Campaign A */}
            <CampaignCard
              label="A"
              color="blue"
              campaign={campaignA}
              onChange={setCampaignA}
              campaignTypes={campaignTypes}
            />
            
            {/* Campaign B */}
            <CampaignCard
              label="B"
              color="purple"
              campaign={campaignB}
              onChange={setCampaignB}
              campaignTypes={campaignTypes}
            />
          </div>

          {/* Run Comparison Button */}
          <div className="flex justify-center">
            <button
              onClick={runComparison}
              disabled={isRunning || !campaignA.subject_line || !campaignB.subject_line}
              className="flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running comparison...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Compare Campaigns
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results.a && results.b && (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden animate-fade-in">
              {/* Results Header */}
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="text-sm font-semibold text-neutral-900">Comparison Results</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Based on {selectedCount.toLocaleString()} audience profiles</p>
              </div>

              {/* Metrics Table */}
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-neutral-400 uppercase tracking-wide">
                      <th className="text-left font-medium pb-4">Metric</th>
                      <th className="text-center font-medium pb-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-black text-white rounded-lg">
                          Campaign A
                        </span>
                      </th>
                      <th className="text-center font-medium pb-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-neutral-200 text-neutral-900 rounded-lg">
                          Campaign B
                        </span>
                      </th>
                      <th className="text-center font-medium pb-4">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <MetricRow 
                      label="Open Rate" 
                      valueA={results.a.open_rate} 
                      valueB={results.b.open_rate}
                      format={formatRate}
                      higherIsBetter={true}
                    />
                    <MetricRow 
                      label="Click Rate" 
                      valueA={results.a.click_rate} 
                      valueB={results.b.click_rate}
                      format={formatRate}
                      higherIsBetter={true}
                    />
                    <MetricRow 
                      label="Conversion Rate" 
                      valueA={results.a.conversion_rate} 
                      valueB={results.b.conversion_rate}
                      format={formatRate}
                      higherIsBetter={true}
                    />
                    <MetricRow 
                      label="Unsubscribe Rate" 
                      valueA={results.a.unsubscribe_rate} 
                      valueB={results.b.unsubscribe_rate}
                      format={formatRate}
                      higherIsBetter={false}
                    />
                  </tbody>
                </table>
              </div>

              {/* Winner Declaration */}
              <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                <WinnerBadge resultsA={results.a} resultsB={results.b} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Campaign Configuration Card
interface CampaignCardProps {
  label: string;
  color: 'blue' | 'purple';
  campaign: CampaignConfig;
  onChange: (campaign: CampaignConfig) => void;
  campaignTypes: CampaignTypeInfo[];
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  label, 
  color, 
  campaign, 
  onChange, 
  campaignTypes 
}) => {
  const colors = {
    blue: {
      badge: 'bg-black text-white',
      border: 'border-neutral-200',
      focusBorder: 'focus:border-black',
    },
    purple: {
      badge: 'bg-white border border-neutral-200 text-black',
      border: 'border-neutral-200',
      focusBorder: 'focus:border-black',
    }
  };

  const c = colors[color];

  return (
    <div className={`bg-white border ${c.border} rounded-2xl overflow-hidden`}>
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
        <span className={`w-7 h-7 ${c.badge} rounded-lg flex items-center justify-center text-sm font-bold`}>
          {label}
        </span>
        <span className="text-sm font-medium text-neutral-900">Campaign {label}</span>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Campaign Type */}
        <div>
          <label className="text-xs text-neutral-400 uppercase tracking-wide flex items-center gap-2 mb-2">
            <Mail className="w-3.5 h-3.5" />
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {campaignTypes.map(type => (
              <button
                key={type.value}
                onClick={() => onChange({ ...campaign, type: type.value })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  campaign.type === type.value
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="text-xs text-neutral-400 uppercase tracking-wide flex items-center gap-2 mb-2">
            <Type className="w-3.5 h-3.5" />
            Subject Line
          </label>
          <input
            type="text"
            value={campaign.subject_line}
            onChange={(e) => onChange({ ...campaign, subject_line: e.target.value })}
            placeholder="Enter subject line..."
            className={`w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none ${c.focusBorder} transition-colors`}
          />
        </div>

        {/* Send Hour */}
        <div>
          <label className="text-xs text-neutral-400 uppercase tracking-wide flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5" />
            Send Hour
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={8}
              max={21}
              value={campaign.send_hour}
              onChange={(e) => onChange({ ...campaign, send_hour: parseInt(e.target.value) })}
              className="flex-1 accent-black"
            />
            <span className="text-sm font-medium text-neutral-900 w-16">
              {campaign.send_hour}:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Row Component
interface MetricRowProps {
  label: string;
  valueA: number;
  valueB: number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, valueA, valueB, format, higherIsBetter }) => {
  const diff = valueB - valueA;
  const percentDiff = valueA > 0 ? (diff / valueA) * 100 : 0;
  
  let trendColor = 'text-neutral-400';
  let TrendIcon = Minus;
  
  if (Math.abs(diff) > 0.001) {
    if (higherIsBetter) {
      trendColor = diff > 0 ? 'text-emerald-500' : 'text-red-500';
      TrendIcon = diff > 0 ? TrendingUp : TrendingDown;
    } else {
      trendColor = diff < 0 ? 'text-emerald-500' : 'text-red-500';
      TrendIcon = diff < 0 ? TrendingDown : TrendingUp;
    }
  }

  return (
    <tr>
      <td className="py-4 text-sm text-neutral-600">{label}</td>
      <td className="py-4 text-center">
        <span className="text-lg font-semibold text-neutral-900">{format(valueA)}</span>
      </td>
      <td className="py-4 text-center">
        <span className="text-lg font-semibold text-neutral-900">{format(valueB)}</span>
      </td>
      <td className="py-4 text-center">
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          {Math.abs(percentDiff).toFixed(1)}%
        </span>
      </td>
    </tr>
  );
};

// Winner Badge Component
interface WinnerBadgeProps {
  resultsA: SimulationSummary;
  resultsB: SimulationSummary;
}

const WinnerBadge: React.FC<WinnerBadgeProps> = ({ resultsA, resultsB }) => {
  // Score based on conversion and click rate (positive) minus unsub rate (negative)
  const scoreA = (resultsA.conversion_rate * 3) + (resultsA.click_rate * 2) + resultsA.open_rate - (resultsA.unsubscribe_rate * 5);
  const scoreB = (resultsB.conversion_rate * 3) + (resultsB.click_rate * 2) + resultsB.open_rate - (resultsB.unsubscribe_rate * 5);
  
  if (Math.abs(scoreA - scoreB) < 0.01) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-2xl">🤝</span>
        <div>
          <p className="text-sm font-medium text-neutral-900">It's a tie!</p>
          <p className="text-xs text-neutral-400">Both campaigns perform similarly</p>
        </div>
      </div>
    );
  }
  
  const winner = scoreA > scoreB ? 'A' : 'B';
  const winnerColor = 'text-black';
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">🏆</span>
      <div>
        <p className="text-sm font-medium text-neutral-900">
          Campaign <span className={`${winnerColor} font-bold`}>{winner}</span> wins!
        </p>
        <p className="text-xs text-neutral-400">
          {winner === 'A' 
            ? 'Better overall engagement and conversion potential'
            : 'Higher predicted performance metrics'
          }
        </p>
      </div>
    </div>
  );
};

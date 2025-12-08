import React from 'react';
import type { SimulationSummary, CustomerPrediction } from '../types';

interface ResultsDashboardProps {
  summary: SimulationSummary | null;
  predictions: CustomerPrediction[];
  isVisible: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  summary,
  predictions,
  isVisible,
}) => {
  if (!isVisible || !summary) return null;

  const highRiskUsers = predictions.filter(p => p.will_unsubscribe);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-6 border-b border-neutral-100">
        <h3 className="text-xl font-bold text-black font-['Outfit'] tracking-tight">Predicted Results</h3>
        <p className="text-xs text-neutral-400 mt-1 font-medium">Based on {summary.total_customers} profiles</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-black font-['Outfit']">
              {(summary.open_rate * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              Opens
            </p>
          </div>
          
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-black font-['Outfit']">
              {(summary.click_rate * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              Clicks
            </p>
          </div>
          
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-black font-['Outfit']">
              {(summary.conversion_rate * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              Converts
            </p>
          </div>
          
          <div className="text-center p-4 bg-neutral-50 rounded-xl">
            <p className="text-3xl font-bold text-black font-['Outfit']">
              {(summary.unsubscribe_rate * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              Unsubs
            </p>
          </div>
        </div>

        {/* Counts */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Predicted opens</span>
            <span className="font-medium text-neutral-900">{summary.predicted_opens}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Predicted clicks</span>
            <span className="font-medium text-neutral-900">{summary.predicted_clicks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Predicted conversions</span>
            <span className="font-medium text-emerald-600">{summary.predicted_conversions}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">At-risk users</span>
            <span className={`font-medium ${highRiskUsers.length > 0 ? 'text-red-500' : 'text-neutral-900'}`}>
              {highRiskUsers.length}
            </span>
          </div>
        </div>

        {/* Risk Alert */}
        {highRiskUsers.length > 0 && (
          <div className="border border-red-100 bg-red-50/50 rounded-lg p-4">
            <p className="text-xs font-medium text-red-600 mb-2">
              Unsubscribe Risk Detected
            </p>
            <p className="text-xs text-red-500 leading-relaxed">
              {highRiskUsers.length} user{highRiskUsers.length !== 1 ? 's' : ''} may unsubscribe. 
              Consider excluding or adjusting campaign parameters.
            </p>
          </div>
        )}

        {/* Segment Breakdown */}
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
            By Segment
          </p>
          <div className="space-y-3">
            {['Tech Enthusiast', 'Fashionista', 'Home Decor', 'Bargain Hunter'].map(segment => {
              const segmentPreds = predictions.filter(p => p.interest_segment === segment);
              if (segmentPreds.length === 0) return null;
              const segmentOpens = segmentPreds.filter(p => p.will_open).length;
              const openRate = segmentOpens / segmentPreds.length;
              
              return (
                <div key={segment} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-20 truncate">
                    {segment.split(' ')[0]}
                  </span>
                  <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                      style={{ width: `${openRate * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-900 w-10 text-right">
                    {(openRate * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

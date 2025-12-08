import React, { useState } from 'react';
import type { Campaign, CampaignType, CampaignTypeInfo } from '../types';
import { ArrowRight } from 'lucide-react';

interface CampaignBuilderProps {
  campaignTypes: CampaignTypeInfo[];
  onSimulate: (campaign: Campaign) => void;
  isSimulating: boolean;
  selectedCount: number;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({
  campaignTypes,
  onSimulate,
  isSimulating,
  selectedCount,
}) => {
  const [campaignType, setCampaignType] = useState<CampaignType>('Promo');
  const [subjectLine, setSubjectLine] = useState('Your exclusive offer awaits');
  const [sendHour, setSendHour] = useState(10);

  const handleSimulate = () => {
    onSimulate({
      type: campaignType,
      subject_line: subjectLine,
      send_hour: sendHour,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-neutral-100">
        <h3 className="text-xl font-bold text-black font-['Outfit'] tracking-tight">Campaign Config</h3>
        <p className="text-xs text-neutral-400 mt-1 font-medium">Set up your test parameters</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Campaign Type */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">
            Campaign Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {campaignTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setCampaignType(type.value)}
                className={`
                  px-4 py-4 rounded-xl text-left transition-all text-sm font-medium border
                  ${campaignType === type.value 
                    ? 'bg-black text-white border-black shadow-lg shadow-neutral-200/50' 
                    : 'bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300 hover:text-black'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Subject Line
          </label>
          <input
            type="text"
            value={subjectLine}
            onChange={(e) => setSubjectLine(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 border-0 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all"
            placeholder="Enter subject..."
          />
          <p className="text-[11px] text-neutral-400 mt-2">
            {subjectLine.length} chars
          </p>
        </div>

        {/* Send Time */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Send Time
            </label>
            <span className="text-sm font-semibold text-neutral-900">
              {sendHour.toString().padStart(2, '0')}:00
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="21"
            value={sendHour}
            onChange={(e) => setSendHour(Number(e.target.value))}
            className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-neutral-900"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-2">
            <span>8:00</span>
            <span>21:00</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSimulate}
          disabled={selectedCount === 0 || isSimulating}
          className={`
            w-full py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all
            ${selectedCount === 0 || isSimulating
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800 shadow-xl shadow-neutral-200/50 hover:shadow-2xl hover:-translate-y-0.5'
            }
          `}
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <span>Run Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        {selectedCount === 0 && (
          <p className="text-[11px] text-neutral-400 text-center mt-3">
            Select audience members to continue
          </p>
        )}
      </div>
    </div>
  );
};

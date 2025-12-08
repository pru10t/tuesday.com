import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { Customer } from '../types';

interface TwinCardProps {
  customer: Customer;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onChat: (customer: Customer) => void;
  prediction?: {
    will_open: boolean;
    will_click: boolean;
    will_unsubscribe: boolean;
    confidence_open: number;
    confidence_click: number;
    confidence_unsub: number;
  };
  showPrediction: boolean;
}

const segmentLabels: Record<string, string> = {
  'Tech Enthusiast': 'Tech',
  'Fashionista': 'Fashion',
  'Home Decor': 'Home',
  'Bargain Hunter': 'Value',
};

const segmentEmojis: Record<string, string> = {
  'Tech Enthusiast': '💻',
  'Fashionista': '👗',
  'Home Decor': '🏠',
  'Bargain Hunter': '🏷️',
};

export const TwinCard: React.FC<TwinCardProps> = ({ 
  customer, 
  isSelected, 
  onToggle,
  onChat,
  prediction,
  showPrediction 
}) => {
  const segmentLabel = segmentLabels[customer.interest_segment] || customer.interest_segment;
  const segmentEmoji = segmentEmojis[customer.interest_segment] || '👤';

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChat(customer);
  };
  
  return (
    <div 
      onClick={() => onToggle(customer.user_id)}
      className={`
        relative p-5 rounded-xl border cursor-pointer transition-all duration-200 group bg-white
        ${isSelected 
          ? 'border-neutral-900 shadow-sm' 
          : 'border-neutral-200 hover:border-neutral-300'
        }
      `}
    >
      {/* Selection indicator */}
      <div className={`
        absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 group-hover:border-neutral-400'}
      `}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Chat Button - appears on hover */}
      <button
        onClick={handleChatClick}
        className="absolute top-4 left-4 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neutral-700 transition-all transform scale-90 group-hover:scale-100"
        title={`Chat with ${customer.name}`}
      >
        <MessageCircle size={14} />
      </button>

      {/* Customer Name & Segment */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">{segmentEmoji}</span>
          <p className="text-sm font-semibold text-neutral-900 truncate">{customer.name}</p>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">{segmentLabel} · {customer.income_bracket}</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-center">
        <div className="flex-1">
          <p className="text-lg font-semibold text-neutral-900">{customer.age}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Age</p>
        </div>
        <div className="w-px h-8 bg-neutral-100"></div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-neutral-900">{customer.historical_opens || 0}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Opens</p>
        </div>
        <div className="w-px h-8 bg-neutral-100"></div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-neutral-900">{customer.past_purchase_count}</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Orders</p>
        </div>
      </div>

      {/* Prediction overlay */}
      {showPrediction && prediction && (
        <div className="mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className={`text-sm font-semibold ${prediction.will_open ? 'text-neutral-900' : 'text-neutral-300'}`}>
                {prediction.will_open ? '✓' : '—'}
              </div>
              <p className="text-[9px] text-neutral-400 uppercase">Open</p>
            </div>
            <div>
              <div className={`text-sm font-semibold ${prediction.will_click ? 'text-neutral-900' : 'text-neutral-300'}`}>
                {prediction.will_click ? '✓' : '—'}
              </div>
              <p className="text-[9px] text-neutral-400 uppercase">Click</p>
            </div>
            <div>
              <div className={`text-sm font-semibold ${prediction.will_unsubscribe ? 'text-red-500' : 'text-neutral-300'}`}>
                {prediction.will_unsubscribe ? '!' : '—'}
              </div>
              <p className="text-[9px] text-neutral-400 uppercase">Risk</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


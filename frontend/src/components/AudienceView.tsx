import { useState, useMemo } from 'react';
import type { Customer, CustomerPrediction } from '../types';
import { TwinCard } from './TwinCard';
import { 
  Search, ChevronDown, Users, Filter, 
  Grid3X3, List, CheckSquare, Square
} from 'lucide-react';

interface AudienceViewProps {
  customers: Customer[];
  selectedIds: Set<number>;
  onToggleCustomer: (id: number) => void;
  onClearSelection: () => void;
  segments: string[];
  incomeLevels: string[];
  filterSegment: string;
  filterIncome: string;
  searchTerm: string;
  onFilterSegmentChange: (segment: string) => void;
  onFilterIncomeChange: (income: string) => void;
  onSearchChange: (term: string) => void;
  predictions: CustomerPrediction[];
  showPredictions: boolean;
}

const ITEMS_PER_PAGE = 50;

export const AudienceView: React.FC<AudienceViewProps> = ({
  customers,
  selectedIds,
  onToggleCustomer,
  onClearSelection,
  segments,
  incomeLevels,
  filterSegment,
  filterIncome,
  searchTerm,
  onFilterSegmentChange,
  onFilterIncomeChange,
  onSearchChange,
  predictions,
  showPredictions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!c.name.toLowerCase().includes(term) && !String(c.user_id).includes(term)) {
          return false;
        }
      }
      if (filterSegment && c.interest_segment !== filterSegment) return false;
      if (filterIncome && c.income_bracket !== filterIncome) return false;
      return true;
    });
  }, [customers, searchTerm, filterSegment, filterIncome]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  // Stats
  const stats = useMemo(() => {
    const segmentCounts = segments.reduce((acc, s) => {
      acc[s] = filteredCustomers.filter(c => c.interest_segment === s).length;
      return acc;
    }, {} as Record<string, number>);
    
    const avgAge = filteredCustomers.length > 0 
      ? Math.round(filteredCustomers.reduce((sum, c) => sum + c.age, 0) / filteredCustomers.length)
      : 0;
    
    return { segmentCounts, avgAge };
  }, [filteredCustomers, segments]);

  const getPrediction = (customerId: number) => {
    return predictions.find(p => p.customer_id === customerId);
  };

  const handleSelectPage = () => {
    paginatedCustomers.forEach(c => {
      if (!selectedIds.has(c.user_id)) {
        onToggleCustomer(c.user_id);
      }
    });
  };

  const handleSelectFiltered = () => {
    filteredCustomers.forEach(c => {
      if (!selectedIds.has(c.user_id)) {
        onToggleCustomer(c.user_id);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black font-['Outfit'] tracking-tight">Digital Twins</h3>
              <p className="text-[13px] text-neutral-400 font-medium">
                {filteredCustomers.length.toLocaleString()} of {customers.length.toLocaleString()} profiles available
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3X3 className="w-4 h-4 text-neutral-600" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-8 mb-8 overflow-x-auto pb-2">
          <div>
            <p className="text-3xl font-bold font-['Outfit'] tracking-tight text-black">{filteredCustomers.length.toLocaleString()}</p>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mt-1">Total Audience</p>
          </div>
          <div className="w-px h-8 bg-neutral-100" />
          <div>
            <p className="text-3xl font-bold font-['Outfit'] tracking-tight text-black">{selectedIds.size.toLocaleString()}</p>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mt-1">Selected</p>
          </div>
          <div className="w-px h-8 bg-neutral-100" />
          <div>
            <p className="text-3xl font-bold font-['Outfit'] tracking-tight text-black">{stats.avgAge}</p>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mt-1">Avg Age</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => { onSearchChange(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 text-neutral-400">
            <Filter className="w-4 h-4" />
          </div>
          
          {/* Segment Filter */}
          <div className="relative">
            <select
              value={filterSegment}
              onChange={(e) => { onFilterSegmentChange(e.target.value); setCurrentPage(1); }}
              className="appearance-none px-4 py-2.5 pr-9 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors cursor-pointer"
            >
              <option value="">All segments</option>
              {segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
          
          {/* Income Filter */}
          <div className="relative">
            <select
              value={filterIncome}
              onChange={(e) => { onFilterIncomeChange(e.target.value); setCurrentPage(1); }}
              className="appearance-none px-4 py-2.5 pr-9 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors cursor-pointer"
            >
              <option value="">All income</option>
              {incomeLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="flex-1" />

          {/* Selection Actions */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={onClearSelection}
                className="text-sm text-neutral-500 hover:text-neutral-700 font-medium px-3 py-2"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSelectPage}
              className="text-sm text-neutral-700 hover:bg-neutral-100 font-medium px-3 py-2 rounded-lg border border-neutral-200 transition-colors"
            >
              Select page
            </button>
            <button
              onClick={handleSelectFiltered}
              className="text-sm text-white bg-neutral-900 hover:bg-neutral-800 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Select all ({filteredCustomers.length.toLocaleString()})
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {paginatedCustomers.map(customer => (
              <TwinCard
                key={customer.user_id}
                customer={customer}
                isSelected={selectedIds.has(customer.user_id)}
                onToggle={onToggleCustomer}
                prediction={getPrediction(customer.user_id)}
                showPrediction={showPredictions}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="w-12 px-4 py-3">
                    <button 
                      onClick={handleSelectPage}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Segment</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Income</th>
                  <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Age</th>
                  <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Orders</th>
                  <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Opens</th>
                  <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide px-4 py-3">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, idx) => (
                  <tr 
                    key={customer.user_id}
                    onClick={() => onToggleCustomer(customer.user_id)}
                    className={`
                      border-b border-neutral-100 cursor-pointer transition-colors
                      ${selectedIds.has(customer.user_id) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'}
                      ${idx === paginatedCustomers.length - 1 ? 'border-b-0' : ''}
                    `}
                  >
                    <td className="px-4 py-3">
                      {selectedIds.has(customer.user_id) 
                        ? <CheckSquare className="w-4 h-4 text-white" />
                        : <Square className="w-4 h-4 text-neutral-300" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className={`text-xs ${selectedIds.has(customer.user_id) ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          ID: {customer.user_id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedIds.has(customer.user_id) 
                          ? 'bg-white/20 text-white' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {customer.interest_segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.income_bracket}</td>
                    <td className="px-4 py-3 text-sm text-center">{customer.age}</td>
                    <td className="px-4 py-3 text-sm text-center">{customer.past_purchase_count}</td>
                    <td className="px-4 py-3 text-sm text-center">{customer.historical_opens || 0}</td>
                    <td className="px-4 py-3 text-sm text-center">{customer.historical_clicks || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">No audience members found</p>
            <p className="text-neutral-400 text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-between">
          <p className="text-sm text-neutral-400 font-medium">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

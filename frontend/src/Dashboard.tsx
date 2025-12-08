import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FolderKanban, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Digital Twins imports
import { api } from './services/api';
import type { Customer, Campaign, CampaignTypeInfo, CustomerPrediction, SimulationSummary } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AudienceView } from './components/AudienceView';
import { SimulateView } from './components/SimulateView';
import { ABCompareView } from './components/ABCompareView';
import { X } from 'lucide-react';

// Project Simulator import
import ProjectSimulator from './project-simulator/ProjectSimulator';

type MainTab = 'digital-twins' | 'project-simulator';

function Dashboard() {
  // Main tab state
  const [mainTab, setMainTab] = useState<MainTab>('digital-twins');
  
  // Digital Twins Navigation
  const [activeView, setActiveView] = useState('audience');
  
  // Digital Twins State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [campaignTypes, setCampaignTypes] = useState<CampaignTypeInfo[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [incomeLevels, setIncomeLevels] = useState<string[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState<string>('');
  const [filterIncome, setFilterIncome] = useState<string>('');
  
  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    summary: SimulationSummary;
    predictions: CustomerPrediction[];
  } | null>(null);
  
  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Page titles for each view
  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    audience: { title: 'Audience', subtitle: 'Manage and select your digital twins' },
    simulate: { title: 'Simulate Campaign', subtitle: 'Predict campaign performance' },
    compare: { title: 'A/B Compare', subtitle: 'Compare two campaign variants' },
    optimize: { title: 'Send Time Optimizer', subtitle: 'Find the best time to send' },
    insights: { title: 'Audience Insights', subtitle: 'Understand your audience' },
    'ai-coach': { title: 'AI Subject Coach', subtitle: 'Optimize your subject lines' },
  };

  // Load initial data for digital twins
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [customersRes, typesRes, segmentsRes] = await Promise.all([
          api.getCustomers(1, 10000),
          api.getCampaignTypes(),
          api.getSegments(),
        ]);
        
        setCustomers(customersRes.customers);
        setCampaignTypes(typesRes.types);
        setSegments(segmentsRes.segments);
        setIncomeLevels(segmentsRes.income_levels);
        setError(null);
      } catch (err) {
        setError('Failed to connect to API. Make sure backend is running on port 8000.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Toggle customer selection
  const toggleCustomer = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
    setSimulationResults(null);
  };

  // Run simulation
  const runSimulation = async (campaign: Campaign) => {
    if (selectedIds.size === 0) return;
    
    setIsSimulating(true);
    try {
      const result = await api.simulate(Array.from(selectedIds), campaign);
      setSimulationResults(result);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const currentView = viewTitles[activeView] || viewTitles.audience;

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Navigation - Main Tabs */}
      <div className="h-16 bg-white border-b border-neutral-100 flex items-center px-6 shrink-0 z-40">
        {/* Logo / Back */}
        <Link 
          to="/" 
          className="flex items-center gap-3 mr-8 group"
        >
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white group-hover:bg-neutral-700 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="font-['Outfit'] font-bold text-xl tracking-tight">Tomorrow.</span>
        </Link>

        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setMainTab('digital-twins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mainTab === 'digital-twins'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Users size={16} />
            <span>Digital Twins</span>
          </button>
          <button
            onClick={() => setMainTab('project-simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mainTab === 'project-simulator'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <FolderKanban size={16} />
            <span>Project Simulator</span>
          </button>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-neutral-400">v1.0</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {mainTab === 'digital-twins' && (
            <motion.div
              key="digital-twins"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex"
            >
              {/* Loading state */}
              {isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-neutral-500 text-sm font-medium tracking-wide">Loading Digital Twins...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {!isLoading && error && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center max-w-sm">
                    <div className="w-12 h-12 border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <X className="w-5 h-5 text-neutral-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-neutral-900 mb-2">Connection Error</h1>
                    <p className="text-neutral-500 text-sm mb-6 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Main content */}
              {!isLoading && !error && (
                <>
                  {/* Sidebar */}
                  <Sidebar 
                    activeView={activeView} 
                    onViewChange={setActiveView}
                    selectedCount={selectedIds.size}
                  />

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <Navbar title={currentView.title} subtitle={currentView.subtitle} />
                    
                    {/* View Content */}
                    <div className="flex-1 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                        {activeView === 'audience' && (
                          <motion.div
                            key="audience"
                            {...pageTransition}
                            className="absolute inset-0 flex flex-col"
                          >
                            <AudienceView
                              customers={customers}
                              selectedIds={selectedIds}
                              onToggleCustomer={toggleCustomer}
                              onClearSelection={clearSelection}
                              segments={segments}
                              incomeLevels={incomeLevels}
                              filterSegment={filterSegment}
                              filterIncome={filterIncome}
                              searchTerm={searchTerm}
                              onFilterSegmentChange={setFilterSegment}
                              onFilterIncomeChange={setFilterIncome}
                              onSearchChange={setSearchTerm}
                              predictions={simulationResults?.predictions || []}
                              showPredictions={simulationResults !== null}
                            />
                          </motion.div>
                        )}
                        
                        {activeView === 'simulate' && (
                          <motion.div
                            key="simulate"
                            {...pageTransition}
                            className="absolute inset-0 flex flex-col"
                          >
                            <SimulateView
                              campaignTypes={campaignTypes}
                              onSimulate={runSimulation}
                              isSimulating={isSimulating}
                              selectedCount={selectedIds.size}
                              simulationResults={simulationResults}
                              onBack={() => setActiveView('audience')}
                            />
                          </motion.div>
                        )}

                        {activeView === 'compare' && (
                          <motion.div
                            key="compare"
                            {...pageTransition}
                            className="absolute inset-0 flex flex-col"
                          >
                            <ABCompareView
                              campaignTypes={campaignTypes}
                              selectedCount={selectedIds.size}
                              selectedIds={selectedIds}
                              onBack={() => setActiveView('audience')}
                            />
                          </motion.div>
                        )}

                        {/* Coming Soon Views */}
                        {['optimize', 'insights', 'ai-coach'].includes(activeView) && (
                          <motion.div
                            key="coming-soon"
                            {...pageTransition}
                            className="absolute inset-0 flex items-center justify-center p-6"
                          >
                            <div className="text-center max-w-md">
                              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="font-['Jersey_25'] text-3xl">Soon</span>
                              </div>
                              <h3 className="text-2xl font-bold text-black font-['Outfit'] mb-2">Coming Soon</h3>
                              <p className="text-neutral-400 text-sm leading-relaxed">
                                This feature is under development. Check back later.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {mainTab === 'project-simulator' && (
            <motion.div
              key="project-simulator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ProjectSimulator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, GitCompare, Activity, ArrowRight
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

type TabId = 'simulate' | 'audience' | 'compare' | 'predict';

interface TabContent {
  title: string;
  description: string;
  stats: { value: string; label: string }[];
}

const tabData: Record<TabId, TabContent> = {
  simulate: {
    title: 'Instant Simulation',
    description: 'Run campaigns on 10,000 digital twins. Get performance predictions instantly.',
    stats: [{ value: '0.8s', label: 'Latency' }, { value: '98%', label: 'Accuracy' }]
  },
  audience: {
    title: 'Audience Intelligence',
    description: 'Filter by behavior and predicted lifetime value across your entire customer base.',
    stats: [{ value: '10K', label: 'Profiles' }, { value: '45', label: 'Attributes' }]
  },
  compare: {
    title: 'A/B Testing',
    description: 'Compare variants against digital twins and pick the winner in seconds.',
    stats: [{ value: '2x', label: 'Speed' }, { value: '+24%', label: 'Lift' }]
  },
  predict: {
    title: 'Prediction Engine',
    description: 'Four specialized ML models predicting opens, clicks, and conversion risk.',
    stats: [{ value: '4', label: 'Models' }, { value: '24/7', label: 'Learning' }]
  }
};

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('simulate');

  return (
    <div className="min-h-screen bg-white text-black font-['Plus_Jakarta_Sans'] selection:bg-black selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-['Outfit'] font-bold text-2xl tracking-tighter">
            Tomorrow.
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
            <a href="#capabilities" className="hover:text-black transition-colors">Capabilities</a>
            <a href="#engine" className="hover:text-black transition-colors">Engine</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
              Log in
            </Link>
            <Link 
              to="/dashboard" 
              className="px-6 py-2.5 text-sm font-semibold bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 md:pt-56 md:pb-40 px-6">
        <div className="max-w-screen-xl mx-auto text-center md:text-left">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="inline-block mb-8"
          >
          </motion.div>

          <motion.h1 
            initial="hidden" 
            animate="visible" 
            variants={fadeIn}
            className="font-['Jersey_25'] text-8xl md:text-[8rem] lg:text-[10rem] font-normal tracking-wide leading-none mb-12 text-black"
          >
            Predict results <br />
            <span className="text-white bg-orange-900 px-2 py-1 rounded-md">before sending.</span>
          </motion.h1>

          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-xl md:text-2xl text-neutral-600 max-w-xl leading-relaxed font-light"
            >
              The first Digital Twin engine for email marketing. forecast performance with 98% accuracy using 10,000 AI customer replicas.
            </motion.p>

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
            >
              <Link 
                to="/dashboard"
                className="w-full md:w-auto px-8 py-3.5 bg-black text-white text-[15px] rounded-md font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
              >
                Start Simulating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="w-full md:w-auto px-8 py-3.5 bg-white text-black border border-neutral-200 text-[15px] rounded-md font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                View Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Minimal Tabs Interface */}
      <section className="py-24 px-6 border-t border-neutral-100" id="capabilities">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            <div className="lg:col-span-4 sticky top-24">
              <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight mb-10">System Capabilities</h2>
              <div className="flex flex-col items-start gap-2 relative">
                {(Object.keys(tabData) as TabId[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative py-3 text-lg font-medium transition-all text-left w-full group flex items-center"
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute left-0 w-1 h-1 bg-black rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className={`transition-all duration-300 ${
                      activeTab === tab 
                        ? 'text-black translate-x-4 font-semibold' 
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}>
                      {tabData[tab].title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-neutral-50 rounded-2xl p-12 h-full flex flex-col justify-between"
                >
                  <div>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-14 h-14 bg-white rounded-2xl border border-neutral-100 flex items-center justify-center mb-10 shadow-sm"
                    >
                       {activeTab === 'simulate' && <Zap className="w-6 h-6 text-black" />}
                       {activeTab === 'audience' && <Users className="w-6 h-6 text-black" />}
                       {activeTab === 'compare' && <GitCompare className="w-6 h-6 text-black" />}
                       {activeTab === 'predict' && <Activity className="w-6 h-6 text-black" />}
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-['Outfit'] text-4xl font-bold mb-6 tracking-tight text-black"
                    >
                      {tabData[activeTab].title}
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl text-neutral-500 max-w-2xl leading-relaxed font-light"
                    >
                      {tabData[activeTab].description}
                    </motion.p>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-16 mt-16 pt-12 border-t border-neutral-200"
                  >
                    {tabData[activeTab].stats.map((stat, i) => (
                      <div key={i}>
                        <div className="text-4xl font-bold text-black mb-2 tracking-tighter font-['Outfit']">{stat.value}</div>
                        <div className="text-[11px] text-neutral-400 uppercase tracking-[0.2em] font-semibold">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="py-32 px-6 border-t border-neutral-100">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-3 gap-px bg-neutral-100 border border-neutral-100">
             {[
               { icon: Users, label: 'Digital Twins', value: '10,000+' },
               { icon: Activity, label: 'Prediction Models', value: '4' },
               { icon: Zap, label: 'Query Latency', value: '<800ms' },
             ].map((item, i) => (
               <div key={i} className="bg-white p-12 flex flex-col items-start gap-6 hover:bg-neutral-50 transition-colors">
                 <item.icon className="w-8 h-8 text-neutral-400" />
                 <div>
                   <div className="text-4xl font-bold font-['Outfit'] mb-2">{item.value}</div>
                   <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{item.label}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-['Outfit'] text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-orange-900">
            Ready to predict?
          </h2>
          <p className="text-xl text-neutral-600 mb-12">
            Join the future of marketing optimization.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-orange-900 px-10 py-5 bg-black text-white rounded-full font-semibold hover:bg-neutral-800 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 border-t border-neutral-100">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-['Outfit'] font-bold text-xl tracking-tighter">
            Tomorrow.
          </div>
          <div className="flex gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
          </div>
          <div className="text-sm text-neutral-400">
            © 2025 Tomorrow Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

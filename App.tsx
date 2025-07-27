
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MasterDataView from './components/MasterDataView';
import { AppView } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {currentView === AppView.DASHBOARD && <Dashboard />}
        {currentView === AppView.MASTER_DATA && <MasterDataView />}
      </main>
    </div>
  );
}

export default App;

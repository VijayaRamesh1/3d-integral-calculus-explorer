import React, { useState, useEffect } from 'react';
import './App.css';

// Import layout components (will be created shortly)
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Import mode components (will be created shortly)
import AreaMode from './components/modes/AreaMode';
import VolumeMode from './components/modes/VolumeMode';
import PhysicsMode from './components/modes/PhysicsMode';

function App() {
  const [currentMode, setCurrentMode] = useState('area');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Render the current mode component
  const renderModeComponent = () => {
    switch (currentMode) {
      case 'area':
        return <AreaMode />;
      case 'volume':
        return <VolumeMode />;
      case 'physics':
        return <PhysicsMode />;
      default:
        return <AreaMode />;
    }
  };

  return (
    <div className="app">
      <Header 
        currentMode={currentMode} 
        setCurrentMode={setCurrentMode} 
        isMobile={isMobile}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="main-content">
        <div className={`viewport ${sidebarOpen && !isMobile ? 'with-sidebar' : ''}`}>
          {renderModeComponent()}
        </div>
        {(sidebarOpen || !isMobile) && (
          <Sidebar 
            mode={currentMode} 
            isMobile={isMobile}
            onClose={() => isMobile && setSidebarOpen(false)} 
          />
        )}
      </div>
      {isMobile && (
        <div className="mobile-nav">
          <button onClick={() => setSidebarOpen(true)} className="controls-button">
            Controls
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

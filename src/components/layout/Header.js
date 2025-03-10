import React from 'react';
import './Header.css';

const Header = ({ currentMode, setCurrentMode, isMobile, toggleSidebar }) => {
  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>3D Integral Explorer</h1>
      </div>
      
      <nav className="mode-tabs">
        <button 
          className={`mode-tab ${currentMode === 'area' ? 'active' : ''}`}
          onClick={() => handleModeChange('area')}
        >
          Area Mode
        </button>
        <button 
          className={`mode-tab ${currentMode === 'volume' ? 'active' : ''}`}
          onClick={() => handleModeChange('volume')}
        >
          Volume Mode
        </button>
        <button 
          className={`mode-tab ${currentMode === 'physics' ? 'active' : ''}`}
          onClick={() => handleModeChange('physics')}
        >
          Physics Mode
        </button>
      </nav>
      
      {isMobile && (
        <button className="menu-button" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      
      <div className="user-info">
        <div className="level-indicator">Level 3</div>
      </div>
    </header>
  );
};

export default Header;
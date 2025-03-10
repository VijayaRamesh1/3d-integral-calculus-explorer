import React, { useState } from 'react';
import './Sidebar.css';
import { evaluate } from 'mathjs';

const Sidebar = ({ mode, isMobile, onClose }) => {
  const [functionInput, setFunctionInput] = useState('x^2 - 2*x + 3');
  const [showArea, setShowArea] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [showRiemannSum, setShowRiemannSum] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [partitions, setPartitions] = useState(12);
  const [rotationAxis, setRotationAxis] = useState('x=c');
  const [rotationValue, setRotationValue] = useState(3.5);
  const [rotationAngle, setRotationAngle] = useState(360);

  // Calculate results based on current function and settings
  const calculateResults = () => {
    try {
      // This is a simple example calculation - in a real app, these would be more complex
      // and calculated based on the actual 3D visualization parameters
      if (mode === 'area') {
        return {
          area: 24.33
        };
      } else if (mode === 'volume') {
        return {
          area: 42.5,
          volume: 267.9,
          crossSection: 45.2
        };
      } else if (mode === 'physics') {
        return {
          distance: 42.6,
          volumeFilled: 137.5
        };
      }
    } catch (error) {
      console.error('Calculation error:', error);
      return {};
    }
  };

  const results = calculateResults();

  const renderControls = () => {
    switch (mode) {
      case 'area':
        return renderAreaControls();
      case 'volume':
        return renderVolumeControls();
      case 'physics':
        return renderPhysicsControls();
      default:
        return renderAreaControls();
    }
  };

  const renderAreaControls = () => (
    <>
      <div className="control-section">
        <h3>Function Controls</h3>
        <div className="input-group">
          <label>Function:</label>
          <input 
            type="text" 
            value={functionInput} 
            onChange={(e) => setFunctionInput(e.target.value)}
            placeholder="e.g. x^2 - 2*x + 3"
          />
        </div>
        <div className="preset-buttons">
          <button className="preset-button">Linear</button>
          <button className="preset-button">Quadratic</button>
          <button className="preset-button">Sinusoidal</button>
          <button className="preset-button">Custom</button>
        </div>
      </div>
      
      <div className="control-section">
        <h3>Visualization</h3>
        <div className="toggle-group">
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={showArea} 
              onChange={() => setShowArea(!showArea)}
            />
            <span className="toggle-label">Show Area</span>
          </label>
          
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={showRiemannSum} 
              onChange={() => setShowRiemannSum(!showRiemannSum)}
            />
            <span className="toggle-label">Show Riemann Sum</span>
          </label>
          
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={showGrid} 
              onChange={() => setShowGrid(!showGrid)}
            />
            <span className="toggle-label">Show Grid</span>
          </label>
          
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={showValues} 
              onChange={() => setShowValues(!showValues)}
            />
            <span className="toggle-label">Show Values</span>
          </label>
        </div>
        
        <div className="slider-group">
          <label>Partitions: {partitions}</label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={partitions} 
            onChange={(e) => setPartitions(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="results-section">
        <h3>Results</h3>
        <div className="result-item">
          <span>Area:</span> <span className="value">{results.area}</span>
        </div>
      </div>
    </>
  );

  const renderVolumeControls = () => (
    <>
      <div className="control-section">
        <h3>Rotation Controls</h3>
        <div className="button-group">
          <button 
            className={`axis-button ${rotationAxis === 'x=0' ? 'active' : ''}`}
            onClick={() => setRotationAxis('x=0')}
          >
            X=0
          </button>
          <button 
            className={`axis-button ${rotationAxis === 'x=c' ? 'active' : ''}`}
            onClick={() => setRotationAxis('x=c')}
          >
            X=c
          </button>
          <button 
            className={`axis-button ${rotationAxis === 'y=0' ? 'active' : ''}`}
            onClick={() => setRotationAxis('y=0')}
          >
            Y=0
          </button>
        </div>
        
        {rotationAxis === 'x=c' && (
          <div className="slider-group">
            <label>Axis Position: {rotationValue}</label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1"
              value={rotationValue} 
              onChange={(e) => setRotationValue(parseFloat(e.target.value))}
            />
          </div>
        )}
        
        <div className="slider-group">
          <label>Rotation Angle: {rotationAngle}°</label>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={rotationAngle} 
            onChange={(e) => setRotationAngle(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="control-section">
        <h3>Visualization</h3>
        <div className="toggle-group">
          <label className="radio">
            <input 
              type="radio" 
              name="method" 
              checked={true} 
              onChange={() => {}}
            />
            <span className="radio-label">Disk Method</span>
          </label>
          
          <label className="radio">
            <input 
              type="radio" 
              name="method" 
              checked={false} 
              onChange={() => {}}
            />
            <span className="radio-label">Washer Method</span>
          </label>
          
          <label className="radio">
            <input 
              type="radio" 
              name="method" 
              checked={false} 
              onChange={() => {}}
            />
            <span className="radio-label">Shell Method</span>
          </label>
        </div>
        
        <div className="toggle-group">
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={true} 
              onChange={() => {}}
            />
            <span className="toggle-label">Show Cross Sections</span>
          </label>
        </div>
      </div>
      
      <div className="results-section">
        <h3>Results</h3>
        <div className="result-item">
          <span>Area:</span> <span className="value">{results.area}</span>
        </div>
        <div className="result-item">
          <span>Volume:</span> <span className="value">{results.volume}</span>
        </div>
        <div className="result-item">
          <span>Cross-section:</span> <span className="value">{results.crossSection}</span>
        </div>
      </div>
    </>
  );

  const renderPhysicsControls = () => (
    <>
      <div className="control-section">
        <h3>Function Controls</h3>
        <div className="input-group">
          <label>Velocity Function:</label>
          <input 
            type="text" 
            value="2*t^2 - 3*t + 10" 
            onChange={() => {}}
            placeholder="e.g. 2*t^2 - 3*t + 10"
          />
        </div>
        
        <div className="input-group">
          <label>Flow Rate Function:</label>
          <input 
            type="text" 
            value="5 - 0.1*t" 
            onChange={() => {}}
            placeholder="e.g. 5 - 0.1*t"
          />
        </div>
      </div>
      
      <div className="results-section">
        <h3>Results</h3>
        <div className="result-item">
          <span>Distance (∫v dt):</span> <span className="value">{results.distance} units</span>
        </div>
        <div className="result-item">
          <span>Volume Filled (∫r dt):</span> <span className="value">{results.volumeFilled} units³</span>
        </div>
      </div>
      
      <div className="challenge-section">
        <button className="challenge-button">Start Challenge</button>
        <button className="help-button">Help</button>
      </div>
    </>
  );

  return (
    <div className={`sidebar ${isMobile ? 'mobile' : ''}`}>
      {isMobile && (
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      )}
      {renderControls()}
    </div>
  );
};

export default Sidebar;
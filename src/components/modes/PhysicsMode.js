import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { evaluate, parse } from 'mathjs';
import './PhysicsMode.css';

// Function to parse and evaluate mathematical expressions
const evaluateFunction = (expr, t) => {
  try {
    const node = parse(expr);
    const code = node.compile();
    return code.evaluate({ t });
  } catch (error) {
    console.error('Error evaluating function:', error);
    return 0;
  }
};

// Function component for grid
const Grid = () => {
  return (
    <gridHelper 
      args={[20, 20, 0x444444, 0x444444]} 
      position={[0, 0, 0]} 
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
};

// Function component for axes
const Axes = () => {
  return (
    <group>
      {/* X-axis (time) */}
      <mesh position={[5, 0, 0]}>
        <boxGeometry args={[10, 0.05, 0.05]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      
      {/* Y-axis (velocity/height) */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[0.05, 10, 0.05]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
    </group>
  );
};

// Function component for velocity curve
const VelocityCurve = ({ velocityExpr, bounds, color }) => {
  const points = [];
  const [tMin, tMax] = bounds;
  const segments = 100;
  
  for (let i = 0; i <= segments; i++) {
    const t = tMin + (tMax - tMin) * (i / segments);
    const v = evaluateFunction(velocityExpr, t);
    points.push(new THREE.Vector3(t, v, 0));
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={3} />
    </line>
  );
};

// Function component for area under velocity curve (distance)
const DistanceArea = ({ velocityExpr, bounds, currentTime, color }) => {
  const points = [];
  const [tMin, tMax] = bounds;
  const segments = 100;
  const tCurrent = Math.min(Math.max(currentTime, tMin), tMax);
  
  // Add points along curve up to current time
  for (let i = 0; i <= segments; i++) {
    const t = tMin + (tCurrent - tMin) * (i / segments);
    const v = evaluateFunction(velocityExpr, t);
    points.push(new THREE.Vector3(t, v, 0));
  }
  
  // Add points to close the shape
  points.push(new THREE.Vector3(tCurrent, 0, 0));
  points.push(new THREE.Vector3(tMin, 0, 0));
  
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < segments + 1; i++) {
    shape.lineTo(points[i].x, points[i].y);
  }
  
  shape.lineTo(points[segments + 1].x, points[segments + 1].y);
  shape.lineTo(points[segments + 2].x, points[segments + 2].y);
  
  return (
    <mesh position={[0, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Function component for moving object
const MovingObject = ({ velocityExpr, bounds, currentTime, color }) => {
  const [tMin, tMax] = bounds;
  const tCurrent = Math.min(Math.max(currentTime, tMin), tMax);
  
  // Calculate distance (position) by approximately integrating velocity
  const segments = 100;
  const dt = (tCurrent - tMin) / segments;
  let distance = 0;
  
  for (let i = 0; i < segments; i++) {
    const t = tMin + i * dt;
    const v = evaluateFunction(velocityExpr, t);
    distance += v * dt;
  }
  
  // Scale distance for visualization
  const scaledDistance = distance * 0.2;
  
  return (
    <mesh position={[tCurrent, 0, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Function component for the velocity vector
const VelocityVector = ({ velocityExpr, currentTime, bounds, color }) => {
  const [tMin, tMax] = bounds;
  const tCurrent = Math.min(Math.max(currentTime, tMin), tMax);
  const velocity = evaluateFunction(velocityExpr, tCurrent);
  
  return (
    <group position={[tCurrent, 0, 0]}>
      <arrowHelper 
        args={[
          new THREE.Vector3(0, 1, 0).normalize(), 
          new THREE.Vector3(0, 0, 0), 
          Math.abs(velocity) * 0.5, 
          color
        ]} 
      />
    </group>
  );
};

// Function for the water tank
const WaterTank = ({ flowRateExpr, bounds, tankShape, currentTime, color }) => {
  const [tMin, tMax] = bounds;
  const tCurrent = Math.min(Math.max(currentTime, tMin), tMax);
  
  // Calculate volume filled by approximately integrating flow rate
  const segments = 100;
  const dt = (tCurrent - tMin) / segments;
  let volume = 0;
  
  for (let i = 0; i < segments; i++) {
    const t = tMin + i * dt;
    const r = evaluateFunction(flowRateExpr, t);
    volume += r * dt;
  }
  
  // Scale volume for visualization
  const maxVolume = 10;
  const fillRatio = Math.min(volume / maxVolume, 1);
  
  // Create tank geometry based on shape
  let tankGeometry;
  let waterGeometry;
  
  if (tankShape === 'rectangular') {
    const tankWidth = 3;
    const tankHeight = 5;
    const tankDepth = 1;
    
    tankGeometry = (
      <boxGeometry args={[tankWidth, tankHeight, tankDepth]} />
    );
    
    waterGeometry = (
      <boxGeometry args={[
        tankWidth - 0.1, 
        tankHeight * fillRatio, 
        tankDepth - 0.1
      ]} />
    );
    
    return (
      <group position={[-5, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          {tankGeometry}
          <meshBasicMaterial color="#555555" wireframe={true} />
        </mesh>
        <mesh position={[0, -tankHeight/2 + (tankHeight * fillRatio)/2, 0]}>
          {waterGeometry}
          <meshPhongMaterial color={color} transparent opacity={0.8} />
        </mesh>
      </group>
    );
  } else {
    // Non-uniform tank (conical)
    const tankRadius = 2;
    const tankHeight = 5;
    
    tankGeometry = (
      <cylinderGeometry args={[tankRadius * 0.5, tankRadius, tankHeight, 32]} />
    );
    
    waterGeometry = (
      <cylinderGeometry 
        args={[
          tankRadius * 0.5 * (0.9 - 0.1 * fillRatio), 
          tankRadius * 0.9, 
          tankHeight * fillRatio, 
          32
        ]} 
      />
    );
    
    return (
      <group position={[5, 0, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          {tankGeometry}
          <meshBasicMaterial color="#555555" wireframe={true} />
        </mesh>
        <mesh position={[0, -tankHeight/2 + (tankHeight * fillRatio)/2, 0]}>
          {waterGeometry}
          <meshPhongMaterial color={color} transparent opacity={0.8} />
        </mesh>
      </group>
    );
  }
};

// Function component for the height vs time graph
const HeightGraph = ({ flowRateExpr, bounds, tankShape, color }) => {
  const points = [];
  const [tMin, tMax] = bounds;
  const segments = 100;
  
  // Calculate cumulative volume at each time point
  for (let i = 0; i <= segments; i++) {
    const t = tMin + (tMax - tMin) * (i / segments);
    
    // Calculate volume by approximately integrating flow rate
    const dt = (t - tMin) / 20; // Use 20 sub-segments for integration
    let volume = 0;
    
    for (let j = 0; j < 20; j++) {
      const t_j = tMin + j * dt;
      const r = evaluateFunction(flowRateExpr, t_j);
      volume += r * dt;
    }
    
    // Convert volume to height based on tank shape
    let height;
    const maxVolume = 10;
    
    if (tankShape === 'rectangular') {
      height = volume / maxVolume * 5; // Linear relationship for rectangular tank
    } else {
      // For conical tank, height increases faster initially
      height = Math.pow(volume / maxVolume, 0.7) * 5;
    }
    
    points.push(new THREE.Vector3(t, height, 0));
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={3} />
    </line>
  );
};

// Main component for Physics Mode
const PhysicsMode = () => {
  const [velocityExpr, setVelocityExpr] = useState('2*t^2 - 3*t + 10');
  const [flowRateExpr, setFlowRateExpr] = useState('5 - 0.1*t');
  const [bounds, setBounds] = useState([0, 10]);
  const [currentTime, setCurrentTime] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tankShape, setTankShape] = useState('rectangular');
  
  // Animation timer
  useEffect(() => {
    let animationId;
    
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000; // Adjust for current position
      
      const animate = () => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        if (elapsedSeconds <= bounds[1]) {
          setCurrentTime(elapsedSeconds);
          animationId = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, bounds]);
  
  // Colors
  const velocityColor = '#6B88FF';
  const distanceColor = '#6B88FF';
  const objectColor = '#FF6B6B';
  const waterColor = '#5BC0BE';
  const tank1Color = '#5BC0BE';
  const tank2Color = '#FF6B6B';
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const resetAnimation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  return (
    <div className="physics-mode">
      <div className="upper-container">
        <div className="simulation-view">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <color attach="background" args={['#1C2541']} />
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} />
            
            <WaterTank 
              flowRateExpr={flowRateExpr}
              bounds={bounds}
              tankShape="rectangular"
              currentTime={currentTime}
              color={tank1Color}
            />
            
            <WaterTank 
              flowRateExpr={flowRateExpr}
              bounds={bounds}
              tankShape="conical"
              currentTime={currentTime}
              color={tank2Color}
            />
            
            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />
          </Canvas>
          
          <div className="time-control">
            <div className="time-display">TIME: {currentTime.toFixed(2)}</div>
            <input 
              type="range" 
              min={bounds[0]} 
              max={bounds[1]} 
              step={0.01}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="time-slider"
            />
            <div className="control-buttons">
              <button className="control-button" onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="control-button" onClick={resetAnimation}>
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <div className="graph-view">
          <Canvas camera={{ position: [5, 2.5, 10], fov: 60 }}>
            <color attach="background" args={['#1C2541']} />
            <ambientLight intensity={0.5} />
            
            <Grid />
            <Axes />
            
            <VelocityCurve 
              velocityExpr={velocityExpr}
              bounds={bounds}
              color={velocityColor}
            />
            
            <DistanceArea 
              velocityExpr={velocityExpr}
              bounds={bounds}
              currentTime={currentTime}
              color={distanceColor}
            />
            
            <MovingObject 
              velocityExpr={velocityExpr}
              bounds={bounds}
              currentTime={currentTime}
              color={objectColor}
            />
            
            <VelocityVector 
              velocityExpr={velocityExpr}
              currentTime={currentTime}
              bounds={bounds}
              color={objectColor}
            />
            
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
          </Canvas>
        </div>
      </div>
      
      <div className="lower-container">
        <Canvas camera={{ position: [5, 2.5, 10], fov: 60 }}>
          <color attach="background" args={['#1C2541']} />
          <ambientLight intensity={0.5} />
          
          <Grid />
          <Axes />
          
          <HeightGraph 
            flowRateExpr={flowRateExpr}
            bounds={bounds}
            tankShape="rectangular"
            color={tank1Color}
          />
          
          <HeightGraph 
            flowRateExpr={flowRateExpr}
            bounds={bounds}
            tankShape="conical"
            color={tank2Color}
          />
          
          <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
        </Canvas>
        
        <div className="graph-legend">
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: tank1Color }}></div>
            <span>Tank 1 (Rectangular)</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: tank2Color }}></div>
            <span>Tank 2 (Conical)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsMode;
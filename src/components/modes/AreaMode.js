import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { evaluate, parse } from 'mathjs';
import './AreaMode.css';

// Function to parse and evaluate mathematical expressions
const evaluateFunction = (expr, x) => {
  try {
    const node = parse(expr);
    const code = node.compile();
    return code.evaluate({ x });
  } catch (error) {
    console.error('Error evaluating function:', error);
    return 0;
  }
};

// Function component for the grid
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
      {/* X-axis */}
      <mesh position={[5, 0, 0]}>
        <boxGeometry args={[10, 0.05, 0.05]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      
      {/* Y-axis */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[0.05, 10, 0.05]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      
      {/* Z-axis */}
      <mesh position={[0, 0, 5]}>
        <boxGeometry args={[0.05, 0.05, 10]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
    </group>
  );
};

// Function component for the function curve
const FunctionCurve = ({ functionExpr, bounds, color }) => {
  const points = [];
  const [xMin, xMax] = bounds;
  const segments = 100;
  
  for (let i = 0; i <= segments; i++) {
    const x = xMin + (xMax - xMin) * (i / segments);
    const y = evaluateFunction(functionExpr, x);
    points.push(new THREE.Vector3(x, y, 0));
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={3} />
    </line>
  );
};

// Function component for the area under the curve
const AreaUnderCurve = ({ functionExpr, bounds, color }) => {
  const points = [];
  const [xMin, xMax] = bounds;
  const segments = 100;
  
  // Add points along curve
  for (let i = 0; i <= segments; i++) {
    const x = xMin + (xMax - xMin) * (i / segments);
    const y = evaluateFunction(functionExpr, x);
    points.push(new THREE.Vector3(x, y, 0));
  }
  
  // Add points to close the shape
  points.push(new THREE.Vector3(xMax, 0, 0));
  points.push(new THREE.Vector3(xMin, 0, 0));
  
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
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Function component for Riemann sum visualization
const RiemannSum = ({ functionExpr, bounds, partitions, color }) => {
  const [xMin, xMax] = bounds;
  const deltaX = (xMax - xMin) / partitions;
  const rectangles = [];
  
  for (let i = 0; i < partitions; i++) {
    const x = xMin + i * deltaX;
    const y = evaluateFunction(functionExpr, x + deltaX / 2); // Midpoint evaluation
    
    rectangles.push(
      <mesh key={i} position={[x + deltaX / 2, y / 2, 0]}>
        <boxGeometry args={[deltaX * 0.9, y, 0.1]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    );
  }
  
  return <group>{rectangles}</group>;
};

// Main component for Area Mode
const AreaMode = () => {
  const [functionExpr, setFunctionExpr] = useState('x^2 - 2*x + 3');
  const [bounds, setBounds] = useState([-5, 5]);
  const [showArea, setShowArea] = useState(true);
  const [showRiemannSum, setShowRiemannSum] = useState(true);
  const [partitions, setPartitions] = useState(12);
  
  // Colors
  const curveColor = '#5BC0BE';
  const areaColor = '#FF6B6B';
  const riemannColor = '#6B88FF';
  
  return (
    <div className="area-mode">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#1C2541']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Grid />
        <Axes />
        
        <FunctionCurve 
          functionExpr={functionExpr}
          bounds={bounds}
          color={curveColor}
        />
        
        {showArea && (
          <AreaUnderCurve 
            functionExpr={functionExpr}
            bounds={bounds}
            color={areaColor}
          />
        )}
        
        {showRiemannSum && (
          <RiemannSum 
            functionExpr={functionExpr}
            bounds={bounds}
            partitions={partitions}
            color={riemannColor}
          />
        )}
        
        <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />
      </Canvas>
      
      {/* Control points visualization */}
      <div className="control-points">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="control-point"
            style={{
              left: `${10 + i * 15}%`,
              top: `${50 - Math.sin(i * 0.7) * 20}%`
            }}
          />
        ))}
      </div>
      
      {/* Slider for tracing */}
      <div className="trace-slider-container">
        <input 
          type="range" 
          min="0" 
          max="100" 
          defaultValue="50"
          className="trace-slider"
        />
      </div>
    </div>
  );
};

export default AreaMode;
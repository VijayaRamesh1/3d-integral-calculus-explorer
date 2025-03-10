import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { evaluate, parse } from 'mathjs';
import './VolumeMode.css';

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

// Function to create volume of revolution
const createVolumeGeometry = (functionExpr, bounds, rotationAxis, segments, slices) => {
  const [xMin, xMax] = bounds;
  const deltaX = (xMax - xMin) / segments;
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  
  // Create vertices for the volume of revolution
  for (let i = 0; i <= segments; i++) {
    const x = xMin + i * deltaX;
    const y = evaluateFunction(functionExpr, x);
    
    // Create a circle at each x position
    for (let j = 0; j <= slices; j++) {
      const theta = (j / slices) * Math.PI * 2;
      
      if (rotationAxis === 'x=0') {
        // Rotate around y-axis
        vertices.push(
          y * Math.cos(theta), // x
          x, // y (was the original x)
          y * Math.sin(theta)  // z
        );
      } else if (rotationAxis === 'y=0') {
        // Rotate around x-axis
        vertices.push(
          x, // x (was the original x)
          y * Math.cos(theta), // y
          y * Math.sin(theta)  // z
        );
      } else {
        // Default to x=c (rotate around vertical line at x=rotationValue)
        vertices.push(
          x, // x (was the original x)
          y * Math.cos(theta), // y
          y * Math.sin(theta)  // z
        );
      }
    }
  }
  
  // Create triangles from the vertices
  const sliceCount = slices + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * sliceCount + j;
      const b = i * sliceCount + j + 1;
      const c = (i + 1) * sliceCount + j + 1;
      const d = (i + 1) * sliceCount + j;
      
      // Add two triangles to form a quad
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  return geometry;
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

// Function component for 2D curve
const Curve2D = ({ functionExpr, bounds, color }) => {
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
const AreaHighlight = ({ functionExpr, bounds, color }) => {
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
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Function component for the rotation axis
const RotationAxis = ({ axis, value, color }) => {
  if (axis === 'x=0') {
    return (
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    );
  } else if (axis === 'y=0') {
    return (
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    );
  } else {
    // x=c
    return (
      <mesh position={[value, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    );
  }
};

// Function component for the volume of revolution
const VolumeOfRevolution = ({ functionExpr, bounds, rotationAxis, rotationValue, color }) => {
  const geometry = createVolumeGeometry(functionExpr, bounds, rotationAxis, 50, 36);
  
  return (
    <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.6} 
        side={THREE.DoubleSide}
        shininess={50}
      />
    </mesh>
  );
};

// Function component for cross section at a specific position
const CrossSection = ({ functionExpr, position, bounds, rotationAxis, rotationValue, color }) => {
  const y = evaluateFunction(functionExpr, position);
  
  // Create a circle at the position with radius equal to the function value
  return (
    <mesh position={[position, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <ringGeometry args={[0, y, 32]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Main component for Volume Mode
const VolumeMode = () => {
  const [functionExpr, setFunctionExpr] = useState('0.5*x^2 + 1');
  const [bounds, setBounds] = useState([-5, 5]);
  const [rotationAxis, setRotationAxis] = useState('x=c');
  const [rotationValue, setRotationValue] = useState(3.5);
  const [crossSectionPos, setCrossSectionPos] = useState(0);
  const [showCrossSection, setShowCrossSection] = useState(true);
  
  // Colors
  const curveColor = '#5BC0BE';
  const areaColor = '#6B88FF';
  const volumeColor = '#6B88FF';
  const axisColor = '#FF6B6B';
  const crossSectionColor = '#FF6B6B';
  
  return (
    <div className="volume-mode">
      <div className="split-view">
        <div className="left-panel">
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <color attach="background" args={['#1C2541']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            <Grid />
            <Axes />
            
            <Curve2D 
              functionExpr={functionExpr}
              bounds={bounds}
              color={curveColor}
            />
            
            <AreaHighlight 
              functionExpr={functionExpr}
              bounds={bounds}
              color={areaColor}
            />
            
            <RotationAxis 
              axis={rotationAxis}
              value={rotationValue}
              color={axisColor}
            />
            
            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />
          </Canvas>
          
          <div className="panel-label">2D Function</div>
        </div>
        
        <div className="right-panel">
          <Canvas camera={{ position: [5, 5, 10], fov: 60 }}>
            <color attach="background" args={['#1C2541']} />
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Axes />
            
            <VolumeOfRevolution 
              functionExpr={functionExpr}
              bounds={bounds}
              rotationAxis={rotationAxis}
              rotationValue={rotationValue}
              color={volumeColor}
            />
            
            {showCrossSection && (
              <CrossSection 
                functionExpr={functionExpr}
                position={crossSectionPos}
                bounds={bounds}
                rotationAxis={rotationAxis}
                rotationValue={rotationValue}
                color={crossSectionColor}
              />
            )}
            
            <OrbitControls enableRotate={true} enablePan={true} enableZoom={true} />
          </Canvas>
          
          <div className="panel-label">3D Volume</div>
        </div>
      </div>
      
      {/* Cross Section Slider */}
      {showCrossSection && (
        <div className="cross-section-slider-container">
          <input 
            type="range" 
            min={bounds[0]} 
            max={bounds[1]} 
            step={(bounds[1] - bounds[0]) / 100}
            value={crossSectionPos}
            onChange={(e) => setCrossSectionPos(parseFloat(e.target.value))}
            className="cross-section-slider"
          />
        </div>
      )}
    </div>
  );
};

export default VolumeMode;
# 3D Integral Calculus Explorer

An interactive 3D educational tool designed to help students understand integral calculus through visualization and exploration.

## Overview

3D Integral Explorer provides an immersive environment where students can visualize and interact with mathematical concepts related to integral calculus. Through interactive 3D visualizations, students can develop intuitive understanding of areas under curves, volumes of revolution, and physical applications of integration.

## Features

- **Area Under Curve Playground**: Visualize how areas accumulate as you move along the x-axis
- **Volume Revolution Lab**: See how 2D shapes create 3D volumes when rotated around axes
- **Physics Integration**: Connect calculus to real-world applications with simulations
- **Interactive Controls**: Modify functions and immediately see the results
- **Educational Progression**: Gradual introduction of concepts through exploration

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/VijayaRamesh1/3d-integral-calculus-explorer.git
   ```

2. Navigate to the project directory
   ```
   cd 3d-integral-calculus-explorer
   ```

3. Install dependencies
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Start the development server
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

## Deployment

### Deploying to GitHub Pages

1. Install the gh-pages package
   ```
   npm install --save-dev gh-pages
   ```

2. Add the following scripts to your package.json
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```

3. Add a homepage field to your package.json
   ```json
   "homepage": "https://VijayaRamesh1.github.io/3d-integral-calculus-explorer"
   ```

4. Deploy the application
   ```
   npm run deploy
   ```

### Deploying to Other Platforms

The application can also be deployed to platforms like Netlify, Vercel, or AWS Amplify using their respective deployment methods.

## Usage

The application offers three main modes:

### Area Mode
- Draw and modify curves
- Visualize area accumulation in real-time
- Experiment with Riemann sums

### Volume Mode
- Visualize 2D curves rotating to create 3D volumes
- Switch between different rotation axes
- Examine cross-sections of the generated volume

### Physics Mode
- Explore how velocity functions integrate to distance
- Visualize fluid filling containers of different shapes
- See the physical meaning of integration in real-time

## Technologies Used

- React for UI components and state management
- Three.js for 3D visualization
- React Three Fiber for React integration with Three.js
- Math.js for mathematical function parsing and evaluation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

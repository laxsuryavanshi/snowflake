# Boids Simulation 🐦

A real-time flocking simulation implemented in vanilla JavaScript and HTML5 Canvas. This project demonstrates the classic Boids algorithm, which simulates the emergent behavior of flocking birds, fish, or other collective organisms.

🔗 **[Live Preview](https://laxsuryavanshi.me/projects/boids-simulation/)**

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🌟 Features

- **Real-time flocking simulation** with 200 boids
- **Interactive controls** for fine-tuning flocking behavior
- **Three core flocking rules**:
  - **Alignment**: Boids steer toward the average heading of neighbors
  - **Cohesion**: Boids steer toward the center of mass of neighbors
  - **Separation**: Boids steer to avoid crowding local flockmates
- **Cross-window communication** - Boids can fly between browser windows placed side-by-side!
- **Synchronized settings** - Slider changes sync across all connected windows
- **Improved separation** - Inverse distance weighting prevents boid overlapping
- **Soft edge steering** - Natural-looking turns instead of hard bouncing
- **Responsive design** that adapts to window resizing
- **Smooth animations** with proper canvas state management

## 🪟 Multi-Window Mode

The most unique feature of this simulation is **cross-window boid transfer**! When you place two browser windows side-by-side with edges touching:

1. Boids will seamlessly fly from one window to another
2. Windows automatically detect when they're adjacent (within 10px tolerance)
3. Settings (alignment, cohesion, separation) stay synchronized across all windows

### How to Use Multi-Window Mode

1. Open the simulation in your browser
2. Open a second browser window with the same URL (or duplicate the tab)
3. Position the windows so their edges touch (left-right or top-bottom)
4. Watch boids fly between windows!

### Technical Implementation

| Feature            | Implementation                        |
| ------------------ | ------------------------------------- |
| Communication      | BroadcastChannel API                  |
| Window detection   | `screenX`/`screenY` position tracking |
| Edge tolerance     | 10 pixels                             |
| Position broadcast | Every 50ms                            |
| Settings sync      | Real-time via broadcast               |

## 🎮 Live Demo

Open `index.html` in your browser to see the simulation in action!

## 🎛️ Controls

The simulation includes interactive sliders to adjust flocking behavior in real-time:

- **Alignment** (0-0.5): Controls how strongly boids align with their neighbors' direction
- **Cohesion** (0-0.1): Controls how strongly boids move toward the center of their flock
- **Separation** (0-1): Controls how strongly boids avoid crowding each other

### Recommended Settings

| Behavior    | Alignment | Cohesion | Separation |
| ----------- | --------- | -------- | ---------- |
| Default     | 0.08      | 0.005    | 0.15       |
| Tight Flock | 0.15      | 0.02     | 0.1        |
| Loose Group | 0.05      | 0.003    | 0.2        |
| Scattered   | 0.02      | 0.001    | 0.4        |

## 🔧 Configuration

The simulation configuration values are in the `Config` object in `src/boids.js`:

```javascript
const Config = Object.freeze({
  // Simulation
  BOID_COUNT: 200, // Number of boids
  BOID_SPEED: 8, // Maximum movement speed
  MIN_SPEED: 4, // Minimum movement speed

  // Flocking behavior
  NEIGHBOR_DISTANCE: 75, // Detection radius for alignment/cohesion
  SEPARATION_DISTANCE: 15, // Personal space radius
  EDGE_MARGIN: 100, // Soft steering margin from edges
  TURN_FACTOR: 0.3, // Edge avoidance strength

  // Cross-window communication
  EDGE_TOLERANCE: 10, // Pixels tolerance for adjacent window detection
  BROADCAST_INTERVAL: 50, // ms between position broadcasts
  STALE_WINDOW_THRESHOLD: 2000, // ms before considering a window stale

  // Visual
  BOID_COLOR: '#00ffff', // Boid fill color
});
```

## 🧠 How It Works

### The Boids Algorithm

The simulation implements Craig Reynolds' Boids algorithm with three fundamental rules:

1. **Alignment**: Each boid adjusts its direction to match the average direction of nearby boids
2. **Cohesion**: Each boid moves toward the center of mass of nearby boids
3. **Separation**: Each boid avoids crowding by steering away from nearby boids (weighted by inverse distance)

### Improved Flocking Behavior

This implementation includes several enhancements over the basic algorithm:

- **Separate detection distances**: Alignment/cohesion use a larger radius (75px) while separation uses a smaller "personal space" radius (15px)
- **Inverse distance weighting**: Closer boids push harder during separation, preventing overlapping
- **Soft edge steering**: Boids gradually turn away from edges instead of bouncing, creating natural-looking behavior
- **Speed constraints**: Both minimum and maximum speeds ensure boids keep moving realistically

### Cross-Window Communication

The multi-window feature uses the **BroadcastChannel API** for communication:

1. Each window broadcasts its screen position every 50ms
2. Windows calculate if their edges are adjacent (within tolerance)
3. When a boid crosses an "open" edge (adjacent to another window), it transfers
4. The receiving window creates the boid at the corresponding entry point
5. Settings changes are broadcast immediately for real-time sync

## 🏗️ Code Architecture

The codebase follows a modular architecture with clear separation of concerns:

| Module           | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `Config`         | Frozen configuration object with all constants    |
| `Utils`          | Helper functions (ID generation, distance, clamp) |
| `CanvasManager`  | Canvas initialization and resizing                |
| `FlockingParams` | Mutable flocking parameters with getter/setter    |
| `WindowManager`  | Cross-window communication via BroadcastChannel   |
| `BoidManager`    | Boid lifecycle and flocking behavior logic        |
| `Renderer`       | Canvas drawing operations                         |
| `UIManager`      | Slider controls and UI updates                    |
| `Animation`      | Animation loop with start/stop controls           |
| `App`            | Application entry point and initialization        |

### Type Definitions

The code includes JSDoc type definitions for better IDE support:

- `Boid` - Individual boid with position, velocity, and ID
- `WindowInfo` - Window metadata for cross-window detection
- `EdgePosition` - Union type for edge directions
- `EdgeOverlap` - Overlap region between adjacent windows
- `AdjacentWindow` - Adjacent window with edge and overlap info

## 🎨 Customization

### Visual Customization

- Modify boid appearance in the `Renderer.drawBoid()` method
- Change `Config.BOID_COLOR` for different colors
- Adjust the arrow shape vertices in the draw method
- Add trails or effects by modifying the render loop

### Behavioral Customization

- Adjust `FlockingParams` values for different behaviors
- Modify `BoidManager.calculateFlockingForces()` for custom rules
- Add obstacles or boundaries in `BoidManager.applyEdgeAvoidance()`
- Implement predator-prey dynamics by extending `BoidManager`

## 📚 Resources

- [Boids Algorithm](https://en.wikipedia.org/wiki/Boids) - Wikipedia article
- [Craig Reynolds' Original Paper](https://www.red3d.com/cwr/boids/) - The original Boids research
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - MDN documentation

## 🙏 Acknowledgments

- Craig Reynolds for the original Boids algorithm
- The open-source community for inspiration and tools

---

**Enjoy watching the boids flock! 🐦✨**

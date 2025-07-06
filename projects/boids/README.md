# Boids Simulation 🐦

A real-time flocking simulation implemented in vanilla JavaScript and HTML5 Canvas. This project demonstrates the classic Boids algorithm, which simulates the emergent behavior of flocking birds, fish, or other collective organisms.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🌟 Features

- **Real-time flocking simulation** with 100 boids
- **Interactive controls** for fine-tuning flocking behavior
- **Three core flocking rules**:
  - **Alignment**: Boids steer toward the average heading of neighbors
  - **Cohesion**: Boids steer toward the center of mass of neighbors
  - **Separation**: Boids steer to avoid crowding local flockmates
- **Responsive design** that adapts to window resizing
- **Smooth animations** with proper canvas state management
- **Edge collision handling** with safe margins

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
| Tight Flock | 0.3       | 0.05     | 0.2        |
| Loose Group | 0.1       | 0.03     | 0.4        |
| Scattered   | 0.05      | 0.01     | 0.8        |
| Natural     | 0.15      | 0.02     | 0.3        |

## 🔧 Configuration

You can modify the simulation parameters in `src/boids.js`:

```javascript
const BOID_COUNT = 100; // Number of boids
const BOID_SPEED = 5; // Movement speed
const NEIGHBOR_DISTANCE = 40; // Detection radius
const EDGE_MARGIN = 20; // Safe margin from edges
```

## 🧠 How It Works

### The Boids Algorithm

The simulation implements Craig Reynolds' Boids algorithm with three fundamental rules:

1. **Alignment**: Each boid adjusts its direction to match the average direction of nearby boids
2. **Cohesion**: Each boid moves toward the center of mass of nearby boids
3. **Separation**: Each boid avoids crowding by steering away from nearby boids

## 🎨 Customization

### Visual Customization

- Modify boid appearance in the `draw()` function
- Change colors, sizes, and shapes
- Add trails or effects

### Behavioral Customization

- Adjust flocking parameters for different behaviors
- Add obstacles or boundaries
- Implement predator-prey dynamics

## 📚 Resources

- [Boids Algorithm](https://en.wikipedia.org/wiki/Boids) - Wikipedia article
- [Craig Reynolds' Original Paper](https://www.red3d.com/cwr/boids/) - The original Boids research
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - MDN documentation

## 🙏 Acknowledgments

- Craig Reynolds for the original Boids algorithm
- The open-source community for inspiration and tools

---

**Enjoy watching the boids flock! 🐦✨**

/**
 * Boids Flocking Simulation
 *
 * An implementation of Craig Reynolds' Boids algorithm with cross-window communication support
 * using the BroadcastChannel API.
 *
 * @author Laxmikant Suryavanshi
 * @see https://en.wikipedia.org/wiki/Boids
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * @typedef {Object} Boid
 * @property {string} id - Unique identifier
 * @property {number} alpha - Initial angle (radians)
 * @property {number} x - Position on X-axis
 * @property {number} y - Position on Y-axis
 * @property {number} dx - Velocity in X direction
 * @property {number} dy - Velocity in Y direction
 */

/**
 * @typedef {Object} WindowInfo
 * @property {string} id - Unique window identifier
 * @property {number} screenX - Window X position on screen
 * @property {number} screenY - Window Y position on screen
 * @property {number} width - Window width
 * @property {number} height - Window height
 * @property {number} lastSeen - Timestamp of last broadcast
 */

/**
 * @typedef {'left' | 'right' | 'top' | 'bottom'} EdgePosition
 */

/**
 * @typedef {Object} EdgeOverlap
 * @property {number} start - Start position of overlap
 * @property {number} end - End position of overlap
 */

/**
 * @typedef {Object} AdjacentWindow
 * @property {WindowInfo} window - The adjacent window info
 * @property {EdgePosition} edge - Which edge is adjacent
 * @property {EdgeOverlap} overlap - The overlapping region
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const Config = Object.freeze({
  // Simulation
  BOID_COUNT: 200,
  BOID_SPEED: 8,
  MIN_SPEED: 4,

  // Flocking behavior
  NEIGHBOR_DISTANCE: 75,
  SEPARATION_DISTANCE: 15,
  EDGE_MARGIN: 100,
  TURN_FACTOR: 0.3,

  // Cross-window communication
  EDGE_TOLERANCE: 10,
  BROADCAST_INTERVAL: 50,
  STALE_WINDOW_THRESHOLD: 2000,
  WINDOW_MOVE_CHECK_INTERVAL: 100,

  // Visual
  BOID_COLOR: '#00ffff',
});

// =============================================================================
// UTILITIES
// =============================================================================

const Utils = {
  /**
   * Generate a unique ID (crypto.randomUUID only works in secure contexts)
   * @returns {string}
   */
  generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Calculate distance between two points
   * @param {{ x: number, y: number }} a
   * @param {{ x: number, y: number }} b
   * @returns {number}
   */
  distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  },

  /**
   * Clamp a value between min and max
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
};

// =============================================================================
// CANVAS MANAGER
// =============================================================================

const CanvasManager = {
  /** @type {HTMLCanvasElement | null} */
  canvas: null,

  /** @type {CanvasRenderingContext2D | null} */
  ctx: null,

  width: 0,
  height: 0,

  /**
   * Initialize the canvas
   * @param {string} canvasId
   */
  init(canvasId) {
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(canvasId));
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  },

  /**
   * Resize canvas to fit window
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  },

  /**
   * Clear the canvas
   */
  clear() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },
};

// =============================================================================
// FLOCKING PARAMETERS (Mutable state for UI control)
// =============================================================================

const FlockingParams = {
  alignment: 0.08,
  cohesion: 0.005,
  separation: 0.15,

  /**
   * Update all parameters
   * @param {{ alignment?: number, cohesion?: number, separation?: number }} params
   */
  update(params) {
    if (params.alignment !== undefined) this.alignment = params.alignment;
    if (params.cohesion !== undefined) this.cohesion = params.cohesion;
    if (params.separation !== undefined) this.separation = params.separation;
  },

  /**
   * Get current parameters as an object
   * @returns {{ alignment: number, cohesion: number, separation: number }}
   */
  getAll() {
    return {
      alignment: this.alignment,
      cohesion: this.cohesion,
      separation: this.separation,
    };
  },
};

// =============================================================================
// WINDOW MANAGER (Cross-window communication)
// =============================================================================

const WindowManager = {
  /** @type {string} */
  windowId: Utils.generateId(),

  /** @type {BroadcastChannel} */
  channel: new BroadcastChannel('boids-simulation'),

  /** @type {Map<string, WindowInfo>} */
  otherWindows: new Map(),

  /** @type {number} */
  lastScreenX: 0,

  /** @type {number} */
  lastScreenY: 0,

  /**
   * Initialize window manager
   */
  init() {
    this.lastScreenX = window.screenX;
    this.lastScreenY = window.screenY;
    this.channel.onmessage = this.handleMessage.bind(this);

    // Start broadcasting position
    this.broadcastPosition();
    setInterval(() => {
      this.broadcastPosition();
      this.cleanupStaleWindows();
    }, Config.BROADCAST_INTERVAL);

    // Check for window movement
    setInterval(() => {
      if (window.screenX !== this.lastScreenX || window.screenY !== this.lastScreenY) {
        this.lastScreenX = window.screenX;
        this.lastScreenY = window.screenY;
        this.broadcastPosition();
      }
    }, Config.WINDOW_MOVE_CHECK_INTERVAL);

    // Notify on close
    window.addEventListener('beforeunload', () => {
      this.channel.postMessage({
        type: 'window-closing',
        windowInfo: { id: this.windowId },
      });
    });
  },

  /**
   * Broadcast this window's position
   */
  broadcastPosition() {
    this.channel.postMessage({
      type: 'window-position',
      windowInfo: {
        id: this.windowId,
        screenX: window.screenX,
        screenY: window.screenY,
        width: CanvasManager.width,
        height: CanvasManager.height,
        lastSeen: Date.now(),
      },
    });
  },

  /**
   * Broadcast current flocking settings
   */
  broadcastSettings() {
    this.channel.postMessage({
      type: 'settings-sync',
      settings: FlockingParams.getAll(),
    });
  },

  /**
   * Handle incoming broadcast messages
   * @param {MessageEvent} event
   */
  handleMessage(event) {
    /** @type {{ type: string, windowInfo: WindowInfo, boid: Boid, targetWindowId: string, settings?: FlockingParams }} */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = event.data;

    const { type, windowInfo, boid, targetWindowId, settings } = data;

    switch (type) {
      case 'window-position':
        this.otherWindows.set(windowInfo.id, windowInfo);
        break;

      case 'boid-transfer':
        if (targetWindowId === this.windowId) {
          BoidManager.addBoid(boid);
        }
        break;

      case 'window-closing':
        this.otherWindows.delete(windowInfo.id);
        break;

      case 'settings-sync':
        if (settings) {
          FlockingParams.update(settings);
          UIManager.updateDisplay();
        }
        break;
    }
  },

  /**
   * Remove windows that haven't broadcast recently
   */
  cleanupStaleWindows() {
    const now = Date.now();
    for (const [id, info] of this.otherWindows) {
      if (now - info.lastSeen > Config.STALE_WINDOW_THRESHOLD) {
        this.otherWindows.delete(id);
      }
    }
  },

  /**
   * Check which edge of this window is adjacent to another window
   * @param {WindowInfo} other
   * @returns {{ edge: EdgePosition, overlap: EdgeOverlap } | null}
   */
  getAdjacentEdge(other) {
    const my = {
      left: window.screenX,
      right: window.screenX + CanvasManager.width,
      top: window.screenY,
      bottom: window.screenY + CanvasManager.height,
    };

    const their = {
      left: other.screenX,
      right: other.screenX + other.width,
      top: other.screenY,
      bottom: other.screenY + other.height,
    };

    // Vertical overlap (for left/right adjacency)
    const vOverlap = {
      start: Math.max(my.top, their.top),
      end: Math.min(my.bottom, their.bottom),
    };
    const hasVerticalOverlap = vOverlap.end > vOverlap.start;

    // Horizontal overlap (for top/bottom adjacency)
    const hOverlap = {
      start: Math.max(my.left, their.left),
      end: Math.min(my.right, their.right),
    };
    const hasHorizontalOverlap = hOverlap.end > hOverlap.start;

    // Check each edge
    if (hasVerticalOverlap && Math.abs(my.right - their.left) <= Config.EDGE_TOLERANCE) {
      return {
        edge: 'right',
        overlap: { start: vOverlap.start - my.top, end: vOverlap.end - my.top },
      };
    }

    if (hasVerticalOverlap && Math.abs(my.left - their.right) <= Config.EDGE_TOLERANCE) {
      return {
        edge: 'left',
        overlap: { start: vOverlap.start - my.top, end: vOverlap.end - my.top },
      };
    }

    if (hasHorizontalOverlap && Math.abs(my.bottom - their.top) <= Config.EDGE_TOLERANCE) {
      return {
        edge: 'bottom',
        overlap: { start: hOverlap.start - my.left, end: hOverlap.end - my.left },
      };
    }

    if (hasHorizontalOverlap && Math.abs(my.top - their.bottom) <= Config.EDGE_TOLERANCE) {
      return {
        edge: 'top',
        overlap: { start: hOverlap.start - my.left, end: hOverlap.end - my.left },
      };
    }

    return null;
  },

  /**
   * Get all adjacent windows with their edge information
   * @returns {AdjacentWindow[]}
   */
  getAdjacentWindows() {
    const adjacent = [];
    for (const [, windowInfo] of this.otherWindows) {
      const adjacency = this.getAdjacentEdge(windowInfo);
      if (adjacency) {
        adjacent.push({ window: windowInfo, ...adjacency });
      }
    }
    return adjacent;
  },

  /**
   * Check if an edge has an adjacent window at a given position
   * @param {EdgePosition} edge
   * @param {number} position
   * @returns {boolean}
   */
  hasAdjacentWindowAtEdge(edge, position) {
    return this.getAdjacentWindows().some(
      adj => adj.edge === edge && position >= adj.overlap.start && position <= adj.overlap.end
    );
  },

  /**
   * Transfer a boid to an adjacent window
   * @param {Boid} boid
   * @param {WindowInfo} targetWindow
   * @param {{ x: number, y: number }} newPosition
   */
  transferBoid(boid, targetWindow, newPosition) {
    this.channel.postMessage({
      type: 'boid-transfer',
      targetWindowId: targetWindow.id,
      boid: {
        id: boid.id,
        alpha: boid.alpha,
        x: newPosition.x,
        y: newPosition.y,
        dx: boid.dx,
        dy: boid.dy,
      },
    });
  },
};

// =============================================================================
// BOID MANAGER
// =============================================================================

const BoidManager = {
  /** @type {Boid[]} */
  boids: [],

  /**
   * Initialize boids
   */
  init() {
    this.boids = Array.from({ length: Config.BOID_COUNT }, () => this.createBoid());
  },

  /**
   * Create a new boid with random position and velocity
   * @param {Partial<Boid>} [overrides]
   * @returns {Boid}
   */
  createBoid(overrides = {}) {
    const alpha = overrides.alpha ?? Math.random() * 2 * Math.PI;
    return {
      id: overrides.id ?? Utils.generateId(),
      alpha,
      x: overrides.x ?? Math.random() * CanvasManager.width,
      y: overrides.y ?? Math.random() * CanvasManager.height,
      dx: overrides.dx ?? Math.cos(alpha) * Config.BOID_SPEED,
      dy: overrides.dy ?? Math.sin(alpha) * Config.BOID_SPEED,
    };
  },

  /**
   * Add a boid (used when receiving from another window)
   * @param {Partial<Boid>} boidData
   */
  addBoid(boidData) {
    this.boids.push(this.createBoid(boidData));
  },

  /**
   * Remove a boid by reference
   * @param {Boid} boid
   */
  removeBoid(boid) {
    const index = this.boids.indexOf(boid);
    if (index > -1) {
      this.boids.splice(index, 1);
    }
  },

  /**
   * Calculate flocking forces for a boid
   * @param {Boid} boid
   * @returns {{
   *  alignment: {x: number, y: number, count: number},
   *  cohesion: {x: number, y: number, count: number},
   *  separation: {x: number, y: number, count: number},
   * }}
   */
  calculateFlockingForces(boid) {
    const forces = {
      alignment: { x: 0, y: 0, count: 0 },
      cohesion: { x: 0, y: 0, count: 0 },
      separation: { x: 0, y: 0, count: 0 },
    };

    for (const other of this.boids) {
      if (other === boid) continue;

      const d = Utils.distance(boid, other);

      // Separation: very close boids
      if (d < Config.SEPARATION_DISTANCE && d > 0) {
        const pushStrength = (Config.SEPARATION_DISTANCE - d) / d;
        forces.separation.x += (boid.x - other.x) * pushStrength;
        forces.separation.y += (boid.y - other.y) * pushStrength;
        forces.separation.count++;
      }

      // Alignment and cohesion: neighbor distance
      if (d < Config.NEIGHBOR_DISTANCE) {
        forces.alignment.x += other.dx;
        forces.alignment.y += other.dy;
        forces.alignment.count++;

        forces.cohesion.x += other.x;
        forces.cohesion.y += other.y;
        forces.cohesion.count++;
      }
    }

    return forces;
  },

  /**
   * Apply flocking behavior to a boid
   * @param {Boid} boid
   * @param {{
   *  alignment: {x: number, y: number, count: number},
   *  cohesion: {x: number, y: number, count: number},
   *  separation: {x: number, y: number, count: number},
   * }} forces
   */
  applyFlockingForces(boid, forces) {
    // Alignment
    if (forces.alignment.count > 0) {
      const avgDx = forces.alignment.x / forces.alignment.count;
      const avgDy = forces.alignment.y / forces.alignment.count;
      boid.dx += (avgDx - boid.dx) * FlockingParams.alignment;
      boid.dy += (avgDy - boid.dy) * FlockingParams.alignment;
    }

    // Cohesion
    if (forces.cohesion.count > 0) {
      const centerX = forces.cohesion.x / forces.cohesion.count;
      const centerY = forces.cohesion.y / forces.cohesion.count;
      boid.dx += (centerX - boid.x) * FlockingParams.cohesion;
      boid.dy += (centerY - boid.y) * FlockingParams.cohesion;
    }

    // Separation
    if (forces.separation.count > 0) {
      boid.dx += forces.separation.x * FlockingParams.separation;
      boid.dy += forces.separation.y * FlockingParams.separation;
    }
  },

  /**
   * Apply edge avoidance steering
   * @param {Boid} boid
   */
  applyEdgeAvoidance(boid) {
    const { width, height } = CanvasManager;
    const margin = Config.EDGE_MARGIN;
    const turn = Config.TURN_FACTOR;

    if (boid.x < margin && !WindowManager.hasAdjacentWindowAtEdge('left', boid.y)) {
      boid.dx += turn * ((margin - boid.x) / margin);
    }
    if (boid.x > width - margin && !WindowManager.hasAdjacentWindowAtEdge('right', boid.y)) {
      boid.dx -= turn * ((boid.x - (width - margin)) / margin);
    }
    if (boid.y < margin && !WindowManager.hasAdjacentWindowAtEdge('top', boid.x)) {
      boid.dy += turn * ((margin - boid.y) / margin);
    }
    if (boid.y > height - margin && !WindowManager.hasAdjacentWindowAtEdge('bottom', boid.x)) {
      boid.dy -= turn * ((boid.y - (height - margin)) / margin);
    }
  },

  /**
   * Limit boid speed to configured bounds
   * @param {Boid} boid
   */
  limitSpeed(boid) {
    const speed = Math.hypot(boid.dx, boid.dy);

    if (speed > Config.BOID_SPEED) {
      boid.dx = (boid.dx / speed) * Config.BOID_SPEED;
      boid.dy = (boid.dy / speed) * Config.BOID_SPEED;
    } else if (speed < Config.MIN_SPEED && speed > 0) {
      boid.dx = (boid.dx / speed) * Config.MIN_SPEED;
      boid.dy = (boid.dy / speed) * Config.MIN_SPEED;
    }
  },

  /**
   * Check if boid should transfer to adjacent window
   * @param {Boid} boid
   * @returns {boolean} true if transferred
   */
  checkTransfer(boid) {
    const { width, height } = CanvasManager;
    const adjacentWindows = WindowManager.getAdjacentWindows();

    for (const { window: targetWindow, edge, overlap } of adjacentWindows) {
      let shouldTransfer = false;
      let newX = boid.x;
      let newY = boid.y;

      switch (edge) {
        case 'right':
          if (
            boid.x >= width - 5 &&
            boid.dx > 0 &&
            boid.y >= overlap.start &&
            boid.y <= overlap.end
          ) {
            shouldTransfer = true;
            newX = 10;
            const targetOverlapStart = Math.max(0, window.screenY - targetWindow.screenY);
            newY = targetOverlapStart + (boid.y - overlap.start);
          }
          break;

        case 'left':
          if (boid.x <= 5 && boid.dx < 0 && boid.y >= overlap.start && boid.y <= overlap.end) {
            shouldTransfer = true;
            newX = targetWindow.width - 10;
            const targetOverlapStart = Math.max(0, window.screenY - targetWindow.screenY);
            newY = targetOverlapStart + (boid.y - overlap.start);
          }
          break;

        case 'bottom':
          if (
            boid.y >= height - 5 &&
            boid.dy > 0 &&
            boid.x >= overlap.start &&
            boid.x <= overlap.end
          ) {
            shouldTransfer = true;
            newY = 10;
            const targetOverlapStart = Math.max(0, window.screenX - targetWindow.screenX);
            newX = targetOverlapStart + (boid.x - overlap.start);
          }
          break;

        case 'top':
          if (boid.y <= 5 && boid.dy < 0 && boid.x >= overlap.start && boid.x <= overlap.end) {
            shouldTransfer = true;
            newY = targetWindow.height - 10;
            const targetOverlapStart = Math.max(0, window.screenX - targetWindow.screenX);
            newX = targetOverlapStart + (boid.x - overlap.start);
          }
          break;
      }

      if (shouldTransfer) {
        WindowManager.transferBoid(boid, targetWindow, { x: newX, y: newY });
        this.removeBoid(boid);
        return true;
      }
    }

    return false;
  },

  /**
   * Clamp boid position to canvas bounds (for non-adjacent edges)
   * @param {Boid} boid
   */
  clampPosition(boid) {
    const { width, height } = CanvasManager;

    if (!WindowManager.hasAdjacentWindowAtEdge('left', boid.y)) {
      boid.x = Math.max(5, boid.x);
    }
    if (!WindowManager.hasAdjacentWindowAtEdge('right', boid.y)) {
      boid.x = Math.min(width - 5, boid.x);
    }
    if (!WindowManager.hasAdjacentWindowAtEdge('top', boid.x)) {
      boid.y = Math.max(5, boid.y);
    }
    if (!WindowManager.hasAdjacentWindowAtEdge('bottom', boid.x)) {
      boid.y = Math.min(height - 5, boid.y);
    }
  },

  /**
   * Update a single boid
   * @param {Boid} boid
   * @returns {boolean} false if boid was transferred
   */
  updateBoid(boid) {
    // Calculate and apply flocking forces
    const forces = this.calculateFlockingForces(boid);
    this.applyFlockingForces(boid, forces);

    // Apply edge avoidance
    this.applyEdgeAvoidance(boid);

    // Limit speed
    this.limitSpeed(boid);

    // Update position
    boid.x += boid.dx;
    boid.y += boid.dy;

    // Check for window transfer
    if (this.checkTransfer(boid)) {
      return false;
    }

    // Clamp position
    this.clampPosition(boid);

    return true;
  },

  /**
   * Update all boids
   */
  updateAll() {
    // Iterate backwards to safely remove transferred boids
    for (let i = this.boids.length - 1; i >= 0; i--) {
      this.updateBoid(this.boids[i]);
    }
  },
};

// =============================================================================
// RENDERER
// =============================================================================

const Renderer = {
  /**
   * Draw a single boid
   * @param {Boid} boid
   */
  drawBoid(boid) {
    const { ctx } = CanvasManager;
    if (!ctx) return;

    ctx.save();

    const angle = Math.atan2(boid.dy, boid.dx);
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);

    // Draw arrow shape
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, -4);
    ctx.closePath();

    ctx.fillStyle = Config.BOID_COLOR;
    ctx.fill();

    ctx.restore();
  },

  /**
   * Render all boids
   */
  render() {
    CanvasManager.clear();
    for (const boid of BoidManager.boids) {
      this.drawBoid(boid);
    }
  },
};

// =============================================================================
// UI MANAGER
// =============================================================================

const UIManager = {
  /** @type {{ alignment: HTMLInputElement | null, cohesion: HTMLInputElement | null, separation: HTMLInputElement | null }} */
  sliders: {
    alignment: null,
    cohesion: null,
    separation: null,
  },

  /** @type {{ alignment: HTMLElement | null, cohesion: HTMLElement | null, separation: HTMLElement | null }} */
  displays: {
    alignment: null,
    cohesion: null,
    separation: null,
  },

  /**
   * Initialize UI controls
   */
  init() {
    this.sliders.alignment = /** @type {HTMLInputElement} */ (document.getElementById('alignment'));
    this.sliders.cohesion = /** @type {HTMLInputElement} */ (document.getElementById('cohesion'));
    this.sliders.separation = /** @type {HTMLInputElement} */ (
      document.getElementById('separation')
    );

    this.displays.alignment = document.getElementById('alignment-value');
    this.displays.cohesion = document.getElementById('cohesion-value');
    this.displays.separation = document.getElementById('separation-value');

    this.bindEvents();
  },

  /**
   * Bind slider events
   */
  bindEvents() {
    this.sliders.alignment?.addEventListener('input', e => {
      const value = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
      FlockingParams.alignment = value;
      this.updateDisplay();
      WindowManager.broadcastSettings();
    });

    this.sliders.cohesion?.addEventListener('input', e => {
      const value = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
      FlockingParams.cohesion = value;
      this.updateDisplay();
      WindowManager.broadcastSettings();
    });

    this.sliders.separation?.addEventListener('input', e => {
      const value = parseFloat(/** @type {HTMLInputElement} */ (e.target).value);
      FlockingParams.separation = value;
      this.updateDisplay();
      WindowManager.broadcastSettings();
    });
  },

  /**
   * Update UI to reflect current parameter values
   */
  updateDisplay() {
    if (this.sliders.alignment) {
      this.sliders.alignment.value = FlockingParams.alignment.toString();
    }
    if (this.sliders.cohesion) {
      this.sliders.cohesion.value = FlockingParams.cohesion.toString();
    }
    if (this.sliders.separation) {
      this.sliders.separation.value = FlockingParams.separation.toString();
    }

    if (this.displays.alignment) {
      this.displays.alignment.textContent = FlockingParams.alignment.toFixed(3);
    }
    if (this.displays.cohesion) {
      this.displays.cohesion.textContent = FlockingParams.cohesion.toFixed(3);
    }
    if (this.displays.separation) {
      this.displays.separation.textContent = FlockingParams.separation.toFixed(3);
    }
  },
};

// =============================================================================
// ANIMATION LOOP
// =============================================================================

const Animation = {
  /** @type {number} */
  frameId: 0,

  /**
   * Main animation loop
   */
  loop() {
    BoidManager.updateAll();
    Renderer.render();
    this.frameId = requestAnimationFrame(() => {
      this.loop();
    });
  },

  /**
   * Start the animation
   */
  start() {
    this.loop();
  },

  /**
   * Stop the animation
   */
  stop() {
    cancelAnimationFrame(this.frameId);
  },
};

// =============================================================================
// APPLICATION ENTRY POINT
// =============================================================================

const App = {
  /**
   * Initialize the application
   */
  init() {
    // Initialize managers
    CanvasManager.init('boids');
    BoidManager.init();
    UIManager.init();
    WindowManager.init();

    // Handle window resize
    window.addEventListener('resize', () => {
      CanvasManager.resize();
      WindowManager.broadcastPosition();
    });

    // Start animation
    Animation.start();
  },
};

// Start the application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

let width = window.innerWidth;
let height = window.innerHeight;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('boids');
const ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;

const BOID_COUNT = 200;
const BOID_SPEED = 8;
const MIN_SPEED = 4;
const NEIGHBOR_DISTANCE = 75; // distance for alignment and cohesion
const SEPARATION_DISTANCE = 15; // minimum comfortable distance between boids
const EDGE_MARGIN = 100; // safe margin from canvas edges
const TURN_FACTOR = 0.3; // how strongly boids steer away from edges

// flocking parameters (will be controlled by UI)
let alignmentForce = 0.08;
let cohesionForce = 0.005;
let separationForce = 0.15;

/** @type {Boid[]} */
const boids = Array.from({ length: BOID_COUNT }).map(() => {
  const alpha = Math.random() * 2 * Math.PI;

  return {
    alpha,
    x: Math.random() * width,
    dx: Math.cos(alpha) * BOID_SPEED,
    y: Math.random() * height,
    dy: Math.sin(alpha) * BOID_SPEED,
  };
});

/**
 * @param {Boid} boid1
 * @param {Boid} boid2
 */
function distance(boid1, boid2) {
  return Math.hypot(boid1.x - boid2.x, boid1.y - boid2.y);
}

/** @param {Boid} boid */
function update(boid) {
  const alignment = { x: 0, y: 0 };
  const cohesion = { x: 0, y: 0 };
  const separation = { x: 0, y: 0 };

  let alignmentCount = 0;
  let cohesionCount = 0;
  let separationCount = 0;

  for (const other of boids) {
    if (other === boid) continue;

    const d = distance(boid, other);

    // Separation: only consider very close boids (avoid overlapping)
    if (d < SEPARATION_DISTANCE && d > 0) {
      // Weight by inverse distance - closer boids push harder
      const pushStrength = (SEPARATION_DISTANCE - d) / d;
      separation.x += (boid.x - other.x) * pushStrength;
      separation.y += (boid.y - other.y) * pushStrength;
      separationCount++;
    }

    // Alignment and cohesion: consider boids within neighbor distance
    if (d < NEIGHBOR_DISTANCE) {
      alignment.x += other.dx;
      alignment.y += other.dy;
      alignmentCount++;

      cohesion.x += other.x;
      cohesion.y += other.y;
      cohesionCount++;
    }
  }

  // Apply alignment - steer towards average heading
  if (alignmentCount > 0) {
    alignment.x /= alignmentCount;
    alignment.y /= alignmentCount;
    alignment.x = (alignment.x - boid.dx) * alignmentForce;
    alignment.y = (alignment.y - boid.dy) * alignmentForce;
    boid.dx += alignment.x;
    boid.dy += alignment.y;
  }

  // Apply cohesion - steer towards center of mass
  if (cohesionCount > 0) {
    cohesion.x /= cohesionCount;
    cohesion.y /= cohesionCount;
    cohesion.x = (cohesion.x - boid.x) * cohesionForce;
    cohesion.y = (cohesion.y - boid.y) * cohesionForce;
    boid.dx += cohesion.x;
    boid.dy += cohesion.y;
  }

  // Apply separation - steer away from nearby boids (highest priority)
  if (separationCount > 0) {
    separation.x *= separationForce;
    separation.y *= separationForce;
    boid.dx += separation.x;
    boid.dy += separation.y;
  }

  // Soft steering away from edges (more natural than bouncing)
  if (boid.x < EDGE_MARGIN) {
    boid.dx += TURN_FACTOR * ((EDGE_MARGIN - boid.x) / EDGE_MARGIN);
  }
  if (boid.x > width - EDGE_MARGIN) {
    boid.dx -= TURN_FACTOR * ((boid.x - (width - EDGE_MARGIN)) / EDGE_MARGIN);
  }
  if (boid.y < EDGE_MARGIN) {
    boid.dy += TURN_FACTOR * ((EDGE_MARGIN - boid.y) / EDGE_MARGIN);
  }
  if (boid.y > height - EDGE_MARGIN) {
    boid.dy -= TURN_FACTOR * ((boid.y - (height - EDGE_MARGIN)) / EDGE_MARGIN);
  }

  // Limit the boid's speed (max and min)
  const speed = Math.hypot(boid.dx, boid.dy);
  if (speed > BOID_SPEED) {
    boid.dx = (boid.dx / speed) * BOID_SPEED;
    boid.dy = (boid.dy / speed) * BOID_SPEED;
  } else if (speed < MIN_SPEED && speed > 0) {
    boid.dx = (boid.dx / speed) * MIN_SPEED;
    boid.dy = (boid.dy / speed) * MIN_SPEED;
  }

  // Update the boid's position
  boid.x += boid.dx;
  boid.y += boid.dy;

  // Hard boundary clamp (safety net)
  boid.x = Math.max(5, Math.min(width - 5, boid.x));
  boid.y = Math.max(5, Math.min(height - 5, boid.y));

  return boid;
}

/** @param {Boid} boid */
function draw(boid) {
  ctx.save(); // save the current context state

  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(-6, 4);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, -4);
  ctx.closePath();

  ctx.fillStyle = '#00ffff';
  ctx.fill();

  ctx.restore(); // restore the context state
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const boid of boids) update(boid);
  for (const boid of boids) draw(boid);

  requestAnimationFrame(animate);
}

window.onload = () => {
  // Set up UI controls
  const alignmentSlider = document.getElementById('alignment');
  const cohesionSlider = document.getElementById('cohesion');
  const separationSlider = document.getElementById('separation');

  const alignmentValue = document.getElementById('alignment-value');
  const cohesionValue = document.getElementById('cohesion-value');
  const separationValue = document.getElementById('separation-value');

  alignmentSlider.addEventListener('input', e => {
    alignmentForce = parseFloat(e.target.value);
    alignmentValue.textContent = alignmentForce.toFixed(3);
  });

  cohesionSlider.addEventListener('input', e => {
    cohesionForce = parseFloat(e.target.value);
    cohesionValue.textContent = cohesionForce.toFixed(3);
  });

  separationSlider.addEventListener('input', e => {
    separationForce = parseFloat(e.target.value);
    separationValue.textContent = separationForce.toFixed(3);
  });

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });

  requestAnimationFrame(animate);
};

/**
 * @typedef {Object} Boid
 * @property {number} alpha
 * @property {number} x position on X-axis
 * @property {number} dx velocity in X direction
 * @property {number} y position on Y-axis
 * @property {number} dy velocity in Y direction
 */

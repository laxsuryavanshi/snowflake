let width = window.innerWidth;
let height = window.innerHeight;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('boids');
const ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;

const BOID_COUNT = 100;
const BOID_SPEED = 5;
const NEIGHBOR_DISTANCE = 40;
const EDGE_MARGIN = 20; // safe margin from canvas edges

// flocking parameters (will be controlled by UI)
let alignmentForce = 0.15;
let cohesionForce = 0.02;
let separationForce = 0.3;

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

  let neighborCount = 0;

  for (const other of boids) {
    if (other === boid) continue;

    const d = distance(boid, other);
    if (d > NEIGHBOR_DISTANCE) continue;

    alignment.x += other.dx;
    alignment.y += other.dy;

    cohesion.x += other.x;
    cohesion.y += other.y;

    separation.x += boid.x - other.x;
    separation.y += boid.y - other.y;

    neighborCount++;
  }

  if (neighborCount > 0) {
    alignment.x /= neighborCount;
    alignment.y /= neighborCount;

    cohesion.x /= neighborCount;
    cohesion.y /= neighborCount;

    separation.x /= neighborCount;
    separation.y /= neighborCount;

    // steer towards the center of mass
    cohesion.x = (cohesion.x - boid.x) * cohesionForce;
    cohesion.y = (cohesion.y - boid.y) * cohesionForce;

    // steer towards the average heading
    alignment.x = (alignment.x - boid.dx) * alignmentForce;
    alignment.y = (alignment.y - boid.dy) * alignmentForce;

    // steer to avoid crowding local flockmates
    separation.x *= separationForce;
    separation.y *= separationForce;

    boid.dx += alignment.x + cohesion.x + separation.x;
    boid.dy += alignment.y + cohesion.y + separation.y;
  }

  // limit the boid's speed
  const speed = Math.hypot(boid.dx, boid.dy);
  if (speed > BOID_SPEED) {
    boid.dx *= BOID_SPEED / speed;
    boid.dy *= BOID_SPEED / speed;
  }

  // update the boid's position
  boid.x += boid.dx;
  boid.y += boid.dy;

  // bounce off the edges of the canvas with safe margin
  if (boid.x < EDGE_MARGIN) {
    boid.x = EDGE_MARGIN;
    boid.dx = Math.abs(boid.dx); // reverse horizontal velocity
  }
  if (boid.x > width - EDGE_MARGIN) {
    boid.x = width - EDGE_MARGIN;
    boid.dx = -Math.abs(boid.dx); // reverse horizontal velocity
  }
  if (boid.y < EDGE_MARGIN) {
    boid.y = EDGE_MARGIN;
    boid.dy = Math.abs(boid.dy); // reverse vertical velocity
  }
  if (boid.y > height - EDGE_MARGIN) {
    boid.y = height - EDGE_MARGIN;
    boid.dy = -Math.abs(boid.dy); // reverse vertical velocity
  }

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

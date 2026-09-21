const overlay = document.getElementById('overlay');
const cardContainer = document.getElementById('card-container');
const card = document.getElementById('card');
const messageElement = document.getElementById('card-message');
const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const mensajes = [
  "¡Espero que tengas un excelente día! 🌻",
  "Recuerda que eres una persona maravillosa y súper especial. ✨",
  "Nunca dejes de sonreír ni de luchar por tus sueños. 🚀",
  "Gracias por alegrar cada momento con tu presencia. 💛",
  "¡Mucho éxito en todo lo que hagas hoy! 🌟"
];

let indiceMensaje = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

overlay.addEventListener('click', () => {
  audio.play().catch(err => console.log("Audio no pudo iniciar: ", err));
  overlay.style.display = 'none';
  cardContainer.classList.remove('hidden');
  initMorphingParticles();
  animate();
});

card.addEventListener('click', () => {
  messageElement.style.opacity = '0';
  setTimeout(() => {
    indiceMensaje = (indiceMensaje + 1) % mensajes.length;
    messageElement.textContent = mensajes[indiceMensaje];
    messageElement.style.opacity = '1';
  }, 200);
});

// --- LÓGICA DE PARTÍCULAS 3D (Girasol -> Corazón -> DANAE) ---
let particles = [];
const particleCount = 800;
let currentShape = 0;
const intervaloCambio = 4000; // Cambia cada 4 segundos

class Particle {
  constructor() {
    this.x = (Math.random() - 0.5) * 500;
    this.y = (Math.random() - 0.5) * 500;
    this.z = (Math.random() - 0.5) * 500;

    this.targetX = this.x;
    this.targetY = this.y;
    this.targetZ = this.z;

    this.color = '255, 215, 0';
  }

  update() {
    this.x += (this.targetX - this.x) * 0.05;
    this.y += (this.targetY - this.y) * 0.05;
    this.z += (this.targetZ - this.z) * 0.05;
  }

  rotate(ax, ay) {
    let cosY = Math.cos(ay), sinY = Math.sin(ay);
    let x1 = this.x * cosY - this.z * sinY;
    let z1 = this.z * cosY + this.x * sinY;

    let cosX = Math.cos(ax), sinX = Math.sin(ax);
    let y1 = this.y * cosX - z1 * sinX;
    let z2 = z1 * cosX + this.y * sinX;

    this.x = x1;
    this.y = y1;
    this.z = z2;
  }

  draw() {
    const perspective = 600;
    const scale = perspective / (perspective + this.z + 400);
    const projX = (this.x * scale) + (canvas.width / 2);
    const projY = (this.y * scale) + (canvas.height / 2);

    const alpha = Math.max(0.2, (this.z + 300) / 600);
    const size = Math.max(1, scale * 2.2);

    ctx.beginPath();
    ctx.arc(projX, projY, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
    ctx.fill();
  }
}

// 1. Puntos de Girasol
function getSunflowerPoint(i, total) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const radius = Math.sqrt(i / total) * 180;
  const theta = i * 2 * Math.PI * phi;

  return {
    x: radius * Math.cos(theta),
    y: radius * Math.sin(theta),
    z: (Math.random() - 0.5) * 30,
    color: i < total * 0.4 ? '180, 100, 30' : '255, 215, 0'
  };
}

// 2. Puntos de Corazón
function getHeartPoint(i, total) {
  const t = (i / total) * Math.PI * 2;
  const scale = 10;
  
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  const z = (Math.random() - 0.5) * 80;

  return {
    x: x * scale,
    y: y * scale,
    z: z,
    color: '255, 60, 100'
  };
}

// 3. Puntos del texto DANAE
function getDanaePoints(total) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = 400;
  tempCanvas.height = 150;

  tempCtx.font = 'bold 70px sans-serif';
  tempCtx.fillStyle = 'white';
  tempCtx.textAlign = 'center';
  tempCtx.fillText('DANAE', 200, 90);

  const imgData = tempCtx.getImageData(0, 0, 400, 150);
  const validPixels = [];

  for (let y = 0; y < 150; y += 3) {
    for (let x = 0; x < 400; x += 3) {
      const alpha = imgData.data[(y * 400 + x) * 4 + 3];
      if (alpha > 128) {
        validPixels.push({
          x: (x - 200) * 1.2,
          y: (y - 75) * 1.2,
          z: (Math.random() - 0.5) * 40,
          color: '255, 220, 100'
        });
      }
    }
  }

  return validPixels;
}

let danaeCoords = [];

function initMorphingParticles() {
  particles = [];
  danaeCoords = getDanaePoints(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  setShape(0);

  setInterval(() => {
    currentShape = (currentShape + 1) % 3;
    setShape(currentShape);
  }, intervaloCambio);
}

function setShape(shapeIndex) {
  particles.forEach((p, i) => {
    let target;
    if (shapeIndex === 0) {
      target = getSunflowerPoint(i, particleCount);
    } else if (shapeIndex === 1) {
      target = getHeartPoint(i, particleCount);
    } else if (shapeIndex === 2) {
      const coord = danaeCoords[i % danaeCoords.length];
      target = coord || { x: 0, y: 0, z: 0, color: '255, 215, 0' };
    }

    p.targetX = target.x;
    p.targetY = target.y;
    p.targetZ = target.z;
    p.color = target.color;
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.rotate(0.002, 0.003);
    p.draw();
  });

  requestAnimationFrame(animate);
}

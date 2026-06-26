// ===== Theme System =====
const root = document.documentElement;

const allThemes = [
  "midnight-navy",
  "olive-command",
  "sunset-blaze",
  "arctic-mono",
  "stealth-ops"
];

const themeNames = {
  "midnight-navy":  "Midnight Navy",
  "olive-command":  "Olive Command",
  "sunset-blaze":   "Sunset Blaze",
  "arctic-mono":    "Arctic Mono",
  "stealth-ops":    "Stealth Ops"
};

function getCurrentTheme() {
  return root.getAttribute('data-theme') || allThemes[0];
}

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('dashboard-theme', theme);
  // Only update wave colors if canvas is ready
  if (typeof updateWaveColors === 'function') {
    updateWaveColors();
  }
  // Animate the dots to show current color
  const dot1 = document.querySelector('.pill-dot.theme-c1');
  const dot2 = document.querySelector('.pill-dot.theme-c2');
  if (dot1) {
    dot1.style.transform = 'scale(1.3)';
    setTimeout(() => { dot1.style.transform = 'scale(1)'; }, 300);
  }
  if (dot2) {
    dot2.style.transform = 'scale(1.3)';
    setTimeout(() => { dot2.style.transform = 'scale(1)'; }, 300);
  }
}

// ===== Vertical Pill Theme Cycler =====
const themePrevBtn = document.getElementById('theme-prev');
const themeNextBtn = document.getElementById('theme-next');

if (themePrevBtn) {
  themePrevBtn.addEventListener('click', () => {
    const current = getCurrentTheme();
    let idx = allThemes.indexOf(current) - 1;
    if (idx < 0) idx = allThemes.length - 1;
    setTheme(allThemes[idx]);
  });
}

if (themeNextBtn) {
  themeNextBtn.addEventListener('click', () => {
    const current = getCurrentTheme();
    let idx = allThemes.indexOf(current) + 1;
    if (idx >= allThemes.length) idx = 0;
    setTheme(allThemes[idx]);
  });
}

// ===== Theme-aware Wave Colors =====
let waveColors = { c1: 'rgba(0,240,255,0.5)', c2: 'rgba(168,85,247,0.45)', c3: 'rgba(0,150,255,0.35)' };

function updateWaveColors() {
  const style = getComputedStyle(root);
  waveColors.c1 = style.getPropertyValue('--wave-c1').trim() || 'rgba(0,240,255,0.5)';
  waveColors.c2 = style.getPropertyValue('--wave-c2').trim() || 'rgba(168,85,247,0.45)';
  waveColors.c3 = style.getPropertyValue('--wave-c3').trim() || 'rgba(0,150,255,0.35)';
}

// ===== Waveform Visualization =====
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
let isPlaying = false;
let time = 0;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(2, 2);
}

function parseRGBA(str) {
  const match = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4] ?? 1)];
  }
  return [0, 200, 255, 0.4];
}

function drawWave() {
  const w = canvas.width / 2;
  const h = canvas.height / 2;

  ctx.clearRect(0, 0, w, h);

  const [r1, g1, b1, a1] = parseRGBA(waveColors.c1);
  const [r2, g2, b2, a2] = parseRGBA(waveColors.c2);
  const [r3, g3, b3, a3] = parseRGBA(waveColors.c3);

  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, `rgba(${r1},${g1},${b1},${Math.min(a1 + 0.1, 0.5)})`);
  bgGrad.addColorStop(0.5, `rgba(${r2},${g2},${b2},${Math.min(a2 + 0.1, 0.5)})`);
  bgGrad.addColorStop(1, `rgba(${r3},${g3},${b3},${Math.min(a3, 0.35)})`);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const colorSets = [[r1, g1, b1], [r2, g2, b2], [r3, g3, b3]];

  for (let layer = 0; layer < 3; layer++) {
    const alpha = 0.35 - layer * 0.08;
    const speed = isPlaying ? 0.02 + layer * 0.008 : 0.005 + layer * 0.002;
    const amplitude = isPlaying ? 15 + layer * 8 : 5 + layer * 3;
    const yOffset = h * 0.5 + layer * 12;
    const [cr, cg, cb] = colorSets[layer];

    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let x = 0; x <= w; x += 2) {
      const y = yOffset +
        Math.sin(x * 0.025 + time * speed) * amplitude +
        Math.sin(x * 0.015 + time * speed * 1.3) * (amplitude * 0.6) +
        Math.cos(x * 0.04 + time * speed * 0.7) * (amplitude * 0.3);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yOffset - amplitude, 0, h);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha + 0.1})`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},${alpha * 0.2})`);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  time += 1;
  requestAnimationFrame(drawWave);
}

// ===== Music Player Controls =====
const playBtn = document.getElementById('play-btn');
const playIcon = playBtn.querySelector('.play-icon');
const pauseIcon = playBtn.querySelector('.pause-icon');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
let progress = 45;

playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playIcon.classList.toggle('hidden', isPlaying);
  pauseIcon.classList.toggle('hidden', !isPlaying);
  if (isPlaying) startProgress();
});

function startProgress() {
  if (!isPlaying) return;
  progress += 0.15;
  if (progress >= 100) progress = 0;
  progressFill.style.width = progress + '%';
  progressThumb.style.left = progress + '%';
  requestAnimationFrame(startProgress);
}

// ===== Navigation =====
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

// ===== Floating Icon Parallax =====
const icons = document.querySelectorAll('.float-icon');

document.addEventListener('mousemove', (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = (e.clientX - centerX) / centerX;
  const offsetY = (e.clientY - centerY) / centerY;

  icons.forEach((icon, i) => {
    const depth = 6 + i * 3;
    const x = offsetX * depth;
    const y = offsetY * depth;
    icon.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// ===== Stat Bar Animation =====
function animateStatBars() {
  const bars = document.querySelectorAll('.stat-bar');
  bars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 300);
  });
}

// ===== Init =====
window.addEventListener('load', () => {
  // Restore saved theme FIRST (before canvas so wave colors are correct)
  const savedTheme = localStorage.getItem('dashboard-theme');
  if (savedTheme && allThemes.includes(savedTheme)) {
    root.setAttribute('data-theme', savedTheme);
  }

  resizeCanvas();
  updateWaveColors();
  drawWave();
  animateStatBars();
});

window.addEventListener('resize', resizeCanvas);

// ===== Name Pill Glow =====
const namePill = document.getElementById('name-pill');
namePill.addEventListener('mousemove', (e) => {
  const rect = namePill.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  namePill.style.setProperty('--glow-x', x + 'px');
  namePill.style.setProperty('--glow-y', y + 'px');
});

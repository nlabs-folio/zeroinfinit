const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: false });
const statusText = document.getElementById("status");
const soundButton = document.getElementById("soundButton");

let width;
let height;
let dpr;
let centerX;
let centerY;
let radius;

let audioStarted = false;
let audioContext;
let master;
let reverb;
let filter;
let analyser;

let currentProgression = 0;
let chordIndex = 0;
let lastChordTime = 0;
let nextChordTime = 0;

let touchX = 0.5;
let touchY = 0.5;
let touching = false;
let energy = 0;

const TAU = Math.PI * 2;

// D# menor natural: D# F G# A# C#
// Les notes estan expressades com a semitons respecte a D#.
const scale = [0, 2, 3, 5, 7, 8, 10];

// Progressions: graus relatius a D#.
// Cada acord és una col·lecció de semitons.
const progressions = [
  [
    [0, 3, 7],
    [8, 0, 3],
    [3, 7, 10],
    [5, 8, 0]
  ],
  [
    [0, 3, 7],
    [5, 8, 0],
    [8, 0, 3],
    [10, 2, 5]
  ],
  [
    [0, 3, 7],
    [3, 7, 10],
    [5, 8, 0],
    [7, 10, 2]
  ],
  [
    [8, 0, 3],
    [10, 2, 5],
    [0, 3, 7],
    [5, 8, 0]
  ],
  [
    [0, 3, 7],
    [7, 10, 2],
    [5, 8, 0],
    [3, 7, 10]
  ],
  [
    [10, 2, 5],
    [8, 0, 3],
    [5, 8, 0],
    [0, 3, 7]
  ]
];

const stars = [];
const crystals = [];
const petals = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  centerX = width / 2;
  centerY = height / 2 + Math.min(height * 0.04, 35);
  radius = Math.min(width, height) * 0.23;

  createObjects();
}

function createObjects() {
  stars.length = 0;
  crystals.length = 0;
  petals.length = 0;

  const starCount = Math.min(170, Math.floor(width * height / 6500));

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.75 + 0.15,
      phase: Math.random() * TAU
    });
  }

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * TAU + Math.random() * 0.2;
    const distance = radius * (1.25 + Math.random() * 0.7);

    crystals.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance * 0.5,
      angle,
      size: 12 + Math.random() * 24,
      hue: 185 + Math.random() * 90,
      phase: Math.random() * TAU
    });
  }

  for (let i = 0; i < 9; i++) {
    petals.push({
      angle: i / 9 * TAU,
      length: radius * (0.9 + Math.random() * 0.18),
      width: radius * (0.27 + Math.random() * 0.08),
      phase: Math.random() * TAU
    });
  }
}

function draw(time) {
  const t = time * 0.001;
  const pulse = 1 + Math.sin(t * 1.2) * 0.025 + energy * 0.1;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.max(width, height) * 0.75
  );

  gradient.addColorStop(0, "#302064");
  gradient.addColorStop(0.35, "#120d2f");
  gradient.addColorStop(1, "#05040d");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawStars(t);
  drawQuartz(t);
  drawMoonRock(t);
  drawFlower(t, pulse);

  requestAnimationFrame(draw);
}

function drawStars(t) {
  for (const star of stars) {
    const alpha = star.a * (0.65 + Math.sin(t * 0.7 + star.phase) * 0.35);

    ctx.beginPath();
    ctx.fillStyle = `rgba(190, 220, 255, ${alpha})`;
    ctx.arc(star.x, star.y, star.r, 0, TAU);
    ctx.fill();
  }
}

function drawMoonRock(t) {
  ctx.save();
  ctx.translate(centerX, centerY + radius * 0.8);

  const rockGradient = ctx.createRadialGradient(
    -radius * 0.2,
    -radius * 0.2,
    2,
    0,
    0,
    radius * 1.15
  );

  rockGradient.addColorStop(0, "#564b74");
  rockGradient.addColorStop(0.45, "#29223f");
  rockGradient.addColorStop(1, "#0b0916");

  ctx.fillStyle = rockGradient;
  ctx.shadowColor = "rgba(135, 109, 240, .35)";
  ctx.shadowBlur = 30;

  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.18, radius * 0.42, 0, 0, TAU);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(182, 164, 255, .22)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * radius - radius / 2,
      Math.random() * radius * 0.22 - radius * 0.1,
      6 + Math.random() * 15,
      3 + Math.random() * 8,
      Math.random(),
      0,
      TAU
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawQuartz(t) {
  for (const crystal of crystals) {
    const shimmer = 1 + Math.sin(t * 2 + crystal.phase) * 0.12 + energy * 0.3;

    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.angle + Math.PI / 2);

    ctx.shadowColor = `hsla(${crystal.hue}, 100%, 75%, .8)`;
    ctx.shadowBlur = 14 + energy * 25;

    ctx.beginPath();
    ctx.moveTo(0, -crystal.size * shimmer);
    ctx.lineTo(crystal.size * 0.33, 0);
    ctx.lineTo(0, crystal.size * 0.85);
    ctx.lineTo(-crystal.size * 0.33, 0);
    ctx.closePath();

    const crystalGradient = ctx.createLinearGradient(0, -crystal.size, 0, crystal.size);
    crystalGradient.addColorStop(0, `hsla(${crystal.hue}, 100%, 88%, .9)`);
    crystalGradient.addColorStop(0.45, `hsla(${crystal.hue + 35}, 80%, 60%, .45)`);
    crystalGradient.addColorStop(1, "rgba(80, 100, 220, .08)");

    ctx.fillStyle = crystalGradient;
    ctx.fill();
    ctx.restore();
  }
}

function drawFlower(t, pulse) {
  const angleFromTouch = (touchX - 0.5) * 0.8;
  const touchEnergy = touching ? 1 : 0;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Aura exterior
  const aura = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 1.5);
  aura.addColorStop(0, `rgba(241, 160, 255, ${0.16 + energy * 0.15})`);
  aura.addColorStop(0.4, "rgba(98, 135, 255, .08)");
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.5, 0, TAU);
  ctx.fill();

  for (const petal of petals) {
    const petalPulse = 1 + Math.sin(t * 1.3 + petal.phase) * 0.025 + touchEnergy * 0.07;

    ctx.save();
    ctx.rotate(petal.angle + angleFromTouch);
    ctx.scale(petalPulse, petalPulse);

    const petalGradient = ctx.createLinearGradient(0, 0, petal.length, 0);
    petalGradient.addColorStop(0, "#6b3a92");
    petalGradient.addColorStop(0.35, "#bd76c9");
    petalGradient.addColorStop(0.75, "#ffacd9");
    petalGradient.addColorStop(1, "rgba(142, 214, 255, .45)");

    ctx.fillStyle = petalGradient;
    ctx.shadowColor = "rgba(244, 148, 255, .8)";
    ctx.shadowBlur = 22 + energy * 20;

    ctx.beginPath();
    ctx.moveTo(0, -petal.width * 0.18);
    ctx.bezierCurveTo(
      petal.length * 0.28,
      -petal.width,
      petal.length * 0.78,
      -petal.width * 0.58,
      petal.length,
      0
    );
    ctx.bezierCurveTo(
      petal.length * 0.78,
      petal.width * 0.58,
      petal.length * 0.28,
      petal.width,
      0,
      petal.width * 0.18
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 225, 255, .35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Nucli
  const core = ctx.createRadialGradient(0, -radius * 0.04, 2, 0, 0, radius * 0.46);
  core.addColorStop(0, "#fff6ca");
  core.addColorStop(0.18, "#ffb3de");
  core.addColorStop(0.55, "#b65cbb");
  core.addColorStop(1, "#301659");

  ctx.fillStyle = core;
  ctx.shadowColor = "#ffb6ee";
  ctx.shadowBlur = 35 + energy * 30;

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.38 * pulse, 0, TAU);
  ctx.fill();

  // Línies orgàniques del centre
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 246, 219, .7)";
  ctx.lineWidth = 1.2;

  for (let i = 0; i < 7; i++) {
    const a = i * TAU / 7 + t * 0.15;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 7, Math.sin(a) * 7);
    ctx.quadraticCurveTo(
      Math.cos(a + 0.5) * radius * 0.17,
      Math.sin(a + 0.5) * radius * 0.17,
      Math.cos(a) * radius * 0.32,
      Math.sin(a) * radius * 0.32
    );
    ctx.stroke();
  }

  ctx.restore();
}

function createAudio() {
  audioContext = new AudioContext();

  master = audioContext.createGain();
  master.gain.value = 0.22;

  filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 3200;
  filter.Q.value = 0.8;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  reverb = createReverb(audioContext, 2.8);

  master
    .connect(filter)
    .connect(reverb)
    .connect(analyser)
    .connect(audioContext.destination);

  audioStarted = true;
  soundButton.classList.add("active");
  statusText.textContent = "Respiració D♯ activa · acaricia la flor";
}

function createReverb(ac, duration) {
  const node = ac.createConvolver();
  const length = ac.sampleRate * duration;
  const impulse = ac.createBuffer(2, length, ac.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const fade = Math.pow(1 - i / length, 2.7);
      data[i] = (Math.random() * 2 - 1) * fade;
    }
  }

  node.buffer = impulse;
  return node;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playTone(frequency, duration = 3, volume = 0.07, pan = 0) {
  if (!audioStarted) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const harmonic = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const panner = audioContext.createStereoPanner();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);

  harmonic.type = "triangle";
  harmonic.frequency.setValueAtTime(frequency * 2.01, now);

  panner.pan.value = pan;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  harmonic.connect(gain);
  gain.connect(panner).connect(master);

  oscillator.start(now);
  harmonic.start(now);
  oscillator.stop(now + duration + 0.1);
  harmonic.stop(now + duration + 0.1);
}

function playChord() {
  if (!audioStarted) return;

  const chord = progressions[currentProgression][chordIndex];
  const rootMidi = 63; // D#4
  const now = audioContext.currentTime;

  chord.forEach((interval, index) => {
    const octave = index === 2 ? 12 : 0;
    const frequency = midiToFrequency(rootMidi + interval + octave);
    playTone(
      frequency,
      5.5,
      0.045,
      (index - 1) * 0.25
    );
  });

  chordIndex = (chordIndex + 1) % progressions[currentProgression].length;
  lastChordTime = performance.now();
}

function playMelody(x, y) {
  if (!audioStarted) return;

  const scaleIndex = Math.floor(x * scale.length) % scale.length;
  const octave = Math.floor((1 - y) * 2);
  const interval = scale[scaleIndex] + octave * 12;
  const frequency = midiToFrequency(75 + interval);

  playTone(
    frequency,
    1.8,
    0.08 + energy * 0.04,
    (x - 0.5) * 1.7
  );

  energy = Math.min(1, energy + 0.18);
}

function animateAudio() {
  if (audioStarted) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    let sum = 0;
    for (const value of data) sum += value;

    const target = sum / data.length / 255;
    energy += (target - energy) * 0.08;
  } else {
    energy *= 0.96;
  }

  requestAnimationFrame(animateAudio);
}

function updateTouch(clientX, clientY, triggerMelody = false) {
  touchX = clientX / width;
  touchY = clientY / height;

  const distance = Math.hypot(
    clientX - centerX,
    clientY - centerY
  );

  if (distance < radius * 1.05) {
    energy = Math.min(1, energy + 0.07);

    if (triggerMelody) {
      playMelody(touchX, touchY);
    }
  }
}

function activateAudio() {
  if (!audioStarted) {
    createAudio();
  } else if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

soundButton.addEventListener("pointerdown", event => {
  event.stopPropagation();
  activateAudio();
});

canvas.addEventListener("pointerdown", event => {
  activateAudio();
  touching = true;
  updateTouch(event.clientX, event.clientY, true);
});

canvas.addEventListener("pointermove", event => {
  updateTouch(event.clientX, event.clientY, touching);
});

window.addEventListener("pointerup", () => {
  touching = false;
});

document.querySelectorAll("#progressions button").forEach(button => {
  button.addEventListener("pointerdown", event => {
    event.stopPropagation();

    currentProgression = Number(button.dataset.progression);
    chordIndex = 0;

    document
      .querySelectorAll("#progressions button")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");

    if (!audioStarted) activateAudio();

    statusText.textContent =
      `Progressió ${button.textContent} · respiració harmònica D♯`;
  });
});

window.addEventListener("resize", resize);

function musicLoop(time) {
  if (audioStarted) {
    const secondsSinceChord = (performance.now() - lastChordTime) / 1000;

    // Frase harmònica amb un petit espai de silenci.
    if (secondsSinceChord > 7.5) {
      playChord();
    }

    // Filtre que respira lentament.
    const breathing = 1800 + Math.sin(time * 0.00045) * 1200;
    filter.frequency.setTargetAtTime(
      breathing + energy * 4000,
      audioContext.currentTime,
      0.2
    );
  }

  requestAnimationFrame(musicLoop);
}

resize();
requestAnimationFrame(draw);
requestAnimationFrame(animateAudio);
requestAnimationFrame(musicLoop);

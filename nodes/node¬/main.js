const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d", { alpha: false });

const statusText = document.getElementById("status");
const soundButton = document.getElementById("soundButton");
const progressionButtons = document.querySelectorAll("#progressions button");

const TAU = Math.PI * 2;

// Estat visual
let width = 0;
let height = 0;
let dpr = 1;
let centerX = 0;
let centerY = 0;
let flowerRadius = 0;

let stars = [];
let crystals = [];
let petals = [];
let sparks = [];

// Estat d'interacció
let touching = false;
let pointerX = 0.5;
let pointerY = 0.5;
let lastPointerX = 0;
let lastPointerY = 0;
let lastPointerTime = 0;
let lastTouchTime = 0;
let gestureSpeed = 0;

// Estat audiovisual
let energy = 0;
let bassEnergy = 0;
let highEnergy = 0;
let currentProgression = 0;
let chordIndex = 0;
let lastChordTime = 0;
let lastMelodyTime = 0;
let autoMode = true;

// Àudio
let audioContext = null;
let masterGain = null;
let filter = null;
let reverb = null;
let delay = null;
let analyser = null;
let activeVoices = 0;
const maxVoices = 32;

// D♯ menor pentatònica.
// Els intervals són relatius a D♯.
const scale = [0, 3, 5, 7, 10];

// Sis seqüències harmòniques.
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

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  centerX = width / 2;
  centerY = height / 2 + Math.min(height * 0.04, 35);
  flowerRadius = Math.min(width, height) * 0.23;

  createWorld();
}

function createWorld() {
  stars = [];
  crystals = [];
  petals = [];

  const starCount = Math.min(
    170,
    Math.floor((width * height) / 6500)
  );

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.15,
      phase: Math.random() * TAU
    });
  }

  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * TAU + Math.random() * 0.2;
    const distance = flowerRadius * (1.25 + Math.random() * 0.75);

    crystals.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance * 0.54,
      angle,
      size: 11 + Math.random() * 24,
      hue: 185 + Math.random() * 95,
      phase: Math.random() * TAU,
      note: i
    });
  }

  for (let i = 0; i < 10; i++) {
    petals.push({
      angle: i * TAU / 10,
      length: flowerRadius * (0.88 + Math.random() * 0.2),
      width: flowerRadius * (0.26 + Math.random() * 0.1),
      phase: Math.random() * TAU
    });
  }
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createAudio() {
  if (audioContext) {
    audioContext.resume();
    return;
  }

  audioContext = new AudioContext();

  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.22;

  filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  filter.Q.value = 0.7;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.88;

  reverb = createReverb(2.8);

  delay = audioContext.createDelay(1.5);
  delay.delayTime.value = 0.42;

  const delayGain = audioContext.createGain();
  delayGain.gain.value = 0.13;

  masterGain
    .connect(filter)
    .connect(reverb)
    .connect(analyser)
    .connect(audioContext.destination);

  filter.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(reverb);

  soundButton.classList.add("active");
  statusText.textContent = "La flor respira en D♯ · acaricia-la";
  lastChordTime = performance.now() - 5000;
}

function createReverb(seconds) {
  const convolver = audioContext.createConvolver();
  const length = Math.floor(audioContext.sampleRate * seconds);
  const impulse = audioContext.createBuffer(
    2,
    length,
    audioContext.sampleRate
  );

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const fade = Math.pow(1 - i / length, 2.8);
      data[i] = (Math.random() * 2 - 1) * fade;
    }
  }

  convolver.buffer = impulse;
  return convolver;
}

function createVoice(frequency, duration, volume, pan = 0) {
  if (!audioContext || activeVoices >= maxVoices) return;

  activeVoices++;

  const now = audioContext.currentTime;
  const output = audioContext.createGain();
  const panner = audioContext.createStereoPanner();

  panner.pan.value = Math.max(-1, Math.min(1, pan));

  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(
    Math.max(volume, 0.0002),
    now + Math.min(0.14, duration * 0.12)
  );
  output.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );

  const partials = [
    { ratio: 1, gain: 0.74, type: "sine", detune: 0 },
    { ratio: 2.01, gain: 0.18, type: "triangle", detune: 3 },
    { ratio: 3.02, gain: 0.07, type: "sine", detune: -4 },
    { ratio: 5.01, gain: 0.025, type: "sine", detune: 6 }
  ];

  const oscillators = [];

  for (const partial of partials) {
    const oscillator = audioContext.createOscillator();
    const partialGain = audioContext.createGain();

    oscillator.type = partial.type;
    oscillator.frequency.value = frequency * partial.ratio;
    oscillator.detune.value = partial.detune;
    partialGain.gain.value = partial.gain;

    oscillator.connect(partialGain);
    partialGain.connect(output);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);

    oscillators.push(oscillator);
  }

  output
    .connect(panner)
    .connect(masterGain);

  setTimeout(() => {
    activeVoices = Math.max(0, activeVoices - 1);
  }, (duration + 0.25) * 1000);
}

function playMelody(x, y, velocity = 0.4) {
  if (!audioContext) return;

  const now = performance.now();

  if (now - lastMelodyTime < 125) return;
  lastMelodyTime = now;

  const scaleIndex = Math.floor(
    Math.max(0, Math.min(0.999, x)) * scale.length
  );

  const octave = Math.floor((1 - y) * 2);
  const interval = scale[scaleIndex] + octave * 12;
  const frequency = midiToFrequency(75 + interval);

  const volume = 0.045 + velocity * 0.065;
  const pan = (x - 0.5) * 1.8;

  createVoice(frequency, 1.6 + velocity * 1.5, volume, pan);

  createSpark(
    centerX + (x - 0.5) * flowerRadius * 1.7,
    centerY + (y - 0.5) * flowerRadius * 1.7,
    velocity
  );
}

function playCrystal(index) {
  if (!audioContext) return;

  const crystalScale = [0, 3, 5, 7, 10];
  const interval = crystalScale[index % crystalScale.length];
  const frequency = midiToFrequency(87 + interval);

  createVoice(
    frequency,
    2.5,
    0.025,
    Math.sin(index) * 0.8
  );
}

function playChord() {
  if (!audioContext) return;

  const chord = progressions[currentProgression][chordIndex];
  const rootMidi = 63;
  const now = audioContext.currentTime;

  chord.forEach((interval, index) => {
    const octave = index === 2 ? 12 : 0;
    const frequency = midiToFrequency(rootMidi + interval + octave);

    createVoice(
      frequency,
      6.5,
      0.035,
      (index - 1) * 0.32
    );
  });

  chordIndex = (chordIndex + 1) %
    progressions[currentProgression].length;

  lastChordTime = performance.now();
}

function createSpark(x, y, force = 0.5) {
  const count = Math.floor(2 + force * 5);

  for (let i = 0; i < count; i++) {
    sparks.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (0.6 + force * 2),
      vy: (Math.random() - 0.5) * (0.6 + force * 2),
      life: 1,
      size: 1 + Math.random() * 2.5,
      hue: 185 + Math.random() * 100
    });
  }

  if (sparks.length > 160) {
    sparks.splice(0, sparks.length - 160);
  }
}

function draw(time) {
  const t = time * 0.001;

  drawBackground(t);
  drawStars(t);
  drawSparks();
  drawCrystals(t);
  drawMoonRock();
  drawFlower(t);

  requestAnimationFrame(draw);
}

function drawBackground(t) {
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.max(width, height) * 0.75
  );

  gradient.addColorStop(0, "#302064");
  gradient.addColorStop(0.36, "#120d2f");
  gradient.addColorStop(1, "#05040d");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawStars(t) {
  for (const star of stars) {
    const alpha =
      star.alpha *
      (0.68 + Math.sin(t * 0.7 + star.phase) * 0.32);

    ctx.beginPath();
    ctx.fillStyle = `rgba(190, 220, 255, ${alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, TAU);
    ctx.fill();
  }
}

function drawMoonRock() {
  ctx.save();
  ctx.translate(centerX, centerY + flowerRadius * 0.8);

  const gradient = ctx.createRadialGradient(
    -flowerRadius * 0.2,
    -flowerRadius * 0.22,
    2,
    0,
    0,
    flowerRadius * 1.2
  );

  gradient.addColorStop(0, "#5c5078");
  gradient.addColorStop(0.46, "#2b2441");
  gradient.addColorStop(1, "#0b0916");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(135, 109, 240, 0.35)";
  ctx.shadowBlur = 30;

  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    flowerRadius * 1.18,
    flowerRadius * 0.42,
    0,
    0,
    TAU
  );
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(182, 164, 255, 0.2)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(
      (Math.random() - 0.5) * flowerRadius,
      (Math.random() - 0.5) * flowerRadius * 0.25,
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

function drawCrystals(t) {
  crystals.forEach((crystal, index) => {
    const shimmer =
      1 +
      Math.sin(t * 2 + crystal.phase) * 0.12 +
      highEnergy * 0.35;

    const dx = pointerX * width - crystal.x;
    const dy = pointerY * height - crystal.y;
    const distance = Math.hypot(dx, dy);

    if (distance < flowerRadius * 0.42 && touching) {
      if (Math.random() < 0.018) {
        playCrystal(index);
      }
    }

    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.angle + Math.PI / 2);

    ctx.shadowColor =
      `hsla(${crystal.hue}, 100%, 75%, 0.8)`;
    ctx.shadowBlur = 14 + highEnergy * 30;

    ctx.beginPath();
    ctx.moveTo(0, -crystal.size * shimmer);
    ctx.lineTo(crystal.size * 0.34, 0);
    ctx.lineTo(0, crystal.size * 0.88);
    ctx.lineTo(-crystal.size * 0.34, 0);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(
      0,
      -crystal.size,
      0,
      crystal.size
    );

    gradient.addColorStop(
      0,
      `hsla(${crystal.hue}, 100%, 90%, 0.95)`
    );
    gradient.addColorStop(
      0.45,
      `hsla(${crystal.hue + 35}, 80%, 60%, 0.5)`
    );
    gradient.addColorStop(
      1,
      "rgba(80, 100, 220, 0.08)"
    );

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = "rgba(220, 245, 255, 0.42)";
    ctx.stroke();

    ctx.restore();
  });
}

function drawMoonAura() {
  const aura = ctx.createRadialGradient(
    centerX,
    centerY,
    flowerRadius * 0.1,
    centerX,
    centerY,
    flowerRadius * 1.55
  );

  aura.addColorStop(
    0,
    `rgba(241, 160, 255, ${0.13 + energy * 0.23})`
  );
  aura.addColorStop(
    0.42,
    `rgba(98, 135, 255, ${0.06 + highEnergy * 0.12})`
  );
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centerX, centerY, flowerRadius * 1.55, 0, TAU);
  ctx.fill();
}

function drawFlower(t) {
  drawMoonAura();

  const breathing =
    1 +
    Math.sin(t * 0.95) * 0.025 +
    energy * 0.13 +
    bassEnergy * 0.13;

  const touchAngle = (pointerX - 0.5) * 0.8;
  const opening = touching ? 1 + gestureSpeed * 0.12 : 1;

  ctx.save();
  ctx.translate(centerX, centerY);

  petals.forEach(petal => {
    const pulse =
      breathing *
      opening *
      (1 + Math.sin(t * 1.15 + petal.phase) * 0.025);

    ctx.save();
    ctx.rotate(petal.angle + touchAngle);
    ctx.scale(pulse, pulse);

    const gradient = ctx.createLinearGradient(
      0,
      0,
      petal.length,
      0
    );

    gradient.addColorStop(0, "#63368b");
    gradient.addColorStop(0.35, "#bd76c9");
    gradient.addColorStop(0.75, "#ffacd9");
    gradient.addColorStop(1, "rgba(142, 214, 255, 0.42)");

    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(244, 148, 255, 0.8)";
    ctx.shadowBlur = 22 + energy * 28;

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

    ctx.strokeStyle = "rgba(255, 225, 255, 0.34)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  });

  const coreRadius =
    flowerRadius *
    0.38 *
    (1 + bassEnergy * 0.2 + energy * 0.08);

  const core = ctx.createRadialGradient(
    0,
    -flowerRadius * 0.04,
    2,
    0,
    0,
    coreRadius
  );

  core.addColorStop(0, "#fff6ca");
  core.addColorStop(0.18, "#ffb3de");
  core.addColorStop(0.56, "#b65cbb");
  core.addColorStop(1, "#301659");

  ctx.fillStyle = core;
  ctx.shadowColor = "#ffb6ee";
  ctx.shadowBlur = 35 + energy * 35;

  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, TAU);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 246, 219, 0.72)";
  ctx.lineWidth = 1.2;

  for (let i = 0; i < 7; i++) {
    const angle = i * TAU / 7 + t * 0.15;

    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * 7,
      Math.sin(angle) * 7
    );

    ctx.quadraticCurveTo(
      Math.cos(angle + 0.5) * flowerRadius * 0.17,
      Math.sin(angle + 0.5) * flowerRadius * 0.17,
      Math.cos(angle) * flowerRadius * 0.32,
      Math.sin(angle) * flowerRadius * 0.32
    );

    ctx.stroke();
  }

  ctx.restore();
}

function drawSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];

    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life -= 0.025;

    if (spark.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.fillStyle =
      `hsla(${spark.hue}, 100%, 80%, ${spark.life})`;
    ctx.shadowColor =
      `hsla(${spark.hue}, 100%, 75%, ${spark.life})`;
    ctx.shadowBlur = 10;

    ctx.arc(
      spark.x,
      spark.y,
      spark.size * spark.life,
      0,
      TAU
    );

    ctx.fill();
  }
}

function updateGesture(x, y, play = false) {
  const now = performance.now();
  const elapsed = Math.max(16, now - lastPointerTime);

  const distance = Math.hypot(
    x - lastPointerX,
    y - lastPointerY
  );

  gestureSpeed = Math.min(1, (distance / elapsed) * 9);

  pointerX = x / width;
  pointerY = y / height;

  lastPointerX = x;
  lastPointerY = y;
  lastPointerTime = now;
  lastTouchTime = now;
  autoMode = false;

  const distanceToFlower = Math.hypot(
    x - centerX,
    y - centerY
  );

  if (distanceToFlower < flowerRadius * 1.12) {
    energy = Math.min(1, energy + 0.08);

    if (play) {
      playMelody(pointerX, pointerY, gestureSpeed);
    }

    createSpark(x, y, gestureSpeed);
  }
}

function audioAnalysis() {
  if (!analyser) {
    energy *= 0.97;
    bassEnergy *= 0.97;
    highEnergy *= 0.97;
    return;
  }

  const data = new Uint8Array(
    analyser.frequencyBinCount
  );

  analyser.getByteFrequencyData(data);

  let total = 0;
  let bass = 0;
  let high = 0;

  for (let i = 0; i < data.length; i++) {
    total += data[i];

    if (i < 13) bass += data[i];
    if (i > 44) high += data[i];
  }

  const overall = total / data.length / 255;
  const bassValue = bass / 13 / 255;
  const highValue = high / 45 / 255;

  energy += (overall - energy) * 0.08;
  bassEnergy += (bassValue - bassEnergy) * 0.1;
  highEnergy += (highValue - highEnergy) * 0.1;
}

function audioLoop(time) {
  audioAnalysis();

  if (audioContext && audioContext.state === "running") {
    const elapsed = (performance.now() - lastChordTime) / 1000;

    // Cada acord dura aproximadament 7 segons:
    // entrada, presència i dissolució.
    if (elapsed > 7.8) {
      playChord();
    }

    const breathingFilter =
      1700 +
      Math.sin(time * 0.00045) * 1100 +
      energy * 4500;

    filter.frequency.setTargetAtTime(
      breathingFilter,
      audioContext.currentTime,
      0.25
    );

    // Mode autònom: petites notes quan la flor està sola.
    const silenceTime =
      (performance.now() - lastTouchTime) / 1000;

    if (silenceTime > 5 && Math.random() < 0.003) {
      autoMode = true;
      const x = 0.18 + Math.random() * 0.64;
      const y = 0.28 + Math.random() * 0.42;
      playMelody(x, y, 0.2);
    }
  }

  requestAnimationFrame(audioLoop);
}

function activateAudio() {
  createAudio();
}

soundButton.addEventListener("pointerdown", event => {
  event.stopPropagation();
  activateAudio();
});

canvas.addEventListener("pointerdown", event => {
  activateAudio();

  touching = true;

  updateGesture(
    event.clientX,
    event.clientY,
    true
  );
});

canvas.addEventListener("pointermove", event => {
  updateGesture(
    event.clientX,
    event.clientY,
    touching
  );
});

window.addEventListener("pointerup", () => {
  touching = false;
  gestureSpeed *= 0.5;
});

progressionButtons.forEach(button => {
  button.addEventListener("pointerdown", event => {
    event.stopPropagation();

    currentProgression =
      Number(button.dataset.progression);

    chordIndex = 0;

    progressionButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    activateAudio();

    statusText.textContent =
      `Progressió ${button.textContent} · respiració harmònica D♯`;
  });
});

window.addEventListener("resize", resize);

resize();

requestAnimationFrame(draw);
requestAnimationFrame(audioLoop);

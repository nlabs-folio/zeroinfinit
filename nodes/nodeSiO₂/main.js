"use strict";

/* ----------------------------------------------------
   CONFIGURACIÓ
----------------------------------------------------- */

const canvas = document.querySelector("#screen");
const ctx = canvas.getContext("2d", { alpha: false });

const start = document.querySelector("#start");
const W = canvas.width;
const H = canvas.height;


/* --------------------------------------------------
   CONFIGURACIÓ
-------------------------------------------------- */

const LOW_WIDTH = 320;
const LOW_HEIGHT = 180;

const random = (min, max) =>
  min + Math.random() * (max - min);

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

/* --------------------------------------------------
   CANVAS PIXEL ART
-------------------------------------------------- */

const pixelCanvas = document.createElement("canvas");
const pixelView = pixelCanvas.getContext("2d");

pixelCanvas.width = LOW_WIDTH;
pixelCanvas.height = LOW_HEIGHT;
pixelView.imageSmoothingEnabled = false;

let width = 0;
let height = 0;
let pixelRatio = 1;

function resizeCanvas() {
  pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    1.5
  );

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  view.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

  view.imageSmoothingEnabled = false;
}

window.addEventListener("resize", resizeCanvas, {
  passive: true
});

resizeCanvas();

/* --------------------------------------------------
   ESTAT GENERAL
-------------------------------------------------- */

let running = false;
let animationFrame = 0;
let lastTime = 0;

let idleAmount = 0;
let lastActivity = performance.now();

let pointer = {
  x: 0.5,
  y: 0.5,
  active: false
};

const objects = [];
const timers = [];

/* --------------------------------------------------
   CAMP DE CRISTALLS
-------------------------------------------------- */

function createDepthField() {
  objects.length = 0;

  const amount = width < 700 ? 42 : 68;

  for (let i = 0; i < amount; i++) {
    const depth = Math.random();

    objects.push({
      x: random(-1, 1),
      y: random(-1, 1),

      depth,

      size:
        random(3, 8) *
        (0.45 + depth * 2.3),

      angle: random(0, Math.PI * 2),
      rotation: random(-0.0008, 0.0008),

      phase: random(0, Math.PI * 2),
      drift: random(0.00003, 0.00015),

      energy: random(0.25, 0.8),
      pulse: 0,

      hue: Math.random() < 0.15
        ? "gold"
        : "violet"
    });
  }

  objects.sort((a, b) => {
    return a.depth - b.depth;
  });
}

createDepthField();

/* --------------------------------------------------
   ÀUDIO
-------------------------------------------------- */

let audioContext = null;
let master = null;
let analyser = null;
let backgroundOscillator = null;
let backgroundGain = null;
let frequencyData = null;

let audioStarted = false;

function createLfo(min, max, frequency) {
  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  const offset =
    audioContext.createConstantSource();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.value = (max - min) / 2;
  offset.offset.value = (min + max) / 2;

  oscillator.connect(gain);
  offset.connect(gain);

  oscillator.start();
  offset.start();

  return gain;
}

function createBackgroundSound() {
  /*
    Freqüència base baixa i amable.
    Aquesta és la part que crea el so de fons.
  */
  const fundamental = random(90, 130);

  backgroundOscillator =
    audioContext.createOscillator();

  backgroundGain =
    audioContext.createGain();

  const backgroundFilter =
    audioContext.createBiquadFilter();

  backgroundOscillator.type = "sine";
  backgroundOscillator.frequency.value =
    fundamental;

  backgroundGain.gain.value = 0.018;

  backgroundFilter.type = "lowpass";
  backgroundFilter.frequency.value = 900;
  backgroundFilter.Q.value = 0.4;

  /*
    Oscil·lació molt lenta de la freqüència.
    El so es mou lleugerament, com una respiració.
  */
  const pitchMovement = createLfo(
    fundamental * 0.992,
    fundamental * 1.008,
    0.008
  );

  pitchMovement.connect(
    backgroundOscillator.frequency
  );

  backgroundOscillator
    .connect(backgroundGain)
    .connect(backgroundFilter)
    .connect(master);

  backgroundOscillator.start();
}

function createHarmonicLayer() {
  const fundamental = random(90, 130);
  const ratios = [2.01, 3.01, 4.02, 5.03];

  ratios.forEach((ratio, index) => {
    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    const filter =
      audioContext.createBiquadFilter();

    const frequency =
      fundamental * ratio;

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    gain.gain.value =
      0.006 / Math.pow(index + 1, 0.8);

    filter.type = "lowpass";
    filter.frequency.value = 1800 + index * 500;
    filter.Q.value = 0.7;

    const drift = createLfo(
      frequency * 0.997,
      frequency * 1.003,
      random(0.003, 0.012)
    );

    drift.connect(oscillator.frequency);

    oscillator
      .connect(gain)
      .connect(filter)
      .connect(master);

    oscillator.start();
  });
}

function createNoise() {
  const duration = 2;
  const size =
    audioContext.sampleRate * duration;

  const buffer =
    audioContext.createBuffer(
      1,
      size,
      audioContext.sampleRate
    );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source =
    audioContext.createBufferSource();

  const filter =
    audioContext.createBiquadFilter();

  const gain =
    audioContext.createGain();

  source.buffer = buffer;
  source.loop = true;

  filter.type = "bandpass";
  filter.frequency.value = random(1600, 3200);
  filter.Q.value = random(8, 15);

  gain.gain.value = 0.0025;

  source
    .connect(filter)
    .connect(gain)
    .connect(master);

  source.start();
}

function createCrystalEvent() {
  if (!running || !audioContext) {
    return;
  }

  /*
    Durant el repòs hi ha menys esdeveniments,
    però l’espai mai queda completament silenciós.
  */
  const probability =
    0.3 + (1 - idleAmount) * 0.7;

  if (Math.random() <= probability) {
    const now = audioContext.currentTime;

    const root = random(550, 2400);
    const duration = random(0.12, 0.7);

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    const filter =
      audioContext.createBiquadFilter();

    const panner =
      audioContext.createStereoPanner();

    oscillator.type =
      Math.random() < 0.75
        ? "sine"
        : "triangle";

    oscillator.frequency.setValueAtTime(
      root * random(0.8, 1.2),
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      root * random(1.4, 3),
      now + duration
    );

    filter.type = "bandpass";
    filter.frequency.value =
      root * random(1.2, 2.5);

    filter.Q.value = random(8, 24);

    const peak =
      random(0.012, 0.04) *
      (1 - idleAmount * 0.35);

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      peak,
      now + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    panner.pan.value = random(-0.8, 0.8);

    oscillator
      .connect(gain)
      .connect(filter)
      .connect(panner)
      .connect(master);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  timers.push(
    setTimeout(
      createCrystalEvent,
      random(500, 2200)
    )
  );
}function createCrystal(x, y, scale, depth) {
  crystals.push({
    x,
    y,
    baseY: y,
    scale,
    depth,

    height: 2,
    targetHeight: rand(22, 68) * scale,
    width: rand(2, 6) * scale,

    phase: rand(0, TAU),
    growth: rand(.012, .032) * scale,

    hue: Math.random() < .68 ? "cyan" : "violet",

    state: "growth",
    age: 0,
    opacity: .15,
    resonance: 0,
    resonated: false,

    nucleationDuration: rand(45, 100)
  });
}


async function startAudio() {
  if (audioStarted) {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return;
  }

  audioContext = new AudioContext();

  master =
    audioContext.createGain();

  master.gain.value = 0.055;

  const outputFilter =
    audioContext.createBiquadFilter();

  outputFilter.type = "lowpass";
  outputFilter.frequency.value = 6200;
  outputFilter.Q.value = 0.5;

  analyser =
    audioContext.createAnalyser();

  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.86;

  frequencyData =
    new Uint8Array(
      analyser.frequencyBinCount
    );

  master
    .connect(analyser)
    .connect(outputFilter)
    .connect(audioContext.destination);

  createBackgroundSound();
  createHarmonicLayer();
  createNoise();

  audioStarted = true;

  await audioContext.resume();

  createCrystalEvent();
}

/* --------------------------------------------------
   INTERACCIÓ
-------------------------------------------------- */

function updatePointer(event) {
  const rect =
    canvas.getBoundingClientRect();

  pointer.x =
    (event.clientX - rect.left) /
    rect.width;

  pointer.y =
    (event.clientY - rect.top) /
    rect.height;

  lastActivity = performance.now();

  /*
    El moviment del punter desperta suaument l’escena.
  */
  idleAmount *= 0.9;
}

canvas.addEventListener("pointerdown", async event => {
  pointer.active = true;

  updatePointer(event);

  await startAudio();

  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", event => {
  updatePointer(event);
});

canvas.addEventListener("pointerup", () => {
  pointer.active = false;
});

canvas.addEventListener("pointercancel", () => {
  pointer.active = false;
});

/* --------------------------------------------------
   LECTURA DE L'ÀUDIO
-------------------------------------------------- */

function readAudio() {
  if (!analyser) {
    return {
      energy: 0.08,
      low: 0.08,
      mid: 0.05,
      high: 0.03,
      impulse: 0
    };
  }

  analyser.getByteFrequencyData(
    frequencyData
  );

  let low = 0;
  let mid = 0;
  let high = 0;

  for (let i = 0; i < 15; i++) {
    low += frequencyData[i];
  }

  for (let i = 15; i < 48; i++) {
    mid += frequencyData[i];
  }

  for (let i = 48; i < 96; i++) {
    high += frequencyData[i];
  }

  low /= 15 * 255;
  mid /= 33 * 255;
  high /= 48 * 255;

  const energy =
    low * 0.52 +
    mid * 0.3 +
    high * 0.18;

  const previous =
    readAudio.previousEnergy || 0;

  const rise =
    Math.max(0, energy - previous);

  readAudio.previousEnergy =
    previous * 0.88 + energy * 0.12;

  return {
    energy,
    low,
    mid,
    high,
    impulse: clamp(rise * 5, 0, 1)
  };
}

/* --------------------------------------------------
   ESTAT DE REPÒS
-------------------------------------------------- */

function updateIdleState(time) {
  const inactiveTime =
    time - lastActivity;

  /*
    Després de 8 segons comença el repòs.
    La transició dura aproximadament 12 segons.
  */
  const target =
    clamp(
      (inactiveTime - 8000) / 12000,
      0,
      1
    );

  idleAmount +=
    (target - idleAmount) * 0.025;
}

/* --------------------------------------------------
   DIBUIX
-------------------------------------------------- */

function drawBackground(audio, time) {
  const breathing =
    Math.sin(time * 0.0004) * 0.5 + 0.5;

  const energy =
    audio.energy *
    (1 - idleAmount * 0.65);

  pixelView.fillStyle = `rgb(
    ${Math.floor(5 + breathing * 4)},
    ${Math.floor(7 + breathing * 5)},
    ${Math.floor(17 + breathing * 12)}
  )`;

  pixelView.fillRect(
    0,
    0,
    LOW_WIDTH,
    LOW_HEIGHT
  );

  const cx = LOW_WIDTH * 0.5;
  const cy = LOW_HEIGHT * 0.52;
  const radius = 62;

  const glow =
    pixelView.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      radius
    );

  glow.addColorStop(
    0,
    `rgba(100, 120, 255, ${
      0.05 + energy * 0.16
    })`
  );

  glow.addColorStop(
    0.55,
    `rgba(50, 80, 190, ${
      0.025 + energy * 0.06
    })`
  );

  glow.addColorStop(
    1,
    "rgba(10, 20, 70, 0)"
  );

  pixelView.fillStyle = glow;
  pixelView.fillRect(
    cx - radius,
    cy - radius,
    radius * 2,
    radius * 2
  );

  /*
    Graella vertical molt subtil.
  */
  pixelView.fillStyle =
    "rgba(100, 100, 190, 0.025)";

  for (let x = 0; x < LOW_WIDTH; x += 8) {
    pixelView.fillRect(
      x,
      0,
      1,
      LOW_HEIGHT
    );
  }
}

function project(object, audio, time) {
  const base =
    Math.min(LOW_WIDTH, LOW_HEIGHT);

  const perspective =
    0.62 + object.depth * 1.8;

  const calmAudio =
    audio.low *
    (1 - idleAmount * 0.72);

  const parallax =
    1 + object.depth * calmAudio * 0.35;

  const driftX =
    Math.sin(
      time * object.drift +
      object.phase
    ) *
    object.depth *
    8;

  const driftY =
    Math.cos(
      time * object.drift * 0.7 +
      object.phase
    ) *
    object.depth *
    6;

  return {
    x:
      LOW_WIDTH * 0.5 +
      object.x *
      base *
      0.42 *
      perspective *
      parallax +
      driftX,

    y:
      LOW_HEIGHT * 0.52 +
      object.y *
      base *
      0.42 *
      perspective +
      driftY,

    size:
      object.size *
      (0.4 + object.depth * 1.9) *
      (
        1 +
        audio.high *
        (1 - idleAmount * 0.75) *
        object.depth *
        0.5
      )
  };
}

function drawPixelCrystal(
  x,
  y,
  size,
  colorType,
  brightness,
  alpha
) {
  const crystalWidth =
    Math.max(2, Math.floor(size * 0.45));

  const crystalHeight =
    Math.max(5, Math.floor(size * 1.8));

  const colors =
    colorType === "gold"
      ? ["#62441c", "#a8782e", "#e3b557", "#ffe7aa"]
      : ["#242052", "#443e91", "#776bd4", "#c3bcff"];

  const center =
    Math.floor(crystalWidth / 2);

  pixelView.globalAlpha = clamp(
    alpha,
    0,
    1
  );

  /*
    Cristall simètric, construït amb rectangles
    d'una sola píxel d'altura.
  */
  for (let row = 0; row < crystalHeight; row++) {
    const progress =
      row / crystalHeight;

    let halfWidth;

    if (progress < 0.2) {
      halfWidth =
        Math.max(
          1,
          Math.floor(progress * crystalWidth * 2)
        );
    } else if (progress < 0.76) {
      halfWidth =
        Math.max(
          2,
          Math.floor(crystalWidth * 0.5)
        );
    } else {
      halfWidth =
        Math.max(
          1,
          Math.floor(
            (1 - progress) *
            crystalWidth
          )
        );
    }

    const index =
      Math.min(
        colors.length - 1,
        Math.floor(
          progress * colors.length +
          brightness
        )
      );

    pixelView.fillStyle = colors[index];

    pixelView.fillRect(
      Math.floor(x + center - halfWidth),
      Math.floor(
        y + row - crystalHeight / 2
      ),
      Math.max(1, halfWidth * 2),
      1
    );
  }

  /*
    Reflex interior.
  */
  pixelView.fillStyle =
    colorType === "gold"
      ? "#fff3c4"
      : "#e7e3ff";

  pixelView.globalAlpha =
    alpha * brightness * 0.8;

  pixelView.fillRect(
    Math.floor(x - 1),
    Math.floor(y - crystalHeight * 0.25),
    1,
    Math.max(2, Math.floor(crystalHeight * 0.2))
  );

  pixelView.globalAlpha = 1;
}

function drawDepthField(audio, time) {
  for (const object of objects) {
    const position =
      project(object, audio, time);

    const distance =
      Math.hypot(
        pointer.x - object.x * 0.5 - 0.5,
        pointer.y - object.y * 0.5 - 0.5
      );

    const pointerEffect =
      Math.max(0, 1 - distance * 2.2) *
      (pointer.active ? 1 : 0.25);

    const calmAudio =
      audio.energy *
      (1 - idleAmount * 0.7);

    const energy =
      object.energy +
      calmAudio * 0.8 +
      pointerEffect * 0.35 +
      object.pulse;

    const alpha =
      0.12 +
      object.depth * 0.72;

    drawPixelCrystal(
      position.x,
      position.y,
      position.size +
      pointerEffect * 3,
      object.hue,
      clamp(energy, 0, 1.5),
      clamp(alpha, 0, 0.92)
    );

    object.angle += object.rotation;

    object.pulse *= 0.93;
  }
}

function drawCentralCrystal(audio, time) {
  const cx = LOW_WIDTH * 0.5;
  const cy = LOW_HEIGHT * 0.52;

  const pulse =
    1 +
    audio.low * 0.35 +
    audio.impulse * 0.45;

  const breathing =
    Math.sin(time * 0.001) *
    (1 - idleAmount * 0.6);

  drawPixelCrystal(
    cx,
    cy + breathing,
    17 * pulse,
    "violet",
    0.8 + audio.energy * 0.7,
    0.8
  );
}

function renderToScreen() {
  view.clearRect(
    0,
    0,
    width,
    height
  );

  view.imageSmoothingEnabled = false;

  view.drawImage(
    pixelCanvas,
    0,
    0,
    width,
    height
  );
}

/* --------------------------------------------------
   ANIMACIÓ
-------------------------------------------------- */

function updateObjects(dt, audio) {
  for (const object of objects) {
    const targetEnergy =
      0.18 +
      audio.energy *
      (0.3 + object.depth * 0.7) *
      (1 - idleAmount * 0.55);

    object.energy +=
      (targetEnergy - object.energy) *
      Math.min(1, dt * 1.8);

    object.x +=
      Math.sin(
        object.phase +
        performance.now() * 0.0001
      ) *
      object.drift *
      dt *
      10;

    object.y +=
      Math.cos(
        object.phase +
        performance.now() * 0.00013
      ) *
      object.drift *
      dt *
      7;
  }
}

function main(time) {
  if (!running) {
    return;
  }

  const dt =
    Math.min(
      (time - lastTime) / 1000,
      0.05
    );

  lastTime = time;

  const audio = readAudio();

  updateIdleState(time);
  updateObjects(dt, audio);

  pixelView.clearRect(
    0,
    0,
    LOW_WIDTH,
    LOW_HEIGHT
  );

  drawBackground(audio, time);
  drawDepthField(audio, time);
  drawCentralCrystal(audio, time);

  renderToScreen();

  animationFrame =
    requestAnimationFrame(main);
}

/* --------------------------------------------------
   INICI
-------------------------------------------------- */

async function startExperience() {
  if (running) {
    await startAudio();
    return;
  }

  running = true;
  lastActivity = performance.now();

  await startAudio();

  createDepthField();

  lastTime = performance.now();

  animationFrame =
    requestAnimationFrame(main);
}

canvas.addEventListener(
  "pointerdown",
  startExperience,
  { once: false }
);
resetWorld();
requestAnimationFrame(render);

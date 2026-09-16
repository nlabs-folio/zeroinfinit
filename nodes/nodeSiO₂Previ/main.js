const canvas = document.querySelector("#visual");
const view = canvas.getContext("2d", {
  alpha: false,
  desynchronized: true
});

const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");

let audioContext = null;
let master = null;
let analyser = null;

let running = false;
let animationFrame = 0;
let lastTime = 0;
let lastEventTime = 0;

let width = 0;
let height = 0;
let pixelRatio = 1;

const timers = [];
const objects = [];

const frequencyData = new Uint8Array(128);

const random = (min, max) => {
  return min + Math.random() * (max - min);
};

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/* --------------------------------------------------
   CANVAS
-------------------------------------------------- */

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  view.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

window.addEventListener("resize", resizeCanvas, {
  passive: true
});

resizeCanvas();

/* --------------------------------------------------
   CAMP DE PROFUNDITAT
-------------------------------------------------- */

function createDepthField() {
  objects.length = 0;

  const amount = width < 700 ? 46 : 72;

  for (let i = 0; i < amount; i++) {
    const depth = Math.random();

    objects.push({
      x: random(-1, 1),
      y: random(-1, 1),

      /*
        0 = lluny
        1 = proper
      */
      depth,

      size: random(3, 9) * (.45 + depth * 2.3),

      angle: random(0, Math.PI * 2),
      rotation: random(-.0008, .0008),

      phase: random(0, Math.PI * 2),
      drift: random(.00003, .00015),

      energy: random(.25, .8),
      pulse: 0,

      /*
        Variació individual per evitar simetria.
      */
      irregularity: random(.7, 1.3),

      sides: Math.random() < .75 ? 4 : 6
    });
  }

  /*
    Els elements llunyans es dibuixen primer.
    Els propers queden per sobre i creen oclusió.
  */
  objects.sort((a, b) => a.depth - b.depth);
}

/* --------------------------------------------------
   ÀUDIO
-------------------------------------------------- */

function createLfo(min, max, frequency) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const offset = audioContext.createConstantSource();

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

function startQuartzBody() {
  const fundamental = random(90, 130);
  const ratios = [1, 2.01, 3.01, 4.02, 5.03, 7.01];

  ratios.forEach((ratio, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    const frequency = fundamental * ratio;

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;

    gain.gain.value =
      .014 / Math.pow(index + 1, .85);

    filter.type = "lowpass";
    filter.frequency.value = 2600 + index * 500;
    filter.Q.value = .7;

    const drift = createLfo(
      frequency * .996,
      frequency * 1.004,
      random(.003, .015)
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
  const size = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(
    1,
    size,
    audioContext.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = buffer;
  source.loop = true;

  filter.type = "bandpass";
  filter.frequency.value = random(1800, 4500);
  filter.Q.value = random(8, 18);

  gain.gain.value = .0045;

  source
    .connect(filter)
    .connect(gain)
    .connect(master);

  source.start();
}

function startGlobalEvolution() {
  const filterLfo = audioContext.createOscillator();
  const filterDepth = audioContext.createGain();

  filterLfo.frequency.value = .018;
  filterDepth.gain.value = 1300;

  filterLfo
    .connect(filterDepth)
    .connect(master.filter.frequency);

  filterLfo.start();

  const volumeLfo = audioContext.createOscillator();
  const volumeDepth = audioContext.createGain();

  volumeLfo.frequency.value = .009;
  volumeDepth.gain.value = .006;

  volumeLfo
    .connect(volumeDepth)
    .connect(master.gain);

  volumeLfo.start();
}

function createCrystalEvent() {
  if (!running) return;

  const now = audioContext.currentTime;
  const root = random(550, 2400);
  const duration = random(.08, .65);

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const panner = audioContext.createStereoPanner();

  oscillator.type =
    Math.random() < .7 ? "sine" : "triangle";

  oscillator.frequency.setValueAtTime(
    root * random(.8, 1.2),
    now
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    root * random(1.5, 3.5),
    now + duration
  );

  filter.type = "bandpass";
  filter.frequency.value = root * random(1.2, 2.5);
  filter.Q.value = random(8, 30);

  const peak = random(.015, .05);

  gain.gain.setValueAtTime(.0001, now);

  gain.gain.exponentialRampToValueAtTime(
    peak,
    now + .005
  );

  gain.gain.exponentialRampToValueAtTime(
    .0001,
    now + duration
  );

  panner.pan.value = random(-.8, .8);

  oscillator
    .connect(gain)
    .connect(filter)
    .connect(panner)
    .connect(master);

  oscillator.start(now);
  oscillator.stop(now + duration + .04);

  timers.push(
    setTimeout(createCrystalEvent, random(250, 1800))
  );
}

function readAudio() {
  if (!analyser) {
    return {
      energy: 0,
      low: 0,
      mid: 0,
      high: 0,
      impulse: 0
    };
  }

  analyser.getByteFrequencyData(frequencyData);

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
    low * .52 +
    mid * .3 +
    high * .18;

  const previousEnergy = readAudio.previousEnergy || 0;
  const rise = Math.max(0, energy - previousEnergy);

  readAudio.previousEnergy =
    previousEnergy * .88 + energy * .12;

  return {
    energy,
    low,
    mid,
    high,
    impulse: clamp(rise * 5, 0, 1)
  };
}

/* --------------------------------------------------
   PROJECCIÓ DE PROFUNDITAT
-------------------------------------------------- */

function project(object, audio, time) {
  const base = Math.min(width, height);

  /*
    Els objectes propers s'allunyen més del punt de fuga
    i semblen més grans.
  */
  const perspective =
    .62 + object.depth * 1.8;

  const parallax =
    1 + object.depth * audio.low * .35;

  const driftX =
    Math.sin(time * object.drift + object.phase) *
    object.depth *
    14;

  const driftY =
    Math.cos(time * object.drift * .7 + object.phase) *
    object.depth *
    9;

  return {
    x:
      width * .5 +
      object.x * base * .42 * perspective * parallax +
      driftX,

    y:
      height * .52 +
      object.y * base * .42 * perspective +
      driftY,

    size:
      object.size *
      (.4 + object.depth * 1.9) *
      (1 + audio.high * object.depth * .5)
  };
}

/* --------------------------------------------------
   DIBUIX
-------------------------------------------------- */

function drawBackground(audio) {
  view.fillStyle = "rgba(9, 12, 18, .2)";
  view.fillRect(0, 0, width, height);

  const cx = width * .5;
  const cy = height * .52;
  const radius = Math.min(width, height) * .27;

  const glow = view.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    radius * (1 + audio.low)
  );

  glow.addColorStop(
    0,
    `rgba(115, 190, 255, ${.06 + audio.energy * .15})`
  );

  glow.addColorStop(
    .45,
    `rgba(50, 110, 210, ${.025 + audio.high * .06})`
  );

  glow.addColorStop(
    1,
    "rgba(10, 25, 60, 0)"
  );

  view.fillStyle = glow;
  view.beginPath();
  view.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
  view.fill();
}

function drawPerspectiveVeins(audio, time) {
  const cx = width * .5;
  const cy = height * .52;
  const distance = Math.max(width, height);

  view.save();
  view.lineWidth = .5;

  for (let i = 0; i < 18; i++) {
    const angle =
      i * Math.PI * 2 / 18 +
      Math.sin(time * .0001 + i) * .025;

    const x2 = cx + Math.cos(angle) * distance;
    const y2 = cy + Math.sin(angle) * distance;

    view.strokeStyle =
      `rgba(100, 170, 240, ${.018 + audio.high * .07})`;

    view.beginPath();
    view.moveTo(cx, cy);
    view.lineTo(x2, y2);
    view.stroke();
  }

  view.restore();
}

function drawCrystal(
  x,
  y,
  size,
  angle,
  alpha,
  energy,
  depth
) {
  const widthCrystal =
    size * (.35 + depth * .42);

  const heightCrystal =
    size * (1.5 + depth * 1.8);

  view.save();
  view.translate(x, y);
  view.rotate(angle);

  /*
    Halo molt local. Només el fem per cristalls propers
    per evitar un cost excessiu.
  */
  if (depth > .72 && energy > .25) {
    const glow = view.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      heightCrystal * 1.4
    );

    glow.addColorStop(
      0,
      `rgba(190, 230, 255, ${alpha * .22})`
    );

    glow.addColorStop(
      1,
      "rgba(90, 150, 255, 0)"
    );

    view.fillStyle = glow;
    view.beginPath();
    view.arc(0, 0, heightCrystal * 1.4, 0, Math.PI * 2);
    view.fill();
  }

  /*
    Ombra només en el primer pla.
  */
  if (depth > .82) {
    view.shadowColor = "rgba(125, 200, 255, .45)";
    view.shadowBlur = 7;
  }

  view.beginPath();
  view.moveTo(0, -heightCrystal);
  view.lineTo(widthCrystal, 0);
  view.lineTo(0, heightCrystal);
  view.lineTo(-widthCrystal, 0);
  view.closePath();

  view.fillStyle =
    `rgba(110, 180, 255, ${alpha * .1})`;

  view.strokeStyle =
    `rgba(185, 230, 255, ${alpha * (.35 + energy * .3)})`;

  view.lineWidth = depth > .65 ? 1.1 : .6;

  view.fill();
  view.stroke();

  /*
    Cara lateral per suggerir volum.
  */
  view.shadowBlur = 0;

  view.beginPath();
  view.moveTo(0, -heightCrystal);
  view.lineTo(widthCrystal * .35, 0);
  view.lineTo(0, heightCrystal);
  view.closePath();

  view.fillStyle =
    `rgba(225, 245, 255, ${alpha * .14})`;

  view.fill();

  /*
    Reflex interior.
  */
  view.strokeStyle =
    `rgba(235, 250, 255, ${alpha * (.2 + energy * .25)})`;

  view.beginPath();
  view.moveTo(0, -heightCrystal * .7);
  view.lineTo(0, heightCrystal * .65);
  view.stroke();

  view.restore();
}

function drawDepthField(audio, time) {
  for (const object of objects) {
    const position = project(object, audio, time);

    const alpha =
      .08 +
      object.depth * .7;

    const energy =
      object.energy +
      audio.energy * .7 +
      object.pulse;

    drawCrystal(
      position.x,
      position.y,
      position.size,
      object.angle,
      clamp(alpha, 0, .9),
      clamp(energy, 0, 1.8),
      object.depth
    );

    object.angle += object.rotation;
  }
}

function drawCore(audio, time) {
  const cx = width * .5;
  const cy = height * .52;
  const radius = Math.min(width, height) * .13;

  const pulse =
    1 + audio.low * .3 + audio.impulse * .35;

  view.save();
  view.translate(cx, cy);
  view.rotate(time * .000025);

  view.beginPath();

  const sides = 10;

  for (let i = 0; i <= sides; i++) {
    const angle = i / sides * Math.PI * 2;
    const amount =
      radius *
      pulse *
      (.85 + audio.high * .2);

    const x = Math.cos(angle) * amount;
    const y = Math.sin(angle) * amount;

    if (i === 0) view.moveTo(x, y);
    else view.lineTo(x, y);
  }

  view.closePath();

  view.fillStyle =
    `rgba(80, 155, 240, ${.035 + audio.energy * .08})`;

  view.strokeStyle =
    `rgba(185, 230, 255, ${.3 + audio.energy * .45})`;

  view.lineWidth = 1;
  view.fill();
  view.stroke();

  view.restore();
}

/* --------------------------------------------------
   ESDEVENIMENTS SONORS
-------------------------------------------------- */

function stimulateObjects(audio, time) {
  if (
    audio.impulse < .18 ||
    time - lastEventTime < 180
  ) {
    return;
  }

  lastEventTime = time;

  const amount = Math.ceil(2 + audio.impulse * 5);

  for (let i = 0; i < amount; i++) {
    const object =
      objects[Math.floor(Math.random() * objects.length)];

    if (!object) continue;

    /*
      Els esdeveniments afecten més els cristalls
      que són relativament propers.
    */
    const influence =
      audio.impulse * (.3 + object.depth * .8);

    object.pulse = clamp(
      object.pulse + influence,
      0,
      1.5
    );
  }
}

function updateObjects(dt, audio) {
  for (const object of objects) {
    object.pulse *= Math.pow(.08, dt);

    const targetEnergy =
      .18 +
      audio.energy * (.3 + object.depth * .7);

    object.energy +=
      (targetEnergy - object.energy) *
      Math.min(1, dt * 1.8);

    /*
      Petita deriva orgànica, sense alterar gaire
      la composició global.
    */
    object.x +=
      Math.sin(object.phase + performance.now() * .0001) *
      object.drift *
      dt *
      12;

    object.y +=
      Math.cos(object.phase + performance.now() * .00013) *
      object.drift *
      dt *
      8;
  }
}

/* --------------------------------------------------
   MAIN LOOP
-------------------------------------------------- */

function main(time) {
  if (!running) return;

  const dt = Math.min(
    (time - lastTime) / 1000,
    .05
  );

  lastTime = time;

  const audio = readAudio();

  stimulateObjects(audio, time);
  updateObjects(dt, audio);

  drawBackground(audio);
  drawPerspectiveVeins(audio, time);
  drawDepthField(audio, time);
  drawCore(audio, time);

  animationFrame = requestAnimationFrame(main);
}

/* --------------------------------------------------
   CONTROL
-------------------------------------------------- */

async function start() {
  if (running) return;

  audioContext = new AudioContext();

  master = audioContext.createGain();
  master.gain.value = .055;

  master.filter = audioContext.createBiquadFilter();
  master.filter.type = "lowpass";
  master.filter.frequency.value = 6000;
  master.filter.Q.value = .5;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.minDecibels = -90;
  analyser.maxDecibels = -20;
  analyser.smoothingTimeConstant = .84;

  const compressor =
    audioContext.createDynamicsCompressor();

  compressor.threshold.value = -28;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = .01;
  compressor.release.value = .5;

  /*
    El visual analitza el senyal abans del filtre final.
  */
  master.connect(analyser);
  master
    .connect(master.filter)
    .connect(compressor)
    .connect(audioContext.destination);

  running = true;

  createDepthField();

  startQuartzBody();
  startGlobalEvolution();
  createNoise();
  createCrystalEvent();

  await audioContext.resume();

  lastTime = performance.now();

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(main);
}

function stop() {
  running = false;

  cancelAnimationFrame(animationFrame);
  animationFrame = 0;

  timers.forEach(clearTimeout);
  timers.length = 0;

  objects.length = 0;

  if (audioContext) {
    audioContext.close();
    audioContext = null;
    analyser = null;
  }

  view.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  view.fillStyle = "#090c12";
  view.fillRect(0, 0, width, height);
}

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);

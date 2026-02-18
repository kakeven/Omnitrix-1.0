const omni = document.getElementById("omni");
const dial = document.getElementById("dial");
const touch = document.getElementById("touch");
const statusEl = document.getElementById("status");

const ALIEN_NAMES = [
  "Diamante",
  "Friagem",
  "Eco Eco",
  "Arraia-jato",
  "XLR8",
  "Fogo Fátuo",
  "Ameaça Aquática",
  "Massa Cinzenta",
  "Besta",
  "Enormossauro",
  "Ultra-T",
  "Macaco-Aranha",
];

// CONFIG
const N = 12;
const STEP = 360 / N;
const SENS = 0.45;

let omniState = 0; 
// 0 = fechado
// 1 = aberto
// 2 = selecionando

let isDown = false;
let startY = 0;
let baseAngle = 0;
let angle = 0;
let selectedIndex = 0;
let hasSelection = false;

function setStatus(t){ statusEl.textContent = t; }

function applyAngle(a){
  angle = a;
  dial.style.transform = `rotate(${angle}deg)`;
}

function snapToNearest(){
  const nearestSteps = Math.round(angle / STEP);
  const target = nearestSteps * STEP;

  applyAngle(target);

  const norm = ((target % 360) + 360) % 360;
  selectedIndex = Math.round(norm / STEP) % N;

  hasSelection = true;
  omni.classList.add("selected");

  setStatus(`Selecionado: ${ALIEN_NAMES[selectedIndex]}`);
}

/* ===== CONTROLE DE ESTADOS ===== */

omni.addEventListener("click", () => {

  // ESTADO 0 → ATIVAR
  if (omniState === 0) {
    omni.classList.add("open", "activating");
    omniState = 1;

    setStatus("Sistema ativado");

    setTimeout(() => {
      omni.classList.remove("activating");
    }, 400);

    return;
  }

  // ESTADO 1 → LIBERAR SELEÇÃO
  if (omniState === 1) {
    omniState = 2;
    omni.classList.add("ready");
    setStatus("Arraste para escolher…");
    return;
  }

  // ESTADO 2 → TRANSFORMAÇÃO
  if (omniState === 2 && hasSelection) {

    setStatus(`TRANSFORMAÇÃO: ${ALIEN_NAMES[selectedIndex]}`);

    setTimeout(() => {
      omni.classList.remove("open", "ready", "selected");
      omniState = 0;
      hasSelection = false;
      setStatus("Clique para ativar");
    }, 800);

  }

});

/* ===== DRAG ===== */

touch.addEventListener("pointerdown", (e) => {

  if (omniState !== 2) return;

  isDown = true;
  hasSelection = false;
  omni.classList.remove("selected");

  startY = e.clientY;
  baseAngle = angle;

  touch.setPointerCapture(e.pointerId);
});

touch.addEventListener("pointermove", (e) => {
  if (!isDown) return;

  const dy = e.clientY - startY;
  const next = baseAngle - dy * SENS;

  applyAngle(next);
});

touch.addEventListener("pointerup", () => {
  if (!isDown) return;

  isDown = false;
  snapToNearest();
});

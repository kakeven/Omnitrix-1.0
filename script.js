const omni = document.getElementById("omni");
const aliensContainer = document.getElementById("aliensContainer");
const touch = document.getElementById("touch");
const statusEl = document.getElementById("status");

// Elementos do RPG
const cargaValor = document.getElementById("cargaValor");
const pilhaValor = document.getElementById("pilhaValor");
const alienIcone = document.getElementById("alienIcone");
const alienNome = document.getElementById("alienNome");
const btnNovaCena = document.getElementById("btnNovaCena");
const btnFormaHumana = document.getElementById("btnFormaHumana");

const ALIEN_NAMES = [
  "Diamante", "Friagem", "Eco Eco", "Arraia-jato", "XLR8", "Fogo Fátuo",
  "Ameaça Aquática", "Massa Cinzenta", "Besta", "Enormossauro", "Ultra-T", "Macaco-Aranha"
];

// Aliens que podem virar supremo (exemplo: os primeiros 6)
const SUPREMO_ALIENS = [0, 1, 2, 3, 4, 5]; // Índices dos aliens que têm modo supremo

// CONFIG
const N = 12;
const STEP = 360 / N;
const SENS = 0.45;
const RAIO = 38;

// Estados do Omnitrix
let omniState = 0; // 0 = fechado, 1 = aberto, 2 = selecionando

// Estado do Drag
let isDown = false;
let startY = 0;
let baseAngle = 0;
let angle = 0;
let selectedIndex = 0;
let hasSelection = false;

// ===== SISTEMA RPG =====
let carga = 15;
let pilha = 0;
let transformado = false;
let alienAtual = null;
let modoAtual = null; // "base" ou "supremo"
let historicoAliens = []; // Registro permanente de todos aliens usados
let ultimoClique = 0;
let veioDeArrasto = false;
let bloqueiaProximoClique = false;
// ===== SONS =====
const sons = {
  escolha: new Audio('./sounds/escolha.wav'),
  selecionado: new Audio('./sounds/selecionado.wav'),
  transformar: new Audio('./sounds/transformar.wav'),
  supremo: new Audio('./sounds/supremo.wav'),
  voltar: new Audio('./sounds/voltar.wav'),
  voltar_tempo: new Audio('./sounds/voltar_tempo.wav')
};


let audioInicializado = false;

function inicializarAudio() {
  if (audioInicializado) return;
  
  // Toca e pausa um som mudo para "desbloquear" o áudio
  const silentSound = new Audio();
  silentSound.play().then(() => {
    silentSound.pause();
    audioInicializado = true;
    console.log("Áudio inicializado");
  }).catch(() => {
    // Se falhar, tenta novamente no próximo clique
  });
}

// Configurar volume
sons.escolha.volume = 0.3;
sons.escolha.loop = true; // Fica em loop enquanto arrasta
sons.selecionado.volume = 0.5;
sons.transformar.volume = 0.6;
sons.supremo.volume = 0.7;
sons.voltar.volume = 0.5;

function playSound(nome, loop = false) {
  const som = sons[nome];
  if (som ) {
    som.currentTime = 0;
    som.loop = loop;
    som.play().catch(e => {
      console.log('Áudio bloqueado pelo navegador:', e);
      // Se falhar, tenta inicializar
      inicializarAudio();
    });
  }
}

function stopSound(nome) {
  const som = sons[nome];
  if (som) {
    som.pause();
    som.currentTime = 0;
  }
}




// ===== FUNÇÕES RPG =====
function atualizarInterfaceRPG() {
  cargaValor.textContent = carga;
  pilhaValor.textContent = pilha;
  
  if (transformado && alienAtual !== null) {
    alienNome.textContent = ALIEN_NAMES[alienAtual];
    alienIcone.style.backgroundImage = `url('./images/aliens/alien_${alienAtual}.png')`;
    alienIcone.style.opacity = "1";
  } else {
    alienNome.textContent = "Humano";
    alienIcone.style.backgroundImage = "none";
    alienIcone.style.opacity = "0.5";
  }
}

function verificarAlienNovo(alienIndex) {
  return !historicoAliens.includes(alienIndex);
}

function transformarRPG(alienIndex, ehSupremo) {
  // Caso especial: voltar do supremo para a base
  if (!ehSupremo && 
      transformado && 
      alienAtual === alienIndex && 
      modoAtual === "supremo") {
    
    alienAtual = alienIndex;
    modoAtual = "base";
    atualizarInterfaceRPG();
    return { sucesso: true, gratuito: true, mensagem: "Volta à base" };
  }
  
  // Calcula custo
  const custo = ehSupremo ? 3 : 1;
  const ganhoPilha = ehSupremo ? 3 : 1;
  
  // Verifica carga
  if (carga < custo) {
    return { sucesso: false, mensagem: "Carga insuficiente" };
  }
  
  // Aplica custo e ganho
  carga -= custo;
  pilha += ganhoPilha;
  
  // Registra no histórico se for novo alien
  if (!historicoAliens.includes(alienIndex)) {
    historicoAliens.push(alienIndex);
  }
  
  // Atualiza estado
  transformado = true;
  alienAtual = alienIndex;
  modoAtual = ehSupremo ? "supremo" : "base";
  
  atualizarInterfaceRPG();
  return { sucesso: true, gratuito: false, custo: custo, ganhoPilha: ganhoPilha };
}

function voltarFormaHumana() {
  transformado = false;
  alienAtual = null;
  modoAtual = null;
  pilha = 0;
  
  // Fecha o omnitrix
  omni.classList.remove("open", "ready", "selected");
  omniState = 0;
  hasSelection = false;
  
  if(carga==0){
    playSound('voltar_tempo');
  }else{
    playSound('voltar');
  }
  atualizarInterfaceRPG();
  setStatus("Forma humana");
}
function novaCena() {
  if (transformado) {
    // Se estiver transformado: desconta pilha da carga
    carga = Math.max(0, carga - pilha);
    setStatus(`Nova cena transformado! Carga: ${carga} (${pilha} pilhas descontadas)`);
  } else {
    // Se estiver humano: ganha +1 de carga
    if(carga<15){
      carga += 1;
      setStatus(`Nova cena em forma humana! Carga recuperada: +1 (total: ${carga})`);
    }
  }
  
  // Não zera a pilha (ela continua acumulando)
  // O histórico permanece
  
  // Verifica se carga zerou
  if (carga <= 0 && transformado) {
    setStatus("CARGA ESGOTADA! Voltando à forma humana");
    voltarFormaHumana();
  } else {
    playSound('selecionado'); // Som temporário
  }
  
  atualizarInterfaceRPG();
}

// ===== CRIAÇÃO DOS ÍCONES =====
function createAlienIcons() {
  for (let i = 0; i < N; i++) {
    const icon = document.createElement('div');
    icon.className = 'alien-icon';
    icon.dataset.index = i;

    const rad = (i * STEP * Math.PI) / 180;
    const left = 50 + RAIO * Math.sin(rad);
    const top = 50 - RAIO * Math.cos(rad);

    icon.style.left = left + '%';
    icon.style.top = top + '%';
    icon.style.backgroundImage = `url('./images/aliens/alien_${i}.png')`;
    
    // Rotação fixa via variável CSS
    const rotateAngle = (i * STEP) % 360;
    icon.style.setProperty('--alien-rotation', `${rotateAngle}deg`);

    aliensContainer.appendChild(icon);
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function applyAngle(a) {
  angle = a;
  aliensContainer.style.transform = `rotate(${angle}deg)`;
  updateHighlight();
}

function updateHighlight() {
  const icons = document.querySelectorAll('.alien-icon');
  
  let containerRotation = angle % 360;
  if (containerRotation < 0) containerRotation += 360;

  let bestIdx = 0;
  let bestDist = 180;

  icons.forEach((icon, idx) => {
    icon.classList.remove('in-select-window', 'near-window');

    const iconBaseAngle = (idx * STEP) % 360;
    let currentAngle = (iconBaseAngle + containerRotation + 360) % 360;
    let distance = Math.min(currentAngle, 360 - currentAngle);
    
    if (distance < bestDist) {
      bestDist = distance;
      bestIdx = idx;
    }
  });

  if (bestDist < STEP / 2) {
    icons[bestIdx].classList.add('in-select-window');
    
    // 2 vizinhos para cada lado
    for (let offset = 1; offset <= 2; offset++) {
      const prev = (bestIdx - offset + N) % N;
      const next = (bestIdx + offset) % N;
      icons[prev].classList.add('near-window');
      icons[next].classList.add('near-window');
    }
  }
}

function snapToNearest() {
  const targetAngle = Math.round(angle / STEP) * STEP;
  applyAngle(targetAngle);

  let containerRotation = targetAngle % 360;
  if (containerRotation < 0) containerRotation += 360;
  
  let bestIdx = 0;
  let bestDist = 180;
  
  for (let i = 0; i < N; i++) {
    const iconBaseAngle = (i * STEP) % 360;
    let currentAngle = (iconBaseAngle + containerRotation + 360) % 360;
    let distance = Math.min(currentAngle, 360 - currentAngle);
    
    if (distance < bestDist) {
      bestDist = distance;
      bestIdx = i;
    }
  }
  
  selectedIndex = bestIdx;
  hasSelection = true;
  omni.classList.add("selected");

  const icons = document.querySelectorAll('.alien-icon');
  icons.forEach(icon => icon.classList.remove('selected', 'in-select-window', 'near-window'));
  icons[selectedIndex].classList.add('selected');

  playSound('selecionado');
  setStatus(`Selecionado: ${ALIEN_NAMES[selectedIndex]}`);
  console.log("snapToNearest - selectedIndex:", selectedIndex, "hasSelection:", hasSelection, "omniState:", omniState);
}

// Inicializar
createAlienIcons();
atualizarInterfaceRPG();

// ===== EVENTOS =====
omni.addEventListener("click", (e) => {
  console.log("4. CLICK INICIADO - alvo:", e.target, "bloqueio:", bloqueiaProximoClique);
  
  
  if (e.target.classList.contains('btn-rpg') || e.target.closest('.btn-rpg')) {
    console.log("5. Clique em botão ignorado");
    return;
  }

  if (bloqueiaProximoClique) {
    console.log("6. Clique ignorado (pós-arrasto)");
    bloqueiaProximoClique = false;
    return;
  }

  console.log("7. Clique permitido, continua...");

  
  
  
  if (omniState === 0) {
    omni.classList.add("open", "activating");
    omniState = 1;
    setStatus("Sistema ativado");
    setTimeout(() => omni.classList.remove("activating"), 400);
    return;
  }
  
  if (omniState === 1) {
    omniState = 2;
    omni.classList.add("ready");
    setStatus("Arraste para escolher…");
    return;
  }
  
  if (omniState === 2 && hasSelection) {
    // Verifica se é supremo
    const ehSupremo = transformado && 
                    alienAtual === selectedIndex && 
                    SUPREMO_ALIENS.includes(selectedIndex);
  
    
    // Tenta transformar
    const resultado = transformarRPG(selectedIndex, ehSupremo);
    
    if (!resultado.sucesso) {
      setStatus(resultado.mensagem);
      return;
    }
    
    if (resultado.gratuito) {
      setStatus(`Volta ao ${ALIEN_NAMES[selectedIndex]} (base)`);
    } else {
      // Toca som apropriado
      if (ehSupremo) {
        playSound('supremo');
        setStatus(`SUPREMO: ${ALIEN_NAMES[selectedIndex]} | -${resultado.custo} carga, +${resultado.ganhoPilha} pilha`);
      } else {
        playSound('transformar');
        setStatus(`TRANSFORMAÇÃO: ${ALIEN_NAMES[selectedIndex]} | -${resultado.custo} carga, +${resultado.ganhoPilha} pilha`);
      }
      
      // Efeito visual para supremo
      if (ehSupremo) {
        omni.classList.add("supremo");
        setTimeout(() => omni.classList.remove("supremo"), 1000);
      }
    }
    
    // Animação de transformação
    setTimeout(() => {
      omni.classList.remove("open", "ready", "selected");
      omniState = 0;
      hasSelection = false;
      
      document.querySelectorAll('.alien-icon').forEach(icon => {
        icon.classList.remove('selected', 'in-select-window', 'near-window');
      });
      
      setStatus("Clique para ativar");
    }, 800);
  }
  console.log("FIM DO CLICK - state:", omniState, "hasSelection:", hasSelection);
});

// ===== DRAG =====
touch.addEventListener("pointerdown", (e) => {
   console.log("POINTERDOWN - isDown?", isDown, "omniState:", omniState);
  if (omniState !== 2) return;
  veioDeArrasto = false;
  isDown = true;
  
  omni.classList.remove("selected");
  
  document.querySelectorAll('.alien-icon').forEach(icon => {
    icon.classList.remove('selected');
  });

  startY = e.clientY;
  baseAngle = angle;
  
  // Inicia som de escolha em loop
  playSound('escolha', true);
  
  touch.setPointerCapture(e.pointerId);
  e.preventDefault();
});

touch.addEventListener("pointermove", (e) => {
  if (!isDown) return;
  
  veioDeArrasto = true;

  const dy = e.clientY - startY;
  const next = baseAngle + dy * SENS;
  
  applyAngle(next);
  e.preventDefault();
});

touch.addEventListener("pointerup", () => {
  console.log("1. POINTER UP - isDown:", isDown, "veioDeArrasto:", veioDeArrasto);
  if (!isDown) return;
  isDown = false;
  stopSound('escolha');
  
  if (veioDeArrasto) {
    console.log("2. ARRASTO - chamando snapToNearest");
    snapToNearest();
    console.log("3. Ativando bloqueiaProximoClique = true");
    bloqueiaProximoClique = true;
  } else {
    console.log("2. CLIQUE SIMPLES - NÃO vou chamar snapToNearest");
    // Foi um clique, não faz nada
  }
  
  veioDeArrasto = false;
});

touch.addEventListener("pointercancel", () => {
  isDown = false;
  stopSound('escolha');
});

touch.addEventListener("contextmenu", (e) => e.preventDefault());

// ===== BOTÕES RPG =====
btnNovaCena.addEventListener("click", (e) => {
  e.stopPropagation();  // IMPEDE que o clique chegue no omni
  novaCena();
});

btnFormaHumana.addEventListener("click", (e) => {
  e.stopPropagation();  // IMPEDE que o clique chegue no omni
  voltarFormaHumana();
});
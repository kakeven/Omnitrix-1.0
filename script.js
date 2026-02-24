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
const btnTemaVerde = document.getElementById("btnTemaVerde");
const btnTemaCiano = document.getElementById("btnTemaCiano");
const btnTemaRoxo = document.getElementById("btnTemaRoxo");

const ALIEN_NAMES = [
  "Diamante",      // índice 0
  "Friagem",       // índice 1
  "Eco Eco",       // índice 2
  "Arraia-jato",   // índice 3
  "XLR8",          // índice 4
  "Fogo Fátuo",    // índice 5
  "Ameaça Aquática", // índice 6
  "Massa Cinzenta", // índice 7
  "Besta",         // índice 8
  "Enormossauro",  // índice 9
  "Ultra-T",       // índice 10
  "Macaco-Aranha"  // índice 11
];

// Aliens que podem virar supremo (exemplo: os primeiros 6)
const SUPREMO_ALIENS = [1,2,5,7,8,9,11]; // Índices dos aliens que têm modo supremo

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
let lastHighlightedIndex = -1; // Guarda o último alien destacado

// ===== FAIL SAFE =====
let failSafeAtivo = false;
let failSafeUsado = false; // Controla se já foi usado nesta sessão
let failSafeBloqueado = false; // NOVO: bloqueio permanente se usar com negativo

// ===== SONS =====
let audioInicializado = false;
const sons = {
  escolha: new Audio('./sounds/escolha.wav'),
  selecionado: new Audio('./sounds/selecionado.wav'),
  transformar: new Audio('./sounds/transformar.wav'),
  supremo: new Audio('./sounds/supremo.wav'),
  voltar: new Audio('./sounds/voltar.wav'),
  voltar_tempo: new Audio('./sounds/voltar_tempo.wav'),
  sem_carga: new Audio('./sounds/sem_carga.wav'),
  novaCena: new Audio('/./sounds/novaCena.wav'),
};




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
sons.novaCena.volume = 0.2;
sons.selecionado.volume = 0.4;
sons.transformar.volume = 0.4;
sons.supremo.volume = 0.4;
sons.voltar.volume = 0.2;

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





function aplicarTema(tema) {
  omni.classList.remove('tema-ciano', 'tema-roxo');

  if (tema === 'ciano') {
    omni.classList.add('tema-ciano');
  } else if (tema === 'roxo') {
    omni.classList.add('tema-roxo');
  }

  [btnTemaVerde, btnTemaCiano, btnTemaRoxo].forEach(btn => btn.classList.remove('ativo'));
  if (tema === 'ciano') btnTemaCiano.classList.add('ativo');
  else if (tema === 'roxo') btnTemaRoxo.classList.add('ativo');
  else btnTemaVerde.classList.add('ativo');

  setStatus(`Tema ${tema.charAt(0).toUpperCase() + tema.slice(1)} aplicado`);
}

function piscarDescargaTempo() {
  omni.classList.remove('descarga-piscando');
  void omni.offsetWidth;
  omni.classList.add('descarga-piscando');
  setTimeout(() => omni.classList.remove('descarga-piscando'), 1200);
}

// ===== FUNÇÕES RPG =====
function atualizarInterfaceRPG() {
  cargaValor.textContent = carga;
  pilhaValor.textContent = pilha;
  
  if (transformado && alienAtual !== null) {
    // Verifica se é supremo para mostrar o nome diferente
    if (modoAtual === "supremo") {
      alienNome.textContent = `${ALIEN_NAMES[alienAtual]} SUPREMO`;
    } else {
      alienNome.textContent = ALIEN_NAMES[alienAtual];
    }
    
    alienIcone.style.backgroundImage = `url('./images/aliens/alien_${alienAtual}.png')`;
    alienIcone.style.opacity = "1";
    
    // Tamanhos diferentes por alien no painel RPG
    const tamanhosPainel = {
      0: 60, // Diamante maior
      1: 60, // Friagem
      2: 60, // Eco Eco
      3: 60, // Arraia-jato menor
      4: 60, // XLR8
      5: 60, // Fogo Fátuo
      6: 60, // Ameaça Aquática
      7: 60, // Massa Cinzenta bem pequeno
      8: 60, // Besta maior
      9: 60, // Enormossauro gigante
      10: 60, // Ultra-T
      11: 60, // Macaco-Aranha
    };
    
    const tamanho = tamanhosPainel[alienAtual] || 60; // 60 é o padrão
    alienIcone.style.width = tamanho + 'px';
    alienIcone.style.height = tamanho + 'px';
    
  } else {
    alienNome.textContent = "Humano";
    alienIcone.style.backgroundImage = "none";
    alienIcone.style.opacity = "0.5";
    alienIcone.style.width = '60px';   // Tamanho padrão humano
    alienIcone.style.height = '60px';
  }
}

function verificarAlienNovo(alienIndex) {
  return !historicoAliens.includes(alienIndex);
}


function toggleFailSafe() {
  if (failSafeBloqueado) {
    setStatus("🔒 Fail Safe bloqueado permanentemente!");
    playSound('sem_carga');
    return;
  }
  
  if (failSafeUsado) {
    setStatus("❌ Fail Safe já foi usado");
    playSound('sem_carga');
    return;
  }
  
  failSafeAtivo = !failSafeAtivo;
  
  if (failSafeAtivo) {
    setStatus("⚠️ FAIL SAFE ATIVADO - Uma transformação de emergência");
    playSound('selecionado');
    btnFailSafe.classList.add("ativo");
    btnFailSafe.textContent = "⚠️ Fail Safe (ATIVO)";
  } else {
    setStatus("Fail Safe desativado");
    btnFailSafe.classList.remove("ativo");
    btnFailSafe.textContent = "⚠️ Fail Safe";
  }
}


function atualizarAparenciaOmnitrix() {
  // Remove classes de influência anteriores
  omni.classList.remove('carga-baixa');

  if (transformado) {
    omni.classList.add('transformado');
    // Classe de supremo deve permanecer ativa enquanto modoAtual for supremo
    omni.classList.toggle('supremo', modoAtual === 'supremo');
    // Influência externa: carga baixa
    if (carga <= 3) {
      omni.classList.add('carga-baixa');
    }

  } else {
    omni.classList.remove('transformado', 'supremo', 'carga-baixa');
  }
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
    atualizarAparenciaOmnitrix(); // <-- ADICIONADO: Atualiza aparência
    return { sucesso: true, gratuito: true, mensagem: "Volta à base" };
  }
  
  // Calcula custo
  const custo = ehSupremo ? 3 : 1;
  const ganhoPilha = ehSupremo ? 3 : 1;
  
  // ===== VERIFICAÇÕES DE BLOQUEIO =====
  
  // 1. Se está bloqueado permanentemente, NÃO TRANSFORMA NUNCA (mesmo com carga)
  if (failSafeBloqueado && carga < 1) {
    playSound('sem_carga');
    setStatus("🔒 Sistema bloqueado permanentemente!");
    return { sucesso: false, mensagem: "Sistema bloqueado" };
  }
  
  // 2. Se já usou fail safe MAS TEM CARGA SUFICIENTE, pode transformar normal
  //    Só bloqueia se não tiver carga suficiente
  if (failSafeUsado && carga < custo) {
    playSound('sem_carga');
    setStatus("⚠️ Carga insuficiente - Use Nova Cena em forma humana");
    return { sucesso: false, mensagem: "Carga insuficiente" };
  }
  
  // ===== VERIFICAÇÃO DE CARGA COM FAIL SAFE =====
  if (carga < custo) {
    // Tenta usar fail safe (só se estiver ativo)
    if (failSafeAtivo) {
      console.log("⚡ Usando fail safe");
      
      const vaiFicarNegativo = (carga - custo) < 0;
      
      if (vaiFicarNegativo) {
        // USOU E FICOU NEGATIVO → BLOQUEIO PERMANENTE
        failSafeBloqueado = true;
        failSafeUsado = true;
        
        setStatus("🔒 BLOQUEADO! Uso com carga negativa");
        playSound('sem_carga');
        
        // Atualiza botão
        btnFailSafe.classList.remove("ativo");
        btnFailSafe.classList.add("bloqueado");
        btnFailSafe.textContent = "🔒 Bloqueado";
        btnFailSafe.disabled = true;
        
      } else {
        // USOU MAS FICOU POSITIVO
        failSafeUsado = true;
        
        setStatus("⚠️ Fail Safe usado");
        playSound('transformar');
        
        // Atualiza botão
        btnFailSafe.classList.remove("ativo");
        btnFailSafe.classList.add("usado");
        btnFailSafe.textContent = "⏳ Usado";
        btnFailSafe.disabled = true;
      }
      
      // Aplica custo
      carga -= custo;
      
    } else {
      playSound('sem_carga');
      return { sucesso: false, mensagem: "Carga insuficiente" };
    }
  } else {
    // Carga suficiente - transformação normal
    carga -= custo;
  }
  
  // Ganho de pilha
  pilha += ganhoPilha;
  
  // Registra no histórico
  if (!historicoAliens.includes(alienIndex)) {
    historicoAliens.push(alienIndex);
  }
  
  // Atualiza estado
  transformado = true;
  alienAtual = alienIndex;
  modoAtual = ehSupremo ? "supremo" : "base";
  
  atualizarInterfaceRPG();
  atualizarAparenciaOmnitrix(); // <-- ADICIONADO: Atualiza aparência do Omnitrix
  
  return { sucesso: true, gratuito: false, custo: custo, ganhoPilha: ganhoPilha };
}

function voltarFormaHumana() {
  transformado = false;
  alienAtual = null;
  modoAtual = null;
  pilha = 0;
  
  // SÓ AGORA desativa o fail safe
  failSafeAtivo = false;
  
  // Se não está bloqueado permanentemente, libera
  if (!failSafeBloqueado && failSafeUsado) {
    failSafeUsado = false;
    btnFailSafe.disabled = false;
    btnFailSafe.classList.remove("usado");
    btnFailSafe.textContent = "⚠️ Fail Safe";
  }
  
  // Fecha o omnitrix
  omni.classList.remove("open", "ready", "selected");
  omniState = 0;
  hasSelection = false;
  
  if(carga == 0){
    playSound('voltar_tempo');
  } else {
    playSound('voltar');
  }
  atualizarAparenciaOmnitrix(); 
  setStatus("Forma humana");
  atualizarInterfaceRPG();
}

function novaCena() {
  if (transformado) {
    carga = Math.max(0, carga - pilha);
    setStatus(`Nova cena transformado! Carga: ${carga} (${pilha} pilhas descontadas)`);
    piscarDescargaTempo();
  } else {
    if(carga<15){
      carga += 1;
      setStatus(`Nova cena em forma humana! Carga recuperada: +1 (total: ${carga})`);
    }
  }
  
  if (carga <= 0 && transformado) {
    setStatus("CARGA ESGOTADA! Voltando à forma humana");
    voltarFormaHumana();
  } else {
    playSound('novaCena');
    atualizarAparenciaOmnitrix(); // <-- ADICIONE ESTA LINHA
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
  
    if (isDown && bestIdx !== lastHighlightedIndex) {
      playSound('escolha'); // Sem loop, apenas uma vez
      lastHighlightedIndex = bestIdx;
    }
    
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

  // Se está bloqueado, ignora MAS NÃO RESETA o hasSelection
  if (bloqueiaProximoClique) {
    console.log("6. Clique ignorado (pós-arrasto)");
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
  
  // IMPORTANTE: Verifica se tem seleção E está no estado correto
  if (omniState === 2 && hasSelection) {
    // Verifica se é supremo
    let ehSupremo = false;
    
    if (transformado && alienAtual === selectedIndex) {
      // Mesmo alien
      if (modoAtual === "supremo") {
        // Está em supremo → volta à base
        ehSupremo = false;
        console.log("Supremo → Base (gratuito)");
      } else {
        // Está em base → pode ir para supremo
        ehSupremo = SUPREMO_ALIENS.includes(selectedIndex);
        console.log("Base → Supremo (custa 3)");
      }
    } else {
      // Alien diferente ou não transformado
      ehSupremo = false; // Transformação normal
      console.log("Transformação normal (custa 1)");
    }
    
    console.log("TRANSFORMANDO - Alien:", selectedIndex, "Supremo?", ehSupremo);
    
    // Tenta transformar
    const resultado = transformarRPG(selectedIndex, ehSupremo);
    
    if (!resultado.sucesso) {
      atualizarAparenciaOmnitrix();
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
    }
    
    // A função transformarRPG já chamou atualizarAparenciaOmnitrix()
    // Que adiciona a classe "transformado" ao omni
    
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
  
  isDown = true;
  veioDeArrasto = false; // Adicione esta linha se não tiver
  
  omni.classList.remove("selected");
  
  document.querySelectorAll('.alien-icon').forEach(icon => {
    icon.classList.remove('selected');
  });

  startY = e.clientY;
  baseAngle = angle;
  
  // SOM EM LOOP REMOVIDO - não inicia mais o som aqui
  
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
  
  lastHighlightedIndex = -1;
  
  if (veioDeArrasto) {
    console.log("2. ARRASTO - chamando snapToNearest");
    snapToNearest();
    console.log("3. Ativando bloqueiaProximoClique = true");
    bloqueiaProximoClique = true;
    
    // Remove o bloqueio MAIS RÁPIDO (50ms é suficiente para evitar o clique fantasma)
    setTimeout(() => {
      bloqueiaProximoClique = false;
      console.log("Bloqueio removido - pode clicar agora");
    }, 50); // Reduzido de 300ms para 50ms
  } else {
    console.log("2. CLIQUE SIMPLES - NÃO vou chamar snapToNearest");
    bloqueiaProximoClique = false;
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

   // ===== BOTÃO FAIL SAFE =====
const btnFailSafe = document.getElementById("btnFailSafe");

btnFailSafe.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFailSafe();
});

btnTemaVerde.addEventListener("click", (e) => {
  e.stopPropagation();
  aplicarTema('verde');
});

btnTemaCiano.addEventListener("click", (e) => {
  e.stopPropagation();
  aplicarTema('ciano');
});

btnTemaRoxo.addEventListener("click", (e) => {
  e.stopPropagation();
  aplicarTema('roxo');
});

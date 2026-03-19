# Guia do Código — Omnitrix 1.0

Este arquivo explica **como o projeto está organizado** e **como a lógica funciona** (HTML + CSS + JavaScript).

---

## 1) Visão geral

O projeto é uma interface interativa do Omnitrix com:
- abertura/seleção por cliques,
- rotação por arrasto para escolher alien,
- transformação com modo RPG (carga/pilha),
- efeitos visuais (estado transformado, supremo, carga baixa),
- sons para feedback.

Arquivos principais:
- `index.html`: estrutura da interface.
- `style.css`: layout, animações, estados visuais e responsividade.
- `script.js`: regras de negócio e interação.

---

## 2) Estrutura do HTML (`index.html`)

Bloco principal:
- `.omni#omni`: contêiner do componente inteiro.

Camadas internas relevantes:
- `.omni-bg`: imagem base do Omnitrix (frente/transformado).
- `.ring`: anel externo visual.
- `.alien-ring`: anel onde os ícones orbitam.
- `.aliens-container#aliensContainer`: recebe dinamicamente os 12 ícones no JS.
- `.select-window`: “janela” superior de seleção.
- `.touch#touch`: área de arrasto.
- `.status#status`: feedback textual.
- `.rpg-panel`: painel com carga, pilha, alien atual e botões.

Botões do painel:
- `#btnNovaCena`
- `#btnFormaHumana`
- `#btnFailSafe`

---

## 3) Camadas visuais e estados no CSS (`style.css`)

### 3.1 Camadas principais
- `.omni-bg`: imagem do Omnitrix.
- `.alien-ring`: anel de aliens (atualmente acima da imagem transformada).
- `.touch`: círculo central interativo.

### 3.2 Estados controlados por classe
Estados aplicados em `#omni`:
- `.open`: mostra elementos ocultos (ring, janela, touch, etc.).
- `.ready`: pronto para arrasto.
- `.selected`: seleção confirmada.
- `.activating`: pulso de ativação.
- `.transformado`: troca para visual transformado.
- `.supremo`: variação visual do transformado.
- `.carga-baixa`: alteração visual quando carga está baixa.

### 3.3 Estado transformado (stacking)
No estado transformado:
- `.omni.transformado` cria contexto de empilhamento local (`isolation: isolate`).
- `::before` desenha um círculo sólido de fundo.
- `.omni.transformado .omni-bg` usa a imagem `omnitrix_transformado.png`.
- `.alien-ring` está com camada superior para aparecer na frente da imagem.

### 3.4 Touch no transformado
Existe estilo específico para touch no transformado:
- `.omni.transformado .touch` (base ciano),
- `.omni.transformado.ready .touch` (glow mais forte),
- `.omni.transformado.selected .touch` (destaque maior).

### 3.5 Responsividade
Media queries reposicionam `.rpg-panel` e `.status` para desktop, tablet e mobile.

---

## 4) Lógica JavaScript (`script.js`)

## 4.1 Constantes e configuração
- `ALIEN_NAMES`: nomes dos 12 aliens.
- `SUPREMO_ALIENS`: índices que podem entrar no modo supremo.
- `N`, `STEP`, `SENS`, `RAIO`: geometria/controle da rotação.

## 4.2 Estados principais
- `omniState`: ciclo da UI (`0 fechado`, `1 aberto`, `2 selecionando`).
- Arrasto: `isDown`, `startY`, `baseAngle`, `angle`.
- Seleção: `selectedIndex`, `hasSelection`, `lastHighlightedIndex`.
- RPG: `carga`, `pilha`, `transformado`, `alienAtual`, `modoAtual`.
- Fail Safe: `failSafeAtivo`, `failSafeUsado`, `failSafeBloqueado`.

## 4.3 Sons
Objeto `sons` mapeia arquivos de áudio e funções:
- `playSound(nome, loop = false)`
- `stopSound(nome)`
- `inicializarAudio()` para desbloqueio inicial no navegador.

## 4.4 Fluxo de interação principal
1. Clique em `#omni`:
   - `state 0 -> 1`: ativa interface (`open`/`activating`).
   - `state 1 -> 2`: entra em modo de seleção (`ready`).
2. Arrasto no `#touch`:
   - atualiza ângulo do anel (`applyAngle`),
   - destaca ícone próximo da janela (`updateHighlight`),
   - ao soltar, trava no mais próximo (`snapToNearest`).
3. Clique final em `state 2` com seleção:
   - tenta transformar via `transformarRPG(selectedIndex, ehSupremo)`.

## 4.5 Seleção e highlight
- `createAlienIcons()`: cria 12 `.alien-icon` e posiciona no círculo.
- `updateHighlight()`: calcula distância angular e aplica classes:
  - `in-select-window` (alvo principal),
  - `near-window` (vizinhos).
- `snapToNearest()`: escolhe índice final e marca como `selected`.

## 4.6 Sistema RPG
### `transformarRPG(alienIndex, ehSupremo)`
Responsável por:
- custo de carga (`1` base, `3` supremo),
- ganho de pilha (`1` base, `3` supremo),
- regras de bloqueio/fail safe,
- atualização de estado (`transformado`, `alienAtual`, `modoAtual`),
- atualização da interface e aparência.

### `novaCena()`
- Se transformado: desconta `pilha` da `carga`.
- Se humano: recupera `+1` de carga até o limite lógico usado no código.
- Se carga zera transformado: volta automaticamente para humano.

### `voltarFormaHumana()`
- Reseta transformação e pilha,
- gerencia reset parcial do fail safe (exceto se bloqueado permanente),
- fecha estados visuais do Omnitrix.

### `toggleFailSafe()`
- Liga/desliga fail safe quando permitido,
- impede uso se já usado ou bloqueado,
- atualiza texto/estilo do botão e status.

---

## 5) Mapa rápido de funções (script.js)

- **UI geral**: `setStatus`, `applyAngle`, `atualizarAparenciaOmnitrix`.
- **Ícones/seleção**: `createAlienIcons`, `updateHighlight`, `snapToNearest`.
- **RPG**: `atualizarInterfaceRPG`, `transformarRPG`, `novaCena`, `voltarFormaHumana`, `toggleFailSafe`.
- **Áudio**: `inicializarAudio`, `playSound`, `stopSound`.
- **Eventos**: listeners de clique no `omni`, pointer no `touch` e botões RPG.

---

## 6) Como evoluir o projeto sem quebrar

1. **Se mexer em `z-index`**, valide estados `open + transformado + ready`.
2. **Se mexer em rotação**, preserve coerência entre `STEP`, `updateHighlight` e `snapToNearest`.
3. **Se alterar custo RPG**, revise `transformarRPG`, `novaCena` e textos de status.
4. **Se adicionar alien**, atualize:
   - `ALIEN_NAMES`,
   - assets `images/aliens/alien_X.png`,
   - `N` e eventuais escalas CSS por `data-index`.
5. **Se mudar áudio**, mantenha tratamento de erro de autoplay (`play().catch(...)`).

---

## 7) Resumo curto do ciclo do usuário

1. Clica para abrir.
2. Clica para entrar em seleção.
3. Arrasta para escolher alien.
4. Solta para fixar seleção.
5. Clica para transformar.
6. Usa Nova Cena / Forma Humana / Fail Safe conforme necessário.


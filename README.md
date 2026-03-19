# 🧬 Omnitrix System 1.0

Interface interativa inspirada no Omnitrix, projetada para uso em **RPG de mesa**, com foco em imersão, tomada de decisão e gerenciamento de recursos em tempo real.

O sistema simula o funcionamento de um Omnitrix com regras próprias, incluindo energia, transformação, seleção de formas e mecânicas de risco.

---

## 🎯 Proposta

Este projeto foi desenvolvido como uma **ferramenta de apoio para RPG de mesa**, permitindo que elementos narrativos se tornem mecânicos e visuais.

Com ele, é possível:

- Controlar transformações em tempo real  
- Gerenciar energia (carga)  
- Aplicar consequências ao uso contínuo  
- Criar uma experiência mais imersiva para o jogador  

> A ideia é simples: transformar decisão narrativa em mecânica tangível.

---

## 🧠 Conceito do sistema

O funcionamento gira em três elementos principais:

### ⚡ Carga (Energia)
- Define o limite de uso do Omnitrix  
- É consumida a cada transformação  
- Pode levar ao esgotamento total  

---

### 🔁 Pilha (Acúmulo)
- Representa o tempo/uso contínuo em forma transformada  
- É convertida em custo ao avançar cenas  
- Pressiona o jogador a sair da transformação  

---

### 🛑 Fail-Safe
- Sistema de emergência  
- Pode evitar situações críticas  
- Possui limitações estratégicas  

---

## 🕹️ Experiência de uso

O fluxo do sistema simula o uso de um dispositivo real:

1. Abrir o Omnitrix  
2. Entrar no modo de seleção  
3. Arrastar para escolher o alien  
4. Confirmar a escolha  
5. Transformar  
6. Gerenciar ações:
   - Nova cena  
   - Voltar à forma humana  
   - Ativar fail-safe  

---

## 🏗️ Estrutura do projeto

```bas
/
├── index.html # Estrutura da interface
├── style.css # Estilos e estados visuais
├── script.js # Lógica do sistema e regras RPG
├── images/ # Assets visuais
├── sounds/ # Feedback sonoro
```

---

## ⚙️ Funcionalidades

- Interface interativa com cliques e arrasto  
- Sistema de seleção circular de aliens  
- Transformação com regras de custo  
- Modo Supremo para aliens específicos  
- Sistema de carga e pilha  
- Fail-safe com restrições  
- Feedback visual dinâmico  
- Feedback sonoro  

---

## 🎮 Mecânicas RPG

### Transformação
- Forma base → custo baixo  
- Forma suprema → custo elevado  

---

### Sistema de cenas
- A cada nova cena:
  - Pilha é convertida em custo  
  - Energia é reduzida  
- Se a carga zerar:
  - retorno automático à forma humana  

---

### Decisão estratégica

O sistema força o jogador a escolher entre:

- manter a transformação e pagar o custo depois  
- ou sair antes e manter controle  

---

## 🧪 Tecnologias utilizadas

- HTML  
- CSS  
- JavaScript  

Sem frameworks — controle direto da lógica e comportamento.

---

## ▶️ Como executar

Basta abrir o arquivo:

```bash
index.html

em qualquer navegador moderno.
```
##🎧 Observações

Navegadores podem bloquear áudio automático

O som é ativado após interação do usuário

##📚 Documentação técnica

Para entender a estrutura interna e lógica do sistema:

👉 Veja o arquivo GUIA_DO_CODIGO.md

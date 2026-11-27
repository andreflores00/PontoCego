# Diário de desenvolvimento — Ponto Cego

## Sessão 1 – 24 de novembro de 2026

**Objetivo:** estrutura base do jogo, cenas, movimento do drone e primeiro conceito técnico (segmentação por cor).

**Atividades realizadas:**
- Criei a estrutura do projeto com Phaser 4.2.1 local (`lib/`) e módulos ES (`src/`).
- Criei as cenas Boot, Preload (com barra de progresso), Menu, Instruções, Opções, Jogo, HUD e Game Over.
- Criei a classe `Player` (drone) com spritesheet animada de 2 frames e mudança de cor com tint (teclas 1–3).
- Criei a classe `SecurityCamera`: varrimento sinusoidal, cone de visão por raycasting bloqueado pelas paredes e verificação de linha de vista.
- Implementei o conceito 1: `ColorUtils` (RGB → Lab, ΔE CIE76) e `ColorSegmenter`, que lê os píxeis do chão numa coroa à volta do drone e compara com a cor do drone.
- Defini os níveis 1 (Armazém, em modo tutorial: uma mecânica por sala) e 2 (Laboratório, tons parecidos e câmaras a rodar) em `LevelConfig`.
- Ficheiros a apanhar com posições sorteadas entre candidatas (aleatoriedade controlada), núcleo de saída, vidas, bónus de tempo e bónus sem deteções.
- HUD com pontos, ficheiros, barra de visibilidade (ΔE / limiar), barra de alarme, cor atual e vidas.
- Opções (som, dificuldade = limiar ΔE) e recorde guardados em `localStorage`.
- Controlos táteis: joystick virtual e botões de cor.

**Problemas:**
- Ao testar, o browser avisava que as leituras repetidas com `getImageData` no canvas do chão eram lentas.

**Solução:**
- Criei o contexto do canvas com `{ willReadFrequently: true }` e passei a ler os píxeis uma só vez para o `ColorSegmenter`.

**Decisões:**
- O chão é desenhado num canvas com ruído leve por píxel, para a câmara analisar uma imagem real e não uma cor fixa.
- A média de cor do fundo é feita em Lab e não em RGB, porque o Lab corresponde melhor à perceção humana.
- Os níveis estão em código nesta fase; mais tarde passam para mapas do Tiled.

**Uso de IA:** o código desta sessão foi gerado com o Claude (Anthropic) a partir da especificação do relatório inicial. Revi e testei o jogo no browser.

## Sessão 2 – 27 de novembro de 2026

**Objetivo:** implementar o conceito técnico 2 (portas com reconhecimento do padrão desenhado).

**Atividades realizadas:**
- Criei a classe `GestureRecognizer` com o algoritmo $1 Unistroke Recognizer (Wobbrock, Wilson e Li, 2007): reamostragem para 64 pontos, rotação pelo ângulo indicativo, escala, translação e comparação com os modelos pela distância média, com procura dourada da melhor rotação (±45°).
- Criei os modelos do triângulo, do quadrado e do círculo. Para os polígonos gerei variantes a começar em cada vértice e nos dois sentidos, para o jogador poder começar a desenhar em qualquer canto.
- Criei a classe `ScannerDoor`: a porta bloqueia a passagem e a visão das câmaras e pede uma forma sorteada ao criar o nível (aleatoriedade controlada).
- Criei o `ScannerPanel`: quando o drone está perto de uma porta, aparece um painel com o modelo e uma área para desenhar com o rato ou com o dedo. Ao largar, o traço é reconhecido e aparece a forma e a percentagem de semelhança. A porta abre com a forma certa e semelhança igual ou superior a 75%.
- Acrescentei duas portas a cada nível, sons de porta a abrir e de erro, e a regra nova nas instruções.
- No telemóvel, o joystick ignora os toques feitos dentro da área de desenho.

**Problemas:**
- O $1 Recognizer depende do ponto onde o traço começa e do sentido em que é desenhado: um triângulo começado noutro vértice ou no sentido contrário teria uma semelhança baixa com um único modelo.

**Solução:**
- Gerei variantes dos modelos para todos os vértices iniciais e para os dois sentidos.

**Decisões:**
- Para o jogo ficar simples, o alarme não sobe enquanto o jogador está a desenhar no scanner.
- Aumentei o tempo até ao alarme de 600 para 800 ms (constante `TEMPO_ATE_ALARME` em `GameScene.js`).
- O limiar de 75% está na constante `LIMIAR_PADRAO` em `ScannerPanel.js`, para ser fácil de ajustar.

**Uso de IA:** código gerado com o Claude (Anthropic); testei as três formas no browser.

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

## Sessão 2 (continuação) – 27 de novembro de 2026

**Objetivo:** aplicar a sugestão do professor de usar a EXPONOR como cenário (parte interior).

**Atividades realizadas:**
- Procurei a planta da EXPONOR na internet. Não encontrei uma planta desenhada pública; usei a lista oficial de espaços do site da EXPONOR, que indica as posições relativas: o Hall 2 fica entre o Pavilhão 5 e o Foyer (entrada principal), e a Galeria 1 entre os Pavilhões 1 e 4.
- O nível 1 passou a ser o interior da EXPONOR, numa versão simplificada: Foyer (entrada principal) → Hall 2 → Pavilhão 5.
- Acrescentei stands de feira como obstáculos (colisão e bloqueio da visão das câmaras) e os nomes das zonas escritos no chão.

**Decisões:**
- Os nomes das zonas são objetos de texto por cima do chão e não são desenhados na imagem, para não alterarem os píxeis que as câmaras analisam.
- A parte exterior (outdoor) fica para a próxima sessão, com sombras e variação de luz a afetar a deteção por cor.

**Uso de IA:** código gerado com o Claude (Anthropic); testei o nível no browser.

## Sessão 3 – 27 de novembro de 2026

**Objetivo:** deixar a interface mais bonita e preparar o jogo para o telemóvel.

**Atividades realizadas:**
- Defini um tema de cores e um tipo de letra comuns (`TEMA` e `FONTE` em `config.js`), num estilo de "sala de segurança": fundo escuro, turquesa como cor principal, amarelo nas portas e vermelho no alarme.
- Os menus (Menu, Instruções, Opções e Game Over) passaram a ter um fundo animado com grelha, um cone de câmara a varrer e partículas (`FundoMenu.js`). Há transições com fade entre cenas.
- Botões com cantos arredondados e efeito ao passar o rato. No menu, o drone flutua e vai trocando de cor.
- As instruções estão agora em quatro cartões, um por mecânica.
- Redesenhei o drone (4 frames com as hélices a rodar), a câmara, os ficheiros, o núcleo e um coração para as vidas.
- HUD novo, organizado em blocos: pontos, ficheiros, nível, barras de visibilidade e de alarme, cor atual e vidas.
- Menu de pausa (botão no HUD ou teclas P/ESC).
- No início de cada nível aparece uma faixa com o nome do nível, e ao apanhar um ficheiro aparece "+100".
- Telemóvel: botão de ecrã inteiro, aviso para rodar o telemóvel quando está na vertical, bloqueio do zoom e do scroll ao tocar, joystick e botões de cor maiores, com a cor ativa assinalada.

**Problemas:**
- Ao testar a pausa, a tecla P era apanhada pela UIScene e pela PauseScene ao mesmo tempo: o jogo retomava e voltava logo a pausar.

**Solução:**
- Só a UIScene trata as teclas P/ESC, e alterna entre pausar e retomar.

**Testes:** testei no browser do computador e numa emulação de telemóvel na horizontal (844x390, com toque).

**Uso de IA:** código gerado com o Claude (Anthropic).

## Sessão 3 (continuação) – 27 de novembro de 2026

**Objetivo:** fazer a parte exterior da EXPONOR, como o professor sugeriu, e ligá-la ao conceito 1.

**Atividades realizadas:**
- O nível 2 deixou de ser o "Laboratório" e passou a ser o exterior: dois relvados, o parque de estacionamento no meio e a fachada de um pavilhão em cima. Tem carros estacionados, árvores e grades com um portão de scanner cada.
- Sombras fixas: a fachada e as árvores fazem sombra. Os píxeis dessas zonas ficam mesmo mais escuros na imagem do chão (60% da luz), por isso a câmara vê outra cor.
- Nuvens: duas sombras de nuvem atravessam o mapa devagar, cada uma a uma altura sorteada. O `ColorSegmenter` passou a ter uma função de iluminação: quando lê um píxel debaixo de uma nuvem, multiplica a cor por 0,6.
- Cada nível pode agora ter as suas cores de camuflagem. No exterior são Relva, Relva à sombra e Alcatrão.
- No início de cada nível, a faixa do título mostra uma dica própria desse nível.

**Decisões:**
- A sombra da nuvem é desenhada por baixo do drone. A ideia é que o painel de camuflagem do drone emite luz própria e não escurece. Assim, quando a nuvem passa por cima, o jogador tem de trocar para "Relva à sombra" ou esperar que ela passe.
- Fiz as contas do ΔE antes de escolher as cores: relva ao sol contra relva à sombra dá cerca de 24, e alcatrão contra alcatrão à sombra cerca de 14. Os dois ficam acima do limiar normal (12), por isso a sombra obriga mesmo a reagir.
- Guardei o jogo em `window.jogo` para o poder inspecionar na consola do browser durante os testes.

**Testes:** testei o nível no browser. Com a cor "Relva" e o drone debaixo de uma nuvem, a visibilidade foi a 100%. Quando a nuvem passou, desceu para 16%.

**Uso de IA:** código gerado com o Claude (Anthropic).

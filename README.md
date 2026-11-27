# Ponto Cego

Jogo de furtividade 2D em **Phaser 4** (desktop e mobile), feito para a unidade curricular de Sistemas Multimédia 2026/27 — Engenharia da Computação Gráfica e Multimédia, ESTG.

Tema: **Reconhecimento de padrões e interpretação de informação visual.**

Controlas um drone que tem de apanhar ficheiros e chegar ao núcleo de dados sem ser detetado pelas câmaras de vigilância.

## Como correr

Abrir a pasta no VS Code e usar o **Live Server** em `index.html` (os módulos ES não funcionam com `file://`).

## Controlos

- Computador: WASD ou setas para mover; 1, 2, 3 para mudar a cor de camuflagem.
- Telemóvel: joystick virtual à esquerda; botões de cor à direita.

## Conceitos técnicos

1. **Segmentação por cor (ΔE em espaço Lab)** — `src/systems/ColorSegmenter.js` e `src/systems/ColorUtils.js`. A câmara lê os píxeis do chão à volta do drone, calcula a cor média em Lab e a distância ΔE (CIE76) à cor do drone. Acima do limiar, o drone é segmentado (bounding box) e o alarme enche.
2. **Correspondência de padrões ($1 Unistroke Recognizer)** — `src/systems/GestureRecognizer.js`, `src/objects/ScannerDoor.js` e `src/ui/ScannerPanel.js`. Perto de uma porta, o jogador desenha a forma pedida (triângulo, quadrado ou círculo). O traço é normalizado (reamostragem, rotação, escala, translação) e comparado com os modelos; a porta abre com a forma certa e semelhança ≥ 75%.

## Estrutura

```
index.html
lib/phaser.min.js          Phaser 4.2.1
assets/sfx/                efeitos sonoros (gerados por código)
src/main.js                configuração do Phaser
src/config.js              constantes (cores, limiares, pontuação)
src/scenes/                Boot, Preload, Menu, Instruções, Opções, Jogo, HUD, Game Over
src/objects/               Player (drone), SecurityCamera, ScannerDoor
src/systems/               ColorUtils, ColorSegmenter, GestureRecognizer, LevelConfig
src/ui/                    Botao, TouchControls, ScannerPanel
```

## Créditos

- Phaser 4 — https://phaser.io (licença MIT).
- Gráficos e sons provisórios gerados por código.
- Desenvolvido com apoio de IA (Claude, Anthropic): ver o diário de desenvolvimento.

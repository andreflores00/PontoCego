// =====================================================
// LevelConfig.js — definição dos níveis
// =====================================================
// Coordenadas em mosaicos (TILE = 32 px). O mapa tem 30 x 15 mosaicos.
// Nota: nesta primeira versão os níveis estão definidos em código;
// mais tarde serão passados para mapas do Tiled.
//
// chao:     retângulos de chão com uma cor da paleta (CORES)
// paredes:  retângulos sólidos (colisão e bloqueio da visão das câmaras)
// cameras:  x, y (mosaicos), angulo (graus, 0 = direita, 90 = baixo),
//           varrimento (± graus), velocidade (graus/s), campo (graus), alcance (px)
// ficheirosPossiveis: posições candidatas; em cada jogo são sorteadas algumas
//           (aleatoriedade controlada)

export const NIVEIS = [
    {
        nome: 'Nível 1 · Armazém',
        inicio: { x: 2, y: 7 },
        nucleo: { x: 27, y: 7 },
        camuflagemInicial: 2, // começa com Areia, que não combina com a 1.ª sala
        chao: [
            // Sala 1: só azul — aprender a fugir do cone de visão
            { x: 0, y: 0, w: 10, h: 15, cor: 'azul' },
            // Sala 2: verde em cima, azul em baixo — aprender a mudar de cor
            { x: 10, y: 0, w: 10, h: 8, cor: 'verde' },
            { x: 10, y: 8, w: 10, h: 7, cor: 'azul' },
            // Sala 3: areia com uma mancha verde — juntar tudo
            { x: 20, y: 0, w: 10, h: 15, cor: 'areia' },
            { x: 22, y: 5, w: 5, h: 5, cor: 'verde' }
        ],
        paredes: [
            { x: 0, y: 0, w: 30, h: 1 }, { x: 0, y: 14, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 10, y: 1, w: 1, h: 5 }, { x: 10, y: 9, w: 1, h: 5 },
            { x: 20, y: 1, w: 1, h: 9 }, { x: 20, y: 13, w: 1, h: 1 },
            { x: 14, y: 10, w: 2, h: 2 }
        ],
        cameras: [
            { x: 6.5, y: 1.15, angulo: 90, varrimento: 0, velocidade: 0, campo: 60, alcance: 300 },
            { x: 15, y: 13.85, angulo: -90, varrimento: 50, velocidade: 25, campo: 55, alcance: 330 },
            { x: 28.85, y: 13.85, angulo: -135, varrimento: 30, velocidade: 20, campo: 50, alcance: 360 }
        ],
        ficheirosPossiveis: [
            { x: 4, y: 2 }, { x: 4, y: 12 }, { x: 8, y: 7 },
            { x: 13, y: 3 }, { x: 17, y: 5 }, { x: 17, y: 12 },
            { x: 23, y: 2 }, { x: 24, y: 11 }, { x: 27, y: 3 }
        ],
        numFicheiros: 4
    },
    {
        nome: 'Nível 2 · Laboratório',
        inicio: { x: 2, y: 12 },
        nucleo: { x: 27, y: 2 },
        camuflagemInicial: 0,
        chao: [
            // Tons de azul parecidos: a camuflagem "Azul" só é parcial
            { x: 0, y: 0, w: 10, h: 15, cor: 'azulClaro' },
            { x: 10, y: 0, w: 10, h: 15, cor: 'azulEscuro' },
            { x: 13, y: 4, w: 4, h: 7, cor: 'roxo' },
            { x: 20, y: 0, w: 10, h: 7, cor: 'verde' },
            { x: 20, y: 7, w: 10, h: 8, cor: 'areia' }
        ],
        paredes: [
            { x: 0, y: 0, w: 30, h: 1 }, { x: 0, y: 14, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 },
            { x: 10, y: 1, w: 1, h: 8 }, { x: 10, y: 12, w: 1, h: 2 },
            { x: 20, y: 4, w: 1, h: 10 },
            { x: 5, y: 5, w: 2, h: 2 }, { x: 24, y: 9, w: 2, h: 3 }
        ],
        cameras: [
            { x: 5, y: 1.15, angulo: 90, varrimento: 45, velocidade: 35, campo: 55, alcance: 320 },
            { x: 11.15, y: 10.5, angulo: 0, varrimento: 40, velocidade: 30, campo: 55, alcance: 300 },
            { x: 19, y: 1.15, angulo: 135, varrimento: 35, velocidade: 30, campo: 50, alcance: 330 },
            { x: 28.85, y: 13.85, angulo: -135, varrimento: 40, velocidade: 35, campo: 55, alcance: 380 }
        ],
        ficheirosPossiveis: [
            { x: 3, y: 3 }, { x: 8, y: 9 }, { x: 12, y: 2 }, { x: 15, y: 12 },
            { x: 17, y: 7 }, { x: 23, y: 3 }, { x: 27, y: 12 }, { x: 22, y: 10 }
        ],
        numFicheiros: 5
    }
];

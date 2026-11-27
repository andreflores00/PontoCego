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
// stands:   obstáculos tipo stand de feira (colisão e bloqueio da visão, cor diferente)
// zonas:    nomes das zonas escritos no chão (só visual)
// portas:   portas com scanner (x, y, w, h em mosaicos); a forma pedida é sorteada
// ficheirosPossiveis: posições candidatas; em cada jogo são sorteadas algumas
//           (aleatoriedade controlada)

import { CORES } from '../config.js';

export const NIVEIS = [
    {
        // Interior inspirado na EXPONOR (versão simplificada): a entrada principal
        // (Foyer), o Hall 2 e o Pavilhão 5, que ficam lado a lado no recinto real.
        nome: 'Nível 1 · EXPONOR',
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
        // Stands de feira dentro do Pavilhão 5
        stands: [
            { x: 25, y: 3, w: 2, h: 1 },
            { x: 22, y: 12, w: 2, h: 1 }
        ],
        zonas: [
            { x: 5, y: 13.3, texto: 'Foyer · Entrada principal' },
            { x: 15, y: 13.3, texto: 'Hall 2' },
            { x: 25, y: 13.3, texto: 'Pavilhão 5' }
        ],
        // Portas nas passagens entre salas
        portas: [
            { x: 10, y: 6, w: 1, h: 3 },
            { x: 20, y: 10, w: 1, h: 3 }
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
        // Exterior da EXPONOR (simplificado): relvados, parque de estacionamento
        // e a fachada de um pavilhão em cima. Há sombras fixas (edifício e árvores)
        // e nuvens que passam e escurecem o chão: a câmara vê cores diferentes
        // ao sol e à sombra, por isso a camuflagem tem de ser ajustada.
        nome: 'Nível 2 · Exterior',
        dica: 'Cuidado com as nuvens: à sombra a relva fica mais escura (usa a cor 2)',
        exterior: true,
        nuvens: 2,
        inicio: { x: 2, y: 12 },
        nucleo: { x: 26, y: 12 },
        // Cores de camuflagem próprias do exterior
        camuflagens: [
            { nome: 'Relva', cor: CORES.relva },
            { nome: 'Relva à sombra', cor: CORES.relvaSombra },
            { nome: 'Alcatrão', cor: CORES.alcatrao }
        ],
        camuflagemInicial: 0,
        chao: [
            { x: 0, y: 0, w: 30, h: 15, cor: 'alcatrao' },   // parque de estacionamento
            { x: 0, y: 0, w: 8, h: 15, cor: 'relva' },       // relvado da esquerda
            { x: 22, y: 0, w: 8, h: 15, cor: 'relva' }       // relvado da direita
        ],
        // Sombras fixas: fachada do pavilhão (em cima) e duas árvores
        sombras: [
            { x: 1, y: 1, w: 28, h: 2 },
            { x: 3, y: 7, w: 3, h: 3 },
            { x: 24, y: 6, w: 3, h: 3 }
        ],
        // Linhas dos lugares de estacionamento (coordenadas em mosaicos)
        linhas: [
            { x1: 10, y1: 4, x2: 10, y2: 7 }, { x1: 12, y1: 4, x2: 12, y2: 7 }, { x1: 14, y1: 4, x2: 14, y2: 7 },
            { x1: 16, y1: 4, x2: 16, y2: 7 }, { x1: 18, y1: 4, x2: 18, y2: 7 }, { x1: 20, y1: 4, x2: 20, y2: 7 },
            { x1: 10, y1: 10, x2: 10, y2: 13 }, { x1: 12, y1: 10, x2: 12, y2: 13 }, { x1: 14, y1: 10, x2: 14, y2: 13 },
            { x1: 16, y1: 10, x2: 16, y2: 13 }, { x1: 18, y1: 10, x2: 18, y2: 13 }, { x1: 20, y1: 10, x2: 20, y2: 13 }
        ],
        paredes: [
            { x: 0, y: 0, w: 30, h: 1 }, { x: 0, y: 14, w: 30, h: 1 },
            { x: 0, y: 0, w: 1, h: 15 }, { x: 29, y: 0, w: 1, h: 15 }
        ],
        obstaculos: [
            // Grades entre os relvados e o parque (com um portão cada)
            { x: 8, y: 1, w: 1, h: 5, cor: 0x8d96a8, contorno: 0xc9cfd9 },
            { x: 8, y: 9, w: 1, h: 5, cor: 0x8d96a8, contorno: 0xc9cfd9 },
            { x: 22, y: 1, w: 1, h: 9, cor: 0x8d96a8, contorno: 0xc9cfd9 },
            { x: 22, y: 13, w: 1, h: 1, cor: 0x8d96a8, contorno: 0xc9cfd9 },
            // Carros estacionados
            { x: 10.3, y: 4.5, w: 1.4, h: 2.2, cor: 0xc0392b, contorno: 0x5a1a14 },
            { x: 14.3, y: 4.5, w: 1.4, h: 2.2, cor: 0xecf0f1, contorno: 0x7f8c8d },
            { x: 18.3, y: 4.5, w: 1.4, h: 2.2, cor: 0x2c3e50, contorno: 0x111820 },
            { x: 12.3, y: 10.5, w: 1.4, h: 2.2, cor: 0xf1c40f, contorno: 0x7d6608 },
            { x: 16.3, y: 10.5, w: 1.4, h: 2.2, cor: 0x2980b9, contorno: 0x143e5c },
            // Árvores (copas)
            { x: 4, y: 7, w: 1, h: 1, cor: 0x2e5e2a, contorno: 0x1b3a18, forma: 'circulo' },
            { x: 25, y: 6, w: 1, h: 1, cor: 0x2e5e2a, contorno: 0x1b3a18, forma: 'circulo' }
        ],
        zonas: [
            { x: 4, y: 13.3, texto: 'Relvado' },
            { x: 15, y: 8.5, texto: 'Parque de estacionamento' },
            { x: 26, y: 13.6, texto: 'Entrada de serviço' }
        ],
        // Portões com scanner nas grades
        portas: [
            { x: 8, y: 6, w: 1, h: 3 },
            { x: 22, y: 10, w: 1, h: 3 }
        ],
        cameras: [
            { x: 4, y: 1.15, angulo: 90, varrimento: 40, velocidade: 25, campo: 55, alcance: 300 },
            { x: 15, y: 1.15, angulo: 90, varrimento: 50, velocidade: 30, campo: 55, alcance: 360 },
            { x: 15, y: 13.85, angulo: -90, varrimento: 45, velocidade: 28, campo: 50, alcance: 280 },
            { x: 28.85, y: 1.15, angulo: 135, varrimento: 30, velocidade: 25, campo: 55, alcance: 380 }
        ],
        ficheirosPossiveis: [
            { x: 3, y: 3 }, { x: 6, y: 11 }, { x: 11, y: 8 }, { x: 17, y: 2 },
            { x: 19, y: 12 }, { x: 24, y: 3 }, { x: 27, y: 9 }, { x: 13, y: 12 }
        ],
        numFicheiros: 5
    }
];

// =====================================================
// config.js — constantes globais do jogo Ponto Cego
// =====================================================

// Tamanho lógico do jogo (o Scale.FIT ajusta ao ecrã)
export const LARGURA = 960;
export const ALTURA = 540;

// Altura da barra do HUD no topo; o mapa começa abaixo dela
export const HUD_ALTURA = 60;

// Tamanho de cada mosaico do chão (em píxeis)
export const TILE = 32;

// Paleta de cores do chão (RGB). As cores de camuflagem do drone
// usam as mesmas referências para que a correspondência seja possível.
export const CORES = {
    azul:       { r: 58,  g: 90,  b: 140 },
    azulClaro:  { r: 84,  g: 120, b: 168 },
    azulEscuro: { r: 40,  g: 64,  b: 110 },
    verde:      { r: 63,  g: 122, b: 74  },
    areia:      { r: 160, g: 138, b: 90  },
    roxo:       { r: 96,  g: 70,  b: 130 }
};

// Cores de camuflagem disponíveis para o drone (teclas 1, 2, 3)
export const CAMUFLAGENS = [
    { nome: 'Azul',  cor: CORES.azul  },
    { nome: 'Verde', cor: CORES.verde },
    { nome: 'Areia', cor: CORES.areia }
];

// Limiar de deteção (ΔE) por dificuldade.
// Acima deste valor a câmara "segmenta" o drone como objeto distinto do fundo.
export const LIMIAR_DIFICULDADE = {
    facil:   18,
    normal:  12,
    dificil: 8
};

// Pontuação
export const PONTOS = {
    ficheiro: 100,
    detecao: -50,
    semDetecoes: 200,
    bonusTempoMax: 300 // segundos; bónus = (300 - tempo) * 2
};

export const VIDAS_INICIAIS = 3;

// Converte {r,g,b} para número hexadecimal (usado em tints e gráficos)
export function rgbParaHex(c) {
    return (c.r << 16) | (c.g << 8) | c.b;
}

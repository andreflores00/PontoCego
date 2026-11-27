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
    roxo:       { r: 96,  g: 70,  b: 130 },
    // Exterior
    relva:       { r: 70,  g: 128, b: 62 },
    relvaSombra: { r: 42,  g: 77,  b: 37 },   // relva com 60% da luz
    alcatrao:    { r: 78,  g: 80,  b: 86 }
};

// Cores de camuflagem por omissão (teclas 1, 2, 3).
// Cada nível pode ter as suas (ver "camuflagens" no LevelConfig).
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

// Tipo de letra usado em todo o jogo (fontes do sistema, funcionam sem internet)
export const FONTE = '"Segoe UI", "Trebuchet MS", Arial, sans-serif';

// Cores do tema da interface (estilo "sala de segurança")
export const TEMA = {
    fundo: 0x0b0d12,        // fundo dos menus
    painel: 0x141821,       // painéis e botões
    painelClaro: 0x1e2430,  // botão com o rato por cima
    linha: 0x2a3140,        // grelhas e contornos discretos
    destaque: 0x4fd1c5,     // azul-turquesa (cor principal)
    aviso: 0xffc857,        // amarelo (portas, scanner)
    perigo: 0xff4d5e,       // vermelho (alarme, vidas)
    texto: '#e8ecf3',
    textoSuave: '#8d96a8',
    destaqueCss: '#4fd1c5',
    avisoCss: '#ffc857',
    perigoCss: '#ff4d5e'
};

// Converte {r,g,b} para número hexadecimal (usado em tints e gráficos)
export function rgbParaHex(c) {
    return (c.r << 16) | (c.g << 8) | c.b;
}

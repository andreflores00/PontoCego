// =====================================================
// GestureRecognizer.js — Conceito técnico 2:
// correspondência de padrões ($1 Unistroke Recognizer)
// =====================================================
// Algoritmo de Wobbrock, Wilson e Li (2007), "Gestures without
// Libraries, Toolkits or Training: A $1 Recognizer".
//
// O traço desenhado pelo jogador é normalizado em 4 passos:
//   1. reamostragem  -> sempre N pontos igualmente espaçados
//   2. rotação       -> o ângulo do 1.º ponto em relação ao centro fica a 0
//   3. escala        -> cabe num quadrado de TAMANHO x TAMANHO
//   4. translação    -> o centro fica na origem (0, 0)
// Depois é comparado com cada modelo (template) pela distância média
// entre pontos correspondentes. O modelo mais próximo ganha, e a
// distância é convertida numa percentagem de semelhança (0–100%).

const N = 64;                                   // n.º de pontos após a reamostragem
const TAMANHO = 250;                            // lado do quadrado de normalização
const MEIA_DIAGONAL = 0.5 * Math.sqrt(2 * TAMANHO * TAMANHO);
const ANGULO_MAX = (45 * Math.PI) / 180;        // procura da melhor rotação: ±45°
const ANGULO_PRECISAO = (2 * Math.PI) / 180;    // pára quando o intervalo < 2°
const PHI = 0.5 * (-1 + Math.sqrt(5));          // razão de ouro (procura dourada)

// Nomes em português para mostrar no ecrã
export const NOMES_FORMAS = {
    triangulo: 'Triângulo',
    quadrado: 'Quadrado',
    circulo: 'Círculo'
};

// ---------- Funções auxiliares de geometria ----------

/** Comprimento total de um traço (soma das distâncias entre pontos). */
function comprimento(pontos) {
    let d = 0;
    for (let i = 1; i < pontos.length; i++) {
        d += Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y);
    }
    return d;
}

/** Centro (média) de um conjunto de pontos. */
function centroide(pontos) {
    let x = 0, y = 0;
    for (const p of pontos) { x += p.x; y += p.y; }
    return { x: x / pontos.length, y: y / pontos.length };
}

/** Passo 1: reamostra o traço para n pontos igualmente espaçados. */
function reamostrar(pontos, n) {
    const I = comprimento(pontos) / (n - 1);
    let D = 0;
    const novos = [{ ...pontos[0] }];
    const pts = pontos.map((p) => ({ ...p }));
    for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (D + d >= I && d > 0) {
            const t = (I - D) / d;
            const q = {
                x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
                y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y)
            };
            novos.push(q);
            pts.splice(i, 0, q); // q passa a ser o ponto anterior do próximo passo
            D = 0;
        } else {
            D += d;
        }
    }
    // Por erros de arredondamento pode faltar o último ponto
    while (novos.length < n) novos.push({ ...pontos[pontos.length - 1] });
    return novos.slice(0, n);
}

/** Roda todos os pontos de um ângulo à volta do centroide. */
function rodar(pontos, angulo) {
    const c = centroide(pontos);
    const cos = Math.cos(angulo), sin = Math.sin(angulo);
    return pontos.map((p) => ({
        x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
        y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y
    }));
}

/** Passo 2: roda o traço para o "ângulo indicativo" ficar a zero. */
function rodarParaZero(pontos) {
    const c = centroide(pontos);
    const ang = Math.atan2(c.y - pontos[0].y, c.x - pontos[0].x);
    return rodar(pontos, -ang);
}

/** Passo 3: escala o traço para caber num quadrado TAMANHO x TAMANHO. */
function escalar(pontos) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pontos) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    const w = Math.max(maxX - minX, 1), h = Math.max(maxY - minY, 1);
    return pontos.map((p) => ({ x: p.x * (TAMANHO / w), y: p.y * (TAMANHO / h) }));
}

/** Passo 4: move o traço para o centroide ficar na origem. */
function centrar(pontos) {
    const c = centroide(pontos);
    return pontos.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
}

/** Aplica os 4 passos de normalização. */
function normalizar(pontos) {
    return centrar(escalar(rodarParaZero(reamostrar(pontos, N))));
}

/** Distância média entre pontos correspondentes de dois traços. */
function distanciaMedia(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) d += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
    return d / a.length;
}

/** Distância com o traço rodado de um ângulo. */
function distanciaComAngulo(pontos, modelo, angulo) {
    return distanciaMedia(rodar(pontos, angulo), modelo);
}

/**
 * Procura dourada (golden section search) do ângulo entre -45° e 45°
 * que dá a menor distância entre o traço e o modelo.
 */
function distanciaMelhorAngulo(pontos, modelo) {
    let a = -ANGULO_MAX, b = ANGULO_MAX;
    let x1 = PHI * a + (1 - PHI) * b;
    let f1 = distanciaComAngulo(pontos, modelo, x1);
    let x2 = (1 - PHI) * a + PHI * b;
    let f2 = distanciaComAngulo(pontos, modelo, x2);
    while (Math.abs(b - a) > ANGULO_PRECISAO) {
        if (f1 < f2) {
            b = x2; x2 = x1; f2 = f1;
            x1 = PHI * a + (1 - PHI) * b;
            f1 = distanciaComAngulo(pontos, modelo, x1);
        } else {
            a = x1; x1 = x2; f1 = f2;
            x2 = (1 - PHI) * a + PHI * b;
            f2 = distanciaComAngulo(pontos, modelo, x2);
        }
    }
    return Math.min(f1, f2);
}

// ---------- Criação dos modelos (templates) ----------

/** Pontos de um polígono fechado (vértices -> traço que volta ao início). */
function poligono(vertices) {
    return [...vertices, vertices[0]].map(([x, y]) => ({ x, y }));
}

/** Pontos de um círculo desenhado num sentido. */
function circulo(sentido = 1) {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
        const a = -Math.PI / 2 + sentido * (i / 64) * Math.PI * 2;
        pts.push({ x: Math.cos(a) * 100, y: Math.sin(a) * 100 });
    }
    return pts;
}

/**
 * Para um polígono, cria variantes a começar em cada vértice e nos
 * dois sentidos. Assim o jogador pode começar a desenhar em qualquer
 * canto e no sentido que quiser.
 */
function variantesPoligono(vertices) {
    const variantes = [];
    for (let s = 0; s < vertices.length; s++) {
        const rodado = [...vertices.slice(s), ...vertices.slice(0, s)];
        variantes.push(poligono(rodado));
        variantes.push(poligono([rodado[0], ...rodado.slice(1).reverse()]));
    }
    return variantes;
}

export default class GestureRecognizer {
    /** Cria os modelos de cada forma (já normalizados). */
    constructor() {
        this.modelos = [];
        const adicionar = (nome, pontos) => this.modelos.push({ nome, pontos: normalizar(pontos) });

        variantesPoligono([[0, -100], [87, 50], [-87, 50]]).forEach((p) => adicionar('triangulo', p));
        variantesPoligono([[-80, -80], [80, -80], [80, 80], [-80, 80]]).forEach((p) => adicionar('quadrado', p));
        adicionar('circulo', circulo(1));
        adicionar('circulo', circulo(-1));
    }

    /**
     * Reconhece um traço.
     * @param {{x:number,y:number}[]} pontos pontos do desenho do jogador
     * @returns {{nome:string|null, semelhanca:number}} semelhança entre 0 e 1
     */
    reconhecer(pontos) {
        // Traços muito curtos não são analisados
        if (pontos.length < 10 || comprimento(pontos) < 60) return { nome: null, semelhanca: 0 };

        const traco = normalizar(pontos);
        let melhor = { nome: null, distancia: Infinity };
        for (const m of this.modelos) {
            const d = distanciaMelhorAngulo(traco, m.pontos);
            if (d < melhor.distancia) melhor = { nome: m.nome, distancia: d };
        }
        return { nome: melhor.nome, semelhanca: Math.max(0, 1 - melhor.distancia / MEIA_DIAGONAL) };
    }
}

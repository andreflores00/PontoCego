// =====================================================
// ColorSegmenter.js — Conceito técnico 1:
// segmentação por cor (o drone destaca-se do fundo?)
// =====================================================
// A câmara não "sabe" onde está o drone por magia: compara a cor
// do drone com a cor do fundo à volta dele, lida diretamente dos
// píxeis da imagem do chão. Se a diferença (ΔE) for maior do que
// o limiar, o drone é segmentado como um objeto distinto.
import { rgbParaLab, deltaE } from './ColorUtils.js';

export default class ColorSegmenter {
    /**
     * @param {ImageData} imageData píxeis da imagem do chão
     * @param {number} offsetY posição vertical da imagem no mundo (por causa do HUD)
     */
    constructor(imageData, offsetY = 0) {
        this.dados = imageData.data;
        this.largura = imageData.width;
        this.altura = imageData.height;
        this.offsetY = offsetY;
        // Função opcional (x, y) -> fator de luz (1 = sol, < 1 = sombra).
        // Usada no exterior para as sombras das nuvens, que se movem.
        this.iluminacao = null;
    }

    // Lê a cor de um píxel da imagem do chão (coordenadas do mundo)
    lerPixel(x, y) {
        const px = Math.floor(x);
        const py = Math.floor(y - this.offsetY);
        if (px < 0 || py < 0 || px >= this.largura || py >= this.altura) return null;
        const i = (py * this.largura + px) * 4;
        // A cor vista pela câmara é a cor do chão multiplicada pela luz nesse ponto
        const luz = this.iluminacao ? this.iluminacao(x, y) : 1;
        return { r: this.dados[i] * luz, g: this.dados[i + 1] * luz, b: this.dados[i + 2] * luz };
    }

    /**
     * Cor média do fundo numa coroa circular à volta de (x, y).
     * Amostra vários anéis (raioMin..raioMax) para ignorar o próprio drone.
     * A média é feita em Lab para respeitar a perceção de cor.
     */
    corMediaFundo(x, y, raioMin = 16, raioMax = 30, amostrasPorAnel = 16) {
        let L = 0, a = 0, b = 0, n = 0;
        for (let raio = raioMin; raio <= raioMax; raio += 7) {
            for (let k = 0; k < amostrasPorAnel; k++) {
                const ang = (k / amostrasPorAnel) * Math.PI * 2;
                const p = this.lerPixel(x + Math.cos(ang) * raio, y + Math.sin(ang) * raio);
                if (!p) continue;
                const lab = rgbParaLab(p.r, p.g, p.b);
                L += lab.L; a += lab.a; b += lab.b; n++;
            }
        }
        if (n === 0) return null;
        return { L: L / n, a: a / n, b: b / n };
    }

    /**
     * Calcula o contraste (ΔE) entre a cor do drone e o fundo local.
     * @returns {{deltaE:number, fundo:object}}
     */
    analisar(corDrone, x, y) {
        const fundo = this.corMediaFundo(x, y);
        if (!fundo) return { deltaE: 0, fundo: null };
        const labDrone = rgbParaLab(corDrone.r, corDrone.g, corDrone.b);
        return { deltaE: deltaE(labDrone, fundo), fundo };
    }
}

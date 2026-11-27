// =====================================================
// Nuvem.js — sombra de uma nuvem a passar (só no exterior)
// =====================================================
// A sombra escurece o chão por onde passa. Isto muda a cor que as
// câmaras veem: uma camuflagem que estava certa ao sol pode deixar
// de estar quando a nuvem chega (e o ΔE sobe).
// A sombra é desenhada por cima do chão mas por baixo do drone,
// porque o painel de camuflagem do drone emite a sua própria luz.
import { LARGURA, HUD_ALTURA, TILE } from '../config.js';

// Quanto a sombra escurece (0.6 = fica com 60% da luz)
export const FATOR_SOMBRA = 0.6;
// Velocidade da nuvem (px/s). Aumentar para a nuvem passar mais depressa.
const VELOCIDADE = 28;

export default class Nuvem {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} raioX meio-eixo horizontal da elipse (px)
     * @param {number} raioY meio-eixo vertical da elipse (px)
     * @param {number} atraso px extra antes de entrar no ecrã (para as nuvens não virem juntas)
     */
    constructor(scene, raioX, raioY, atraso = 0) {
        this.scene = scene;
        this.rx = raioX;
        this.ry = raioY;
        // Elipse preta translúcida: alfa 0.4 = deixa passar 60% da luz (igual ao FATOR_SOMBRA)
        this.forma = scene.add.ellipse(0, 0, raioX * 2, raioY * 2, 0x000000, 1 - FATOR_SOMBRA).setDepth(9);
        this.recomecar(-raioX - atraso);
    }

    /**
     * Põe a nuvem à esquerda do ecrã numa altura sorteada (aleatoriedade controlada).
     * @param {number} x posição horizontal inicial
     */
    recomecar(x) {
        this.x = x;
        this.y = HUD_ALTURA + Phaser.Math.Between(2, 13) * TILE;
        this.forma.setPosition(this.x, this.y);
    }

    /** Move a nuvem; quando sai pela direita volta a entrar pela esquerda. */
    atualizar(delta) {
        this.x += VELOCIDADE * delta / 1000;
        if (this.x - this.rx > LARGURA) this.recomecar(-this.rx);
        this.forma.setPosition(this.x, this.y);
    }

    /** Verdadeiro se o ponto (px, py) está debaixo da sombra. */
    cobre(px, py) {
        const dx = (px - this.x) / this.rx, dy = (py - this.y) / this.ry;
        return dx * dx + dy * dy <= 1;
    }
}

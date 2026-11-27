// =====================================================
// ScannerDoor.js — porta de segurança com scanner de padrões
// =====================================================
// A porta bloqueia a passagem (colisão) e a visão das câmaras.
// Cada porta pede uma forma geométrica, sorteada ao criar o nível
// (aleatoriedade controlada). Abre quando o jogador desenha essa
// forma com semelhança suficiente (ver GestureRecognizer).
import { TILE, HUD_ALTURA } from '../config.js';

// Distância (px) a que o jogador tem de estar para usar o scanner
export const DISTANCIA_SCANNER = 70;

export default class ScannerDoor {
    /**
     * @param {Phaser.Scene} scene
     * @param {{x:number,y:number,w:number,h:number}} def posição e tamanho em mosaicos
     * @param {string} forma forma pedida ('triangulo', 'quadrado' ou 'circulo')
     * @param {Phaser.Physics.Arcade.StaticGroup} grupoParedes grupo de colisão das paredes
     * @param {Phaser.Geom.Rectangle[]} retangulosVisao lista usada pelas câmaras
     */
    constructor(scene, def, forma, grupoParedes, retangulosVisao) {
        this.scene = scene;
        this.forma = forma;
        this.aberta = false;
        this.retangulosVisao = retangulosVisao;

        const x = def.x * TILE, y = HUD_ALTURA + def.y * TILE;
        const w = def.w * TILE, h = def.h * TILE;
        this.centro = { x: x + w / 2, y: y + h / 2 };

        // Corpo da porta (retângulo com colisão)
        this.corpo = scene.add.rectangle(x, y, w, h, 0x5a4a2a)
            .setOrigin(0, 0).setStrokeStyle(3, 0xffc857).setDepth(8);
        grupoParedes.add(this.corpo);

        // Retângulo que bloqueia a visão das câmaras enquanto a porta estiver fechada
        this.retangulo = new Phaser.Geom.Rectangle(x, y, w, h);
        retangulosVisao.push(this.retangulo);

        // Ícone da forma pedida, desenhado em cima da porta
        this.icone = scene.add.graphics().setDepth(9);
        ScannerDoor.desenharForma(this.icone, forma, this.centro.x, this.centro.y, 9, 0xffc857, 2);
    }

    /**
     * Desenha uma forma (contorno) num objeto Graphics.
     * Método estático porque também é usado no painel do scanner.
     */
    static desenharForma(g, forma, cx, cy, raio, cor, espessura) {
        g.lineStyle(espessura, cor, 1);
        if (forma === 'circulo') {
            g.strokeCircle(cx, cy, raio);
        } else if (forma === 'quadrado') {
            g.strokeRect(cx - raio, cy - raio, raio * 2, raio * 2);
        } else {
            g.strokeTriangle(cx, cy - raio, cx + raio * 0.9, cy + raio * 0.7, cx - raio * 0.9, cy + raio * 0.7);
        }
    }

    /** Verdadeiro se o jogador está perto o suficiente para usar o scanner. */
    jogadorPerto(player) {
        return !this.aberta &&
            Phaser.Math.Distance.Between(player.x, player.y, this.centro.x, this.centro.y) < DISTANCIA_SCANNER;
    }

    /** Abre a porta: tira a colisão, deixa de bloquear a visão e desaparece. */
    abrir() {
        if (this.aberta) return;
        this.aberta = true;

        // Deixa de bloquear as câmaras
        const i = this.retangulosVisao.indexOf(this.retangulo);
        if (i >= 0) this.retangulosVisao.splice(i, 1);

        // Desliga a colisão e faz a porta desaparecer
        this.corpo.body.enable = false;
        this.scene.tweens.add({
            targets: [this.corpo, this.icone],
            alpha: 0,
            duration: 300,
            onComplete: () => { this.corpo.destroy(); this.icone.destroy(); }
        });
    }
}

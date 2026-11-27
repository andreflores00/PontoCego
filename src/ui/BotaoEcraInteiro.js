// =====================================================
// BotaoEcraInteiro.js — liga/desliga o ecrã inteiro
// =====================================================
// No telemóvel o ecrã inteiro esconde a barra do browser e
// deixa o jogo ocupar o ecrã todo.
import { TEMA } from '../config.js';

export default class BotaoEcraInteiro extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x posição horizontal (centro)
     * @param {number} y posição vertical (centro)
     */
    constructor(scene, x, y) {
        super(scene, x, y);
        const tam = 40;

        // Fundo redondo e ícone de quatro cantos
        const g = scene.add.graphics();
        g.fillStyle(TEMA.painel, 0.9).fillRoundedRect(-tam / 2, -tam / 2, tam, tam, 10);
        g.lineStyle(2, TEMA.destaque, 1).strokeRoundedRect(-tam / 2, -tam / 2, tam, tam, 10);
        g.lineStyle(3, 0xffffff, 1);
        const a = 9, b = 4;
        g.lineBetween(-a, -a, -a + b, -a); g.lineBetween(-a, -a, -a, -a + b);
        g.lineBetween(a, -a, a - b, -a); g.lineBetween(a, -a, a, -a + b);
        g.lineBetween(-a, a, -a + b, a); g.lineBetween(-a, a, -a, a - b);
        g.lineBetween(a, a, a - b, a); g.lineBetween(a, a, a, a - b);
        this.add(g);

        this.setSize(tam, tam).setDepth(300).setScrollFactor(0);
        this.setInteractive({ useHandCursor: true });
        this.on('pointerup', () => {
            if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
            else scene.scale.startFullscreen();
        });
        scene.add.existing(this);
    }
}

// =====================================================
// Player.js — o drone controlado pelo jogador
// =====================================================
import { CAMUFLAGENS, rgbParaHex } from '../config.js';

const VELOCIDADE = 150;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, camuflagemInicial = 0) {
        super(scene, x, y, 'drone', 'f0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Corpo circular mais pequeno que o sprite para deslizar nas paredes
        this.body.setCircle(11, 3, 3);
        this.setCollideWorldBounds(true);
        this.setDepth(10);
        this.play('drone-voar');

        this.indiceCamuflagem = -1;
        this.setCamuflagem(camuflagemInicial);
    }

    // Cor atual do drone em RGB (lida pelo ColorSegmenter)
    get cor() {
        return CAMUFLAGENS[this.indiceCamuflagem].cor;
    }

    // Muda a cor do módulo de camuflagem
    setCamuflagem(indice) {
        if (indice === this.indiceCamuflagem || !CAMUFLAGENS[indice]) return false;
        this.indiceCamuflagem = indice;
        this.setTint(rgbParaHex(CAMUFLAGENS[indice].cor));
        return true;
    }

    /**
     * Movimento a partir de um vetor de direção (teclado ou joystick).
     * @param {number} dx -1..1
     * @param {number} dy -1..1
     */
    mover(dx, dy) {
        const len = Math.hypot(dx, dy);
        if (len > 1) { dx /= len; dy /= len; }
        this.setVelocity(dx * VELOCIDADE, dy * VELOCIDADE);
        // Inclina ligeiramente o drone na direção do movimento
        this.setRotation(dx * 0.15);
    }
}

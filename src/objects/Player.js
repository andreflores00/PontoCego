// =====================================================
// Player.js — o drone controlado pelo jogador
// =====================================================
import { rgbParaHex } from '../config.js';

const VELOCIDADE = 150;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x posição inicial
     * @param {number} y posição inicial
     * @param {{nome:string, cor:object}[]} camuflagens cores disponíveis neste nível
     * @param {number} camuflagemInicial índice da cor com que começa
     */
    constructor(scene, x, y, camuflagens, camuflagemInicial = 0) {
        super(scene, x, y, 'drone', 'f0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Corpo circular mais pequeno que o sprite para deslizar nas paredes
        this.body.setCircle(11, 7, 7); // raio 11 px, centrado no sprite de 36x36
        this.setCollideWorldBounds(true);
        this.setDepth(10);
        this.play('drone-voar');

        this.camuflagens = camuflagens;
        this.indiceCamuflagem = -1;
        this.setCamuflagem(camuflagemInicial);
    }

    // Cor atual do drone em RGB (lida pelo ColorSegmenter)
    get cor() {
        return this.camuflagens[this.indiceCamuflagem].cor;
    }

    // Muda a cor do módulo de camuflagem
    setCamuflagem(indice) {
        if (indice === this.indiceCamuflagem || !this.camuflagens[indice]) return false;
        this.indiceCamuflagem = indice;
        this.setTint(rgbParaHex(this.camuflagens[indice].cor));
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

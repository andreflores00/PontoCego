// =====================================================
// PauseScene.js — menu de pausa
// =====================================================
// Corre por cima da GameScene (que fica parada) e da UIScene.
import { LARGURA, ALTURA, FONTE, TEMA } from '../config.js';
import Botao from '../ui/Botao.js';

export default class PauseScene extends Phaser.Scene {
    constructor() { super('PauseScene'); }

    /** Escurece o jogo e mostra os botões Continuar e Menu. */
    create() {
        const cx = LARGURA / 2;
        this.add.rectangle(0, 0, LARGURA, ALTURA, 0x000000, 0.6).setOrigin(0, 0).setInteractive();

        this.add.text(cx, 160, 'Pausa', {
            fontFamily: FONTE, fontSize: '52px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5);

        new Botao(this, cx, 260, 'Continuar', () => this.continuar(), 280, 58, true);
        new Botao(this, cx, 330, 'Menu', () => this.sairParaMenu());
        // As teclas P/ESC são tratadas na UIScene (alternam entre pausa e jogo)
    }

    /** Retoma o jogo. */
    continuar() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    /** Sai para o menu principal (termina o jogo atual). */
    sairParaMenu() {
        this.scene.stop('UIScene');
        this.scene.stop('GameScene');
        this.scene.start('MenuScene');
    }
}

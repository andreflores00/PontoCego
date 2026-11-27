// =====================================================
// FundoMenu.js — fundo animado dos menus
// =====================================================
// Grelha de "monitor de segurança", um cone de câmara a varrer o
// ecrã e algumas partículas a subir. Usado no Menu, Instruções,
// Opções e Game Over para todas as cenas terem o mesmo estilo.
import { LARGURA, ALTURA, TEMA } from '../config.js';

export default class FundoMenu {
    /**
     * Cria o fundo na cena indicada (fica atrás de tudo).
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        scene.cameras.main.setBackgroundColor(TEMA.fundo);

        // Grelha
        const g = scene.add.graphics().setDepth(-10);
        g.lineStyle(1, TEMA.linha, 0.6);
        for (let x = 0; x <= LARGURA; x += 40) g.lineBetween(x, 0, x, ALTURA);
        for (let y = 0; y <= ALTURA; y += 40) g.lineBetween(0, y, LARGURA, y);

        // Cone de câmara a varrer (desenhado no update)
        this.cone = scene.add.graphics().setDepth(-9);
        this.angulo = 0;

        // Câmara no canto superior esquerdo
        scene.add.image(40, 30, 'camara').setDepth(-8).setRotation(Math.PI / 4).setScale(1.4);

        // Partículas (pequenos quadrados) a subir devagar
        for (let i = 0; i < 25; i++) {
            const p = scene.add.rectangle(
                Phaser.Math.Between(0, LARGURA), Phaser.Math.Between(0, ALTURA),
                3, 3, TEMA.destaque, Phaser.Math.FloatBetween(0.15, 0.5)
            ).setDepth(-8);
            scene.tweens.add({
                targets: p, y: '-=' + Phaser.Math.Between(60, 160), alpha: 0,
                duration: Phaser.Math.Between(3000, 7000), repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        // Atualiza o cone em cada frame enquanto a cena existir
        scene.events.on('update', this.atualizar, this);
        scene.events.once('shutdown', () => scene.events.off('update', this.atualizar, this));
    }

    /** Roda o cone de um lado para o outro. */
    atualizar(tempo) {
        const ang = Math.PI / 4 + Math.sin(tempo / 2500) * 0.6;   // ângulo central do cone
        const abertura = 0.35;                                     // metade da abertura (rad)
        const alcance = 900;
        this.cone.clear();
        this.cone.fillStyle(TEMA.destaque, 0.06);
        this.cone.fillTriangle(
            40, 30,
            40 + Math.cos(ang - abertura) * alcance, 30 + Math.sin(ang - abertura) * alcance,
            40 + Math.cos(ang + abertura) * alcance, 30 + Math.sin(ang + abertura) * alcance
        );
    }
}

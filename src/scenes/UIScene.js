// =====================================================
// UIScene.js — HUD (corre em paralelo com a GameScene)
// =====================================================
import { LARGURA, HUD_ALTURA, VIDAS_INICIAIS } from '../config.js';

export default class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    init(data) {
        this.nomeNivel = data.nomeNivel;
        this.totalFicheiros = data.totalFicheiros;
    }

    create() {
        const estilo = { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff' };
        this.add.rectangle(0, 0, LARGURA, HUD_ALTURA, 0x0d0e12).setOrigin(0, 0);

        this.tPontos = this.add.text(16, 10, '', estilo);
        this.tFicheiros = this.add.text(16, 34, '', { ...estilo, fontSize: '15px', color: '#b8bcc6' });
        this.add.text(200, 10, this.nomeNivel, { ...estilo, color: '#b8bcc6' });

        // Barra de visibilidade (ΔE em relação ao limiar)
        this.add.text(430, 10, 'Visibilidade', estilo);
        this.add.rectangle(540, 14, 180, 16).setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        this.barraVis = this.add.rectangle(542, 16, 0, 12, 0x4fd1c5).setOrigin(0, 0);
        this.add.line(0, 0, 630, 12, 630, 32, 0xffffff).setOrigin(0, 0); // marca do limiar (50%)
        this.tVis = this.add.text(730, 10, '', estilo);

        // Barra de suspeita (alarme)
        this.add.text(430, 36, 'Alarme', { ...estilo, fontSize: '14px', color: '#b8bcc6' });
        this.barraSusp = this.add.rectangle(540, 40, 0, 8, 0xff3b3b).setOrigin(0, 0);

        // Cor atual da camuflagem
        this.amostraCor = this.add.circle(800, 30, 12, 0xffffff).setStrokeStyle(2, 0xffffff);

        this.coracoes = [];
        for (let i = 0; i < VIDAS_INICIAIS; i++) {
            this.coracoes.push(this.add.text(850 + i * 28, 16, '♥', { ...estilo, fontSize: '24px', color: '#ff4d5e' }));
        }
    }

    update() {
        const h = this.registry.get('hud');
        if (!h) return;
        this.tPontos.setText('Pontos: ' + h.pontos);
        this.tFicheiros.setText(`Ficheiros: ${h.ficheiros}/${this.totalFicheiros}`);
        this.barraVis.width = 176 * h.visibilidade;
        this.barraVis.fillColor = h.visibilidade > 0.5 ? 0xff6b6b : 0x4fd1c5;
        this.tVis.setText(Math.round(h.visibilidade * 100) + '%');
        this.barraSusp.width = 180 * h.suspeita;
        this.amostraCor.fillColor = h.cor;
        this.coracoes.forEach((c, i) => c.setAlpha(i < h.vidas ? 1 : 0.2));
    }
}

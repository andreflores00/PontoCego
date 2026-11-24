// =====================================================
// GameOverScene.js — resultados e jogar novamente
// =====================================================
import { LARGURA } from '../config.js';
import Botao from '../ui/Botao.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    init(data) {
        this.pontos = data.pontos ?? 0;
        this.venceu = data.venceu ?? false;
    }

    create() {
        const cx = LARGURA / 2;

        // Recorde guardado localmente
        let recorde = 0;
        try { recorde = Number(localStorage.getItem('pontoCego.recorde')) || 0; } catch (e) { }
        const novoRecorde = this.pontos > recorde;
        if (novoRecorde) {
            recorde = this.pontos;
            try { localStorage.setItem('pontoCego.recorde', String(recorde)); } catch (e) { }
        }

        this.add.text(cx, 100, this.venceu ? 'Missão cumprida!' : 'Foste detetado', {
            fontFamily: 'Arial', fontSize: '52px', fontStyle: 'bold',
            color: this.venceu ? '#4fd1c5' : '#ff6b6b'
        }).setOrigin(0.5);

        this.add.text(cx, 190, 'Pontuação: ' + this.pontos, {
            fontFamily: 'Arial', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(cx, 235, novoRecorde ? 'Novo recorde!' : 'Recorde: ' + recorde, {
            fontFamily: 'Arial', fontSize: '22px', color: '#b8bcc6'
        }).setOrigin(0.5);

        new Botao(this, cx, 340, 'Jogar novamente', () => this.scene.start('GameScene', { nivel: 0, pontos: 0, vidas: null }), 300);
        new Botao(this, cx, 410, 'Menu', () => this.scene.start('MenuScene'), 300);
    }
}

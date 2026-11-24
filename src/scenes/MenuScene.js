// =====================================================
// MenuScene.js — ecrã inicial
// =====================================================
import { LARGURA } from '../config.js';
import Botao from '../ui/Botao.js';

export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        const cx = LARGURA / 2;

        this.add.text(cx, 90, 'PONTO CEGO', {
            fontFamily: 'Arial', fontSize: '64px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(cx, 145, 'Não deixes que te vejam', {
            fontFamily: 'Arial', fontSize: '22px', color: '#b8bcc6'
        }).setOrigin(0.5);

        // Drone animado no menu
        this.add.sprite(cx, 205, 'drone', 'f0').setScale(1.6).play('drone-voar').setTint(0x5a8cd6);

        new Botao(this, cx, 280, 'Jogar', () => this.scene.start('GameScene', { nivel: 0, pontos: 0, vidas: null }));
        new Botao(this, cx, 350, 'Instruções', () => this.scene.start('InstructionsScene'));
        new Botao(this, cx, 420, 'Opções', () => this.scene.start('OptionsScene'));

        // Melhor pontuação guardada localmente
        let recorde = 0;
        try { recorde = Number(localStorage.getItem('pontoCego.recorde')) || 0; } catch (e) { }
        this.add.text(cx, 490, 'Melhor pontuação: ' + recorde, {
            fontFamily: 'Arial', fontSize: '20px', color: '#b8bcc6'
        }).setOrigin(0.5);
    }
}

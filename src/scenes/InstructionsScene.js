// =====================================================
// InstructionsScene.js — como jogar
// =====================================================
import { LARGURA } from '../config.js';
import Botao from '../ui/Botao.js';

export default class InstructionsScene extends Phaser.Scene {
    constructor() { super('InstructionsScene'); }

    create() {
        const cx = LARGURA / 2;
        this.add.text(cx, 60, 'Como jogar', {
            fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);

        const linhas = [
            'Objetivo: apanha os ficheiros e chega ao núcleo de dados sem seres detetado.',
            '',
            '1. Foge dos cones de visão das câmaras.',
            '2. Fica da cor do chão: a câmara compara a tua cor com o fundo (ΔE).',
            '    Se a diferença for pequena, és invisível mesmo dentro do cone.',
            '3. Vigia a barra de Visibilidade no topo do ecrã.',
            '',
            'Computador: WASD ou setas para mover · 1, 2, 3 para mudar de cor',
            'Telemóvel: joystick à esquerda · botões de cor à direita'
        ];
        this.add.text(80, 120, linhas.join('\n'), {
            fontFamily: 'Arial', fontSize: '21px', color: '#e6e8ee', lineSpacing: 8
        });

        new Botao(this, cx, 470, 'Voltar', () => this.scene.start('MenuScene'));
    }
}

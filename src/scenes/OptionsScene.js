// =====================================================
// OptionsScene.js — som e dificuldade (guardados no localStorage)
// =====================================================
import { LARGURA } from '../config.js';
import Botao from '../ui/Botao.js';

const DIFICULDADES = ['facil', 'normal', 'dificil'];
const NOMES = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default class OptionsScene extends Phaser.Scene {
    constructor() { super('OptionsScene'); }

    create() {
        const cx = LARGURA / 2;
        this.add.text(cx, 70, 'Opções', {
            fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);

        const bSom = new Botao(this, cx, 200, '', () => {
            this.registry.set('som', !this.registry.get('som'));
            this.sound.mute = !this.registry.get('som');
            atualizar();
        }, 320);

        const bDif = new Botao(this, cx, 280, '', () => {
            const i = DIFICULDADES.indexOf(this.registry.get('dificuldade'));
            this.registry.set('dificuldade', DIFICULDADES[(i + 1) % DIFICULDADES.length]);
            atualizar();
        }, 320);

        this.add.text(cx, 330, 'A dificuldade muda o limiar de deteção das câmaras (ΔE).', {
            fontFamily: 'Arial', fontSize: '16px', color: '#b8bcc6'
        }).setOrigin(0.5);

        new Botao(this, cx, 450, 'Voltar', () => this.scene.start('MenuScene'));

        const atualizar = () => {
            bSom.texto.setText('Som: ' + (this.registry.get('som') ? 'ligado' : 'desligado'));
            bDif.texto.setText('Dificuldade: ' + NOMES[this.registry.get('dificuldade')]);
            try {
                localStorage.setItem('pontoCego.opcoes', JSON.stringify({
                    som: this.registry.get('som'),
                    dificuldade: this.registry.get('dificuldade')
                }));
            } catch (e) { }
        };
        atualizar();
    }
}

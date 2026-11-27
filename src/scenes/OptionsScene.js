// =====================================================
// OptionsScene.js — som e dificuldade (guardados no localStorage)
// =====================================================
import { LARGURA, FONTE, TEMA } from '../config.js';
import Botao from '../ui/Botao.js';
import FundoMenu from '../ui/FundoMenu.js';

// Ordem das dificuldades ao carregar no botão, e o nome mostrado
const DIFICULDADES = ['facil', 'normal', 'dificil'];
const NOMES = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

export default class OptionsScene extends Phaser.Scene {
    constructor() { super('OptionsScene'); }

    /** Monta o ecrã das opções. */
    create() {
        const cx = LARGURA / 2;
        new FundoMenu(this);
        this.cameras.main.fadeIn(250, 11, 13, 18);

        this.add.text(cx, 70, 'Opções', {
            fontFamily: FONTE, fontSize: '40px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5);

        // Botão do som (liga/desliga)
        const bSom = new Botao(this, cx, 190, '', () => {
            this.registry.set('som', !this.registry.get('som'));
            this.sound.mute = !this.registry.get('som');
            atualizar();
        }, 340);

        // Botão da dificuldade (roda entre Fácil, Normal e Difícil)
        const bDif = new Botao(this, cx, 270, '', () => {
            const i = DIFICULDADES.indexOf(this.registry.get('dificuldade'));
            this.registry.set('dificuldade', DIFICULDADES[(i + 1) % DIFICULDADES.length]);
            atualizar();
        }, 340);

        this.add.text(cx, 322, 'A dificuldade muda o limiar de deteção das câmaras (ΔE).', {
            fontFamily: FONTE, fontSize: '16px', color: TEMA.textoSuave
        }).setOrigin(0.5);

        new Botao(this, cx, 450, 'Voltar', () => this.scene.start('MenuScene'));

        /** Atualiza o texto dos botões e guarda as opções. */
        const atualizar = () => {
            bSom.texto.setText('Som: ' + (this.registry.get('som') ? 'ligado' : 'desligado'));
            bDif.texto.setText('Dificuldade: ' + NOMES[this.registry.get('dificuldade')]);
            try {
                localStorage.setItem('pontoCego.opcoes', JSON.stringify({
                    som: this.registry.get('som'),
                    dificuldade: this.registry.get('dificuldade')
                }));
            } catch (e) { /* sem localStorage: as opções só duram esta sessão */ }
        };
        atualizar();
    }
}

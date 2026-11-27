// =====================================================
// MenuScene.js — ecrã inicial
// =====================================================
import { LARGURA, ALTURA, FONTE, TEMA, CAMUFLAGENS, rgbParaHex } from '../config.js';
import Botao from '../ui/Botao.js';
import FundoMenu from '../ui/FundoMenu.js';
import BotaoEcraInteiro from '../ui/BotaoEcraInteiro.js';

export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    /** Monta o menu: título, drone animado, botões e recorde. */
    create() {
        const cx = LARGURA / 2;
        new FundoMenu(this);
        this.cameras.main.fadeIn(400, 11, 13, 18);

        // Título com sombra
        this.add.text(cx, 88, 'PONTO CEGO', {
            fontFamily: FONTE, fontSize: '72px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5).setShadow(0, 4, '#000000', 8, false, true);
        this.add.text(cx, 142, 'Não deixes que te vejam', {
            fontFamily: FONTE, fontSize: '22px', color: TEMA.destaqueCss
        }).setOrigin(0.5);

        // Drone a flutuar e a trocar de cor (mostra a ideia da camuflagem)
        const drone = this.add.sprite(cx, 205, 'drone', 'f0').setScale(1.8).play('drone-voar');
        this.tweens.add({ targets: drone, y: 215, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        let i = 0;
        drone.setTint(rgbParaHex(CAMUFLAGENS[0].cor));
        this.time.addEvent({
            delay: 1100, loop: true,
            callback: () => { i = (i + 1) % CAMUFLAGENS.length; drone.setTint(rgbParaHex(CAMUFLAGENS[i].cor)); }
        });

        // Botões
        new Botao(this, cx, 290, 'Jogar', () => this.mudarCena('GameScene', { nivel: 0, pontos: 0, vidas: null }), 280, 58, true);
        new Botao(this, cx, 360, 'Instruções', () => this.mudarCena('InstructionsScene'));
        new Botao(this, cx, 430, 'Opções', () => this.mudarCena('OptionsScene'));

        // Melhor pontuação guardada localmente
        let recorde = 0;
        try { recorde = Number(localStorage.getItem('pontoCego.recorde')) || 0; } catch (e) { }
        this.add.text(cx, ALTURA - 40, 'Melhor pontuação: ' + recorde, {
            fontFamily: FONTE, fontSize: '18px', color: TEMA.textoSuave
        }).setOrigin(0.5);

        // Botão de ecrã inteiro (útil no telemóvel)
        new BotaoEcraInteiro(this, LARGURA - 36, 36);
    }

    /**
     * Muda de cena com um fade para preto.
     * @param {string} chave nome da cena
     * @param {object} dados dados enviados para a cena
     */
    mudarCena(chave, dados = {}) {
        this.cameras.main.fadeOut(250, 11, 13, 18);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(chave, dados));
    }
}

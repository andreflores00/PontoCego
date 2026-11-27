// =====================================================
// GameOverScene.js — resultados e jogar novamente
// =====================================================
import { LARGURA, FONTE, TEMA } from '../config.js';
import Botao from '../ui/Botao.js';
import FundoMenu from '../ui/FundoMenu.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    /** Recebe a pontuação final e se o jogador venceu. */
    init(data) {
        this.pontos = data.pontos ?? 0;
        this.venceu = data.venceu ?? false;
    }

    /** Mostra o resultado, o recorde e os botões. */
    create() {
        const cx = LARGURA / 2;
        new FundoMenu(this);
        this.cameras.main.fadeIn(400, 11, 13, 18);

        // Recorde guardado localmente
        let recorde = 0;
        try { recorde = Number(localStorage.getItem('pontoCego.recorde')) || 0; } catch (e) { }
        const novoRecorde = this.pontos > recorde;
        if (novoRecorde) {
            recorde = this.pontos;
            try { localStorage.setItem('pontoCego.recorde', String(recorde)); } catch (e) { }
        }

        this.add.text(cx, 95, this.venceu ? 'Missão cumprida!' : 'Foste detetado', {
            fontFamily: FONTE, fontSize: '56px', fontStyle: 'bold',
            color: this.venceu ? TEMA.destaqueCss : TEMA.perigoCss
        }).setOrigin(0.5).setShadow(0, 4, '#000000', 8, false, true);

        // Cartão com a pontuação
        const g = this.add.graphics();
        g.fillStyle(TEMA.painel, 0.95).fillRoundedRect(cx - 180, 150, 360, 120, 16);
        g.lineStyle(2, TEMA.linha, 1).strokeRoundedRect(cx - 180, 150, 360, 120, 16);
        this.add.text(cx, 178, 'Pontuação', { fontFamily: FONTE, fontSize: '18px', color: TEMA.textoSuave }).setOrigin(0.5);
        const tPontos = this.add.text(cx, 215, '0', {
            fontFamily: FONTE, fontSize: '44px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5);
        this.add.text(cx, 252, novoRecorde ? 'Novo recorde!' : 'Recorde: ' + recorde, {
            fontFamily: FONTE, fontSize: '17px', color: novoRecorde ? TEMA.avisoCss : TEMA.textoSuave
        }).setOrigin(0.5);

        // Os pontos "sobem" de 0 até ao valor final
        const contador = { v: 0 };
        this.tweens.add({
            targets: contador, v: this.pontos, duration: 900, ease: 'Cubic.easeOut',
            onUpdate: () => tPontos.setText(String(Math.round(contador.v)))
        });

        new Botao(this, cx, 350, 'Jogar novamente', () => this.scene.start('GameScene', { nivel: 0, pontos: 0, vidas: null }), 300, 58, true);
        new Botao(this, cx, 420, 'Menu', () => this.scene.start('MenuScene'), 300);
    }
}

// =====================================================
// InstructionsScene.js — como jogar
// =====================================================
// Mostra as regras em 4 cartões, um por mecânica, e os controlos.
import { LARGURA, FONTE, TEMA } from '../config.js';
import Botao from '../ui/Botao.js';
import FundoMenu from '../ui/FundoMenu.js';

// Texto de cada cartão (título e descrição)
const CARTOES = [
    { titulo: 'Foge das câmaras', texto: 'O cone de visão fica vermelho quando te estão a ver.' },
    { titulo: 'Fica da cor do chão', texto: 'A câmara compara a tua cor com o fundo (ΔE). Cor parecida = invisível.' },
    { titulo: 'Abre as portas', texto: 'Desenha a forma do modelo num só traço.' },
    { titulo: 'Chega ao núcleo', texto: 'Apanha os ficheiros pelo caminho para ganhar pontos.' }
];

export default class InstructionsScene extends Phaser.Scene {
    constructor() { super('InstructionsScene'); }

    /** Monta o ecrã das instruções. */
    create() {
        const cx = LARGURA / 2;
        new FundoMenu(this);
        this.cameras.main.fadeIn(250, 11, 13, 18);

        this.add.text(cx, 50, 'Como jogar', {
            fontFamily: FONTE, fontSize: '40px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5);

        // Cartões em grelha 2 x 2
        const w = 400, h = 100;
        CARTOES.forEach((c, i) => {
            const x = cx + (i % 2 === 0 ? -w / 2 - 10 : w / 2 + 10);
            const y = 150 + Math.floor(i / 2) * (h + 16);
            this.criarCartao(x, y, w, h, i + 1, c.titulo, c.texto);
        });

        // Controlos
        this.add.text(cx, 382,
            'Computador: WASD ou setas para mover · 1, 2, 3 muda a cor · P para pausa\n' +
            'Telemóvel: joystick à esquerda · botões de cor à direita · desenha com o dedo', {
                fontFamily: FONTE, fontSize: '17px', color: TEMA.textoSuave, align: 'center', lineSpacing: 6
            }).setOrigin(0.5);

        new Botao(this, cx, 470, 'Voltar', () => this.scene.start('MenuScene'));
    }

    /**
     * Desenha um cartão com número, título e texto.
     * @param {number} x centro horizontal
     * @param {number} y centro vertical
     * @param {number} w largura
     * @param {number} h altura
     * @param {number} numero número mostrado no círculo
     * @param {string} titulo título do cartão
     * @param {string} texto descrição
     */
    criarCartao(x, y, w, h, numero, titulo, texto) {
        const g = this.add.graphics();
        g.fillStyle(TEMA.painel, 0.95).fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        g.lineStyle(1.5, TEMA.linha, 1).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
        // Círculo com o número
        g.fillStyle(TEMA.destaque, 1).fillCircle(x - w / 2 + 34, y, 18);
        this.add.text(x - w / 2 + 34, y, String(numero), {
            fontFamily: FONTE, fontSize: '20px', fontStyle: 'bold', color: '#0b0d12'
        }).setOrigin(0.5);
        this.add.text(x - w / 2 + 66, y - 30, titulo, {
            fontFamily: FONTE, fontSize: '20px', fontStyle: 'bold', color: TEMA.texto
        });
        this.add.text(x - w / 2 + 66, y - 4, texto, {
            fontFamily: FONTE, fontSize: '15px', color: TEMA.textoSuave, wordWrap: { width: w - 84 }
        });
    }
}

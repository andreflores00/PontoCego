// =====================================================
// TouchControls.js — joystick virtual e botões de cor
// (só aparece em dispositivos táteis)
// =====================================================
import { ALTURA, LARGURA, FONTE, TEMA, rgbParaHex } from '../config.js';

// Raio da base do joystick (px). Aumentar para um joystick maior.
const RAIO_BASE = 60;
// Raio dos botões de cor (px)
const RAIO_BOTAO = 30;

export default class TouchControls {
    /**
     * @param {Phaser.Scene} scene
     * @param {{nome:string, cor:object}[]} camuflagens cores disponíveis (uma por botão)
     * @param {(i:number)=>void} aoMudarCor chamado quando se toca num botão de cor
     * @param {(p:Phaser.Input.Pointer)=>boolean} podeUsar devolve false para toques que o joystick deve ignorar
     */
    constructor(scene, camuflagens, aoMudarCor, podeUsar = () => true) {
        this.scene = scene;
        this.vetor = { x: 0, y: 0 };
        this.ponteiroJoystick = null;

        // Base e pega do joystick (canto inferior esquerdo)
        const bx = 100, by = ALTURA - 95;
        this.base = scene.add.circle(bx, by, RAIO_BASE, 0x000000, 0.35)
            .setStrokeStyle(3, TEMA.destaque, 0.8).setDepth(100);
        this.pega = scene.add.circle(bx, by, 26, TEMA.destaque, 0.7)
            .setStrokeStyle(2, 0xffffff, 0.9).setDepth(101);

        // Botões de cor (canto inferior direito), com o número da tecla
        this.botoes = camuflagens.map((c, i) => {
            const x = LARGURA - 200 + i * 72, y = ALTURA - 62;
            const b = scene.add.circle(x, y, RAIO_BOTAO, rgbParaHex(c.cor))
                .setStrokeStyle(3, 0xffffff, 0.9).setDepth(100).setInteractive();
            scene.add.text(x, y, String(i + 1), {
                fontFamily: FONTE, fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(101).setShadow(0, 1, '#000000', 3);
            b.on('pointerdown', () => aoMudarCor(i));
            return b;
        });

        // O joystick só responde a toques na metade esquerda do ecrã
        scene.input.on('pointerdown', (p) => {
            if (p.x < LARGURA / 2 && this.ponteiroJoystick === null && podeUsar(p)) {
                this.ponteiroJoystick = p.id;
                this.atualizar(p);
            }
        });
        scene.input.on('pointermove', (p) => {
            if (p.id === this.ponteiroJoystick) this.atualizar(p);
        });
        const soltar = (p) => {
            if (p.id === this.ponteiroJoystick) {
                this.ponteiroJoystick = null;
                this.vetor.x = 0; this.vetor.y = 0;
                this.pega.setPosition(this.base.x, this.base.y);
            }
        };
        scene.input.on('pointerup', soltar);
        scene.input.on('pointerupoutside', soltar);
    }

    /**
     * Destaca o botão da cor ativa (contorno mais grosso e turquesa).
     * @param {number} indice índice da cor escolhida
     */
    marcarAtivo(indice) {
        this.botoes.forEach((b, i) => b.setStrokeStyle(i === indice ? 5 : 3, i === indice ? TEMA.destaque : 0xffffff, 0.9));
    }

    /**
     * Converte a posição do dedo num vetor de direção (-1..1).
     * @param {Phaser.Input.Pointer} p
     */
    atualizar(p) {
        let dx = p.x - this.base.x, dy = p.y - this.base.y;
        const d = Math.hypot(dx, dy);
        if (d > RAIO_BASE) { dx = dx / d * RAIO_BASE; dy = dy / d * RAIO_BASE; }
        this.pega.setPosition(this.base.x + dx, this.base.y + dy);
        this.vetor.x = dx / RAIO_BASE;
        this.vetor.y = dy / RAIO_BASE;
    }
}

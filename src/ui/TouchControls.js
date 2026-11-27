// =====================================================
// TouchControls.js — joystick virtual e botões de cor
// (só aparece em dispositivos táteis)
// =====================================================
import { CAMUFLAGENS, ALTURA, LARGURA, rgbParaHex } from '../config.js';

const RAIO_BASE = 55;

export default class TouchControls {
    /**
     * @param {Phaser.Scene} scene
     * @param {(i:number)=>void} aoMudarCor chamado quando se toca num botão de cor
     * @param {(p:Phaser.Input.Pointer)=>boolean} podeUsar devolve false para toques que o joystick deve ignorar
     */
    constructor(scene, aoMudarCor, podeUsar = () => true) {
        this.scene = scene;
        this.vetor = { x: 0, y: 0 };
        this.ponteiroJoystick = null;

        const bx = 95, by = ALTURA - 90;
        this.base = scene.add.circle(bx, by, RAIO_BASE, 0xffffff, 0.12)
            .setStrokeStyle(2, 0xffffff, 0.5).setDepth(100).setScrollFactor(0);
        this.pega = scene.add.circle(bx, by, 24, 0xffffff, 0.45).setDepth(101).setScrollFactor(0);

        // Botões de cor no canto inferior direito
        CAMUFLAGENS.forEach((c, i) => {
            const x = LARGURA - 180 + i * 62, y = ALTURA - 60;
            const b = scene.add.circle(x, y, 26, rgbParaHex(c.cor))
                .setStrokeStyle(3, 0xffffff).setDepth(100).setInteractive();
            scene.add.text(x, y, String(i + 1), { fontFamily: 'Arial', fontSize: '20px', color: '#ffffff' })
                .setOrigin(0.5).setDepth(101);
            b.on('pointerdown', () => aoMudarCor(i));
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

    // Converte a posição do dedo num vetor de direção (-1..1)
    atualizar(p) {
        let dx = p.x - this.base.x, dy = p.y - this.base.y;
        const d = Math.hypot(dx, dy);
        if (d > RAIO_BASE) { dx = dx / d * RAIO_BASE; dy = dy / d * RAIO_BASE; }
        this.pega.setPosition(this.base.x + dx, this.base.y + dy);
        this.vetor.x = dx / RAIO_BASE;
        this.vetor.y = dy / RAIO_BASE;
    }
}

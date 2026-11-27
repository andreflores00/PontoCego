// =====================================================
// Botao.js — botão reutilizado nos menus
// =====================================================
// Retângulo de cantos arredondados com contorno turquesa.
// Ao passar o rato (ou tocar) aumenta ligeiramente de tamanho.
import { FONTE, TEMA } from '../config.js';

export default class Botao extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene cena onde o botão é criado
     * @param {number} x posição horizontal (centro)
     * @param {number} y posição vertical (centro)
     * @param {string} texto texto do botão
     * @param {Function} aoClicar função chamada ao clicar
     * @param {number} largura largura em píxeis
     * @param {number} altura altura em píxeis
     * @param {boolean} principal true = botão em destaque (preenchido a turquesa)
     */
    constructor(scene, x, y, texto, aoClicar, largura = 280, altura = 56, principal = false) {
        super(scene, x, y);
        this.largura = largura;
        this.altura = altura;
        this.principal = principal;

        this.fundo = scene.add.graphics();
        this.texto = scene.add.text(0, 0, texto, {
            fontFamily: FONTE, fontSize: '22px', fontStyle: 'bold',
            color: principal ? '#0b0d12' : TEMA.texto
        }).setOrigin(0.5);

        this.add([this.fundo, this.texto]);
        this.desenhar(false);
        this.setSize(largura, altura);
        this.setInteractive({ useHandCursor: true });

        // Efeito ao passar o rato por cima
        this.on('pointerover', () => {
            this.desenhar(true);
            scene.tweens.add({ targets: this, scale: 1.05, duration: 120 });
        });
        this.on('pointerout', () => {
            this.desenhar(false);
            scene.tweens.add({ targets: this, scale: 1, duration: 120 });
        });
        this.on('pointerup', () => {
            scene.sound.play('click');
            aoClicar();
        });

        scene.add.existing(this);
    }

    /**
     * Desenha o fundo do botão.
     * @param {boolean} ativo true quando o rato está por cima
     */
    desenhar(ativo) {
        const w = this.largura, h = this.altura;
        this.fundo.clear();
        this.fundo.fillStyle(this.principal ? TEMA.destaque : (ativo ? TEMA.painelClaro : TEMA.painel), 1);
        this.fundo.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
        this.fundo.lineStyle(2, ativo ? 0xffffff : TEMA.destaque, 1);
        this.fundo.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    }
}

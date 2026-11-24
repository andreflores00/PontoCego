// =====================================================
// Botao.js — botão simples reutilizado nos menus
// =====================================================
export default class Botao extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texto, aoClicar, largura = 260, altura = 54) {
        super(scene, x, y);

        this.fundo = scene.add.rectangle(0, 0, largura, altura, 0x22252f)
            .setStrokeStyle(2, 0xdfe3ea);
        this.texto = scene.add.text(0, 0, texto, {
            fontFamily: 'Arial', fontSize: '24px', color: '#ffffff'
        }).setOrigin(0.5);

        this.add([this.fundo, this.texto]);
        this.setSize(largura, altura);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerover', () => this.fundo.setFillStyle(0x3a3f4f));
        this.on('pointerout', () => this.fundo.setFillStyle(0x22252f));
        this.on('pointerup', () => {
            if (scene.registry.get('som')) scene.sound.play('click');
            aoClicar();
        });

        scene.add.existing(this);
    }
}

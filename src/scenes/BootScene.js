// =====================================================
// BootScene.js — carrega as opções guardadas e arranca
// =====================================================
export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    create() {
        // Opções guardadas no localStorage (ou valores por omissão)
        let opcoes = { som: true, dificuldade: 'normal' };
        try {
            const guardado = JSON.parse(localStorage.getItem('pontoCego.opcoes'));
            if (guardado) opcoes = { ...opcoes, ...guardado };
        } catch (e) { /* localStorage indisponível: usa os valores por omissão */ }

        this.registry.set('som', opcoes.som);
        this.registry.set('dificuldade', opcoes.dificuldade);
        this.sound.mute = !opcoes.som;

        this.scene.start('PreloadScene');
    }
}

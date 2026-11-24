// =====================================================
// PreloadScene.js — barra de carregamento e criação
// das texturas/animações usadas no jogo
// =====================================================
import { LARGURA, ALTURA } from '../config.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    preload() {
        // --- Barra de progresso ---
        const cx = LARGURA / 2, cy = ALTURA / 2;
        this.add.text(cx, cy - 50, 'A carregar...', { fontFamily: 'Arial', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
        this.add.rectangle(cx, cy, 404, 28).setStrokeStyle(2, 0xffffff);
        const barra = this.add.rectangle(cx - 200, cy, 0, 22, 0xffffff).setOrigin(0, 0.5);
        this.load.on('progress', (v) => { barra.width = 400 * v; });

        // --- Sons ---
        this.load.audio('collect', 'assets/sfx/collect.wav');
        this.load.audio('switch', 'assets/sfx/switch.wav');
        this.load.audio('alarm', 'assets/sfx/alarm.wav');
        this.load.audio('win', 'assets/sfx/win.wav');
        this.load.audio('click', 'assets/sfx/click.wav');
    }

    create() {
        this.criarTexturaDrone();
        this.criarTexturaCamara();
        this.criarTexturaFicheiro();
        this.criarTexturaNucleo();

        // Animação do drone (2 frames: hélices em posições diferentes)
        this.anims.create({
            key: 'drone-voar',
            frames: [{ key: 'drone', frame: 'f0' }, { key: 'drone', frame: 'f1' }],
            frameRate: 12,
            repeat: -1
        });

        this.scene.start('MenuScene');
    }

    // Spritesheet do drone desenhada por código (2 frames de 34x34).
    // Desenhada em tons claros para o tint da camuflagem funcionar bem.
    // NOTA: gráficos provisórios, a substituir por arte original.
    criarTexturaDrone() {
        const T = 34;
        const canvas = document.createElement('canvas');
        canvas.width = T * 2; canvas.height = T;
        const ctx = canvas.getContext('2d');

        for (let f = 0; f < 2; f++) {
            const ox = f * T, c = T / 2;
            // Braços
            ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ox + 6, 6); ctx.lineTo(ox + T - 6, T - 6);
            ctx.moveTo(ox + T - 6, 6); ctx.lineTo(ox + 6, T - 6);
            ctx.stroke();
            // Hélices (rodam entre frames)
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            for (const [hx, hy] of [[6, 6], [T - 6, 6], [6, T - 6], [T - 6, T - 6]]) {
                const a = f === 0 ? 0 : Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(ox + hx - Math.cos(a) * 5, hy - Math.sin(a) * 5);
                ctx.lineTo(ox + hx + Math.cos(a) * 5, hy + Math.sin(a) * 5);
                ctx.stroke();
            }
            // Corpo
            ctx.fillStyle = '#f2f2f2';
            ctx.beginPath(); ctx.arc(ox + c, c, 9, 0, Math.PI * 2); ctx.fill();
            // "Olho" (lente)
            ctx.fillStyle = '#2a2a2a';
            ctx.beginPath(); ctx.arc(ox + c, c, 3.5, 0, Math.PI * 2); ctx.fill();
        }

        const tex = this.textures.addCanvas('drone', canvas);
        tex.add('f0', 0, 0, 0, T, T);
        tex.add('f1', 0, T, 0, T, T);
    }

    // Câmara de vigilância (aponta para a direita; roda com o ângulo)
    criarTexturaCamara() {
        const canvas = document.createElement('canvas');
        canvas.width = 30; canvas.height = 20;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cfd3da'; ctx.fillRect(2, 4, 20, 12);
        ctx.fillStyle = '#8a8f99'; ctx.fillRect(22, 6, 6, 8);
        ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(8, 10, 3, 0, Math.PI * 2); ctx.fill();
        this.textures.addCanvas('camara', canvas);
    }

    // Ficheiro de dados a recolher
    criarTexturaFicheiro() {
        const canvas = document.createElement('canvas');
        canvas.width = 20; canvas.height = 24;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(1, 1, 18, 22);
        ctx.fillStyle = '#4fd1c5'; ctx.fillRect(4, 6, 12, 2); ctx.fillRect(4, 11, 12, 2); ctx.fillRect(4, 16, 8, 2);
        this.textures.addCanvas('ficheiro', canvas);
    }

    // Núcleo de dados (saída do nível)
    criarTexturaNucleo() {
        const canvas = document.createElement('canvas');
        canvas.width = 48; canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#4fd1c5'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(24, 24, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#4fd1c5'; ctx.beginPath(); ctx.arc(24, 24, 9, 0, Math.PI * 2); ctx.fill();
        this.textures.addCanvas('nucleo', canvas);
    }
}

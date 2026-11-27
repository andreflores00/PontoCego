// =====================================================
// PreloadScene.js — barra de carregamento e criação
// das texturas/animações usadas no jogo
// =====================================================
// Os gráficos são desenhados por código num canvas (originais,
// sem imagens de terceiros) e registados como texturas do Phaser.
import { LARGURA, ALTURA, FONTE, TEMA } from '../config.js';

// Tamanho de cada frame do drone (px) e n.º de frames da animação
const T_DRONE = 36;
const FRAMES_DRONE = 4;

export default class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }

    /** Mostra a barra de progresso e carrega os sons. */
    preload() {
        const cx = LARGURA / 2, cy = ALTURA / 2;
        this.cameras.main.setBackgroundColor(TEMA.fundo);
        this.add.text(cx, cy - 60, 'PONTO CEGO', {
            fontFamily: FONTE, fontSize: '40px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5);
        this.add.text(cx, cy - 22, 'A carregar...', {
            fontFamily: FONTE, fontSize: '18px', color: TEMA.textoSuave
        }).setOrigin(0.5);

        // Moldura e barra de progresso
        const moldura = this.add.graphics();
        moldura.lineStyle(2, TEMA.destaque, 1);
        moldura.strokeRoundedRect(cx - 202, cy + 6, 404, 22, 8);
        const barra = this.add.graphics();
        this.load.on('progress', (v) => {
            barra.clear();
            barra.fillStyle(TEMA.destaque, 1);
            barra.fillRoundedRect(cx - 198, cy + 10, Math.max(8, 396 * v), 14, 6);
        });

        // --- Sons ---
        this.load.audio('collect', 'assets/sfx/collect.wav');
        this.load.audio('switch', 'assets/sfx/switch.wav');
        this.load.audio('alarm', 'assets/sfx/alarm.wav');
        this.load.audio('win', 'assets/sfx/win.wav');
        this.load.audio('click', 'assets/sfx/click.wav');
        this.load.audio('porta', 'assets/sfx/porta.wav');
        this.load.audio('erro', 'assets/sfx/erro.wav');
    }

    /** Cria todas as texturas e animações e passa para o menu. */
    create() {
        this.criarTexturaDrone();
        this.criarTexturaCamara();
        this.criarTexturaFicheiro();
        this.criarTexturaNucleo();
        this.criarTexturaCoracao();

        // Animação do drone: as hélices rodam ao longo dos 4 frames
        this.anims.create({
            key: 'drone-voar',
            frames: Array.from({ length: FRAMES_DRONE }, (_, i) => ({ key: 'drone', frame: 'f' + i })),
            frameRate: 16,
            repeat: -1
        });

        this.scene.start('MenuScene');
    }

    /**
     * Cria um canvas, deixa desenhar nele e regista-o como textura.
     * @param {string} chave nome da textura
     * @param {number} w largura
     * @param {number} h altura
     * @param {(ctx:CanvasRenderingContext2D)=>void} desenhar função de desenho
     */
    novaTextura(chave, w, h, desenhar) {
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        desenhar(canvas.getContext('2d'));
        return this.textures.addCanvas(chave, canvas);
    }

    /**
     * Spritesheet do drone (4 frames lado a lado).
     * É desenhado em tons claros para o tint da camuflagem funcionar bem
     * (o tint multiplica a cor: branco fica exatamente com a cor escolhida).
     */
    criarTexturaDrone() {
        const T = T_DRONE, c = T / 2;
        const tex = this.novaTextura('drone', T * FRAMES_DRONE, T, (ctx) => {
            for (let f = 0; f < FRAMES_DRONE; f++) {
                const ox = f * T;
                const rotores = [[7, 7], [T - 7, 7], [7, T - 7], [T - 7, T - 7]];

                // Braços em X
                ctx.strokeStyle = '#cfd3da'; ctx.lineWidth = 4; ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(ox + 8, 8); ctx.lineTo(ox + T - 8, T - 8);
                ctx.moveTo(ox + T - 8, 8); ctx.lineTo(ox + 8, T - 8);
                ctx.stroke();

                for (const [hx, hy] of rotores) {
                    // Disco translúcido da hélice em movimento
                    ctx.fillStyle = 'rgba(255,255,255,0.25)';
                    ctx.beginPath(); ctx.arc(ox + hx, hy, 6.5, 0, Math.PI * 2); ctx.fill();
                    // Pá da hélice (o ângulo muda em cada frame)
                    const a = (f / FRAMES_DRONE) * Math.PI;
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(ox + hx - Math.cos(a) * 6, hy - Math.sin(a) * 6);
                    ctx.lineTo(ox + hx + Math.cos(a) * 6, hy + Math.sin(a) * 6);
                    ctx.stroke();
                    // Motor
                    ctx.fillStyle = '#e6e6e6';
                    ctx.beginPath(); ctx.arc(ox + hx, hy, 2, 0, Math.PI * 2); ctx.fill();
                }

                // Corpo
                ctx.fillStyle = '#f5f5f5';
                ctx.beginPath(); ctx.arc(ox + c, c, 9, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#bfc4cc'; ctx.lineWidth = 1.5; ctx.stroke();
                // Lente da câmara do drone
                ctx.fillStyle = '#20242c';
                ctx.beginPath(); ctx.arc(ox + c, c, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(ox + c - 1.2, c - 1.2, 1.2, 0, Math.PI * 2); ctx.fill();
            }
        });
        for (let f = 0; f < FRAMES_DRONE; f++) tex.add('f' + f, 0, f * T, 0, T, T);
    }

    /** Câmara de vigilância (a lente aponta para a direita; roda com o ângulo). */
    criarTexturaCamara() {
        this.novaTextura('camara', 34, 22, (ctx) => {
            ctx.fillStyle = '#2a2f3a'; ctx.fillRect(0, 7, 6, 8);              // suporte
            ctx.fillStyle = '#d9dde4';                                         // corpo
            ctx.fillRect(5, 3, 22, 16);
            ctx.fillStyle = '#8a93a3'; ctx.fillRect(26, 6, 7, 10);             // lente
            ctx.fillStyle = '#ff4d5e'; ctx.beginPath();                        // luz vermelha
            ctx.arc(11, 11, 3, 0, Math.PI * 2); ctx.fill();
        });
    }

    /** Ficheiro de dados a recolher. */
    criarTexturaFicheiro() {
        this.novaTextura('ficheiro', 22, 26, (ctx) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(2, 2); ctx.lineTo(14, 2); ctx.lineTo(20, 8); ctx.lineTo(20, 24); ctx.lineTo(2, 24);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#cfd3da'; ctx.beginPath();                        // canto dobrado
            ctx.moveTo(14, 2); ctx.lineTo(14, 8); ctx.lineTo(20, 8); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#4fd1c5';                                         // linhas de texto
            ctx.fillRect(5, 11, 12, 2); ctx.fillRect(5, 15, 12, 2); ctx.fillRect(5, 19, 8, 2);
        });
    }

    /** Núcleo de dados (a saída do nível). */
    criarTexturaNucleo() {
        this.novaTextura('nucleo', 52, 52, (ctx) => {
            ctx.strokeStyle = '#4fd1c5'; ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.beginPath(); ctx.arc(26, 26, 23, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(79,209,197,0.25)';
            ctx.beginPath(); ctx.arc(26, 26, 16, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4fd1c5';
            ctx.beginPath(); ctx.arc(26, 26, 8, 0, Math.PI * 2); ctx.fill();
        });
    }

    /** Coração das vidas (usado no HUD). */
    criarTexturaCoracao() {
        this.novaTextura('coracao', 24, 22, (ctx) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(12, 21);
            ctx.bezierCurveTo(-4, 10, 4, -3, 12, 5);
            ctx.bezierCurveTo(20, -3, 28, 10, 12, 21);
            ctx.fill();
        });
    }
}

// =====================================================
// UIScene.js — HUD (corre em paralelo com a GameScene)
// =====================================================
// Mostra pontos, ficheiros, nível, visibilidade, alarme, cor atual
// e vidas. Os valores vêm da GameScene através do registry ('hud').
import { LARGURA, HUD_ALTURA, VIDAS_INICIAIS, FONTE, TEMA } from '../config.js';
import BotaoEcraInteiro from '../ui/BotaoEcraInteiro.js';

// Posição e tamanho da barra de visibilidade
const BARRA_X = 470, BARRA_W = 170;

export default class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    /** Recebe o nome do nível e o total de ficheiros. */
    init(data) {
        this.nomeNivel = data.nomeNivel;
        this.totalFicheiros = data.totalFicheiros;
    }

    /** Desenha a barra do HUD e cria os textos/barras que mudam. */
    create() {
        const texto = { fontFamily: FONTE, fontSize: '17px', color: TEMA.texto };
        const suave = { fontFamily: FONTE, fontSize: '13px', color: TEMA.textoSuave };

        // Fundo do HUD com linha turquesa em baixo
        const g = this.add.graphics();
        g.fillStyle(TEMA.fundo, 1).fillRect(0, 0, LARGURA, HUD_ALTURA);
        g.lineStyle(2, TEMA.destaque, 0.6).lineBetween(0, HUD_ALTURA - 1, LARGURA, HUD_ALTURA - 1);

        // Bloco 1: pontos e ficheiros
        this.add.text(16, 8, 'PONTOS', suave);
        this.tPontos = this.add.text(16, 24, '0', { ...texto, fontSize: '22px', fontStyle: 'bold' });
        this.add.text(120, 8, 'FICHEIROS', suave);
        this.tFicheiros = this.add.text(120, 24, '', { ...texto, fontSize: '22px', fontStyle: 'bold' });

        // Bloco 2: nome do nível
        this.add.text(225, 8, 'NÍVEL', suave);
        this.add.text(225, 26, this.nomeNivel, { ...texto, fontSize: '16px' });

        // Bloco 3: visibilidade (ΔE em relação ao limiar) e alarme
        this.add.text(BARRA_X, 6, 'VISIBILIDADE', suave);
        this.tVis = this.add.text(BARRA_X + BARRA_W, 6, '', { ...suave, color: TEMA.texto }).setOrigin(1, 0);
        g.fillStyle(TEMA.painel, 1).fillRoundedRect(BARRA_X, 24, BARRA_W, 10, 5);
        this.barraVis = this.add.graphics();
        g.lineStyle(2, 0xffffff, 0.8).lineBetween(BARRA_X + BARRA_W / 2, 21, BARRA_X + BARRA_W / 2, 37); // limiar (50%)

        this.add.text(BARRA_X, 39, 'ALARME', { ...suave, fontSize: '11px' });
        g.fillStyle(TEMA.painel, 1).fillRoundedRect(BARRA_X + 50, 42, BARRA_W - 50, 6, 3);
        this.barraSusp = this.add.graphics();

        // Bloco 4: cor atual da camuflagem
        this.add.text(668, 8, 'COR', suave);
        this.amostraCor = this.add.circle(682, 38, 11, 0xffffff).setStrokeStyle(2, 0xffffff);

        // Bloco 5: vidas
        this.coracoes = [];
        for (let i = 0; i < VIDAS_INICIAIS; i++) {
            this.coracoes.push(this.add.image(728 + i * 28, 30, 'coracao').setTint(TEMA.perigo));
        }

        // Pausa e ecrã inteiro
        this.criarBotaoPausa(LARGURA - 86, 30);
        new BotaoEcraInteiro(this, LARGURA - 36, 30);
    }

    /** Botão de pausa (duas barras); também funciona com a tecla P. */
    criarBotaoPausa(x, y) {
        const tam = 40;
        const c = this.add.container(x, y);
        const g = this.add.graphics();
        g.fillStyle(TEMA.painel, 0.9).fillRoundedRect(-tam / 2, -tam / 2, tam, tam, 10);
        g.lineStyle(2, TEMA.destaque, 1).strokeRoundedRect(-tam / 2, -tam / 2, tam, tam, 10);
        g.fillStyle(0xffffff, 1).fillRect(-7, -9, 5, 18).fillRect(2, -9, 5, 18);
        c.add(g).setSize(tam, tam).setInteractive({ useHandCursor: true });
        c.on('pointerup', () => this.pausar());
        this.input.keyboard.on('keydown-P', () => this.alternarPausa());
        this.input.keyboard.on('keydown-ESC', () => this.alternarPausa());
    }

    /** Tecla P/ESC: pausa se estiver a jogar, retoma se estiver em pausa. */
    alternarPausa() {
        if (this.scene.isActive('PauseScene')) {
            this.scene.stop('PauseScene');
            this.scene.resume('GameScene');
        } else {
            this.pausar();
        }
    }

    /** Pausa a GameScene e abre o menu de pausa. */
    pausar() {
        if (this.scene.isActive('PauseScene') || this.scene.isPaused('GameScene')) return;
        this.scene.pause('GameScene');
        this.scene.launch('PauseScene');
        this.scene.bringToTop('PauseScene');
    }

    /** Atualiza os valores em cada frame. */
    update() {
        const h = this.registry.get('hud');
        if (!h) return;
        this.tPontos.setText(String(h.pontos));
        this.tFicheiros.setText(`${h.ficheiros}/${this.totalFicheiros}`);

        // Barra de visibilidade: turquesa se abaixo do limiar, vermelha se acima
        this.barraVis.clear();
        this.barraVis.fillStyle(h.visibilidade > 0.5 ? TEMA.perigo : TEMA.destaque, 1);
        this.barraVis.fillRoundedRect(BARRA_X, 24, Math.max(10, BARRA_W * h.visibilidade), 10, 5);
        this.tVis.setText(Math.round(h.visibilidade * 100) + '%');

        // Barra do alarme
        this.barraSusp.clear();
        if (h.suspeita > 0.01) {
            this.barraSusp.fillStyle(TEMA.perigo, 1);
            this.barraSusp.fillRoundedRect(BARRA_X + 50, 42, Math.max(6, (BARRA_W - 50) * h.suspeita), 6, 3);
        }

        this.amostraCor.fillColor = h.cor;
        this.coracoes.forEach((c, i) => c.setAlpha(i < h.vidas ? 1 : 0.2));
    }
}

// =====================================================
// GameScene.js — cena principal do jogo
// =====================================================
import { TILE, HUD_ALTURA, CORES, LIMIAR_DIFICULDADE, PONTOS, VIDAS_INICIAIS, rgbParaHex } from '../config.js';
import { NIVEIS } from '../systems/LevelConfig.js';
import ColorSegmenter from '../systems/ColorSegmenter.js';
import Player from '../objects/Player.js';
import SecurityCamera from '../objects/SecurityCamera.js';
import TouchControls from '../ui/TouchControls.js';

// Tempo (ms) que uma câmara precisa de ver o drone para disparar o alarme
const TEMPO_ATE_ALARME = 600;

// Converte coordenadas de mosaicos para píxeis do mundo
const px = (t) => t * TILE;
const py = (t) => HUD_ALTURA + t * TILE;

export default class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.indiceNivel = data.nivel ?? 0;
        this.nivel = NIVEIS[this.indiceNivel];
        this.pontos = data.pontos ?? 0;
        this.vidas = data.vidas ?? VIDAS_INICIAIS;
        this.limiar = LIMIAR_DIFICULDADE[this.registry.get('dificuldade')] ?? LIMIAR_DIFICULDADE.normal;
        this.suspeita = 0;          // 0..1, enche enquanto uma câmara vê o drone
        this.detecoesNivel = 0;
        this.invulneravel = 0;      // ms de proteção depois de ser apanhado
        this.terminou = false;
    }

    create() {
        this.physics.world.setBounds(0, HUD_ALTURA, px(30), 15 * TILE);

        this.criarChao();
        this.criarParedes();
        this.criarFicheiros();
        this.criarNucleo();

        const ini = this.nivel.inicio;
        this.inicio = { x: px(ini.x) + TILE / 2, y: py(ini.y) + TILE / 2 };
        this.player = new Player(this, this.inicio.x, this.inicio.y, this.nivel.camuflagemInicial);
        this.physics.add.collider(this.player, this.paredes);

        // Câmaras (as coordenadas do nível estão em mosaicos)
        this.cameras_ = this.nivel.cameras.map((c) =>
            new SecurityCamera(this, { ...c, x: px(c.x), y: py(c.y) }, this.retangulosParedes));

        // Gráficos da "bounding box" da segmentação
        this.caixa = this.add.graphics().setDepth(15);
        this.textoDeltaE = this.add.text(0, 0, '', {
            fontFamily: 'Arial', fontSize: '13px', color: '#ff6b6b', backgroundColor: '#000000aa'
        }).setDepth(16).setVisible(false);

        this.criarControlos();

        // HUD numa cena paralela
        this.tempoInicio = this.time.now;
        this.scene.launch('UIScene', { nomeNivel: this.nivel.nome, totalFicheiros: this.totalFicheiros });
        this.atualizarHUD(0);

        this.events.once('shutdown', () => this.scene.stop('UIScene'));
    }

    // ---------- Construção do nível ----------

    // Desenha o chão num canvas com pequenas variações por píxel (textura).
    // Este canvas é a "imagem" que as câmaras analisam.
    criarChao() {
        const w = px(30), h = 15 * TILE;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        for (const r of this.nivel.chao) {
            const c = CORES[r.cor];
            ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
            ctx.fillRect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE);
        }

        // Ruído leve (±6) para o chão não ser uma cor perfeitamente lisa
        const img = ctx.getImageData(0, 0, w, h);
        for (let i = 0; i < img.data.length; i += 4) {
            const n = Phaser.Math.Between(-6, 6);
            img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
        }
        ctx.putImageData(img, 0, 0);

        // Linhas da grelha dos mosaicos (só visual)
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        for (let x = 0; x <= w; x += TILE) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
        for (let y = 0; y <= h; y += TILE) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }

        // O segmentador lê os píxeis desta imagem
        this.segmentador = new ColorSegmenter(ctx.getImageData(0, 0, w, h), HUD_ALTURA);

        const chave = 'chao' + this.indiceNivel;
        if (this.textures.exists(chave)) this.textures.remove(chave);
        this.textures.addCanvas(chave, canvas);
        this.add.image(0, HUD_ALTURA, chave).setOrigin(0, 0);
    }

    criarParedes() {
        this.paredes = this.physics.add.staticGroup();
        this.retangulosParedes = [];
        for (const p of this.nivel.paredes) {
            const r = this.add.rectangle(px(p.x), py(p.y), p.w * TILE, p.h * TILE, 0x3b3e48)
                .setOrigin(0, 0).setStrokeStyle(1, 0x5a5e6b).setDepth(8);
            this.paredes.add(r);
            this.retangulosParedes.push(new Phaser.Geom.Rectangle(px(p.x), py(p.y), p.w * TILE, p.h * TILE));
        }
    }

    // Aleatoriedade controlada: sorteia N posições das candidatas do nível
    criarFicheiros() {
        this.ficheiros = this.physics.add.staticGroup();
        const posicoes = Phaser.Utils.Array.Shuffle([...this.nivel.ficheirosPossiveis])
            .slice(0, this.nivel.numFicheiros);
        for (const p of posicoes) {
            const f = this.ficheiros.create(px(p.x) + TILE / 2, py(p.y) + TILE / 2, 'ficheiro');
            f.setDepth(6);
            this.tweens.add({ targets: f, y: f.y - 4, duration: 600, yoyo: true, repeat: -1 });
        }
        this.totalFicheiros = posicoes.length;
        this.ficheirosApanhados = 0;
    }

    criarNucleo() {
        const n = this.nivel.nucleo;
        this.nucleo = this.physics.add.staticImage(px(n.x) + TILE / 2, py(n.y) + TILE / 2, 'nucleo').setDepth(6);
        this.tweens.add({ targets: this.nucleo, angle: 360, duration: 4000, repeat: -1 });
    }

    criarControlos() {
        this.cursores = this.input.keyboard.createCursorKeys();
        this.teclas = this.input.keyboard.addKeys('W,A,S,D,ONE,TWO,THREE');
        this.teclas.ONE.on('down', () => this.mudarCor(0));
        this.teclas.TWO.on('down', () => this.mudarCor(1));
        this.teclas.THREE.on('down', () => this.mudarCor(2));

        // Controlos táteis só em dispositivos com toque
        this.toque = this.sys.game.device.input.touch ? new TouchControls(this, (i) => this.mudarCor(i)) : null;

        this.physics.add.overlap(this.player, this.ficheiros, (pl, f) => this.apanharFicheiro(f));
        this.physics.add.overlap(this.player, this.nucleo, () => this.chegarAoNucleo());
    }

    // ---------- Ações ----------

    mudarCor(i) {
        if (this.player.setCamuflagem(i)) this.sound.play('switch');
    }

    apanharFicheiro(f) {
        f.destroy();
        this.ficheirosApanhados++;
        this.pontos += PONTOS.ficheiro;
        this.sound.play('collect');
    }

    // Drone detetado: perde uma vida e volta ao início do nível
    serDetetado() {
        this.sound.play('alarm');
        this.cameras.main.shake(250, 0.01);
        this.cameras.main.flash(200, 255, 40, 40);
        this.vidas--;
        this.detecoesNivel++;
        this.pontos = Math.max(0, this.pontos + PONTOS.detecao);
        this.suspeita = 0;

        if (this.vidas <= 0) {
            this.terminarJogo(false);
            return;
        }
        this.player.setPosition(this.inicio.x, this.inicio.y);
        this.invulneravel = 1200;
    }

    chegarAoNucleo() {
        if (this.terminou) return;
        this.terminou = true;
        this.sound.play('win');

        // Bónus de tempo e bónus por nível sem deteções
        const segundos = (this.time.now - this.tempoInicio) / 1000;
        this.pontos += Math.max(0, Math.round((PONTOS.bonusTempoMax - segundos) * 2));
        if (this.detecoesNivel === 0) this.pontos += PONTOS.semDetecoes;

        const proximo = this.indiceNivel + 1;
        this.time.delayedCall(600, () => {
            if (proximo < NIVEIS.length) {
                this.scene.restart({ nivel: proximo, pontos: this.pontos, vidas: this.vidas });
            } else {
                this.terminarJogo(true);
            }
        });
    }

    terminarJogo(venceu) {
        this.terminou = true;
        this.scene.start('GameOverScene', { pontos: this.pontos, venceu });
    }

    // ---------- Ciclo do jogo ----------

    update(tempo, delta) {
        if (this.terminou) return;
        this.lerMovimento();

        // Conceito 1: quanto o drone se destaca do fundo neste momento?
        const analise = this.segmentador.analisar(this.player.cor, this.player.x, this.player.y);
        const destaca = analise.deltaE > this.limiar;

        // Cada câmara verifica se o drone está no cone e em linha de vista
        let alguemVe = false;
        for (const cam of this.cameras_) {
            cam.atualizarAngulo(tempo);
            const ve = cam.veOPonto(this.player.x, this.player.y) && destaca;
            cam.aDetetar = ve;
            if (ve) alguemVe = true;
            cam.desenhar();
        }

        // A suspeita enche enquanto for visto e baixa quando não é
        if (this.invulneravel > 0) {
            this.invulneravel -= delta;
            this.player.setAlpha(Math.floor(tempo / 100) % 2 ? 0.4 : 1);
        } else {
            this.player.setAlpha(1);
            this.suspeita += (alguemVe ? delta : -delta * 0.5) / TEMPO_ATE_ALARME;
            this.suspeita = Phaser.Math.Clamp(this.suspeita, 0, 1);
            if (this.suspeita >= 1) this.serDetetado();
        }

        this.desenharSegmentacao(alguemVe, analise.deltaE);
        this.atualizarHUD(analise.deltaE);
    }

    lerMovimento() {
        let dx = 0, dy = 0;
        if (this.cursores.left.isDown || this.teclas.A.isDown) dx -= 1;
        if (this.cursores.right.isDown || this.teclas.D.isDown) dx += 1;
        if (this.cursores.up.isDown || this.teclas.W.isDown) dy -= 1;
        if (this.cursores.down.isDown || this.teclas.S.isDown) dy += 1;
        if (this.toque && (this.toque.vetor.x || this.toque.vetor.y)) {
            dx = this.toque.vetor.x; dy = this.toque.vetor.y;
        }
        this.player.mover(dx, dy);
    }

    // Mostra a bounding box que a câmara "vê" quando segmenta o drone
    desenharSegmentacao(visto, dE) {
        this.caixa.clear();
        if (!visto) { this.textoDeltaE.setVisible(false); return; }
        const t = 22;
        this.caixa.lineStyle(2, 0xff3b3b, 1);
        this.caixa.strokeRect(this.player.x - t, this.player.y - t, t * 2, t * 2);
        this.textoDeltaE.setText(`ΔE ${dE.toFixed(1)}`)
            .setPosition(this.player.x - t, this.player.y - t - 18).setVisible(true);
    }

    atualizarHUD(dE) {
        // Visibilidade 0–100%: ΔE igual ao limiar = 50%
        const visibilidade = Phaser.Math.Clamp(dE / (this.limiar * 2), 0, 1);
        this.registry.set('hud', {
            pontos: this.pontos,
            vidas: this.vidas,
            ficheiros: this.ficheirosApanhados,
            visibilidade,
            suspeita: this.suspeita,
            cor: rgbParaHex(this.player.cor)
        });
    }
}

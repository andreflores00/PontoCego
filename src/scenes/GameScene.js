// =====================================================
// GameScene.js — cena principal do jogo
// =====================================================
import { TILE, HUD_ALTURA, LARGURA, CORES, CAMUFLAGENS, LIMIAR_DIFICULDADE, PONTOS, VIDAS_INICIAIS, FONTE, TEMA, rgbParaHex } from '../config.js';
import { NIVEIS } from '../systems/LevelConfig.js';
import ColorSegmenter from '../systems/ColorSegmenter.js';
import Player from '../objects/Player.js';
import SecurityCamera from '../objects/SecurityCamera.js';
import TouchControls from '../ui/TouchControls.js';
import ScannerDoor from '../objects/ScannerDoor.js';
import ScannerPanel from '../ui/ScannerPanel.js';
import GestureRecognizer from '../systems/GestureRecognizer.js';

// Formas que as portas podem pedir (uma é sorteada por porta)
const FORMAS_PORTA = ['triangulo', 'quadrado', 'circulo'];

// Tempo (ms) que uma câmara precisa de ver o drone para disparar o alarme.
// Aumentar este valor torna o jogo mais fácil.
const TEMPO_ATE_ALARME = 800;

// Converte coordenadas de mosaicos para píxeis do mundo
const px = (t) => t * TILE;
const py = (t) => HUD_ALTURA + t * TILE;

export default class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    /** Recebe o nível, a pontuação e as vidas (vindos do menu ou do nível anterior). */
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

    /** Constrói o nível: chão, paredes, portas, ficheiros, núcleo, drone e câmaras. */
    create() {
        this.physics.world.setBounds(0, HUD_ALTURA, px(30), 15 * TILE);

        this.criarChao();
        this.criarZonas();
        this.criarParedes();
        this.criarPortas();
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
            fontFamily: FONTE, fontSize: '13px', fontStyle: 'bold', color: TEMA.perigoCss, backgroundColor: '#000000aa', padding: { x: 4, y: 1 }
        }).setDepth(16).setVisible(false);

        this.criarControlos();

        // Painel do scanner das portas (conceito 2)
        this.reconhecedor = new GestureRecognizer();
        this.painel = new ScannerPanel(this, this.reconhecedor, (porta, sucesso) => this.tentativaPorta(porta, sucesso));

        // HUD numa cena paralela
        this.tempoInicio = this.time.now;
        this.scene.launch('UIScene', { nomeNivel: this.nivel.nome, totalFicheiros: this.totalFicheiros });
        this.atualizarHUD(0);

        this.cameras.main.fadeIn(400, 11, 13, 18);
        this.mostrarIntroNivel();

        // Ao sair desta cena fecha também o HUD e a pausa
        this.events.once('shutdown', () => { this.scene.stop('UIScene'); this.scene.stop('PauseScene'); });
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

    /** Cria as paredes e os stands (colisão + retângulos que bloqueiam a visão das câmaras). */
    criarParedes() {
        this.paredes = this.physics.add.staticGroup();
        this.retangulosParedes = [];
        for (const p of this.nivel.paredes) this.criarObstaculo(p, 0x3b3e48, 0x5a5e6b);
        for (const s of this.nivel.stands || []) this.criarObstaculo(s, 0x6b5b95, 0xb8a9e0);
    }

    /**
     * Cria um obstáculo retangular (parede ou stand).
     * @param {{x:number,y:number,w:number,h:number}} o posição e tamanho em mosaicos
     * @param {number} cor cor de preenchimento
     * @param {number} contorno cor do contorno
     */
    criarObstaculo(o, cor, contorno) {
        const r = this.add.rectangle(px(o.x), py(o.y), o.w * TILE, o.h * TILE, cor)
            .setOrigin(0, 0).setStrokeStyle(1, contorno).setDepth(8);
        this.paredes.add(r);
        this.retangulosParedes.push(new Phaser.Geom.Rectangle(px(o.x), py(o.y), o.w * TILE, o.h * TILE));
    }

    /**
     * Escreve os nomes das zonas no chão.
     * São objetos de texto por cima da imagem, por isso não alteram
     * os píxeis que as câmaras analisam.
     */
    criarZonas() {
        for (const z of this.nivel.zonas || []) {
            this.add.text(px(z.x), py(z.y), z.texto, {
                fontFamily: FONTE, fontSize: '14px', color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0.55).setDepth(4);
        }
    }

    /** Cria as portas com scanner; cada uma pede uma forma sorteada. */
    criarPortas() {
        this.portas = (this.nivel.portas || []).map((def) =>
            new ScannerDoor(this, def, Phaser.Utils.Array.GetRandom(FORMAS_PORTA), this.paredes, this.retangulosParedes));
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

    /** Cria o núcleo de dados (a saída do nível). */
    criarNucleo() {
        const n = this.nivel.nucleo;
        this.nucleo = this.physics.add.staticImage(px(n.x) + TILE / 2, py(n.y) + TILE / 2, 'nucleo').setDepth(6);
        this.tweens.add({ targets: this.nucleo, angle: 360, duration: 4000, repeat: -1 });
    }

    /** Teclado (WASD/setas, 1-3), controlos táteis e sobreposições (ficheiros e núcleo). */
    criarControlos() {
        this.cursores = this.input.keyboard.createCursorKeys();
        this.teclas = this.input.keyboard.addKeys('W,A,S,D,ONE,TWO,THREE');
        this.teclas.ONE.on('down', () => this.mudarCor(0));
        this.teclas.TWO.on('down', () => this.mudarCor(1));
        this.teclas.THREE.on('down', () => this.mudarCor(2));

        // Controlos táteis só em dispositivos com toque
        // O joystick ignora toques dentro da área de desenho do scanner
        this.toque = this.sys.game.device.input.touch
            ? new TouchControls(this, CAMUFLAGENS, (i) => this.mudarCor(i), (p) => !(this.painel && this.painel.aberto && this.painel.dentroDaArea(p)))
            : null;
        if (this.toque) this.toque.marcarAtivo(this.player.indiceCamuflagem);

        this.physics.add.overlap(this.player, this.ficheiros, (pl, f) => this.apanharFicheiro(f));
        this.physics.add.overlap(this.player, this.nucleo, () => this.chegarAoNucleo());
    }

    // ---------- Ações ----------

    /** Muda a cor da camuflagem (tecla ou botão tátil). */
    mudarCor(i) {
        if (this.player.setCamuflagem(i)) {
            this.sound.play('switch');
            if (this.toque) this.toque.marcarAtivo(i);
            // Pequeno "pulso" visual no drone
            this.tweens.add({ targets: this.player, scale: 1.25, duration: 90, yoyo: true });
        }
    }

    /**
     * Mostra um texto que sobe e desaparece (ex.: "+100").
     * @param {number} x posição
     * @param {number} y posição
     * @param {string} texto texto a mostrar
     * @param {string} cor cor CSS
     */
    textoFlutuante(x, y, texto, cor) {
        const t = this.add.text(x, y, texto, {
            fontFamily: FONTE, fontSize: '18px', fontStyle: 'bold', color: cor
        }).setOrigin(0.5).setDepth(50).setShadow(0, 2, '#000000', 4);
        this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
    }

    /** Faixa com o nome do nível no início (desaparece sozinha). */
    mostrarIntroNivel() {
        const y = HUD_ALTURA + 60;
        const faixa = this.add.rectangle(LARGURA / 2, y, LARGURA, 70, 0x000000, 0.7).setDepth(150);
        const titulo = this.add.text(LARGURA / 2, y - 10, this.nivel.nome, {
            fontFamily: FONTE, fontSize: '28px', fontStyle: 'bold', color: TEMA.texto
        }).setOrigin(0.5).setDepth(151);
        const sub = this.add.text(LARGURA / 2, y + 20, 'Apanha os ficheiros e chega ao núcleo sem seres visto', {
            fontFamily: FONTE, fontSize: '15px', color: TEMA.destaqueCss
        }).setOrigin(0.5).setDepth(151);
        this.tweens.add({ targets: [faixa, titulo, sub], alpha: 0, delay: 2200, duration: 600,
            onComplete: () => { faixa.destroy(); titulo.destroy(); sub.destroy(); } });
    }

    /** O drone apanhou um ficheiro: soma pontos. */
    apanharFicheiro(f) {
        this.textoFlutuante(f.x, f.y - 10, '+' + PONTOS.ficheiro, TEMA.destaqueCss);
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

    /** Resultado de uma tentativa no scanner: abre a porta se o padrão estiver certo. */
    tentativaPorta(porta, sucesso) {
        if (sucesso) {
            porta.abrir();
            this.sound.play('porta');
        } else {
            this.sound.play('erro');
        }
    }

    /** O drone chegou ao núcleo: calcula os bónus e passa ao nível seguinte (ou ganha). */
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

    /** Vai para o ecrã de resultados. */
    terminarJogo(venceu) {
        this.terminou = true;
        this.scene.start('GameOverScene', { pontos: this.pontos, venceu });
    }

    // ---------- Ciclo do jogo ----------

    /** Ciclo principal: movimento, scanner, análise de cor, câmaras e alarme. */
    update(tempo, delta) {
        if (this.terminou) return;
        this.lerMovimento();

        // Abre o painel do scanner quando o drone está perto de uma porta fechada
        const portaPerto = this.portas.find((p) => p.jogadorPerto(this.player));
        if (portaPerto) this.painel.abrir(portaPerto);
        else if (this.painel.aberto) this.painel.fechar();

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
            // Enquanto o jogador desenha no scanner, o alarme não sobe (jogo mais simples)
            const visto = alguemVe && !this.painel.aberto;
            this.suspeita += (visto ? delta : -delta * 0.5) / TEMPO_ATE_ALARME;
            this.suspeita = Phaser.Math.Clamp(this.suspeita, 0, 1);
            if (this.suspeita >= 1) this.serDetetado();
        }

        this.desenharSegmentacao(alguemVe, analise.deltaE);
        this.atualizarHUD(analise.deltaE);
    }

    /** Lê o teclado ou o joystick e move o drone. */
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

    /** Envia os valores do HUD para a UIScene (através do registry). */
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

// =====================================================
// ScannerPanel.js — painel onde o jogador desenha o padrão
// =====================================================
// Aparece quando o drone está perto de uma porta fechada.
// À esquerda mostra o modelo pedido; à direita há uma área onde
// se desenha com o rato ou com o dedo. Ao largar, o traço é
// enviado ao GestureRecognizer e o resultado aparece no ecrã.
import { LARGURA, ALTURA, FONTE, TEMA } from '../config.js';
import ScannerDoor from '../objects/ScannerDoor.js';
import { NOMES_FORMAS } from '../systems/GestureRecognizer.js';

// Semelhança mínima para a porta abrir (0.75 = 75%). Mudar aqui para facilitar/dificultar.
export const LIMIAR_PADRAO = 0.75;

// Tamanho e posição do painel
const PW = 440, PH = 250;
const PX = LARGURA / 2 - PW / 2, PY = ALTURA - PH - 20;
// Área de desenho (dentro do painel, à direita)
const AREA = { x: PX + 200, y: PY + 40, w: 220, h: 190 };

export default class ScannerPanel {
    /**
     * @param {Phaser.Scene} scene
     * @param {import('../systems/GestureRecognizer.js').default} reconhecedor
     * @param {(porta:ScannerDoor, sucesso:boolean)=>void} aoTerminar chamado após cada tentativa
     */
    constructor(scene, reconhecedor, aoTerminar) {
        this.scene = scene;
        this.reconhecedor = reconhecedor;
        this.aoTerminar = aoTerminar;
        this.porta = null;
        this.pontos = [];
        this.aDesenhar = false;

        // Elementos gráficos (todos num contentor para mostrar/esconder de uma vez)
        this.contentor = scene.add.container(0, 0).setDepth(200).setVisible(false);
        const fundo = scene.add.graphics();
        fundo.fillStyle(TEMA.fundo, 0.94).fillRoundedRect(PX, PY, PW, PH, 16);
        fundo.lineStyle(2, TEMA.aviso, 1).strokeRoundedRect(PX, PY, PW, PH, 16);
        const titulo = scene.add.text(PX + 16, PY + 10, 'Scanner da porta', { fontFamily: FONTE, fontSize: '18px', fontStyle: 'bold', color: TEMA.avisoCss });
        const tModelo = scene.add.text(PX + 20, PY + 42, 'Modelo', { fontFamily: FONTE, fontSize: '14px', color: TEMA.textoSuave });
        const caixaModelo = scene.add.rectangle(PX + 20, PY + 62, 160, 130).setOrigin(0, 0).setStrokeStyle(1, 0x5a5e6b);
        const caixaDesenho = scene.add.rectangle(AREA.x, AREA.y, AREA.w, AREA.h, 0x1b1d24).setOrigin(0, 0).setStrokeStyle(1, 0xffffff);
        this.dicaDesenho = scene.add.text(AREA.x + AREA.w / 2, AREA.y + AREA.h / 2, 'Desenha aqui', {
            fontFamily: FONTE, fontSize: '16px', color: '#5a5e6b'
        }).setOrigin(0.5);
        this.gModelo = scene.add.graphics();
        this.gTraco = scene.add.graphics();
        this.tResultado = scene.add.text(PX + 20, PY + 205, '', { fontFamily: FONTE, fontSize: '15px', color: '#ffffff', wordWrap: { width: 170 } });

        this.contentor.add([fundo, titulo, tModelo, caixaModelo, caixaDesenho, this.dicaDesenho, this.gModelo, this.gTraco, this.tResultado]);

        // Eventos do rato/dedo (só contam dentro da área de desenho)
        scene.input.on('pointerdown', (p) => this.comecarTraco(p));
        scene.input.on('pointermove', (p) => this.continuarTraco(p));
        scene.input.on('pointerup', () => this.terminarTraco());
    }

    /** Verdadeiro se o painel está aberto. */
    get aberto() {
        return this.porta !== null;
    }

    /** Abre o painel para uma porta. */
    abrir(porta) {
        if (this.porta === porta) return;
        this.porta = porta;
        this.limparTraco();
        this.tResultado.setText('Desenha a forma do modelo num só traço.').setColor('#ffffff');
        this.gModelo.clear();
        ScannerDoor.desenharForma(this.gModelo, porta.forma, PX + 100, PY + 127, 45, 0xffc857, 4);
        this.contentor.setVisible(true);
    }

    /** Fecha o painel. */
    fechar() {
        this.porta = null;
        this.aDesenhar = false;
        this.contentor.setVisible(false);
    }

    /** Verdadeiro se o ponteiro está dentro da área de desenho. */
    dentroDaArea(p) {
        return p.x >= AREA.x && p.x <= AREA.x + AREA.w && p.y >= AREA.y && p.y <= AREA.y + AREA.h;
    }

    /** Apaga o traço desenhado. */
    limparTraco() {
        this.pontos = [];
        this.gTraco.clear();
        this.dicaDesenho.setVisible(true);
    }

    /** Começa um traço novo (rato/dedo pressionado dentro da área). */
    comecarTraco(p) {
        if (!this.aberto || !this.dentroDaArea(p)) return;
        this.limparTraco();
        this.dicaDesenho.setVisible(false);
        this.aDesenhar = true;
        this.pontos.push({ x: p.x, y: p.y });
    }

    /** Acrescenta pontos ao traço enquanto o rato/dedo se move. */
    continuarTraco(p) {
        if (!this.aDesenhar || !this.dentroDaArea(p)) return;
        const ultimo = this.pontos[this.pontos.length - 1];
        this.pontos.push({ x: p.x, y: p.y });
        this.gTraco.lineStyle(4, 0x4fd1c5, 1);
        this.gTraco.lineBetween(ultimo.x, ultimo.y, p.x, p.y);
    }

    /** Ao largar: reconhece o traço e diz se a porta abre. */
    terminarTraco() {
        if (!this.aDesenhar) return;
        this.aDesenhar = false;

        const r = this.reconhecedor.reconhecer(this.pontos);
        const pct = Math.round(r.semelhanca * 100);
        const sucesso = r.nome === this.porta.forma && r.semelhanca >= LIMIAR_PADRAO;

        if (r.nome === null) {
            this.tResultado.setText('Traço demasiado curto. Tenta outra vez.').setColor('#ff6b6b');
        } else if (sucesso) {
            this.tResultado.setText(`${NOMES_FORMAS[r.nome]} · ${pct}%\nAcesso autorizado!`).setColor('#4fd1c5');
        } else {
            this.tResultado.setText(`${NOMES_FORMAS[r.nome]} · ${pct}%\nNão corresponde. Tenta outra vez.`).setColor('#ff6b6b');
        }

        const porta = this.porta;
        this.aoTerminar(porta, sucesso);
        if (sucesso) this.scene.time.delayedCall(700, () => { if (this.porta === porta) this.fechar(); });
    }
}

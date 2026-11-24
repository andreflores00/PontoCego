// =====================================================
// SecurityCamera.js — câmara de vigilância com visão
// =====================================================
// Cada câmara:
//  1) roda (varrimento) entre dois ângulos;
//  2) calcula o seu cone de visão por raycasting: os raios param
//     na primeira parede que encontram;
//  3) se o drone estiver no cone e em linha de vista, usa o
//     ColorSegmenter para decidir se o consegue segmentar do fundo.

const NUM_RAIOS = 40;

export default class SecurityCamera {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} def definição vinda do LevelConfig (já em píxeis)
     * @param {Phaser.Geom.Rectangle[]} paredes retângulos que bloqueiam a visão
     */
    constructor(scene, def, paredes) {
        this.scene = scene;
        this.x = def.x;
        this.y = def.y;
        this.anguloBase = Phaser.Math.DegToRad(def.angulo);
        this.varrimento = Phaser.Math.DegToRad(def.varrimento);
        this.velocidade = Phaser.Math.DegToRad(def.velocidade);
        this.campo = Phaser.Math.DegToRad(def.campo);
        this.alcance = def.alcance;
        this.paredes = paredes;

        // Fase aleatória para as câmaras não rodarem todas em sincronia
        this.fase = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.angulo = this.anguloBase;

        this.cone = scene.add.graphics().setDepth(5);
        this.sprite = scene.add.image(this.x, this.y, 'camara').setDepth(12);

        this.linha = new Phaser.Geom.Line();
        this.aDetetar = false;
    }

    // Atualiza o ângulo da câmara (movimento sinusoidal de varrimento)
    atualizarAngulo(tempo) {
        if (this.varrimento > 0 && this.velocidade > 0) {
            const omega = this.velocidade / this.varrimento;
            this.angulo = this.anguloBase + Math.sin(tempo / 1000 * omega + this.fase) * this.varrimento;
        }
        this.sprite.setRotation(this.angulo);
    }

    // Lança um raio e devolve o ponto onde ele pára (parede ou alcance)
    lancarRaio(angulo) {
        const fimX = this.x + Math.cos(angulo) * this.alcance;
        const fimY = this.y + Math.sin(angulo) * this.alcance;
        this.linha.setTo(this.x, this.y, fimX, fimY);

        let melhor = { x: fimX, y: fimY };
        let menorDist = this.alcance * this.alcance;
        for (const r of this.paredes) {
            const pts = Phaser.Geom.Intersects.GetLineToRectangle(this.linha, r);
            for (const p of pts) {
                const d = (p.x - this.x) ** 2 + (p.y - this.y) ** 2;
                if (d < menorDist) { menorDist = d; melhor = { x: p.x, y: p.y }; }
            }
        }
        return melhor;
    }

    // Verifica se o ponto (px, py) está dentro do cone e sem paredes pelo meio
    veOPonto(px, py) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, px, py);
        if (dist > this.alcance) return false;

        const angPonto = Phaser.Math.Angle.Between(this.x, this.y, px, py);
        const diff = Math.abs(Phaser.Math.Angle.Wrap(angPonto - this.angulo));
        if (diff > this.campo / 2) return false;

        this.linha.setTo(this.x, this.y, px, py);
        for (const r of this.paredes) {
            if (Phaser.Geom.Intersects.LineToRectangle(this.linha, r)) return false;
        }
        return true;
    }

    // Desenha o cone de visão (vermelho se estiver a detetar o drone)
    desenhar() {
        const pontos = [{ x: this.x, y: this.y }];
        const inicio = this.angulo - this.campo / 2;
        for (let i = 0; i <= NUM_RAIOS; i++) {
            pontos.push(this.lancarRaio(inicio + (this.campo * i) / NUM_RAIOS));
        }
        this.cone.clear();
        this.cone.fillStyle(this.aDetetar ? 0xff3b3b : 0xfff1a8, this.aDetetar ? 0.35 : 0.18);
        this.cone.fillPoints(pontos, true);
        this.cone.lineStyle(1, this.aDetetar ? 0xff3b3b : 0xfff1a8, 0.5);
        this.cone.strokePoints(pontos, true);
    }

    destruir() {
        this.cone.destroy();
        this.sprite.destroy();
    }
}

// =====================================================
// main.js — configuração do Phaser e registo das cenas
// =====================================================
import { LARGURA, ALTURA } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import InstructionsScene from './scenes/InstructionsScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import PauseScene from './scenes/PauseScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'jogo',
    width: LARGURA,
    height: ALTURA,
    backgroundColor: '#15161c',
    // Scale.FIT mantém a proporção 16:9 em desktop e em telemóvel
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    // Permite vários toques ao mesmo tempo (joystick + botões no telemóvel)
    input: { activePointers: 3 },
    scene: [BootScene, PreloadScene, MenuScene, InstructionsScene, OptionsScene, GameScene, UIScene, PauseScene, GameOverScene]
};

new Phaser.Game(config);

import Boot from './scenes/boot.js';
import Boot2 from './scenes/boot2.js';
import Boot3 from './scenes/boot3.js';
import End from './scenes/end.js';
import HowToPlay from './scenes/HowToPlay.js';
import LevelSelector from './scenes/LevelSelector.js';
import Level from './scenes/level.js';
import Level2 from './scenes/level2.js';
import Level3 from './scenes/level3.js';
import MenuScene from './scenes/MenuScene.js';
import Phaser from 'phaser';


/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 730,
    parent: 'juego',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    scene: [MenuScene,Boot, Level,HowToPlay, LevelSelector],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 420 },
            debug: false 
        }
    }
};

new Phaser.Game(config);

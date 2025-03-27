import Boot from './scenes/boot.js';
import Boot2 from './scenes/boot2.js';
import End from './scenes/end.js';
import Level from './scenes/level.js';
import Level2 from './scenes/level2.js';
import Phaser from 'phaser';

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
    type: Phaser.AUTO,
    width: 750,
    height: 530,
    parent: 'juego',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    scene: [Boot2,Level2, Boot , Level, , End],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 420 },
            debug: true 
        }
    }
};

new Phaser.Game(config);

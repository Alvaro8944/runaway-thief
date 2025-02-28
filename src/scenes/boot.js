import Phaser from 'phaser'

import player from '../../assets/players/player_sprite.png'

import Tileset from '../../assets/tiled/Tileset.png'
import MainScene from '../../assets/tiled/MainScene.json'

/**
 * Escena para la precarga de los assets que se usarán en el juego.
 * Esta escena se puede mejorar añadiendo una imagen del juego y una 
 * barra de progreso de carga de los assets
 * @see {@link https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/} como ejemplo
 * sobre cómo hacer una barra de progreso.
 */


export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'boot' });
  }

  preload() {
    this.load.image('tiles', Tileset)

    this.load.tilemapTiledJSON('map', MainScene)


    
    // Cargar spritesheet del jugador
    this.load.spritesheet('player', player, {
      frameWidth: 100,
      frameHeight: 100
    });

  }


  create() {
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 10
    });
    this.anims.create({
      key: "idle_jump",
      frames: [{ key: "player", frame: 3 }],
      frameRate: 10
    });
    this.anims.create({
      key: "jump",
      frames: [{ key: "player", frame: 2 }],
      frameRate: 10
    });
    this.anims.create({
      key: "crawl",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 10
    });
    // Iniciar la escena del juego (Level)
    this.scene.start('level');
  }
}

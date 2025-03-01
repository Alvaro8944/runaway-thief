import Phaser from 'phaser'

import player_run from '../../assets/players/main_character/Biker_run.png'
import player_jump from '../../assets/players/main_character/Biker_jump.png'
import player_idle from '../../assets/players/main_character/Biker_idle.png'

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
    this.load.spritesheet('player_idle', player_idle, {
      frameWidth: 48,
      frameHeight: 48
    });
  

     // Cargar spritesheet del jugador
     this.load.spritesheet('player_run', player_run, {
      frameWidth: 48,
      frameHeight: 48
    });
  


     // Cargar spritesheet del jugador
     this.load.spritesheet('player_jump', player_jump, {
      frameWidth: 48,
      frameHeight: 48
    });
  

  }
   

  create() {


    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 3}),
      frameRate: 10
    });
    this.anims.create({
      key: "idle_jump",
      frames: this.anims.generateFrameNumbers("player_jump", { start: 0, end: 3}),
      frameRate: 10
    });
    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player_jump", { start: 0, end: 3}),
      frameRate: 10
    });

    this.anims.create({
      key: "crawl",
      frames: [{ key: "player_jump", frame: 3 }],
      frameRate: 10
    });
    // Iniciar la escena del juego (Level)
    this.scene.start('level');
  }
}

import Phaser from 'phaser';

//PLAYER MOVE
import player_run from '../../assets/players/main_character/Biker_run.png';
import player_jump from '../../assets/players/main_character/Biker_jump.png';
import player_idle from '../../assets/players/main_character/Biker_idle.png';

//PLAYER SHOOT BODY
import player_run_shoot from '../../assets/players/main_character_shoot_body/Run1.png';
import player_jump_shoot from '../../assets/players/main_character_shoot_body/Jump1.png';
import player_idle_shoot from '../../assets/players/main_character_shoot_body/Idle1.png';

//ENEMY 1 IDLE
import enemy1_idle from '../../assets/Enemies/1/Idle.png';

//ENEMY 1 WALK
import enemy1_walk from '../../assets/Enemies/1/Walk.png';

//PLAYER SHOOT HAND
import hand3 from '../../assets/players/main_character_shoot_hands/3.png';

//WEAPON
import weapon from '../../assets/Guns/4_1.png';

//BULLET
import bullet from '../../assets/Bullets/5.png';

//SHOOT EFFECT
import effect from '../../assets/Shoot_effects/9_1.png';

// TILEMAP
import Tileset from '../../assets/tiled/Tileset.png';
import Tileset2 from '../../assets/tiled/Tileset2.png';
import MainScene from '../../assets/tiled/MainScene.json';
import ladder from '../../assets/tiled/Objects/Other/Ladder2.png';

/**
 * Escena para la precarga de los assets que se usarán en el juego.
 * Aquí también creamos todas las animaciones (player y enemy).
 */
export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'boot' });
  }

  preload() {
    // ---- TILEMAPS & TILESETS ----
    this.load.image('tiles', Tileset);
    this.load.image('tiles2', Tileset2);
    this.load.image('ladder2', ladder);
    this.load.tilemapTiledJSON('map', MainScene);

    // ---- ENEMY ----
    this.load.spritesheet('enemy1_idle', enemy1_idle, {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('enemy1_walk', enemy1_walk, {
      frameWidth: 48,
      frameHeight: 48
    });

    // ---- PLAYER ----
    this.load.spritesheet('player_idle', player_idle, {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_run', player_run, {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_jump', player_jump, {
      frameWidth: 48,
      frameHeight: 48
    });

    // ---- PLAYER SHOOT BODY ----
    this.load.spritesheet('player_run_shoot', player_run_shoot, {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_jump_shoot', player_jump_shoot, {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_idle_shoot', player_idle_shoot, {
      frameWidth: 48,
      frameHeight: 48
    });

    // ---- HAND, WEAPON, BULLET, EFFECT ----
    this.load.spritesheet('hand3', hand3, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('weapon', weapon, { frameWidth: 29, frameHeight: 11 });
    this.load.spritesheet('bullet', bullet, { frameWidth: 15, frameHeight: 4 });
    this.load.spritesheet('effect', effect, { frameWidth: 288, frameHeight: 48 });
  }

  create() {
    this.createPlayerAnimations();
    this.createEnemyAnimations();
    this.createWeaponAnimations();

    // Iniciar la escena del juego
    this.scene.start('level');
  }

  // ---------------------------------------------
  //         Animaciones de PLAYER
  // ---------------------------------------------
  createPlayerAnimations() {
    // Run
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    // Idle
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
      frameRate: 10
    });

    // Jump
    this.anims.create({
      key: 'idle_jump',
      frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
      frameRate: 10
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
      frameRate: 10
    });

    this.anims.create({
      key: 'crawl',
      frames: [{ key: 'player_jump', frame: 3 }],
      frameRate: 10
    });

    // ---- SHOOT BODY ----
    this.anims.create({
      key: 'run_shoot',
      frames: this.anims.generateFrameNumbers('player_run_shoot', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle_shoot',
      frames: this.anims.generateFrameNumbers('player_idle_shoot', { start: 0, end: 3 }),
      frameRate: 10
    });

    this.anims.create({
      key: 'jump_shoot',
      frames: this.anims.generateFrameNumbers('player_jump_shoot', { start: 0, end: 3 }),
      frameRate: 10
    });
  }

  // ---------------------------------------------
  //         Animaciones de ENEMY
  // ---------------------------------------------
  createEnemyAnimations() {
    this.anims.create({
      key: 'enemy1_idle',
      frames: this.anims.generateFrameNumbers('enemy1_idle', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy1_walk',
      frames: this.anims.generateFrameNumbers('enemy1_walk', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
  }

  // ---------------------------------------------
  //         Animaciones de armas / efectos
  // ---------------------------------------------
  createWeaponAnimations() {
    // Hand
    this.anims.create({
      key: 'hand3',
      frames: [{ key: 'hand3', frame: 0 }],
      frameRate: 10
    });

    // Weapon
    this.anims.create({
      key: 'weapon',
      frames: [{ key: 'weapon', frame: 0 }],
      frameRate: 10
    });

    // Bullet
    this.anims.create({
      key: 'bullet',
      frames: [{ key: 'bullet', frame: 0 }],
      frameRate: 10
    });

    // Effect
    this.anims.create({
      key: 'effect',
      frames: this.anims.generateFrameNumbers('effect', { start: 0, end: 5 }),
      frameRate: 10
    });
  }
}

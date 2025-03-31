import Phaser from 'phaser';
import * as AssetLoader from '../loaders/AssetLoader.js';
import * as AnimationCreator from '../loaders/AnimationCreator.js';


export default class Boot3 extends Phaser.Scene {
  constructor() {
    super({ key: 'boot3' });
  }

  init(data) {
    // Guardar los datos del jugador
    this.playerData = data;
  }

  preload() {
    AssetLoader.loadSoundAssets(this);
    AssetLoader.loadTilemapAssets(this);
    AssetLoader.loadPlayerSprites(this);
    AssetLoader.loadEnemySprites(this);
    AssetLoader.loadWeaponSprites(this);
  }

  create() {
    AnimationCreator.createAllAnimations(this);

    // Iniciar la escena del juego
    this.scene.start('level3');
  }
}
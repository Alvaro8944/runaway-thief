
import Phaser from 'phaser';
import * as AssetLoader from '../loaders/AssetLoader.js';
import * as AnimationCreator from '../loaders/AnimationCreator.js';

/**
 * Escena para la precarga de los assets que se usarán en el juego.
 * Aquí también creamos todas las animaciones (player y enemy).
 */
export default class Boot3 extends Phaser.Scene {
  constructor() {
    super({ key: 'boot3' });
  }

  preload() {
    // Cargar todos los assets utilizando el AssetLoader
    AssetLoader.loadSoundAssets(this);
    AssetLoader.loadTilemapAssets(this);
    AssetLoader.loadPlayerSprites(this);
    AssetLoader.loadEnemySprites(this);
    AssetLoader.loadWeaponSprites(this);
    AssetLoader.loadObjectSprites(this);
    AssetLoader.loadBackgroundSprites(this);
  }

  create() {
    // Crear todas las animaciones utilizando el AnimationCreator
    AnimationCreator.createAllAnimations(this);

    // Iniciar la escena del juego
    this.scene.start('level3');
  }
}

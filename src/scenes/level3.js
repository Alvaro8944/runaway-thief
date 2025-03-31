import Phaser from 'phaser';
import Player from '../player.js';
import Enemy2, { STATE2, PatrollingEnemy2 } from '../enemy2.js';

export default class Level3 extends Phaser.Scene {
  constructor() {
    super({ key: 'level3' });
  }

  init(data) {
    console.log('Level3: Iniciando con datos:', data);
    // Recibir datos del nivel anterior
    this.playerHealth = data.playerHealth || 100;
    this.playerScore = data.playerScore || 0;
  }

  create() {
    console.log('Level3: Creando nivel');
    // Crear el mapa y sus capas
    const map = this.make.tilemap({ key: 'map3' });
    const tileset = map.addTilesetImage('Tileset', 'tiles');
    const tileset3 = map.addTilesetImage('Tileset_lvl1', 'tiles3');

    // Crear las capas
    const layerSuelo = map.createLayer('Suelo', tileset);
    const layerFondo = map.createLayer('Fondo', tileset3);


    // Configurar colisiones con el suelo
    layerSuelo.setCollisionByProperty({ colision: true });


    layerSuelo.setCollisionByExclusion([-1], true);

    // Crear jugador y configurar su posición inicial
    this.player = new Player(this, 100, 100);
    this.player.health = this.playerHealth;
    this.player.score = this.playerScore;

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);


    // Posiciones iniciales
    this.player.setPosition(500, 600);

    // Configuración de los límites del mundo y la cámara
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Configurar la cámara
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(1);
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
    this.cameras.main.fadeIn(1000);

    // Configurar controles
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      cambiarWeapon:  Phaser.Input.Keyboard.KeyCodes.X
    });

    // Eventos de muerte
    this.events.on('playerDeath', () => {
      console.log('Game Over - Player died');
      this.scene.restart();
    });
  }

  update() {
    if (this.player) {
      
      // Actualizar al jugador
      this.player.update();
    }
  }
} 
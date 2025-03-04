import Phaser from 'phaser';
import Enemy from '../enemy1.js';
import Player from '../player.js';

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level' });
  }

  create() {
    // Cargar el mapa
    const map = this.make.tilemap({ key: 'map' });
    const tiles1 = map.addTilesetImage('tileset', 'tiles');
    const tiles2 = map.addTilesetImage('tileset2', 'tiles2');

    // Capas
    const layerSuelo = map.createLayer('Suelo', [tiles1, tiles2], 0, 0);
    const layerVegetacion = map.createLayer('Vegetacion', [tiles1, tiles2], 0, 0);

    // Activar colisiones en el suelo
    layerSuelo.setCollisionByExclusion([-1], true);

    // Crear capa de escaleras
    const escaleraLayer = map.getObjectLayer('Escalera');
    if (escaleraLayer) {
      this.ladders = this.physics.add.staticGroup();
      escaleraLayer.objects.forEach(obj => {
        if (obj.gid === 238) {
          this.ladders.create(obj.x, obj.y - 15, 'ladder2');
        }
      });
    }

    // Crear enemigo y jugador
    this.enemy1 = new Enemy(this, 0, 0);
    this.player = new Player(this, 0, 0);

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);
    this.physics.add.collider(this.enemy1, layerSuelo);

    // Posiciones iniciales
    this.player.setPosition(50, 700);
    this.enemy1.setPosition(650, 790);

    // Límites del mundo
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Cámara
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setLerp(1, 0);

    // Controles
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }
}

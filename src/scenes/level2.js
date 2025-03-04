import Phaser from 'phaser';
import Enemy from '../enemy1.js';
import Player from '../player.js';

export default class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: 'level2' });
  }

  create() {
    
    const map = this.make.tilemap({ key: 'map2' });
    const tiles1 = map.addTilesetImage('Tileset', 'tiles');
    const tiles2 = map.addTilesetImage('Tileset2', 'tiles2');

    const layerSuelo = map.createLayer('Suelo', [tiles1, tiles2], 0, 0);
    map.createLayer('Vegetacion', [tiles1, tiles2], 0, 0);
    layerSuelo.setCollisionByExclusion([-1], true);

    const escaleraLayer = map.getObjectLayer('Escaleras');
    if (escaleraLayer) {
      this.ladders = this.physics.add.staticGroup();
      escaleraLayer.objects.forEach(obj => {
        if (obj.gid === 238) {
          this.ladders.create(obj.x, obj.y - 15, 'ladder2');
        }
      });
    }
    const pinchosLayer = map.getObjectLayer('Pinchos');
    if (escaleraLayer) {
      this.ladders = this.physics.add.staticGroup();
      escaleraLayer.objects.forEach(obj => {
        if (obj.gid === 122) {
          this.ladders.create(obj.x, obj.y - 15, 'upspikes');
        }
      });
    }

    this.bullets = this.physics.add.group({
        allowGravity: false
    });

    // Crear jugador y enemigo
    this.player = new Player(this, 0, 0);
    this.enemy1 = new Enemy(this, 0, 0);
    // Asignar referencia del jugador al enemigo
    this.enemy1.player = this.player;

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);
    this.physics.add.collider(this.enemy1, layerSuelo);

    // Colisión para detectar disparos sobre el enemigo
    // Asumimos que cada bala creada tiene la propiedad bullet.damage
    this.physics.add.overlap(
        this.enemy1,
        this.bullets,
        (enemy, bullet) => {
          enemy.takeDamage(bullet.damage);
          bullet.destroy();
        }
      );
      
      

    // Colisión para detectar ataque cuerpo a cuerpo del enemigo
    this.physics.add.overlap(
        this.player,
        this.enemy1,
        () => {
          // Puedes usar un temporizador para evitar ataques continuos
          this.enemy1.attack();
        },
        null,
        this
      );
      

    // Posiciones iniciales
    this.player.setPosition(50, 700);
    this.enemy1.setPosition(650, 790);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setLerp(1, 0);

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }
}

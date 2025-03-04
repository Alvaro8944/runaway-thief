import Phaser from 'phaser';
import Player from '../player.js';
import Enemy, { STATE } from '../enemy1.js';

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level' });
  }

  create() {
    
    const map = this.make.tilemap({ key: 'map' });
    const tiles1 = map.addTilesetImage('tileset', 'tiles');
    const tiles2 = map.addTilesetImage('tileset2', 'tiles2');

    const layerSuelo = map.createLayer('Suelo', [tiles1, tiles2], 0, 0);
    map.createLayer('Vegetacion', [tiles1, tiles2], 0, 0);

    // Configurar colisiones para las rampas
    const propiedadesRampas = {
      33: { // ID del tile de rampa izquierda
        slope: 'left'
      },
      32: { // ID del tile de rampa derecha
        slope: 'right'
      }
    };

    // Aplicar propiedades de colisión a las rampas
    for (const [tileId, props] of Object.entries(propiedadesRampas)) {
      map.setCollision(parseInt(tileId));
      const tiles = layerSuelo.filterTiles(tile => tile.index === parseInt(tileId));
      tiles.forEach(tile => {
        tile.properties = { ...tile.properties, ...props };
        tile.faceLeft = props.slope === 'left';
        tile.faceRight = props.slope === 'right';
      });
    }

    layerSuelo.setCollisionByExclusion([-1], true);

    const escaleraLayer = map.getObjectLayer('Escalera');
    if (escaleraLayer) {
      this.ladders = this.physics.add.staticGroup();
      escaleraLayer.objects.forEach(obj => {
        if (obj.gid === 238) {
          this.ladders.create(obj.x, obj.y - 15, 'ladder2');
        }
      });
    }

    this.bullets = this.physics.add.group({
        allowGravity: false,
        collideWorldBounds: true,
        bounceX: 0,
        bounceY: 0
    });

    // Configurar el tamaño del hitbox de las balas cuando se crean
    this.bullets.createCallback = (bullet) => {
        bullet.setSize(4, 4); // Hitbox más pequeño y preciso
        bullet.setOffset(6, 0);
        
        // Añadir un tiempo de vida máximo a la bala
        bullet.lifespan = 1000; // 1 segundo
        bullet.createTime = this.time.now;
    };

    // Actualizar y comprobar las balas cada frame
    this.events.on('update', () => {
        this.bullets.children.each(bullet => {
            if (!bullet || !bullet.active) return;

            // Destruir balas que han superado su tiempo de vida
            if (this.time.now - bullet.createTime > bullet.lifespan) {
                bullet.destroy();
                return;
            }

            // Comprobar colisiones con tiles
            const tiles = layerSuelo.getTilesWithinShape(bullet.body);
            if (tiles.some(tile => tile.index !== -1)) {
                bullet.destroy();
            }
        });
    });

    // Añadir colisión entre balas y suelo
    this.physics.add.collider(this.bullets, layerSuelo, (bullet) => {
        if (bullet.active) {
            bullet.destroy();
        }
    });

    // Crear jugador y enemigo
    this.player = new Player(this, 0, 0);
    this.enemy1 = new Enemy(this, 0, 0);
    // Asignar referencia del jugador al enemigo
    this.enemy1.player = this.player;

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);
    this.physics.add.collider(this.enemy1, layerSuelo);
    
    // Colisión entre jugador y enemigo
    this.physics.add.overlap(
      this.player,
      this.enemy1,
      (player, enemy) => {
        if (enemy.state !== STATE.DEAD && 
            enemy.state !== STATE.HURT && 
            !player.isInvulnerable) {
          // Solo si el enemigo está atacando y el jugador no está invulnerable
          if (enemy.state === STATE.ATTACKING && !enemy.attackDamageDealt) {
            player.takeDamage(enemy.damage, enemy);
            enemy.attackDamageDealt = true;
          }
        }
      },
      null,
      this
    );

    // Colisión para detectar disparos sobre el enemigo
    this.physics.add.overlap(
      this.enemy1,
      this.bullets,
      (enemy, bullet) => {
        if (enemy.state !== STATE.DEAD) {
          enemy.takeDamage(bullet.damage);
          bullet.destroy();
        }
      },
      null,
      this
    );

    // Eventos de muerte
    this.events.on('playerDeath', () => {
      // Aquí puedes añadir la lógica de game over
      console.log('Game Over - Player died');
      this.scene.restart();
    });

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

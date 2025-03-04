import Phaser from 'phaser';
import Player from '../player.js';
import Enemy, { STATE, PatrollingEnemy } from '../enemy1.js';

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level' });
  }

  create() {
    
    const map = this.make.tilemap({ key: 'map' });
    const tiles1 = map.addTilesetImage('Tileset', 'tiles');
    const tiles2 = map.addTilesetImage('Tileset2', 'ttles2');

    const layerSuelo = map.createLayer('Suelo', [tiles1, tiles2], 0, 0);
    map.createLayer('Vegetacion', [tiles1, tiles2], 0, 0);

    // Crear zona de final del nivel
    const finNivelLayer = map.getObjectLayer('FinNivel');
    if (finNivelLayer) {
        this.finNivel = this.add.zone(0, 0, 32, 32);
        this.physics.world.enable(this.finNivel);
        const finNivelObj = finNivelLayer.objects[0];
        this.finNivel.setPosition(finNivelObj.x, finNivelObj.y);
        this.finNivel.body.setAllowGravity(false);
        this.finNivel.body.moves = false;
    }

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
      const escaleraObjects = escaleraLayer.objects.filter(obj => obj.gid === 238);
      
      // Encontrar la escalera más alta (última escalera)
      const ultimaEscalera = escaleraObjects.reduce((highest, current) => {
        return (!highest || current.y < highest.y) ? current : highest;
      }, null);

      escaleraObjects.forEach(obj => {
        const escalera = this.ladders.create(obj.x, obj.y - 15, 'ladder2');
        
        // Si es la última escalera, marcarla como zona de fin de nivel
        if (obj === ultimaEscalera) {
          this.finNivel = escalera;
          // Hacer la última escalera un poco visible diferente si quieres (opcional)
          escalera.setTint(0xffff00); // Color dorado
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

    // Crear jugador y enemigos
    this.player = new Player(this, 0, 0);
    
    // Grupo para todos los enemigos
    this.enemies = this.add.group();
    
    // Crear enemigos en posiciones específicas
    const enemyPositions = [
        { x: 650, y: 790, type: 'normal' },     // Enemigo normal en plataforma baja
        { x: 1600, y: 500, type: 'patrolling' },
        { x: 2200, y: 500, type: 'patrolling' },
        { x: 2800, y: 400, type: 'patrolling' },
        { x: 2800, y: 0, type: 'normal' }
    ];

    enemyPositions.forEach(pos => {
        const enemy = pos.type === 'patrolling' 
            ? new PatrollingEnemy(this, pos.x, pos.y)
            : new Enemy(this, pos.x, pos.y);
            
        enemy.player = this.player;
        enemy.map = map; // Añadir referencia al mapa
        this.enemies.add(enemy);
        
        // Configurar colisiones para cada enemigo
        this.physics.add.collider(enemy, layerSuelo);
        
        // Colisión entre jugador y este enemigo
        this.physics.add.overlap(
            this.player,
            enemy,
            (player, enemySprite) => {
                if (enemySprite.state !== STATE.DEAD && 
                    enemySprite.state !== STATE.HURT && 
                    !player.isInvulnerable) {
                    if (enemySprite.state === STATE.ATTACKING && !enemySprite.attackDamageDealt) {
                        player.takeDamage(enemySprite.damage, enemySprite);
                        enemySprite.attackDamageDealt = true;
                    }
                }
            },
            null,
            this
        );

        // Colisión para detectar disparos sobre este enemigo
        this.physics.add.overlap(
            enemy,
            this.bullets,
            (enemySprite, bullet) => {
                if (enemySprite.state !== STATE.DEAD) {
                    enemySprite.takeDamage(bullet.damage);
                    bullet.destroy();
                }
            },
            null,
            this
        );
    });

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);

    // Eventos de muerte
    this.events.on('playerDeath', () => {
      // Aquí puedes añadir la lógica de game over
      console.log('Game Over - Player died');
      this.scene.restart();
    });

    // Posiciones iniciales
    this.player.setPosition(2800, 400);

    // Configuración de los límites del mundo y la cámara
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Configurar la cámara principal
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(1); // Zoom 1:1
    this.cameras.main.setLerp(0.1, 0.1); // Suavizado del movimiento
    this.cameras.main.setDeadzone(100, 100); // Zona muerta para movimiento más suave

    // Configurar controles
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Añadir colisión con la última escalera para fin de nivel
    if (this.finNivel) {
        this.physics.add.overlap(
            this.player,
            this.finNivel,
            () => {
                // Transición suave al siguiente nivel
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.start('boot2');
                });
            },
            null,
            this
        );
    }
  }
}

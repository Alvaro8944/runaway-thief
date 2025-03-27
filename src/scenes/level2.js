import Phaser from 'phaser';
import Player from '../player.js';
import Enemy2, { STATE2, PatrollingEnemy2 } from '../enemy2.js';

export default class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: 'level2' });
  }

  init(data) {
    console.log('Level2: Iniciando con datos:', data);
    // Recibir datos del nivel anterior
    this.playerHealth = data.playerHealth || 100;
    this.playerScore = data.playerScore || 0;
  }

  create() {
    console.log('Level2: Creando nivel');
    // Crear el mapa y sus capas
    const map = this.make.tilemap({ key: 'map2' });
    const tileset = map.addTilesetImage('Tileset2', 'tiles2');

    // Crear las capas
    const layerSuelo = map.createLayer('Suelo', tileset);

    // Configurar colisiones con el suelo
    layerSuelo.setCollisionByProperty({ colision: true });

    // Crear grupos para objetos
    this.ladders = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();

    // Crear escaleras desde el tilemap
    const escalerasLayer = map.getObjectLayer('Escalera');
    if (escalerasLayer) {
      escalerasLayer.objects.forEach(escalera => {
        const escaleraSprite = this.ladders.create(
          escalera.x + escalera.width/2, 
          escalera.y - escalera.height/2, 
          'ladder2'
        );
        escaleraSprite.body.setSize(32, escalera.height);
        escaleraSprite.setDisplaySize(32, escalera.height);
        escaleraSprite.setOrigin(0.5, 0.5);
        escaleraSprite.setImmovable(true);
      });
    }

    // Crear pinchos desde el tilemap
    const pinchosLayer = map.getObjectLayer('Pinchos');
    if (pinchosLayer) {
      pinchosLayer.objects.forEach(pincho => {
        let spriteName = pincho.gid === 82 ? 'pichos_abajo' : 'pichos_arriba';
        const spikeSprite = this.spikes.create(
          pincho.x + 16, 
          pincho.y - 16, 
          spriteName
        );
        spikeSprite.body.setSize(24, 12);
        spikeSprite.setDisplaySize(32, 32);
        spikeSprite.setOrigin(0.5, 0.5);
      });
    }

    layerSuelo.setCollisionByExclusion([-1], true);

    // Configurar el grupo de balas
    this.bullets = this.physics.add.group({
      allowGravity: false,
      collideWorldBounds: true,
      bounceX: 0,
      bounceY: 0
    });

    // Configurar el tamaño del hitbox de las balas cuando se crean
    this.bullets.createCallback = (bullet) => {
      bullet.setSize(4, 4);
      bullet.setOffset(6, 0);
      bullet.lifespan = 1000;
      bullet.createTime = this.time.now;
    };

    // Actualizar y comprobar las balas cada frame
    this.events.on('update', () => {
      this.bullets.children.each(bullet => {
        if (!bullet || !bullet.active) return;
        if (this.time.now - bullet.createTime > bullet.lifespan) {
          bullet.destroy();
          return;
        }
       
      });
    });

    // Crear jugador y configurar su posición inicial
    this.player = new Player(this, 100, 100);
    this.player.health = this.playerHealth;
    this.player.score = this.playerScore;

    // Configurar colisiones
    this.physics.add.collider(this.player, layerSuelo);
    this.physics.add.collider(this.bullets, layerSuelo, (bullet) => {
      if (bullet.active) {
        bullet.destroy();
      }
    });

    // Colisión con escaleras
    this.physics.add.overlap(
      this.player,
      this.ladders,
      (player, ladder) => {
        player.canClimb = true;
        player.currentLadder = ladder;
      },
      null,
      this
    );



    this.enemies = this.add.group();
    
    // Crear enemigos en posiciones específicas
    const enemyPositions = [
        { x: 200, y: 800, type: 'normal' },     // Enemigo normal en plataforma baja
        { x: 1100, y: 500, type: 'patrolling' },
        { x: 2200, y: 500, type: 'patrolling' },
        { x: 2800, y: 400, type: 'patrolling' },
        { x: 2800, y: 0, type: 'normal' }
    ];


        enemyPositions.forEach(pos => {
            const enemy = pos.type === 'patrolling' 
                ? new PatrollingEnemy2(this, pos.x, pos.y)
                : new Enemy2(this, pos.x, pos.y);
                
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
                    if (enemySprite.state !== STATE2.DEAD && 
                        enemySprite.state !== STATE2.HURT && 
                        !player.isInvulnerable) {
                        if (enemySprite.state === STATE2.ATTACKING && !enemySprite.attackDamageDealt) {
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
                    if (enemySprite.state !== STATE2.DEAD) {
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

    // Colisión con pinchos
    this.physics.add.overlap(
      this.player,
      this.spikes,
      (player, spike) => {
        if (!player.isInvulnerable) {
          player.takeDamage(1, spike);
        }
      },
      null,
      this
    );

    // Posiciones iniciales
    this.player.setPosition(100, 800);

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

        const audio=this.sound.add('nivel');
    audio.play();
  }

  update() {
    if (this.player) {
      // Verificar la superposición con las escaleras
      const isOnLadder = this.physics.overlap(this.player, this.ladders);
      
      if (!isOnLadder) {
        this.player.canClimb = false;
        this.player.currentLadder = null;
      }
      
      // Actualizar al jugador
      this.player.update();
    }
  }
} 

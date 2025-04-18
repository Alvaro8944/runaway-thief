import Phaser from 'phaser';
import Player from '../player.js';
import { Enemy1, STATE, PatrollingEnemy } from '../enemys/enemy1.js';
import { Enemy2, STATE2, PatrollingEnemy2 } from '../enemys/enemy2.js';

const SPIKE_DAMAGE = 20;

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level3' });
  }

  create() {
    
    const map = this.make.tilemap({ key: 'map3' });
    const tileset = map.addTilesetImage('Tileset', 'tiles');

    
    // Crear las capas
    this.layerSuelo = map.createLayer('Suelo', tileset);
    this.layerFondo = map.createLayer('Fondo', tileset);

    // Configurar colisiones con el suelo
    this.layerSuelo.setCollisionByProperty({ colision: true });

    // Crear grupos para objetos
    this.ladders = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();

    // Crear escaleras desde el tilemap
    const escalerasLayer = map.getObjectLayer('Escaleras');
    
    // Encontrar la escalera más alta (Y más pequeña)
    let escaleraMasAlta = escalerasLayer.objects[0];
    escalerasLayer.objects.forEach(escalera => {
      if (escalera.y < escaleraMasAlta.y) {
        escaleraMasAlta = escalera;
      }
    });

    // Crear todas las escaleras
    escalerasLayer.objects.forEach(escalera => {
      const escaleraSprite = this.ladders.create(escalera.x + escalera.width/2, escalera.y - escalera.height/2, 'ladder2');
      escaleraSprite.body.setSize(32, escalera.height);
      escaleraSprite.setDisplaySize(32, escalera.height);
      escaleraSprite.setOrigin(0.5, 0.5);
      escaleraSprite.setImmovable(true);
      
      // Si es la escalera más alta, marcarla como punto de transición
      if (escalera === escaleraMasAlta) {
        escaleraSprite.isTransitionPoint = true;
        
        
      }
    });



    // Crear zona de final del nivel
    const finNivelLayer = map.getObjectLayer('FinNivel');
    if (finNivelLayer) {
        this.finNivel = this.add.zone(0, 0, 32, 64); // Hacemos la zona más alta para mejor detección
        this.physics.world.enable(this.finNivel);
        const finNivelObj = finNivelLayer.objects[0];
        this.finNivel.setPosition(finNivelObj.x, finNivelObj.y);
        this.finNivel.body.setAllowGravity(false);
        this.finNivel.body.moves = false;
    } else {
        console.warn('No se encontró la capa FinNivel en el mapa');
    }

    this.layerSuelo.setCollisionByExclusion([-1], true);

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
        });
    });

    // Añadir colisión entre balas y suelo
    this.physics.add.collider(this.bullets, this.layerSuelo, (bullet) => {
        if (bullet.active) {
            bullet.destroy();
        }
    });




    // Crear jugador y enemigos
    this.player = new Player(this, 0, 0);
    
    // Añadir colisión con escaleras
    this.physics.add.overlap(
        this.player,
        this.ladders,
        (player, ladder) => {
            player.canClimb = true;
            player.currentLadder = ladder;

            // Si es la escalera de transición y el jugador está cerca de la parte superior
            if (ladder.isTransitionPoint) {
                // Calcular la distancia a la parte superior de la escalera
                const distanciaAlTope = Math.abs(player.y - (ladder.y - ladder.height));
                console.log('Distancia al tope de la escalera:', distanciaAlTope);
                
                // Zona más amplia de detección y más abajo
                if (distanciaAlTope < 50 && this.keys.up.isDown) {
                    console.log('Detectada colisión con escalera de transición');
                    // Evitar múltiples transiciones
                    if (this.isTransitioning) return;
                    this.isTransitioning = true;
                    console.log('Iniciando transición al nivel 2');

                    // Desactivar controles del jugador
                    this.player.body.setVelocity(0, 0);
                    this.player.body.allowGravity = false;
                    
                    // Efecto de fade out
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    
                    // Transición al boot2 (que cargará los assets del nivel 2)
                    this.time.delayedCall(1000, () => {
                        console.log('Cambiando a escena boot2');
                        this.scene.start('boot2', { 
                            playerHealth: this.player.health,
                            playerScore: this.player.score 
                        });
                    });
                }
            }
        },
        null,
        this
    );

    // Añadir colisión con pinchos
    this.physics.add.overlap(
        this.player,
        this.spikes,
        (player, spike) => {
            if (!player.isInvulnerable) {
                player.takeDamage(SPIKE_DAMAGE, spike);
            }
        },
        null,
        this
    );

    // Grupo para todos los enemigos
    this.enemies = this.add.group();
    
    // Crear enemigos en posiciones específicas
    const enemyPositions = [
        { x: 1600, y: 500, type: 'patrolling' },
        { x: 2200, y: 500, type: 'patrolling' },
        { x: 2800, y: 400, type: 'patrolling' },
        { x: 2800, y: 0, type: 'normal' }
    ];

    const enemy2Positions = [
        { x: 650, y: 790, type: 'normal' },     // Enemigo normal en plataforma baja
    ];


    enemy2Positions.forEach(pos => {
        const enemy = pos.type === 'patrolling' 
            ? new PatrollingEnemy2(this, pos.x, pos.y)
            : new Enemy2(this, pos.x, pos.y);
            
        enemy.player = this.player;
        enemy.map = map; // Añadir referencia al mapa
        this.enemies.add(enemy);
        
        // Configurar colisiones para cada enemigo
        this.physics.add.collider(enemy, this.layerSuelo);
        
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




    
    enemyPositions.forEach(pos => {
        const enemy = pos.type === 'patrolling' 
            ? new PatrollingEnemy(this, pos.x, pos.y)
            : new Enemy1(this, pos.x, pos.y);
            
        enemy.player = this.player;
        enemy.map = map; // Añadir referencia al mapa
        this.enemies.add(enemy);
        
        // Configurar colisiones para cada enemigo
        this.physics.add.collider(enemy, this.layerSuelo);
        
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
    this.physics.add.collider(this.player, this.layerSuelo);

    // Eventos de muerte
    this.events.on('playerDeath', () => {
      // Aquí puedes añadir la lógica de game over
      console.log('Game Over - Player died');
      this.scene.restart();
    });

    // Posiciones iniciales
    this.player.setPosition(700, 200);

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
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      cambiarWeapon:  Phaser.Input.Keyboard.KeyCodes.X
    });

    // Añadir colisión con la última escalera para fin de nivel
    if (this.finNivel) {
        this.physics.add.overlap(
            this.player,
            this.finNivel,
            () => {
                console.log('Detectada colisión con zona fin de nivel');
                // Evitar múltiples transiciones
                if (this.isTransitioning) return;
                this.isTransitioning = true;
                console.log('Iniciando transición al nivel 2');

                // Desactivar controles del jugador
                this.player.body.setVelocity(0, 0);
                this.player.body.allowGravity = false;
                
                // Efecto de fade out
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                
                // Transición al boot2 (que cargará los assets del nivel 2)
                this.time.delayedCall(1000, () => {
                    console.log('Cambiando a escena boot2');
                    this.scene.start('boot2', { 
                        playerHealth: this.player.health,
                        playerScore: this.player.score 
                    });
                });
            },
            null,
            this
        );
    }
    const audio=this.sound.add('level2');
    //audio.play();

  }

  update() {
    if (this.player) {
      // Verificar la superposición con las escaleras antes de resetear
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

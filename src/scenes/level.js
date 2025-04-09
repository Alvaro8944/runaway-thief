import Phaser from 'phaser';
import Player from '../player.js';
import { Enemy1, STATE, PatrollingEnemy } from '../enemy1.js';
import { Enemy2, STATE2, PatrollingEnemy2 } from '../enemy2.js';
import Pincho from '../gameObjects/Pincho.js';
import Escalera from '../gameObjects/Escalera.js';
import BolaGrande from '../gameObjects/BolaGrande.js';
import Diamante from '../gameObjects/Diamante.js';

const SPIKE_DAMAGE = 20;

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level' });
  }

  create() {
    // Inicializar el mapa y capas
    this.setupMap();
    
    // Configurar grupos para proyectiles
    this.setupBulletGroups();
    
    // Crear jugador
    this.player = new Player(this, 0, 0);
    this.player.setPosition(100, 1700); // Posición inicial
    
    // Crear objetos del juego (después del jugador para que las referencias sean correctas)
    this.createGameObjects();
    
    // Configurar colisiones
    this.setupCollisions();
    
    // Configurar cámara y controles
    this.setupCameraAndControls();
    
    // A intervalos aleatorios, crear bolas que caen (lluvia de bolas)
    this.time.addEvent({
      delay: 20000, // Cada 20 segundos
      callback: this.crearLluviaBolas,
      callbackScope: this,
      loop: true
    });
    
    // Configurar sonido
    //this.sound.play('level2', { volume: 0.2 });
  }
  
  setupMap() {
    const map = this.make.tilemap({ key: 'map' });
    this.map = map; // Guardar referencia para uso en otros métodos
    
    const tileset = map.addTilesetImage('Tileset', 'tiles');
    
    // Crear las capas
    this.layerSuelo = map.createLayer('Suelo', tileset);
    const layerFondo = map.createLayer('Fondo', tileset);
    
    // Configurar colisiones con el suelo
    this.layerSuelo.setCollisionByProperty({ colision: true });
    this.layerSuelo.setCollisionByExclusion([-1], true);
    
    // Configurar los límites del mundo
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
  
  createGameObjects() {
    // Crear pinchos
    this.spikes = Pincho.createFromMap(this, this.map, 'Pinchos', 'pichos_arriba');
    
    // Crear escaleras
    this.ladders = Escalera.createFromMap(this, this.map, 'Escaleras');
    
    // Crear bolas grandes desde el mapa
    this.bolas = BolaGrande.createFromMap(this, this.map, 'BolasGrandes', 'bola_grande');
    
    // Crear diamantes desde el mapa
    this.diamantes = Diamante.createFromMap(this, this.map, 'Diamantes', 'diamante');
    
    // Añadir colisión entre bolas y suelo
    this.physics.add.collider(this.bolas, this.layerSuelo);
    
    // Crear enemigos
    this.enemies = this.add.group();
    this.createEnemies();
    
    // Buscar zona de final de nivel si existe
    const finNivelLayer = this.map.getObjectLayer('FinNivel');
    if (finNivelLayer && finNivelLayer.objects && finNivelLayer.objects.length > 0) {
      this.finNivel = this.add.zone(0, 0, 32, 64);
      this.physics.world.enable(this.finNivel);
      const finNivelObj = finNivelLayer.objects[0];
      this.finNivel.setPosition(finNivelObj.x, finNivelObj.y);
      this.finNivel.body.setAllowGravity(false);
      this.finNivel.body.moves = false;
    }
  }
  
  setupBulletGroups() {
    // Grupo para balas del jugador
    this.bullets = this.physics.add.group({
      allowGravity: false,
      collideWorldBounds: true,
      bounceX: 0,
      bounceY: 0
    });
    
    // Grupo para balas enemigas
    this.enemyBullets = this.physics.add.group({
      allowGravity: false,
      collideWorldBounds: true,
      bounceX: 0,
      bounceY: 0
    });
    
    // Configurar el tamaño del hitbox de las balas
    this.bullets.createCallback = (bullet) => {
      if (bullet) {
        bullet.setSize(4, 4);
        bullet.setOffset(6, 0);
        bullet.lifespan = 1000; // 1 segundo
        bullet.createTime = this.time.now;
      }
    };
    
    this.enemyBullets.createCallback = (enemyBullet) => {
      if (enemyBullet) {
        enemyBullet.setSize(4, 4);
        enemyBullet.setOffset(6, 0);
        enemyBullet.lifespan = 1000;
        enemyBullet.createTime = this.time.now;
      }
    };
    
    // Limpieza de balas con tiempo de vida expirado
    this.events.on('update', () => {
      this.cleanupBullets(this.bullets);
      this.cleanupBullets(this.enemyBullets);
    });
  }
  
  cleanupBullets(bulletGroup) {
    if (!bulletGroup || !bulletGroup.children) return;
    
    bulletGroup.children.each(bullet => {
      if (!bullet || !bullet.active) return;
      if (this.time.now - bullet.createTime > bullet.lifespan) {
        bullet.destroy();
      }
    });
  }
  
  createEnemies() {
    // Posiciones de enemigos tipo 1
    const enemyPositions = [
      { x: 2200, y: 1500, type: 'patrolling' },
      { x: 2600, y: 1400, type: 'patrolling' },
      { x: 2750, y: 1300, type: 'patrolling' },
      { x: 2850, y: 1100, type: 'patrolling' },
      { x: 3650, y: 1450, type: 'patrolling' },

      { x: 4403, y: 1570, type: 'patrolling' },
      { x: 5111, y: 1602, type: 'patrolling' },
      { x: 6303, y: 1122, type: 'patrolling' },
      { x: 7134, y: 1058, type: 'patrolling' },
      { x: 8520, y: 706, type: 'patrolling' }



    ];
    
    // Posiciones de enemigos tipo 2
    const enemy2Positions = [
      { x: 700, y: 1750, type: 'normal' },
      { x: 3200, y: 1150, type: 'patrolling' },
      { x: 3650, y: 1250, type: 'patrolling' },
      { x: 3400, y: 2000, type: 'normal' },
      { x: 3500, y: 2000, type: 'normal' },

      { x: 4403, y: 1570, type: 'patrolling' },
      { x: 5111, y: 1602, type: 'patrolling' },
      { x: 5628, y: 1250, type: 'patrolling' },
      { x: 6303, y: 1122, type: 'patrolling' },


      //{ x: 6461, y: 930, type: 'patrolling' },    //ESTATICO
      //{ x: 6151, y: 930, type: 'patrolling' }   //ESTATICO

      { x: 7134, y: 1058, type: 'patrolling' },
      { x: 7134, y: 1058, type: 'patrolling' },
      { x: 7734, y: 962, type: 'patrolling' }


    ];
    
    // Crear enemigos tipo 2
    enemy2Positions.forEach(pos => this.createEnemy2(pos));
    
    // Crear enemigos tipo 1
    enemyPositions.forEach(pos => this.createEnemy1(pos));
  }
  
  createEnemy1(pos) {
    const enemy = pos.type === 'patrolling' 
      ? new PatrollingEnemy(this, pos.x, pos.y)
      : new Enemy1(this, pos.x, pos.y);
    
    enemy.player = this.player;
    enemy.map = this.map;
    this.enemies.add(enemy);
    
    // Configurar colisiones
    this.physics.add.collider(enemy, this.layerSuelo);
    
    // Colisión jugador-enemigo
    this.physics.add.overlap(
      this.player,
      enemy,
      (player, enemySprite) => {
        if (!enemySprite || !player) return;
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
    
    // Colisión bala-enemigo
    this.physics.add.overlap(
      enemy,
      this.bullets,
      (enemySprite, bullet) => {
        if (!enemySprite || !bullet) return;
        if (enemySprite.state !== STATE.DEAD) {
          enemySprite.takeDamage(bullet.damage);
          bullet.destroy();
        }
      },
      null,
      this
    );
  }
  
  createEnemy2(pos) {
    const enemy = pos.type === 'patrolling' 
      ? new PatrollingEnemy2(this, pos.x, pos.y)
      : new Enemy2(this, pos.x, pos.y);
    
    enemy.player = this.player;
    enemy.map = this.map;
    this.enemies.add(enemy);
    
    // Configurar colisiones
    this.physics.add.collider(enemy, this.layerSuelo);
    
    // Colisión jugador-enemigo
    this.physics.add.overlap(
      this.player,
      enemy,
      (player, enemySprite) => {
        if (!enemySprite || !player) return;
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
    
    // Colisión bala-enemigo
    this.physics.add.overlap(
      enemy,
      this.bullets,
      (enemySprite, bullet) => {
        if (!enemySprite || !bullet) return;
        if (enemySprite.state !== STATE2.DEAD) {
          enemySprite.takeDamage(bullet.damage);
          bullet.destroy();
        }
      },
      null,
      this
    );
  }
  
  setupCollisions() {
    // Verificar que los objetos necesarios existan
    if (!this.player || !this.layerSuelo) return;
    
    // Colisión jugador-suelo
    this.physics.add.collider(this.player, this.layerSuelo);
    
    // Colisión balas-suelo
    if (this.bullets) {
      this.physics.add.collider(this.bullets, this.layerSuelo, bullet => {
        if (bullet && bullet.active) bullet.destroy();
      });
    }
    
    if (this.enemyBullets) {
      this.physics.add.collider(this.enemyBullets, this.layerSuelo, bullet => {
        if (bullet && bullet.active) bullet.destroy();
      });
    }
    
    // Colisión jugador-escaleras
    if (this.ladders) {
      this.physics.add.overlap(
        this.player,
        this.ladders,
        (player, ladder) => {
          if (ladder && ladder.handlePlayerOverlap) {
            ladder.handlePlayerOverlap(player);
          }
        },
        null,
        this
      );
    }
    
    // Colisión jugador-pinchos
    if (this.spikes) {
      this.physics.add.overlap(
        this.player,
        this.spikes,
        (player, spike) => {
          if (spike && spike.doDamage) {
            spike.doDamage(player);
          }
        },
        null,
        this
      );
    }
    
    // Colisión jugador-bolas
    if (this.bolas) {
      this.physics.add.overlap(
        this.player,
        this.bolas,
        (player, bola) => {
          if (bola && bola.doDamage) {
            bola.doDamage(player);
          }
        },
        null,
        this
      );
    }
    
    // Colisión jugador-balas enemigas
    if (this.enemyBullets) {
      this.physics.add.overlap(
        this.player,
        this.enemyBullets,
        (player, enemyBullet) => {
          if (!player || !enemyBullet) return;
          if (!player.isInvulnerable) {
            player.takeDamage(enemyBullet.damage, enemyBullet.owner);
            enemyBullet.destroy();
          }
        },
        null,
        this
      );
    }
    
    // Configurar colisión con diamantes
    Diamante.setupCollision(this, this.diamantes, this.player);
    
    // Colisión con zona de fin de nivel
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
          
          // Transición al boot2
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
    
    // Eventos de muerte
    this.events.on('playerDeath', () => {
      console.log('Game Over - Player died');
      this.scene.restart();
    });
  }
  
  setupCameraAndControls() {
    if (!this.player || !this.map) return;
    
    // Configurar la cámara principal
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setZoom(1);
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);
    
    // Configurar controles
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      cambiarWeapon: Phaser.Input.Keyboard.KeyCodes.X
    });
  }

  update() {
    if (!this.player) return;
    
    try {
      // Verificar la superposición con las escaleras antes de resetear
      const isOnLadder = this.physics.overlap(this.player, this.ladders);
      
      if (!isOnLadder) {
        this.player.canClimb = false;
        this.player.currentLadder = null;
      }
      
      // Actualizar al jugador
      this.player.update();
      
      // Actualizar las bolas dinámicas si existen
      if (this.bolas) {
        this.bolas.getChildren().forEach(bola => {
          if (bola.active && bola.update) {
            bola.update();
          }
        });
      }
    } catch (error) {
      console.error('Error en update:', error);
    }
  }
  
  /**
   * Método para crear una lluvia de bolas que caen del cielo
   */
  crearLluviaBolas() {
    // Obtener puntos de aparición específicos del mapa
    const spawnPoints = [];
    const spawnLayer = this.map ? this.map.getObjectLayer('SpawnBolas') : null;
    
    // Solo crear bolas si hay puntos de spawn definidos en el mapa
    if (spawnLayer && spawnLayer.objects && spawnLayer.objects.length > 0) {
      // Usar posiciones definidas en el mapa (coordenadas completas)
      spawnLayer.objects.forEach(obj => {
        // Guardar tanto X como Y para cada punto
        spawnPoints.push({ x: obj.x, y: obj.y });
      });
      
      // Crear las bolas en los puntos de spawn definidos
      const numBolas = Math.min(spawnPoints.length, Phaser.Math.Between(1, 3)); // No crear más bolas que puntos de spawn
      const bolasCaidas = BolaGrande.crearBolasCaidas(this, numBolas, 'bola_grande', spawnPoints);
      
      // Configurar colisiones
      this.physics.add.collider(bolasCaidas, this.layerSuelo);
      this.physics.add.overlap(
        this.player,
        bolasCaidas,
        (player, bola) => {
          if (bola.doDamage) {
            bola.doDamage(player);
          }
        },
        null,
        this
      );
      
      // Auto-destruir las bolas después de cierto tiempo
      this.time.delayedCall(10000, () => {
        bolasCaidas.clear(true, true); // Destruir todas las bolas
      });
      
      console.log(`Creadas ${numBolas} bolas en puntos de spawn definidos`);
    } else {
      console.log('No se encontraron puntos de spawn para bolas en el mapa');
    }
  }
}

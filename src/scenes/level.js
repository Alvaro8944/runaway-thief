import Phaser from 'phaser';
import Player from '../player.js';
import { Enemy1, STATE, PatrollingEnemy } from '../enemy1.js';
import { Enemy2, STATE2, PatrollingEnemy2 } from '../enemy2.js';
import Pincho from '../gameObjects/Pincho.js';
import Escalera from '../gameObjects/Escalera.js';

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
    this.player.setPosition(100, 1750); // Posición inicial
    
    // Crear objetos del juego (después del jugador para que las referencias sean correctas)
    this.createGameObjects();
    
    // Configurar colisiones
    this.setupCollisions();
    
    // Configurar cámara y controles
    this.setupCameraAndControls();
    
    // Configurar sonido
    const audio = this.sound.add('level2');
    //audio.play();
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
      { x: 1600, y: 500, type: 'patrolling' },
      { x: 2200, y: 500, type: 'patrolling' },
      { x: 2800, y: 400, type: 'patrolling' },
      { x: 2800, y: 0, type: 'normal' }
    ];
    
    // Posiciones de enemigos tipo 2
    const enemy2Positions = [
      { x: 650, y: 790, type: 'normal' }
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
    } catch (error) {
      console.error('Error en update:', error);
    }
  }
}

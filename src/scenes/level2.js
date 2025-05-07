import Phaser from 'phaser';
import Player from '../player.js';
import { Enemy1, STATE, PatrollingEnemy } from '../enemys/enemy1.js';
import { Enemy2, STATE2, PatrollingEnemy2 } from '../enemys/enemy2.js';
import { Enemy3, STATE3, PatrollingEnemy3, AttackingEnemy3, SmartEnemy3  } from '../enemys/enemy3.js';
import { Boss, STATEBOSS } from '../enemys/boss.js';
import Pincho from '../gameObjects/Pincho.js';
import Escalera from '../gameObjects/Escalera.js';
import BolaGrande from '../gameObjects/BolaGrande.js';
import Diamante from '../gameObjects/Diamante.js';
import Barril from '../gameObjects/Barril.js';
import RocaDestructible from '../gameObjects/RocaDestructible.js';
import Cartel from '../gameObjects/cartel.js';
import gameData from '../data/GameData';
import GameUI from '../UI/GameUI';
import { PLAYER_STATE } from '../player.js';

const SPIKE_DAMAGE = 20;

export default class Level extends Phaser.Scene {
  constructor() {
    super({ key: 'level2' });
  }

  create() {
    // Restablecer la bandera de gameover al inicio de la escena
    this.isGameOver = false;
    
    // Inicializar el mapa y capas
    this.setupMap();
    
    // Configurar grupos para proyectiles
    this.setupBulletGroups();
    
    // Variable para controlar si el jugador está en proceso de caída
    this.isPlayerFalling = false;
    
    // Crear jugador
    this.player = new Player(this, 0, 0);
    
    // Posición inicial fija del nivel
    const INITIAL_X = 100;
    const INITIAL_Y = 750;
    
    // Posicionar al jugador y establecer el punto de respawn inicial
    this.player.setPosition(INITIAL_X, INITIAL_Y);
    this.player.respawnX = INITIAL_X;
    this.player.respawnY = INITIAL_Y;
    this.player.hasRespawnPoint = true;
    
    // Cargar estado guardado (útil cuando se inicia desde el selector de niveles)
    gameData.setupForLevel2();
    gameData.loadPlayerState(this.player);
    
    // Crear objetos del juego (después del jugador para que las referencias sean correctas)
    this.createGameObjects();
    
    // Configurar colisiones
    this.setupCollisions();
    
    // Configurar cámara y controles
    this.setupCameraAndControls();
    
    // Crear el sistema de UI
    this.gameUI = new GameUI(this, this.player);
    
    // A intervalos aleatorios, crear bolas que caen (lluvia de bolas)
    this.time.addEvent({
      delay: 20000, // Cada 20 segundos
      callback: this.crearLluviaBolas,
      callbackScope: this,
      loop: true
    });

    // Escuchar evento de objeto desbloqueado
    this.events.on('objetoDesbloqueado', (datos) => {
      console.log(`Objeto desbloqueado: ${datos.nombre} en (${datos.x}, ${datos.y})`);
      
      this.mostrarNotificacionObjeto(datos.nombre, datos.x, datos.y);
      
      this.darObjetoAJugador(datos.nombre);
    });

    this.events.on('bulletReachedTarget',
      (x, y, bullet) => {
        // 2) Destruye la propia bala
        bullet.destroy(); 
        // 3) Aplica daño en área (sin animación)
        this.damageArea(x, y, 50, 15);  // p.ej. radio=100, daño=50
      }
    );

    // En create()
    const bgFar = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'CaveBackground')
      .setOrigin(0)
      .setDepth(-20)
      .setScale(1.2)
      .setScrollFactor(0);  // fijado a cámara
    const bgNear = this.add.tileSprite(0, 30, this.scale.width, this.scale.height, 'CaveBackgroundFirst')
      .setOrigin(0)
      .setDepth(-10)
      .setScale(1)
      .setScrollFactor(0);

    // guardamos referencias:
    this.bgFar = bgFar;
    this.bgNear = bgNear;
  }
  
  /**
   * Hace daño a todos los enemigos que caigan dentro de un radio
   * @param {number} x 
   * @param {number} y 
   * @param {number} radius 
   * @param {number} damage 
   */
  damageArea(x, y, radius, damage) {
    // dibujar un círculo de debug
    const g = this.add.graphics({ x, y });
    g.fillStyle(0xff3000, 0.5);
    g.fillCircle(0, 0, radius);
    this.time.delayedCall(200, () => g.destroy());

    // Itera sobre tu grupo de enemigos
    this.enemies.children.iterate(enemy => {
      if (!enemy || enemy.state === 'DEAD') return;
      const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (d <= radius*2) {
        enemy.takeDamage(damage, /*opcional: fuente=*/null);
      }
    });
  }

  setupMap() {
    const map = this.make.tilemap({ key: 'map2' });
    this.map = map; // Guardar referencia para uso en otros métodos
    
    const tileset = map.addTilesetImage('Tileset', 'tiles');
    
    // Crear las capas
    this.layerSuelo = map.createLayer('Suelo', tileset);
    const layerFondo = map.createLayer('Fondo', tileset);
    
    // Configurar colisiones con el suelo
    this.layerSuelo.setCollisionByProperty({ colision: true });
    this.layerSuelo.setCollisionByExclusion([-1], true);
    
    // Configurar los límites del mundo
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels +1000);
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

    // Crear barriles desde el mapa
    this.barriles = Barril.createFromMap(this, this.map, 'Barriles');

    // Crear rocas destructibles desde el mapa
    this.rocas = RocaDestructible.createFromMap(this, this.map, 'RocasDestructibles');
    
    // Crear carteles desde el mapa
    this.carteles = Cartel.createFromMap(this, this.map, 'Carteles');
    
    // Añadir colisión entre bolas y suelo
    this.physics.add.collider(this.bolas, this.layerSuelo);
    
    // Crear enemigos
    this.enemies = this.add.group();
    this.createEnemies();
    
    // Crear manualmente una zona de fin de nivel en la parte alta del mapa
    // Esto reemplaza la búsqueda de la capa 'FinNivel' que no existe en el JSON
    // La zona se coloca donde estaba la escalera más alta
    const ZONE_WIDTH = 100;  // Ancho suficiente para detectar al jugador
    const ZONE_HEIGHT = 32; // Altura pequeña para activarse solo en la parte superior
    
    // Posición aproximada donde debería estar el fin del nivel
    // Ajusta estas coordenadas según la ubicación correcta en tu mapa
    const END_POSITION_X = 9560; 
    const END_POSITION_Y = 15;
    
    this.finNivel = this.add.zone(END_POSITION_X, END_POSITION_Y, ZONE_WIDTH, ZONE_HEIGHT);
    this.physics.world.enable(this.finNivel);
    this.finNivel.body.setAllowGravity(false);
    this.finNivel.body.moves = false;
    
    // Añadir un sprite visible (solo para debug) que muestre dónde está la zona
    // Puedes comentar o eliminar estas líneas en producción
    const debugSprite = this.add.rectangle(END_POSITION_X, END_POSITION_Y, ZONE_WIDTH, ZONE_HEIGHT, 0xff0000, 0.3);
    debugSprite.setDepth(100);
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
        bullet.dispersion = false;
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


      { x: 750, y: 650, type: 'patrolling' },
      { x: 3040, y: 400, type: 'patrolling' },
      { x: 8640, y: 500, type: 'patrolling' }

    ];
    
    // Posiciones de enemigos tipo 2
    const enemy2Positions = [
      { x: 1700, y: 680, type: 'patrolling' },
      { x: 2500, y: 600, type: 'normal' },
      { x: 3300, y: 350, type: 'patrolling' },
      { x: 3900, y: 600, type: 'patrolling' },
      { x: 4050, y: 600, type: 'patrolling' },
      { x: 4580, y: 600, type: 'patrolling' },
      { x: 4900, y: 700, type: 'patrolling' },
      { x: 5280, y: 580, type: 'patrolling' },
      { x: 5280, y: 400, type: 'patrolling' },
      { x: 5120, y: 300, type: 'patrolling' },
      { x: 8930, y: 400, type: 'patrolling' },
      { x: 9440, y: 150, type: 'patrolling' },


    ];


     // Posiciones de enemigos tipo 3
     const enemy3Positions = [
      //{ x: 500, y: 700, type: 'smart' },
      //{ x: 500, y: 700, type: 'attacking' }
      { x: 5700, y: 100, type: 'patrolling' },
      { x: 6150, y: 350, type: 'patrolling' },
      //{ x: 6560, y: 320, type: 'patrolling' },
      { x: 6560, y: 640, type: 'patrolling' },
      { x: 7400, y: 800, type: 'patrolling' },
      { x: 7550, y: 800, type: 'patrolling' },
      { x: 7700, y: 800, type: 'patrolling' },
      { x: 8640, y: 700, type: 'patrolling' },
      { x: 8800, y: 700, type: 'patrolling' },
      { x: 9000, y: 700, type: 'patrolling' },
    ];


    
    
    // Crear enemigos tipo 1
    enemyPositions.forEach(pos => this.createEnemy1(pos));

    // Crear enemigos tipo 2
    enemy2Positions.forEach(pos => this.createEnemy2(pos));

    // Crear enemigos tipo 3
    enemy3Positions.forEach(pos => this.createEnemy3(pos));

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

          let finalDamage;

          if(bullet.dispersion){
           finalDamage = this.calcularDamage(bullet.damage, (this.time.now - bullet.createTime), bullet.lifespan );
          }
          else{
            finalDamage = bullet.damage;          
          }
          
          enemySprite.takeDamage(finalDamage);
          bullet.destroy();
        }
      },
      null,
      this
    );
  }
  


//Método que calcula daño en función del tiempo transcurrido desde el disparo de la bala
  calcularDamage(bulletDamage, tiempoTranscurrido, tiempoLifeSpan){

    let finalDamage = bulletDamage;

    //PRIMER RANGO DE TIEMPO (/1.25) SE CONSIDERA QUE LA BALA YA CASI HABRÍA CUIMPLIDO SU TIEMPO MAXIMO, Y SE REDUCIRÍA MUCHO EL DAÑO ASÍ SEGUIMOS COIN TODOS
    if(tiempoTranscurrido >= tiempoLifeSpan / 1.25){
      finalDamage = bulletDamage / 13;
    }
    else if(tiempoTranscurrido >= tiempoLifeSpan / 2){
      finalDamage = bulletDamage / 11;
    }
    else if(tiempoTranscurrido >= tiempoLifeSpan / 3){
      finalDamage = bulletDamage / 9;
    }
    else if(tiempoTranscurrido >= tiempoLifeSpan / 4){
      finalDamage = bulletDamage / 7;
    }
    else if(tiempoTranscurrido >= tiempoLifeSpan / 5){
      finalDamage = bulletDamage / 5;
    }
    else if(tiempoTranscurrido >= tiempoLifeSpan / 6){
      finalDamage = bulletDamage / 3;
    }

   

      return finalDamage;
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



  createEnemy3(pos) {
    let enemy; 
    if (pos.type === 'patrolling') {
      enemy = new PatrollingEnemy3(this, pos.x, pos.y);
    } else if (pos.type === 'attacking') {
      enemy = new AttackingEnemy3(this, pos.x, pos.y);
    }
    else if (pos.type === 'smart') {
        enemy = new SmartEnemy3(this, pos.x, pos.y);
    } else {
      enemy = new Enemy3(this, pos.x, pos.y);
    }
    


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
        if (enemySprite.state !== STATE3.DEAD && 
            enemySprite.state !== STATE3.HURT && 
            !player.isInvulnerable) {
          if (enemySprite.state === STATE3.ATTACKING && !enemySprite.attackDamageDealt) {
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
        if (enemySprite.state !== STATE3.DEAD) {
          enemySprite.takeDamage(bullet.damage);
          bullet.destroy();
        }
      },
      null,
      this
    );
  }




  createBoss(pos) {
    const enemy = new Boss(this, pos.x, pos.y);
    
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
        if (enemySprite.state !== STATEBOSS.DEAD && 
            enemySprite.state !== STATEBOSS.HURT && 
            !player.isInvulnerable) {
          if (enemySprite.state === STATEBOSS.ATTACKING && !enemySprite.attackDamageDealt) {
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
        if (enemySprite.state !== STATEBOSS.DEAD) {
          enemySprite.takeDamage(bullet.damage);
          bullet.destroy();
        }
      },
      null,
      this
    );
  }



  
  /**
   * Configura todas las colisiones del nivel
   */
  setupCollisions() {
    // Verificar que los objetos necesarios existan
    if (!this.player || !this.layerSuelo) return;
    
    // Colisión jugador-suelo
    this.physics.add.collider(this.player, this.layerSuelo);
    
    // Colisión jugador-rocas destructibles
    if (this.rocas) {
      this.physics.add.collider(this.player, this.rocas);
    }
    
    // Colisión jugador-barriles
    if (this.barriles) {
      // Colisión física normal con los barriles (el jugador no los atraviesa)
      this.physics.add.collider(this.player, this.barriles);
      
      // Detección de interacción con los barriles (para activar sus efectos)
      this.physics.add.overlap(
        this.player,
        this.barriles,
        (player, barril) => {
          // Los barriles de respawn ahora se activan por proximidad, no por colisión
          if (barril.tipo !== 'respawn') {
            if (barril.handleCollision) {
              barril.handleCollision(player);
            } else if (barril.activarEfecto) {
              barril.activarEfecto(player);
            }
          }
        },
        null,
        this
      );
    }
    
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
    
    // Colisión balas-rocas destructibles
    if (this.bullets && this.rocas) {
      this.physics.add.overlap(
        this.bullets,
        this.rocas,
        (bullet, roca) => {
          if (!bullet || !roca || !bullet.active || !roca.active) return;
          
          // Llamar al método recibirDanio de la roca
          roca.recibirDanio(1, bullet);
          
          // Destruir la bala
          bullet.destroy();
        },
        null,
        this
      );
    }
    
    // Colisión balas enemigas-rocas destructibles
    if (this.enemyBullets && this.rocas) {
      this.physics.add.overlap(
        this.enemyBullets,
        this.rocas,
        (bullet, roca) => {
          if (!bullet || !roca || !bullet.active || !roca.active) return;
          
          // Llamar al método recibirDanio de la roca
          roca.recibirDanio(1, bullet);
          
          // Destruir la bala
          bullet.destroy();
        },
        null,
        this
      );
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
    
    // Cambiar la colisión jugador-balas enemigas para manejar el escudo como protección general
    // En setupCollisions() reemplazar la parte de colisiones con el escudo y balas enemigas
    if (this.enemyBullets) {
      this.physics.add.overlap(
        this.player,
        this.enemyBullets,
        (player, enemyBullet) => {
          if (!player || !enemyBullet) return;
          
          // Si el escudo está activo, las balas son destruidas sin dañar al jugador
          if (player.shieldActive) {
            // Crear un efecto de impacto en el escudo
            const impactX = enemyBullet.x;
            const impactY = enemyBullet.y;
            
            // Efecto de ondas en el punto de impacto
            const ripple = this.add.graphics();
            ripple.fillStyle(0x88ffff, 0.7);
            ripple.fillCircle(impactX, impactY, 5);
            ripple.lineStyle(2, 0xaaddff, 0.8);
            ripple.strokeCircle(impactX, impactY, 5);
            
            // Animación de ondas expandiéndose
            this.tweens.add({
              targets: ripple,
              scale: 2,
              alpha: 0,
              duration: 300,
              onUpdate: () => {
                ripple.clear();
                ripple.fillStyle(0x88ffff, ripple.alpha * 0.7);
                ripple.fillCircle(impactX, impactY, 5);
                ripple.lineStyle(2, 0xaaddff, ripple.alpha * 0.8);
                ripple.strokeCircle(impactX, impactY, 5);
              },
              onComplete: () => ripple.destroy()
            });
            
            // Sonido de rebote si existe
            if (this.sound.get('shield_impact')) {
              this.sound.play('shield_impact', { volume: 0.3 });
            }
            
            // Destruir la bala enemiga
            enemyBullet.destroy();
          }
          // Si no tiene escudo y no es invulnerable, recibe daño
          else if (!player.isInvulnerable) {
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
          console.log('Iniciando transición al nivel 3');
          
          // Desactivar controles del jugador
          this.player.body.setVelocity(0, 0);
          this.player.body.allowGravity = false;
          
          // Guardar el estado completo del jugador
          gameData.savePlayerState(this.player);
          
          // Efecto de fade out
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          
          // Transición al boot3
          this.time.delayedCall(1000, () => {
            console.log('Cambiando a escena boot3');
            // Limpiar referencias antes de cambiar de escena
            // Desactivar actualizaciones en objetos que podrían causar problemas
            if (this.gameUI) {
              this.gameUI.update = () => {}; // Reemplazar con función vacía para evitar actualizaciones
              this.gameUI.destroy();
              this.gameUI = null;
            }
            
            // Desactivar eventos y timers
            this.events.off('update');
            
            // Usar switch en lugar de start para una transición más limpia
            this.scene.switch('boot3');
          });
        },
        null,
        this
      );
    }
    
    // Evento de game over (cuando se acaban las vidas)
    this.events.on('gameOver', () => {
      console.log('[Level2] Evento gameOver recibido. Cambiando a GameOverScene.');
      
      // Desactivar controles del jugador
      this.player.body.setVelocity(0, 0);
      this.player.body.allowGravity = false;
      
      // Efecto de fade out
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      
      // Transición a GameOverScene
      this.time.delayedCall(1000, () => {
        console.log('[Level2] Cambiando a escena GameOverScene');
        // Limpiar referencias antes de cambiar de escena
        // Desactivar actualizaciones en objetos que podrían causar problemas
        if (this.gameUI) {
          this.gameUI.update = () => {}; // Reemplazar con función vacía para evitar actualizaciones
          this.gameUI.destroy();
          this.gameUI = null;
        }
        
        // Limpiar grupos y objetos que pueden causar problemas
        if (this.enemies) {
          this.enemies.clear(true, true);
        }
        
        if (this.bolas) {
          this.bolas.clear(true, true);
        }
        
        // Limpiar otros grupos y objetos
        ['spikes', 'ladders', 'diamantes', 'barriles', 'rocas', 'carteles'].forEach(groupName => {
          if (this[groupName]) {
            this[groupName].clear(true, true);
          }
        });
        
        // Eliminar al jugador y objetos relacionados
        if (this.player) {
          // Limpiar objetos visuales del jugador
          if (this.player.hand) this.player.hand.destroy();
          if (this.player.mainWeapon) this.player.mainWeapon.destroy();
          if (this.player.explosiveWeapon) this.player.explosiveWeapon.destroy();
          if (this.player.shotgunWeapon) this.player.shotgunWeapon.destroy();
          
          // Desactivar el cuerpo físico del jugador para evitar referencias circulares
          this.player.body = null;
        }
        
        // Desactivar eventos y timers
        this.events.off('update');
        
        // Usar start en lugar de switch para una reinicialización completa de la escena
        this.scene.start('GameOverScene', { level: 'level2' });
      });
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
      cambiarWeapon: Phaser.Input.Keyboard.KeyCodes.X,
      sacarEscudo: Phaser.Input.Keyboard.KeyCodes.FOUR,     // Tecla 4: Escudo
      sacarArmaOne: Phaser.Input.Keyboard.KeyCodes.ONE,     // Tecla 1: Rifle (arma principal)
      sacarArmaTwo: Phaser.Input.Keyboard.KeyCodes.TWO,     // Tecla 2: Escopeta
      sacarArmaThree: Phaser.Input.Keyboard.KeyCodes.THREE  // Tecla 3: Arma explosiva
    });
  }

  update() {
    if (!this.player) return;

    // En update()
    const cam = this.cameras.main;
    // la capa de fondo lejano se mueve despacio:
    this.bgFar.tilePositionX = cam.scrollX * 0.2;
    // la capa más cercana, más rápido:
    this.bgNear.tilePositionX = cam.scrollX * 0.8;

    try {
      // Verificar la superposición con las escaleras antes de resetear
      const isOnLadder = this.physics.overlap(this.player, this.ladders);
      
      if (!isOnLadder) {
        this.player.canClimb = false;
        this.player.currentLadder = null;
      }
      
      // Comprobar si el jugador ha caído fuera del mapa
      this.checkPlayerFallOffMap();
      
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
      
      // Actualizar UI
      if (this.gameUI) {
        this.gameUI.update();
      }
    } catch (error) {
      console.error('Error en update:', error);
    }
  }
  
  /**
   * Comprueba si el jugador ha caído fuera del mapa y respawnea si es necesario
   */
  checkPlayerFallOffMap() {
    // Aumentamos significativamente la altura del umbral de detección
    // Ahora detecta 2000 píxeles antes del límite inferior del mundo
    const fallThreshold = this.physics.world.bounds.height - 800;
    
    // Si el jugador ya está muriendo o está en transición, no hacer nada
    if (this.player.isDying || this.player.state === PLAYER_STATE.DEAD || 
        this.isTransitioning || this.isPlayerFalling) {
      return;
    }
    
    if (this.player.y > fallThreshold) {
      console.log('[Level2] El jugador ha caído fuera del mapa');
      
      // Marcar que el jugador está cayendo para evitar llamadas múltiples
      this.isPlayerFalling = true;
      
      // Detener la velocidad vertical del jugador para que no siga cayendo
      this.player.setVelocityY(0);
      
      // Llamar a silentDie inmediatamente sin retraso
      this.player.silentDie();
      
      // Restaurar la bandera después de un breve tiempo
      this.time.delayedCall(500, () => {
        this.isPlayerFalling = false;
      });
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

  /**
   * Muestra una notificación visual destacada cuando se desbloquea un objeto
   * @param {string} nombreObjeto - Nombre del objeto desbloqueado
   * @param {number} x - Posición X donde se desbloqueó
   * @param {number} y - Posición Y donde se desbloqueó
   */
  mostrarNotificacionObjeto(nombreObjeto, x, y) {
    // Crear un contenedor para la notificación
    const notificationContainer = this.add.container(this.cameras.main.centerX, 100);
    notificationContainer.setDepth(1000); // Asegurar que esté por encima de todo
    
    // Fondo de la notificación
    const bg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.7);
    bg.setStrokeStyle(3, this.getColorForObject(nombreObjeto));
    
    // Título de la notificación
    const title = this.add.text(0, -20, '¡OBJETO DESBLOQUEADO!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Texto con el nombre del objeto
    const objectText = this.add.text(0, 10, this.getDisplayNameForObject(nombreObjeto), {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: this.getColorHexForObject(nombreObjeto),
      align: 'center'
    }).setOrigin(0.5);
    
    // Añadir al contenedor
    notificationContainer.add([bg, title, objectText]);
    
    // Animación de entrada
    notificationContainer.setAlpha(0);
    notificationContainer.setScale(0.8);
    
    this.tweens.add({
      targets: notificationContainer,
      y: 120,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Pequeño efecto de rebote
        this.tweens.add({
          targets: notificationContainer,
          y: 130,
          duration: 200,
          yoyo: true,
          repeat: 1
        });
        
        // Mantener visible y luego desaparecer
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: notificationContainer,
            y: 80,
            alpha: 0,
            scale: 0.8,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
              notificationContainer.destroy();
            }
          });
        });
      }
    });
    
    // Crear un efecto de partículas en la posición del objeto
    if (this.particles) {
      const color = this.getColorNumberForObject(nombreObjeto);
      const emitter = this.particles.createEmitter({
        x: x,
        y: y,
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        lifespan: 1500,
        blendMode: 'ADD',
        tint: color
      });
      
      // Emitir partículas y luego detener
      emitter.explode(40);
      this.time.delayedCall(1500, () => {
        emitter.stop();
      });
    }
    
    // Actualizar UI si existe
    if (this.gameUI) {
      this.gameUI.update();
    }
  }
  
  /**
   * Aplica el efecto del objeto desbloqueado al jugador
   * @param {string} nombreObjeto - Nombre del objeto a dar al jugador
   */
  darObjetoAJugador(nombreObjeto) {
    if (!this.player) return;
    
    // Diferentes efectos según el tipo de objeto
    switch (nombreObjeto.toLowerCase()) {
      case 'jetpack':
        this.player.darJetpack();
        break;
        
      case 'escopeta':
        this.player.darEscopeta();
        break;

      case 'rifle':
        this.player.darRifle();
        break;
        
      case 'explosivo':
        this.player.darArmaExplosiva();
        break;
        
      case 'paracaidas':
        this.player.darParacaidas();
        break;
        
      case 'escudo':
        this.player.darEscudo();
        break;
        
      case 'velocidad':
        this.player.aumentarVelocidad();
        break;
        
      default:
        console.log(`Objeto no reconocido: ${nombreObjeto}`);
        break;
    }
  }
  
  /**
   * Devuelve un color adecuado para cada tipo de objeto
   * @param {string} nombreObjeto - Nombre del objeto
   * @returns {number} - Color en formato 0xRRGGBB
   */
  getColorNumberForObject(nombreObjeto) {
    switch (nombreObjeto.toLowerCase()) {
      case 'jetpack':
        return 0x44aaff;
      case 'escopeta':
        return 0xff5544;
      case 'rifle':
        return 0x33bbaa;
      case 'paracaidas':
        return 0x66ee66;
      case 'escudo':
        return 0xaaaaff;
      case 'velocidad':
        return 0xffaa44;
      case 'explosivo':
        return 0xff8800;
      default:
        return 0xffffff;
    }
  }
  
  /**
   * Devuelve el color en formato CSS para cada tipo de objeto
   * @param {string} nombreObjeto - Nombre del objeto
   * @returns {string} - Color en formato #RRGGBB
   */
  getColorHexForObject(nombreObjeto) {
    switch (nombreObjeto.toLowerCase()) {
      case 'jetpack':
        return '#44aaff';
      case 'escopeta':
        return '#ff5544';
      case 'rifle':
        return '#33bbaa';
      case 'paracaidas':
        return '#66ee66';
      case 'escudo':
        return '#aaaaff';
      case 'velocidad':
        return '#ffaa44';
      case 'explosivo':
        return '#ff8800';
      default:
        return '#ffffff';
    }
  }
  
  /**
   * Devuelve el nombre a mostrar en la notificación para cada tipo de objeto
   * @param {string} nombreObjeto - Nombre interno del objeto
   * @returns {string} - Nombre formateado para mostrar
   */
  getDisplayNameForObject(nombreObjeto) {
    switch (nombreObjeto.toLowerCase()) {
      case 'jetpack':
        return '¡JETPACK!';
      case 'escopeta':
        return '¡ESCOPETA!';
      case 'rifle':
        return '¡RIFLE!';
      case 'paracaidas':
        return '¡PARACAÍDAS!';
      case 'escudo':
        return '¡ESCUDO PROTECTOR!';
      case 'velocidad':
        return '¡VELOCIDAD TURBO!';
      case 'explosivo':
        return '¡ARMA EXPLOSIVA!';
      default:
        return nombreObjeto.toUpperCase();
    }
  }
  
  /**
   * Devuelve el color en formato 0xRRGGBB para el stroke del rectángulo
   * @param {string} nombreObjeto - Nombre del objeto
   * @returns {number} - Color en formato 0xRRGGBB
   */
  getColorForObject(nombreObjeto) {
    return this.getColorNumberForObject(nombreObjeto);
  }
}

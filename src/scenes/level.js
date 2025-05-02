import Phaser from 'phaser';
import Player from '../player.js';
import { Enemy1, STATE, PatrollingEnemy } from '../enemys/enemy1.js';
import { Enemy2, STATE2, PatrollingEnemy2 } from '../enemys/enemy2.js';
import { Enemy3, STATE3, PatrollingEnemy3, AttackingEnemy3, SmartEnemy3  } from '../enemys/enemy3.js';
import Pincho from '../gameObjects/Pincho.js';
import Escalera from '../gameObjects/Escalera.js';
import BolaGrande from '../gameObjects/BolaGrande.js';
import Diamante from '../gameObjects/Diamante.js';
import Barril from '../gameObjects/Barril.js';
import RocaDestructible from '../gameObjects/RocaDestructible.js';

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
    this.player.setPosition(100, 750); // Posición inicial
    
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

    // Crear barriles desde el mapa
    this.barriles = Barril.createFromMap(this, this.map, 'Barriles');

    // Crear rocas destructibles desde el mapa
    this.rocas = RocaDestructible.createFromMap(this, this.map, 'RocasDestructibles');
    
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


      { x: 2000, y: 350, type: 'patrolling' },
      { x: 2300, y: 350, type: 'patrolling' },
      { x: 3200, y: 300, type: 'patrolling' },
      { x: 3940, y: 800, type: 'patrolling' },
      { x: 4040, y: 800, type: 'patrolling' },
      { x: 4600, y: 700, type: 'patrolling' },
      { x: 4040, y: 400, type: 'patrolling' },
      { x: 3900, y: 350, type: 'patrolling' },
      { x: 4200, y: 100, type: 'patrolling' }

    ];
    
    // Posiciones de enemigos tipo 2
    const enemy2Positions = [
      //{ x: 700, y: 1750, type: 'normal' },
      //{ x: 3200, y: 1150, type: 'patrolling' },
      //{ x: 3650, y: 1250, type: 'patrolling' },
      //{ x: 3400, y: 2000, type: 'normal' },
      //{ x: 3500, y: 2000, type: 'normal' },

      //{ x: 4403, y: 1570, type: 'patrolling' },
      //{ x: 5111, y: 1602, type: 'patrolling' },
      //{ x: 5628, y: 1250, type: 'patrolling' },
      //{ x: 6303, y: 1122, type: 'patrolling' },


      //{ x: 6461, y: 930, type: 'patrolling' },    //ESTATICO
      //{ x: 6151, y: 930, type: 'patrolling' }   //ESTATICO

      //{ x: 7134, y: 1058, type: 'patrolling' },
      //{ x: 7134, y: 1058, type: 'patrolling' },
      //{ x: 7734, y: 962, type: 'patrolling' }


    ];


     // Posiciones de enemigos tipo 3
     const enemy3Positions = [
      //{ x: 500, y: 700, type: 'smart' },
      { x: 500, y: 700, type: 'attacking' }
      //{ x: 500, y: 700, type: 'patrolling' }

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
    
    // Colisión jugador-balas enemigas
    if (this.enemyBullets) {
      this.physics.add.overlap(
        this.player.escudo,
        this.enemyBullets,
        (escudo, enemyBullet) => {
          if (!enemyBullet) return;
          enemyBullet.destroy(); 
        },
        null,
        this
      );

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
      cambiarWeapon: Phaser.Input.Keyboard.KeyCodes.X,
      sacarEscudo: Phaser.Input.Keyboard.KeyCodes.ONE,
      sacarArmaOne: Phaser.Input.Keyboard.KeyCodes.TWO,
      sacarArmaTwo: Phaser.Input.Keyboard.KeyCodes.THREE,
      sacarArmaThree: Phaser.Input.Keyboard.KeyCodes.FOUR
      

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

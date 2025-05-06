import Phaser from 'phaser';
import BolaGrande from '../gameObjects/BolaGrande.js';
import { BaseEnemy, ENEMY_STATE } from './enemy';

// Exportamos STATEBOSS como alias de ENEMY_STATE para mantener compatibilidad
export const STATEBOSS = ENEMY_STATE;

const DAMAGE_ENEMY = 50;

export class Boss extends BaseEnemy {
  constructor(scene, x, y) {
    const config = {
      spriteKey: 'boss',
      speed: 10, // Velocidad original
      health: 500, // Salud original
      damage: DAMAGE_ENEMY,
      detectionRange: 500,
      attackRange: 500,
      attackCooldown: 4000, // Cooldown aumentado a 1.5 segundos (era 200ms)
      verticalTolerance: 180,
      attackDuration: 400, // Duración original
      hitboxWidth: 35, // Hitbox original
      hitboxHeight: 55,
      walkAnim: 'boss_walk',
      idleAnim: 'boss_idle',
      attackAnim: 'boss_attack1',
      hurtAnim: 'boss_hurt',
      dieAnim: 'boss_die',
      attackSound: 'shootgun'
    };

    super(scene, x, y, config);

    // Configuración específica de Boss
    this.bulletSpeed = 300; // Velocidad original
    this.bulletDamage = DAMAGE_ENEMY;
    this.lastBulletTime = 0;
    this.bulletCooldown = 4000; // Cooldown aumentado 
    this.attackAnim1 = 'boss_attack1';
    this.attackAnim2 = 'boss_attack2';
    this.specialAnim = 'boss_special';
    this.horizontalTolerence = 50;


    this.lastSpecialTime =  0; 
    this.specialCoolDown = 10000;
    this.specialDuration = 1200;
    this.enemys3 = ['smart', 'attacking', 'patrolling'];
     

    this.offsetX = 45;
    this.offsetY = 40;


    this.setSize(config.hitboxWidth, config.hitboxHeight);
    this.setOffset(this.offsetX, this.offsetY);
    this.setScale(2);

  



    // Guardar referencia al mapa para la detección de bordes
    this.map = null;
  }


  chase() {
    this.state = ENEMY_STATE.CHASING;
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.speed * direction);
    this.setFlipX(direction === -1);
    this.setOffset(direction === -1 ? this.offsetX : 10, this.offsetY);
    this.play(this.config.walkAnim, true);
  }

  patrol() {
    this.state = ENEMY_STATE.PATROLLING;
    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction === -1);
    this.setOffset(this.direction === -1 ? this.offsetX : 10, this.offsetY);
  }



  executeAttack() {
    if (this.player && !this.attackDamageDealt) {

      // Girar hacia el jugador antes de atacar
      this.setFlipX(this.player.x < this.x);
      
      
      // Disparar la bala
      this.shootBullet();

    }
  }

  shootBullet() {
    // Verificar el cooldown entre disparos
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastBulletTime < this.bulletCooldown) {
      return; // Todavía en cooldown, no disparar
    }
    
    // Actualizar el tiempo del último disparo
    this.lastBulletTime = currentTime;
    
    // Calcular dirección hacia el jugador
    const direction = new Phaser.Math.Vector2(this.player.x - this.x, this.player.y - this.y).normalize();

    // Calcular posición inicial de la bala
    const bulletX = this.x + direction.x * 20;
    const bulletY = this.y + direction.y * 20;

    // Crear la bala
    if (this.scene.enemyBullets) {
      const bullet = this.scene.enemyBullets.create(bulletX, bulletY, 'bossBullet');
      bullet.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y));
      bullet.setSize(13, 13);
      bullet.lifespan = 5000;
      bullet.damage = this.damage;
      bullet.owner = this;
      
      // Configurar velocidad de la bala hacia el jugador
      bullet.setVelocity(direction.x * this.bulletSpeed, direction.y * this.bulletSpeed);
      
      // Asegurar que la bala no esté afectada por la gravedad
      bullet.body.allowGravity = false;
      
      // Efecto visual de disparo 
      this.scene.cameras.main.shake(100, 0.005);
    }
  }

  hasObstacleBetween() {
    if (!this.scene || !this.scene.layerSuelo) return false;

    const start = new Phaser.Math.Vector2(this.x, this.y);
    const end = new Phaser.Math.Vector2(this.player.x, this.player.y);
    const steps = 10; // Cuántos puntos intermedios verificar

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkX = Phaser.Math.Linear(start.x, end.x, t);
      const checkY = Phaser.Math.Linear(start.y, end.y, t);

      const tile = this.scene.layerSuelo.getTileAtWorldXY(checkX, checkY);

      if (tile && tile.collides) {
        return true; // Hay un obstáculo en el camino
      }
    }

    return false; // No hay obstáculos
  }
  


  // Sobrescribir canAttack para incluir la verificación de obstáculos y cooldown
  canAttack(horizontalDist, verticalDiff) {
    const currentTime = this.scene.time.now;
    return horizontalDist < this.attackRange && 
           verticalDiff < this.attackRange && 
           this.state !== ENEMY_STATE.HURT && 
           !this.hasObstacleBetween() &&
           currentTime - this.lastAttackTime >= this.attackCooldown;
  }
  


  // Sobrescribir preUpdate para mantener la lógica original
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === ENEMY_STATE.DEAD) return;

    // Actualizar posición del hitbox de ataque
    if (this.attackHitbox) {
      const offsetX = this.flipX ? this.offsetX : 10;
      this.setOffset( offsetX, this.offsetY);
    }

    // Solo si hay jugador y no está atacando:
    if (this.player && !this.isAttacking && !this.isSpecial) {

      const horizontalDist = Math.abs(this.x - this.player.x);
      const verticalDiff = Math.abs(this.y - this.player.y);
      const withinVerticalTolerance = verticalDiff < this.verticalTolerance;
      const withinHorizontalTolerance = horizontalDist < this.horizontalTolerence;
      
      // Para Boss, comprobar específicamente si puede atacar (con cooldown, rango y obstáculos)
      if(this.canSpecial()) {
        this.specialSkill();
      }
      else if (this.canAttack(horizontalDist, verticalDiff)) {
        this.attack();

      } else if(withinHorizontalTolerance){

         this.setVelocityX(0);
      }
      else if (horizontalDist < this.detectionRange && withinVerticalTolerance &&  this.state !== ENEMY_STATE.HURT && !this.hasObstacleBetween() ) {
        this.chase();

      } else if (this.state !== ENEMY_STATE.HURT)  {
        this.patrol();
      }


      

    }

    this.handleWallCollision();
    this.updateAnimation();
  }


  canSpecial(){
    const currentTime = this.scene.time.now;
    return this.state !== ENEMY_STATE.HURT && 
           currentTime - this.lastSpecialTime >= this.specialCoolDown;
  }



  specialSkill(){

    if (this.state === ENEMY_STATE.DEAD || this.isAttacking || this.isSpecial) return;

   this.isSpecial = true;
   this.state = ENEMY_STATE.ATTACKING;
   this.setVelocityX(0);
   this.play(this.specialAnim, true);
   this.scene.cameras.main.shake(200, 0.005);


   // Timer para finalizar el ataque
   this.scene.time.delayedCall(this.specialDuration, () => {
    this.finishSpecial();
    
   
    if (Phaser.Math.Between(0, 1) === 0) {
      this.spawnEnemies(); 
    } else {
      this.crearLluviaLocalBolas();
    }
   

 
   });

  }

  crearLluviaLocalBolas() {
    const numBolas = 5;
    const distanciaEntreBolas = 100;
    const alturaSpawn = 250;
    const bolas = this.scene.physics.add.group();
  
    const inicioX = this.x - ((numBolas - 1) * distanciaEntreBolas) / 2;
    const y = this.y - alturaSpawn;
  
    const explosionEmitterManager = this.scene.add.particles('blue_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      quantity: 10,
      emitting: false
    });
  
    for (let i = 0; i < numBolas; i++) {
      const x = inicioX + i * distanciaEntreBolas;
  
      // Usar tu clase personalizada con daño
      const bola = new BolaGrande(this.scene, x, y, 'bola_grande', true, 30);
      this.scene.add.existing(bola);
      this.scene.physics.add.existing(bola);
      bolas.add(bola);
  
      bola.setVelocityY(200);
      bola.setBounce(0.5);
      bola.setScale(0.3);
      bola.setCollideWorldBounds(true);
  
      const explotar = () => {
        explosionEmitterManager.emitParticleAt(bola.x, bola.y, 10);
        bola.destroy();
      };
  
      this.scene.physics.add.collider(bola, this.scene.layerSuelo, explotar);
      this.scene.physics.add.overlap(this.scene.player, bola, (player, bola) => {
        if (bola.doDamage) {
          bola.doDamage(player);
        }
        explotar();
      });
    }
  }
  
  
  
  

  spawnEnemies(){

    let enemy3Positions = this.enemys3.map(type => ({
        x: this.x + Phaser.Math.Between(-30, 30),
        y: this.y + Phaser.Math.Between(-30, 30),
        type
      }));
    enemy3Positions.forEach(pos => this.scene.createEnemy3(pos));


  }
 

  finishSpecial(){
    this.isSpecial = false;
    this.lastSpecialTime =this.scene.time.now;

    if (this.state !== ENEMY_STATE.HURT && this.state !== ENEMY_STATE.DEAD) {
        const horizontalDist = this.player ? Math.abs(this.x - this.player.x) : Infinity;
        const verticalDiff = this.player ? Math.abs(this.y - this.player.y) : Infinity;
        const withinVertical = verticalDiff < this.verticalTolerance;
        
        if (horizontalDist < this.detectionRange && withinVertical) {
          this.chase();
        } else {
          this.patrol();
        }
      }
  }


  takeDamage(amount) {
    if (this.state === ENEMY_STATE.DEAD || this.isSpecial) return;
    this.health -= amount;
    
    if (this.state !== ENEMY_STATE.HURT) {
      this.state = ENEMY_STATE.HURT;
      this.play(this.config.hurtAnim);
      this.once(`animationcomplete-${this.config.hurtAnim}`, () => {
        if (this.health <= 0) {
          this.die();
        } else {
          const horizontalDist = this.player ? Math.abs(this.x - this.player.x) : Infinity;
          const verticalDiff = this.player ? Math.abs(this.y - this.player.y) : Infinity;
          const withinVertical = verticalDiff < this.verticalTolerance;
          this.state = (horizontalDist < this.detectionRange && withinVertical) ? 
                      ENEMY_STATE.CHASING : ENEMY_STATE.PATROLLING;
        }
      });
    }
  }



  // Sobrescribir handleWallCollision para evitar el bug de quedarse atascado
  handleWallCollision() {
    if ((this.state === ENEMY_STATE.PATROLLING || this.state === ENEMY_STATE.CHASING) && 
        (this.body.blocked.left || this.body.blocked.right)) {
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(false);
        this.setOffset(0, this.offsetY);
        this.x += 5; // Mayor desplazamiento para evitar quedarse atascado
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(this.offsetX, this.offsetY);
        this.x -= 5; // Mayor desplazamiento para evitar quedarse atascado
      }
      
      // Si estaba persiguiendo y chocó, volver a patrullar temporalmente
      if (this.state === ENEMY_STATE.CHASING) {
        this.state = ENEMY_STATE.PATROLLING;
        // Programar un reintento de persecución después de un tiempo
        this.scene.time.delayedCall(1000, () => {
          const horizontalDist = this.player ? Math.abs(this.x - this.player.x) : Infinity;
          const verticalDiff = this.player ? Math.abs(this.y - this.player.y) : Infinity;
          if (horizontalDist < this.detectionRange && verticalDiff < this.verticalTolerance) {
            this.chase();
          }
        });
      }
    }
  }
}



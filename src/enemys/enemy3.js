import Phaser from 'phaser';
import { BaseEnemy, ENEMY_STATE } from './enemy';

// Exportamos STATE3 como alias de ENEMY_STATE para mantener compatibilidad
export const STATE3 = ENEMY_STATE;

const DAMAGE_ENEMY = 10;
const NORMAL_SPEED = 40;
const ATTACK_SPEED = NORMAL_SPEED *4;

export class Enemy3 extends BaseEnemy {
  constructor(scene, x, y) {
    const config = {
      spriteKey: 'enemy3',
      speed: NORMAL_SPEED, // Velocidad original
      health: 50, // Salud original
      damage: DAMAGE_ENEMY,
      detectionRange: 300,
      attackRange: 300,
      attackCooldown: 600, // Cooldown aumentado a 1.5 segundos (era 200ms)
      verticalTolerance: 80,
      attackDuration: 400, // Duración original
      hitboxWidth: 300, // Hitbox original
      hitboxHeight: 60,
      walkAnim: 'enemy3_walk',
      idleAnim: 'enemy3_idle',
      attackAnim: 'enemy3_attack',
      hurtAnim: 'enemy3_hurt',
      dieAnim: 'enemy3_die',
      attackSound: 'shootgun'
    };

    super(scene, x, y, config);

    // Configuración específica de Enemy3
    this.bulletSpeed = 600; // Velocidad original
    this.bulletDamage = DAMAGE_ENEMY;
    this.lastBulletTime = 0;
    this.bulletCooldown = 600; // Cooldown aumentado a 1.5 segundos (era 200ms)

    //ATRIBUTOS ÚNICOS DE LA MAQUINA VOLADORA
    this.body.allowGravity = false;
    this.originPosition = new Phaser.Math.Vector2(x, y); // Guardamos posición de origen
    this.patrolOffset = 60; // Máximo que puede alejarse de origen
    this.randomMoveTimer = 0;
    this.originalSpeed = this.speed;
    this.isSprinting = false;
    this.lastSprintTime = 0;


    // Guardar referencia al mapa para la detección de bordes
    this.map = null;
  }

  executeAttack() {
    if (this.player && !this.attackDamageDealt) {  
      // Reproducir la animación correcta
      this.play('enemy3_attack', true);
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
      const bullet = this.scene.enemyBullets.create(bulletX, bulletY, 'bullet');
      bullet.setRotation(Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y));
      bullet.damage = this.damage;
      bullet.owner = this;
      
      // Configurar velocidad de la bala hacia el jugador
      bullet.setVelocity(direction.x * this.bulletSpeed, direction.y * this.bulletSpeed);
      
      // Asegurar que la bala no esté afectada por la gravedad
      bullet.body.allowGravity = false;
      
      // Efecto visual de disparo (opcional)
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
      const offsetX = this.flipX ? -30 : 30;
      this.attackHitbox.setPosition(this.x + offsetX, this.y);
    }

    // Solo si hay jugador y no está atacando:
    if (this.player && !this.isAttacking) {
      const horizontalDist = Math.abs(this.x - this.player.x);
      const verticalDiff = Math.abs(this.y - this.player.y);
      const withinVerticalTolerance = verticalDiff < this.verticalTolerance;

      // Para Enemy3, comprobar específicamente si puede atacar (con cooldown, rango y obstáculos)
      if (this.canAttack(horizontalDist, verticalDiff)) {
        this.attack();

      } else if (horizontalDist < this.detectionRange && withinVerticalTolerance && 
                 this.state !== ENEMY_STATE.HURT && !this.hasObstacleBetween()) {

        this.chase();

      } else if (this.state !== ENEMY_STATE.HURT && this.state !== ENEMY_STATE.DEAD) {
        this.patrol();
      }
    }

    //this.handleWallCollision();
    this.updateAnimation();
  }


  
  // Sobrescribir handleWallCollision para evitar el bug de quedarse atascado
  handleWallCollision() {
    if ((this.state === ENEMY_STATE.PATROLLING || this.state === ENEMY_STATE.CHASING) && 
        (this.body.blocked.left || this.body.blocked.right)) {
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(false);
        this.setOffset(0, 0);
        this.x += 5; // Mayor desplazamiento para evitar quedarse atascado
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(23, 0);
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



// Clase especializada para enemigos que detectan bordes
export class PatrollingEnemy3 extends Enemy3 {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.edgeDetectionEnabled = true;
    this.edgeDetectionDistance = 50;
    this.groundCheckDistance = 60;
    this.lastDirectionChange = 0;
    this.directionChangeDelay = 500;
  }

  patrol() {
    this.state = STATE3.PATROLLING;
    const currentTime = this.scene.time.now;
  
    // --- GESTIÓN DE SPRINT ---
    if (!this.isSprinting && currentTime - (this.lastSprintTime || 0) > 6000) {
      this.isSprinting = true;
      this.sprintEndTime = currentTime + 3000; // Sprint dura 1 segundo
      this.speed = ATTACK_SPEED; // *4 velocidad
      this.lastSprintTime = currentTime;
    }
  
    if (this.isSprinting && currentTime > this.sprintEndTime) {
      this.isSprinting = false;
      this.speed = this.originalSpeed; // Vuelve a velocidad normal
    }
  
    // --- PATROLLING ---
    if (!this.patrolTarget || Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y) < 10) {
      const offsetX = Phaser.Math.Between(-this.patrolOffset * 3, this.patrolOffset * 3);
      const offsetY = Phaser.Math.Between(-this.patrolOffset, this.patrolOffset);
  
      this.patrolTarget = {
        x: this.originPosition.x + offsetX,
        y: this.originPosition.y + offsetY
      };
    }
  
    const dx = this.patrolTarget.x - this.x;
    const dy = this.patrolTarget.y - this.y;
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
  
    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);
    this.setOffset(vx < 0 ? 23 : 0, 0);
  }
  
}




export class AttackingEnemy3 extends Enemy3 {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.edgeDetectionEnabled = true;
    this.edgeDetectionDistance = 50;
    this.groundCheckDistance = 60;
    this.lastDirectionChange = 0;
    this.directionChangeDelay = 500;
    this.damage = DAMAGE_ENEMY * 5;
  }

  patrol() {
    this.state = STATE3.PATROLLING;
    const currentTime = this.scene.time.now;
  
    // --- GESTIÓN DE SPRINT ---
    if (!this.isSprinting && currentTime - (this.lastSprintTime || 0) > 6000) {
      this.isSprinting = true;
      this.sprintEndTime = currentTime + 3000; // Sprint dura 1 segundo
      this.speed = ATTACK_SPEED; // *4 velocidad
      this.lastSprintTime = currentTime;
    }
  
    if (this.isSprinting && currentTime > this.sprintEndTime) {
      this.isSprinting = false;
      this.speed = this.originalSpeed; // Vuelve a velocidad normal
    }
  
    // --- PATROLLING ---
    if (!this.patrolTarget || Phaser.Math.Distance.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y) < 10) {
      const offsetX = Phaser.Math.Between(-this.patrolOffset * 3, this.patrolOffset * 3);
      const offsetY = Phaser.Math.Between(-this.patrolOffset, this.patrolOffset);
  
      this.patrolTarget = {
        x: this.originPosition.x + offsetX,
        y: this.originPosition.y + offsetY
      };
    }
  
    const dx = this.patrolTarget.x - this.x;
    const dy = this.patrolTarget.y - this.y;
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
  
    this.setVelocity(vx, vy);
    this.setFlipX(vx < 0);
    this.setOffset(vx < 0 ? 23 : 0, 0);
  }



  attack() {
    if (this.state === ENEMY_STATE.DEAD || this.isAttacking) return;

    // Si hay obstáculo entre enemigo y jugador, dejar de atacar
    if (this.hasObstacleBetween()) {
      this.state = ENEMY_STATE.PATROLLING;
      this.isAttacking = false;
      return;
    }

    this.isAttacking = true;
    this.state = ENEMY_STATE.ATTACKING;
    this.attackDamageDealt = false;

    // Activar hitbox de ataque si tienes una
    this.attackHitbox?.body?.enable && (this.attackHitbox.body.enable = true);

  }




  executeAttack() {
    if (!this.player || this.state === ENEMY_STATE.DEAD) return;

    this.play('enemy3_attack', true);
    this.setTint(0xff0000);   // rojo al atacar

    // Movimiento hacia el jugador en X e Y
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const angle = Math.atan2(dy, dx);
    const vx = Math.cos(angle) * ATTACK_SPEED;
    const vy = Math.sin(angle) * ATTACK_SPEED;

    this.setVelocity(vx, vy);

  }

  // Detectar colisión con el jugador
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    if (this.state === ENEMY_STATE.ATTACKING && this.player && !this.attackDamageDealt) {

      if (this.hasObstacleBetween()) {
        this.state = ENEMY_STATE.PATROLLING;
        this.isAttacking = false;
        this.clearTint();
        return;
      }

      this.executeAttack(); //PARA QUE PERSIGA AL JUAGDOR
        
    } 


    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.player.getBounds());
    if (overlap) {          
      this.attackDamageDealt = true;
      this.player.takeDamage(this.damage, this); 
      this.die(); // El alien muere al golpear 
      return   
    }


  }



}

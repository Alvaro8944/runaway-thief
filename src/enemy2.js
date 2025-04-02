import Phaser from 'phaser';
import { BaseEnemy, ENEMY_STATE } from './enemy';

// Exportamos STATE2 como alias de ENEMY_STATE para mantener compatibilidad
export const STATE2 = ENEMY_STATE;

const DAMAGE_ENEMY = 20;

export class Enemy2 extends BaseEnemy {
  constructor(scene, x, y) {
    const config = {
      spriteKey: 'enemy2',
      speed: 40, // Velocidad original
      health: 50, // Salud original
      damage: DAMAGE_ENEMY,
      detectionRange: 300,
      attackRange: 300,
      attackCooldown: 200, // Cooldown original
      verticalTolerance: 80,
      attackDuration: 400, // Duración original
      hitboxWidth: 300, // Hitbox original
      hitboxHeight: 300,
      walkAnim: 'enemy2_walk',
      idleAnim: 'enemy2_idle',
      attackAnim: 'enemy2_attack',
      hurtAnim: 'enemy2_hurt',
      dieAnim: 'enemy2_die',
      attackSound: 'shootgun'
    };

    super(scene, x, y, config);

    // Configuración específica de Enemy2
    this.bulletSpeed = 800; // Velocidad original
    this.bulletDamage = DAMAGE_ENEMY;
    this.lastBulletTime = 0;
    this.bulletCooldown = 200;
    
    // Guardar referencia al mapa para la detección de bordes
    this.map = null;
  }

  executeAttack() {
    if (this.player && !this.attackDamageDealt) {
      // Calcular ángulo hacia el jugador
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
      
      // Determinar la animación en función del ángulo
      let animKey = 'enemy2_attack'; // Por defecto horizontal
      if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
          animKey = 'enemy2_attack_up';
      } else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
          animKey = 'enemy2_attack_down';
      }

      // Girar hacia el jugador antes de atacar
      this.setFlipX(this.player.x < this.x);
      
      // Reproducir la animación correcta
      this.play(animKey, true);
      
      // Disparar la bala
      this.shootBullet();
    }
  }

  shootBullet() {
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
  
  // Sobrescribir canAttack para incluir la verificación de obstáculos
  canAttack(horizontalDist, verticalDiff) {
    return horizontalDist < this.attackRange && 
           verticalDiff < this.attackRange && 
           this.state !== ENEMY_STATE.HURT && 
           !this.hasObstacleBetween();
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

      // Para Enemy2, comprobar específicamente si puede atacar (sin cooldown, solo rango y obstáculos)
      if (horizontalDist < this.attackRange && verticalDiff < this.attackRange && 
          this.state !== ENEMY_STATE.HURT && !this.hasObstacleBetween()) {
        this.attack();
      } else if (horizontalDist < this.detectionRange && withinVerticalTolerance && 
                 this.state !== ENEMY_STATE.HURT && !this.hasObstacleBetween()) {
        this.chase();
      } else if (this.state !== ENEMY_STATE.HURT) {
        this.patrol();
      }
    }

    this.handleWallCollision();
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
        this.setOffset(0, 13);
        this.x += 5; // Mayor desplazamiento para evitar quedarse atascado
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(23, 13);
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
export class PatrollingEnemy2 extends Enemy2 {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.edgeDetectionEnabled = true;
    this.edgeDetectionDistance = 50;
    this.groundCheckDistance = 60;
    this.lastDirectionChange = 0;
    this.directionChangeDelay = 500;
  }

  patrol() {
    this.state = STATE2.PATROLLING;
    
    if (this.edgeDetectionEnabled && this.scene.layerSuelo) {
      const currentTime = this.scene.time.now;
      
      // Solo comprobar el borde si ha pasado suficiente tiempo desde el último cambio
      if (currentTime - this.lastDirectionChange >= this.directionChangeDelay) {
        // Detectar si hay suelo adelante
        const groundCheck = {
          x: this.x + (this.direction * this.edgeDetectionDistance),
          y: this.y + this.groundCheckDistance
        };

        const bounds = this.scene.physics.world.bounds;
        
        // Usar layerSuelo directamente desde la escena
        const tile = this.scene.layerSuelo.getTileAtWorldXY(groundCheck.x, groundCheck.y);
        
        // Si no hay suelo adelante o llegamos a los límites del mundo, cambiar dirección
        if (!tile || !tile.collides || 
            this.x <= bounds.x + 50 || 
            this.x >= bounds.width - 50) {
          this.direction *= -1;
          this.lastDirectionChange = currentTime;
        }
      }
    }

    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction === -1);
    this.setOffset(this.direction === -1 ? 23 : 0, 13);
  }
}

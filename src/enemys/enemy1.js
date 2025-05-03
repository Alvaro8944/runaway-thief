import Phaser from 'phaser';
import { BaseEnemy, ENEMY_STATE } from './enemy';

// Exportamos STATE como alias de ENEMY_STATE para mantener compatibilidad
export const STATE = ENEMY_STATE;

const DAMAGE_ENEMY = 20;

export class Enemy1 extends BaseEnemy {
  constructor(scene, x, y) {
    const config = {
      spriteKey: 'enemy1',
      speed: 80,
      health: 50,
      damage: DAMAGE_ENEMY,
      detectionRange: 150,
      attackRange: 50,
      attackCooldown: 1000,
      verticalTolerance: 20,
      attackDuration: 400,
      hitboxWidth: 40,
      hitboxHeight: 40,
      walkAnim: 'enemy1_walk',
      idleAnim: 'enemy1_idle',
      attackAnim: 'enemy1_attack',
      hurtAnim: 'enemy1_hurt',
      dieAnim: 'enemy1_die',
      attackSound: 'baseball'
    };

    super(scene, x, y, config);
    
    // Guardar referencia al mapa para la detección de bordes
    this.map = null;
  }

  executeAttack() {
    // Lógica específica de ataque para Enemy1
    if (this.attackHitbox && this.player && !this.attackDamageDealt) {
      // Timer para el daño en medio de la animación
      this.scene.time.delayedCall(this.attackDuration / 2, () => {
        if (this.state === ENEMY_STATE.ATTACKING && !this.attackDamageDealt) {
          this.checkAttackHit();
        }
      });
    }
  }
  
  checkAttackHit() {
    if (!this.player || this.attackDamageDealt) return;

    const hitboxBounds = this.attackHitbox.getBounds();
    const playerBounds = this.player.getBounds();

    if (Phaser.Geom.Rectangle.Overlaps(hitboxBounds, playerBounds)) {
      this.player.takeDamage(this.damage, this);
      this.attackDamageDealt = true;
    }
  }
  
  // Sobrescribir preUpdate para mantener la lógica original
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === ENEMY_STATE.DEAD) return;

    // Actualizar posición del hitbox de ataque
    if (this.attackHitbox) {
      const offsetX = this.flipX ? 23 : 0;
      this.setOffset( offsetX, 13);
    }


    // Solo si hay jugador y no está atacando:
    if (this.player && !this.isAttacking) {
      const horizontalDist = Math.abs(this.x - this.player.x);
      const verticalDiff = Math.abs(this.y - this.player.y);
      const withinVerticalTolerance = verticalDiff < this.verticalTolerance;

      // Para Enemy1, comprobar si puede atacar (con cooldown)
      if (horizontalDist < this.attackRange && withinVerticalTolerance && 
          time - this.lastAttackTime > this.attackCooldown && 
          this.state !== ENEMY_STATE.HURT) {
        this.attack();
      } else if (horizontalDist < this.detectionRange && withinVerticalTolerance && 
                 this.state !== ENEMY_STATE.HURT) {
        this.chase();
      } else if (this.state !== ENEMY_STATE.HURT) {
        this.patrol();
      }
    }

    this.handleWallCollision();
    this.updateAnimation();
  }
}

// Clase especializada para enemigos que detectan bordes
export class PatrollingEnemy extends Enemy1 {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.edgeDetectionEnabled = true;
    this.edgeDetectionDistance = 50;
    this.groundCheckDistance = 60;
    this.lastDirectionChange = 0;
    this.directionChangeDelay = 500;
  }

  patrol() {
    this.state = STATE.PATROLLING;
    
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

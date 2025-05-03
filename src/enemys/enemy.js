import Phaser from 'phaser';

export const ENEMY_STATE = {
  PATROLLING: 'PATROLLING',
  CHASING: 'CHASING',
  ATTACKING: 'ATTACKING',
  HURT: 'HURT',
  DEAD: 'DEAD'
};

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.spriteKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configuración física
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(24, 35);
    this.setOffset(0, 13);
    this.setScale(1.25);

    // Atributos de movimiento, salud y daño
    this.speed = config.speed;
    this.health = config.health;
    this.damage = config.damage;
    this.state = ENEMY_STATE.PATROLLING;
    this.direction = 1;
    this.setVelocityX(this.speed * this.direction);
    this.body.setGravityY(500);

    // Rangos de detección y ataque
    this.detectionRange = config.detectionRange;
    this.attackRange = config.attackRange;
    this.attackCooldown = config.attackCooldown;
    this.lastAttackTime = 0;
    this.verticalTolerance = config.verticalTolerance;

    // Referencia al jugador
    this.player = null;

    // Inicia con la animación de patrulla
    this.play(config.walkAnim);

    // Atributos de combate
    this.attackDuration = config.attackDuration;
    this.isAttacking = false;
    this.attackHitbox = null;
    this.attackDamageDealt = false;
    
    // Crear hitbox de ataque
    this.attackHitbox = scene.add.rectangle(0, 0, config.hitboxWidth, config.hitboxHeight);
    scene.physics.add.existing(this.attackHitbox, true);
    this.attackHitbox.body.enable = false;

    // Guardar configuración específica
    this.config = config;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === ENEMY_STATE.DEAD) return;

    // Actualizar posición del hitbox de ataque
    if (this.attackHitbox) {
      const offsetX = this.flipX ? 23 : 0;
      this.setOffset( offsetX, this.offsetY);
    }

    // Las clases hijas sobrescriben este método para implementar su propia lógica de IA
    this.handleWallCollision();
    this.updateAnimation();
  }

  handleWallCollision() {
    if ((this.state === ENEMY_STATE.PATROLLING || this.state === ENEMY_STATE.CHASING) && 
        (this.body.blocked.left || this.body.blocked.right)) {
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(false);
        this.setOffset(0, 13);
        this.x += 3;
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(23, 13);
        this.x -= 3;
      }
    }
  }

  updateAnimation() {
    if (this.state !== ENEMY_STATE.ATTACKING && this.state !== ENEMY_STATE.HURT) {
      if (this.body.velocity.x !== 0) {
        this.play(this.config.walkAnim, true);
      } else {
        this.play(this.config.idleAnim, true);
      }
    }
  }

  attack() {
    if (this.state === ENEMY_STATE.DEAD || this.isAttacking) return;

    this.isAttacking = true;
    this.state = ENEMY_STATE.ATTACKING;
    this.attackDamageDealt = false;
    this.setVelocityX(0);

    // Reproducir sonido de ataque
    if (this.config.attackSound) {
      const sound = this.scene.sound.add(this.config.attackSound);
      sound.play();
    }
    
    // Activar hitbox de ataque
    this.attackHitbox.body.enable = true;

    // Reproducir animación de ataque
    this.play(this.config.attackAnim, true);

    // Ejecutar lógica específica de ataque
    this.executeAttack();

    // Timer para finalizar el ataque
    this.scene.time.delayedCall(this.attackDuration, () => {
      this.finishAttack();
    });
  }

  executeAttack() {
    // Método que será sobrescrito por las clases hijas
  }

  finishAttack() {
    this.isAttacking = false;
    this.attackHitbox.body.enable = false;
    this.lastAttackTime = this.scene.time.now;
    
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

  chase() {
    this.state = ENEMY_STATE.CHASING;
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.speed * direction);
    this.setFlipX(direction === -1);
    this.setOffset(direction === -1 ? 23 : 0, 13);
    this.play(this.config.walkAnim, true);
  }

  patrol() {
    this.state = ENEMY_STATE.PATROLLING;
    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction === -1);
    this.setOffset(this.direction === -1 ? 23 : 0, 13);
  }

  takeDamage(amount) {
    if (this.state === ENEMY_STATE.DEAD) return;
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

  die() {
    this.state = ENEMY_STATE.DEAD;
    this.play(this.config.dieAnim);
    this.once(`animationcomplete-${this.config.dieAnim}`, () => {
      this.destroy();
    });
  }
} 
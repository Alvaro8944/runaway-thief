import Phaser from 'phaser';

export const STATE = {
  PATROLLING: 'PATROLLING',
  CHASING: 'CHASING',
  ATTACKING: 'ATTACKING',
  HURT: 'HURT',
  DEAD: 'DEAD'
};

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy1_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configuración física
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(24, 35);
    this.setOffset(0, 13);
    this.setScale(1.25);

    // Atributos de movimiento, salud y daño
    this.speed = 80;
    this.health = 50;
    this.damage = 10;
    this.state = STATE.PATROLLING; // Inicia patrullando
    this.direction = 1; // 1 = derecha, -1 = izquierda
    this.setVelocityX(this.speed * this.direction);
    this.body.setGravityY(500);

    // Rangos de detección y ataque
    this.detectionRange = 150; // Reducido para que sólo se active en distancias cortas
    this.attackRange = 50;
    this.attackCooldown = 1000; // ms
    this.lastAttackTime = 0;

    // Tolerancia vertical (en píxeles) para que el enemigo solo persiga/ataque si están a la misma altura
    this.verticalTolerance = 20;

    // Referencia al jugador (se asigna desde Level.js)
    this.player = null;

    // Inicia con la animación de patrulla
    this.play('enemy1_walk');

    // Mejoras en los atributos de combate
    this.attackDuration = 400; // Duración de la animación de ataque
    this.isAttacking = false;
    this.attackHitbox = null;
    this.attackDamageDealt = false;
    
    // Crear hitbox de ataque
    this.attackHitbox = scene.add.rectangle(0, 0, 40, 40);
    scene.physics.add.existing(this.attackHitbox, true);
    this.attackHitbox.body.enable = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === STATE.DEAD) return;

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

      if (horizontalDist < this.attackRange && withinVerticalTolerance && 
          time - this.lastAttackTime > this.attackCooldown && 
          this.state !== STATE.HURT) {
        this.attack();
      } else if (horizontalDist < this.detectionRange && withinVerticalTolerance && 
                 this.state !== STATE.HURT) {
        this.chase();
      } else if (this.state !== STATE.HURT) {
        this.patrol();
      }
    }

    // Si el enemigo está en PATROLLING o CHASING y se bloquea contra la pared, invertir la dirección
    if ((this.state === STATE.PATROLLING || this.state === STATE.CHASING) && (this.body.blocked.left || this.body.blocked.right)) {
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(false);
        this.setOffset(0, 13);
        this.x += 3; // Despegarse de la pared
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(23, 13);
        this.x -= 3;
      }
    }

    // Si no está atacando ni en estado hurt, reproducir la animación de movimiento
    if (this.state !== STATE.ATTACKING && this.state !== STATE.HURT) {
      if (this.body.velocity.x !== 0) {
        this.play('enemy1_walk', true);
      } else {
        this.play('enemy1_idle', true);
      }
    }
  }

  attack() {
    if (this.state === STATE.DEAD || this.isAttacking) return;

    this.isAttacking = true;
    this.state = STATE.ATTACKING;
    this.attackDamageDealt = false;
    this.setVelocityX(0);
    
    // Activar hitbox de ataque
    this.attackHitbox.body.enable = true;
    
    // Reproducir animación de ataque
    this.play('enemy1_attack', true);
    
    // Timer para el daño en medio de la animación
    this.scene.time.delayedCall(this.attackDuration / 2, () => {
      if (this.state === STATE.ATTACKING && !this.attackDamageDealt) {
        this.checkAttackHit();
      }
    });

    // Timer para finalizar el ataque
    this.scene.time.delayedCall(this.attackDuration, () => {
      this.finishAttack();
    });
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

  finishAttack() {
    this.isAttacking = false;
    this.attackHitbox.body.enable = false;
    this.lastAttackTime = this.scene.time.now;
    
    if (this.state !== STATE.HURT && this.state !== STATE.DEAD) {
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
    this.state = STATE.CHASING;
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.speed * direction);
    this.setFlipX(direction === -1);
    this.setOffset(direction === -1 ? 23 : 0, 13);
    this.play('enemy1_walk', true);
  }

  patrol() {
    this.state = STATE.PATROLLING;
    this.setVelocityX(this.speed * this.direction);
    this.play('enemy1_walk', true);
  }

  takeDamage(amount) {
    if (this.state === STATE.DEAD) return;
    this.health -= amount;
    // Si no está ya en estado HURT, entra en ese estado y reproduce la animación correspondiente.
    if (this.state !== STATE.HURT) {
      this.state = STATE.HURT;
      this.play('enemy1_hurt');
      this.once('animationcomplete-enemy1_hurt', () => {
        if (this.health <= 0) {
          this.die();
        } else {
          const horizontalDist = this.player ? Math.abs(this.x - this.player.x) : Infinity;
          const verticalDiff = this.player ? Math.abs(this.y - this.player.y) : Infinity;
          const withinVertical = verticalDiff < this.verticalTolerance;
          this.state = (horizontalDist < this.detectionRange && withinVertical) ? STATE.CHASING : STATE.PATROLLING;
        }
      });
    }
  }

  die() {
    this.state = STATE.DEAD;
    this.play('enemy1_die');
    this.once('animationcomplete-enemy1_die', () => {
      this.destroy();
    });
  }
}

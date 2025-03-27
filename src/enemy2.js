import Phaser from 'phaser';

export const STATE2 = {
  PATROLLING: 'PATROLLING',
  CHASING: 'CHASING',
  ATTACKING: 'ATTACKING',
  HURT: 'HURT',
  DEAD: 'DEAD'
};

const DAMAGE_ENEMY = 20;

export default class Enemy2 extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy2_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configuración física
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(24, 35);
    this.setOffset(0, 13);
    this.setScale(1.25);

    // Atributos de movimiento, salud y daño
    this.speed = 40;
    this.health = 50;
    this.damage = DAMAGE_ENEMY;
    this.state = STATE2.PATROLLING; // Inicia patrullando
    this.direction = 1; // 1 = derecha, -1 = izquierda
    this.setVelocityX(this.speed * this.direction);
    this.body.setGravityY(500);

    // Rangos de detección y ataque
    this.detectionRange = 300; // Reducido para que sólo se active en distancias cortas
    this.attackRange = 300;
    this.attackCooldown = 200; // ms
    this.lastAttackTime = 0;

    // Tolerancia vertical (en píxeles) para que el enemigo solo persiga/ataque si están a la misma altura
    this.verticalTolerance = 80;

    // Referencia al jugador (se asigna desde Level.js)
    this.player = null;

    // Inicia con la animación de patrulla
    this.play('enemy2_walk');

    // Mejoras en los atributos de combate
    this.attackDuration = 400; // Duración de la animación de ataque
    this.isAttacking = false;
    this.attackHitbox = null;
    this.attackDamageDealt = false;
    
    // Crear hitbox de ataque
    this.attackHitbox = scene.add.rectangle(0, 0, 300, 300);
    scene.physics.add.existing(this.attackHitbox, true);
    this.attackHitbox.body.enable = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === STATE2.DEAD) return;

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

      if (horizontalDist < this.attackRange && verticalDiff < this.attackRange && this.state !== STATE2.HURT  && !this.hasObstacleBetween()) {
        this.attack();
      } else if (horizontalDist < this.detectionRange && withinVerticalTolerance && 
                 this.state !== STATE2.HURT && !this.hasObstacleBetween()) {
        this.chase();
      } else if (this.state !== STATE2.HURT) {
        this.patrol();
      }
    }

    // Si el enemigo está en PATROLLING o CHASING y se bloquea contra la pared, invertir la dirección
    if ((this.state === STATE2.PATROLLING || this.state === STATE2.CHASING) && (this.body.blocked.left || this.body.blocked.right)) {
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
    if (this.state !== STATE2.ATTACKING && this.state !== STATE2.HURT) {
      if (this.body.velocity.x !== 0) {
        this.play('enemy2_walk', true);
      } else {
        this.play('enemy2_idle', true);
      }
    }
  }

  attack() {
    if (this.state === STATE2.DEAD || this.isAttacking) return;


     // Girar hacia el jugador antes de atacar
     this.setFlipX(this.player.x < this.x);

    this.isAttacking = true;
    this.state = STATE2.ATTACKING;
    this.attackDamageDealt = false;
    this.setVelocityX(0);
    
    // Activar hitbox de ataque
    this.attackHitbox.body.enable = true;
    
    // Reproducir animación de ataque
    this.play('enemy2_attack', true);
    
    // Timer para el daño en medio de la animación
    this.scene.time.delayedCall(this.attackDuration / 2, () => {
      if (this.state === STATE2.ATTACKING && !this.attackDamageDealt) {
        this.checkAttackHit();
      }
    });

    // Timer para finalizar el ataque
    this.scene.time.delayedCall(this.attackDuration, () => {
      this.finishAttack();
    });
  }

  checkAttackHit() {
    if (!this.player || this.attackDamageDealt || this.hasObstacleBetween()) return;

    const hitboxBounds = this.attackHitbox.getBounds();
    const playerBounds = this.player.getBounds();

    if (Phaser.Geom.Rectangle.Area(hitboxBounds, playerBounds)) {
      this.player.takeDamage(this.damage, this);
      this.attackDamageDealt = true;
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




  finishAttack() {
    this.isAttacking = false;
    this.attackHitbox.body.enable = false;
    this.lastAttackTime = this.scene.time.now;
    
    if (this.state !== STATE2.HURT && this.state !== STATE2.DEAD) {
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
    this.state = STATE2.CHASING;
    const direction = this.player.x < this.x ? -1 : 1;
    this.setVelocityX(this.speed * direction);
    this.setFlipX(direction === -1);
    this.setOffset(direction === -1 ? 23 : 0, 13);
    this.play('enemy2_walk', true);
  }

  patrol() {
    this.state = STATE2.PATROLLING;
    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction === -1);
    this.setOffset(this.direction === -1 ? 23 : 0, 13);
  }

  takeDamage(amount) {
    if (this.state === STATE2.DEAD) return;
    this.health -= amount;
    // Si no está ya en estado HURT, entra en ese estado y reproduce la animación correspondiente.
    if (this.state !== STATE2.HURT) {
      this.state = STATE2.HURT;
      this.play('enemy2_hurt');
      this.once('animationcomplete-enemy2_hurt', () => {
        if (this.health <= 0) {
          this.die();
        } else {
          const horizontalDist = this.player ? Math.abs(this.x - this.player.x) : Infinity;
          const verticalDiff = this.player ? Math.abs(this.y - this.player.y) : Infinity;
          const withinVertical = verticalDiff < this.verticalTolerance;
          this.state = (horizontalDist < this.detectionRange && withinVertical) ? STATE2.CHASING : STATE2.PATROLLING;
        }
      });
    }
  }

  die() {
    this.state = STATE2.DEAD;
    this.play('enemy2_die');
    this.once('animationcomplete-enemy2_die', () => {
      this.destroy();
    });
  }
}

// Clase especializada para enemigos que detectan bordes
export class PatrollingEnemy2 extends Enemy2 {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.edgeDetectionEnabled = true;
    this.edgeDetectionDistance = 50;  // Aumentado de 30 a 50
    this.groundCheckDistance = 60;    // Aumentado de 40 a 60
    this.lastDirectionChange = 0;     // Tiempo del último cambio de dirección
    this.directionChangeDelay = 500;  // Mínimo tiempo entre cambios de dirección (ms)
  }

  patrol() {
    this.state = STATE2.PATROLLING;
    
    if (this.edgeDetectionEnabled && this.map) {
      const currentTime = this.scene.time.now;
      
      // Solo comprobar el borde si ha pasado suficiente tiempo desde el último cambio
      if (currentTime - this.lastDirectionChange >= this.directionChangeDelay) {
        // Detectar si hay suelo adelante
        const groundCheck = {
          x: this.x + (this.direction * this.edgeDetectionDistance),
          y: this.y + this.groundCheckDistance
        };

        const bounds = this.scene.physics.world.bounds;
        const tiles = this.map.getTilesWithinShape({
          x: groundCheck.x,
          y: groundCheck.y,
          width: 8,  // Aumentado de 2 a 8 para mejor detección
          height: 8  // Aumentado de 2 a 8 para mejor detección
        }, { isColliding: true }, this.scene.cameras.main, 'Suelo');

        // Si no hay suelo adelante o llegamos a los límites del mundo, cambiar dirección
        if (tiles.length === 0 || 
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

import Phaser from 'phaser';

const STATE = {
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

    // Rango de detección y ataque
    this.detectionRange = 200;
    this.attackRange = 50;
    this.attackCooldown = 1000; // milisegundos
    this.lastAttackTime = 0;

    // Referencia al jugador (se asigna desde Level.js)
    this.player = null;

    // Iniciar animación de patrulla
    this.play('enemy1_walk');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Si está muerto, no hace nada
    if (this.state === STATE.DEAD) return;

    // Si hay jugador, evaluar distancia para cambiar de estado
    if (this.player) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      if (dist < this.attackRange) {
        // Ataca si ha pasado el cooldown
        if (time - this.lastAttackTime > this.attackCooldown) {
          this.state = STATE.ATTACKING;
          this.attack();
          this.lastAttackTime = time;
        }
      } else if (dist < this.detectionRange) {
        this.state = STATE.CHASING;
        // Persigue al jugador
        if (this.player.x < this.x) {
          this.direction = -1;
          this.setVelocityX(-this.speed);
          this.setFlipX(true);
          this.setOffset(23, 13);
        } else {
          this.direction = 1;
          this.setVelocityX(this.speed);
          this.setFlipX(false);
          this.setOffset(0, 13);
        }
      } else {
        // Si el jugador está fuera del rango de detección, patrulla
        this.state = STATE.PATROLLING;
      }
    }

    // Estado de patrulla: se invierte la dirección si choca con una pared
    if (this.state === STATE.PATROLLING) {
      if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed);
        this.setFlipX(false);
        this.setOffset(0, 13);
        this.x += 3; // Empuja ligeramente para salir de la pared
      } else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
        this.setOffset(23, 13);
        this.x -= 3;
      }
    }

    // Si no está atacando ni recibiendo daño, se reproducen las animaciones de movimiento
    if (this.state !== STATE.ATTACKING && this.state !== STATE.HURT) {
      if (this.body.velocity.x !== 0) {
        this.play('enemy1_walk', true);
      } else {
        this.play('enemy1_idle', true);
      }
    }
  }

  attack() {
    // Cambia a estado de ataque y reproduce la animación de ataque
    this.state = STATE.ATTACKING;
    this.play('enemy1_attack');
    // Al finalizar la animación de ataque, aplica daño al jugador y vuelve a perseguirlo
    this.once('animationcomplete', () => {
      if (this.player) {
        this.player.takeDamage(this.damage);
      }
      this.state = STATE.CHASING;
    });
  }

  takeDamage(amount) {
    if (this.state === STATE.DEAD) return;
    console.log(this.health)
    this.health -= amount;
    this.state = STATE.HURT;
    this.play('enemy1_hurt');
    this.once('animationcomplete', () => {
      if (this.health <= 0) {
        this.die();
      } else {
        // Después de recibir daño, si el jugador está cerca, sigue persiguiéndolo
        this.state = this.player && Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y) < this.detectionRange ? STATE.CHASING : STATE.PATROLLING;
      }
    });
  }

  die() {
    this.state = STATE.DEAD;
    // Reproducir animación de muerte (asegúrate de tenerla cargada, por ejemplo 'enemy_die')
    this.play('enemy1_die');
    this.once('animationcomplete', () => {
      this.destroy();
    });
  }
}

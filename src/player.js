import Phaser from 'phaser';

export const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  HURT: 'HURT',
  DEAD: 'DEAD',
  ATTACKING: 'ATTACKING'
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(20, 35);
    this.setOffset(14, 13);
    this.setScale(1.25);

    // Atributos de movimiento y salud
    this.speed = 180;
    this.jumpSpeed = -240;
    this.score = 0;
    this.health = 100;      // Salud del jugador
    this.damage = 20;       // Daño de sus disparos
    this.hasWeapon = true;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 70;

    // Atributos para el doble salto
    this.jumpsAvailable = 2; // Número máximo de saltos permitidos
    this.currentJumps = 0;   // Contador de saltos realizados

    // Etiqueta de puntuación y salud (opcional)
    this.label = scene.add.text(10, 10, 'Score: 0 | Health: 100', { fontSize: '20px', fill: '#fff' });

    // Controles y disparo
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.input.on('pointerdown', () => this.shoot(), this);

    // Mano y arma
    this.hand = scene.add.sprite(x, y, 'hand3').setOrigin(0.5, 0.5);
    this.hand.setDepth(this.depth - 1);
    this.weapon = scene.add.sprite(this.x, this.y, 'weapon').setOrigin(1.2, 0.5);
    this.weapon.setDepth(this.hand.depth - 1);

    // Nuevos atributos
    this.state = PLAYER_STATE.IDLE;
    this.invulnerableTime = 1000; // 1 segundo de invulnerabilidad después de recibir daño
    this.lastHitTime = 0;
    this.isInvulnerable = false;
    this.knockbackForce = 200;
    this.knockbackDuration = 200;
    this.isKnockedBack = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.state === PLAYER_STATE.DEAD) return;

    // Actualizar invulnerabilidad
    if (this.isInvulnerable && time - this.lastHitTime >= this.invulnerableTime) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }

    if (this.isKnockedBack) return;

    if (!this.scene.keys) return;
    const runAnim = this.hasWeapon ? 'run_shoot' : 'run';
    const idleAnim = this.hasWeapon ? 'idle_shoot' : 'idle';
    const jumpAnim = this.hasWeapon ? 'jump_shoot' : 'jump';
    const idleJumpAnim = this.hasWeapon ? 'idle_jump_shoot' : 'idle_jump';

    // Resetear saltos disponibles cuando toca el suelo
    if (this.body.onFloor()) {
      this.currentJumps = 0;
    }

    // Lógica de movimiento horizontal
    if (this.scene.keys.left.isDown) {
      this.setVelocityX(-this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      this.setFlipX(true);
    } else if (this.scene.keys.right.isDown) {
      this.setVelocityX(this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
      if (this.body.onFloor()) {
        this.anims.play(idleAnim, true);
      }
    }

    // Lógica de salto mejorada
    const justPressedJump = Phaser.Input.Keyboard.JustDown(this.scene.keys.jump);
    if (justPressedJump && this.currentJumps < this.jumpsAvailable) {
      this.setVelocityY(this.jumpSpeed);
      this.currentJumps++;
      
      // Reproducir animación de salto
      if (this.body.velocity.x !== 0) {
        this.anims.play(jumpAnim, true);
      } else {
        this.anims.play(idleJumpAnim, true);
      }

      // Efecto visual para el doble salto
      if (this.currentJumps > 1) {
        // Crear efecto de partículas o animación para el doble salto
        this.scene.add.particles(this.x, this.y + 20, 'effect', {
          speed: 100,
          scale: { start: 0.2, end: 0 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 200,
          quantity: 5
        });
      }
    }

    if (this.scene.keys.down.isDown && this.crawlTime <= this.maxCrawlTime) {
      this.anims.play("crawl", true);
      this.crawlTime++;
    }
    if (this.crawlTime >= this.maxCrawlTime) {
      this.restarcrawl++;
      if (this.restarcrawl >= this.maxCrawlTime) {
        this.crawlTime = 0;
        this.restarcrawl = 0;
      }
    }

    if (!this.body.onFloor()) {
      if (this.body.velocity.x !== 0) {
        this.anims.play(jumpAnim, true);
      } else {
        this.anims.play(idleJumpAnim, true);
      }
    }

    this.label.setText('Score: ' + this.score + ' | Health: ' + this.health);

    if (this.hasWeapon) {
      this.updateHand();
    }
  }

  updateHand() {
    const pointer = this.scene.input.activePointer;
    const worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    let angle = Phaser.Math.Angle.Between(this.x, this.y, worldPointer.x, worldPointer.y);
    if (this.flipX) {
      angle += Math.PI;
    }
    angle = Phaser.Math.Angle.Wrap(angle);
    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;
    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);
    const shoulderOffsetX = -5;
    const shoulderOffsetY = 1.5;
    const shoulderX = this.x + shoulderOffsetX * (this.flipX ? -1 : 1);
    const shoulderY = this.y + shoulderOffsetY;
    this.hand.setPosition(shoulderX, shoulderY);
    this.hand.setRotation(angle);
    this.updateWeapon();
    this.ajustarDireccion();
  }

  updateWeapon() {
    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);
  }

  ajustarDireccion() {
    this.hand.setScale(!this.flipX ? -1 : 1, 1);
    this.weapon.setScale(!this.flipX ? -1 : 1, 1);
  }

  shoot() {
    const bulletSpeed = 1500;
    let angle = this.weapon.rotation;
    if (this.flipX) {
      angle += Math.PI;
    }
    // Calcular posición inicial de la bala
    const bulletX = this.weapon.x + Math.cos(angle) * 20;
    const bulletY = this.weapon.y + Math.sin(angle) * 20;
    // Crear la bala directamente a través del grupo para que herede la configuración del grupo (allowGravity: false)
    const bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
    bullet.setRotation(this.weapon.rotation);
    bullet.damage = this.damage; // Asigna el daño del disparo
  
    // Configurar velocidad de la bala
    const velocityX = Math.cos(angle) * bulletSpeed;
    const velocityY = Math.sin(angle) * bulletSpeed;
    bullet.setVelocity(velocityX, velocityY);
  
    // Asegurarse de que la bala no esté afectada por la gravedad (aunque el grupo ya lo configura)
    bullet.body.allowGravity = false;
  
    // Efecto de disparo (no modificado)
    const cannonOffset = 125;
    const effect = this.scene.add.sprite(
      this.weapon.x + Math.cos(angle) * cannonOffset,
      this.weapon.y + Math.sin(angle) * cannonOffset,
      'effect'
    );
    effect.setRotation(this.flipX ? this.weapon.rotation + Math.PI : this.weapon.rotation);
    effect.setDepth(this.weapon.depth + 1);
    effect.play('effect');
    this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        if (effect.anims.currentFrame) {
          effect.setPosition(
            this.weapon.x + Math.cos(angle) * cannonOffset,
            this.weapon.y + Math.sin(angle) * cannonOffset
          );
        }
      },
      repeat: effect.anims.getTotalFrames()
    });
    effect.once('animationcomplete', () => effect.destroy());
  }

  takeDamage(amount, attacker = null) {
    if (this.isInvulnerable || this.state === PLAYER_STATE.DEAD) return;

    this.health -= amount;
    this.isInvulnerable = true;
    this.lastHitTime = this.scene.time.now;
    this.state = PLAYER_STATE.HURT;

    // Efecto de parpadeo
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // Knockback
    if (attacker) {
      const direction = Math.sign(this.x - attacker.x);
      this.isKnockedBack = true;
      this.setVelocityX(direction * this.knockbackForce);
      this.setVelocityY(-this.knockbackForce / 2);

      this.scene.time.delayedCall(this.knockbackDuration, () => {
        this.isKnockedBack = false;
      });
    }

    // Reproducir animación de daño
    this.play('player_hurt', true);
    this.once('animationcomplete-player_hurt', () => {
      if (this.health <= 0) {
        this.die();
      } else {
        this.state = PLAYER_STATE.IDLE;
      }
    });
  }

  die() {
    this.state = PLAYER_STATE.DEAD;
    this.play('player_death', true);
    this.setVelocity(0);
    this.body.setAllowGravity(false);
    
    this.once('animationcomplete-player_death', () => {
      // Emitir evento de muerte para que la escena lo maneje
      this.scene.events.emit('playerDeath');
    });
  }
}

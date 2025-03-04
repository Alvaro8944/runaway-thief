import Phaser from 'phaser';

export const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  HURT: 'HURT',
  DEAD: 'DEAD',
  ATTACKING: 'ATTACKING',
  CLIMBING: 'CLIMBING'
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
    this.climbSpeed = 100;
    this.score = 0;
    this.health = 100;      // Salud del jugador
    this.damage = 20;       // Daño de sus disparos
    this.hasWeapon = true;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 70;

    // Atributos para el doble salto
    this.jumpsAvailable = 2;
    this.currentJumps = 0;
    this.isDoubleJumping = false;
    this.doubleJumpParticles = null;

    // Atributos para escaleras
    this.canClimb = false;
    this.isClimbing = false;
    this.currentLadder = null;
    this.isClimbingCentered = false;

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
    this.invulnerableTime = 1000;
    this.lastHitTime = 0;
    this.isInvulnerable = false;
    this.knockbackForce = 200;
    this.knockbackDuration = 200;
    this.isKnockedBack = false;

    // Iniciar con la animación idle
    const initialAnim = this.hasWeapon ? 'idle_shoot' : 'idle';
    this.play(initialAnim);

    // Crear el emisor de partículas una sola vez
    this.doubleJumpEmitter = this.scene.add.particles(0, 0, 'effect', {
      speed: 100,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: -1 // -1 significa que no emite automáticamente
    });
    this.doubleJumpEmitter.stop(); // Asegurarse de que está detenido inicialmente
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

    // Verificar si el jugador NO está en contacto con ninguna escalera
    if (!this.scene.physics.overlap(this, this.scene.ladders)) {
      this.canClimb = false;
      this.currentLadder = null;
      if (this.isClimbing) {
        this.isClimbing = false;
        this.body.allowGravity = true;
      }
    }

    // Lógica de escaleras
    if (this.canClimb) {
      const isUpOrDownPressed = this.scene.keys.up.isDown || this.scene.keys.down.isDown;
      
      if (isUpOrDownPressed) {
        // Iniciar escalada solo si no estábamos escalando antes
        if (!this.isClimbing) {
          this.isClimbing = true;
          this.body.allowGravity = false;
          this.setVelocityY(0); // Detener caída vertical
        }
        
        // Centrar suavemente al jugador en la escalera
        if (this.currentLadder && !this.isClimbingCentered) {
          const targetX = this.currentLadder.x;
          const diffX = targetX - this.x;
          this.x += diffX * 0.2; // Movimiento suave hacia el centro
          if (Math.abs(diffX) < 1) {
            this.x = targetX;
            this.isClimbingCentered = true;
          }
        }

        // Movimiento vertical en la escalera
        if (this.scene.keys.up.isDown) {
          this.setVelocityY(-this.climbSpeed);
          this.play('climb', true);
        } else if (this.scene.keys.down.isDown) {
          this.setVelocityY(this.climbSpeed);
          this.play('climb', true);
        }
      } else if (this.isClimbing) {
        // Mantener al jugador en la escalera cuando no se presiona ninguna tecla
        this.setVelocityY(0);
        if (this.anims.currentAnim && this.anims.currentAnim.key === 'climb') {
          this.anims.pause();
        }
      }

      // Permitir saltar desde la escalera
      if (Phaser.Input.Keyboard.JustDown(this.scene.keys.jump)) {
        this.isClimbing = false;
        this.isClimbingCentered = false;
        this.body.allowGravity = true;
        this.setVelocityY(this.jumpSpeed);
        this.currentJumps = 1;
      }

      // Movimiento horizontal limitado mientras escala
      if (this.isClimbing) {
        if (this.scene.keys.left.isDown) {
          this.setVelocityX(-this.speed * 0.3);
          this.setFlipX(true);
        } else if (this.scene.keys.right.isDown) {
          this.setVelocityX(this.speed * 0.3);
          this.setFlipX(false);
        } else {
          this.setVelocityX(0);
        }
        return; // Evitar que se ejecute la lógica de movimiento normal
      }
    }

    // Resetear saltos disponibles cuando toca el suelo
    if (this.body.onFloor()) {
      if (this.currentJumps > 0) {
        this.currentJumps = 0;
        // Asegurarse de que el emisor está detenido al tocar el suelo
        this.doubleJumpEmitter.stop();
      }
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
      
      if (this.currentJumps === 2) {
        // Solo en el segundo salto cambiamos al sprite de doble salto
        this.play('doublejump', true);
        // Emitir partículas
        this.doubleJumpEmitter.setPosition(this.x, this.y + 20);
        this.doubleJumpEmitter.explode(10);
      } else {
        // Primer salto normal
        const anim = this.body.velocity.x !== 0 ? jumpAnim : idleJumpAnim;
        this.play(anim, true);
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

    // Actualizar animaciones en el aire
    if (!this.body.onFloor() && this.currentJumps !== 2) {
      const anim = this.body.velocity.x !== 0 ? jumpAnim : idleJumpAnim;
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== anim) {
        this.play(anim, true);
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
    const bulletSpeed = 800;
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

  hurt() {
    if (this.isInvulnerable || this.state === PLAYER_STATE.DEAD) return;
    
    this.takeDamage(20); // Los pinchos hacen 20 de daño
  }
}

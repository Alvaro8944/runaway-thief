import Phaser from 'phaser';

/**
 * Clase que representa el jugador.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.1);

    // Ajuste de hitbox
    this.setSize(20, 35);
    this.setOffset(14, 13);
    this.setScale(1.25);

    // Atributos
    this.speed = 180;
    this.jumpSpeed = -240;
    this.score = 0;
    this.hasWeapon = true;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 70;

    // Etiqueta de puntuación
    this.label = scene.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });

    // Controles de teclado y ratón
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.input.on('pointerdown', () => this.shoot(), this);

    // Mano y arma
    this.hand = scene.add.sprite(x, y, 'hand3').setOrigin(0.5, 0.5);
    this.hand.setDepth(this.depth - 1);

    this.weapon = scene.add.sprite(this.x, this.y, 'weapon').setOrigin(1.2, 0.5);
    this.weapon.setDepth(this.hand.depth - 1);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Si no existen las keys (definidas en Level.js), salimos
    if (!this.scene.keys) return;

    const runAnim = this.hasWeapon ? 'run_shoot' : 'run';
    const idleAnim = this.hasWeapon ? 'idle_shoot' : 'idle';
    const jumpAnim = this.hasWeapon ? 'jump_shoot' : 'jump';
    const idleJumpAnim = this.hasWeapon ? 'idle_jump_shoot' : 'idle_jump';

    // Movimiento horizontal
    if (this.scene.keys.left.isDown) {
      this.setVelocityX(-this.speed);
      this.anims.play(runAnim, true);
      this.setFlipX(true);
    } else if (this.scene.keys.right.isDown) {
      this.setVelocityX(this.speed);
      this.anims.play(runAnim, true);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
      this.anims.play(idleAnim, true);
    }

    // Salto
    if (this.scene.keys.jump.isDown && this.body.onFloor()) {
      this.setVelocityY(this.jumpSpeed);
      if (this.body.velocity.x !== 0) {
        this.anims.play(jumpAnim, true);
      } else {
        this.anims.play(idleJumpAnim, true);
      }
    }

    // Crouch / Crawl
    if (this.scene.keys.down.isDown && this.crawlTime <= this.maxCrawlTime) {
      this.anims.play('crawl', true);
      this.crawlTime++;
    }
    if (this.crawlTime >= this.maxCrawlTime) {
      this.restarcrawl++;
      if (this.restarcrawl >= this.maxCrawlTime) {
        this.crawlTime = 0;
        this.restarcrawl = 0;
      }
    }

    // Si estamos en el aire
    if (!this.body.onFloor()) {
      if (this.body.velocity.x !== 0) {
        this.anims.play(jumpAnim, true);
      } else {
        this.anims.play(idleJumpAnim, true);
      }
    }

    // Actualizar puntuación
    this.label.setText('Score: ' + this.score);

    // Actualizar mano y arma si tiene arma
    if (this.hasWeapon) {
      this.updateHand();
    }
  }

  // -----------------------------
  //  LÓGICA DE MANO Y ARMA
  // -----------------------------
  updateHand() {
    const pointer = this.scene.input.activePointer;
    const worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

    let angle = Phaser.Math.Angle.Between(this.x, this.y, worldPointer.x, worldPointer.y);

    // Ajustar ángulo si el personaje está volteado
    if (this.flipX) {
      angle += Math.PI;
    }
    angle = Phaser.Math.Angle.Wrap(angle);

    // Limitar ángulo (opcional)
    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;
    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);

    // Offset de hombro (ajusta según tu sprite)
    const shoulderOffsetX = -5;
    const shoulderOffsetY = 1.5;
    const shoulderX = this.x + shoulderOffsetX * (this.flipX ? -1 : 1);
    const shoulderY = this.y + shoulderOffsetY;

    // Posicionar mano
    this.hand.setPosition(shoulderX, shoulderY);
    this.hand.setRotation(angle);

    // Actualizar arma
    this.updateWeapon();
    this.ajustarDireccion();
  }

  updateWeapon() {
    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);
  }

  ajustarDireccion() {
    // Si no está volteado, invertir X para que la mano se vea bien
    this.hand.setScale(!this.flipX ? -1 : 1, 1);
    this.weapon.setScale(!this.flipX ? -1 : 1, 1);
  }

  shoot() {
    const bulletSpeed = 1500;
    let angle = this.weapon.rotation;

    if (this.flipX) {
      angle += Math.PI;
    }

    // Crear bala
    const bullet = this.scene.physics.add.sprite(
      this.weapon.x + Math.cos(angle) * 20,
      this.weapon.y + Math.sin(angle) * 20,
      'bullet'
    );
    bullet.setRotation(this.weapon.rotation);

    const velocityX = Math.cos(angle) * bulletSpeed;
    const velocityY = Math.sin(angle) * bulletSpeed;
    bullet.setVelocity(velocityX, velocityY);

    // Efecto de disparo
    const cannonOffset = 125;
    const effect = this.scene.add.sprite(
      this.weapon.x + Math.cos(angle) * cannonOffset,
      this.weapon.y + Math.sin(angle) * cannonOffset,
      'effect'
    );
    effect.setRotation(this.flipX ? this.weapon.rotation + Math.PI : this.weapon.rotation);
    effect.setDepth(this.weapon.depth + 1);
    effect.play('effect');

    // Actualizar posición del efecto mientras dura la animación
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
}

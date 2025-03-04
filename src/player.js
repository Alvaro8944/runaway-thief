import Phaser from 'phaser';

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
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.scene.keys) return;
    const runAnim = this.hasWeapon ? 'run_shoot' : 'run';
    const idleAnim = this.hasWeapon ? 'idle_shoot' : 'idle';
    const jumpAnim = this.hasWeapon ? 'jump_shoot' : 'jump';
    const idleJumpAnim = this.hasWeapon ? 'idle_jump_shoot' : 'idle_jump';

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

    if (this.scene.keys.jump.isDown && this.body.onFloor()) {
      this.setVelocityY(this.jumpSpeed);
      if (this.body.velocity.x !== 0) {
        this.anims.play(jumpAnim, true);
      } else {
        this.anims.play(idleJumpAnim, true);
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

  takeDamage(amount) {
    this.health -= amount;
    console.log(this.health)
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      // Aquí puedes agregar lógica de "game over"
    }
  }
}

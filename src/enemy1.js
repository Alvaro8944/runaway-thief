import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy1_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(24, 35);
    this.setOffset(0, 13);
    this.setScale(1.25);

    // Movimiento inicial
    this.speed = 80;
    this.direction = 1; // 1 = derecha, -1 = izquierda
    this.setVelocityX(this.speed * this.direction);

    // Gravedad
    this.body.setGravityY(500);

    // Iniciamos con la animación de caminar
    this.play('enemy1_walk');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Cambiar de dirección cuando choca con un borde
    if (this.body.blocked.left) {
      this.direction = 1;
      this.setVelocityX(this.speed * this.direction);
      this.setFlipX(false);
      this.setOffset(0, 13);

      // 🚀 Retroceder ligeramente para evitar que se meta en la pared
      this.x += 7;
    } else if (this.body.blocked.right) {
      this.direction = -1;
      this.setVelocityX(this.speed * this.direction);
      this.setFlipX(true);
      this.setOffset(23, 13);

      // 🚀 Retroceder ligeramente para evitar que se meta en la pared
      this.x -= 5;
    }

    // Cambiar animación según el movimiento
    if (this.body.velocity.x !== 0) {
      this.play('enemy1_walk', true);
    } else {
      this.play('enemy1_idle', true);
    }
  }
}

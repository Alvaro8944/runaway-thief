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
    
    this.speed = 80;
    this.direction = 1; // 1 = Derecha, -1 = Izquierda
    this.setVelocityX(this.speed * this.direction);

    this.body.setGravityY(500);

    // Animaciones
    this.anims.create({
      key: "enemy1_idle",
      frames: this.anims.generateFrameNumbers("enemy1_idle", { start: 0, end: 3}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "enemy1_walk",
      frames: this.anims.generateFrameNumbers("enemy1_walk", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.play("enemy1_walk"); // Iniciar con animación de caminar
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Cambiar de dirección cuando choca con un borde
    if (this.body.blocked.left) {
        this.direction = 1;
        this.setVelocityX(this.speed * this.direction);
        this.setFlipX(false);
        this.setOffset(0, 13); // Ajustar hitbox cuando mira a la derecha
    }
    else if (this.body.blocked.right) {
        this.direction = -1;
        this.setVelocityX(this.speed * this.direction);
        this.setFlipX(true);
        this.setOffset(20, 13); // Ajustar hitbox cuando mira a la izquierda
    }

    // Cambiar animación según el movimiento
    if (this.body.velocity.x !== 0) {
        this.play("enemy1_walk", true);
    } else {
        this.play("enemy1_idle", true);
    }
}

}

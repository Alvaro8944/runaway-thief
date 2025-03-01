import Phaser from 'phaser';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds();
    this.setBounce(0.1);
    this.setSize(this.width, this.height);
    this.setOffset(0, 16);
    this.setScale(1.25);

    this.speed = 180;
    this.jumpSpeed = -240;
    this.score = 0;

    this.label = scene.add.text(10, 10, "Score: 0", { fontSize: '20px', fill: '#fff' });

    this.cursors = scene.input.keyboard.createCursorKeys();

    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 70;

    this.hasWeapon = true;

    // **Crear la mano separada**
    this.hand = scene.add.sprite(x, y, 'hand3');
    this.hand.setOrigin(1, 0.40);
    this.hand.setDepth(this.depth - 1); // Poner la mano por debajo del jugador

    this.weapon = this.scene.add.sprite(this.x, this.y, 'weapon');
    this.weapon.setOrigin(0.4, 0.40);
    this.weapon.setDepth(this.hand.depth + 1); // Asegurar que el arma está encima de la mano

  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.scene.keys) return;

    const runAnim = this.hasWeapon ? "run_shoot" : "run";
    const idleAnim = this.hasWeapon ? "idle_shoot" : "idle";
    const jumpAnim = this.hasWeapon ? "jump_shoot" : "jump";
    const idleJumpAnim = this.hasWeapon ? "idle_jump_shoot" : "idle_jump";

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

    this.label.setText("Score: " + this.score);

    // **Actualizar la posición y animación de la mano**
    if (this.hasWeapon) {
      this.updateHand();
    }
  }





  updateHand() {
    let pointer = this.scene.input.activePointer;

    // Calcular el ángulo entre el jugador y el puntero del ratón
    let angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);

    // Longitud base del brazo (distancia entre hombro y mano)
    let baseLength = 12;

    // Ajuste de la longitud según el ángulo:
    let dynamicLength = baseLength;

    // Si el brazo apunta hacia arriba (entre -90 y 0 grados)
    if (angle < 0) {
        // A medida que el ángulo se acerque a -90, la longitud se reducirá
        dynamicLength = baseLength * (1 - angle / Math.PI);  // Reducir a medida que se acerca a -90 grados
    }
    // Si el brazo apunta hacia abajo (0 a 90 grados), la longitud aumenta
    else {
        dynamicLength = baseLength * (1 + angle / Math.PI);  // Aumentar a medida que se acerca a 90 grados
    }

    // Calcular la nueva posición de la mano usando trigonometría
    let handX = this.x + Math.cos(angle) * dynamicLength;
    let handY = this.y + Math.sin(angle) * dynamicLength;

    // Aplicar la posición y la rotación de la mano
    this.hand.setPosition(handX, handY);
    this.hand.setRotation(angle);

    // Si el personaje está volteado, ajustar la rotación de la mano
    if (this.flipX) {
        this.hand.setRotation(angle + Math.PI); // Invertir la rotación si está volteado
    }

    // Actualizar la posición del arma
    this.updateWeapon();
}



updateWeapon() {
    // Mantener el arma en la mano y con la misma rotación
    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);
}

}

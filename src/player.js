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
    
    this.setSize(20, 35);  // Reducimos el alto de la hitbox
    this.setOffset(14, 13); // Movemos la hitbox hacia abajo para centrarla

    this.setScale(1.25);

    this.speed = 180;
    this.jumpSpeed = -240;
    this.score = 0;

    this.label = scene.add.text(10, 10, "Score: 0", { fontSize: '20px', fill: '#fff' });


    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.input.on("pointerdown", () => this.shoot(), this);

    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 70;

    this.hasWeapon = true;

    // **Crear la mano separada**
    this.hand = scene.add.sprite(x, y, 'hand3');
    this.hand.setOrigin(0.5, 0.5);
    this.hand.setDepth(this.depth - 1); // Poner la mano por debajo del jugador

    this.weapon = this.scene.add.sprite(this.x, this.y, 'weapon');
    this.weapon.setOrigin(1.2, 0.5);
    this.weapon.setDepth(this.hand.depth - 1); // Asegurar que el arma está encima de la mano

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
    let worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

    let angle = Phaser.Math.Angle.Between(this.x, this.y, worldPointer.x, worldPointer.y);

    // Si el personaje está volteado, ajustar el ángulo
    if (this.flipX) {
        angle += Math.PI; // Invertimos el ángulo porque el personaje está volteado
    }
    
    // Normalizar el ángulo entre -π y π para evitar valores extraños
    angle = Phaser.Math.Angle.Wrap(angle);
    
    // Definir los límites de rotación (siempre en base al mundo, no a flipX)
    let minAngle = -Math.PI / 2;  // -90° (Abajo)
    let maxAngle = Math.PI / 2;   //  90° (Arriba)
    
    // Aplicar los límites correctamente
    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);







    // Longitud del brazo desde el origen del sprite del cuerpo hasta el hombro
    let shoulderOffsetX = -5;  // Ajusta esto según la posición del hombro en el sprite
    let shoulderOffsetY = 1.5; // Ajusta esto según la posición del hombro en el sprite

    // Posición real del hombro
    let shoulderX = this.x + shoulderOffsetX * (this.flipX ? -1 : 1);
    let shoulderY = this.y + shoulderOffsetY;

    // Aplicar la posición al brazo
    this.hand.setPosition(shoulderX, shoulderY);
    this.hand.setRotation(angle);

    // Actualizar el arma
    this.updateWeapon();
    this.ajustarDireccion();
}


updateWeapon() {
    // Mantener el arma en la mano y con la misma rotación
    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);  
}



ajustarDireccion(){


  this.hand.setScale(!this.flipX ? -1 : 1, 1);
  this.weapon.setScale(!this.flipX ? -1 : 1, 1);

}



shoot() {
  let bulletSpeed = 1500;
  let angle = this.weapon.rotation;

  if (this.flipX) {
      angle += Math.PI;
  }

  let bullet = this.scene.physics.add.sprite(
      this.weapon.x + Math.cos(angle) * 20,
      this.weapon.y + Math.sin(angle) * 20,
      "bullet"
  );
  bullet.setRotation(this.weapon.rotation);

  let velocityX = Math.cos(angle) * bulletSpeed;
  let velocityY = Math.sin(angle) * bulletSpeed;

  bullet.setVelocity(velocityX, velocityY);

  // **Efecto de disparo que sigue el cañón**
  let cannonOffset = 125;
  let effect = this.scene.add.sprite(this.weapon.x + Math.cos(angle) * cannonOffset, this.weapon.y + Math.sin(angle) * cannonOffset, "effect");

  effect.setRotation(this.flipX ? this.weapon.rotation + Math.PI : this.weapon.rotation);
  effect.setDepth(this.weapon.depth + 1); // Poner el efecto por debajo del arma y el jugador
  effect.play("effect");

  // Hacer que el efecto siga la posición del arma hasta que termine la animación
  this.scene.time.addEvent({
      delay: 16, // 60FPS -> cada frame
      callback: () => {
          if (effect.anims.currentFrame) {
              effect.setPosition(
                  this.weapon.x + Math.cos(angle) * cannonOffset,
                  this.weapon.y + Math.sin(angle) * cannonOffset
              );
          }
      },
      repeat: effect.anims.getTotalFrames() // Se repite hasta que termine la animación
  });

  effect.once("animationcomplete", () => effect.destroy());
}






}

import Phaser from 'phaser';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy1_idle');
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

    this.hasWeapon = true;

  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    
  }

}

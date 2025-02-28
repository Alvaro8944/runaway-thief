import Phaser from 'phaser';

/**
 * Clase que representa el jugador del juego. El jugador se mueve por el mundo usando los cursores.
 * También almacena la puntuación o número de estrellas que ha recogido hasta el momento.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * Constructor del jugador.
     * @param {Phaser.Scene} scene Escena a la que pertenece el jugador.
     * @param {number} x Coordenada X.
     * @param {number} y Coordenada Y.
     */
    constructor(scene, x, y) {
      super(scene, x, y, 'player');
      scene.add.existing(this);
      scene.physics.add.existing(this);
  
      // Configuración física y propiedades
      this.setCollideWorldBounds();
      this.setBounce(0.1);
  
      this.setScale(0.5)
      this.speed = 180;         // Velocidad de movimiento horizontal
      this.jumpSpeed = -240;    // Velocidad de salto
      this.score = 0;           // Puntuación del jugador
  
      // Texto para mostrar la puntuación
      this.label = scene.add.text(10, 10, "Score: 0", { fontSize: '20px', fill: '#fff' });
  
      // Configuración de controles
      this.cursors = scene.input.keyboard.createCursorKeys();
  
      // Variables para la mecánica de "crawl"
      this.crawlTime = 0;
      this.restarcrawl = 0;
      this.maxCrawlTime = 30;
    }
  
    /**
     * Método preUpdate llamado en cada frame para gestionar el movimiento y las animaciones.
     * @param {number} time Tiempo actual.
     * @param {number} delta Delta de tiempo desde el último frame.
     */
    preUpdate(time, delta) {
      super.preUpdate(time, delta);
  
      // Movimiento horizontal y animaciones
      if (this.cursors.left.isDown) {
        this.setVelocityX(-this.speed);
        this.anims.play("run", true);
        this.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.setVelocityX(this.speed);
        this.anims.play("run", true);
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
        this.anims.play("idle", true);
      }
  
      // Salto
      if (this.cursors.up.isDown && this.body.onFloor()) {
        this.setVelocityY(this.jumpSpeed);
        if (this.body.velocity.x !== 0) {
          this.anims.play("jump", true);
        } else {
          this.anims.play("idle_jump", true);
        }
      }
  
      // Acción de "crawl" (agacharse)
      if (this.cursors.down.isDown && this.crawlTime <= this.maxCrawlTime) {
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
  
      // Si está en el aire, mantener la animación de salto
      if (!this.body.onFloor()) {
        if (this.body.velocity.x !== 0) {
          this.anims.play("jump", true);
        } else {
          this.anims.play("idle_jump", true);
        }
      }
  
      // Actualizar la UI de la puntuación
      this.label.setText("Score: " + this.score);
    }
  } 
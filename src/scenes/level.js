
import Player from '../player.js'
import Phaser from 'phaser';


/**
 * Escena principal del juego. La escena se compone de una serie de plataformas 
 * sobre las que se sitúan las bases en las podrán aparecer las estrellas. 
 * El juego comienza generando aleatoriamente una base sobre la que generar una estrella. 
 * @abstract Cada vez que el jugador recoge la estrella, aparece una nueva en otra base.
 * El juego termina cuando el jugador ha recogido 10 estrellas.
 * @extends Phaser.Scene
 */
export default class Level extends Phaser.Scene {
    /**
     * Constructor de la escena
     */
    constructor() {
        super({ key: 'level' });
    }

    /**
     * Creación de los elementos de la escena principal de juego
     */
    create() {


      var map = this.make.tilemap({key: 'map'});
      var tiles = map.addTilesetImage('tileset', 'tiles');

      var layerSuelo = map.createLayer('Suelo', tiles, 0, -410)
      layerSuelo.setCollisionByExclusion([-1], true)
        
  
      // Instanciar al jugador usando la clase Player
      this.player = new Player(this, 100, 300);
      this.physics.add.collider(this.player, layerSuelo);

      // Configurar límites del mundo y la cámara
      this.physics.world.setBounds(0, 0, 10000, 600);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setLerp(1, 0);



      this.keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    

      
      
      

    }
    
}

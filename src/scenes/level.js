
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

      var tiles1 = map.addTilesetImage('tileset', 'tiles');
      var tiles2 = map.addTilesetImage('tileset2', 'tiles2');

      var layerSuelo = map.createLayer('Suelo', [tiles1, tiles2], 0, 0)
      layerSuelo.setCollisionByExclusion([-1], true)

      var escaleraLayer = map.getObjectLayer('Escalera');

      if(escaleraLayer){
        this.ladders = this.physics.add.staticGroup();

        escaleraLayer.objects.forEach(obj => {
            if(obj.gid == 238){
                let ladder = this.ladders.create(obj.x,obj.y - 15, 'ladder2')
            }
        });
      }
        
  
      // Instanciar al jugador usando la clase Player
      this.player = new Player(this, 0, 0);
      this.physics.add.collider(this.player, layerSuelo);
      this.player.setPosition(50,1380);

      // Configurar límites del mundo y la cámara
      this.physics.world.setBounds(0, 0, 10000, 1500);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setLerp(1, 0);



      this.keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    

      
      
      

    }
    
}

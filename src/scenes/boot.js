import Phaser from 'phaser'

//PLAYER MOVE
import player_run from '../../assets/players/main_character/Biker_run.png'
import player_jump from '../../assets/players/main_character/Biker_jump.png'
import player_idle from '../../assets/players/main_character/Biker_idle.png'


//PLAYER SHOOT BODY
import player_run_shoot from '../../assets/players/main_character_shoot_body/Run1.png'
import player_jump_shoot from '../../assets/players/main_character_shoot_body/Jump1.png'
import player_idle_shoot from '../../assets/players/main_character_shoot_body/Idle1.png'


//PLAYER SHOOT HAND
import hand1 from '../../assets/players/main_character_shoot_hands/1.png'
import hand2 from '../../assets/players/main_character_shoot_hands/2.png'
import hand3 from '../../assets/players/main_character_shoot_hands/3.png'
import hand4 from '../../assets/players/main_character_shoot_hands/4.png'
import hand5 from '../../assets/players/main_character_shoot_hands/5.png'



//WEAPON
import weapon from '../../assets/Guns/4_1.png'




import Tileset from '../../assets/tiled/Tileset.png'
import MainScene from '../../assets/tiled/MainScene.json'

/**
 * Escena para la precarga de los assets que se usarán en el juego.
 * Esta escena se puede mejorar añadiendo una imagen del juego y una 
 * barra de progreso de carga de los assets
 * @see {@link https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/} como ejemplo
 * sobre cómo hacer una barra de progreso.
 */


export default class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'boot' });
  }

  preload() {
    this.load.image('tiles', Tileset)
    this.load.tilemapTiledJSON('map', MainScene)


    
    // Cargar spritesheet del jugador
    this.load.spritesheet('player_idle', player_idle, {
      frameWidth: 48,
      frameHeight: 48
    });
  

     // Cargar spritesheet del jugador
     this.load.spritesheet('player_run', player_run, {
      frameWidth: 48,
      frameHeight: 48
    });
  


     // Cargar spritesheet del jugador
     this.load.spritesheet('player_jump', player_jump, {
      frameWidth: 48,
      frameHeight: 48
    });
  




    //SHOOT BODY--------------------------------------------------------------------------------------------------------

      this.load.spritesheet('player_run_shoot', player_run_shoot, {
        frameWidth: 48,
        frameHeight: 48
      });


      this.load.spritesheet('player_jump_shoot', player_jump_shoot, {
        frameWidth: 48,
        frameHeight: 48
      });


      this.load.spritesheet('player_idle_shoot', player_idle_shoot, {
        frameWidth: 48,
        frameHeight: 48
      });





      //SHOOT HANDS-----------------------------------------------------------------------------------------

      this.load.spritesheet('hand1', hand1, {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet('hand2', hand2, {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet('hand3', hand3, {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet('hand4', hand4, {
        frameWidth: 32,
        frameHeight: 32
      });
      this.load.spritesheet('hand5', hand5, {
        frameWidth: 32,
        frameHeight: 32
      });



      //WEAPON---------------------------------------------------------------------------

      this.load.spritesheet('weapon', weapon, {
        frameWidth: 29,
        frameHeight: 11
      });



  }
   

  create() {



    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });


  
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 3}),
      frameRate: 10
    });


    this.anims.create({
      key: "idle_jump",
      frames: this.anims.generateFrameNumbers("player_jump", { start: 0, end: 3}),
      frameRate: 10
    });


    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player_jump", { start: 0, end: 3}),
      frameRate: 10
    });


    this.anims.create({
      key: "crawl",
      frames: [{ key: "player_jump", frame: 3 }],
      frameRate: 10
    });




    //SHOOT BODY-----------------------------------------------------------------------------------------
    this.anims.create({
      key: "run_shoot",
      frames: this.anims.generateFrameNumbers("player_run_shoot", { start: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });


    this.anims.create({
      key: "idle_shoot",
      frames: this.anims.generateFrameNumbers("player_idle_shoot", { start: 0, end: 3}),
      frameRate: 10
    });


    
    this.anims.create({
      key: "jump_shoot",
      frames: this.anims.generateFrameNumbers("player_jump_shoot", { start: 0, end: 3}),
      frameRate: 10
    });




 //SHOOT HANDS-----------------------------------------------------------------------------------------


 this.anims.create({
  key: "hand1",
  frames: [{ key: "hand1", frame: 0 }],
  frameRate: 10
});

this.anims.create({
  key: "hand2",
  frames: [{ key: "hand2", frame: 0 }],
  frameRate: 10
});

this.anims.create({
  key: "hand3",
  frames: [{ key: "hand3", frame: 0 }],
  frameRate: 10
});

this.anims.create({
  key: "hand4",
  frames: [{ key: "hand4", frame: 0 }],
  frameRate: 10
});

this.anims.create({
  key: "hand5",
  frames: [{ key: "hand5", frame: 0 }],
  frameRate: 10
});




//WEAPON---------------------------------------------------------------------------

this.anims.create({
  key: "weapon",
  frames: [{ key: "weapon", frame: 0 }],
  frameRate: 10
});



    // Iniciar la escena del juego (Level)
    this.scene.start('level');
  }
}

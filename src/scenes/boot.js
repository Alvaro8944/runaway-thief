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
import hand3 from '../../assets/players/main_character_shoot_hands/3.png'



//WEAPON
import weapon from '../../assets/Guns/4_1.png'


//BULLET
import bullet from '../../assets/Bullets/5.png'


//SHOOT EFFECT
import effect from '../../assets/Shoot_effects/9_1.png'




import Tileset from '../../assets/tiled/Tileset.png'
import Tileset2 from '../../assets/tiled/Tileset2.png'
import MainScene from '../../assets/tiled/MainScene.json'
import ladder from '../../assets/tiled/Objects/Other/Ladder2.png'

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
    this.load.image('tiles2', Tileset2)
    this.load.image('ladder2', ladder)

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
      this.load.spritesheet('hand3', hand3, {
        frameWidth: 32,
        frameHeight: 32
      });



      //WEAPON---------------------------------------------------------------------------

      this.load.spritesheet('weapon', weapon, {
        frameWidth: 29,
        frameHeight: 11
      });


      //BULLET---------------------------------------------------------------------------

      this.load.spritesheet('bullet', bullet, {
        frameWidth: 15,
        frameHeight: 4
      });


      //EFFECT---------------------------------------------------------------------------

      this.load.spritesheet('effect', effect, {
        frameWidth: 288,
        frameHeight: 48
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
  key: "hand3",
  frames: [{ key: "hand3", frame: 0 }],
  frameRate: 10
});





//WEAPON---------------------------------------------------------------------------

this.anims.create({
  key: "weapon",
  frames: [{ key: "weapon", frame: 0 }],
  frameRate: 10
});



//BULLET---------------------------------------------------------------------------

this.anims.create({
  key: "bullet",
  frames: [{ key: "bullet", frame: 0 }],
  frameRate: 10
});

//EFFECT---------------------------------------------------------------------------

this.anims.create({
  key: "effect",
  frames: this.anims.generateFrameNumbers("effect", { start: 0, end: 5}),
  frameRate: 10
});






    // Iniciar la escena del juego (Level)
    this.scene.start('level');
  }
}

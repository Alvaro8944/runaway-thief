//PLAYER MOVE
import player_run from '../../assets/players/main_character/Biker_run.png';
import player_jump from '../../assets/players/main_character/Biker_jump.png';
import player_idle from '../../assets/players/main_character/Biker_idle.png';
import player_hurt from '../../assets/players/main_character/Biker_hurt.png';
import player_death from '../../assets/players/main_character/Biker_death.png';
import player_doublejump from '../../assets/players/main_character/Biker_doublejump.png';
import player_climb from '../../assets/players/main_character/Biker_climb.png';

//PLAYER SHOOT BODY
import player_run_shoot from '../../assets/players/main_character_shoot_body/Run1.png';
import player_jump_shoot from '../../assets/players/main_character_shoot_body/Jump1.png';
import player_idle_shoot from '../../assets/players/main_character_shoot_body/Idle1.png';
import player_sit_shoot from '../../assets/players/main_character_shoot_body/Sitdown1.png';

//ENEMY 1
import enemy1_idle from '../../assets/Enemies/1/Idle.png';
import enemy1_walk from '../../assets/Enemies/1/Walk.png';
import enemy1_hurt from '../../assets/Enemies/1/Hurt.png';
import enemy1_attack from '../../assets/Enemies/1/Attack.png';
import enemy1_die from '../../assets/Enemies/1/Death.png';

//ENEMY 2
import enemy2_idle from '../../assets/Enemies/2/Idle.png';
import enemy2_walk from '../../assets/Enemies/2/Walk.png';
import enemy2_hurt from '../../assets/Enemies/2/Hurt.png';
import enemy2_attack from '../../assets/Enemies/2/Attack.png';
import enemy2_die from '../../assets/Enemies/2/Death.png';



//ENEMY 3
import enemy3_idle from '../../assets/Enemies/5/Idle.png';
import enemy3_walk from '../../assets/Enemies/5/Walk.png';
import enemy3_hurt from '../../assets/Enemies/5/Hurt.png';
import enemy3_attack from '../../assets/Enemies/5/Attack.png';
import enemy3_die from '../../assets/Enemies/5/Death.png';



//BOSS 
import boss_idle from '../../assets/Enemies/Boss/Idle.png';
import boss_walk from '../../assets/Enemies/Boss/Walk.png';
import boss_hurt from '../../assets/Enemies/Boss/Hurt.png';
import boss_attack1 from '../../assets/Enemies/Boss/Attack1.png';
import boss_attack2 from '../../assets/Enemies/Boss/Attack3.png';
import boss_die from '../../assets/Enemies/Boss/Death.png';
import boss_special from '../../assets/Enemies/Boss/Special.png';


//PLAYER SHOOT HAND
import hand3 from '../../assets/players/main_character_shoot_hands/3.png';

//WEAPON
import weapon from '../../assets/Guns/4_1.png';

//WEAPON EXPLOSIVA
import explosiveWeapon from '../../assets/Guns/6_1.png';


//WEAPON ESCOPETA
import shotgunWeapon from '../../assets/Guns/8_1.png';

//ESCUDO
import escudo from '../../assets/Objects/escudo.png';

//PARACHUTE
import parachute from '../../assets/Objects/parachute.png';

//JETPACK
import jetpack from '../../assets/Objects/jetpackPequeño.png';

//BULLET
import bullet from '../../assets/Bullets/5.png';


//BULLET
import bossBullet from '../../assets/Bullets/Projectile.png';


//SHOOT EFFECT
import effect from '../../assets/Shoot_effects/9_1.png';




// BARRILES
import barrilNormal from '../../assets/tiled/Objects/Resized/Barril.png';
import barrilCura from '../../assets/tiled/Objects/Resized/BarrilCura.png';
import barrilTNT from '../../assets/tiled/Objects/Resized/BarrilTNT.png';
//import barrilVeneno from '../../assets/tiled/Objects/Resized/BarrilVeneno.png';
//import barrilImpulso from '../../assets/tiled/Objects/Resized/BarrilImpulso.png';
//import barrilRespawn from '../../assets/tiled/Objects/Resized/BarrilRespawn.png';

// CARTEL
import cartelMadera from '../../assets/tiled/Objects/Resized/CartelMadera.png';

//Bloque destructible
import BlqDestructible from '../../assets/tiled/Objects/Resized/BlqDestructible.png';

// TILEMAP
import Tileset from '../../assets/tiled/Tileset.png';
import Tileset2 from '../../assets/tiled/Tileset2.png';
import Tileset3 from '../../assets/tiled/Tileset3.png';
import MainScene from '../../assets/tiled/MainScene.json';
import MainScene2 from '../../assets/tiled/MainScene2.json';
import MainScene3 from '../../assets/tiled/MainScene3.json';
import MainScene31 from '../../assets/tiled/MainScene31.json';
import MainScene32 from '../../assets/tiled/MainScene32.json';
import Nivel3 from '../../assets/tiled/Nivel3.json';
import ladder from '../../assets/tiled/Objects/Resized/escalera.png';
import pichos_arriba from '../../assets/tiled/Objects/Resized/pinchos_grandes_arriba.png';
import pichos_abajo from '../../assets/tiled/Objects/Resized/pinchos_grandes_abajo.png';
import pichos_izquierda from '../../assets/tiled/Objects/Resized/pinchos_grandes_izquierda.png';
import pichos_derecha from '../../assets/tiled/Objects/Resized/pinchos_grandes_derecha.png';
import bola_grande from '../../assets/tiled/Objects/Resized/bola_grande.png';
import diamante_azul from '../../assets/tiled/Objects/Resized/diamante_azul.png';

// SOUNDS
import Disparo from '../../assets/Sounds/Shoot.mp3';
import LevelSound from '../../assets/Sounds/nivel.mp3';
import Damage from '../../assets/Sounds/Damage.wav';
import baseball from '../../assets/Sounds/baseball.wav';
import Jump from '../../assets/Sounds/Jump.flac';
import Escaleras from '../../assets/Sounds/Escaleras.wav';
import Shootgun from '../../assets/Sounds/Shootgun.wav';
//BackGround
import CaveBackground from '../../assets/Background/Cave.png';
import CaveBackgroundFirst from '../../assets/Background/caveFirst.png';

/**
 * Carga los sprites del jugador
 * @param {Phaser.Scene} scene - La escena donde se cargarán los assets
 */
export function loadPlayerSprites(scene) {
  // PLAYER MOVE
  scene.load.spritesheet('player_idle', player_idle, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_run', player_run, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_jump', player_jump, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_hurt', player_hurt, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_death', player_death, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_doublejump', player_doublejump, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_climb', player_climb, {
    frameWidth: 48,
    frameHeight: 48
  });

  // PLAYER SHOOT BODY
  scene.load.spritesheet('player_run_shoot', player_run_shoot, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_jump_shoot', player_jump_shoot, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_idle_shoot', player_idle_shoot, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('player_sit_shoot', player_sit_shoot, {
    frameWidth: 48,
    frameHeight: 48
  });
}

/**
 * Carga los sprites de los enemigos
 * @param {Phaser.Scene} scene - La escena donde se cargarán los assets
 */
export function loadEnemySprites(scene) {
  // ENEMY 1
  scene.load.spritesheet('enemy1_idle', enemy1_idle, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy1_walk', enemy1_walk, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy1_hurt', enemy1_hurt, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy1_attack', enemy1_attack, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy1_die', enemy1_die, {
    frameWidth: 48,
    frameHeight: 48
  });

  // ENEMY 2
  scene.load.spritesheet('enemy2_idle', enemy2_idle, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy2_walk', enemy2_walk, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy2_hurt', enemy2_hurt, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy2_attack', enemy2_attack, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy2_die', enemy2_die, {
    frameWidth: 48,
    frameHeight: 48
  });




  // ENEMY 3
  scene.load.spritesheet('enemy3_idle', enemy3_idle, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy3_walk', enemy3_walk, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy3_hurt', enemy3_hurt, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy3_attack', enemy3_attack, {
    frameWidth: 48,
    frameHeight: 48
  });
  scene.load.spritesheet('enemy3_die', enemy3_die, {
    frameWidth: 48,
    frameHeight: 48
  });


  // BOSS
  scene.load.spritesheet('boss_idle', boss_idle, {
    frameWidth: 96,
    frameHeight: 96
  });
  scene.load.spritesheet('boss_walk', boss_walk, {
    frameWidth: 96,
    frameHeight: 96
  });
  scene.load.spritesheet('boss_hurt', boss_hurt, {
    frameWidth: 96,
    frameHeight: 96
  });
  scene.load.spritesheet('boss_attack1', boss_attack1, {
    frameWidth: 96,
    frameHeight: 96
  });
  scene.load.spritesheet('boss_attack2', boss_attack2, {
    frameWidth: 96,
    frameHeight: 96
  });
  scene.load.spritesheet('boss_die', boss_die, {
    frameWidth: 96,
    frameHeight: 96
  });

  scene.load.spritesheet('boss_special', boss_special, {
    frameWidth: 96,
    frameHeight: 96
  });



}

/**
 * Carga los sprites de armas y efectos
 * @param {Phaser.Scene} scene - La escena donde se cargarán los assets
 */
export function loadWeaponSprites(scene) {

  scene.load.spritesheet('hand3', hand3, { 
    frameWidth: 32, 
    frameHeight: 32 
  });

  scene.load.spritesheet('weapon', weapon, { 
    frameWidth: 29, 
    frameHeight: 11 
  });

  scene.load.spritesheet('explosiveWeapon', explosiveWeapon, { 
    frameWidth: 29, 
    frameHeight: 11 
  });


  scene.load.spritesheet('shotgunWeapon', shotgunWeapon, { 
    frameWidth: 29, 
    frameHeight: 11 
  });

  scene.load.spritesheet('escudo', escudo, { 
    frameWidth: 30, 
    frameHeight: 30 
  });

  scene.load.spritesheet('bullet', bullet, { 
    frameWidth: 15, 
    frameHeight: 4 
  });


  scene.load.spritesheet('bossBullet', bossBullet, { 
    frameWidth: 13, 
    frameHeight: 10 
  });


  
  scene.load.spritesheet('effect', effect, { 
    frameWidth: 288, 
    frameHeight: 48 
  });


}




export function loadObjectSprites(scene) {
  scene.load.spritesheet('parachute', parachute, { 
    frameWidth: 60, 
    frameHeight: 38 
  });


  scene.load.spritesheet('jetpack', jetpack, { 
    frameWidth: 40, 
    frameHeight: 40 
  });

  scene.load.image('ladder2', ladder);
  scene.load.image('pichos_arriba', pichos_arriba);
  scene.load.image('pichos_abajo', pichos_abajo);
  scene.load.image('pichos_izquierda', pichos_izquierda);
  scene.load.image('pichos_derecha', pichos_derecha);
  scene.load.image('bola_grande', bola_grande);
  scene.load.image('diamante', diamante_azul);
  
  scene.load.image('BarrilNormal', barrilNormal);
  scene.load.image('BarrilCura', barrilCura);
  scene.load.image('BarrilTNT', barrilTNT);
  //scene.load.image('BarrilVeneno', barrilVeneno);
  //scene.load.image('BarrilImpulso', barrilImpulso);
  //scene.load.image('BarrilRespawn', barrilRespawn);
  
  // Cargar la imagen del cartel
  scene.load.image('Cartel', cartelMadera);

  scene.load.image('BlqDestructible', BlqDestructible);
}


/**
 * Carga los assets del tilemap
 * @param {Phaser.Scene} scene - La escena donde se cargarán los assets
 */
export function loadTilemapAssets(scene) {
  scene.load.image('tiles', Tileset);
  scene.load.image('tiles2', Tileset2);
  scene.load.image('tiles3', Tileset3);
  scene.load.tilemapTiledJSON('map', MainScene);
  scene.load.tilemapTiledJSON('map2', MainScene2);
  scene.load.tilemapTiledJSON('map3', MainScene3);
  scene.load.tilemapTiledJSON('map31', MainScene31);
  scene.load.tilemapTiledJSON('map32', MainScene32);
}

/**
 * Carga los sonidos del juego
 * @param {Phaser.Scene} scene - La escena donde se cargarán los assets
 */
export function loadSoundAssets(scene) {
  scene.load.audio('disparo', Disparo);
  scene.load.audio('level2', LevelSound);
  scene.load.audio('damage', Damage);
  scene.load.audio('baseball', baseball);
  scene.load.audio('jump', Jump);
  scene.load.audio('escaleras', Escaleras);
  scene.load.audio('shootgun', Shootgun);
} 

export function loadBackgroundSprites(scene){
scene.load.image('CaveBackground',CaveBackground);
scene.load.image('CaveBackgroundFirst',CaveBackgroundFirst);

}
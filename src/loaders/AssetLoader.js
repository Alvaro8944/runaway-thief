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

//PLAYER SHOOT HAND
import hand3 from '../../assets/players/main_character_shoot_hands/3.png';

//WEAPON
import weapon from '../../assets/Guns/4_1.png';

//PARACHUTE
import parachute from '../../assets/Objects/parachute.png';


//BULLET
import bullet from '../../assets/Bullets/5.png';

//SHOOT EFFECT
import effect from '../../assets/Shoot_effects/9_1.png';

// TILEMAP
import Tileset from '../../assets/tiled/Tileset.png';
import Tileset2 from '../../assets/tiled/Tileset2.png';
import Tileset3 from '../../assets/tiled/Tileset3.png';
import MainScene from '../../assets/tiled/MainScene.json';
import Nivel3 from '../../assets/tiled/Nivel3.json';
import ladder from '../../assets/tiled/Objects/Resized/escalera.png';
import pichos_arriba from '../../assets/tiled/Objects/Resized/pinchos_grandes_arriba.png';
import pichos_abajo from '../../assets/tiled/Objects/Resized/pinchos_grandes_abajo.png';
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
  scene.load.spritesheet('bullet', bullet, { 
    frameWidth: 15, 
    frameHeight: 4 
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
  scene.load.image('ladder2', ladder);
  scene.load.image('pichos_arriba', pichos_arriba);
  scene.load.image('pichos_abajo', pichos_abajo);
  scene.load.image('bola_grande', bola_grande);
  scene.load.image('diamante', diamante_azul);
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
  scene.load.tilemapTiledJSON('map3', Nivel3);
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
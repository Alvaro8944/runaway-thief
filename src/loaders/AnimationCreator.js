 /**
 * Crea todas las animaciones del juego
 * @param {Phaser.Scene} scene - La escena donde se crearán las animaciones
 */
export function createAllAnimations(scene) {
  createPlayerAnimations(scene);
  createEnemyAnimations(scene);
  createEnemy2Animations(scene);
  createWeaponAnimations(scene);
}

/**
 * Crea las animaciones del jugador
 * @param {Phaser.Scene} scene - La escena donde se crearán las animaciones
 */
export function createPlayerAnimations(scene) {
  // Run
  scene.anims.create({
    key: 'run',
    frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });

  // Idle
  scene.anims.create({
    key: 'idle',
    frames: scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
    frameRate: 10
  });

  scene.anims.create({
    key: 'jump',
    frames: scene.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
    frameRate: 3
  });

  scene.anims.create({
    key: 'crawl',
    frames: [{ key: 'player_jump', frame: 3 }],
    frameRate: 10
  });

  // ---- SHOOT BODY ----
  scene.anims.create({
    key: 'run_shoot',
    frames: scene.anims.generateFrameNumbers('player_run_shoot', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'idle_shoot',
    frames: scene.anims.generateFrameNumbers('player_idle_shoot', { start: 0, end: 3 }),
    frameRate: 10
  });

  scene.anims.create({
    key: 'sit_shoot',
    frames: [{ key: 'player_sit_shoot', frame: 2 }],
    frameRate: 10,
    repeat: 0 // 🔹 La animación se ejecuta solo una vez
  });

  scene.anims.create({
    key: 'jump_shoot',
    frames: scene.anims.generateFrameNumbers('player_jump_shoot', { start: 0, end: 3 }),
    frameRate: 3
  });

  // Animación de daño
  scene.anims.create({
    key: 'player_hurt',
    frames: scene.anims.generateFrameNumbers('player_hurt', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: 0
  });

  // Animación de muerte
  scene.anims.create({
    key: 'player_death',
    frames: scene.anims.generateFrameNumbers('player_death', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });

  // Double Jump
  scene.anims.create({
    key: 'doublejump',
    frames: scene.anims.generateFrameNumbers('player_doublejump', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });

  // Animación de escalada
  scene.anims.create({
    key: 'climb',
    frames: scene.anims.generateFrameNumbers('player_climb', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });
}

/**
 * Crea las animaciones de los enemigos tipo 1
 * @param {Phaser.Scene} scene - La escena donde se crearán las animaciones
 */
export function createEnemyAnimations(scene) {
  scene.anims.create({
    key: 'enemy1_idle',
    frames: scene.anims.generateFrameNumbers('enemy1_idle', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'enemy1_walk',
    frames: scene.anims.generateFrameNumbers('enemy1_walk', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'enemy1_attack',
    frames: scene.anims.generateFrameNumbers('enemy1_attack', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });
  
  // Animación de recibir daño (hurt)
  scene.anims.create({
    key: 'enemy1_hurt',
    frames: scene.anims.generateFrameNumbers('enemy1_hurt', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: 0
  });
  
  // Animación de muerte
  scene.anims.create({
    key: 'enemy1_die',
    frames: scene.anims.generateFrameNumbers('enemy1_die', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });
}

/**
 * Crea las animaciones de los enemigos tipo 2
 * @param {Phaser.Scene} scene - La escena donde se crearán las animaciones
 */
export function createEnemy2Animations(scene) {
  scene.anims.create({
    key: 'enemy2_idle',
    frames: scene.anims.generateFrameNumbers('enemy2_idle', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'enemy2_walk',
    frames: scene.anims.generateFrameNumbers('enemy2_walk', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
  });





  scene.anims.create({
    key: 'enemy2_attack',
    frames: scene.anims.generateFrameNumbers('enemy2_attack', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0
  });
  
  scene.anims.create({
    key: 'enemy2_attack_down',
    frames: scene.anims.generateFrameNumbers('enemy2_attack', { start: 3, end: 5 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'enemy2_attack_up',
    frames: scene.anims.generateFrameNumbers('enemy2_attack', { start: 6, end: 8 }),
    frameRate: 10,
    repeat: 0
  });





  
  // Animación de recibir daño (hurt)
  scene.anims.create({
    key: 'enemy2_hurt',
    frames: scene.anims.generateFrameNumbers('enemy2_hurt', { start: 0, end: 1 }),
    frameRate: 10,
    repeat: 0
  });
  
  // Animación de muerte
  scene.anims.create({
    key: 'enemy2_die',
    frames: scene.anims.generateFrameNumbers('enemy2_die', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });
}

/**
 * Crea las animaciones de armas y efectos
 * @param {Phaser.Scene} scene - La escena donde se crearán las animaciones
 */
export function createWeaponAnimations(scene) {
  // Hand
  scene.anims.create({
    key: 'hand3',
    frames: [{ key: 'hand3', frame: 0 }],
    frameRate: 10
  });

  // Weapon
  scene.anims.create({
    key: 'weapon',
    frames: [{ key: 'weapon', frame: 0 }],
    frameRate: 10
  });

  // Bullet
  scene.anims.create({
    key: 'bullet',
    frames: [{ key: 'bullet', frame: 0 }],
    frameRate: 10
  });

  // Effect
  scene.anims.create({
    key: 'effect',
    frames: scene.anims.generateFrameNumbers('effect', { start: 0, end: 5 }),
    frameRate: 10
  });
}
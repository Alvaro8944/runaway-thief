import Phaser from 'phaser';

// Constantes para los estados del jugador
export const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  HURT: 'HURT',
  DEAD: 'DEAD',
  ATTACKING: 'ATTACKING',
  CLIMBING: 'CLIMBING'
};

// Constantes para la configuración del jugador
const PLAYER_CONFIG = {
  // Movimiento
  NORMAL_SPEED: 180,
  PARACHUTE_SPEED: 50,
  JUMP_SPEED: -240,
  CLIMB_SPEED: 100,
  
  // Salud y daño
  MAX_HEALTH: 150,
  DAMAGE: 20,
  
  // Arma y munición
  MAX_AMMO: 6,
  SHOT_COOLDOWN: 350,   // ms entre disparos
  RELOAD_TIME: 1500,     // ms para recargar
  BULLET_SPEED: 800,    // velocidad de las balas
  
  // Colisiones y física
  BOUNCE: 0.1,
  HITBOX_WIDTH: 20,
  HITBOX_HEIGHT: 35,
  HITBOX_OFFSET_X: 13,
  HITBOX_OFFSET_Y: 13,
  SCALE: 1.25,
  
  // Doble salto
  MAX_JUMPS: 2,
  
  // Agacharse
  MAX_CRAWL_TIME: 80,
  CRAWL_HITBOX_HEIGHT: 28,
  CRAWL_HITBOX_OFFSET_Y: 20,
  
  // Invulnerabilidad
  INVULNERABLE_TIME: 1000,
  KNOCKBACK_FORCE: 200,
  KNOCKBACK_DURATION: 200,
  
  // Escaleras
  CLIMB_SOUND_DELAY: 980 // ms entre sonidos de escalera
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
    timer = 300000;
    remainingtime;
    timerText;
  
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configuración física básica
    this.setCollideWorldBounds(true);
    this.setBounce(PLAYER_CONFIG.BOUNCE);
    this.setSize(PLAYER_CONFIG.HITBOX_WIDTH, PLAYER_CONFIG.HITBOX_HEIGHT);
    this.setOffset(PLAYER_CONFIG.HITBOX_OFFSET_X, PLAYER_CONFIG.HITBOX_OFFSET_Y);
    this.setScale(PLAYER_CONFIG.SCALE);

    // ===== Atributos de movimiento =====
    this.normalSpeed = PLAYER_CONFIG.NORMAL_SPEED;
    this.floatingSpeed = PLAYER_CONFIG.PARACHUTE_SPEED;
    this.speed = this.normalSpeed;
    this.jumpSpeed = PLAYER_CONFIG.JUMP_SPEED;
    this.climbSpeed = PLAYER_CONFIG.CLIMB_SPEED;
    
    // ===== Atributos de combate =====
    this.score = 0;
    this.health = PLAYER_CONFIG.MAX_HEALTH;
    this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;
    this.damage = PLAYER_CONFIG.DAMAGE;
    
    // ===== Atributos de arma y munición =====
    this.hasWeapon = true;
    this.ammo = PLAYER_CONFIG.MAX_AMMO;
    this.maxAmmo = PLAYER_CONFIG.MAX_AMMO;
    this.lastShotTime = 0;
    this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN;
    this.isReloading = false;
    this.reloadTime = PLAYER_CONFIG.RELOAD_TIME;
    this.reloadStartTime = 0;
    this.bulletSpeed = PLAYER_CONFIG.BULLET_SPEED;
    

    // ====COSAS DEL ESCUDO=====
    this.hasEscudo = false;
   

    // ====TENER OBJETO EN GENERAL=====
    this.hasObject = this.hasWeapon || this.hasEscudo;

    // ===== Atributos de estado =====
    this.hasFloatingObject = false;
    this.resetearAgacharse = false;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = PLAYER_CONFIG.MAX_CRAWL_TIME;
    this.fatalFallHeight = 10;
    this.state = PLAYER_STATE.IDLE;
    this.invulnerableTime = PLAYER_CONFIG.INVULNERABLE_TIME;
    this.lastHitTime = 0;
    this.isInvulnerable = false;
    this.knockbackForce = PLAYER_CONFIG.KNOCKBACK_FORCE;
    this.knockbackDuration = PLAYER_CONFIG.KNOCKBACK_DURATION;
    this.isKnockedBack = false;
    
    // ===== Atributos para el doble salto =====
    this.jumpsAvailable = PLAYER_CONFIG.MAX_JUMPS;
    this.currentJumps = 0;
    this.isDoubleJumping = false;
    this.wasOnFloor = false;

    // ===== Atributos para escaleras =====
    this.canClimb = false;
    this.isClimbing = false;
    this.currentLadder = null;
    this.isClimbingCentered = false;
    this.movimiento = false;
    this.lastClimbSoundTime = 0;
    this.climbSoundDelay = PLAYER_CONFIG.CLIMB_SOUND_DELAY;

    // ===== Interfaz =====
    this.createUI();

    // ===== Controles =====
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.input.on('pointerdown', () => this.shoot(), this);

    // ===== Objetos visuales =====
    // Mano y arma
    this.hand = scene.add.sprite(x, y, 'hand3').setOrigin(0.45, 0.5);
    this.hand.setDepth(this.depth - 1);
    this.weapon = scene.add.sprite(this.x, this.y, 'weapon').setOrigin(1.3, 0.5);
    this.escudo = scene.physics.add.sprite(this.x, this.y, 'escudo').setOrigin(1, 0.5); 
    this.escudo.setSize(20, 25); 
    this.escudo.body.setEnable(this.hasEscudo);

    this.weapon.setDepth(this.hand.depth - 1);
    this.escudo.setDepth(this.hand.depth - 1);
    this.escudo.setVisible(this.hasEscudo); 

    // Paracaídas
    this.parachute = scene.add.sprite(this.x, this.y, 'parachute').setOrigin(0.57, 1.1);
    this.parachute.setDepth(this.depth - 3);

        // Jetpack
        this.jetpack = scene.add.sprite(this.x, this.y, 'jetpack').setOrigin(0.55, 0.3);
        this.jetpack.setDepth(this.depth - 3);



        // Variables para el tiempo de uso y recarga
this.floatingEnergy = 400; // Máxima energía
this.floatingEnergyMax = 400;
this.floatingEnergyDrainRate = 1; // Cuánto se gasta por frame
this.floatingEnergyRechargeRate = 1; // Cuánto se recarga por frame
this.isRecharging = false; // Indica si está recargando
this.bloquearmovimiento = false;

    // ===== Inicialización =====
    // Iniciar con la animación idle
    const initialAnim = this.hasObject ? 'idle_shoot' : 'idle';
    this.play(initialAnim);

    // Crear el emisor de partículas para el doble salto
    this.doubleJumpEmitter = this.scene.add.particles(0, 0, 'effect', {
      speed: 100,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: -1 // -1 significa que no emite automáticamente
    });
    this.doubleJumpEmitter.stop(); // Asegurarse de que está detenido inicialmente

    // Temporizador
    this.remainingtime = this.timer;
    this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
    this.timerText = this.scene.add.text(0, 0, "Tiempo Restante:" + this.remainingtime / 1000);
    this.timerText.setScrollFactor(0);
  }

  // === MÉTODOS DE INTERFAZ ===
  
  // Crear los elementos de la interfaz
  createUI() {
    // Contenedor principal para todos los elementos de UI
    this.uiContainer = this.scene.add.container(10, 30);
    this.uiContainer.setScrollFactor(0); // Fijar a la cámara
    
    // Barra de salud
    this.healthBar = this.scene.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    // Indicador de munición
    this.ammoText = this.scene.add.text(0, 30, 'Munición: ' + this.ammo + '/' + this.maxAmmo, { 
      fontSize: '16px', 
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 2
    });
    this.uiContainer.add(this.ammoText);
    
    // Indicador de puntuación
    this.scoreText = this.scene.add.text(0, 55, 'Puntuación: ' + this.score, { 
      fontSize: '16px', 
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 2
    });
    this.uiContainer.add(this.scoreText);
    
    // Actualizar la UI inicialmente
    this.updateUI();
  }

  // Actualizar todos los elementos de la interfaz
  updateUI() {
    // Actualizar barra de salud
    this.healthBar.clear();
    
    // Borde de la barra
    this.healthBar.lineStyle(2, 0x000000, 1);
    this.healthBar.strokeRect(0, 0, 150, 20);
    
    // Fondo rojo
    this.healthBar.fillStyle(0xff0000, 1);
    this.healthBar.fillRect(0, 0, 150, 20);
    
    // Parte verde proporcional a la salud actual
    const healthPercent = this.health / this.maxHealth;
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(0, 0, 150 * healthPercent, 20);
    
    // Texto de salud
    if (this.healthText) {
      this.healthText.destroy();
    }
    this.healthText = this.scene.add.text(75, 10, `${this.health}/${this.maxHealth}`, { 
      fontSize: '14px', 
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.uiContainer.add(this.healthText);
    
    // Actualizar texto de munición
    let ammoText = this.ammo + '/' + this.maxAmmo;
    if (this.isReloading) {
      // Mostrar una indicación visual de recarga
      const progress = Math.min(1, (this.scene.time.now - this.reloadStartTime) / this.reloadTime);
      const dots = '.'.repeat(Math.floor(progress * 3) + 1);
      ammoText = "Recargando" + dots;
    }
    this.ammoText.setText('Munición: ' + ammoText);
    
    // Actualizar texto de puntuación
    this.scoreText.setText('Puntuación: ' + this.score);
  }

  // === MÉTODOS DE ACTUALIZACIÓN ===
  
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    this.movimiento = false;

    console.log(this.x + " "+  this.y);
    if (this.state === PLAYER_STATE.DEAD) return;
    
    // Actualizar UI en cada frame
    this.updateUI();

    // Comprobar si la recarga ha terminado
    if (this.isReloading && time - this.reloadStartTime >= this.reloadTime) {
      this.ammo = this.maxAmmo;
      this.isReloading = false;
      this.scene.sound.play('disparo', { volume: 0.3 }); // Sonido de recarga completada
    }

    // Actualizar invulnerabilidad
    if (this.isInvulnerable && time - this.lastHitTime >= this.invulnerableTime) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }

    if (this.isKnockedBack) return;

    if (!this.scene.keys) return;
    
    // ===== LÓGICA DEL PARACAÍDAS =====
    // Activar/desactivar paracaídas según los controles

    this.parachuteActivated = (this.scene.keys.down.isDown && !this.body.onFloor() && !this.jetpackActivated);
    this.jetpackActivated = this.scene.keys.up.isDown && !this.parachuteActivated;

    this.hasFloatingObject = ( (this.jetpackActivated || this.parachuteActivated ) && !this.isClimbing && this.floatingEnergy > 0);
    this.parachute.setVisible(this.hasFloatingObject && this.parachuteActivated);
    this.jetpack.setVisible(this.hasFloatingObject && this.jetpackActivated);
    

    if (this.hasFloatingObject) {

      // Ajustar velocidad cuando se usa el paracaídas
      if(this.parachuteActivated) this.speed = this.floatingSpeed;

      else if(this.jetpackActivated) {
        
        this.speed = this.floatingSpeed*3;
        this.isRecharging = false; // Mientras esté en el aire, no recarga
      }

      if (this.parachuteActivated)this.parachute.setPosition(this.x, this.y);
      if(this.jetpackActivated) {
        
        this.jetpack.setPosition(this.x, this.y);
        this.createJetpackEffect()
      }


      // Control vertical con paracaídas
      if (this.parachuteActivated) {
        this.setVelocityY(this.speed); 
      } else if (this.jetpackActivated) {
        this.setVelocityY(-this.speed); 
      } else {
        this.setVelocityY(0); // Mantiene posición cuando no se pulsa nada
      }
    } else {
      // Restaurar velocidad normal
      this.speed = this.normalSpeed;
    }


     // Si toca el suelo, empieza la recarga
     if (this.body.onFloor()) {
      this.isRecharging = true;
     }


     // Si está en el suelo, recargar energía
    if (this.isRecharging) {
      this.floatingEnergy += this.floatingEnergyRechargeRate;
      this.floatingEnergy = Math.min(this.floatingEnergyMax, this.floatingEnergy);
    }
    else{

     if(!this.parachuteActivated) {
      this.floatingEnergy -= this.floatingEnergyDrainRate;
      this.floatingEnergy = Math.max(0, this.floatingEnergy);
     }

    }

    
    // Determinar las animaciones según el estado
    const runAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'run_shoot' : 'run');
    const idleAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'idle_shoot' : 'idle');
    const jumpAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'jump_shoot' : 'jump');
    const idleJumpAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'jump_shoot' : 'jump');
    

    // Agregar tecla R para recargar manualmente
    const keyR = this.scene.input.keyboard.addKey('R');
    if (Phaser.Input.Keyboard.JustDown(keyR) && !this.isReloading && this.ammo < this.maxAmmo && this.hasWeapon) {
      this.reload();
    }

    // SACAR arma
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarArma)) {
      this.hasWeapon = true;
      this.weapon.setVisible(this.hasWeapon);   
      this.hand.setVisible(this.hasWeapon);   

      this.hasEscudo = false;
      this.escudo.setVisible(this.hasEscudo); 
      this.escudo.body.setEnable(this.hasEscudo);
      this.escudo.body.reset();


    }

    // SACAR escudo
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarEscudo)) {
      
      this.hasEscudo = true;
      this.escudo.setVisible(this.hasEscudo);   
      this.hand.setVisible(this.hasEscudo); 
      this.escudo.body.setEnable(this.hasEscudo);
      this.escudo.body.reset();

      this.hasWeapon = false;
      this.weapon.setVisible(this.hasWeapon); 

    }


    // Lógica de escalada
    if (this.canClimb) {
      const isUpPressed = this.scene.keys.up.isDown;
      const isDownPressed = this.scene.keys.down.isDown;

      if ((isUpPressed || isDownPressed) && !this.isClimbing) {
        this.isClimbing = true;
        this.body.allowGravity = false;
        this.setVelocityY(0);
        this.setVelocityX(0);
      }

      if (this.isClimbing) {
        // Centrar constantemente al jugador en la escalera
        const targetX = this.currentLadder.x + 10;
        const diffX = targetX - this.x;
        
        if (Math.abs(diffX) > 1) {
          // Mover suavemente hacia el centro de la escalera
          this.x += diffX * 0.2;
        } else {
          this.x = targetX;
        }

        // Movimiento vertical en la escalera
        if (isUpPressed) {
          this.setVelocityY(-this.climbSpeed);
          this.play('climb', true);
          this.climb_sound();
        } else if (isDownPressed) {
          this.setVelocityY(this.climbSpeed);
          this.play('climb', true);
          this.climb_sound();
        } else {
          this.setVelocityY(0);
          this.anims.pause();
        }

        // Saltar desde la escalera
        if (Phaser.Input.Keyboard.JustDown(this.scene.keys.jump)) {
          this.isClimbing = false;
          this.body.allowGravity = true;
          this.setVelocityY(this.jumpSpeed);
          this.currentJumps = 1;
          this.jump_sound();
          return;
        }

        // No permitir movimiento horizontal mientras escala
        this.setVelocityX(0);
        return;
      }
    } else if (this.isClimbing) {
      // Dejar de escalar si no está en contacto con una escalera
      this.isClimbing = false;
      this.body.allowGravity = true;
      this.play(idleAnim);
    }
    
    const onFloorNow = this.body.onFloor();
    
    // Resetear saltos disponibles cuando toca el suelo
    if (onFloorNow && !this.wasOnFloor) {
      this.currentJumps = 0;
      // Asegurarse de que el emisor está detenido al tocar el suelo
      this.doubleJumpEmitter.stop();
    }
    this.wasOnFloor = onFloorNow;

    // Lógica de movimiento horizontal
    if (this.scene.keys.left.isDown && !this.bloquearmovimiento) {

      this.movimiento = true;
      this.setVelocityX(-this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      //this.setFlipX(true);

    } else if (this.scene.keys.right.isDown && !this.bloquearmovimiento) {

      this.movimiento = true;
      this.setVelocityX(this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      //this.setFlipX(false);
    } else {
      this.setVelocityX(0);
      if (this.body.onFloor()) {
        this.anims.play(idleAnim, true);
      }
    }

    // Lógica de salto mejorada
    const justPressedJump = Phaser.Input.Keyboard.JustDown(this.scene.keys.jump);
    if (justPressedJump && (this.currentJumps < this.jumpsAvailable)) {
      this.currentJumps++;
      this.setVelocityY(this.jumpSpeed);
      
      this.jump_sound();
      if (this.currentJumps === 2 && !this.hasObject) {
        // Solo en el segundo salto cambiamos al sprite de doble salto
        this.play('doublejump', true);
        // Emitir partículas
        this.doubleJumpEmitter.setPosition(this.x, this.y + 20);
        this.doubleJumpEmitter.explode(10);
      } else {
        // Primer salto normal
        const anim = this.body.velocity.x !== 0 ? jumpAnim : idleJumpAnim;
        this.play(anim, true);
      }
    }

    // Lógica para agacharse
    if (this.scene.keys.down.isDown && this.crawlTime <= this.maxCrawlTime && this.body.onFloor()) {

      this.resetearAgacharse = true;

      if (this.hasObject) {
        this.anims.play("sit_shoot", true);
        this.body.setSize(PLAYER_CONFIG.HITBOX_WIDTH, PLAYER_CONFIG.CRAWL_HITBOX_HEIGHT);
        this.body.offset.y = PLAYER_CONFIG.CRAWL_HITBOX_OFFSET_Y;
      } else {
        this.anims.play("crawl", true);
        this.body.setSize(PLAYER_CONFIG.HITBOX_WIDTH, PLAYER_CONFIG.CRAWL_HITBOX_HEIGHT);
        this.body.offset.y = PLAYER_CONFIG.CRAWL_HITBOX_OFFSET_Y;
      }

      this.crawlTime++;

    } else {

      if (this.resetearAgacharse) {

        this.setSize(PLAYER_CONFIG.HITBOX_WIDTH, PLAYER_CONFIG.HITBOX_HEIGHT);
        this.setOffset(PLAYER_CONFIG.HITBOX_OFFSET_X, PLAYER_CONFIG.HITBOX_OFFSET_Y);
        this.resetearAgacharse = false;
        this.bloquearmovimiento = false;
      }

    }


    if(this.resetearAgacharse && !this.movimiento){
      this.bloquearmovimiento = true;
    }


    // Control de tiempo para el agacharse
    if (this.crawlTime >= this.maxCrawlTime || !(this.scene.keys.down.isDown  && this.body.onFloor())) {
      this.restarcrawl++;
      if (this.restarcrawl >= this.maxCrawlTime) {
        this.crawlTime = 0;
        this.restarcrawl = 0;
      }
    }

    // Actualizar animaciones en el aire
    if (!this.body.onFloor() && this.currentJumps !== 2) {
      
      const anim = this.body.velocity.x !== 0 ? jumpAnim : idleJumpAnim;
      if (!this.anims.isPlaying || this.anims.currentAnim.key !== anim) {
        this.play(anim, true);
      }
    }

    if (this.hasObject) {
      this.updateHand();
    }
    
    // ===== DAÑO POR CAÍDA =====
    // Registrar la posición más alta y calcular daño por caída
    if (!this.body.onFloor()) {
      if (this.highestY === undefined || this.highestY === null) {
        this.highestY = this.y; // Guarda la mayor altura alcanzada
      } else if (this.y < this.highestY) {
        this.highestY = this.y; // Actualiza si sube más alto
      }
    } else {
      if (this.highestY !== undefined && this.highestY !== null) {
        const fallDistance = Math.abs(this.highestY - this.y); // Diferencia real de caída
        if (this.y > this.highestY && 
            fallDistance >= this.fatalFallHeight && 
            Math.abs(this.body.velocity.y) > this.floatingSpeed
          && !this.jetpackActivated && !this.parachuteActivated) {
          this.health = 0;
          this.die();
        }
      } 
      this.highestY = null; // Resetea cuando toca el suelo
    }
  }

  // === MÉTODOS DE ARMA Y DISPARO ===
  
  reload() {
    if (this.isReloading || this.ammo === this.maxAmmo) return;
    
    this.isReloading = true;
    this.reloadStartTime = this.scene.time.now;
    // Reproducir sonido de inicio de recarga
    //this.scene.sound.play('escaleras', { volume: 0.3 });
  }

  shoot() {
    // Si estamos recargando o no tenemos munición, no podemos disparar
    if (this.isReloading || this.ammo <= 0 || !this.hasWeapon) return;
    
    // Comprobar cooldown entre disparos
    if (this.scene.time.now - this.lastShotTime < this.shotCooldown) return;
    
    // Registrar tiempo de disparo para cooldown
    this.lastShotTime = this.scene.time.now;
    
    // Reducir munición
    this.ammo--;
    
    // Si nos quedamos sin munición, iniciar recarga automática
    if (this.ammo <= 0) {
      this.reload();
    }
   
    // Calcular ángulo de disparo
    let angle = this.weapon.rotation;
    if (this.flipX) {
      angle += Math.PI;
    }
    
    // Calcular posición inicial de la bala
    const bulletX = this.weapon.x + Math.cos(angle) * 20;
    const bulletY = this.weapon.y + Math.sin(angle) * 20;
    
    // Crear la bala
    const bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
    bullet.setRotation(this.weapon.rotation);
    bullet.damage = this.damage;
  
    // Configurar velocidad de la bala
    const velocityX = Math.cos(angle) * this.bulletSpeed;
    const velocityY = Math.sin(angle) * this.bulletSpeed;
    bullet.setVelocity(velocityX, velocityY);
  
    // Asegurarse de que la bala no esté afectada por la gravedad
    bullet.body.allowGravity = false;
  
    // Efecto de disparo
    this.createShootEffect(angle);
    
    // Reproducir sonido de disparo
    this.scene.sound.play('disparo');
  }



  createJetpackEffect() {
    this.doubleJumpEmitter.setPosition(this.x, this.y + 50);
    this.doubleJumpEmitter.setAngle(90); // Apunta hacia abajo
    this.doubleJumpEmitter.explode(2);
  }
  
  
  

  
  
  createShootEffect(angle) {
    const cannonOffset = 125;
    const effect = this.scene.add.sprite(
      this.weapon.x + Math.cos(angle) * cannonOffset,
      this.weapon.y + Math.sin(angle) * cannonOffset,
      'effect'
    );
    effect.setRotation(this.flipX ? this.weapon.rotation + Math.PI : this.weapon.rotation);
    effect.setDepth(this.weapon.depth + 1);
    effect.play('effect');
    
    this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        if (effect.anims.currentFrame) {
          effect.setPosition(
            this.weapon.x + Math.cos(angle) * cannonOffset,
            this.weapon.y + Math.sin(angle) * cannonOffset
          );
        }
      },
      repeat: effect.anims.getTotalFrames()
    });
    
    effect.once('animationcomplete', () => effect.destroy());
  }




  updateHand() {
    const pointer = this.scene.input.activePointer;
    const worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    let angle = Phaser.Math.Angle.Between(this.x, this.y, worldPointer.x, worldPointer.y);
    
    if (this.flipX) {
      angle += Math.PI;
    }
    
    angle = Phaser.Math.Angle.Wrap(angle);
    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;

    if(!this.flipX){
      if(angle > maxAngle || angle < minAngle ){
        this.setFlipX(true);
      }   
      }
      else{
        if(angle > maxAngle || angle < minAngle ){
          this.setFlipX(false);
        }
      }
  

    
    const shoulderOffsetX = 0;
    const shoulderOffsetY = 1.5;
    const shoulderX = this.x + shoulderOffsetX * (this.flipX ? -1 : 1);
    const shoulderY = this.y + shoulderOffsetY;
    
    this.hand.setPosition(shoulderX, shoulderY);
    this.hand.setRotation(angle);


    this.updateObject();
    this.ajustarDireccion();


  }








  updateObject() {
    if(this.hasWeapon){

    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);

    }
    if(this.hasEscudo){

      this.escudo.setRotation(this.hand.rotation);
 
 
        // Simulamos la "rotación" del hitbox calculando el offset inverso
        let angle = this.hand.rotation;
        let distancia; // La distancia desde el centro que quieras
        let offsetX, offsetY;
 
        if (!this.flipX) {

          distancia = 10;

          offsetX = Math.cos(angle + Math.PI ) * distancia + 33;
          offsetY = -Math.sin(angle + Math.PI ) * distancia ;


         } else {
        
          distancia = 10;

         offsetX = Math.cos(angle + Math.PI ) * distancia + 15;
         offsetY = Math.sin(angle + Math.PI ) * distancia ;

        }


 
        this.escudo.body.setOffset(offsetX, offsetY);
 
 
     }
  }

  ajustarDireccion() {

    this.hand.setScale(!this.flipX ? -1 : 1, 1);
     if(this.hasWeapon) this.weapon.setScale(!this.flipX ? -1 : 1, 1);
     if(this.hasEscudo) {

      this.escudo.setScale(!this.flipX ? -1 : 1, 1);
      this.escudo.body.reset(this.hand.x, this.hand.y);

      }
  }

  // === MÉTODOS DE DAÑO Y SALUD ===
  
  takeDamage(amount, attacker = null) {
    if (this.isInvulnerable || this.state === PLAYER_STATE.DEAD) return;

    this.health -= amount;
    this.isInvulnerable = true;
    this.lastHitTime = this.scene.time.now;
    this.state = PLAYER_STATE.HURT;

    // Efecto de parpadeo
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // Knockback
    if (attacker) {
      const direction = Math.sign(this.x - attacker.x);
      this.isKnockedBack = true;
      this.setVelocityX(direction * this.knockbackForce);
      this.setVelocityY(-this.knockbackForce / 2);

      this.scene.time.delayedCall(this.knockbackDuration, () => {
        this.isKnockedBack = false;
      });
    }

    // Reproducir animación de daño
    this.play('player_hurt', true);
    this.once('animationcomplete-player_hurt', () => {
      if (this.health <= 0) {
        this.die();
      } else {
        this.state = PLAYER_STATE.IDLE;
      }
    });

    // Actualizar la UI
    this.updateUI();

    // Reproducir sonido de daño
    this.scene.sound.play('damage');
  }

  die() {
    this.state = PLAYER_STATE.DEAD;
    this.play('player_death', true);
    this.setVelocity(0);
    this.body.setAllowGravity(false);
    
    this.once('animationcomplete-player_death', () => {
      // Emitir evento de muerte para que la escena lo maneje
      this.scene.events.emit('playerDeath');
    });
  }

  hurt() {
    if (this.isInvulnerable || this.state === PLAYER_STATE.DEAD) return;
    this.takeDamage(20); // Los pinchos hacen 20 de daño
  }

  // === MÉTODOS DE SONIDO ===
  
  jump_sound() {
    // Reproducir sonido de salto
    this.scene.sound.play('jump', { volume: 0.5 });
  }

  climb_sound() {
    // Verificar si ha pasado suficiente tiempo desde el último sonido
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastClimbSoundTime >= this.climbSoundDelay) {
      // En vez de intentar modificar el volumen del sonido retornado por play()
      // configuramos el volumen directamente en la llamada a play()
      this.scene.sound.play('escaleras', {
        volume: 0.5
      });
      
      this.lastClimbSoundTime = currentTime;
    }
  }
  
  // === MÉTODOS DE TEMPORIZADOR ===
  
  updateTimer() {
    this.remainingtime -= 1000;
    if (this.remainingtime <= 0) {
      this.die();
    }
    this.timerText.setText("Tiempo Restante:" + this.remainingtime / 1000);
  }

  // === MÉTODOS DE UI ===
  
  /**
   * Maneja el evento de un diamante recogido, actualizando el puntaje y la UI
   * @param {number} value - El valor del diamante recogido
   */
  handleDiamondCollected(value) {
    // Incrementar la puntuación
    this.score += value;
    
    // Actualizar la UI
    this.updateUI();
    
    // Efecto visual opcional (por ejemplo, brillo alrededor del jugador)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
}

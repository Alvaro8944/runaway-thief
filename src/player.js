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
export const PLAYER_CONFIG = {
  // Movimiento
  NORMAL_SPEED: 180,
  PARACHUTE_SPEED: 50,
  JUMP_SPEED: -240,
  CLIMB_SPEED: 100,
  
  // Salud y daño
  MAX_HEALTH: 150,
  DAMAGE: 20,
  
  // Arma y munición
  RIFLE_AMMO: 10,       // munición para el rifle 
  SHOTGUN_AMMO: 12,     // munición para la escopeta
  EXPLOSIVE_AMMO: 3,   // munición para arma explosiva
  SHOT_COOLDOWN: 350,   // ms entre disparos
  RELOAD_TIME: 1500,    // ms para recargar
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
  CLIMB_SOUND_DELAY: 980, // ms entre sonidos de escalera
  
  // Duración de los power-ups
  SHIELD_DURATION: 5000,        // 5 segundos de escudo
  SHIELD_COOLDOWN: 8000,        // 8 segundos de cooldown
  SPEED_BOOST_DURATION: 15000   // 15 segundos de velocidad aumentada
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
    timer = 300000;
    remainingtime;
  
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
    // Sistema de armas mejorado
    this.unlockedWeapons = {
      none: true,      // Sin arma (estado inicial)
      rifle: false,    // Rifle (arma principal) inicialmente bloqueado
      shotgun: false,  // Escopeta inicialmente bloqueada
      explosive: false // Arma explosiva inicialmente bloqueada
    };
    this.activeWeapon = 'none';   // Comenzar sin arma
    
    // Variable para compatibilidad con código antiguo
    this.hasWeapon = false;       // Se actualizará cuando cambie activeWeapon

    // Munición para cada tipo de arma (nuevo sistema)
    this.weaponAmmo = {
      rifle: 0,
      shotgun: 0,
      explosive: 0
    };
    
    // Munición máxima para cada tipo de arma
    this.weaponMaxAmmo = {
      rifle: PLAYER_CONFIG.RIFLE_AMMO,
      shotgun: PLAYER_CONFIG.SHOTGUN_AMMO,
      explosive: PLAYER_CONFIG.EXPLOSIVE_AMMO
    };
    
    // Variables de control para recarga
    this.ammo = 0;              // Munición del arma activa (para compatibilidad)
    this.maxAmmo = 0;           // Munición máxima del arma activa (para compatibilidad)
    this.lastShotTime = 0;
    this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN;
    this.isReloading = false;
    this.reloadTime = PLAYER_CONFIG.RELOAD_TIME;
    this.reloadStartTime = 0;
    this.bulletSpeed = PLAYER_CONFIG.BULLET_SPEED;
    this.explosiveBullets = [];

    // ====COSAS DEL ESCUDO=====
    this.hasUnlockedShield = false;    // El escudo está bloqueado inicialmente
    this.shieldActive = false;         // Sin escudo activo al inicio
    this.shieldDuration = PLAYER_CONFIG.SHIELD_DURATION; // Duración del escudo
    this.shieldStartTime = 0;          // Tiempo de inicio del escudo
    this.shieldWarningShown = false;   // Para controlar mensaje de escudo por acabarse
    this.shieldCooldown = PLAYER_CONFIG.SHIELD_COOLDOWN; // Cooldown del escudo
    this.shieldLastUsed = 0;           // Última vez que se usó el escudo
    this.shieldCooldownActive = false; // Indica si el escudo está en cooldown

    // ====VARIABLES DE OBJETOS ESPECIALES====
    this.hasJetpack = false;     // Sin jetpack al inicio
    this.hasParacaidas = false;  // Sin paracaídas al inicio
    this.hasSpeedBoost = false;  // Sin boost de velocidad al inicio
    this.speedBoostActive = false; // Para controlar si el boost está activo
    this.speedBoostStartTime = 0;  // Tiempo de inicio del boost
    this.originalSpeed = this.normalSpeed; // Velocidad original para restaurar después

    // ====TENER OBJETO EN GENERAL=====
    this.hasObject = false;      // Al inicio no tenemos ningún objeto

    // ===== Atributos de estado =====
    this.hasFloatingObject = false;
    this.resetearAgacharse = false;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = PLAYER_CONFIG.MAX_CRAWL_TIME;
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
    this.hand.setVisible(false); // Oculta al inicio, se muestra al tener un arma

    // Crear sprites para las diferentes armas
    this.mainWeapon = scene.add.sprite(this.x, this.y, 'weapon').setOrigin(1.3, 0.5);
    this.explosiveWeapon = scene.add.sprite(this.x, this.y, 'explosiveWeapon').setOrigin(1.3, 0.7);
    this.shotgunWeapon = scene.add.sprite(this.x, this.y, 'shotgunWeapon').setOrigin(1.3, 0.5);

    // Por defecto, todas las armas están ocultas
    this.mainWeapon.setVisible(false);
    this.shotgunWeapon.setVisible(false);
    this.explosiveWeapon.setVisible(false);

    // Referencia al arma activa (inicialmente ninguna)
    this.weapon = null;

    // Paracaídas
    this.parachute = scene.add.sprite(this.x, this.y, 'parachute').setOrigin(0.57, 1.1);
    this.parachute.setDepth(this.depth - 3);
    this.parachute.setVisible(false); // Oculto hasta que se desbloquee

    // Jetpack
    this.jetpack = scene.add.sprite(this.x, this.y, 'jetpack').setOrigin(0.55, 0.3);
    this.jetpack.setDepth(this.depth - 3);
    this.jetpack.setVisible(false); // Oculto hasta que se desbloquee

    // Variables para el tiempo de uso y recarga
    this.floatingEnergy = 400; // Máxima energía
    this.floatingEnergyMax = 400;
    this.floatingEnergyDrainRate = 1; // Cuánto se gasta por frame
    this.floatingEnergyRechargeRate = 1; // Cuánto se recarga por frame
    this.isRecharging = false; // Indica si está recargando
    this.bloquearmovimiento = false;
    
    // Banderas para controlar mensajes del jetpack
    this.lowEnergyWarningShown = false;
    this.energyDepletedMessageShown = false;

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

    // Punto de respawn
    this.respawnX = x;
    this.respawnY = y;
    this.hasRespawnPoint = true; // Inicializar con punto de respawn por defecto
    
    // Controles para prevenir múltiples muertes
    this.isDying = false; // Bandera para controlar si está en proceso de morir

    // Escudo (ahora será un efecto visual circular alrededor del jugador)
    this.shieldEffect = scene.add.graphics();
    this.shieldEffect.setVisible(false);
    this.shieldEffectRadius = 40; // Radio de la cúpula
    
    // Vidas del jugador
    this.lives = 5; // Número inicial de vidas
    this.maxLives = 5; // Máximo de vidas
  }

  // === MÉTODOS DE INTERFAZ ===
  
  // Crear los elementos de la interfaz
  createUI() {
    // La UI ahora se maneja desde GameUI.js
    // Esta función se mantiene vacía por compatibilidad
  }
  
  // Actualizar todos los elementos de la interfaz
  updateUI() {
    // La UI ahora se maneja desde GameUI.js
    // Esta función se mantiene vacía por compatibilidad
  }

  
// Dentro de tu clase Player
updateBullets() {
  const speed = this.bulletSpeed; // velocidad que ya le diste con setVelocity

  // Recorremos el array hacia atrás para poder hacer splice sin liarla
  for (let i = this.explosiveBullets.length - 1; i >= 0; i--) {
    const bullet = this.explosiveBullets[i];

    // 1) Si ya no está activa, la quitamos
    if (!bullet.active) {
      this.scene.events.emit('bulletReachedTarget', bullet.x, bullet.y, bullet);
      this.explosiveBullets.splice(i, 1);
      continue;
    }

    // 2) Distancia al objetivo
    const dx = bullet.targetX - bullet.x;
    const dy = bullet.targetY - bullet.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 25) {
      // llegó: emitimos y destruimos
      this.scene.events.emit('bulletReachedTarget', bullet.x, bullet.y, bullet);
      bullet.destroy();
      this.explosiveBullets.splice(i, 1);
    }
    // sino → la dejamos en el array para la siguiente pasada
  }
}





  
  // Actualizar todos los elementos de la interfaz
  updateUI() {
    // La UI ahora se maneja desde GameUI.js
    // Esta función se mantiene vacía por compatibilidad
  }





  // === MÉTODOS DE ACTUALIZACIÓN ===
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    console.log(this.x + " "+  this.y);

    this.movimiento = false;
    //console.log(this.x + " "+  this.y);
    if (this.state === PLAYER_STATE.DEAD) return;
    
    // La actualización de UI ahora se maneja desde GameUI.js

    //Actualizar balas explosivas
    this.updateBullets();

    // Comprobar si la recarga ha terminado
    if (this.isReloading && time - this.reloadStartTime >= this.reloadTime) {
      // Recargar el arma activa
      this.ammo = this.maxAmmo;
      // Actualizar el contador de munición del tipo de arma actual
      if (this.activeWeapon !== 'none') {
        this.weaponAmmo[this.activeWeapon] = this.ammo;
      }
      
      this.isReloading = false;
      this.scene.sound.play('disparo', { volume: 0.2, detune: -600 });
    }

    // Actualizar invulnerabilidad
    if (this.isInvulnerable && time - this.lastHitTime >= this.invulnerableTime) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }

    // Actualizar el efecto visual del escudo
    if (this.shieldActive) {
      this.updateShieldEffect();
    }

    // Comprobar si el escudo ha expirado
    if (this.shieldActive && time - this.shieldStartTime >= this.shieldDuration) {
      // Desactivar el escudo
      this.deactivateShield();
    }
    // Mostrar advertencia cuando el escudo está por expirar
    else if (this.shieldActive && !this.shieldWarningShown &&
      time - this.shieldStartTime >= this.shieldDuration * 0.75) {
      
      const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo por expirar!", {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#aaaaff',
        stroke: '#000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: text,
        y: text.y - 30,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          text.destroy();
        }
      });
      
      this.shieldWarningShown = true;
    }

    // Comprobar si el boost de velocidad ha expirado
    if (this.speedBoostActive && time - this.speedBoostStartTime >= PLAYER_CONFIG.SPEED_BOOST_DURATION) {
      // Desactivar el boost
      this.speedBoostActive = false;
      this.hasSpeedBoost = false;
      
      // Restaurar velocidad normal
      this.normalSpeed = this.originalSpeed;
      this.speed = this.normalSpeed;
      
      // Detener partículas
      if (this.speedParticles) {
        this.speedParticles.stop();
      }
      
      // Notificar al jugador que se acabó el impulso
      const text = this.scene.add.text(this.x, this.y - 50, "¡Velocidad normal!", {
        fontSize: '16px',
        fontStyle: 'bold',
        fill: '#ffaa44',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: text,
        y: this.y - 80,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          text.destroy();
        }
      });
    }

    if (this.isKnockedBack) return;

    if (!this.scene.keys) return;
    
    // ===== LÓGICA DEL PARACAÍDAS Y JETPACK =====
    // Solo permitir activación si están desbloqueados
    this.parachuteActivated = this.hasParacaidas && this.scene.keys.down.isDown && !this.body.onFloor() && !this.jetpackActivated;
    this.jetpackActivated = this.hasJetpack && this.scene.keys.up.isDown && !this.parachuteActivated;

    this.hasFloatingObject = ((this.jetpackActivated || this.parachuteActivated) && !this.isClimbing && this.floatingEnergy > 0);
    this.parachute.setVisible(this.hasFloatingObject && this.parachuteActivated);
    this.jetpack.setVisible(this.hasFloatingObject && this.jetpackActivated);
    

    if (this.hasFloatingObject) {

      // Ajustar velocidad cuando se usa el paracaídas
      if(this.parachuteActivated) this.speed = this.floatingSpeed;

      else if(this.jetpackActivated) {
        
        this.speed = this.floatingSpeed * 2.5;
        this.isRecharging = false;
      }

      if (this.parachuteActivated)this.parachute.setPosition(this.x, this.y);
      if(this.jetpackActivated) {
        
        this.jetpack.setPosition(this.x, this.y);
        this.createJetpackEffect();
        
        // Mostrar advertencia cuando la energía está baja
        if (this.floatingEnergy <= this.floatingEnergyMax * 0.2 && !this.lowEnergyWarningShown) {
          const text = this.scene.add.text(this.x, this.y - 50, "¡Energía baja!", {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff4444',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: text,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              text.destroy();
            }
          });
          
          this.lowEnergyWarningShown = true;
          
          // Restablecer flag después de un tiempo para poder mostrar otra advertencia
          this.scene.time.delayedCall(3000, () => {
            this.lowEnergyWarningShown = false;
          });
        }
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
    
    // Si se agota la energía, mostrar mensaje
    if (this.hasJetpack && this.floatingEnergy === 0 && this.jetpackActivated && !this.energyDepletedMessageShown) {
      const text = this.scene.add.text(this.x, this.y - 50, "¡Jetpack sin energía!", {
        fontSize: '16px',
        fontStyle: 'bold',
        fill: '#ff4444',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: text,
        y: this.y - 80,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          text.destroy();
        }
      });
      
      this.energyDepletedMessageShown = true;
      
      // Restablecer la bandera después de un tiempo
      this.scene.time.delayedCall(5000, () => {
        this.energyDepletedMessageShown = false;
      });
    }

    
    // Determinar las animaciones según el estado
    const runAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'run_shoot' : 'run');
    const idleAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'idle_shoot' : 'idle');
    const jumpAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'jump_shoot' : 'jump');
    const idleJumpAnim = this.hasFloatingObject ? (this.hasObject ? 'idle_shoot' : 'idle') : (this.hasObject ? 'jump_shoot' : 'jump');
    
   

    // Agregar tecla R para recargar manualmente
    const keyR = this.scene.input.keyboard.addKey('R');
    if (Phaser.Input.Keyboard.JustDown(keyR) && !this.isReloading && this.ammo < this.maxAmmo && this.activeWeapon !== 'none') {
      this.reload();
    }

    // SACAR arma shotgun (tecla 2)
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarArmaTwo)) {
      if (this.unlockedWeapons.shotgun) {
        this.activeWeapon = 'shotgun';
        this.updateWeaponType();
        
        // Desactivar escudo si estaba activo
        this.shieldActive = false;
        this.shieldEffect.setVisible(false);
        this.shieldCooldownActive = false;
      } else {
        // Mostrar mensaje de que no tiene esta arma
        const text = this.scene.add.text(this.x, this.y - 50, "¡Arma no disponible!", {
          fontSize: '14px',
          fontStyle: 'bold',
          fill: '#ff4444',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: text,
          y: this.y - 70,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            text.destroy();
          }
        });
      }
    }

    // SACAR arma explosiva (tecla 3)
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarArmaThree)) {
      if (this.unlockedWeapons.explosive) {
        this.activeWeapon = 'explosive';
        this.updateWeaponType();
        
        // Desactivar escudo si estaba activo
        this.shieldActive = false;
        this.shieldEffect.setVisible(false);
        this.shieldCooldownActive = false;
      } else {
        // Mostrar mensaje de que no tiene esta arma
        const text = this.scene.add.text(this.x, this.y - 50, "¡Arma no disponible!", {
          fontSize: '14px',
          fontStyle: 'bold',
          fill: '#ff4444',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: text,
          y: this.y - 70,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            text.destroy();
          }
        });
      }
    }

    // SACAR arma básica/rifle (tecla 1)
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarArmaOne)) {
      if (this.unlockedWeapons.rifle) {
        this.activeWeapon = 'rifle';
        this.updateWeaponType();
        
        // Desactivar escudo si estaba activo
        this.shieldActive = false;
        this.shieldEffect.setVisible(false);
        this.shieldCooldownActive = false;
      } else {
        // Mostrar mensaje de que no tiene esta arma sin cambiar el arma activa
        const text = this.scene.add.text(this.x, this.y - 50, "¡Rifle no disponible!", {
          fontSize: '14px',
          fontStyle: 'bold',
          fill: '#33bbaa',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: text,
          y: this.y - 70,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            text.destroy();
          }
        });
        
        // No desactivar el arma actual ni el escudo - mantener el estado actual
      }
    }

    // ACTIVAR escudo (tecla 4)
    if (Phaser.Input.Keyboard.JustDown(this.scene.keys.sacarEscudo)) {
      if (this.hasUnlockedShield) {
        if (!this.shieldActive && !this.shieldCooldownActive) {
          this.activateShield();
        }
        else if (this.shieldCooldownActive) {
          // Mostrar mensaje de cooldown
          const remainingCooldown = Math.ceil((this.shieldCooldown - (time - this.shieldLastUsed)) / 1000);
          const text = this.scene.add.text(this.x, this.y - 50, `Escudo en recarga: ${remainingCooldown}s`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#aaaaff',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
          }).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: text,
            y: text.y - 30,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
              text.destroy();
            }
          });
        }
      } else {
        // Mostrar mensaje de que no tiene el escudo
        const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo no disponible!", {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ff0000',
          stroke: '#000',
          strokeThickness: 4,
          align: 'center'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: text,
          y: text.y - 30,
          alpha: 0,
          duration: 1500,
          onComplete: () => {
            text.destroy();
          }
        });
      }
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

    if (!this.body.onFloor() && this.hasFloatingObject) {
        this.anims.play(idleAnim, true);
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
      if ( (!this.anims.isPlaying || this.anims.currentAnim.key !== anim )) {
        this.play(anim, true);
      }
    }


    if (this.hasObject) {
      this.updateHand();
    }
    
    // ===== DAÑO POR CAÍDA =====
    // Registrar la posición más alta y calcular daño por caída
    if (!this.body.onFloor()) {
      // Si estamos en el aire, rastreamos la posición más alta
      if (this.highestY === undefined || this.highestY === null) {
        this.highestY = this.y; // Inicializa con la posición actual
      } else if (this.y < this.highestY) {
        this.highestY = this.y; // Actualiza si sube más alto
      }
    } else if (this.highestY !== undefined && this.highestY !== null) {
      // Calculamos la distancia de caída
      const fallDistance = Math.abs(this.highestY - this.y);

      console.log(`[Player] Distancia de caída: ${fallDistance.toFixed(1)}`);
      console.log('velocidad1', Math.abs(this.body.velocity.y))
      
      // Configuración del sistema de daño progresivo (fuera del condicional)
      const minDamageHeight = 150;   // Altura mínima para empezar a recibir daño
      const maxDamageHeight = 400;   // Altura para daño máximo (muerte)
      
      // Solo procesamos el daño si estamos cayendo y no usando ayudas para flotar
      if (this.y > this.highestY && 
          Math.abs(this.body.velocity.y) > 35 &&
          !this.isDying &&
          !this.isInvulnerable &&
          !this.jetpackActivated && 
          !this.parachuteActivated) {

        console.log('velocidad2', Math.abs(this.body.velocity.y))
        
        // Mostrar efecto de impacto para caídas significativas (incluso sin daño)
        if (fallDistance > 100) {
          // Efecto visual de impacto (más intenso según la altura)
          const shakeIntensity = Math.min(0.05, fallDistance / 10000);
          const shakeDuration = Math.min(300, fallDistance / 2);
          this.scene.cameras.main.shake(shakeDuration, shakeIntensity);
          
          // Crear un efecto de impacto en el suelo
          const impact = this.scene.add.graphics();
          impact.fillStyle(0xcccccc, 0.7);
          const circleSize = Math.min(25, 10 + fallDistance / 30);
          impact.fillCircle(this.x, this.y + 20, circleSize);
          
          // Animar y eliminar el efecto
          this.scene.tweens.add({
            targets: impact,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => impact.destroy()
          });
          
          // Efecto de sonido de impacto (si existe)
          if (this.scene.sound.get('land')) {
            const volume = Math.min(1.0, 0.3 + (fallDistance / 1000));
            this.scene.sound.play('land', { volume: volume });
          }
        }
        
        // Cálculo del daño basado en la altura
        if (fallDistance >= minDamageHeight) {
          // Daño progresivo basado en la altura
          if (fallDistance >= maxDamageHeight) {
            // Caída fatal - muerte instantánea
            console.log(`[Player] Caída fatal: altura=${fallDistance.toFixed(0)}, muerte instantánea`);
            this.health = 0;
            this.die();
          } else {
            // Daño proporcional a la altura (exponencial)
            // Fórmula: porcentaje de la distancia entre min y max altura, elevado al cuadrado
            const damagePercent = Math.pow((fallDistance - minDamageHeight) / (maxDamageHeight - minDamageHeight), 2);
            const maxDamage = this.maxHealth * 0.8; // Máximo 80% de la salud
            const damage = Math.floor(damagePercent * maxDamage);
            
            if (damage > 0) {
              console.log(`[Player] Daño por caída: altura=${fallDistance.toFixed(0)}, daño=${damage}`);
              
              // Texto de daño
              const text = this.scene.add.text(this.x, this.y - 50, `-${damage}`, {
                fontSize: '20px',
                fontStyle: 'bold',
                fill: '#ff4444',
                stroke: '#000',
                strokeThickness: 4
              }).setOrigin(0.5);
              
              // Animar texto
              this.scene.tweens.add({
                targets: text,
                y: this.y - 80,
                alpha: 0,
                duration: 1000,
                onComplete: () => text.destroy()
              });
              
              // Aplicar el daño
              this.takeDamage(damage);
            }
          }
        }
      }
      
      // Resetear el tracking de altura al tocar suelo
      this.highestY = null;
    }

    // En el método update(), añadir después de la parte donde ya actualiza el estado del escudo

    // Actualizar estado del cooldown
    if (this.shieldCooldownActive && time - this.shieldLastUsed >= this.shieldCooldown) {
      this.shieldCooldownActive = false;
      
      // Notificar al jugador que el escudo está disponible nuevamente
      if (this.hasUnlockedShield) {
        const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo listo!", {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#aaaaff',
          stroke: '#000',
          strokeThickness: 4,
          align: 'center'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
          targets: text,
          y: text.y - 30,
          alpha: 0,
          duration: 1500,
          onComplete: () => {
            text.destroy();
          }
        });
      }
    }

    // Actualizar la posición del efecto de escudo si está activo
    if (this.shieldActive) {
      this.shieldEffect.setPosition(this.x, this.y);
    }
    
  }

  // === MÉTODOS DE ARMA Y DISPARO ===
  
  reload() {
    // No recargar si no tenemos un arma, si ya estamos recargando, o si ya tenemos munición completa
    if (this.activeWeapon === 'none' || this.isReloading || this.ammo === this.maxAmmo) return;
    
    this.isReloading = true;
    this.reloadStartTime = this.scene.time.now;
    
    // Reproducir sonido de inicio de recarga
    this.scene.sound.play('disparo', { volume: 0.2, detune: -600 });
  }

  shoot() {
    // Si no tenemos un arma equipada, no podemos disparar
    if (this.activeWeapon === 'none') return;

    // Si nos quedamos sin munición, iniciar recarga automática
    if (this.ammo <= 0) {
      this.reload();
      return;
    }
    
    // Si estamos recargando, no podemos disparar
    if (this.isReloading) return;
    
    // Comprobar cooldown entre disparos
    if (this.scene.time.now - this.lastShotTime < this.shotCooldown) return;
    
    // Registrar tiempo de disparo para cooldown
    this.lastShotTime = this.scene.time.now;

    // Calcular ángulo de disparo
    let angle = this.weapon.rotation;
    if (this.flipX) {
      angle += Math.PI;
    }
    
    let bulletX = this.weapon.x + Math.cos(angle) * 20;
    let bulletY = this.weapon.y + Math.sin(angle) * 20;
    let bullet;

    // Comportamiento específico según el arma activa
    switch (this.activeWeapon) {
      case 'shotgun':
        // Lógica de la escopeta:
        // Si no tenemos suficiente munición, recargar
        if (this.ammo < 6) {
          this.reload();
          return;
        }

        // Posición base del disparo
        let baseX = this.shotgunWeapon.x;
        let baseY = this.shotgunWeapon.y;
        let spread = Phaser.Math.DegToRad(15); // Dispersión de 15 grados en total
    
        for (let i = 0; i < 5; i++) {
          // Calcula un ángulo con cierta dispersión (centrado en el "angle" original)
          let offset = spread * ((i - 2) / 2); // -1.5, -0.75, 0, 0.75, 1.5
          let angleWithSpread = angle + offset;
    
          let bulletX = baseX + Math.cos(angleWithSpread) * 20;
          let bulletY = baseY + Math.sin(angleWithSpread) * 20;
    
          bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
          bullet.setRotation(angleWithSpread);
          bullet.lifespan = 300;
          bullet.damage = this.damage;
          bullet.dispersion = true;
          bullet.setVelocity(Math.cos(angleWithSpread) * this.bulletSpeed, Math.sin(angleWithSpread) * this.bulletSpeed); 
          bullet.body.allowGravity = false;
        }

        this.ammo -= 6;
        // Guardar en el sistema de munición por arma
        this.weaponAmmo.shotgun = this.ammo;
        break;

      case 'rifle':
        // Lógica del rifle:
        // Un disparo preciso con buen alcance
        bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
        bullet.setRotation(angle);
        bullet.lifespan = 800; // Mayor alcance que la escopeta
        bullet.damage = this.damage;
        bullet.dispersion = false;
        bullet.setVelocity(Math.cos(angle) * this.bulletSpeed * 1.2, Math.sin(angle) * this.bulletSpeed * 1.2); // Más rápida
        bullet.body.allowGravity = false;

        // El rifle consume 1 bala por disparo
        this.ammo -= 1;
        // Guardar en el sistema de munición por arma
        this.weaponAmmo.rifle = this.ammo;
        break;

      case 'explosive':
        // Lógica del arma explosiva:
        // Si no tenemos suficiente munición, recargar
        if (this.ammo < 3) {
          this.reload();
          return;
        }

        const pointer = this.scene.input.activePointer;
        const worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
        bullet.setRotation(this.weapon.rotation);
        bullet.damage = this.damage;
        bullet.setVelocity(Math.cos(angle) * this.bulletSpeed, Math.sin(angle) * this.bulletSpeed);
        bullet.body.allowGravity = false;

        if (bullet) {
          bullet.targetX = worldPointer.x;
          bullet.targetY = worldPointer.y;
        }
        // En este caso, meterla en la lista de balas explosivas
        this.explosiveBullets.push(bullet);
        // Gasta (-3) de munición
        this.ammo -= 3;
        if (this.ammo < 0) this.ammo = 0;
        // Guardar en el sistema de munición por arma
        this.weaponAmmo.explosive = this.ammo;
        break;
    }

    // EFECTO Y SONIDO
    this.createShootEffect(angle, this.weapon);
    this.scene.sound.play('disparo');
    
    // Actualizar la UI después de disparar
    this.updateUI();
  }



  createJetpackEffect() {
    this.doubleJumpEmitter.setPosition(this.x, this.y + 50);
    this.doubleJumpEmitter.setAngle(90); // Apunta hacia abajo
    this.doubleJumpEmitter.explode(2);
  }
  
  
  

  
  
  createShootEffect(angle, weapon) {

    const cannonOffset = 125;

    const effect = this.scene.add.sprite(
      weapon.x + Math.cos(angle) * cannonOffset,
      weapon.y + Math.sin(angle) * cannonOffset,
      'effect'
    );

    effect.setRotation(this.flipX ? weapon.rotation + Math.PI : weapon.rotation);
    effect.setDepth(weapon.depth + 1);
    effect.play('effect');
    
    this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        if (effect.anims.currentFrame) {
          effect.setPosition(
            weapon.x + Math.cos(angle) * cannonOffset,
            weapon.y + Math.sin(angle) * cannonOffset
          );
        }
      },
      repeat: effect.anims.getTotalFrames()
    });
    
    effect.once('animationcomplete', () => effect.destroy());
  }



  

  updateHand() {
    // Si no tenemos un arma u objeto activo, no actualizar la mano
    if (!this.hasObject) return;

    const pointer = this.scene.input.activePointer;
    const worldPointer = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    let angle = Phaser.Math.Angle.Between(this.x, this.y, worldPointer.x, worldPointer.y);
    
    if (this.flipX) {
      angle += Math.PI;
    }
    
    angle = Phaser.Math.Angle.Wrap(angle);
    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;

    if (!this.flipX) {
      if (angle > maxAngle || angle < minAngle) {
        this.setFlipX(true);
      }   
    } else {
      if (angle > maxAngle || angle < minAngle) {
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
    // Si tenemos un arma activa (distinta a 'none')
    if (this.activeWeapon !== 'none' && this.weapon) {
      this.weapon.setPosition(this.hand.x, this.hand.y);
      this.weapon.setRotation(this.hand.rotation);
    } 
  }

  ajustarDireccion() {
    this.hand.setScale(!this.flipX ? -1 : 1, 1);

    if (this.activeWeapon !== 'none' && this.weapon) {
      this.weapon.setScale(!this.flipX ? -1 : 1, 1);
    }
  }

  // === MÉTODOS DE DAÑO Y SALUD ===
  
  takeDamage(amount, attacker = null) {
    if (this.isInvulnerable || this.state === PLAYER_STATE.DEAD || this.isDying) return;
    console.log(`[Player] Recibiendo daño: ${amount}. Salud actual: ${this.health}`);
    
    this.health -= amount;
    this.isInvulnerable = true;
    this.lastHitTime = this.scene.time.now;
    
    // Comprobar inmediatamente si el jugador debe morir
    if (this.health <= 0) {
      console.log(`[Player] Salud negativa después de daño: ${this.health}. Llamando a die()`);
      this.die();
      return; // Salir para evitar reproducir la animación de daño
    }
    
    // Si el jugador sigue vivo, continuar con la animación de daño
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
      console.log('[Player] Animación de daño completada');
      this.state = PLAYER_STATE.IDLE;
    });

    // La UI ahora se actualiza desde GameUI.js

    // Reproducir sonido de daño
    this.scene.sound.play('damage');
  }

  /**
   * Recupera salud del jugador
   * @param {number} amount - Cantidad de salud a recuperar
   */
  recoverHealth(amount) {
    // No recuperar salud si el jugador está muerto
    if (this.state === PLAYER_STATE.DEAD) return;
    
    // Asegurarse de que la cantidad es positiva
    amount = Math.abs(amount);
    
    // Actualizar la salud, sin exceder el máximo
    this.health = Math.min(this.health + amount, this.maxHealth);
    
    // Efecto visual de curación (sin tinte permanente)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    // Aplica el tinte verde temporalmente y luego lo quita
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(300, () => {
      this.clearTint();
    });
    
    // Crear partículas de curación alrededor del jugador (si existe el sistema de partículas)
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 20, max: 50 },
        scale: { start: 0.5, end: 0 },
        quantity: 10,
        lifespan: 800,
        blendMode: 'ADD',
        tint: 0x00ff00
      });
      
      // Emitir algunas partículas y luego detener
      emitter.explode(10);
      this.scene.time.delayedCall(100, () => {
        emitter.stop();
      });
    }
    
    // Reproducir sonido de curación (si existe)
    if (this.scene.sound.get('heal')) {
      this.scene.sound.play('heal', { volume: 0.5 });
    }
    
    // Mostrar texto flotante con la cantidad curada
    this.showHealingText(amount);
    
    // Actualizar la UI
    this.updateUI();
  }
  
  /**
   * Muestra un texto flotante con la cantidad curada
   * @param {number} amount - Cantidad curada
   */
  showHealingText(amount) {
    const text = this.scene.add.text(this.x, this.y - 50, `+${amount}`, {
      fontSize: '20px',
      fontStyle: 'bold',
      fill: '#00ff00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Animación para que el texto suba y desaparezca
    this.scene.tweens.add({
      targets: text,
      y: this.y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Decrementar una vida del jugador
   * @returns {boolean} True si el jugador aún tiene vidas, false si ha perdido todas
   */
  decrementLives() {
    // Decrementar vidas, pero nunca por debajo de 0
    this.lives = Math.max(0, this.lives - 1);
    console.log(`[Player] Vidas restantes: ${this.lives}`);
    
    // Si el jugador se queda sin vidas, emitir evento de game over
    if (this.lives <= 0) {
      console.log('[Player] Sin vidas. Emitiendo evento gameOver');
      
      // Detener cualquier acción del jugador inmediatamente
      this.setVelocity(0, 0);
      this.body.setAllowGravity(false);
      this.isDying = true;
      this.state = PLAYER_STATE.DEAD;
      
      // Detener todas las animaciones en curso
      this.anims.stop();
      
      // Ocultar cualquier elemento visual asociado al jugador
      if (this.weapon) this.weapon.setVisible(false);
      if (this.hand) this.hand.setVisible(false);
      if (this.jetpack) this.jetpack.setVisible(false);
      if (this.parachute) this.parachute.setVisible(false);
      
      // Esperar un momento muy breve antes de emitir el evento gameOver
      // para permitir que el ciclo de actualización actual termine
      setTimeout(() => {
        // Verificar que la escena siga existiendo antes de emitir el evento
        if (this.scene && this.scene.events) {
          console.log('[Player] Emitiendo gameOver.');
          this.scene.events.emit('gameOver');
        }
      }, 50);
      
      return false;
    }
    
    return true;
  }

  /**
   * Método principal de muerte del jugador
   */
  die() {
    // Evitar múltiples llamadas a die() mientras esté muriendo
    if (this.isDying || this.state === PLAYER_STATE.DEAD) return;
    
    console.log(`[Player] Método die() llamado.`);
    this.state = PLAYER_STATE.DEAD;
    this.isDying = true; // Marcar que está en proceso de morir
    
    // Detener el movimiento
    this.setVelocity(0, 0);
    
    // Decrementar las vidas y verificar si se acabaron
    const hasRemainingLives = this.decrementLives();
    
    // Si no tiene más vidas, el evento gameOver ya fue emitido en decrementLives
    // Por lo tanto, simplemente retornamos para evitar más procesamiento
    if (!hasRemainingLives) {
      this.isDying = false;
      return;
    }
    
    // Solo continuar con animación de muerte si aún tiene vidas
    this.play('player_death', true);
    this.body.setAllowGravity(false);
    
    this.once('animationcomplete-player_death', () => {
      console.log(`[Player] Animación de muerte completada.`);
      
      // Respawnear ya que tiene vidas restantes
      console.log(`[Player] Respawneando en coordenadas (${this.respawnX}, ${this.respawnY})`);
      this.respawn();
      
      // Resetear la bandera de morir después de completar todo el proceso
      this.isDying = false;
    });
  }

  /**
   * Método para hacer morir al jugador sin mostrar animación de muerte
   * Se usa específicamente para las caídas fuera del mapa
   */
  silentDie() {
    // Evitar múltiples llamadas a silentDie() mientras esté muriendo
    if (this.isDying || this.state === PLAYER_STATE.DEAD) return;
    
    console.log(`[Player] Método silentDie() llamado.`);
    this.isDying = true; // Marcar que está en proceso de morir
    
    // Detener cualquier movimiento para evitar seguir cayendo
    this.setVelocity(0, 0);
    
    // Decrementar las vidas y verificar si se acabaron
    const hasRemainingLives = this.decrementLives();
    
    // Si no tiene más vidas, el evento gameOver ya fue emitido en decrementLives
    if (!hasRemainingLives) {
      this.isDying = false;
      return;
    }
    
    // Respawnear ya que tiene vidas restantes
    this.respawn({ silent: true, fadeIn: true });
    
    // Resetear la bandera de morir
    this.isDying = false;
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
  }

  // === MÉTODOS DE UI ===
  
  /**
   * Maneja el evento de un diamante recogido, actualizando el puntaje y la UI
   * @param {number} value - El valor del diamante recogido
   */
  handleDiamondCollected(value) {
    // Incrementar la puntuación
    this.score += value;
    
    // La UI ahora se actualiza desde GameUI.js
    
    // Efecto visual opcional (por ejemplo, brillo alrededor del jugador)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }

  /**
   * Establece un punto de respawn para el jugador
   * @param {number} x - Coordenada X del punto de respawn
   * @param {number} y - Coordenada Y del punto de respawn
   */
  setRespawnPoint(x, y) {
    console.log(`[Player] setRespawnPoint llamado con coordenadas (${x}, ${y})`);
    this.respawnX = x;
    this.respawnY = y;
    this.hasRespawnPoint = true;
    console.log(`[Player] hasRespawnPoint establecido a: ${this.hasRespawnPoint}`);
    
    console.log(`[Player] Punto de respawn establecido en (${x}, ${y})`);
  }

  /**
   * Revive al jugador en el último punto de respawn
   * @param {Object} options - Opciones de personalización para el respawn
   * @param {boolean} options.fadeIn - Si es verdadero, el jugador aparecerá con efecto fade in
   */
  respawn(options = {}) {
    const {fadeIn = false } = options;
    
    console.log(`[Player] Método respawn() llamado. Posición actual: (${this.x}, ${this.y})`);
    console.log(`[Player] Respawneando en: (${this.respawnX}, ${this.respawnY})`);
    
    // Asegurarse de que no esté en estado de muerte
    this.isDying = false;
    
    // Restaurar salud
    this.health = this.maxHealth;
    
    // Reposicionar en el punto de respawn
    this.setPosition(this.respawnX, this.respawnY - 60 );
    
    // Restablecer estado y física
    this.state = PLAYER_STATE.IDLE;
    this.body.setAllowGravity(true);
    this.setCollideWorldBounds(true);
    
    // Ajustar visibilidad según el tipo de respawn
    if (fadeIn) {
      // Iniciar invisible y hacer aparecer gradualmente
      this.alpha = 0;
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 300,
        onComplete: () => {
          // Efecto de parpadeo al reaparecer
          this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5
          });
        }
      });
    } else {
      this.alpha = 1;
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 10,
        onComplete: () => {
          // Asegurarse de que termine con visibilidad completa
          this.alpha = 1;
        }
      });
    }
    
    // Dar un período de invulnerabilidad al respawnear
    this.isInvulnerable = true;
    this.lastHitTime = this.scene.time.now;
    
    // Reproducir animación idle
    const idleAnim = this.hasObject ? 'idle_shoot' : 'idle';
    this.play(idleAnim, true);
    
    // Actualizar UI
    this.updateUI();
    
    console.log(`[Player] Jugador respawneado en (${this.respawnX}, ${this.respawnY})`);
  }

  /**
   * Da al jugador el rifle (arma principal) con un número específico de balas
   * @param {number} bullets - Cantidad de balas para el rifle
   */
  darRifle(bullets = PLAYER_CONFIG.RIFLE_AMMO) {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desbloquear el rifle (arma principal)
    this.unlockedWeapons.rifle = true;
    
    // Asignar munición al rifle
    this.weaponAmmo.rifle = bullets;
    
    // Activar el rifle como arma activa
    this.activeWeapon = 'rifle';
    this.updateWeaponType();
    
    // Mostrar un mensaje de información sobre cómo usar el arma
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el rifle con LMB!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: this.y - 90,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Temporizador para mostrar un mensaje cuando la munición está baja
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.activeWeapon === 'rifle' && this.ammo <= 5 && this.ammo > 0) {
          const text = this.scene.add.text(this.x, this.y - 50, `¡${this.ammo} balas restantes!`, {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffaa44',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: text,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              text.destroy();
            }
          });
        }
      },
      callbackScope: this,
      repeat: bullets - 1
    });
  }

  /**
   * Da al jugador la escopeta con un número específico de balas
   * @param {number} bullets - Cantidad de balas para la escopeta
   */
  darEscopeta(bullets = PLAYER_CONFIG.SHOTGUN_AMMO) {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desbloquear la escopeta
    this.unlockedWeapons.shotgun = true;
    
    // Asignar munición a la escopeta
    this.weaponAmmo.shotgun = bullets;
    
    // Activar la escopeta como arma activa
    this.activeWeapon = 'shotgun';
    this.updateWeaponType();
    
    // Mostrar un mensaje de información sobre cómo usar el arma
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa la escopeta con LMB!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: this.y - 90,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
    
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.activeWeapon === 'shotgun' && this.ammo <= 5 && this.ammo > 0) {
          const text = this.scene.add.text(this.x, this.y - 50, `¡${this.ammo} balas restantes!`, {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffaa44',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: text,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              text.destroy();
            }
          });
        }
      },
      callbackScope: this,
      repeat: bullets - 1
    });
  }
  
  /**
   * Da al jugador el arma explosiva con un número específico de balas
   * @param {number} bullets - Cantidad de balas para el arma explosiva
   */
  darArmaExplosiva(bullets = PLAYER_CONFIG.EXPLOSIVE_AMMO) {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desbloquear el arma explosiva
    this.unlockedWeapons.explosive = true;
    
    // Asignar munición al arma explosiva
    this.weaponAmmo.explosive = bullets;
    
    // Activar el arma explosiva como arma activa
    this.activeWeapon = 'explosive';
    this.updateWeaponType();
    
    // Mostrar un mensaje de información sobre cómo usar el arma
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el arma explosiva con LMB!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: this.y - 90,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Temporizador para mostrar un mensaje cuando la munición está baja
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.activeWeapon === 'explosive' && this.ammo <= 3 && this.ammo > 0) {
          const text = this.scene.add.text(this.x, this.y - 50, `¡${this.ammo} balas explosivas restantes!`, {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff6644',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: text,
            y: this.y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              text.destroy();
            }
          });
        }
      },
      callbackScope: this,
      repeat: bullets - 1
    });
  }

  /**
   * Actualiza el tipo de arma actual según activeWeapon
   */
  updateWeaponType() {
    // Ocultar todas las armas
    this.mainWeapon.setVisible(false);
    this.shotgunWeapon.setVisible(false);
    this.explosiveWeapon.setVisible(false);
    
    // Mostrar la correspondiente al arma activa
    switch (this.activeWeapon) {
      case 'rifle':
        this.weapon = this.mainWeapon;
        this.mainWeapon.setVisible(true);
        this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN; // Normal
        this.damage = PLAYER_CONFIG.DAMAGE;
        this.hand.setVisible(true);
        this.hasObject = true;
        this.hasWeapon = true; // Actualizar para compatibilidad
        // Restaurar la munición del rifle
        this.ammo = this.weaponAmmo.rifle;
        this.maxAmmo = this.weaponMaxAmmo.rifle;
        break;
      case 'shotgun':
        this.weapon = this.shotgunWeapon;
        this.shotgunWeapon.setVisible(true);
        this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN * 1.5; // Más lento
        this.damage = PLAYER_CONFIG.DAMAGE * 1.5; // Más daño
        this.hand.setVisible(true);
        this.hasObject = true;
        this.hasWeapon = true; // Actualizar para compatibilidad
        // Restaurar la munición de la escopeta
        this.ammo = this.weaponAmmo.shotgun;
        this.maxAmmo = this.weaponMaxAmmo.shotgun;
        break;
      case 'explosive':
        this.weapon = this.explosiveWeapon;
        this.explosiveWeapon.setVisible(true);
        this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN * 2; // Mucho más lento
        this.damage = PLAYER_CONFIG.DAMAGE * 3; // Daño muy aumentado
        this.hand.setVisible(true);
        this.hasObject = true;
        this.hasWeapon = true; // Actualizar para compatibilidad
        // Restaurar la munición del arma explosiva
        this.ammo = this.weaponAmmo.explosive;
        this.maxAmmo = this.weaponMaxAmmo.explosive;
        break;
      default:
        this.weapon = null;
        this.hand.setVisible(false);
        this.hasObject = false;
        this.hasWeapon = false; // Actualizar para compatibilidad
        this.ammo = 0;
        this.maxAmmo = 0;
    }
    
    // Establecer la profundidad correcta si hay un arma activa
    if (this.weapon) {
      this.weapon.setDepth(this.hand.depth - 1);
    }

    // La UI ahora se actualiza desde GameUI.js
  }

  /**
   * Da al jugador la habilidad de usar el escudo
   */
  darEscudo() {
    console.log("Dando escudo al jugador");
    
    // Desbloquear el escudo
    this.hasUnlockedShield = true;
    // Eliminar esta línea ya que unlockedAbilities no existe
    // this.unlockedAbilities.shield = true;
    
    // Mostrar mensaje de instrucción
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el escudo con la tecla 4!", {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaff',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Activa el jetpack por un tiempo determinado
   * @param {number} duration - Duración en milisegundos (controla la cantidad de energía)
   */
  darJetpack() {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desbloquear el jetpack
    this.hasJetpack = true;
    
    // La energía se consumirá gradualmente en preUpdate cuando se use
    this.floatingEnergy = this.floatingEnergyMax * 2;
    
    // Mostrar un mensaje informativo
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el jetpack con ↑ en el aire!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#44aaff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: this.y - 90,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Aumenta la velocidad del jugador temporalmente
   * @param {number} duration - Duración en milisegundos
   */
  aumentarVelocidad(duration = PLAYER_CONFIG.SPEED_BOOST_DURATION) {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Guardar la velocidad original
    const velocidadOriginal = this.normalSpeed;
    
    // Activar el boost de velocidad
    this.hasSpeedBoost = true;
    this.speedBoostActive = true;
    this.speedBoostStartTime = this.scene.time.now;
    
    // Aumentar la velocidad
    this.normalSpeed = velocidadOriginal * 1.5;
    this.speed = this.normalSpeed;
    
    // Efecto visual
    this.scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 3
    });
    
    // Partículas de velocidad
    if (this.scene.particles) {
      this.speedParticles = this.scene.particles.createEmitter({
        follow: this,
        followOffset: { x: -20, y: 0 },
        speed: { min: 10, max: 30 },
        scale: { start: 0.4, end: 0 },
        lifespan: 400,
        blendMode: 'ADD',
        tint: 0xffaa44,
        frequency: 20
      });
    }
    
    // El boost se desactivará en preUpdate después de que pase el tiempo
  }

  /**
   * Activa el paracaídas para el jugador
   */
  darParacaidas() {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Activar el paracaídas
    this.hasParacaidas = true;
    
    // Mostrar un mensaje informativo
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el paracaídas con ↓ en el aire!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#66ee66',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: this.y - 90,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Activa el escudo protector
   */
  activateShield() {
    this.shieldActive = true;
    this.shieldStartTime = this.scene.time.now;
    this.shieldWarningShown = false;
    
    // Mostrar efecto visual
    this.shieldEffect.setVisible(true);
    this.shieldEffect.setAlpha(0);
    
    // Efecto de aparición
    this.scene.tweens.add({
      targets: this.shieldEffect,
      alpha: 1,
      scale: { from: 0.2, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Mensaje de activación
    const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo activado!", {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaff',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Sonido de activación (si existe)
    if (this.scene.sound.get('shield_activate')) {
      this.scene.sound.play('shield_activate');
    }
  }

  /**
   * Desactiva el escudo protector
   */
  deactivateShield() {
    // Marcar como inactivo
    this.shieldActive = false;
    
    // Iniciar cooldown
    this.shieldLastUsed = this.scene.time.now;
    this.shieldCooldownActive = true;
    
    // Crear un efecto de explosión del escudo
    this.scene.tweens.add({
      targets: this.shieldEffect,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.shieldEffect.setVisible(false);
        this.shieldEffect.setScale(1);
        this.shieldEffect.clear(); // Limpiar gráficos
      }
    });
    
    // Notificar al jugador que se acabó el escudo
    const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo desactivado!", {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#aaaaff',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Sonido de desactivación (si existe)
    if (this.scene.sound.get('shield_deactivate')) {
      this.scene.sound.play('shield_deactivate');
    }
  }

  /**
   * Actualiza el efecto visual del escudo
   */
  updateShieldEffect() {
    if (!this.shieldActive) return;
    
    // Limpiar gráficos anteriores
    this.shieldEffect.clear();
    
    // Calculamos un valor de pulsación basado en el tiempo
    const pulseValue = Math.sin(this.scene.time.now / 200) * 0.1 + 0.9;
    const radius = this.shieldEffectRadius * pulseValue;
    
    // Dibujamos la cúpula semi-transparente
    this.shieldEffect.fillStyle(0x4488ff, 0.3);
    this.shieldEffect.fillCircle(0, 0, radius);
    
    // Añadimos un borde brillante
    this.shieldEffect.lineStyle(3, 0x88aaff, 0.8);
    this.shieldEffect.strokeCircle(0, 0, radius);
    
    // Añadimos un segundo borde para profundidad
    this.shieldEffect.lineStyle(1, 0xaaddff, 0.6);
    this.shieldEffect.strokeCircle(0, 0, radius + 3);
    
    // Posicionamos el escudo en las coordenadas del jugador
    this.shieldEffect.x = this.x;
    this.shieldEffect.y = this.y;
  }
}
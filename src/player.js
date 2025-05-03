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
  SHIELD_DURATION: 10000,       // 10 segundos de escudo
  SPEED_BOOST_DURATION: 15000   // 15 segundos de velocidad aumentada
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
    this.hasUnlockedShield = false;  // El escudo está bloqueado inicialmente
    this.hasEscudo = false;          // Sin escudo activo al inicio
    this.escudoActive = false;       // Para controlar si el escudo está activado
    this.escudoDuration = PLAYER_CONFIG.SHIELD_DURATION; // Duración del escudo
    this.escudoStartTime = 0;        // Tiempo de inicio del escudo
    this.escudoWarningShown = false; // Para controlar mensaje de escudo por acabarse

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

    // Escudo
    this.escudo = scene.physics.add.sprite(this.x, this.y, 'escudo').setOrigin(1, 0.5);
    this.escudo.setSize(20, 25);
    this.escudo.body.setEnable(false);
    this.escudo.setVisible(false);

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
    this.timerText = this.scene.add.text(0, 0, "Tiempo Restante:" + this.remainingtime / 1000);
    this.timerText.setScrollFactor(0);

    // Punto de respawn
    this.respawnX = x;
    this.respawnY = y;
    this.hasRespawnPoint = false;
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
    let ammoText = "";
    
    // Si tenemos un arma equipada, mostrar su información
    if (this.activeWeapon !== 'none') {
      let weaponName = "";
      switch (this.activeWeapon) {
        case 'rifle':
          weaponName = "Rifle";
          break;
        case 'shotgun':
          weaponName = "Escopeta";
          break;
        case 'explosive':
          weaponName = "Explosiva";
          break;
      }
      
      // Mostrar nombre del arma y munición actual/máxima
      ammoText = `${weaponName}: ${this.ammo}/${this.maxAmmo}`;
      
      // Si está recargando, mostrar indicación
      if (this.isReloading) {
        const progress = Math.min(1, (this.scene.time.now - this.reloadStartTime) / this.reloadTime);
        const dots = '.'.repeat(Math.floor(progress * 3) + 1);
        ammoText = `${weaponName}: Recargando${dots}`;
      }
    } else if (this.hasEscudo) {
      // Si tiene el escudo activo
      ammoText = "Escudo activo";
      if (this.escudoActive) {
        // Mostrar tiempo restante si está activo
        const remainingTime = Math.max(0, Math.ceil((this.escudoDuration - (this.scene.time.now - this.escudoStartTime)) / 1000));
        ammoText += ` (${remainingTime}s)`;
      }
    } else {
      // Sin arma equipada
      ammoText = "Sin arma";
    }
    
    this.ammoText.setText(ammoText);
    
    // Actualizar texto de puntuación
    this.scoreText.setText('Puntuación: ' + this.score);
  }





  // === MÉTODOS DE ACTUALIZACIÓN ===
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    this.movimiento = false;
    //console.log(this.x + " "+  this.y);
    if (this.state === PLAYER_STATE.DEAD) return;
    
    // Actualizar UI en cada frame
    this.updateUI();

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
      
      // Actualizar UI con la nueva munición
      this.updateUI();
    }

    // Actualizar invulnerabilidad
    if (this.isInvulnerable && time - this.lastHitTime >= this.invulnerableTime) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }

    // Comprobar si el escudo ha expirado
    if (this.escudoActive && time - this.escudoStartTime >= this.escudoDuration) {
      // Desactivar el escudo
      this.escudoActive = false;
      this.hasEscudo = false;
      
      // Efecto visual de desactivación
      this.scene.tweens.add({
        targets: this.escudo,
        alpha: 0,
        scale: 1.2,
        duration: 500,
        onComplete: () => {
          // Ocultar el escudo
          this.escudo.setVisible(false);
          this.escudo.body.setEnable(false);
          this.escudo.setAlpha(1);
          this.escudo.setScale(1);
          
          // Notificar al jugador que se acabó el escudo
          const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo desactivado!", {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#aaaaff',
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
      });
    } 
    // Mostrar advertencia cuando el escudo está por expirar
    else if (this.escudoActive && !this.escudoWarningShown && 
      time - this.escudoStartTime >= this.escudoDuration * 0.75) {
      // Mostrar advertencia
      const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo por expirar!", {
        fontSize: '14px',
        fontStyle: 'bold',
        fill: '#aaaaff',
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
      
      // Marcar que ya mostramos la advertencia
      this.escudoWarningShown = true;
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
        this.hasEscudo = false;
        this.escudo.setVisible(false);
        this.escudo.body.setEnable(false);
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
        this.hasEscudo = false;
        this.escudo.setVisible(false);
        this.escudo.body.setEnable(false);
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
        this.hasEscudo = false;
        this.escudo.setVisible(false);
        this.escudo.body.setEnable(false);
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
        // Desactivar arma actual
        this.activeWeapon = 'none';
        this.updateWeaponType();
        
        // Activar escudo
        this.hasEscudo = true;
        this.hasObject = true;
        this.escudo.setVisible(true);
        this.hand.setVisible(true);
        this.escudo.body.setEnable(true);
        this.escudo.body.reset(this.x, this.y);
      } else {
        // Mostrar mensaje de que no tiene el escudo
        const text = this.scene.add.text(this.x, this.y - 50, "¡Escudo no disponible!", {
          fontSize: '14px',
          fontStyle: 'bold',
          fill: '#aaaaff',
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
    // Si tenemos un escudo activo
    else if (this.hasEscudo) {
      this.escudo.setRotation(this.hand.rotation);

      // Simulamos la "rotación" del hitbox calculando el offset inverso
      let angle = this.hand.rotation;
      let distancia; // La distancia desde el centro que quieras
      let offsetX, offsetY;

      if (!this.flipX) {
        distancia = 10;
        offsetX = Math.cos(angle + Math.PI) * distancia + 33;
        offsetY = -Math.sin(angle + Math.PI) * distancia;
      } else {
        distancia = 10;
        offsetX = Math.cos(angle + Math.PI) * distancia + 15;
        offsetY = Math.sin(angle + Math.PI) * distancia;
      }

      this.escudo.body.setOffset(offsetX, offsetY);
    }
  }

  ajustarDireccion() {
    this.hand.setScale(!this.flipX ? -1 : 1, 1);

    if (this.activeWeapon !== 'none' && this.weapon) {
      this.weapon.setScale(!this.flipX ? -1 : 1, 1);
    }
    else if (this.hasEscudo) {
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

  die() {
    console.log(`[Player] Método die() llamado. hasRespawnPoint: ${this.hasRespawnPoint}, respawnX: ${this.respawnX}, respawnY: ${this.respawnY}`);
    this.state = PLAYER_STATE.DEAD;
    this.play('player_death', true);
    this.setVelocity(0);
    this.body.setAllowGravity(false);
    
    this.once('animationcomplete-player_death', () => {
      console.log(`[Player] Animación de muerte completada. hasRespawnPoint: ${this.hasRespawnPoint}`);
      // Si tiene un punto de respawn, revivir allí en lugar de emitir el evento de muerte
      if (this.hasRespawnPoint) {
        console.log(`[Player] Tiene punto de respawn, llamando a respawn()`);
        this.respawn();
      } else {
        console.log(`[Player] No tiene punto de respawn, emitiendo evento playerDeath`);
        // Emitir evento de muerte para que la escena lo maneje
        this.scene.events.emit('playerDeath');
      }
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
   */
  respawn() {
    console.log(`[Player] Método respawn() llamado. Posición actual: (${this.x}, ${this.y})`);
    console.log(`[Player] Respawneando en: (${this.respawnX}, ${this.respawnY})`);
    
    // Restaurar salud
    this.health = this.maxHealth;
    
    // Reposicionar en el punto de respawn
    this.setPosition(this.respawnX, this.respawnY);
    
    // Restablecer estado y física
    this.state = PLAYER_STATE.IDLE;
    this.body.setAllowGravity(true);
    this.setCollideWorldBounds(true);
    this.alpha = 1;
    
    // Dar un período de invulnerabilidad al respawnear
    this.isInvulnerable = true;
    this.lastHitTime = this.scene.time.now;
    
    // Efecto de parpadeo al respawnear
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 10
    });
    
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
    this.explosiveWeapon.setVisible(false);
    this.shotgunWeapon.setVisible(false);

    // Si estábamos usando un arma antes, guardar su munición actual
    if (this.weapon && this.activeWeapon !== 'none') {
      this.weaponAmmo[this.activeWeapon] = this.ammo;
    }

    // Mostrar el arma seleccionada según activeWeapon
    switch (this.activeWeapon) {
      case 'none':
        this.weapon = null;
        this.hand.setVisible(false);
        this.hasObject = false;
        this.hasWeapon = false; // Actualizar para compatibilidad
        // No hay munición para mostrar
        this.ammo = 0;
        this.maxAmmo = 0;
        break;
      case 'shotgun':
        this.weapon = this.shotgunWeapon;
        this.shotgunWeapon.setVisible(true);
        this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN * 4;
        this.damage = PLAYER_CONFIG.DAMAGE * 2;
        this.hand.setVisible(true);
        this.hasObject = true;
        this.hasWeapon = true;
        this.reloadTime = PLAYER_CONFIG.RELOAD_TIME * 2;
        // Restaurar la munición de la escopeta
        this.ammo = this.weaponAmmo.shotgun;
        this.maxAmmo = this.weaponMaxAmmo.shotgun;
        break;
      case 'rifle':
        this.weapon = this.mainWeapon;
        this.mainWeapon.setVisible(true);
        this.shotCooldown = PLAYER_CONFIG.SHOT_COOLDOWN * 0.8; // Más rápido para el rifle
        this.damage = PLAYER_CONFIG.DAMAGE * 1.5; // Daño aumentado
        this.hand.setVisible(true);
        this.hasObject = true;
        this.hasWeapon = true; // Actualizar para compatibilidad
        // Restaurar la munición del rifle
        this.ammo = this.weaponAmmo.rifle;
        this.maxAmmo = this.weaponMaxAmmo.rifle;
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

    // Actualizar la UI para mostrar la munición correcta
    this.updateUI();
  }

  /**
   * Da al jugador la habilidad de usar el escudo
   */
  darEscudo() {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desbloquear el escudo
    this.hasUnlockedShield = true;
    
    // Mostrar un mensaje informativo
    const text = this.scene.add.text(this.x, this.y - 60, "¡Usa el escudo con la tecla 4!", {
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#aaaaff',
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
   * Activa un escudo protector temporal
   * @param {number} duration - Duración en milisegundos
   */
  activarEscudo(duration = PLAYER_CONFIG.SHIELD_DURATION) {
    //this.scene.sound.play('take_item', { volume: 0.7 });
    
    // Desactivar arma actual temporalmente y guardar referencia
    const weaponActivo = this.activeWeapon; // Guardamos el arma activa para restaurarla después
    this.activeWeapon = 'none';
    this.updateWeaponType();
    
    // Activar el escudo
    this.hasEscudo = true;
    this.hasObject = true;
    this.escudo.setVisible(true);
    this.escudo.body.setEnable(true);
    this.hand.setVisible(true);
    
    // Guardar el tiempo de inicio
    this.escudoActive = true;
    this.escudoStartTime = this.scene.time.now;
    
    // Efecto visual de activación
    this.scene.tweens.add({
      targets: this.escudo,
      alpha: { from: 0.4, to: 0.8 },
      scale: { from: 0.8, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: 2
    });
    
    // El escudo se desactivará en preUpdate después de que pase el tiempo
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
}
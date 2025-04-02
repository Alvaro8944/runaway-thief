import Phaser from 'phaser';

export const PLAYER_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  HURT: 'HURT',
  DEAD: 'DEAD',
  ATTACKING: 'ATTACKING',
  CLIMBING: 'CLIMBING'
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
    timer=300000;
    remainingtime;
    timerText;
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(20, 35);
    this.setOffset(13, 13);
    this.setScale(1.25);

    // Atributos de movimiento y salud
    this.normalSpeed = 180;
    this.parachuteSpeed = 50;
    this.speed = this.normalSpeed;

    this.jumpSpeed = -240;
    this.climbSpeed = 100;
    this.score = 0;
    this.health = 100;      // Salud del jugador
    this.maxHealth = 100;   // Salud máxima
    this.damage = 20;       // Daño de sus disparos
    this.hasWeapon = false;
    this.hasParachute = false;
    this.resetearAgacharse = false;
    this.crawlTime = 0;
    this.restarcrawl = 0;
    this.maxCrawlTime = 90;
    this.fatalFallHeight = 10;
    
    // Sistema de munición y cooldown
    this.ammo = 6;                   // Balas en el cargador
    this.maxAmmo = 6;                // Capacidad del cargador
    this.lastShotTime = 0;           // Tiempo del último disparo
    this.shotCooldown = 350;         // Tiempo entre disparos (ms)
    this.isReloading = false;        // Estado de recarga
    this.reloadTime = 1500;          // Tiempo de recarga completa (ms)
    this.reloadStartTime = 0;        // Cuándo comenzó la recarga
    
    // Atributos para el doble salto
    this.jumpsAvailable = 2;
    this.currentJumps = 0;
    this.isDoubleJumping = false;
    this.doubleJumpParticles = null;
    this.wasOnFloor = false;

    // Atributos para escaleras
    this.canClimb = false;
    this.isClimbing = false;
    this.currentLadder = null;
    this.isClimbingCentered = false;

    // Interfaz - crear los elementos de UI que necesitamos
    this.createUI();

    // Controles y disparo
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.scene.input.on('pointerdown', () => this.shoot(), this);

    // Mano y arma
    this.hand = scene.add.sprite(x, y, 'hand3').setOrigin(0.45, 0.5);
    this.hand.setDepth(this.depth - 1);
    this.weapon = scene.add.sprite(this.x, this.y, 'weapon').setOrigin(1.3, 0.5);
    this.weapon.setDepth(this.hand.depth - 1);


    // Objects
    this.parachute = scene.add.sprite(this.x, this.y, 'parachute').setOrigin(0.57, 1.1);
    this.parachute.setDepth(this.depth - 3);

    // Nuevos atributos
    this.state = PLAYER_STATE.IDLE;
    this.invulnerableTime = 1000;
    this.lastHitTime = 0;
    this.isInvulnerable = false;
    this.knockbackForce = 200;
    this.knockbackDuration = 200;
    this.isKnockedBack = false;

    // Control de tiempo para sonidos de escalera
    this.lastClimbSoundTime = 0;
    this.climbSoundDelay = 980; // Tiempo entre sonidos de escalera

    // Iniciar con la animación idle
    const initialAnim = this.hasWeapon ? 'idle_shoot' : 'idle';
    this.play(initialAnim);

    // Crear el emisor de partículas una sola vez
    this.doubleJumpEmitter = this.scene.add.particles(0, 0, 'effect', {
      speed: 100,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 200,
      quantity: 1,
      frequency: -1 // -1 significa que no emite automáticamente
    });
    this.doubleJumpEmitter.stop(); // Asegurarse de que está detenido inicialmente

    this.remainingtime=this.timer;
    
    
    this.scene.time.addEvent({
      delay:1000,
      callback: this.updateTimer,
      callbackScope:this,
      loop:true
    });
    this.timerText= this.scene.add.text(0,0,"Tiempo Restante:"+this.remainingtime/1000);//,{fontSize:'32px',fill:"ffffff"});// .setDepth(1);
    this.timerText.setScrollFactor(0);
  }

  // Crear los elementos de la interfaz
  createUI() {

    // Contenedor principal para todos los elementos de UI
    this.uiContainer = this.scene.add.container(10, 30); // Movido hacia abajo desde 10,10
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

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

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
    const runAnim = this.hasParachute ? (this.hasWeapon ? 'idle_shoot' : 'idle') : (this.hasWeapon ? 'run_shoot' : 'run');
    const idleAnim = this.hasParachute ? (this.hasWeapon ? 'idle_shoot' : 'idle') : (this.hasWeapon ? 'idle_shoot' : 'idle');
    const jumpAnim = this.hasParachute ? (this.hasWeapon ? 'idle_shoot' : 'idle') : (this.hasWeapon ? 'jump_shoot' : 'jump');
    const idleJumpAnim = this.hasParachute ? (this.hasWeapon ? 'idle_shoot' : 'idle') : (this.hasWeapon ? 'jump_shoot' : 'jump');
    
    // Agregar tecla R para recargar manualmente
    const keyR = this.scene.input.keyboard.addKey('R');
    if (Phaser.Input.Keyboard.JustDown(keyR) && !this.isReloading && this.ammo < this.maxAmmo && this.hasWeapon) {
      this.reload();
    }

    if (Phaser.Input.Keyboard.JustDown( this.scene.keys.cambiarWeapon)) {
      this.hasWeapon = !this.hasWeapon;
      this.weapon.setVisible(this.hasWeapon);   
      this.hand.setVisible(this.hasWeapon);   
    }
  

    //PARACHUTE
    this.hasParachute = (this.scene.keys.up.isDown ||  (this.scene.keys.down.isDown &&  !this.body.onFloor()));
    this.parachute.setVisible(this.hasParachute);
    
    if (this.hasParachute) {

      this.speed = this.parachuteSpeed;
      this.parachute.setPosition(this.x, this.y);

      if (this.scene.keys.down.isDown && !this.body.onFloor()) {
        this.setVelocityY(this.speed); // Baja más lento

      } else if (this.scene.keys.up.isDown) {
        this.setVelocityY(-this.speed); // Sube lentamente

      } else {
        this.setVelocityY(0); // Mantiene su posición cuando no se pulsa nada
      }
    }
    else{
      this.speed = this.normalSpeed;
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
    if (this.scene.keys.left.isDown) {

      this.setVelocityX(-this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      this.setFlipX(true);
    } else if (this.scene.keys.right.isDown) {
      this.setVelocityX(this.speed);
      if (this.body.onFloor()) {
        this.anims.play(runAnim, true);
      }
      this.setFlipX(false);
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
      if (this.currentJumps === 2 && !this.hasWeapon && !this.hasParachute) {
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

    if (this.scene.keys.down.isDown && this.crawlTime <= this.maxCrawlTime && this.body.onFloor()) {

      this.resetearAgacharse = true;

      if (this.weapon) {
        this.anims.play("sit_shoot", true);
        this.body.setSize(20, 28); // 🔹 Ajusta la hitbox para que coincida
        this.body.offset.y = 20;

      } else {
        this.anims.play("crawl", true);
        this.body.setSize(20, 28); // 🔹 Ajusta la hitbox para que coincida
        this.body.offset.y = 20;
      }

      this.crawlTime++;
    }
    else{

      if(this.resetearAgacharse){
      this.setSize(20, 35);
      this.setOffset(14, 13);
      this.resetearAgacharse = false;
      }

    }


    if (this.crawlTime >= this.maxCrawlTime ) {
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

    if (this.hasWeapon) {
      this.updateHand();
    }






     // DAÑO DE CAÍDA
     if (!this.body.onFloor()) {
      if (this.highestY === null ) {
        this.highestY = this.y; // Guarda la mayor altura alcanzada
      }
    } else {
      if (this.highestY !== null) {
        const fallDistance = Math.abs(this.highestY - this.y); // Diferencia real de caída
        if (this.y > this.highestY && fallDistance >= this.fatalFallHeight &&  Math.abs(this.body.velocity.y) > this.parachuteSpeed) {
          this.health = 0;
          this.die();
        }
      } 
      this.highestY = null; // Resetea cuando toca el suelo
    }
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
    angle = Phaser.Math.Clamp(angle, minAngle, maxAngle);
    const shoulderOffsetX = 0;
    const shoulderOffsetY = 0;
    const shoulderX = this.x + shoulderOffsetX * (this.flipX ? -1 : 1);
    const shoulderY = this.y + shoulderOffsetY;
    this.hand.setPosition(shoulderX, shoulderY);
    this.hand.setRotation(angle);
    this.updateWeapon();
    this.ajustarDireccion();
  }

  updateWeapon() {
    this.weapon.setPosition(this.hand.x, this.hand.y);
    this.weapon.setRotation(this.hand.rotation);
  }

  ajustarDireccion() {
    this.hand.setScale(!this.flipX ? -1 : 1, 1);
    this.weapon.setScale(!this.flipX ? -1 : 1, 1);
  }

  reload() {
    if (this.isReloading || this.ammo === this.maxAmmo) return;
    
    this.isReloading = true;
    this.reloadStartTime = this.scene.time.now;
    
    // Reproducir sonido de inicio de recarga
    this.scene.sound.play('escaleras', { volume: 0.3 });
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
   
    // El resto de la lógica de disparo existente
    const bulletSpeed = 800;
    let angle = this.weapon.rotation;
    if (this.flipX) {
      angle += Math.PI;
    }
    // Calcular posición inicial de la bala
    const bulletX = this.weapon.x + Math.cos(angle) * 20;
    const bulletY = this.weapon.y + Math.sin(angle) * 20;
    // Crear la bala directamente a través del grupo para que herede la configuración del grupo (allowGravity: false)
    const bullet = this.scene.bullets.create(bulletX, bulletY, 'bullet');
    bullet.setRotation(this.weapon.rotation);
    bullet.damage = this.damage; // Asigna el daño del disparo
  
    // Configurar velocidad de la bala
    const velocityX = Math.cos(angle) * bulletSpeed;
    const velocityY = Math.sin(angle) * bulletSpeed;
    bullet.setVelocity(velocityX, velocityY);
  
    // Asegurarse de que la bala no esté afectada por la gravedad (aunque el grupo ya lo configura)
    bullet.body.allowGravity = false;
  
    // Efecto de disparo (no modificado)
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
    
    // Reproducir sonido de disparo
    this.scene.sound.play('disparo');
  }

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
      if (this.health <= 0 ) {
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

  jump_sound() {
    // Reproducir sonido de salto
    this.scene.sound.play('jump');
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
  
  updateTimer() {
    this.remainingtime-=1000;
    //alert(this.remainingtime);
    if(this.remainingtime<=0){
      this.die();
    }

    this.timerText.setText("Tiempo Restante:"+this.remainingtime/1000);
  }
}

import Phaser from 'phaser';

/**
 * Clase encargada de gestionar la interfaz de usuario del juego
 */
export default class GameUI {
  /**
   * @param {Phaser.Scene} scene - La escena donde se mostrará la UI
   * @param {Player} player - El jugador al que está vinculada la UI
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    
    // Contenedor principal para todos los elementos de UI
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0); // Fija a la cámara
    this.container.setDepth(1000); // Por encima de todo

    // Crear elementos de UI
    this.createHealthBar();
    this.createLivesDisplay();
    this.createScoreDisplay();
    this.createTimeDisplay();
    this.createWeaponInventory();
    this.createSpecialItemsIndicators();
    
    // Actualizar la UI inicialmente
    this.update();
  }

  /**
   * Crear barra de salud
   */
  createHealthBar() {
    // Fondo de la barra de salud
    this.healthBarBg = this.scene.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(20, 20, 200, 25, 5);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRoundedRect(20, 20, 200, 25, 5);
    
    // Barra de salud (roja)
    this.healthBar = this.scene.add.graphics();
    
    // Texto de salud
    this.healthText = this.scene.add.text(120, 32, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Añadir al contenedor
    this.container.add([this.healthBarBg, this.healthBar, this.healthText]);
  }

  /**
   * Crear indicador de vidas
   */
  createLivesDisplay() {
    // Fondo del contador de vidas
    this.livesBg = this.scene.add.graphics();
    this.livesBg.fillStyle(0x000000, 0.7);
    this.livesBg.fillRoundedRect(230, 20, 120, 25, 5);
    this.livesBg.lineStyle(2, 0xff44aa, 1);
    this.livesBg.strokeRoundedRect(230, 20, 120, 25, 5);
    
    // Texto de vidas
    this.livesText = this.scene.add.text(290, 32, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ff44aa',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Añadir al contenedor
    this.container.add([this.livesBg, this.livesText]);
  }

  /**
   * Crear indicador de puntuación
   */
  createScoreDisplay() {
    // Fondo del contador de puntuación
    this.scoreBg = this.scene.add.graphics();
    this.scoreBg.fillStyle(0x000000, 0.7);
    this.scoreBg.fillRoundedRect(20, 55, 200, 25, 5);
    this.scoreBg.lineStyle(2, 0xffdd00, 1);
    this.scoreBg.strokeRoundedRect(20, 55, 200, 25, 5);
    
    // Texto de puntuación
    this.scoreText = this.scene.add.text(30, 67, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffdd00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    
    // Añadir al contenedor
    this.container.add([this.scoreBg, this.scoreText]);
  }

  /**
   * Crear indicador de tiempo restante
   */
  createTimeDisplay() {
    // Fondo del contador de tiempo
    this.timeBg = this.scene.add.graphics();
    this.timeBg.fillStyle(0x000000, 0.7);
    this.timeBg.fillRoundedRect(20, 90, 200, 25, 5);
    this.timeBg.lineStyle(2, 0x44aaff, 1);
    this.timeBg.strokeRoundedRect(20, 90, 200, 25, 5);
    
    // Texto de tiempo
    this.timeText = this.scene.add.text(30, 102, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#44aaff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    
    // Añadir al contenedor
    this.container.add([this.timeBg, this.timeText]);
  }

  /**
   * Crear inventario de armas
   */
  createWeaponInventory() {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    /*
    // Fondo del inventario usando imagen precargada
    this.weaponInventoryBg = this.scene.add.sprite(120, screenHeight - 50, 'ui_panel')
      .setDisplaySize(200, 60)
      .setOrigin(0.5);
    
    // Posicionar correctamente en la parte inferior izquierda
    this.weaponInventoryBg.setPosition(120, screenHeight - 50);
    
    // Añadir al contenedor
    this.container.add(this.weaponInventoryBg);
    */
    
    // Título del inventario
    this.weaponInventoryTitle = this.scene.add.text(30, screenHeight - 100, 'Armas', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.container.add(this.weaponInventoryTitle);
    
    // Slots de armas (3 slots)
    this.weaponSlots = [];
    this.weaponIcons = [];
    this.ammoTexts = [];
    this.keyTexts = [];
    
    const slotWidth = 60;
    const slotGap = 10;
    const startX = 30; // Más cerca del borde izquierdo
    const startY = screenHeight - 75;
    
    for (let i = 0; i < 3; i++) {
      // Slot background - Ahora usando imágenes precargadas
      const slot = this.scene.add.sprite(
        startX + i * (slotWidth + slotGap) + slotWidth/2, 
        startY + 25, 
        i === 0 ? 'ui_slot_active' : 'ui_slot'
      );
      
      // Ícono del arma (inicialmente vacío)
      const icon = this.scene.add.sprite(
        startX + i * (slotWidth + slotGap) + slotWidth/2, 
        startY + 25, 
        'weapon'
      ).setVisible(false).setScale(1.5);  // Escala de arma aumentada
      
      // Texto de munición
      const ammoText = this.scene.add.text(
        startX + i * (slotWidth + slotGap) + slotWidth/2, 
        startY + 40, 
        '', 
        {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        }
      ).setOrigin(0.5);
      
      // Indicador de tecla (1, 2, 3)
      const keyText = this.scene.add.text(
        startX + i * (slotWidth + slotGap) + 15, 
        startY + 7, 
        `${i+1}`, 
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        }
      ).setOrigin(0.5);
      
      // Guardamos referencias
      this.weaponSlots.push(slot);
      this.weaponIcons.push(icon);
      this.ammoTexts.push(ammoText);
      this.keyTexts.push(keyText);
      
      // Añadir al contenedor
      this.container.add([slot, icon, ammoText, keyText]);
    }
  }
  
  /**
   * Crear indicadores para objetos especiales
   */
  createSpecialItemsIndicators() {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Contenedor para los indicadores - Ahora en la esquina inferior derecha
    this.specialItemsContainer = this.scene.add.container(
      screenWidth - 240, 
      screenHeight - 80
    );
    this.container.add(this.specialItemsContainer);
    
    // Título del contenedor de objetos especiales
    this.specialItemsTitle = this.scene.add.text(0, -20, 'Objetos', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.specialItemsContainer.add(this.specialItemsTitle);
    
    // Definir indicadores para: jetpack, paracaídas, escudo, velocidad
    this.specialItems = [
      { 
        key: 'jetpack', 
        icon: 'jetpack',
        property: 'hasJetpack',
        cooldownProperty: 'floatingEnergy',
        maxCooldownProperty: 'floatingEnergyMax',
        color: 0x44aaff
      },
      { 
        key: 'paracaidas', 
        icon: 'parachute',
        property: 'hasParacaidas',
        color: 0x66ee66
      },
      { 
        key: 'escudo', 
        icon: 'escudo',
        property: 'hasUnlockedShield',
        cooldownProperty: 'shieldCooldownActive',
        cooldownTimeProperty: 'shieldLastUsed',
        cooldownDurationProperty: 'shieldCooldown',
        activeProperty: 'shieldActive',
        bindKey: '4',
        color: 0xaaaaff
      },
      { 
        key: 'velocidad', 
        icon: 'ui_speed',
        property: 'hasSpeedBoost',
        activeProperty: 'speedBoostActive',
        color: 0xffaa44
      }
    ];
    
    this.itemIndicators = [];
    this.itemIcons = [];
    this.itemCooldowns = [];
    this.itemBindKeys = [];
    
    const indicatorSize = 50;
    const indicatorGap = 10;
    
    // Crear los indicadores visuales para cada ítem
    this.specialItems.forEach((item, index) => {
      // Fondo del indicador
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x000000, 0.7);
      bg.fillRoundedRect(index * (indicatorSize + indicatorGap), 0, indicatorSize, indicatorSize, 5);
      bg.lineStyle(2, item.color, 1);
      bg.strokeRoundedRect(index * (indicatorSize + indicatorGap), 0, indicatorSize, indicatorSize, 5);
      
      // Ícono del ítem
      const icon = this.scene.add.sprite(
        index * (indicatorSize + indicatorGap) + indicatorSize/2, 
        indicatorSize/2, 
        item.icon
      ).setScale(0.9).setAlpha(0.5).setTint(0x888888);
      
      // Barra de cooldown (inicialmente invisible)
      const cooldown = this.scene.add.graphics();
      
      // Texto de tecla (si el ítem está vinculado a una tecla)
      let bindKey = null;
      if (item.bindKey) {
        bindKey = this.scene.add.text(
          index * (indicatorSize + indicatorGap) + indicatorSize - 10, 
          10, 
          item.bindKey, 
          {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
          }
        ).setOrigin(0.5);
      }
      
      this.itemIndicators.push(bg);
      this.itemIcons.push(icon);
      this.itemCooldowns.push(cooldown);
      this.itemBindKeys.push(bindKey);
      
      this.specialItemsContainer.add([bg, icon, cooldown]);
      if (bindKey) this.specialItemsContainer.add(bindKey);
    });
  }
  
  /**
   * Actualizar todos los elementos de la UI
   */
  update() {
    // Verificar que el player exista y tenga propiedades válidas
    if (!this.player || this.player.state === undefined) {
      return; // Salir si el player no es válido
    }
    
    try {
      this.updateHealthBar();
      this.updateLivesDisplay();
      this.updateScoreDisplay();
      this.updateTimeDisplay();
      this.updateWeaponInventory();
      this.updateSpecialItemsIndicators();
    } catch (error) {
      console.error('[GameUI] Error al actualizar UI:', error);
      // No propagar el error para evitar que rompa el juego
    }
  }
  
  /**
   * Actualizar la barra de salud
   */
  updateHealthBar() {
    const { health, maxHealth } = this.player;
    const percentage = Math.max(0, health / maxHealth);
    
    // Actualizar gráfico de la barra
    this.healthBar.clear();
    
    // Calcular color RGB basado en el porcentaje de salud
    let r, g, b;
    
    // Verde (0,255,0) a Amarillo (255,255,0) a Rojo (255,0,0)
    if (percentage > 0.5) {
      // De verde a amarillo (100%-50%)
      r = Math.floor(255 * (1 - percentage) * 2); // Aumenta R de 0 a 255
      g = 255; // G se mantiene en 255
      b = 0;   // B se mantiene en 0
    } else {
      // De amarillo a rojo (50%-0%)
      r = 255; // R se mantiene en 255
      g = Math.floor(255 * percentage * 2); // Reduce G de 255 a 0
      b = 0;   // B se mantiene en 0
    }
    
    // Asegurar que los valores RGB estén en el rango correcto
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    // Convertir RGB a valor hexadecimal
    const color = (r << 16) | (g << 8) | b;
    
    // Aplicar color a la barra de salud
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRoundedRect(22, 22, 196 * percentage, 21, 4);
    
    // Actualizar texto
    this.healthText.setText(`${Math.ceil(health)}/${maxHealth}`);
  }
  
  /**
   * Actualizar el contador de vidas
   */
  updateLivesDisplay() {
    // Asegurarse de que lives sea un valor no negativo
    const lives = Math.max(0, this.player.lives);
    const maxLives = this.player.maxLives;
    
    // Asegurarse de que la diferencia no sea negativa
    const emptyHearts = Math.max(0, maxLives - lives);
    
    // Actualizar texto con número de vidas y corazones
    let heartsText = '♥'.repeat(lives) + '♡'.repeat(emptyHearts);
    this.livesText.setText(`Vidas: ${heartsText}`);
    
    // Cambiar color según número de vidas restantes
    if (lives <= 1) {
      this.livesText.setColor('#ff0000'); // Rojo para última vida
    } else if (lives <= 2) {
      this.livesText.setColor('#ffaa00'); // Naranja para pocas vidas
    } else {
      this.livesText.setColor('#ff44aa'); // Color normal
    }
  }
  
  /**
   * Actualizar el indicador de puntuación
   */
  updateScoreDisplay() {
    this.scoreText.setText(`Puntuación: ${this.player.score}`);
  }
  
  /**
   * Actualizar el indicador de tiempo restante
   */
  updateTimeDisplay() {
    const seconds = Math.ceil(this.player.remainingtime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // Formatear el tiempo como mm:ss
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    this.timeText.setText(`Tiempo: ${formattedTime}`);
  }
  
  /**
   * Actualizar el inventario de armas
   */
  updateWeaponInventory() {
    const weapons = [
      { key: 'rifle', icon: 'weapon', ammoProperty: 'rifle' },
      { key: 'shotgun', icon: 'shotgunWeapon', ammoProperty: 'shotgun' },
      { key: 'explosive', icon: 'explosiveWeapon', ammoProperty: 'explosive' }
    ];
    
    // Resaltar el slot del arma activa
    for (let i = 0; i < 3; i++) {
      const weaponUnlocked = this.player.unlockedWeapons[weapons[i].key];
      const isActive = this.player.activeWeapon === weapons[i].key;
      
      // Actualizar apariencia del slot según estado
      this.weaponSlots[i].setTexture(isActive ? 'ui_slot_active' : 'ui_slot');
      this.weaponSlots[i].setAlpha(weaponUnlocked ? 1 : 0.5);
      
      // Mostrar/ocultar ícono
      this.weaponIcons[i].setVisible(weaponUnlocked);
      if (weaponUnlocked) {
        this.weaponIcons[i].setTexture(weapons[i].icon);
        this.weaponIcons[i].setAlpha(isActive ? 1 : 0.7);
        
        // Actualizar texto de munición
        const ammo = this.player.weaponAmmo[weapons[i].ammoProperty];
        const maxAmmo = this.player.weaponMaxAmmo[weapons[i].ammoProperty];
        this.ammoTexts[i].setText(`${ammo}/${maxAmmo}`);
        this.ammoTexts[i].setColor(ammo > 0 ? '#ffffff' : '#ff6666');
      } else {
        this.ammoTexts[i].setText('');
      }
    }
  }
  
  /**
   * Actualizar los indicadores de objetos especiales
   */
  updateSpecialItemsIndicators() {
    const indicatorSize = 50;
    const indicatorGap = 10;
    
    this.specialItems.forEach((item, index) => {
      const hasItem = this.player[item.property];
      const isActive = item.activeProperty ? this.player[item.activeProperty] : false;
      
      // Actualizar ícono
      this.itemIcons[index].setAlpha(hasItem ? (isActive ? 1 : 0.7) : 0.3);
      this.itemIcons[index].setTint(hasItem ? 0xffffff : 0x888888);
      
      // Actualizar borde del indicador
      this.itemIndicators[index].clear();
      this.itemIndicators[index].fillStyle(0x000000, 0.7);
      this.itemIndicators[index].fillRoundedRect(
        index * (indicatorSize + indicatorGap), 
        0, 
        indicatorSize, indicatorSize, 5
      );
      this.itemIndicators[index].lineStyle(2, isActive ? 0xffff00 : item.color, 1);
      this.itemIndicators[index].strokeRoundedRect(
        index * (indicatorSize + indicatorGap), 
        0, 
        indicatorSize, indicatorSize, 5
      );
      
      // Actualizar barra de cooldown si corresponde
      this.itemCooldowns[index].clear();
      if (hasItem && item.cooldownProperty) {
        // Jetpack con energía (tipo barra)
        if (item.key === 'jetpack') {
          const energy = this.player[item.cooldownProperty];
          const maxEnergy = this.player[item.maxCooldownProperty];
          const percentage = energy / maxEnergy;
          
          this.itemCooldowns[index].fillStyle(0x44aaff, 0.7);
          this.itemCooldowns[index].fillRect(
            index * (indicatorSize + indicatorGap), 
            indicatorSize - (indicatorSize * percentage), 
            indicatorSize, 
            indicatorSize * percentage
          );
        }
        // Escudo con cooldown circular
        else if (item.key === 'escudo' && this.player[item.cooldownProperty]) {
          const cooldownTime = this.player[item.cooldownTimeProperty];
          const cooldownDuration = this.player[item.cooldownDurationProperty];
          const elapsed = this.scene.time.now - cooldownTime;
          const percentage = Math.min(1, elapsed / cooldownDuration);
          
          // Dibujar un arco de progreso
          this.itemCooldowns[index].fillStyle(0xaaaaff, 0.3);
          this.itemCooldowns[index].slice(
            index * (indicatorSize + indicatorGap) + indicatorSize/2, 
            indicatorSize/2, 
            20, 
            0, 
            Math.PI * 2 * percentage, 
            true
          );
          this.itemCooldowns[index].fillPath();
        }
      }
    });
  }
  
  /**
   * Destruir correctamente todos los elementos de la UI
   */
  destroy() {
    try {
      // Verificar y eliminar elementos de la barra de salud
      if (this.healthBarBg) this.healthBarBg.destroy();
      if (this.healthBar) this.healthBar.destroy();
      if (this.healthText) this.healthText.destroy();
      
      // Verificar y eliminar texto de vidas
      if (this.livesText) this.livesText.destroy();
      
      // Verificar y eliminar texto de puntuación
      if (this.scoreText) this.scoreText.destroy();
      
      // Verificar y eliminar texto de tiempo
      if (this.timeText) this.timeText.destroy();
      
      // Verificar y eliminar elementos de armas
      if (this.weaponSlots) {
        this.weaponSlots.forEach(slot => {
          if (slot && slot.active) slot.destroy();
        });
      }
      if (this.weaponIcons) {
        this.weaponIcons.forEach(icon => {
          if (icon && icon.active) icon.destroy();
        });
      }
      if (this.ammoTexts) {
        this.ammoTexts.forEach(text => {
          if (text && text.active) text.destroy();
        });
      }
      
      // Verificar y eliminar elementos de objetos especiales
      if (this.specialItemsContainer) {
        if (this.itemIndicators) {
          this.itemIndicators.forEach(indicator => {
            if (indicator && indicator.active) indicator.destroy();
          });
        }
        if (this.itemIcons) {
          this.itemIcons.forEach(icon => {
            if (icon && icon.active) icon.destroy();
          });
        }
        if (this.itemCooldowns) {
          this.itemCooldowns.forEach(cooldown => {
            if (cooldown && cooldown.active) cooldown.destroy();
          });
        }
        
        this.specialItemsContainer.destroy();
      }
      
      console.log('[GameUI] UI destruida correctamente');
    } catch (error) {
      console.error('[GameUI] Error al destruir la UI:', error);
      // No propagar el error para evitar que rompa el juego
    }
  }
} 
import Phaser from 'phaser';

/**
 * Clase para gestionar los diamantes recolectables en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Diamante extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto Diamante
   * @param {Phaser.Scene} scene - La escena a la que pertenece este diamante
   * @param {number} x - Posición X del diamante
   * @param {number} y - Posición Y del diamante
   * @param {string} texture - Textura a utilizar (por defecto 'diamante')
   * @param {number} value - Valor del diamante en puntos (opcional)
   * @param {string} color - Color del diamante (opcional: 'blue', 'red', 'green', etc.)
   */
  constructor(scene, x, y, texture = 'diamante', value = 10, color = null) {
    super(scene, x, y, texture);
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Configurar el cuerpo físico
    this.body.setSize(20, 20); // Ajustar el hitbox para ser más preciso
    this.body.setOffset(6, 6); // Offset para alinear con el sprite
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Establecer el valor en puntos
    this.value = value;
    
    // Guardar referencia a la escena
    this.escena = scene;
    
    // Aplicar tinte según el color si se especificó
    if (color) {
      this.setTint(this.getColorValue(color));
    } else if (value > 50) {
      // Aplicar tinte según valor para dar feedback visual
      this.setTint(0xff0000); // Rojo para los muy valiosos
    } else if (value > 20) {
      this.setTint(0xffaa00); // Naranja para valor medio-alto
    }
    
    // Añadir animación de flotar
    this.initAnimation();
    
    // Iniciar con el diamante activo
    this.isCollected = false;
  }
  
  /**
   * Inicializa la animación de flotación del diamante
   * @private
   */
  initAnimation() {
    // Animación suave de flotación
    this.escena.tweens.add({
      targets: this,
      y: this.y - 8, // Flotar 8 píxeles hacia arriba
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true, // Volver a la posición original
      repeat: -1 // Repetir indefinidamente
    });
    
    // Animación suave de brillo
    this.escena.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  /**
   * Convierte un nombre de color a su valor hexadecimal
   * @param {string} colorName - Nombre del color
   * @returns {number} - Valor hexadecimal del color
   * @private
   */
  getColorValue(colorName) {
    const colors = {
      'blue': 0x0000ff,
      'red': 0xff0000,
      'green': 0x00ff00,
      'yellow': 0xffff00,
      'purple': 0x800080,
      'cyan': 0x00ffff,
      'white': 0xffffff,
      'black': 0x000000,
      'gold': 0xffd700,
      'silver': 0xc0c0c0
    };
    
    return colors[colorName.toLowerCase()] || 0xffffff;
  }
  
  /**
   * Método para recolectar el diamante y otorgar puntos al jugador
   * @param {Player} player - El jugador que recoge el diamante
   */
  collect(player) {
    if (this.isCollected) return;
    
    // Marcar como recogido
    this.isCollected = true;
    
    // Añadir puntos al jugador
    player.score += this.value;
    
    // Efecto de recolección
    this.playCollectEffect();
    
    // Desactivar físicas
    this.body.enable = false;
    
    // Notificar para actualizar UI en caso necesario
    this.escena.events.emit('diamanteRecogido', this.value);
  }
  
  /**
   * Reproduce un efecto visual al recoger el diamante
   * @private
   */
  playCollectEffect() {
    // Detener las animaciones actuales
    this.escena.tweens.killTweensOf(this);
    
    // Efecto de brillo
    this.escena.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Eliminar el sprite al completar la animación
        this.destroy();
      }
    });
    
    // Añadir partículas de brillo si está disponible
    if (this.escena.add.particles) {
      const particles = this.escena.add.particles(this.x, this.y, 'effect', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 300,
        quantity: 8,
        blendMode: 'ADD'
      });
      
      // Autodestruir emisor después de la animación
      this.escena.time.delayedCall(300, () => {
        particles.destroy();
      });
    }
    
    // Reproducir sonido de recolección
    //this.escena.sound.play('diamante', { volume: 0.5 });
  }
  
  /**
   * Factory method para crear diamantes desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir los diamantes
   * @param {Phaser.Tilemaps.Tilemap} map - El objeto tilemap
   * @param {string} layerName - El nombre de la capa de objetos en el mapa
   * @param {string} defaultTexture - La textura por defecto a usar
   * @returns {Phaser.GameObjects.Group} - Grupo que contiene todos los diamantes creados
   */
  static createFromMap(scene, map, layerName, defaultTexture = 'diamante') {
    // Crear un grupo para los diamantes
    const diamantesGroup = scene.physics.add.group({
      classType: Diamante,
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const diamantesLayer = map.getObjectLayer(layerName);
      
      if (diamantesLayer && diamantesLayer.objects) {
        diamantesLayer.objects.forEach(diamante => {
          // Variables para configurar el diamante
          let textureToUse = defaultTexture;
          let value = 10; // Valor por defecto
          let colorName = null;
          
          // Comprobar propiedades personalizadas
          if (diamante.properties && Array.isArray(diamante.properties)) {
            // Buscar propiedad "value" para el valor en puntos
            const valueProperty = diamante.properties.find(prop => prop.name === 'value');
            if (valueProperty) {
              value = valueProperty.value;
            }
            
            // Buscar propiedad "color" para el tinte
            const colorProperty = diamante.properties.find(prop => prop.name === 'color');
            if (colorProperty) {
              colorName = colorProperty.value;
            }
            
            // Buscar propiedad "texture" para cambiar la textura
            const textureProperty = diamante.properties.find(prop => prop.name === 'texture');
            if (textureProperty) {
              textureToUse = textureProperty.value;
            }
          }
          
          // Crear el diamante con la configuración determinada
          const diamanteSprite = new Diamante(
            scene,
            diamante.x + 16, // Ajustar posición X al centro del objeto
            diamante.y - 16, // Ajustar posición Y al centro del objeto
            textureToUse,
            value,
            colorName
          );
          
          // Añadir el diamante al grupo
          diamantesGroup.add(diamanteSprite);
        });
        
        console.log(`Creados ${diamantesLayer.objects.length} diamantes desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa`);
      }
    } catch (error) {
      console.error(`Error al crear diamantes desde la capa ${layerName}:`, error);
    }
    
    return diamantesGroup;
  }
  
  /**
   * Configura la colisión con el jugador para todos los diamantes del grupo
   * @static
   * @param {Phaser.Scene} scene - La escena
   * @param {Phaser.GameObjects.Group} diamantesGroup - El grupo de diamantes
   * @param {Player} player - El jugador
   */
  static setupCollision(scene, diamantesGroup, player) {
    scene.physics.add.overlap(
      player,
      diamantesGroup,
      (player, diamante) => {
        diamante.collect(player);
      },
      null,
      scene
    );
  }
} 
import Phaser from 'phaser';

/**
 * Clase para gestionar los pinchos en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Pincho extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto Pincho
   * @param {Phaser.Scene} scene - La escena a la que pertenece este pincho
   * @param {number} x - Posición X del pincho
   * @param {number} y - Posición Y del pincho
   * @param {string} texture - Textura a utilizar (pichos_arriba, pichos_abajo)
   * @param {number} scale - Escala del pincho (menor que 1 para pinchos pequeños)
   * @param {number} damage - Daño que causa este pincho (opcional)
   */
  constructor(scene, x, y, texture, scale = 1.0, damage = null) {
    super(scene, x, y, texture);
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Establecer escala si es diferente del valor por defecto
    if (scale !== 1.0) {
      this.setScale(scale);
    }
    
    // Configurar el cuerpo físico
    this.body.setSize(24, 20); // Ajustar el hitbox para que sea más preciso
    this.body.setOffset(4, 16); // Ajustar el offset para alinear con el sprite
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Establecer el daño que causa este pincho
    this.damage = damage !== null ? damage : 20;
    
    // Personalizar según el tipo de pincho
    if (texture === 'pichos_abajo') {
      this.body.setOffset(4, 4); // Diferente offset para pinchos hacia abajo
    }
    
    // Si la escala es pequeña (pinchos pequeños), reducir el daño y el hitbox
    if (scale < 1.0 && damage === null) {  // Solo ajustar el daño si no se proporcionó explícitamente
      this.damage = 10; // Menos daño para pinchos pequeños
      
      // Ajustar el hitbox proporcionalmente a la escala
      const newWidth = Math.floor(24 * scale);
      const newHeight = Math.floor(12 * scale);
      this.body.setSize(newWidth, newHeight);
      
      if (texture === 'pichos_abajo') {
        this.body.setOffset(4, 4); 
      } else {
        this.body.setOffset(4, 16);
      }
    }
    
    // Aplicar tinte según nivel de daño para dar feedback visual
    if (this.damage > 30) {
      //this.setTint(0xff0000); // Rojo para los muy peligrosos
    } else if (this.damage > 20) {
      //this.setTint(0xff6600); // Naranja para peligrosidad media-alta
    }
  }
  
  /**
   * Método para causar daño al jugador
   * @param {Player} player - El jugador que recibe daño
   */
  doDamage(player) {
    if (!player.isInvulnerable) {
      player.takeDamage(this.damage, this);
    }
  }
  
  /**
   * Factory method to create pinchos from map objects
   * @static
   * @param {Phaser.Scene} scene - The scene to add the pinchos to
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap object
   * @param {string} layerName - The name of the object layer in the map
   * @param {string} defaultTexture - The default texture to use for the pinchos
   * @returns {Phaser.GameObjects.Group} - Group containing all created pinchos
   */
  static createFromMap(scene, map, layerName, defaultTexture) {
    // Crear un grupo para los pinchos
    const pinchosGroup = scene.physics.add.group({
      classType: Pincho,
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const pinchosLayer = map.getObjectLayer(layerName);
      
      if (pinchosLayer && pinchosLayer.objects) {
        pinchosLayer.objects.forEach(pincho => {
          // Determinar la textura basada en el gid
          let textureToUse = defaultTexture;
          let scale = 1.0;
          let damageValue = null;
          let direccion = null;

  
          
          // Buscar propiedad damage en caso de que exista
          // En Tiled, las propiedades personalizadas se guardan en un array llamado "properties"
          if (pincho.properties && Array.isArray(pincho.properties)) {
            // Buscar la propiedad "damage" dentro del array de propiedades
            const damageProperty = pincho.properties.find(prop => prop.name === 'damage');
            if (damageProperty) {
              damageValue = damageProperty.value;
              console.log(`Pincho con daño personalizado: ${damageValue}`);
            }
            const direccionProperty = pincho.properties.find(prop => prop.name === 'direccion');
            if (direccionProperty) {
              direccion = direccionProperty.value;
            }
          }

          if(direccion === 'arriba'){
            textureToUse = 'pichos_arriba';
          }else if(direccion === 'abajo'){
            textureToUse = 'pichos_abajo';
          }else if(direccion === 'izquierda'){
            textureToUse = 'pichos_izquierda';
          }else if(direccion === 'derecha'){
            textureToUse = 'pichos_derecha';
          }

          
          // Crear el sprite del pincho con daño personalizado si existe
          const pinchoSprite = new Pincho(
            scene, 
            pincho.x + 16, // Ajustar posición X al centro del objeto
            pincho.y - 16, // Ajustar posición Y al centro del objeto
            textureToUse,
            scale,
            damageValue
          );
          
          // Añadir el pincho al grupo
          pinchosGroup.add(pinchoSprite);
        });
        
        console.log(`Creados ${pinchosLayer.objects.length} pinchos desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa`);
      }
    } catch (error) {
      console.error(`Error al crear pinchos desde la capa ${layerName}:`, error);
    }
    
    return pinchosGroup;
  }
} 
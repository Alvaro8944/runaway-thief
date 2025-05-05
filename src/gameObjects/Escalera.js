import Phaser from 'phaser';
import gameData from '../data/GameData';

/**
 * Clase para gestionar las escaleras en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Escalera extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto Escalera
   * @param {Phaser.Scene} scene - La escena a la que pertenece esta escalera
   * @param {number} x - Posición X de la escalera
   * @param {number} y - Posición Y de la escalera
   * @param {number} height - Altura de la escalera
   */
  constructor(scene, x, y, height) {
    super(scene, x, y, 'ladder2');
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Configurar el cuerpo físico
    this.body.setSize(32, height);
    this.setDisplaySize(32, height);
    this.setOrigin(0.5, 0.5);
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Referencia a la escena para poder acceder a sus métodos
    this.escena = scene;
  }
  
  /**
   * Método para procesar la interacción del jugador con la escalera
   * @param {Player} player - El jugador que interactúa con la escalera
   */
  handlePlayerOverlap(player) {
    // Permitir al jugador escalar
    player.canClimb = true;
    player.currentLadder = this;
  }
  
  /**
   * Factory method para crear escaleras desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir las escaleras
   * @param {Phaser.Tilemaps.Tilemap} map - El tilemap
   * @param {string} layerName - Nombre de la capa de objetos
   * @returns {Phaser.GameObjects.Group} - Grupo con todas las escaleras creadas
   */
  static createFromMap(scene, map, layerName) {
    // Crear un grupo para las escaleras
    const escalerasGroup = scene.physics.add.group({
      classType: Escalera,
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const escalerasLayer = map.getObjectLayer(layerName);
      
      if (escalerasLayer && escalerasLayer.objects && escalerasLayer.objects.length > 0) {
        // Crear todas las escaleras
        escalerasLayer.objects.forEach(escalera => {
          // Crear el sprite de la escalera
          const escaleraSprite = new Escalera(
            scene,
            escalera.x + escalera.width/2,
            escalera.y - escalera.height/2,
            escalera.height
          );
          
          // Añadir la escalera al grupo
          escalerasGroup.add(escaleraSprite);
        });
        
        console.log(`Creadas ${escalerasLayer.objects.length} escaleras desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa o está vacía`);
      }
    } catch (error) {
      console.error(`Error al crear escaleras desde la capa ${layerName}:`, error);
    }
    
    return escalerasGroup;
  }
} 
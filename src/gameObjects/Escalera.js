import Phaser from 'phaser';

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
   * @param {boolean} isTransitionPoint - Si esta escalera es un punto de transición entre niveles
   */
  constructor(scene, x, y, height, isTransitionPoint = false) {
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
    
    // Marcar si esta escalera es un punto de transición
    this.isTransitionPoint = isTransitionPoint;
    
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
    
    // Si es la escalera de transición y el jugador está cerca de la parte superior
    if (this.isTransitionPoint) {
      // Calcular la distancia a la parte superior de la escalera
      const distanciaAlTope = Math.abs(player.y - (this.y - this.displayHeight/2));
      
      // Zona amplia de detección cerca de la parte superior
      if (distanciaAlTope < 50 && this.escena.keys.up.isDown) {
        console.log('Detectada colisión con escalera de transición');
        this.iniciarTransicion(player);
      }
    }
  }
  
  /**
   * Inicia el proceso de transición al siguiente nivel
   * @param {Player} player - El jugador
   */
  iniciarTransicion(player) {
    // Evitar múltiples transiciones
    if (this.escena.isTransitioning) return;
    this.escena.isTransitioning = true;
    console.log('Iniciando transición al siguiente nivel');
    
    // Desactivar controles del jugador
    player.body.setVelocity(0, 0);
    player.body.allowGravity = false;
    
    // Efecto de fade out
    this.escena.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Transición a la escena de boot correspondiente
    this.escena.time.delayedCall(1000, () => {
      console.log('Cambiando a la escena de boot');
      
      // Determinamos la siguiente escena basándonos en la escena actual
      let nextScene = 'boot2';
      if (this.escena.scene.key === 'level2') {
        nextScene = 'boot3';
      }
      
      this.escena.scene.start(nextScene, { 
        playerHealth: player.health,
        playerScore: player.score 
      });
    });
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
        // Encontrar la escalera más alta (Y más pequeña)
        let escaleraMasAlta = escalerasLayer.objects[0];
        escalerasLayer.objects.forEach(escalera => {
          if (escalera.y < escaleraMasAlta.y) {
            escaleraMasAlta = escalera;
          }
        });
        
        // Crear todas las escaleras
        escalerasLayer.objects.forEach(escalera => {
          // Determinar si esta es la escalera de transición
          const isTransition = escalera === escaleraMasAlta;
          
          // Obtener cualquier propiedad personalizada de transición
          let forceTransition = false;
          if (escalera.properties && Array.isArray(escalera.properties)) {
            const transitionProp = escalera.properties.find(prop => prop.name === 'isTransition');
            if (transitionProp) {
              forceTransition = transitionProp.value;
            }
          }
          
          // Crear el sprite de la escalera
          const escaleraSprite = new Escalera(
            scene,
            escalera.x + escalera.width/2,
            escalera.y - escalera.height/2,
            escalera.height,
            isTransition || forceTransition
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
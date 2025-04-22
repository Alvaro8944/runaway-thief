import Phaser from 'phaser';

/**
 * Clase para gestionar rocas destructibles en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class RocaDestructible extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto RocaDestructible
   * @param {Phaser.Scene} scene - La escena a la que pertenece esta roca
   * @param {number} x - Posición X de la roca
   * @param {number} y - Posición Y de la roca
   * @param {number} resistencia - Resistencia de la roca (opcional)
   * @param {number} scale - Escala de la roca (opcional)
   */
  constructor(scene, x, y, resistencia = 1, scale = 1.0) {
    super(scene, x, y, 'BlqDestructible');
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Guardar la resistencia
    this.resistencia = resistencia;
    this.resistenciaMaxima = resistencia;
    
    // Establecer escala si es diferente del valor por defecto
    if (scale !== 1.0) {
      this.setScale(scale);
    }
    
    // Configurar el cuerpo físico
    this.body.setSize(32, 32); // Ajustar el hitbox 
    this.body.setOffset(0, 0);  // Ajustar el offset
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Añadir sombra de profundidad
    this.crearSombra();
    
    // Estado de la roca
    this.agrietada = false;
  }
  
  /**
   * Crea una sombra para dar sensación de profundidad
   */
  crearSombra() {
    // Podemos añadir una sombra sutil debajo de la roca
    this.sombra = this.scene.add.image(this.x + 5, this.y + 5, 'BlqDestructible')
      .setAlpha(0.3)
      .setTint(0x000000)
      .setDepth(this.depth - 1);
  }
  
  /**
   * Recibe daño y actualiza el estado de la roca
   * @param {number} cantidad - Cantidad de daño recibido
   * @param {object} fuente - Objeto que causó el daño (bala, jugador, etc.)
   * @returns {boolean} - Retorna true si la roca fue destruida
   */
  recibirDanio(cantidad, fuente = null) {
    this.resistencia -= cantidad;
    
    // Añadir efecto visual de impacto
    this.scene.tweens.add({
      targets: this,
      y: this.y - 2,
      duration: 50,
      yoyo: true
    });
    
    // Mostrar efecto de impacto en el punto donde recibió el daño
    if (fuente && (fuente.x !== undefined && fuente.y !== undefined)) {
      this.mostrarEfectoImpacto(fuente.x, fuente.y);
    } else {
      this.mostrarEfectoImpacto(this.x, this.y);
    }
    
    // Mostrar agrietado si está por debajo del 50% de resistencia
    if (!this.agrietada && this.resistencia <= this.resistenciaMaxima / 2) {
      this.agrietada = true;
      this.setTint(0xAAAAAA); // Tinte gris para indicar daño
      
      // Crear efecto de partículas de polvo/escombros
      this.crearParticulasImpacto();
    }
    
    // Si la resistencia llega a 0 o menos, destruir la roca
    if (this.resistencia <= 0) {
      this.destruir();
      return true;
    }
    
    return false;
  }
  
  /**
   * Muestra un efecto visual cuando una bala impacta en la roca
   * @param {number} x - Coordenada X del impacto
   * @param {number} y - Coordenada Y del impacto
   */
  mostrarEfectoImpacto(x, y) {
    // Crear un destello en el punto de impacto
    const destello = this.scene.add.sprite(x, y, 'effect')
      .setScale(0.3)
      .setDepth(10);
    
    // Reproducir la animación si existe, o crear un tween simple
    if (destello.anims.exists('effect')) {
      destello.play('effect');
      destello.once('animationcomplete', () => destello.destroy());
    } else {
      // Alternativa si no hay animación
      this.scene.tweens.add({
        targets: destello,
        alpha: 0,
        scale: 0.1,
        duration: 300,
        onComplete: () => destello.destroy()
      });
    }
    
    // Añadir sonido de impacto si existe
    if (this.scene.sound.get('impact')) {
      this.scene.sound.play('impact', { volume: 0.3 });
    }
    
    // Simular partículas con sprites individuales
    this.simularParticulasImpacto(x, y);
  }
  
  /**
   * Simula un efecto de partículas mediante sprites individuales
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   */
  simularParticulasImpacto(x, y) {
    const cantidad = 5;
    
    for (let i = 0; i < cantidad; i++) {
      // Crear un sprite pequeño para simular una partícula
      const particula = this.scene.add.sprite(x, y, 'effect')
        .setScale(0.2)
        .setAlpha(0.7)
        .setTint(0xCCCCCC);
      
      // Velocidad y dirección aleatoria
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 20 + Math.random() * 40;
      const vx = Math.cos(angulo) * velocidad;
      const vy = Math.sin(angulo) * velocidad;
      
      // Animar la partícula
      this.scene.tweens.add({
        targets: particula,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particula.destroy()
      });
    }
  }
  
  /**
   * Crea partículas de impacto cuando la roca se agrieta
   */
  crearParticulasImpacto() {
    // Simular partículas mediante sprites
    this.simularParticulasAgrietas(this.x, this.y);
  }
  
  /**
   * Simula partículas para el efecto de agrietado
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   */
  simularParticulasAgrietas(x, y) {
    const cantidad = 10;
    
    for (let i = 0; i < cantidad; i++) {
      // Crear un sprite pequeño para simular una partícula
      const particula = this.scene.add.sprite(x, y, 'effect')
        .setScale(0.3)
        .setAlpha(0.8)
        .setTint(0xCCCCCC);
      
      // Posición aleatoria dentro del sprite
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      particula.x += offsetX;
      particula.y += offsetY;
      
      // Velocidad y dirección aleatoria
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 30 + Math.random() * 50;
      const vx = Math.cos(angulo) * velocidad;
      const vy = Math.sin(angulo) * velocidad;
      
      // Animar la partícula
      this.scene.tweens.add({
        targets: particula,
        x: particula.x + vx,
        y: particula.y + vy,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particula.destroy()
      });
    }
  }
  
  /**
   * Destruye la roca y crea efectos visuales
   */
  destruir() {
    // Crear efecto visual de destrucción
    this.crearEfectoDestruccion();
    
    // Reproducir sonido si existe
    if (this.scene.sound.get('rockBreak')) {
      this.scene.sound.play('rockBreak', { volume: 0.6 });
    }
    
    // Destruir la roca
    this.destroy();
  }
  
  /**
   * Crea un efecto visual cuando la roca se destruye
   */
  crearEfectoDestruccion() {
    // Simular partículas mediante sprites
    this.simularParticulasDestruccion(this.x, this.y);
    
    // Efecto de vibración de cámara
    this.scene.cameras.main.shake(100, 0.005);
  }
  
  /**
   * Simula partículas para el efecto de destrucción
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   */
  simularParticulasDestruccion(x, y) {
    const cantidad = 20;
    
    for (let i = 0; i < cantidad; i++) {
      // Crear un sprite pequeño para simular una partícula
      const particula = this.scene.add.sprite(x, y, 'effect')
        .setScale(0.4)
        .setAlpha(0.9)
        .setTint(0xCCCCCC);
      
      // Velocidad y dirección aleatoria
      const angulo = Math.random() * Math.PI * 2;
      const velocidad = 50 + Math.random() * 100;
      const vx = Math.cos(angulo) * velocidad;
      const vy = Math.sin(angulo) * velocidad;
      
      // Animar la partícula
      this.scene.tweens.add({
        targets: particula,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particula.destroy()
      });
    }
  }
  
  /**
   * Factory method para crear rocas destructibles desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir las rocas
   * @param {Phaser.Tilemaps.Tilemap} map - El objeto tilemap
   * @param {string} layerName - El nombre de la capa de objetos en el mapa
   * @returns {Phaser.GameObjects.Group} - Grupo con todas las rocas creadas
   */
  static createFromMap(scene, map, layerName) {
    // Crear un grupo para las rocas
    const rocasGroup = scene.physics.add.group({
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const rocasLayer = map.getObjectLayer(layerName);
      
      if (rocasLayer && rocasLayer.objects) {
        rocasLayer.objects.forEach(roca => {
          let resistencia = 1;
          let scale = 1.0;
          
          // Buscar propiedades personalizadas
          if (roca.properties && Array.isArray(roca.properties)) {
            // Buscar la propiedad "Resistencia"
            const resistenciaProperty = roca.properties.find(prop => prop.name === 'Resistencia');
            if (resistenciaProperty) {
              resistencia = resistenciaProperty.value;
            }
            
            // Buscar la propiedad "Scale"
            const scaleProperty = roca.properties.find(prop => prop.name === 'Scale');
            if (scaleProperty) {
              scale = scaleProperty.value;
            }
          }
          
          // Crear el sprite de la roca
          const rocaSprite = new RocaDestructible(
            scene, 
            roca.x + 16, // Ajustar posición X al centro del objeto
            roca.y - 16, // Ajustar posición Y al centro del objeto
            resistencia,
            scale
          );
          
          // Añadir la roca al grupo
          rocasGroup.add(rocaSprite);
        });
        
        console.log(`Creadas ${rocasLayer.objects.length} rocas destructibles desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa`);
      }
    } catch (error) {
      console.error(`Error al crear rocas destructibles desde la capa ${layerName}:`, error);
    }
    
    return rocasGroup;
  }
  
  /**
   * Método que se llama cuando se destruye la roca
   * @override
   */
  destroy() {
    // Destruir la sombra si existe
    if (this.sombra) {
      this.sombra.destroy();
      this.sombra = null;
    }
    
    // Llamar al método destroy de la clase padre
    super.destroy();
  }
} 
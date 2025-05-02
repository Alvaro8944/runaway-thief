import Phaser from 'phaser';

/**
 * Clase para gestionar el cartel de información en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Cartel extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto Cartel
   * @param {Phaser.Scene} scene - La escena a la que pertenece este cartel
   * @param {number} x - Posición X del cartel
   * @param {number} y - Posición Y del cartel
   * @param {string} contenido - Tipo de contenido que describe el cartel (escopeta, dobleSalto, etc.)
   * @param {string} mensaje - Mensaje personalizado a mostrar (opcional)
   * @param {number} scale - Escala del cartel (opcional)
   */
  constructor(scene, x, y, contenido = null, mensaje = 'Presiona E para ver información', scale = 1.0) {
    super(scene, x, y, 'Cartel');
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Guardar el contenido y mensaje
    this.contenido = contenido;
    this.mensaje = mensaje;
    
    // Establecer escala si es diferente del valor por defecto
    if (scale !== 1.0) {
      this.setScale(scale);
    }
    
    // Configurar el cuerpo físico
    this.body.setSize(32, 40); // Ajustar el hitbox para que sea preciso
    this.body.setOffset(0, 0); // Ajustar el offset para alinear con el sprite
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Variables para controlar la interacción
    this.jugadorEnRango = false;
    this.jugadorActual = null;
    this.teclaPresionada = false;
    this.radioRango = 80; // Radio en píxeles para estar "cerca" del cartel
    
    // Configurar el listener para la tecla E
    this.keyListener = (event) => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.E) {
        if (this.jugadorEnRango && !this.teclaPresionada) {
          this.teclaPresionada = true;
          console.log("Tecla E presionada - Mostrando información del cartel:", this.contenido);
          this.mostrarInformacion();
        }
      }
    };
    
    this.keyUpListener = (event) => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.E) {
        this.teclaPresionada = false;
      }
    };
    
    // Añadir los listeners de teclado
    this.scene.input.keyboard.on('keydown', this.keyListener);
    this.scene.input.keyboard.on('keyup', this.keyUpListener);
    
    // Indicador visual de interacción (visible solo cuando el jugador está cerca)
    this.indicadorInteraccion = this.scene.add.text(this.x, this.y - 40, 'Presiona E', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    this.indicadorInteraccion.setDepth(100);
    this.indicadorInteraccion.setOrigin(0.5);
    this.indicadorInteraccion.setVisible(false);
    
    // Iniciar detección de proximidad
    this.iniciarDeteccionProximidad();
  }
  
  /**
   * Inicializa la detección de proximidad del jugador
   */
  iniciarDeteccionProximidad() {
    this.scene.time.addEvent({
      delay: 100, // Aumentar la frecuencia de verificación a 50ms para mayor precisión
      callback: this.verificarProximidad,
      callbackScope: this,
      loop: true
    });
  }
  
  /**
   * Verifica si el jugador está cerca y puede interactuar con el cartel
   */
  verificarProximidad() {
    // Obtener referencia al jugador (asumiendo que el jugador está accesible como scene.player)
    const player = this.scene.player;
    
    if (!player) return;
    
    // Calcular la distancia entre el jugador y el cartel
    const distancia = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    
    // Si el jugador está en rango de interacción
    if (distancia <= this.radioRango) {
      // Si no estaba en rango antes, mostrar indicador
      if (!this.jugadorEnRango) {
        this.jugadorEnRango = true;
        this.jugadorActual = player;
        this.mostrarIndicadorInteraccion(true);
        console.log("Jugador entró en rango del cartel:", this.contenido, "Distancia:", distancia);
      }
    } else if (this.jugadorEnRango) {
      // El jugador salió del rango
      this.jugadorEnRango = false;
      this.jugadorActual = null;
      this.mostrarIndicadorInteraccion(false);
      console.log("Jugador salió del rango del cartel, Distancia:", distancia);
    }
  }
  
  /**
   * Muestra u oculta el indicador de interacción
   * @param {boolean} mostrar - Si se debe mostrar el indicador
   */
  mostrarIndicadorInteraccion(mostrar) {
    if (mostrar) {
      // Asegurar que el indicador esté siempre visible encima del cartel
      this.indicadorInteraccion.setPosition(this.x, this.y - 50);
      this.indicadorInteraccion.setVisible(true);
      this.indicadorInteraccion.setAlpha(1); // Asegurar que sea completamente visible
      
      // Detener cualquier tween anterior
      this.scene.tweens.killTweensOf(this.indicadorInteraccion);
      
      // Añadir efecto de rebote al indicador
      this.scene.tweens.add({
        targets: this.indicadorInteraccion,
        y: this.y - 60, // Mayor distancia para que sea más visible
        alpha: 0.8, // Hacerlo parpadear ligeramente
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      /* Debug: Dibujar un círculo para visualizar el rango de interacción
      if (this.debugCircle) this.debugCircle.destroy();
      this.debugCircle = this.scene.add.circle(this.x, this.y, this.radioRango, 0x00ff00, 0.2);
      this.debugCircle.setDepth(1);
      */
    } else {
      this.indicadorInteraccion.setVisible(false);
      this.scene.tweens.killTweensOf(this.indicadorInteraccion);
      
      // Eliminar el círculo de debug
      if (this.debugCircle) {
        this.debugCircle.destroy();
        this.debugCircle = null;
      }
    }
  }
  
  /**
   * Obtiene el mensaje adecuado según el tipo de contenido del cartel
   */
  getMensajePorContenido() {
    if (!this.contenido) return this.mensaje;
    
    switch (this.contenido.toLowerCase()) {
      case 'escopeta':
        return 'Has desbloqueado la ESCOPETA. Este arma causa un gran daño a corta distancia pero tiene un tiempo de recarga considerable.';
      case 'doblesalto':
        return 'Has desbloqueado el DOBLE SALTO. Ahora puedes pulsar ESPACIO en el aire para realizar un segundo salto.';
      case 'jetpack':
        return 'Has desbloqueado el JETPACK. Pulsa y mantén W en el aire para elevarte durante un breve periodo de tiempo.';
      case 'escudo':
        return 'Has desbloqueado el ESCUDO. Pulsa 1 para activarlo y protegerte de los ataques enemigos.';
      case 'armaexplosiva':
        return 'Has desbloqueado el ARMA EXPLOSIVA. Este arma causa daño en área pero consume más munición.';
      case 'agacharse':
        return 'Has desbloqueado el AGACHARSE. Pulsa S para agacharte y así reducir tu altura. Y si te agachas sprintando?';
      case 'paracaidas':
        return 'Has desbloqueado el PARACAIDAS. Pulsa S en el aire para abrir tu paracaidas y disminuir tu velocidad de caída.';
      default:
        return this.mensaje;
    }
  }
  
  /**
   * Muestra la información del cartel o item desbloqueado
   */
  mostrarInformacion() {
    console.log("Mostrando información del cartel:", this.contenido);
    
    // Guardar estado del jugador y detenerlo
    if (this.jugadorActual && this.jugadorActual.body) {
      // Detener al jugador
      this.jugadorActual.body.setVelocity(0, 0);
      
      // Intentar diferentes formas de deshabilitar el control del jugador
      if (typeof this.jugadorActual.disableControls === 'function') {
        this.jugadorActual.disableControls();
      } else {
        // Establecer propiedades que podrían controlar el movimiento
        this.jugadorActual.inputDisabled = true;
        this.jugadorActual.controlsEnabled = false;
        this.jugadorActual._controlsEnabled = false;
      }
    }
    
    // Configuración del panel
    const panelWidth = 400;
    const panelHeight = 200;
    
    // Obtener dimensiones de la pantalla
    const { width: screenWidth, height: screenHeight } = this.scene.cameras.main;
    
    // Crear un rectángulo de fondo para toda la pantalla con opacidad
    const fullScreenBg = this.scene.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000,
      0.7
    );
    fullScreenBg.setDepth(9998);
    fullScreenBg.setScrollFactor(0);
    
    // Crear el panel principal (centrado)
    const panelBg = this.scene.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      panelWidth,
      panelHeight,
      0x333333,
      0.9
    );
    panelBg.setDepth(9999);
    panelBg.setScrollFactor(0);
    panelBg.setStrokeStyle(3, 0xFFFFFF, 1);
    
    // Título del panel
    let titulo = 'Información';
    if (this.contenido) {
      titulo = `¡${this.contenido.toUpperCase()} Desbloqueado!`;
    }
    
    const textoTitulo = this.scene.add.text(
      screenWidth / 2, 
      screenHeight / 2 - 70, 
      titulo, 
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { color: '#000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
      }
    );
    textoTitulo.setOrigin(0.5);
    textoTitulo.setDepth(10000);
    textoTitulo.setScrollFactor(0);
    
    // Contenido del panel
    const textoContenido = this.scene.add.text(
      screenWidth / 2, 
      screenHeight / 2, 
      this.getMensajePorContenido(), 
      {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: panelWidth - 60 },
        stroke: '#000000',
        strokeThickness: 2,
        lineSpacing: 5
      }
    );
    textoContenido.setOrigin(0.5, 0.5);
    textoContenido.setDepth(10000);
    textoContenido.setScrollFactor(0);
    
    // Texto para cerrar
    const textoCerrar = this.scene.add.text(
      screenWidth / 2, 
      screenHeight / 2 + 70, 
      'Presiona E para cerrar', 
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffcc00',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    textoCerrar.setOrigin(0.5);
    textoCerrar.setDepth(10000);
    textoCerrar.setScrollFactor(0);
    
    // Agregar todos los elementos a un grupo
    const panelElements = [fullScreenBg, panelBg, textoTitulo, textoContenido, textoCerrar];
    
    // Desactivar el detector original de tecla E
    this.scene.input.keyboard.off('keydown', this.keyListener);
    
    // Flag para prevenir que se cierre múltiples veces
    let panelCerrado = false;
    
    // Función para cerrar el panel
    const cerrarPanel = () => {
      if (panelCerrado) return;
      
      console.log("Cerrando panel...");
      panelCerrado = true;
      
      // Eliminar elementos del panel
      panelElements.forEach(element => element.destroy());
      
      // Restaurar controles del jugador
      if (this.jugadorActual) {
        if (typeof this.jugadorActual.enableControls === 'function') {
          this.jugadorActual.enableControls();
        } else {
          this.jugadorActual.inputDisabled = false;
          this.jugadorActual.controlsEnabled = true;
          this.jugadorActual._controlsEnabled = true;
        }
      }
      
      // Restaurar el detector original de tecla E
      this.scene.input.keyboard.on('keydown', this.keyListener);
      
      console.log("Panel cerrado, controles restaurados");
    };
    
    // Crear un nuevo listener específico para este panel
    const keyHandler = (event) => {
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.E) {
        console.log("Tecla E detectada para cerrar panel");
        cerrarPanel();
        // Quitar este listener específico
        this.scene.input.keyboard.off('keydown', keyHandler);
      }
    };
    
    // Añadir también un listener para clics que cierre el panel
    const clickHandler = () => {
      console.log("Clic detectado para cerrar panel");
      cerrarPanel();
      this.scene.input.off('pointerdown', clickHandler);
    };
    
    // Hacer el panel interactivo para recibir clics
    fullScreenBg.setInteractive();
    fullScreenBg.on('pointerdown', clickHandler);
    panelBg.setInteractive();
    panelBg.on('pointerdown', clickHandler);
    
    // Registrar los listeners
    this.scene.input.keyboard.on('keydown', keyHandler);
    this.scene.input.on('pointerdown', clickHandler);
    
    // También cerramos el panel después de un tiempo (seguridad)
    this.scene.time.delayedCall(15000, () => {
      if (!panelCerrado) {
        console.log("Cerrando panel automáticamente después de 15 segundos");
        cerrarPanel();
      }
    });
  }
  
  /**
   * Factory method para crear carteles desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir los carteles
   * @param {Phaser.Tilemaps.Tilemap} map - El objeto tilemap
   * @param {string} layerName - El nombre de la capa de objetos en el mapa
   * @returns {Phaser.GameObjects.Group} - Grupo con todos los carteles creados
   */
  static createFromMap(scene, map, layerName) {
    // Crear un grupo para los carteles
    const cartelesGroup = scene.physics.add.group({
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const cartelesLayer = map.getObjectLayer(layerName);
      
      if (cartelesLayer && cartelesLayer.objects) {
        cartelesLayer.objects.forEach(cartel => {
          let contenido = null;
          let mensaje = 'Presiona E para ver información';
          let scale = 1.0;
          
          // Buscar propiedades personalizadas
          if (cartel.properties && Array.isArray(cartel.properties)) {
            // Buscar la propiedad "contenido" dentro del array de propiedades
            const contenidoProperty = cartel.properties.find(prop => prop.name === 'contenido');
            if (contenidoProperty) {
              contenido = contenidoProperty.value;
            }
            
            // Buscar la propiedad "mensaje" dentro del array de propiedades
            const mensajeProperty = cartel.properties.find(prop => prop.name === 'mensaje');
            if (mensajeProperty) {
              mensaje = mensajeProperty.value;
            }
            
            // Buscar la propiedad "escala" dentro del array de propiedades
            const escalaProperty = cartel.properties.find(prop => prop.name === 'escala');
            if (escalaProperty) {
              scale = escalaProperty.value;
            }
          }
          
          // Crear el sprite del cartel
          const cartelSprite = new Cartel(
            scene,
            cartel.x + 16, // Ajustar posición X al centro del objeto
            cartel.y - 16, // Ajustar posición Y al centro del objeto
            contenido,
            mensaje,
            scale
          );
          
          // Añadir el cartel al grupo
          cartelesGroup.add(cartelSprite);
        });
        
        console.log(`Creados ${cartelesLayer.objects.length} carteles desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa`);
      }
    } catch (error) {
      console.error(`Error al crear carteles desde la capa ${layerName}:`, error);
    }
    
    return cartelesGroup;
  }
  
  /**
   * Método que se llama cuando se destruye el cartel
   * @override
   */
  destroy() {
    // Verificar que la escena aún existe y es válida antes de manipular sus propiedades
    if (this.scene && this.scene.input) {
      // Remover los listeners de teclado de forma segura
      try {
        this.scene.input.keyboard.off('keydown', this.keyListener);
        this.scene.input.keyboard.off('keyup', this.keyUpListener);
      } catch (error) {
        console.warn("No se pudieron eliminar correctamente los listeners de teclado", error);
      }
    }
    
    // Destruir el indicador de interacción si existe
    if (this.indicadorInteraccion && this.indicadorInteraccion.destroy) {
      try {
        this.indicadorInteraccion.destroy();
      } catch (error) {
        console.warn("No se pudo destruir el indicador de interacción", error);
      }
    }
    
    // Destruir el círculo de debug si existe
    if (this.debugCircle && this.debugCircle.destroy) {
      try {
        this.debugCircle.destroy();
      } catch (error) {
        console.warn("No se pudo destruir el círculo de debug", error);
      }
    }
    
    // Llamar al método destroy de la clase padre
    try {
      super.destroy();
    } catch (error) {
      console.warn("Error al llamar a super.destroy()", error);
    }
  }
} 
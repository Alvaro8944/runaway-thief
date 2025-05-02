import Phaser from 'phaser';

/**
 * Clase base para gestionar los barriles en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class Barril extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto Barril
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   * @param {string} tipo - Tipo de barril ('Cura', 'explosivo', 'veneno', etc.)
   * @param {number} scale - Escala del barril (opcional)
   */
  constructor(scene, x, y, tipo = 'normal', scale = 1.0) {
    // Determinar la textura según el tipo
    const texture = Barril.getTextureByTipo(tipo);
    
    super(scene, x, y, texture);
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Guardar el tipo de barril
    this.tipo = tipo;
    
    // Establecer escala si es diferente del valor por defecto
    if (scale !== 1.0) {
      this.setScale(scale);
    }
    
    // Configurar el cuerpo físico
    this.body.setSize(32, 32); // Ajustar el hitbox para que sea más preciso
    this.body.setOffset(0, 0); // Ajustar el offset para alinear con el sprite
    this.body.setImmovable(true);
    this.body.allowGravity = false;
    
    // Configurar propiedades basadas en el tipo de barril
    this.configurarPorTipo();
  }
  
  /**
   * Devuelve la clave de textura según el tipo de barril
   * @static
   * @param {string} tipo - Tipo de barril
   * @returns {string} - Clave de la textura
   */
  static getTextureByTipo(tipo) {
    switch (tipo) {
      case 'Cura':
        return 'BarrilCura';
      case 'explosivo':
        return 'BarrilTNT';
      case 'veneno':
        return 'BarrilVeneno';
      case 'impulso':
        return 'BarrilImpulso';
      case 'respawn':
        return 'BarrilNormal';
      default:
        return 'BarrilNormal';
    }
  }
  
  /**
   * Configura las propiedades del barril según su tipo
   * (Método a sobrescribir en las clases derivadas)
   */
  configurarPorTipo() {
    // Este método debe ser sobrescrito por las clases hijas
  }
  
  /**
   * Método para activar el efecto del barril al interactuar con el jugador
   * (Método a sobrescribir en las clases derivadas)
   * @param {Player} player - El jugador que interactúa con el barril
   */
  activarEfecto(player) {
    // Este método debe ser sobrescrito por las clases hijas
    console.log('Método activarEfecto no implementado para este tipo de barril');
  }
  
  /**
   * Factory method para crear barriles desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir los barriles
   * @param {Phaser.Tilemaps.Tilemap} map - El objeto tilemap
   * @param {string} layerName - El nombre de la capa de objetos en el mapa
   * @returns {Phaser.GameObjects.Group} - Grupo con todos los barriles creados
   */
  static createFromMap(scene, map, layerName) {
    // Crear un grupo para los barriles
    const barrilesGroup = scene.physics.add.group({
      immovable: true,
      allowGravity: false
    });
    
    try {
      // Obtener la capa de objetos
      const barrilesLayer = map.getObjectLayer(layerName);
      
      if (barrilesLayer && barrilesLayer.objects) {
        barrilesLayer.objects.forEach(barril => {
          let tipo = 'normal';
          let scale = 1.0;
          
          // Buscar propiedades personalizadas como el tipo
          if (barril.properties && Array.isArray(barril.properties)) {
            // Buscar la propiedad "Tipo" dentro del array de propiedades
            const tipoProperty = barril.properties.find(prop => 
              prop.name === 'tipo' || prop.name === 'Tipo');
            if (tipoProperty) {
              tipo = tipoProperty.value;
            }
          }
          
          // Crear el sprite del barril según su tipo
          let barrilSprite;
          
          switch (tipo.toLowerCase()) {
            case 'cura':
              barrilSprite = new BarrilCura(
                scene,
                barril.x + 16, // Ajustar posición X al centro del objeto
                barril.y - 16  // Ajustar posición Y al centro del objeto
              );
              break;
              
            case 'explosivo':
              barrilSprite = new BarrilExplosivo(
                scene,
                barril.x + 16,
                barril.y - 16
              );
              break;
              
            case 'veneno':
              barrilSprite = new BarrilVeneno(
                scene,
                barril.x + 16,
                barril.y - 16
              );
              break;
              
            case 'impulso':
              barrilSprite = new BarrilImpulso(
                scene,
                barril.x + 16,
                barril.y - 16
              );
              break;
              
            case 'respawn':
              barrilSprite = new BarrilRespawn(
                scene,
                barril.x + 16,
                barril.y - 16
              );
              break;
              
            default:
              barrilSprite = new Barril(
                scene,
                barril.x + 16,
                barril.y - 16,
                'normal',
                scale
              );
              break;
          }
          
          // Añadir el barril al grupo
          if (barrilSprite) {
            barrilesGroup.add(barrilSprite);
          }
        });
        
        console.log(`Creados ${barrilesLayer.objects.length} barriles desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa`);
      }
    } catch (error) {
      console.error(`Error al crear barriles desde la capa ${layerName}:`, error);
    }
    
    return barrilesGroup;
  }
  
  /**
   * Método que se llama cuando se destruye el barril
   * @override
   */
  destroy() {
    // Llamar al método destroy de la clase padre
    super.destroy();
  }
}

/**
 * Clase específica para el barril de curación
 * @extends Barril
 */
export class BarrilCura extends Barril {
  /**
   * Constructor del barril de curación
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'Cura');
    
    // Variables para curación progresiva
    this.jugadorEnRango = false;
    this.jugadorActual = null;
    this.curacionTimer = null;
    this.curacionTotal = 0;
    this.radioRango = 80; // Radio en píxeles para estar "cerca" del barril
    this.tiempoCuracion = 5000; // 5 segundos
    this.intervaloTick = 500; // Tick de curación cada 0.5 segundos
    this.curacionPorTick = 2; // 2 de vida cada tick (20 total en 5 segundos)
    
    // Iniciar detección de proximidad
    this.iniciarDeteccionProximidad();
    
    // Añadir un temporizador de verificación constante
    this.scene.time.addEvent({
      delay: 100, // Verificar cada 100ms
      callback: this.verificarProximidad,
      callbackScope: this,
      loop: true
    });
    
    // Añadir efecto de partículas o brillos para indicar que es un barril de curación
    this.crearEfectosVisuales();
  }
  
  /**
   * Configura las propiedades específicas del barril de curación
   * @override
   */
  configurarPorTipo() {
    this.cantidadCura = 20;
  }
  
  /**
   * Crea efectos visuales para el barril de curación
   */
  crearEfectosVisuales() {
    // Agregar una luz o brillo para indicar que es un barril de curación
    this.light = this.scene.add.pointlight(this.x, this.y, 0x00ff00, 35, 0.07);
    this.light.scrollFactorX = this.scrollFactorX;
    this.light.scrollFactorY = this.scrollFactorY;
    
    // Añadir un efecto de pulso a la luz
    this.lightTween = this.scene.tweens.add({
      targets: this.light,
      intensity: 0,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
  
  /**
   * Inicia la detección de proximidad para los barriles de cura
   */
  iniciarDeteccionProximidad() {
    // Crear un trigger de colisión más grande que el barril para detectar proximidad
    this.triggerZone = this.scene.add.zone(this.x, this.y, this.radioRango * 2, this.radioRango * 2);
    this.scene.physics.world.enable(this.triggerZone);
    this.triggerZone.body.setCircle(this.radioRango);
    this.triggerZone.body.setAllowGravity(false);
    this.triggerZone.body.setImmovable(true);
  }
  
  /**
   * Verifica si el jugador está dentro del rango de curación
   */
  verificarProximidad() {
    if (!this.active) return;
    
    // Obtener el jugador (suponemos que tiene una referencia 'player' en la escena)
    const player = this.scene.player;
    if (!player) return;
    
    // Calcular distancia entre el barril y el jugador
    const distancia = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    
    // Si el jugador está en rango y no estaba antes
    if (distancia <= this.radioRango && !this.jugadorEnRango) {
      this.jugadorEnRango = true;
      this.jugadorActual = player;
      this.iniciarCuracionProgresiva();
      
      // Mostrar indicador visual de que el barril está curando
      this.mostrarIndicadorCuracion(true);
    } 
    // Si el jugador estaba en rango pero ya no lo está
    else if (distancia > this.radioRango && this.jugadorEnRango) {
      this.jugadorEnRango = false;
      this.detenerCuracionProgresiva();
      
      // Ocultar indicador visual
      this.mostrarIndicadorCuracion(false);
    }
  }
  
  /**
   * Muestra u oculta un indicador visual de curación
   * @param {boolean} mostrar - Indica si mostrar u ocultar el indicador
   */
  mostrarIndicadorCuracion(mostrar) {
    if (!this.indicadorCuracion) {
      // Crear el indicador si no existe
      this.indicadorCuracion = this.scene.add.sprite(this.x, this.y - 40, 'BarrilCura');
      this.indicadorCuracion.setScale(0.5);
      this.indicadorCuracion.setAlpha(0.8);
      
      // Añadir animación de pulso
      this.scene.tweens.add({
        targets: this.indicadorCuracion,
        scaleX: 0.6,
        scaleY: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
    
    this.indicadorCuracion.setVisible(mostrar);
  }
  
  /**
   * Inicia el proceso de curación progresiva
   */
  iniciarCuracionProgresiva() {
    
    // Crear temporizador que se repite para la curación progresiva
    this.curacionTimer = this.scene.time.addEvent({
      delay: this.intervaloTick,
      callback: this.aplicarTickCuracion,
      callbackScope: this,
      repeat: Math.floor((this.tiempoCuracion / this.intervaloTick) * (1 - (this.curacionTotal / this.cantidadCura))) - 1
    });
  }
  
  /**
   * Aplica un tick de curación al jugador
   */
  aplicarTickCuracion() {
    if (!this.jugadorEnRango || !this.jugadorActual || !this.jugadorActual.active) {
      this.detenerCuracionProgresiva();
      return;
    }
    
    // Verificar si ya se alcanzó el límite de curación
    if (this.curacionTotal >= this.cantidadCura) {
      this.detenerCuracionProgresiva();
      this.destroy();
      return;
    }
    
    // Calcular cuánto curar en este tick
    const cantidadRestante = this.cantidadCura - this.curacionTotal;
    const cantidadCuracionActual = Math.min(this.curacionPorTick, cantidadRestante);
    
    // Aplicar curación al jugador
    this.jugadorActual.recoverHealth(cantidadCuracionActual);
    this.curacionTotal += cantidadCuracionActual;
    
    // Mostrar partículas o efectos de curación
    this.mostrarEfectoCuracion();
    
    // Si ya curamos la cantidad total, destruir el barril
    if (this.curacionTotal >= this.cantidadCura) {
      this.detenerCuracionProgresiva();
      this.destroy();
    }
  }
  
  /**
   * Muestra partículas o efectos visuales durante la curación
   */
  mostrarEfectoCuracion() {
    // Crear partículas de curación ascendentes
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 20, max: 40 },
        angle: { min: 240, max: 300 },
        scale: { start: 0.6, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        tint: 0x00ff00
      });
      
      // Emitir algunas partículas y luego detener
      emitter.explode(5);
      this.scene.time.delayedCall(100, () => {
        emitter.stop();
      });
    }
  }
  
  /**
   * Detiene el proceso de curación progresiva
   */
  detenerCuracionProgresiva() {
    if (this.curacionTimer) {
      this.curacionTimer.remove();
      this.curacionTimer = null;
    }
    
    this.jugadorEnRango = false;
    this.jugadorActual = null;
  }
  
  /**
   * Activa el efecto del barril de curación (no se usa directamente)
   * @override
   * @param {Player} player - El jugador
   */
  activarEfecto(player) {
  }
  
  /**
   * @override
   */
  destroy() {
    // Detener la curación si está en proceso
    this.detenerCuracionProgresiva();
    
    // Detener y destruir el tween de la luz si existe
    if (this.lightTween) {
      this.lightTween.stop();
      this.lightTween = null;
    }
    
    // Destruir la luz si existe
    if (this.light) {
      this.light.destroy();
      this.light = null;
    }
    
    // Destruir el trigger de colisión si existe
    if (this.triggerZone) {
      this.triggerZone.destroy();
      this.triggerZone = null;
    }
    
    // Destruir el indicador de curación si existe
    if (this.indicadorCuracion) {
      this.indicadorCuracion.destroy();
      this.indicadorCuracion = null;
    }
    
    // Llamar al método destroy de la clase padre
    super.destroy();
  }
}

/**
 * Clase específica para el barril explosivo
 * @extends Barril
 */
export class BarrilExplosivo extends Barril {
  /**
   * Constructor del barril explosivo
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'explosivo');
  }
  
  /**
   * Configura las propiedades específicas del barril explosivo
   * @override
   */
  configurarPorTipo() {
    this.daño = 30;
    this.radioExplosion = 100;
  }
  
  /**
   * Activa el efecto explosivo
   * @override
   * @param {Player} player - El jugador
   */
  activarEfecto(player) {
    // Causar daño al jugador si está en el radio de explosión
    player.takeDamage(this.daño, this);
    
    // Crear efecto de explosión
    this.crearEfectoExplosion();
    
    // Efecto de cámara
    this.scene.cameras.main.shake(200, 0.01);
    
    // Destruir el barril
    this.destroy();
  }
  
  /**
   * Crea un efecto visual de explosión
   */
  crearEfectoExplosion() {
    // Añadir un sprite de explosión o partículas si están disponibles
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 50, max: 200 },
        scale: { start: 1, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        tint: 0xff5500
      });
      
      emitter.explode(20);
    }
  }
}

/**
 * Clase específica para el barril de veneno
 * @extends Barril
 */
export class BarrilVeneno extends Barril {
  /**
   * Constructor del barril de veneno
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'veneno');
  }
  
  /**
   * Configura las propiedades específicas del barril de veneno
   * @override
   */
  configurarPorTipo() {
    this.daño = 15;
    this.duracionVeneno = 5000; // 5 segundos
  }
  
  /**
   * Activa el efecto de veneno
   * @override
   * @param {Player} player - El jugador
   */
  activarEfecto(player) {
    if (player.applyPoison) {
      player.applyPoison(this.daño, this.duracionVeneno);
    } else {
      // Fallback si el método applyPoison no existe
      player.takeDamage(this.daño, this);
    }
    
    // Crear efecto de nube tóxica
    this.crearEfectoVeneno();
    
    // Destruir el barril
    this.destroy();
  }
  
  /**
   * Crea un efecto visual de nube tóxica
   */
  crearEfectoVeneno() {
    // Añadir partículas de veneno si están disponibles
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 10, max: 30 },
        scale: { start: 0.8, end: 0 },
        lifespan: 1200,
        blendMode: 'ADD',
        tint: 0x8800ff
      });
      
      emitter.explode(15);
    }
  }
}

/**
 * Clase específica para el barril de impulso
 * @extends Barril
 */
export class BarrilImpulso extends Barril {
  /**
   * Constructor del barril de impulso
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'impulso');
  }
  
  /**
   * Configura las propiedades específicas del barril de impulso
   * @override
   */
  configurarPorTipo() {
    this.fuerzaImpulso = 400;
  }
  
  /**
   * Activa el efecto de impulso
   * @override
   * @param {Player} player - El jugador
   */
  activarEfecto(player) {
    if (player.applyImpulse) {
      player.applyImpulse(0, -this.fuerzaImpulso); // Impulso hacia arriba
    } else {
      // Fallback si el método applyImpulse no existe
      player.setVelocityY(-this.fuerzaImpulso);
    }
    
    // Crear efecto visual de impulso
    this.crearEfectoImpulso();
    
    // Destruir el barril
    this.destroy();
  }
  
  /**
   * Crea un efecto visual de impulso
   */
  crearEfectoImpulso() {
    // Añadir partículas de impulso si están disponibles
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 30, max: 60 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.7, end: 0 },
        lifespan: 600,
        blendMode: 'ADD',
        tint: 0x0088ff
      });
      
      emitter.explode(15);
    }
  }
}

/**
 * Clase específica para el barril de respawn (punto de control)
 * @extends Barril
 */
export class BarrilRespawn extends Barril {
  /**
   * Constructor del barril de respawn
   * @param {Phaser.Scene} scene - La escena a la que pertenece este barril
   * @param {number} x - Posición X del barril
   * @param {number} y - Posición Y del barril
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'respawn');
    
    // Inicialización de propiedades específicas
    this.activated = false;
    
    // Aplicar un tinte sutil para diferenciar este barril
    this.setTint(0x88ccff);
    
    // Añadir un efecto de brillo alrededor del barril cuando se activa
    this.glowEffect = this.scene.add.sprite(this.x, this.y, 'BarrilNormal');
    this.glowEffect.setVisible(false);
    this.glowEffect.setDepth(this.depth - 1); // Por debajo del barril
    this.glowEffect.setScale(1.2);
    this.glowEffect.setAlpha(0.6);
    this.glowEffect.setTint(0x2299ff);
    
    // Añadir animación de brillo
    this.glowTween = this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: { from: 0.6, to: 0.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      paused: true
    });
    
    // Añadir luz puntual para el barril
    this.light = this.scene.add.pointlight(this.x, this.y, 0x44aaff, 40, 0.05);
    if (this.light) {
      this.light.scrollFactorX = this.scrollFactorX;
      this.light.scrollFactorY = this.scrollFactorY;
      
      // Añadir un efecto de pulso a la luz
      this.lightTween = this.scene.tweens.add({
        targets: this.light,
        intensity: 0.1,
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Crear un pequeño indicador sobre el barril
    this.indicadorCheckpoint = this.scene.add.sprite(this.x, this.y - 30, 'BarrilNormal');
    if (this.indicadorCheckpoint) {
      this.indicadorCheckpoint.setScale(0.4);
      this.indicadorCheckpoint.setAlpha(0.7);
      this.indicadorCheckpoint.setTint(0x44aaff);
      
      // Animar el indicador
      this.scene.tweens.add({
        targets: this.indicadorCheckpoint,
        y: this.y - 35,
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
    }
    
    // Radio de detección para activar el checkpoint (en píxeles)
    this.detectionRadius = 50;
    
    // Efecto de pulso para visualizar el radio de detección
    const pulseCircle = this.scene.add.circle(this.x, this.y, this.detectionRadius, 0x44aaff, 0.1);
    pulseCircle.setDepth(this.depth - 2);
    this.scene.tweens.add({
      targets: pulseCircle,
      scale: 1.2,
      alpha: 0,
      duration: 2000,
      repeat: -1
    });
    
    // Comprobar proximidad del jugador periódicamente
    scene.time.addEvent({
      delay: 200, // Comprobar cada 200ms para mayor precisión
      callback: this.checkPlayerProximity,
      callbackScope: this,
      loop: true
    });
  }
  
  /**
   * Verificar si el jugador está cerca para activar el checkpoint
   */
  checkPlayerProximity() {
    if (this.activated || !this.scene || !this.scene.player) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.scene.player.x, this.scene.player.y
    );
    
    if (distance < this.detectionRadius) {
      this.activar(this.scene.player);
    }
  }
  
  /**
   * Configura las propiedades específicas del barril de respawn
   * @override
   */
  configurarPorTipo() {
    this.setName('barrilRespawn');
    this.body.setImmovable(true);
  }
  
  /**
   * Activa el punto de control
   * @param {Player} player - El jugador que activó el punto de control
   */
  activar(player) {
    if (this.activated) return; // Si ya está activado, no hacer nada
    
    this.activated = true;
    this.glowEffect.setVisible(true);
    
    // Efecto visual de activación más destacado
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 1
    });
    
    // Efecto de ondas en el suelo
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.circle(this.x, this.y, 10 + (i * 15), 0x44aaff, 0.7 - (i * 0.2));
      ring.setDepth(this.depth - 3);
      
      this.scene.tweens.add({
        targets: ring,
        scale: 4,
        alpha: 0,
        duration: 1000 + (i * 200),
        onComplete: () => ring.destroy()
      });
    }
    
    // Iniciar animación de brillo
    if (this.glowTween && !this.glowTween.isPlaying()) {
      this.glowTween.play();
    }
    
    // Aumentar la intensidad de la luz si existe
    if (this.light) {
      this.scene.tweens.add({
        targets: this.light,
        intensity: 0.2,
        radius: 60,
        duration: 500
      });
    }
    
    // Crear efecto de partículas de ascensión
    if (this.scene.particles) {
      const emitter = this.scene.particles.createEmitter({
        x: this.x,
        y: this.y,
        speed: { min: 30, max: 80 },
        angle: { min: 240, max: 300 },
        scale: { start: 0.8, end: 0 },
        lifespan: 1000,
        blendMode: 'ADD',
        tint: 0x44aaff
      });
      
      // Emitir varias partículas y luego detener
      emitter.explode(20);
      this.scene.time.delayedCall(500, () => {
        emitter.stop();
      });
    }
    
    // Guardar la posición como punto de control del jugador
    if (player.setRespawnPoint) {
      player.setRespawnPoint(this.x, this.y);
    } else {
      // Si el método no existe en el jugador, lo añadimos
      player.respawnX = this.x;
      player.respawnY = this.y;
      player.hasRespawnPoint = true;
    }
    
    // Reproducir un sonido
    if (this.scene.sound && this.scene.cache.audio.exists('baseball')) {
      this.scene.sound.play('baseball', { volume: 0.6, detune: -400 }); // Tono más grave para el checkpoint
    }
    
    
    // Mostrar un mensaje destacado
    const text = this.scene.add.text(this.x, this.y - 40, "CHECKPOINT", {
      fontSize: '16px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#0055aa',
      strokeThickness: 4,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Animación para que el texto suba y desaparezca con escala
    this.scene.tweens.add({
      targets: text,
      y: this.y - 80,
      alpha: 0,
      scale: 1.5,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
    
    // Eliminar el indicador, ya no se necesita
    if (this.indicadorCheckpoint) {
      this.scene.tweens.add({
        targets: this.indicadorCheckpoint,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.indicadorCheckpoint.destroy();
          this.indicadorCheckpoint = null;
        }
      });
    }
  }
  
  /**
   * Los métodos activarEfecto y handleCollision ya no son necesarios porque usamos
   * exclusivamente el sistema de proximidad, pero los mantenemos vacíos para compatibilidad
   * con el sistema de colisiones existente
   */
  activarEfecto(player) {

  }
  
  handleCollision(player) {

  }
  
  /**
   * Método que se llama cuando se destruye el barril
   * @override
   */
  destroy() {
    // Detener y destruir el tween de la luz si existe
    if (this.lightTween) {
      this.lightTween.stop();
      this.lightTween = null;
    }
    
    // Destruir la luz si existe
    if (this.light) {
      this.light.destroy();
      this.light = null;
    }
    
    if (this.glowEffect && this.glowEffect.destroy) {
      this.glowEffect.destroy();
      this.glowEffect = null;
    }
    
    if (this.glowTween && this.glowTween.stop) {
      this.glowTween.stop();
      this.glowTween = null;
    }
    
    if (this.indicadorCheckpoint && this.indicadorCheckpoint.destroy) {
      this.indicadorCheckpoint.destroy();
      this.indicadorCheckpoint = null;
    }
    
    super.destroy();
  }
} 
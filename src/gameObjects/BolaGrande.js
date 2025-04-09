import Phaser from 'phaser';

/**
 * Clase para gestionar las bolas de pinchos en el juego
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class BolaGrande extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructor del objeto BolaGrande
   * @param {Phaser.Scene} scene - La escena a la que pertenece esta bola
   * @param {number} x - Posición X de la bola
   * @param {number} y - Posición Y de la bola
   * @param {string} texture - Textura a utilizar para la bola
   * @param {boolean} esDinamica - Si la bola debe caer (true) o permanecer estática (false)
   * @param {number} damage - Daño que causa esta bola al jugador
   */
  constructor(scene, x, y, texture, esDinamica = false, damage = 30) {
    super(scene, x, y, texture);
    
    // Añadir el sprite a la escena
    scene.add.existing(this);
    
    // Habilitar físicas para este sprite
    scene.physics.world.enable(this);
    
    // Configurar el cuerpo físico
    this.body.setCircle(32); // Asumimos que la bola tiene un radio de 16 pixels
    this.body.setOffset(0, 0); // Ajustar según el sprite
    
    // Guardar propiedades
    this.damage = damage;
    this.esDinamica = esDinamica;
    
    // Configurar físicas según si es dinámica o estática
    if (esDinamica) {
      this.body.setImmovable(false);
      this.body.allowGravity = true;
      this.body.setBounce(0.2); // Un pequeño rebote
      this.body.setVelocityY(-50); // Pequeño impulso inicial hacia arriba
      this.body.setCollideWorldBounds(true);
      
      // Animación de giro para bolas dinámicas
      this.scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    } else {
      this.body.setImmovable(true);
      this.body.allowGravity = false;
    }
    
    // Aplicar tinte según nivel de daño para dar feedback visual
    
    if (this.damage > 40) {
      //this.setTint(0xff0000); // Rojo para las muy peligrosas
    } else if (this.damage > 30) {
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
   * Método para actualizar la bola en cada frame
   * @param {number} time - Tiempo actual
   * @param {number} delta - Tiempo transcurrido desde el último frame
   */
  update(time, delta) {
    // Solo las bolas dinámicas necesitan actualizaciones específicas
    if (this.esDinamica) {
      // Si la bola se mueve muy lento horizontalmente, detenerla
      if (Math.abs(this.body.velocity.x) < 10) {
        this.body.setVelocityX(0);
      }
    }
  }
  
  /**
   * Método para lanzar una bola desde una posición específica
   * @param {number} velocityY - Velocidad inicial vertical (negativa para subir)
   * @param {number} velocityX - Velocidad inicial horizontal (opcional)
   */
  lanzar(velocityY = -400, velocityX = 0) {
    if (this.esDinamica) {
      this.body.setVelocity(velocityX, velocityY);
      
      // Sonido de lanzamiento (si existe)
      if (this.scene.sound.get('lanzamiento')) {
        this.scene.sound.get('lanzamiento').play();
      }
    }
  }
  
  /**
   * Factory method para crear bolas desde objetos del mapa
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir las bolas
   * @param {Phaser.Tilemaps.Tilemap} map - El tilemap
   * @param {string} layerName - Nombre de la capa de objetos
   * @param {string} texture - Textura a utilizar para las bolas
   * @returns {Phaser.GameObjects.Group} - Grupo con todas las bolas creadas
   */
  static createFromMap(scene, map, layerName, texture = 'bola_grande') {
    // Crear un grupo para las bolas
    const bolasGroup = scene.physics.add.group({
      classType: BolaGrande
    });
    
    try {
      // Obtener la capa de objetos
      const bolasLayer = map.getObjectLayer(layerName);
      
      if (bolasLayer && bolasLayer.objects && bolasLayer.objects.length > 0) {
        // Como mencionaste que en Tiled la bola son 4 partes por cada bola real,
        // vamos a agrupar los objetos de 4 en 4 según su proximidad
        const objetosAgrupados = this.agruparObjetosCercanos(bolasLayer.objects);
        
        objetosAgrupados.forEach(grupo => {
          // Vamos a usar el primer objeto del grupo como referencia para la posición
          const primerObjeto = grupo[0];
          
          // Verificar si hay propiedades personalizadas
          let esDinamica = false;
          let damage = 30;
          
          if (primerObjeto.properties && Array.isArray(primerObjeto.properties)) {
            // Buscar propiedades
            const dinamicaProp = primerObjeto.properties.find(prop => prop.name === 'dinamica');
            if (dinamicaProp) {
              esDinamica = dinamicaProp.value;
            }
            
            const damageProp = primerObjeto.properties.find(prop => prop.name === 'damage');
            if (damageProp) {
              damage = damageProp.value;
            }
          }
          
          // Crear la bola
          const bola = new BolaGrande(
            scene,
            primerObjeto.x,
            primerObjeto.y,
            texture,
            esDinamica,
            damage
          );
          
          // Si es dinámica y tiene una propiedad de "altura" o "altura_caida", 
          // podemos usarla para determinar desde dónde caerá
          if (esDinamica && primerObjeto.properties) {
            const alturaProp = primerObjeto.properties.find(
              prop => prop.name === 'altura' || prop.name === 'altura_caida'
            );
            
            if (alturaProp) {
              // Colocar la bola a la altura especificada
              bola.y -= alturaProp.value;
            }
          }
          
          // Añadir la bola al grupo
          bolasGroup.add(bola);
        });
        
        console.log(`Creadas ${objetosAgrupados.length} bolas desde la capa ${layerName}`);
      } else {
        console.warn(`No se encontró la capa de objetos ${layerName} en el mapa o está vacía`);
      }
    } catch (error) {
      console.error(`Error al crear bolas desde la capa ${layerName}:`, error);
    }
    
    return bolasGroup;
  }
  
  /**
   * Método auxiliar para agrupar objetos cercanos en Tiled
   * @private
   * @static
   * @param {Array} objetos - Lista de objetos de la capa
   * @returns {Array} - Lista de grupos de objetos cercanos
   */
  static agruparObjetosCercanos(objetos) {
    const grupos = [];
    const objetosRestantes = [...objetos]; // Copia para manipular
    
    // Umbral de distancia para considerar que dos objetos pertenecen a la misma bola
    const umbralDistancia = 32; // Ajustar según el tamaño de los objetos
    
    while (objetosRestantes.length > 0) {
      const grupoActual = [objetosRestantes.shift()]; // Sacar el primer objeto
      
      // Buscar objetos cercanos al grupo actual
      let i = 0;
      while (i < objetosRestantes.length) {
        const obj = objetosRestantes[i];
        
        // Verificar si el objeto está cerca de algún objeto del grupo actual
        let estaCerca = false;
        for (const objGrupo of grupoActual) {
          const distancia = Math.sqrt(
            Math.pow(obj.x - objGrupo.x, 2) + Math.pow(obj.y - objGrupo.y, 2)
          );
          
          if (distancia <= umbralDistancia) {
            estaCerca = true;
            break;
          }
        }
        
        if (estaCerca) {
          // Añadir al grupo actual y quitar de la lista de restantes
          grupoActual.push(obj);
          objetosRestantes.splice(i, 1);
        } else {
          i++;
        }
      }
      
      grupos.push(grupoActual);
    }
    
    return grupos;
  }
  
  /**
   * Método para crear varias bolas dinámicas que caen del cielo
   * @static
   * @param {Phaser.Scene} scene - La escena donde añadir las bolas
   * @param {number} count - Número de bolas a crear
   * @param {string} texture - Textura a utilizar
   * @param {Array} positions - Array de posiciones X donde crear las bolas
   * @returns {Phaser.GameObjects.Group} - Grupo con todas las bolas creadas
   */
  static crearBolasCaidas(scene, count, texture = 'bola_grande', positions = []) {
    // Crear un grupo para las bolas
    const bolasGroup = scene.physics.add.group({
      classType: BolaGrande
    });
    
    // Si no hay posiciones definidas, no crear bolas
    if (!positions || positions.length === 0) {
      console.warn('No hay posiciones definidas para crear bolas');
      return bolasGroup;
    }
    
    // Limitar el número de bolas al número de posiciones disponibles
    const numBolas = Math.min(count, positions.length);
    
    // Mezclar aleatoriamente el array de posiciones
    const posicionesMezcladas = Phaser.Utils.Array.Shuffle([...positions]);
    
    // Crear las bolas en las posiciones especificadas
    for (let i = 0; i < numBolas; i++) {
      // Obtener la posición del punto de spawn
      const pos = posicionesMezcladas[i];
      
      // Altura por defecto si solo se proporcionó la coordenada X
      let x = typeof pos === 'number' ? pos : pos.x;
      let y = typeof pos === 'number' ? -50 : (pos.y || -50);
      
      // Crear la bola en la posición definida (o ligeramente encima)
      const bola = new BolaGrande(scene, x, y, texture, true);
      
      // Añadir al grupo
      bolasGroup.add(bola);
      
      // Lanzar con un retraso aleatorio
      scene.time.delayedCall(Phaser.Math.Between(500, 2000), () => {
        bola.lanzar(Phaser.Math.Between(50, 150), 0); // Sin velocidad horizontal
      });
    }
    
    return bolasGroup;
  }
} 
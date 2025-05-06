import Phaser from 'phaser';
import MenuPrincipal from '../../assets/MenuPrincipal/MenuPpal.png';
import Atras from '../../assets/MenuPrincipal/BotAtras.png';

/**
 * Escena que se muestra cuando el jugador pierde todas sus vidas
 */
export default class GameOverScene extends Phaser.Scene {
  /**
   * Constructor de la escena
   */
  constructor() {
    super({ key: 'GameOverScene' });
    this.currentLevel = 'level'; // Nivel por defecto
  }

  /**
   * Inicialización de la escena con el nivel al que debe volver
   */
  init(data) {
    // Guardar el nivel desde el cual volvemos para poder reiniciar
    this.currentLevel = data.level || 'level';
    console.log(`[GameOverScene] Inicializado para el nivel: ${this.currentLevel}`);
  }

  /**
   * Precarga de assets necesarios
   */
  preload() {
    this.load.image('MenuPpal', MenuPrincipal);
    this.load.image('Atras', Atras);
    
    // Si no existe una imagen de GameOver, cargamos otra como placeholder
    if (!this.textures.exists('GameOver')) {
      this.load.image('GameOver', Atras); // Uso temporal de otra imagen
    }
  }

  /**
   * Creación de la escena
   */
  create() {
    // Fondo del menú
    this.add.image(450, 365, 'MenuPpal').setOrigin(0.5);
    
    // Título Game Over
    this.add.text(450, 250, '¡GAME OVER!', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff0000',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { color: '#000', fill: true, offsetX: 2, offsetY: 2, blur: 4 }
    }).setOrigin(0.5);
    
    // Mensaje informativo
    this.add.text(450, 330, 'Has perdido todas tus vidas.\n¿Quieres volver a intentarlo?', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Botón para volver a jugar
    const playAgainButton = this.add.text(450, 430, 'Volver a Jugar', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#005500',
      padding: {
        x: 20,
        y: 10
      }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    // Botón para regresar al menú principal
    const menuButton = this.add.image(450, 550, 'Atras').setInteractive();
    
    // Eventos para los botones
    playAgainButton.on('pointerover', () => {
      playAgainButton.setTint(0xffff00);
    });
    
    playAgainButton.on('pointerout', () => {
      playAgainButton.clearTint();
    });
    
    playAgainButton.on('pointerdown', () => {
      console.log(`[GameOverScene] Reiniciando nivel: ${this.currentLevel}`);
      
      // Determinar qué escena de boot debe cargar para el nivel
      let bootScene = 'boot';
      
      // Mapear cada nivel a su correspondiente escena de boot
      switch (this.currentLevel) {
        case 'level2':
          bootScene = 'boot2';
          break;
        case 'level3':
          bootScene = 'boot3';
          break;
        case 'level31':
          bootScene = 'boot31';
          break;
        case 'level32':
          bootScene = 'boot32';
          break;
        default:
          bootScene = 'boot';
          break;
      }
      
      console.log(`[GameOverScene] Utilizando la escena de boot: ${bootScene}`);
      
      // Inicializar datos globales si no existen
      if (!this.game.config.gameData) {
        this.game.config.gameData = {};
      }
      
      // Establecer bandera de reinicio para que boot sepa que debe reiniciar el estado del jugador
      this.game.config.gameData.resetPlayerState = true;
      
      // Iniciar la escena de boot correspondiente en lugar del nivel directamente
      this.scene.start(bootScene);
    });
    
    menuButton.on('pointerdown', () => {
      console.log('[GameOverScene] Volviendo al menú principal');
      this.scene.start('MenuScene');
    });
  }
} 
/**
 * Clase para gestionar los datos persistentes del juego entre escenas
 * Mantiene el estado de armas, objetos y munición del jugador cuando cambia de nivel
 */
class GameData {
  constructor() {
    this.reset();
  }
  
  /**
   * Reinicia todos los datos a sus valores predeterminados
   */
  reset() {
    // Datos del jugador
    this.playerHealth = 150;
    this.playerScore = 0;
    this.playerLives = 5; // Número de vidas inicial
    
    // Estado de armas desbloqueadas
    this.unlockedWeapons = {
      none: true,      // Sin arma (estado inicial)
      rifle: false,    // Rifle (arma principal) 
      shotgun: false,  // Escopeta 
      explosive: false // Arma explosiva 
    };
    
    // Arma actual seleccionada
    this.activeWeapon = 'none';
    
    // Munición para cada tipo de arma
    this.weaponAmmo = {
      rifle: 0,
      shotgun: 0,
      explosive: 0
    };
    
    // Objetos desbloqueados
    this.hasUnlockedShield = false;
    this.hasJetpack = false;
    this.hasParacaidas = false;
    this.hasSpeedBoost = false;
    
    // Energía del jetpack
    this.floatingEnergy = 400;
  }
  
  /**
   * Guarda el estado actual del jugador para usarlo en el siguiente nivel
   * @param {Player} player - Objeto del jugador con todos sus datos
   */
  savePlayerState(player) {
    if (!player) return;
    
    // Guardar datos básicos
    this.playerHealth = player.health;
    this.playerScore = player.score;
    this.playerLives = player.lives; // Guardar vidas
    
    // Guardar estado de armas
    this.unlockedWeapons = { ...player.unlockedWeapons };
    this.activeWeapon = player.activeWeapon;
    
    // Guardar munición
    this.weaponAmmo = { ...player.weaponAmmo };
    
    // Guardar objetos desbloqueados
    this.hasUnlockedShield = player.hasUnlockedShield;
    this.hasJetpack = player.hasJetpack;
    this.hasParacaidas = player.hasParacaidas;
    this.hasSpeedBoost = player.hasSpeedBoost;
    
    // Guardar energía jetpack
    this.floatingEnergy = player.floatingEnergy;
    
    console.log('Estado del jugador guardado:', this);
  }
  
  /**
   * Carga el estado guardado en un nuevo objeto jugador
   * @param {Player} player - Objeto jugador al que cargar los datos
   */
  loadPlayerState(player) {
    if (!player) return;
    
    // Cargar datos básicos
    player.health = this.playerHealth;
    player.score = this.playerScore;
    player.lives = this.playerLives; // Cargar vidas
    
    // Cargar estado de armas
    player.unlockedWeapons = { ...this.unlockedWeapons };
    player.activeWeapon = this.activeWeapon;
    
    // Cargar munición
    player.weaponAmmo = { ...this.weaponAmmo };
    
    // Cargar objetos desbloqueados
    player.hasUnlockedShield = this.hasUnlockedShield;
    player.hasJetpack = this.hasJetpack;
    player.hasParacaidas = this.hasParacaidas;
    player.hasSpeedBoost = this.hasSpeedBoost;
    
    // Cargar energía jetpack
    player.floatingEnergy = this.floatingEnergy;
    
    // Actualizar visuales y estado basado en lo que se ha cargado
    player.updateWeaponType();
    
    console.log('Estado del jugador cargado:', this);
  }

  /**
   * Configura el equipamiento predeterminado para el nivel 1
   * Reinicia completamente y no da ningún objeto especial
   */
  setupForLevel1() {
    this.reset(); // Nivel 1 es un reset completo (estado inicial)
  }

  /**
   * Configura el equipamiento predeterminado para el nivel 2
   * Desbloquea objetos y armas que el jugador normalmente tendría al llegar al nivel 2
   */
  setupForLevel2() {
    this.reset(); // Primero reiniciamos
    
    // Armas que normalmente se conseguirían en el nivel 1
    this.unlockedWeapons.rifle = true;  // Rifle (arma básica)
    this.activeWeapon = 'rifle';
    this.weaponAmmo.rifle = 10;         // PLAYER_CONFIG.RIFLE_AMMO = 10
    
    // Otros objetos que normalmente conseguiría en el nivel 1
    this.hasParacaidas = true;
    
    // Ajustar la salud y puntuación para este nivel
    this.playerHealth = 150;            // PLAYER_CONFIG.MAX_HEALTH = 150
    this.playerScore = 250;             // Alguna puntuación base por haber "completado" el nivel 1
    this.playerLives = 5;               // Empezar con todas las vidas
  }

  /**
   * Configura el equipamiento predeterminado para el nivel 3
   * Desbloquea objetos y armas que el jugador normalmente tendría al llegar al nivel 3
   */
  setupForLevel3() {
    this.reset(); // Primero reiniciamos
    
    // Desbloquear todas las armas que se consiguen en niveles 1 y 2
    this.unlockedWeapons.rifle = true;     // Del nivel 1
    this.unlockedWeapons.shotgun = true;   // Del nivel 2
    this.activeWeapon = 'rifle';
    
    // Munición
    this.weaponAmmo.rifle = 10;           // PLAYER_CONFIG.RIFLE_AMMO = 10
    this.weaponAmmo.shotgun = 12;         // PLAYER_CONFIG.SHOTGUN_AMMO = 12
    
    // Objetos que normalmente conseguiría en los niveles anteriores
    this.hasParacaidas = true;        // Del nivel 1
    this.hasJetpack = true;           // Del nivel 2
    this.hasUnlockedShield = true;    // Del nivel 2
    this.hasSpeedBoost = true;        // Velocidad (potencialmente del nivel 2)
    
    // Ajustar la salud y puntuación para este nivel
    this.playerHealth = 150;          // PLAYER_CONFIG.MAX_HEALTH = 150
    this.playerScore = 500;           // Una puntuación base más alta por haber "completado" los niveles anteriores
    this.playerLives = 5;             // Empezar con todas las vidas
  }

  /**
   * Reinicia específicamente el estado del jugador después de un Game Over
   * Restaura la vida y las vidas, pero mantiene los objetos desbloqueados
   */
  resetPlayerState() {
    console.log('[GameData] Reiniciando estado del jugador después de GameOver');
    
    // Reiniciar la salud a su valor máximo
    this.playerHealth = 150; // PLAYER_CONFIG.MAX_HEALTH
    
    // Restaurar el número de vidas al valor inicial
    this.playerLives = 5;
    
    // Reiniciar la munición para todas las armas
    this.weaponAmmo = {
      rifle: this.unlockedWeapons.rifle ? 10 : 0,
      shotgun: this.unlockedWeapons.shotgun ? 12 : 0,
      explosive: this.unlockedWeapons.explosive ? 3 : 0
    };
    
    // Reiniciar la energía del jetpack
    this.floatingEnergy = 400;
    
    console.log('[GameData] Estado del jugador reiniciado', this);
  }
}

// Exportar una única instancia para usar en todo el juego
export const gameData = new GameData();
export default gameData; 
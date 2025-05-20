import MenuPrincipal from '../../assets/MenuPrincipal/MenuPpal.png';
import BackgroudPixelado from '../../assets/MenuPrincipal/backgroundPixelado.jpg';
import Atras from '../../assets/MenuPrincipal/BotAtras.png';
import Ventana from '../../assets/MenuPrincipal/SelNivel.png';
import Nivel1 from '../../assets/MenuPrincipal/BotNiv1.png';
import Nivel2 from '../../assets/MenuPrincipal/BotNiv2.png';
import Nivel3 from '../../assets/MenuPrincipal/BotNiv3.png';
import Bloqueado from '../../assets/MenuPrincipal/BotBloqueado.png';
import Progreso from '../../assets/JSON/Progreso.json' assert { type: 'json' };
import gameData from '../data/GameData';

export default class LevelSelector extends Phaser.Scene {

    constructor(){
      super({key:'LevelSelector'});
    }
    preload(){
       
        this.load.image('MenuPpal',MenuPrincipal );
        this.load.image('Atras',Atras);
        this.load.image('Ventana',Ventana);
        this.load.image('Nivel1',Nivel1);
        this.load.image('Nivel2',Nivel2);
        this.load.image('Nivel3',Nivel3);
        this.load.image('Bloqueado',Bloqueado);
     
     
    }
    create(){



      this.add.image(450,365,'MenuPpal').setOrigin(0.5);

    const VentanaPost=this.add.image(450,400,'Ventana').setInteractive();

   
   
    
    
   console.log(Progreso);
   console.log(Progreso.level1);


      // Texto clicable encima del Nivel 1
    const tutorial1 = this.add.text(450, 280, 'Nivel 1-2 tutorial', {
      fontSize: '18px',
      fill: '#00f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    tutorial1.on('pointerdown', () => {
      window.open('https://youtu.be/O2EISzAshN8', '_blank');
    });


     // Texto clicable encima del Nivel 3
    const tutorial3 = this.add.text(450, 300, 'Boss tutorial', {
      fontSize: '18px',
      fill: '#00f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    tutorial3.on('pointerdown', () => {
      window.open('https://youtu.be/ShYPd-o6oZs', '_blank');
    });


    if(Progreso.level1){
    const JNiv1=this.add.image(450,350,'Nivel1').setInteractive();
    JNiv1.on('pointerdown',()=>{
      gameData.setupForLevel1();
      this.scene.start('boot');
    });

    }else{
      this.add.image(450,350,'Bloqueado');
    }
    console.log(Progreso.level2);
    if(Progreso.level2){
      const JNiv2=this.add.image(450,425,'Nivel2').setInteractive();
    JNiv2.on('pointerdown',()=>{
      gameData.setupForLevel2();
      gameData.reset();
      this.scene.start('boot2');
    });
    
    }else{
      this.add.image(450,425,'Bloqueado');
    }
    if(Progreso.level3){
    const JNiv3=this.add.image(450,500,'Nivel3').setInteractive();
    JNiv3.on('pointerdown',()=>{
      gameData.setupForLevel3();
      this.scene.start('boot3');
    });

    }
    else{
      this.add.image(450,500,'Bloqueado');
    }


    const Regresar=this.add.image(450,560,'Atras').setInteractive();
    Regresar.on('pointerdown',()=>this.scene.start('MenuScene'));




    }




}
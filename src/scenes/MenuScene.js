import Backgroud from '../../assets/MenuPrincipal/background.png';
import MenuPrincipal from '../../assets/MenuPrincipal/MenuPpal.png';
import BackgroudPixelado from '../../assets/MenuPrincipal/backgroundPixelado.jpg';
import Logo from '../../assets/MenuPrincipal/logotiporunawaythief.png';
import Jugar from '../../assets/MenuPrincipal/Jugar.png'
import ComoJugar from '../../assets/MenuPrincipal/Tutorial.png'
import Phaser from 'phaser';
import Jugar2 from '../../assets/MenuPrincipal/BotJugar.png'
import Jugar3 from '../../assets/MenuPrincipal/BotJugarPressed.png'
import Tutorial from '../../assets/MenuPrincipal/BotTutorial.png'
import Atras from '../../assets/MenuPrincipal/Jugar.png'
//import ComoJugar from '../../assets/MenuPrincipal/Tutorial.png'
export default class MenuScene extends Phaser.Scene {

    constructor(){
      super({key:'MenuScene'});
    }
    preload(){
       
        this.load.image('MenuPpal',MenuPrincipal );
        this.load.image('Jugar2',Jugar2);
        this.load.image('Jugar3',Jugar3);
        this.load.image('Tutorial',Tutorial);
    }
    create(){

    this.add.image(450,365,'MenuPpal').setOrigin(0.5);
    
    /*
    this.add.text(400,100,'Runaway Thief',{
        fontSize: '48px',
        color: '#ffffff'
    }).setOrigin(0.5);
    */
    const Start=this.add.image(100,700,'Jugar2').setInteractive();
    const Jugar=this.add.image(800,700,'Tutorial').setInteractive();



    

    Start.on('pointerdown',()=>this.scene.start('LevelSelector'));
    Jugar.on('pointerdown',()=>this.scene.start('HowToPlay'));

    }




}
import Backgroud from '../../assets/MenuPrincipal/background.png';
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
       
        this.load.image('backgroundPixelado',BackgroudPixelado );
        this.load.image('Jugar2',Jugar2);
        this.load.image('Jugar3',Jugar3);
        this.load.image('Tutorial',Tutorial);
        this.load.image('Logo',Logo);
    }
    create(){

    this.add.image(400,300,'backgroundPixelado').setOrigin(0.5);
    
    /*
    this.add.text(400,100,'Runaway Thief',{
        fontSize: '48px',
        color: '#ffffff'
    }).setOrigin(0.5);
    */
    const VerLogo=this.add.image(600,100,'Logo').setInteractive();
    const Start=this.add.image(100,700,'Jugar2').setInteractive();
    const Jugar=this.add.image(800,700,'Tutorial').setInteractive();



    

    Start.on('pointerdown',()=>this.scene.start('boot'));
    Jugar.on('pointerdown',()=>this.scene.start('HowToPlay'));

    }




}
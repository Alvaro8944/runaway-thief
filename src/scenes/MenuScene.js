import Backgroud from '../../assets/MenuPrincipal/background.png';
import Jugar from '../../assets/MenuPrincipal/Jugar.png'
import ComoJugar from '../../assets/MenuPrincipal/Tutorial.png'
import Phaser from 'phaser';
export default class MenuScene extends Phaser.Scene {

    constructor(){
      super({key:'MenuScene'});
    }
    preload(){
       
        this.load.image('background',Backgroud );
        this.load.image('Jugar',Jugar);
        this.load.image('ComoJugar',ComoJugar);
    }
    create(){

    this.add.image(400,300,'background').setOrigin(0.5);
      
    this.add.text(400,100,'Runaway Thief',{
        fontSize: '48px',
        color: '#ffffff'
    }).setOrigin(0.5);
    const Start=this.add.image(400,300,'Jugar').setInteractive();
    const Jugar=this.add.image(400,350,'ComoJugar').setInteractive();

    





    

    Start.on('pointerdown',()=>this.scene.start('boot'));
    Jugar.on('pointerdown',()=>this.scene.start('HowToPlay'));

    }




}
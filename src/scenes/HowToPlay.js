import BackgroudPixelado from '../../assets/MenuPrincipal/backgroundPixelado.jpg';
import Atras from '../../assets/MenuPrincipal/BotAtras.png';
import Guia from '../../assets/MenuPrincipal/ComoJugar.png';

export default class HowToPlay extends Phaser.Scene {

    constructor(){
      super({key:'HowToPlay'});
    }
    preload(){
       
        this.load.image('backgroundPixelado',BackgroudPixelado);
        this.load.image('Atras',Atras);
        this.load.image('Guia',Guia);
     
    }
    create(){



    this.add.image(400,300,'backgroundPixelado').setOrigin(0.5);

    const GuiaPost=this.add.image(700,300,'Guia').setInteractive();

    const Regresar=this.add.image(700,450,'Atras').setInteractive();
    Regresar.on('pointerdown',()=>this.scene.start('MenuScene'));




    }




}
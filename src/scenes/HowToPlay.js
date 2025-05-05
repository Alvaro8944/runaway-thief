import BackgroudPixelado from '../../assets/MenuPrincipal/backgroundPixelado.jpg';
import MenuPrincipal from '../../assets/MenuPrincipal/MenuPpal.png';
import Atras from '../../assets/MenuPrincipal/BotAtras.png';
import Guia from '../../assets/MenuPrincipal/ComoJugar.png';

export default class HowToPlay extends Phaser.Scene {

    constructor(){
      super({key:'HowToPlay'});
    }
    preload(){
       
        this.load.image('MenuPpal',MenuPrincipal );
        this.load.image('Atras',Atras);
        this.load.image('Guia',Guia);
     
    }
    create(){



      this.add.image(450,365,'MenuPpal').setOrigin(0.5);

    const GuiaPost=this.add.image(450,400,'Guia').setInteractive();

    const Regresar=this.add.image(450,550,'Atras').setInteractive();
    Regresar.on('pointerdown',()=>this.scene.start('MenuScene'));




    }




}
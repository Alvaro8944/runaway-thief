import BackgroudPixelado from '../../assets/MenuPrincipal/backgroundPixelado.jpg';
import Atras from '../../assets/MenuPrincipal/BotAtras.png';
import Ventana from '../../assets/MenuPrincipal/SelNivel.png';
import Nivel1 from '../../assets/MenuPrincipal/BotNiv1.png';
import Nivel2 from '../../assets/MenuPrincipal/BotNiv2.png';
import Nivel3 from '../../assets/MenuPrincipal/BotNiv3.png';

export default class LevelSelector extends Phaser.Scene {

    constructor(){
      super({key:'LevelSelector'});
    }
    preload(){
       
        this.load.image('backgroundPixelado',BackgroudPixelado);
        this.load.image('Atras',Atras);
        this.load.image('Ventana',Ventana);
        this.load.image('Nivel1',Nivel1);
        this.load.image('Nivel2',Nivel2);
        this.load.image('Nivel3',Nivel3);
     
    }
    create(){



    this.add.image(400,300,'backgroundPixelado').setOrigin(0.5);

    const VentanaPost=this.add.image(700,300,'Ventana').setInteractive();

    const JNiv1=this.add.image(700,200,'Nivel1').setInteractive();
    const JNiv2=this.add.image(700,275,'Nivel2').setInteractive();
    const JNiv3=this.add.image(700,350,'Nivel3').setInteractive();

    JNiv1.on('pointerdown',()=>this.scene.start('boot'));
    JNiv2.on('pointerdown',()=>this.scene.start('boot'));
    JNiv3.on('pointerdown',()=>this.scene.start('boot'));

    const Regresar=this.add.image(700,450,'Atras').setInteractive();
    Regresar.on('pointerdown',()=>this.scene.start('MenuScene'));




    }




}
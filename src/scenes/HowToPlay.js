import Backgroud from '../../assets/MenuPrincipal/background.png';
import Regresar from '../../assets/MenuPrincipal/Regresar.png';

export default class HowToPlay extends Phaser.Scene {

    constructor(){
      super({key:'HowToPlay'});
    }
    preload(){
       
        this.load.image('background',Backgroud);
        this.load.image('Regresar',Regresar);
     
    }
    create(){



    this.add.image(400,300,'background').setOrigin(0.5);
      
    this.add.text(400,100,'Runaway Thief',{
        fontSize: '48px',
        color: '#000000'
    }).setOrigin(0.5);
    this.add.text(400,150,'¿Como jugar?',{
        fontSize: '48px',
        color: '#000000'
    }).setOrigin(0.5);

    this.add.text(400,200,'Teclas de movimiento: A (ir a la izquierda) y D (ir a la derecha)',{
        fontSize: '16px',
        color: '#000000'
    }).setOrigin(0.5);
    this.add.text(400,220,'Tecla de salto: Espacio',{
        fontSize: '16px',
        color: '#000000'
    }).setOrigin(0.5);
    this.add.text(400,240,'Disparos: x(sacar el arma) y click derecho(disparar)',{
        fontSize: '16px',
        color: '#000000'
    }).setOrigin(0.5);

    this.add.text(400,260,'Jetpack: w',{
        fontSize: '16px',
        color: '#000000'
    }).setOrigin(0.5);
    this.add.text(400,280,'Paracaidas: s(en el aire)',{
        fontSize: '16px',
        color: '#000000'
    }).setOrigin(0.5);
    const Regresar=this.add.image(400,320,'Regresar').setInteractive();
    Regresar.on('pointerdown',()=>this.scene.start('MenuScene'));




    }




}
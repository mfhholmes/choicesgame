"use strict";

var game = new Phaser.Game(800,600,Phaser.AUTO,"container",{preload:preload,create:create,update:update});

function preload(){
  // use g.load() to load up game assets
  game.load.spritesheet('player', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);
  game.load.image('background','assets/backgrounds/background.png');
  game.load.image('popup','assets/popupbackground.png');
}

var player;
var FLOOR = 575;
var anim;
var cursors;
var jumpButton;
var background;
var debugtext;

var popup = false;
var popupbox;
var popuptext;

var textstyle = {font:"25px Arial",fill:"black"};

var answertext = [];
var currentChoice=0;
var choicekeys = [];
var choices = [];

var IDLE = 0;
var LEFT = 1;
var RIGHT = 2;
var facing = IDLE;

function create(){
  // add physics!
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // create the background
  background = game.add.tileSprite(0,0,800,600,'background');

  // add the player
  player = game.add.sprite(64,FLOOR,"player",1);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.scale.set(4);
  player.anchor.setTo(0.5,1);
  player.smoothed = false;
  anim = player.animations.add('walk');
  game.camera.follow(player);

  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.ZERO));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.ONE));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.TWO));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.THREE));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.FOUR));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.FIVE));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.SIX));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.SEVEN));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.EIGHT));
  choicekeys.push(game.input.keyboard.addKey(Phaser.Keyboard.NINE));

  //choices
  choices=[
    {trigger:200,text:"choose something!",key:"first",done:false,options:
      [{index:1,text:"choice 1"},{index:2,text:"choice 2"},{index:3,text:"choice 3"}]
    },
    {trigger:400,text:"choose something again!",key:"first",done:false,options:
      [{index:1,text:"choice 1"},{index:2,text:"choice 2"},{index:3,text:"choice 3"}]
    }
  ];
  debugtext = game.add.text(32,32,"player position:"+player.x,{fill:"white"});

  popupbox = game.add.sprite(game.world.centerX,game.world.centerY,"popup");
  popupbox.alpha = 0;
  popupbox.anchor.set(0.5,0.5);
}

function update(){
  //handle keyboard input
  player.body.velocity.x = 0;
  debugtext.text = "player position: "+player.x;
  if(!popup){
    playerMovement();
    //have we triggered a choice?
    choices.forEach(function(c){
      if(!c.done && Math.abs(c.trigger - player.x)<10){
        pop(c);
      }
    });
  }
}

function pop(choice){
  popup = true;
  var popuptween =game.add.tween(popupbox).to({alpha:1},100,Phaser.Easing.Linear.None,true);
  //add selection title text
  popuptext = game.add.text(20-popupbox.width/2,20-popupbox.height/2,choice.text,textstyle);
  popuptext.anchor.set(0,0);
  popupbox.addChild(popuptext);
  //add answer text
  answertext = [];
  choice.options.forEach(function(o,i){
    var t = game.add.text(20-popupbox.width/2,20+(50*o.index)-popupbox.height/2,o.text,textstyle);
    answertext.push(t);
    t.anchor.set(0,0);
    popupbox.addChild(t);
    choicekeys[o.index].onDown.add(function(){
      currentChoice=o.index;
      menuChoice(choice,o.index);
    });
  });
  currentChoice=0;
  choice.done = false;
}

function popdown(){
  popup = false;
  var popdowntween = game.add.tween(popupbox).to({alpha:0},100,"Linear",true);
  popupbox.removeChildren();
}

function menuChoice(choice,index){
  choice.done = true;
  choice.selection = index;
  debugtext.text = currentChoice;
  popdown();
}

function playerMovement(){
  //only handle player movement if popup is down
  if (cursors.left.isDown)
  {
    player.body.velocity.x = -150;
    if (facing != LEFT)
    {
      facing = LEFT;
      player.scale.x =-4;
    }
    player.animations.play('walk');
    background.tilePosition.x +=6;
  }
  else if (cursors.right.isDown)
  {
    player.body.velocity.x = 150;
    if (facing != RIGHT)
    {
      facing = RIGHT;
      player.scale.x =4;
    }
    player.animations.play('walk');
    background.tilePosition.x -=6;
  }
  else
  {
    if (facing != IDLE){
      player.animations.stop();
      if (facing == 'left')
      {
        player.frame = 0;
      }
      else
      {
        player.frame = 5;
      }
      facing = IDLE;
    }
  }
}

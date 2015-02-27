"use strict";

var game = new Phaser.Game(800,600,Phaser.AUTO,"container",{preload:preload,create:create,update:update});

function preload(){
  // use g.load() to load up game assets
  game.load.spritesheet('mummy', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);
  game.load.spritesheet('player', 'assets/sprites/hom/homwalk2.png', 103,200,50);
  game.load.spritesheet('guard','assets/sprites/guard196x180.png',196,180,50);
  game.load.image('background','assets/backgrounds/dungeon_scene_small.png');
  game.load.image('popup','assets/popupbackground.png');
  game.load.audio('victory', ['assets/choices_feast_song.mp3','assets/choices_feast_song.ogg']);
}

var player;
var player_walk;
var guard;
var guard_snore;
var cursors;
var jumpButton;
var background;
var debugtext;

var music;

var popup = false;
var popupbox;
var popuptext;

var textstyle = {font:"25px Arial",fill:"black"};

var answertext = [];
var currentChoice=0;
var choicekeys = [];

var IDLE = 0;
var LEFT = 1;
var RIGHT = 2;
var FLOOR = 500;
var PLAYER_SCALE = 1;
var GUARD_SCALE= 1;
var VELOCITY = 120;
var BACKGROUND_MOVE_SPEED = 1.8;
var facing = IDLE;

function create(){
  // add physics!
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // create the background
  background = game.add.sprite(0,100,'background');

  // add the player
  player = game.add.sprite(64,FLOOR,"player",1);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.scale.set(PLAYER_SCALE);
  player.anchor.setTo(0.5,1);
  player.smoothed = false;
  player_walk = player.animations.add('walk');
  game.camera.follow(player);

  // add the guard
  guard = game.add.sprite(1000,FLOOR,"guard",1);
  game.physics.enable(guard,Phaser.Physics.ARCADE);
  guard.scale.set(GUARD_SCALE);
  guard.anchor.setTo(0.5,1);
  guard.smoothed = true;
  guard_snore = guard.animations.add("snore");
  guard_snore.play();


  // input
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

  debugtext = game.add.text(32,32,"player position:"+player.x,{fill:"white"});

  popupbox = game.add.sprite(game.world.centerX,game.world.centerY,"popup");
  popupbox.alpha = 0;
  popupbox.anchor.set(0.5,0.5);

  music = game.add.audio('victory');
  music.play();
}

function update(){
  //handle keyboard input
  player.body.velocity.x = 0;
  debugtext.text = "player position: "+player.x + "\ncamera position: "+game.camera.x;
  if(!popup){
    playerMovement();
    //have we triggered a choice?
    choices.forEach(function(c){
      if(!c.done && Math.abs(c.trigger - playerPos())<10){
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
    var t = game.add.text(20-popupbox.width/2,20+(50*o.index)-popupbox.height/2,o.index + ": " +o.text,textstyle);
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
  if (cursors.left.isDown) {
    if( (player.x + player.width/2) > 0){
      player.body.velocity.x = -1 * VELOCITY;
    } else {
      player.body.velocity.x = 0;
    }
    if (facing != LEFT){
      facing = LEFT;
      player.scale.x =PLAYER_SCALE*-1;
    }
    player.animations.play('walk');
    if(background.x<1){
      background.x +=BACKGROUND_MOVE_SPEED;
      guard.x += BACKGROUND_MOVE_SPEED;
    }
//    if(game.camera.x > 0){
//      game.camera.x -= BACKGROUND_MOVE_SPEED;
//    }
  }
  else if (cursors.right.isDown){
    if(player.x + player.width/2 < game.world.width){
      player.body.velocity.x = VELOCITY;
    }else{
      player.body.velocity.x = 0;
    }
    if (facing != RIGHT){
      facing = RIGHT;
      player.scale.x =PLAYER_SCALE;
    }
    player.animations.play('walk');
    if(background.x > 0-(background.width-800)){
      background.x -=BACKGROUND_MOVE_SPEED;
      guard.x -= BACKGROUND_MOVE_SPEED;
    }
//    if(game.camera.x < (background.width - game.camera.Width)){
//      game.camera.x += BACKGROUND_MOVE_SPEED;
//    }
  }
  else
  {
    if (facing != IDLE){
      player.animations.stop();
//      if (facing == 'left'){
//        player.frame = 0;
//      }else{
//        player.frame = 5;
//      }
      facing = IDLE;
    }
  }
}
function playerPos(){
  return player.x - background.x;
}

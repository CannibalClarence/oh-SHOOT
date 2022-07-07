// ---------- SET UP -------------
var bestScore = document.getElementById("bestScore"); //link to span item in main page

var scoreHigh //variable to save highest score

const SAVE_KEY_SCORE = "highscore"; // save key for local storage of high score

var scoreStr = localStorage.getItem(SAVE_KEY_SCORE);



//keyboard constants
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_SPACE = 32;


//create GAME CLASS as an instance

function Game(){
    this.config = {

        //game width and height
        gameWidth: 400,
        gameHeight: 300,
        fps: 50,
        debugMode: false,

        //level and point system
        levelDifficultyMultiplier: 0.5,
        pointsPerInvader: 5,
        limitLevelIncrease: 25,

        //the speed and rate of the bombs
        bombRate: 0.05,
        bombMinVelocity: 50,
        bombMaxVelocity: 50,

        //invader speed
        invaderInitialVelocity: 15,
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,
        rocketMaxFireRate: 2,

        //invader count
        invaderRanks: 4,
        invaderFiles: 10,
        shipSpeed: 120,
    }

    //  start game with 3 lives, 0 score, and level 1
    this.lives = 3;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 0;
    this.level = 1;

    //  The state stack.
    this.stateStack = [];

    //  Input/output
    this.pressedKeys = {}; //save pressed keys in an array
    this.gameCanvas =  null;


    //  The previous x position, used for touch.
    this.previousX = 0;
}

//SOUND VARIABLES
var shoot = new Audio('../sounds/shoot.mp3');
var bangs = new Audio('../sounds/bang.mp3');
var explosion = new Audio('../sounds/explosion.mp3');

const allSounds = document.querySelectorAll("audio");
var isMuted = false;

//MUTE FUNCTION
document.addEventListener("keydown", event => {
    if (event.key === "m") {
       if (isMuted === true){
        isMuted = false;
        return;
       }
       isMuted = true;
    }
});

// INITIALIZING THE GAME WITH THE HEIGHT AND WIDTH BASED ON VALUE INPUT IN INDEX.HTML SCRIPT SECTION
Game.prototype.initialise = function(gameCanvas) {

    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2,
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };

    
};

function Ship(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 16;
}


function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}


function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}
 

function Invader(x, y, rank, file, type) {
    this.x = x;
    this.y = y;
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.width = 18;
    this.height = 14;
}


// -------- ALL GAME STATES ----------

function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}


//RETURN CURRENT STATE
Game.prototype.currentState = function() {
    //condition to test ? value if true : value if false

    //IF we state array is more than 0 (aka we been playin), then return current state OTHERWISE null
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};


//MOVE BETWEEN STATES 
Game.prototype.moveToState = function(state) {
 
    //  If we are in a state, leave it.
    if(this.currentState() && this.currentState().leave) {
      this.currentState().leave(game);
      this.stateStack.pop();
    }
    
    //  If there's an enter function for the new state, call it.
    if(state.enter) {
      state.enter(game);
    }
  
    //  Set the current state.
    this.stateStack.pop();
    this.stateStack.push(state);
};


//PUSH STATE
Game.prototype.pushState = function(state) {

    //  If there's an enter function for the new state, call it.
    if(state.enter) {
        state.enter(game);
    }
    //  Set the current state.
    this.stateStack.push(state);
};


//POP STATE
Game.prototype.popState = function() {

    //  Leave and pop the state.
    if(this.currentState()) {
        if(this.currentState().leave) {
            this.currentState().leave(game);
        }

        //  Set the current state.
        this.stateStack.pop();
    }
};


//STOP THE GAME
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};


// ----------- ACTUAL GAME PART ---------


//  The main loop.
function GameLoop(game) {
    var currentState = game.currentState();

    if(currentState) {

        //  DT is the number of seconds to update or draw.
        var dt = 1 / game.config.fps;

        //  Get the drawing context.
        var ctx = this.gameCanvas.getContext("2d");
        
        //  Update if we have an update function. Also draw if we have a draw function (like drawing the background, the characters).
        if(currentState.update) {
            currentState.update(game, dt);
        }
        if(currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}


//START THE GAME
Game.prototype.start = function() {
 
     //  Move into the 'welcome' state.
     this.moveToState(new WelcomeState());
 
     //  Set the game variables.
     this.lives = 3;
     this.config.debugMode = /debug=true/.test(window.location.href);
 
     //  Start the game loop.
     var game = this;
     this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);
 
};






//  COMMUNICATE WHEN DOWN KEY IS PRESSED
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

Game.prototype.touchstart = function(s) {
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, KEY_SPACE);
    }    
};

Game.prototype.touchend = function(s) {
    delete this.pressedKeys[KEY_RIGHT];
    delete this.pressedKeys[KEY_LEFT];
};

Game.prototype.touchmove = function(e) {
	var currentX = e.changedTouches[0].pageX;
    if (this.previousX > 0) {
        if (currentX > this.previousX) {
            delete this.pressedKeys[KEY_LEFT];
            this.pressedKeys[KEY_RIGHT] = true;
        } else {
            delete this.pressedKeys[KEY_RIGHT];
            this.pressedKeys[KEY_LEFT] = true;
        }
    }
    this.previousX = currentX;
};

// COMMUNICATE WHEN UPKEY IS PRESSED
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    //  Delegate to the current state too.
    if(this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};



// ----------- WELCOME SCREEN ---------


function WelcomeState() {}

WelcomeState.prototype.update = function (game, dt) {};

WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("oh shoot!", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";

    ctx.fillText("Press 'Space' to start. You can press P to pause if you're bad at this, and press M to mute.", game.width / 2, game.height/2); 

    var bestScore = document.getElementById("bestScore"); //link to span item in main page
    bestScore.textContent = scoreHigh;
    displayScore();
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == KEY_SPACE) {
        //  Space starts the game.
        game.level = 1;
        game.score = 0;
        game.lives = 3;
        game.moveToState(new LevelIntroState(game.level));
    }
};



// ----------- PLAY TIME ---------

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Game state.
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;
    this.lastRocketTime = null;

    //  Game entities.
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
}

PlayState.prototype.enter = function(game) {

    
    //  Create the ship.
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

    //  Setup initial state.
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;

    //  Set the ship speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    var limitLevel = (this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease);
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);
    this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;

    //  Create the invaders.
    var ranks = this.config.invaderRanks + 0.1 * limitLevel;
    var files = this.config.invaderFiles + 0.2 * limitLevel;
    var invaders = [];
    for(var rank = 0; rank < ranks; rank++){
        for(var file = 0; file < files; file++) {
            invaders.push(new Invader(
                (game.width / 2) + ((files/2 - file) * 200 / files),
                (game.gameBounds.top + rank * 20),
                rank, file, 'Invader'));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
    this.invaderNextVelocity = null;
};

PlayState.prototype.update = function(game, dt) {

    //IF press left, go left
    if(game.pressedKeys[KEY_LEFT]) {
        this.ship.x -= this.shipSpeed * dt;
    }

    //if press right, go right
    if(game.pressedKeys[KEY_RIGHT]) {
        this.ship.x += this.shipSpeed * dt;
    }

    //if press space, fire rocket
    if(game.pressedKeys[KEY_SPACE]) {
        this.fireRocket();
    }

    //  Keep the ship in bounds.
    if(this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if(this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    //  Move each bomb.
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        //  If the rocket has gone off the screen remove it.
        if(bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    //  Move each rocket.
    for(i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        //  If the rocket has gone off the screen remove it.
        if(rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    //  Move the invaders.
    var hitLeft = false, hitRight = false, hitBottom = false;
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if(hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        }
        else if(hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        }
        else if(hitBottom == false && newy > game.gameBounds.bottom) {
            hitBottom = true;
        }

        if(!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            invader.y = newy;
        }
    }

    //  Update invader velocities.
    if(this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    //  If we've hit the left, move down then right.
    if(hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
    }
    //  If we've hit the right, move down then left.
    if(hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
    }
    //  If we've hit the bottom, it's game over.
    if(hitBottom) {
        game.lives = 0;
    }
    
    //  Check for rocket/invader collisions.
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for(var j=0; j<this.rockets.length; j++){
            var rocket = this.rockets[j];

            if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
                rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {
                
                //  Remove the rocket, set 'bang' so we don't process this rocket again.
                this.rockets.splice(j--, 1);
                bang = true;
                game.score += this.config.pointsPerInvader;
                break;
            }
        }
        if(bang) {
            this.invaders.splice(i--, 1);
            if (isMuted === false){
                bangs.play()
            };
        }
    }

    //  Find all of the front rank invaders.
    var frontRankInvaders = {};
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        //  If we have no invader for game file, or the invader
        //  for game file is futher behind, set the front
        //  rank invader to game one.
        if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
            frontRankInvaders[invader.file] = invader;
        }
    }

    //  Give each front rank invader a chance to drop a bomb.
    for(var i=0; i<this.config.invaderFiles; i++) {
        var invader = frontRankInvaders[i];
        if(!invader) continue;
        var chance = this.bombRate * dt;
        if(chance > Math.random()) {
            //  Fire!
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2, 
                this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    //  Check for bomb/ship collisions.
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
            this.bombs.splice(i--, 1);
            game.lives--;
            if (isMuted === false){
                explosion.play()
            }    ;
        }
                
    }

    //  Check for invader/ship collisions.
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
            (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
            (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
            (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
            //  Dead by collision!
            game.lives = 0;
            explosion.play();
        }
    }

    //  Check for failure
    if(game.lives <= 0) {
        game.moveToState(new GameOverState());
    }

    //  Check for victory
    if(this.invaders.length === 0) {
        game.score += this.level * 50;
        game.level += 1;
        game.moveToState(new LevelIntroState(game.level));
    }
};



PlayState.prototype.draw = function(game, dt, ctx) {
    
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);
    
    ctx.drawImage(img, this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width+30, this.ship.height+30);
    const img = new Image();   // Create new img element
    img.src = '../img/image.png'; // Set source path
    
    const invImg = new Image();   // Create new img element
    invImg.src = '../img/slack-imgs.gif'; // Set source path
    
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        ctx.drawImage(invImg, invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
    }


    //  Draw bombs.
    ctx.fillStyle = '#ff5555';
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
    }

    //  Draw rockets.
    ctx.fillStyle = '#ff0000';
    for(var i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
    }

    //  Draw info.
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom) / 2) + 14/2;
    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    var info = "Lives: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
    info = "Score: " + game.score + ", Level: " + game.level;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, textYpos);

    //  If we're in debug mode, draw bounds.
    if(this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0,0,game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
            game.gameBounds.right - game.gameBounds.left,
            game.gameBounds.bottom - game.gameBounds.top);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == KEY_SPACE) {
        //  Fire!
        this.fireRocket();
    }
    if(keyCode == 80) {
        //  Push the pause state.
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {

};

PlayState.prototype.fireRocket = function() {
    //  If we have no last rocket time, or the last rocket time 
    //  is older than the max rocket rate, we can fire.
    if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.rocketMaxFireRate))
    {   
        //  Add a rocket.
        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();

        //  Play the 'shoot' sound.
        if (isMuted === false){
            shoot.play()
        };
    }
};


// ----------- PAUSE  ---------
function PauseState() {}

PauseState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == 80) {
        //  Pop the pause state.
        game.popState();
    }
};

PauseState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillText("Paused", game.width / 2, game.height/2);
    return;
};

// ----------- NEW LEVEL SCREEN ---------

function LevelIntroState(level) {
    this.level = level;
    this.countdownMessage = "3";
}

LevelIntroState.prototype.update = function(game, dt) {

    //  Update the countdown.
    if(this.countdown === undefined) {
        this.countdown = 3; // countdown from 3 secs
    }
    this.countdown -= dt;

    if(this.countdown < 2) { 
        this.countdownMessage = "2"; 
    }
    if(this.countdown < 1) { 
        this.countdownMessage = "1"; 
    } 
    if(this.countdown <= 0) {
        //  Move to the next level, popping this state.
        game.moveToState(new PlayState(game.config, this.level));
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

    var saveScore = document.getElementById("saveScore"); 
    saveScore.style.display = "none";
    
    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="36px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
    ctx.font="24px Arial";
    ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height/2 + 36);      
    return;
};


// ----------- GAME OVER ---------
if (scoreStr === null) {
    scoreHigh = 0;
} else {
    scoreHigh = parseInt(scoreStr);
}

function GameOverState() {}

GameOverState.prototype.update = function(game, dt) {};

// GameOverState.prototype.draw = function(game, dt, ctx) {

//     //  Clear the background.
//     ctx.clearRect(0, 0, game.width, game.height);

//     ctx.font="30px Arial";
//     ctx.fillStyle = '#ffffff';
//     ctx.textBaseline="center"; 
//     ctx.textAlign="center"; 
//     ctx.fillText("Game Over!", game.width / 2, game.height/2 - 40); 
//     ctx.font="16px Arial";
//     ctx.fillText("You scored " + game.score + " and got to level " + game.level, game.width / 2, game.height/2);
//     ctx.font="16px Arial";
//     ctx.fillText("Press 'Space' to play again.", game.width / 2, game.height/2 + 40);   


//     if (game.score > scoreHigh) {
//         scoreHigh = game.score;
//         localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
//     } 
//     var bestScore = document.getElementById("bestScore"); //link to span item in main page
//     bestScore.textContent = scoreHigh;

// };

GameOverState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    var saveScore = document.getElementById("saveScore"); 
    saveScore.style.display = "block";

    var scoreText = document.getElementById("scoreText"); 
    scoreText.textContent = game.score;

    if (game.score > scoreHigh) {
        scoreHigh = game.score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    } 
    var bestScore = document.getElementById("bestScore"); //link to span item in main page
    bestScore.textContent = scoreHigh;

};
var scoreArray; //initialize score array

if (localStorage.getItem("scores")){ //if there is a local storage item for scores
    scoreArray = JSON.parse(localStorage.getItem("scores")); //populate score array with these scores
} else {
   scoreArray = []; //otherwise empty array
};

var inputScore = function(event){
    event.preventDefault();

    var inputInitials = document.getElementById("inputInitials"); 

    var currentScore = { //save current score as array item
        initials: inputInitials.value,
        score: scoreText.textContent
    };
  
    scoreArray.push(currentScore); //save current score to score array
 
    var str= JSON.stringify(scoreArray);  //stringify new updated score array
    localStorage.setItem("scores", str); //set the new updated score array 
 
    displayScore();
}

var displayScore = function(){
   var scoreHistory = JSON.parse(localStorage.getItem("scores")) || 0; //parse the updated score array
   var listofHS = document.getElementById("listofHS"); //link to list item in HTML
   listofHS.innerHTML = "";

    for (var i = 0; i<scoreHistory.length; i++){ //make list item of each score history
        var eachScore = document.createElement("ol");
        eachScore.innerHTML = scoreHistory[i].initials + " has a score of " + scoreHistory[i].score;
         listofHS.appendChild(eachScore);
    }
 
    
}

var saveScoreBtn = document.getElementById("saveScoreBtn"); 
saveScoreBtn.addEventListener("click", function(event){
   console.log("clicked");
   inputScore(event);

   var inputInitials = document.getElementById("inputInitials"); 
   inputInitials.value = "";

   game.lives = 3;
   game.score = 0;
   game.level = 1;
   game.moveToState(new LevelIntroState(1));
});


// saveScoreBtn.addEventListener("keydown", "game", event => {
//     if(keydown == KEY_SPACE) {
//         //  Space restarts the game.
//         game.lives = 3;
//         game.score = 0;
//         game.level = 1;
//         game.moveToState(new LevelIntroState(1));
//     }
// });


// GameOverState.prototype.keyDown = function(game, keyCode) {
//     if(keyCode == KEY_SPACE) {
//         //  Space restarts the game.
//         game.lives = 3;
//         game.score = 0;
//         game.level = 1;
//         game.moveToState(new LevelIntroState(1));
//     }
// };



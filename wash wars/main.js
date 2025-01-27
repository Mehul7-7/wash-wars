// Phaser.js game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No global gravity
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Variables
let player;
let germs;
let cursors;
let score = 0;
let scoreText;
let gameStarted = false; // Game starts only when the player presses SPACE or touch button
let startText;
let gameOverText;
let restartButton;
let gameOver = false; // Flag to check if the game is over
let leftButton, rightButton, startButton; // On-screen buttons

// Preload function to load game assets
function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('soap', 'assets/soap.png');
    this.load.image('germ', 'assets/germ.png');
    this.load.image('button', 'assets/restart.png'); // Load restart button image
    this.load.image('leftButton', 'assets/left.png'); // Load left button image
    this.load.image('rightButton', 'assets/right.png'); // Load right button image
    this.load.image('startButton', 'assets/start.png'); // Load start button image
}

// Create function to set up the game
function create() {
    // Background
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background').setDisplaySize(window.innerWidth, window.innerHeight);

    // Player (Lifebuoy Soap)
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight - 100, 'soap').setScale(0.2);
    player.setCollideWorldBounds(true); // Keep player inside the game area

    // Germs (Enemies)
    germs = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    // Player controls
    cursors = this.input.keyboard.createCursorKeys();

    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Start game text
    startText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Press SPACE or Tap to Start', { fontSize: '40px', fill: '#000' }).setOrigin(0.5);

    // Game Over text (hidden initially)
    gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2 - 50, 'Game Over!', { fontSize: '50px', fill: '#ff0000' }).setOrigin(0.5);
    gameOverText.setVisible(false);

    // Restart button (hidden initially)
    restartButton = this.add.text(window.innerWidth / 2, window.innerHeight / 2 + 50, 'Restart', { fontSize: '40px', fill: '#000', backgroundColor: '#ffff00' }).setOrigin(0.5);
    restartButton.setVisible(false);
    restartButton.setInteractive();

    // On-screen left button
    leftButton = this.add.image(100, window.innerHeight - 100, 'leftButton').setInteractive().setScale(0.5);
    leftButton.setVisible(false);

    // On-screen right button
    rightButton = this.add.image(200, window.innerHeight - 100, 'rightButton').setInteractive().setScale(0.5);
    rightButton.setVisible(false);

    // On-screen start button
    startButton = this.add.image(window.innerWidth / 2, window.innerHeight / 2 + 100, 'startButton').setInteractive().setScale(0.5);
    startButton.setVisible(true);

    // Restart game on button click
    restartButton.on('pointerdown', () => restartGame.call(this));

    // Start game on button click
    startButton.on('pointerdown', () => startGame.call(this));

    // On-screen controls
    leftButton.on('pointerdown', () => movePlayerLeft());
    rightButton.on('pointerdown', () => movePlayerRight());

    this.input.on('pointerup', () => stopPlayerMovement()); // Stop player movement when the screen is released

    // Collision between player and germs
    this.physics.add.overlap(player, germs, hitGerm, null, this);
}

// Update function to handle game logic
function update() {
    if (gameOver) {
        return; // If the game is over, stop the update loop
    }

    if (!gameStarted) {
        // Start the game only when player presses SPACE
        if (cursors.space.isDown) {
            startGame.call(this);
        }
        return; // Skip rest of update logic until the game starts
    }

    // Player movement (move only left and right)
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    // Move germs downwards and check if they hit the bottom of the screen
    germs.children.iterate(function (germ) {
        germ.y += germ.speed; // Move germs down by their speed
        if (germ.y > window.innerHeight) {
            // If any germ touches the bottom, trigger game over
            triggerGameOver();
        }
    });
}

// Start the game: spawn germs and begin movement
function startGame() {
    gameStarted = true;
    startText.setVisible(false); // Hide the start text
    startButton.setVisible(false); // Hide start button

    // Show on-screen controls
    leftButton.setVisible(true);
    rightButton.setVisible(true);

    // Start spawning germs
    spawnGerms.call(this);
}

// Function to spawn germs continuously
function spawnGerms() {
    // Clear any remaining germs
    germs.clear(true, true);

    // Spawn new germs and give them random speeds
    for (let i = 5; i > 0; i--) {  // Infinite game logic - continuously respawn germs
        let xPosition = Phaser.Math.Between(50, window.innerWidth - 50); // Random x position
        let germ = germs.create(xPosition, 0, 'germ').setScale(0.1); // Make germs very small
        germ.speed = Phaser.Math.Between(100, 150) / 100; // Give each germ a random speed
        germ.setCollideWorldBounds(false); // Let germs pass through world bounds
    }
}

// Function to handle player hitting a germ
function hitGerm(player, germ) {
    germ.disableBody(true, true);

    // Increase score when a germ is hit
    score += 10;
    scoreText.setText('Score: ' + score);

    // Respawn a new germ after hitting one
    let newGerm = germs.create(Phaser.Math.Between(50, window.innerWidth - 50), 0, 'germ').setScale(0.1);
    newGerm.speed = Phaser.Math.Between(100, 150) / 100;
}

// Function to trigger game over
function triggerGameOver() {
    gameOver = true; // Set game over flag to true
    player.setTint(0xff0000); // Change player's color to indicate game over
    player.setVelocityX(0); // Stop player movement
    gameOverText.setVisible(true); // Show game over text
    restartButton.setVisible(true); // Show restart button

    // Disable all germs
    germs.children.iterate(function (germ) {
        germ.setVelocityY(0);
    });

    // Hide on-screen controls
    leftButton.setVisible(false);
    rightButton.setVisible(false);
}

// Function to restart the game
function restartGame() {
    // Reset all values
    gameOver = false;
    score = 0;
    scoreText.setText('Score: ' + score);
    gameOverText.setVisible(false);
    restartButton.setVisible(false);
    player.clearTint();
    player.setPosition(window.innerWidth / 2, window.innerHeight - 100); // Reset player position

    // Remove all germs and start the game again
    spawnGerms.call(this);

    // Show on-screen controls again
    leftButton.setVisible(true);
    rightButton.setVisible(true);
}

// On-screen controls for player movement
function movePlayerLeft() {
    player.setVelocityX(-160);
}

function movePlayerRight() {
    player.setVelocityX(160);
}

function stopPlayerMovement() {
    player.setVelocityX(0);
}

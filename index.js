const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreOutput = document.querySelector('#scoreOutput');
const statusOutput = document.querySelector('#gameStatus');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
    // height and width used in map generation
    static width = 40;
    static height = 40;

    constructor({position, image}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

// TODO: Player and Ghost can inherit from a parent class
class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.speed = 2;  // Why does speed=3 not work?
        this.radians = 0.75;
        this.openRate = 0.12;
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.rotation);
        c.translate(-this.position.x, -this.position.y);
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians);
        c.lineTo(this.position.x, this.position.y);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // pacman mouth animation. TODO: Only open/close if pacman is moving
        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate;
        }
        this.radians += this.openRate;

        // change pacman facing direction
        if (player.velocity.x > 0) player.rotation = 0;
        if (player.velocity.x < 0) player.rotation = Math.PI;
        if (player.velocity.y > 0) player.rotation = Math.PI / 2;
        if (player.velocity.y < 0) player.rotation = Math.PI * 1.5;
    }
}

class Ghost {
    static speed = 2;

    constructor({position, velocity, colour = 'red'}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.colour = colour;
        this.prevCollisions = [];
        this.speed = 2;
        this.scared = false;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.scared ? 'blue' : this.colour;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Pellet {
    constructor({position}) {
        this.position = position;
        this.radius = 3;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}

class PowerUp {
    constructor({position}) {
        this.position = position;
        this.radius = 8;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}

// array of ascii map tiles
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'o', '.', '^', '.', 'o', '.', '1', '-', ']', '.', '|'],
    ['|', '.', '.', 'p', '|', '.', '.', '.', '|', 'p', '.', '.', '|'],
    ['|', '.', '[', '-', '3', '.', '^', '.', '_', '.', 'o', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['l', '-', ']', '.', '[', '-', 'x', '-', ']', '.', '[', '-', 'r'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '1', '-', ']', '.', '_', '.', 'o', '.', '^', '.', '|'],
    ['|', '.', '|', 'p', '.', '.', '.', '.', '.', 'p', '|', '.', '|'],
    ['|', '.', '_', '.', 'o', '.', '^', '.', '[', '-', '3', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', 'u', '-', '-', '-', '-', '-', '3'],
];

const boundaries = [];

const pellets = [];
const powerUps = [];

const ghosts = [
    new Ghost({
        position: {
            x: 11 * Boundary.width + (Boundary.width / 2),
            y: Boundary.height + (Boundary.height / 2),
        },
        velocity: {
            x: 0,
            y: Ghost.speed,
        },
        colour: "red",
    }),
    new Ghost({
        position: {
            x: 11 * Boundary.width + (Boundary.width / 2),
            y: 11 * Boundary.height + (Boundary.height / 2),
        },
        velocity: {
            x: -Ghost.speed,
            y: 0,
        },
        colour: "lightblue",
    }),
    new Ghost({
        position: {
            x: Boundary.width + (Boundary.width / 2),
            y: 11 * Boundary.height + (Boundary.height / 2),
        },
        velocity: {
            x: Ghost.speed,
            y: 0,
        },
        colour: "pink",
    }),
]

function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

function newBoundary(x, y, imgSrc) {
    boundaries.push(new Boundary({
            position: {
                x: Boundary.width * x,
                y: Boundary.height * y,
            },
            image: createImage(imgSrc),
        })
    )
}

// loop through the ascii map to create a boundaries array
const mapSymbols = {
    '-': './img/pipeHorizontal.png',
    '|': './img/pipeVertical.png',
    '1': './img/pipeCorner1.png',
    '2': './img/pipeCorner2.png',
    '3': './img/pipeCorner3.png',
    '4': './img/pipeCorner4.png',
    'o': './img/block.png',
    '_': './img/capBottom.png',
    '^': './img/capTop.png',
    '[': './img/capLeft.png',
    ']': './img/capRight.png',
    'x': './img/pipeCross.png',
    'd': './img/pipeConnectorBottom.png',
    'u': './img/pipeConnectorTop.png',
    'l': './img/pipeConnectorLeft.png',
    'r': './img/pipeConnectorRight.png',
};

map.forEach((row, y) => {
    row.forEach((symbol, x) => {
        switch (symbol) {
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: x * Boundary.width + Boundary.width / 2,
                            y: y * Boundary.height + Boundary.height / 2,
                        }
                    })
                )
                break;

            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: x * Boundary.width + Boundary.width / 2,
                            y: y * Boundary.height + Boundary.height / 2,
                        }
                    })
                )
                break;

            default:
                newBoundary(x, y, mapSymbols[symbol]);
        }
    });
});


// initialise the player (pacman)
const player = new Player({
    position: {
        x: Boundary.width * 1.5,
        y: Boundary.height * 1.5,
    },
    velocity: {
        x: 0,
        y: 0,
    }
});

const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false},
}

let lastKey = '';
let gameScore = 0;
let gameStatus = '';

function circleCollidesWithRectangle({circle, rectangle}) {
    const padding = Boundary.width / 2 - circle.radius - 1;
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    )
}

function circleCollidesWithCircle(ghost, player) {
    return Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y
    ) < ghost.radius + player.radius
}

function handleMove(x, y) {
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        // preempt whether the move will collide
        if (circleCollidesWithRectangle({
            circle: {
                ...player,
                velocity: {
                    x: x ? x : 0,
                    y: y ? y : 0,
                }
            },
            rectangle: boundary,
        })
        ) {
            x ? player.velocity.x = 0 : null;
            y ? player.velocity.y = 0 : null;
            break
        } else {
            x ? player.velocity.x = x : null;
            y ? player.velocity.y = y : null;
        }
    }
}

let animationId;

function animate() {

    animationId = requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height)

    // move depending on key input
    if (lastKey === 'w') {
        handleMove(null, -player.speed);

    } else if (lastKey === 'a') {
        handleMove(-player.speed, null);

    } else if (lastKey === 's') {
        handleMove(null, player.speed);

    } else if (lastKey === 'd') {
        handleMove(player.speed, null);
    }


    // draw the boundaries
    boundaries.forEach((boundary) => {
        // draw the boundaries onto canvas as per x y coords
        boundary.draw();

        // wall collision detection
        if (circleCollidesWithRectangle({
            circle: player,
            rectangle: boundary
        })) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })

    // detect collision between ghosts and player
    for (let i = ghosts.length - 1; i >= 0; i--) {
        const ghost = ghosts[i];
        if (circleCollidesWithCircle(ghost, player)) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
            } else {
                console.log("You lose");
                gameStatus = 'You lose';
                statusOutput.innerHTML = gameStatus;
                cancelAnimationFrame(animationId);
            }
        }
    }

    // display the powerUps
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.draw();

        if (circleCollidesWithCircle(powerUp, player)) {
            powerUps.splice(i, 1);
            gameScore += 50;

            // make ghosts scared
            ghosts.forEach((ghost) => {
                console.log('ghosts scared: true')
                ghost.scared = true;

                setTimeout(() => {
                    console.log('ghosts scared: false')
                    ghost.scared = false;
                }, 4000)
            })

            scoreOutput.innerHTML = gameScore;
            console.log(powerUps.length);
            if (pellets.length === 0 && powerUps.length === 0) { // TODO: refactor check win
                console.log("You win");
                gameStatus = 'You win';
                statusOutput.innerHTML = gameStatus;
                cancelAnimationFrame(animationId);
            }
        }
    }

    // loop backwards to stop rendering issues (flickering pellets)
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        pellet.draw();

        // if player collides with a pellet
        if (circleCollidesWithCircle(pellet, player)) {
            pellets.splice(i, 1);
            gameScore += 10;
            scoreOutput.innerHTML = gameScore;
            console.log(pellets.length);
            if (pellets.length === 0 && powerUps.length === 0) { // TODO: refactor check win
                console.log("You win");
                gameStatus = 'You win';
                statusOutput.innerHTML = gameStatus;
                cancelAnimationFrame(animationId);
            }
        }
    }

    // draw the pacman/player
    player.update();

    // draw the ghosts
    ghosts.forEach((ghost) => {
        ghost.update();

        const collisions = [];

        // TODO: refactor this
        boundaries.forEach(boundary => {
            if (!collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: ghost.speed,
                            y: 0,
                        }
                    },
                    rectangle: boundary,
                })
            ) {
                collisions.push('right')
            }

            if (!collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: -ghost.speed,
                            y: 0,
                        }
                    },
                    rectangle: boundary,
                })
            ) {
                collisions.push('left')
            }

            if (!collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: -ghost.speed,
                        }
                    },
                    rectangle: boundary,
                })
            ) {
                collisions.push('up')
            }

            if (!collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {
                        ...ghost,
                        velocity: {
                            x: 0,
                            y: ghost.speed,
                        }
                    },
                    rectangle: boundary,
                })
            ) {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')

            const pathways = ghost.prevCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed;
                    ghost.velocity.x = 0;
                    break;
                case 'up':
                    ghost.velocity.y = -ghost.speed;
                    ghost.velocity.x = 0;
                    break;
                case 'left':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = -ghost.speed;
                    break;
                case 'right':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = ghost.speed;
                    break;
            }
            ghost.prevCollisions = [];
        }
    });
}

animate();

// listen for W,A,S,D movement keys and adjust pacman velocity
window.addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            lastKey = 'w';
            break;
        case 'a':
            lastKey = 'a';
            break;
        case 's':
            lastKey = 's';
            break;
        case 'd':
            lastKey = 'd';
            break;
    }
});

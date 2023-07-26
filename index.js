const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreOutput = document.querySelector('#scoreOutput');

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
        // c.fillStyle = 'blue';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);

        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'yellow';
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

// array of ascii map tiles
const map = [
    ['1', '-', '-', '-', '-', '-', 'd', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'o', '.', '^', '.', '_', '.', '1', '-', ']', '.', '|'],
    ['|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|'],
    ['|', '.', '[', '-', '3', '.', '^', '.', '_', '.', 'o', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['l', '-', ']', '.', '[', '-', 'x', '-', ']', '.', '[', '-', 'r'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '1', '-', ']', '.', '_', '.', 'o', '.', '^', '.', '|'],
    ['|', '.', '|', '.', '.', '.', '.', '.', '.', '.', '|', '.', '|'],
    ['|', '.', '_', '.', 'o', '.', '^', '.', '[', '-', '3', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', 'u', '-', '-', '-', '-', '-', '3'],
];

const boundaries = [];
const pellets = [];

function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

function newBoundary(i, j, imgSrc) {
    boundaries.push(new Boundary({
            position: {
                x: Boundary.width * j,
                y: Boundary.height * i,
            },
            image: createImage(imgSrc),
        })
    )
}

// loop through the ascii map to create a boundaries array
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                newBoundary(i, j, './img/pipeHorizontal.png');
                break;
            case '|':
                newBoundary(i, j, './img/pipeVertical.png');
                break;
            case '1':
                newBoundary(i, j, './img/pipeCorner1.png');
                break;
            case '2':
                newBoundary(i, j, './img/pipeCorner2.png');
                break;
            case '3':
                newBoundary(i, j, './img/pipeCorner3.png');
                break;
            case '4':
                newBoundary(i, j, './img/pipeCorner4.png');
                break;
            case 'o':
                newBoundary(i, j, './img/block.png');
                break;
            case '_':
                newBoundary(i, j, './img/capBottom.png');
                break;
            case '^':
                newBoundary(i, j, './img/capTop.png');
                break;
            case '[':
                newBoundary(i, j, './img/capLeft.png');
                break;
            case ']':
                newBoundary(i, j, './img/capRight.png');
                break;
            case 'x':
                newBoundary(i, j, './img/pipeCross.png');
                break;
            case 'd':
                newBoundary(i, j, './img/pipeConnectorBottom.png');
                break;
            case 'u':
                newBoundary(i, j, './img/pipeConnectorTop.png');
                break;
            case 'l':
                newBoundary(i, j, './img/pipeConnectorLeft.png');
                break;
            case 'r':
                newBoundary(i, j, './img/pipeConnectorRight.png');
                break;
            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2,
                        }
                    })
                )
                break;
        }
    })
})

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

function circleCollidesWithRectangle({circle, rectangle}) {
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x
    )
}

function handleMove(x, y) {
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (circleCollidesWithRectangle({
            circle: {
                ...player,
                velocity: {
                    x: (x) ? x : 0,
                    y: (y) ? y : 0,
                }
            },
            rectangle: boundary,
        })
        ) {
            (x) ? player.velocity.x = 0 : null;
            (y) ? player.velocity.y = 0 : null;
            break
        } else {
            (x) ? player.velocity.x = x : null;
            (y) ? player.velocity.y = y : null;
        }
    }
}

function animate() {

    // reset the canvas
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height)

    // move depending on key input
    if (lastKey === 'w') {
        handleMove(null, -5);

    } else if (lastKey === 'a') {
        handleMove(-5, null);

    } else if (lastKey === 's') {
        handleMove(null, 5);

    } else if (lastKey === 'd') {
        handleMove(5, null);
    }

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

    // loop backwards to stop rendering issues (flickering pellets)
    for (let i = pellets.length - 1; 0 < i; i--) {
        const pellet = pellets[i];
        pellet.draw();

        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y
        ) < pellet.radius + player.radius) {
            pellets.splice(i, 1);
            gameScore += 10;
            scoreOutput.innerHTML = gameScore
        }
    }

    // draw the pacman/player
    player.update();
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

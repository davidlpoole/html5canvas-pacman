const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
    // height and width used in map generation
    static width = 40;
    static height = 40;

    constructor({position}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        c.fillStyle = 'blue';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
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

// array of ascii map tiles
const map = [
    ['-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-'],
];

// convert ascii array into list of boundaries with x y coords
const boundaries = [];

// loop through the ascii map to create a boundaries array
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i,
                        }
                    }
                ))
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

function circleCollidesWithRectangle({ circle, rectangle }) {
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

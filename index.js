const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
    // height and width used in map generation
    static width = 40;
    static height = 40;

    constructor({ position }) {
        this.position = position;
        this.width = 40;
        this.height = 40;

        // shortcut methods for clipping detection
        this.top = this.position.y;
        this.bottom = this.position.y + this.height;
        this.left = this.position.x;
        this.right = this.position.x + this.width;
    }

    draw() {
        c.fillStyle = 'blue';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Player {
    constructor({ position ,velocity }) {
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

        // shortcut methods for clipping detection
        this.top = this.position.y - this.radius;
        this.bottom = this.position.y + this.radius;
        this.left = this.position.x - this.radius;
        this.right = this.position.x + this.radius;
    }
}

// array of ascii map tiles
const map = [
    ['-', '-', '-', '-', '-', '-', '-'],
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

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height)
    boundaries.forEach((boundary) => {
        // draw the boundaries onto canvas as per x y coords
        boundary.draw();

        player.velocity.x = 0;
        player.velocity.y = 0;

        if (keys.w.pressed && lastKey === 'w') {
            player.velocity.y = -5;
        } else if (keys.a.pressed && lastKey === 'a') {
            player.velocity.x = -5;
        } else if (keys.s.pressed && lastKey === 's') {
            player.velocity.y = 5;
        } else if (keys.d.pressed && lastKey === 'd') {
            player.velocity.x = 5;
        }

        // wall collision detection
        // if (
        //     player.top + player.velocity.y <= boundary.bottom &&
        //     player.bottom + player.velocity.y >= boundary.top &&
        //     player.left + player.velocity.x <= boundary.right &&
        //     player.right + player.velocity.x >= boundary.left
        // ) {
        //     player.velocity.x = 0;
        //     player.velocity.y = 0;
        // }
    })

    // draw the pacman/player
    player.update();
}

animate();

// listen for W,A,S,D movement keys and adjust pacman velocity
window.addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
    console.log('keydown', key);
});

window.addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
    console.log('keyup', key);
});
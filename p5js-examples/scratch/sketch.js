function createBubble(x, y) {
  return {
    x,
    y,
    size: random(3, 30),
    r: 50,   // red
    g: 100,  // green amount
    b: 50,   // blue
    draw() {
      fill(color(this.r, this.g, this.b));
      circle(x, y, this.size);
      this.g = constrain(this.g + random(-5, 5), 0, 255)
    },
  }
}

const WIDTH = 640;
const HEIGHT = 480;
let bubbles = [];

function setup() {
  createCanvas(WIDTH, HEIGHT);
  for (let i = 0; i < 100; i++) {
    let x = random(0, WIDTH);
    let y = random(0, HEIGHT);
    bubbles.push(createBubble(x, y));
  }
}

function draw() {
  background(50);
  bubbles.forEach((bubble) => bubble.draw());
}

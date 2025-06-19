let w;
let notRandom;


function setup() {
  createCanvas(400, 400);
  background(220);
  w = new Walker();
  notRandom = new Walker();
  notRandom.color = 255 / 2;
}

function draw() {
  w.show();
  w.step();
  notRandom.show();
  notRandom.stepDownAndRight()
}

class Walker {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.color = 0
  }

  show() {
    stroke(this.color);
    circle(this.x, this.y, 10)
    // strokeWeight(5);
    // point(this.x, this.y);
  }

  step() {
    let choice = floor(random(4))
    if (choice === 1) {
      this.x += 1;
    } else if (choice === 2) {
      this.x -= 1;
    } else if (choice === 3) {
      this.y += 1;
    } else {
      this.y -= 1;
    }
  }

  stepDownAndRight() {
    this.x += random(-1, 1.1);
    this.y += random(-1, 1.1);
  }
}
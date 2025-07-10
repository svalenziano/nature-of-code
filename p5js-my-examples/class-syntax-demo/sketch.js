"use strict";



class Shape {
  constructor() {
    // position
    this.pos = createVector(CENTER.x, CENTER.y);
    // movement
    this.speed = random(0.5, 1);
    this.azimuth = createVector(1,1);
    this.rotation = Math.floor(random(0, 360));
    // appearance
    this.fill = color(255, 255, 255);
    this.alpha = 1;
    this.strokeWeight = 0.5;
    this.strokeColor = color(10);
  }
  
  // these are actions that should happen with every call to `draw`
  // regardless of object type
  drawWrapper() {
    push();
    fill(this.fill);
    strokeWeight(this.strokeWeight);
    stroke(this.strokeColor);
    translate(this.pos.x, this.pos.y);
    this.draw();
    pop();
    this.move();
  }

  draw() {
    circle(0, 0, 10);
  }

  move() {
    this.pos.add(p5.Vector.mult(this.azimuth, this.speed));
    if (this.isOffScreen()) {
      this.resetPosition();
    }
  }

  isOffScreen() {
    return (this.pos.x < 0 ||
            this.pos.x > width ||
            this.pos.y < 0 ||
            this.pos.y > height);
  }

  resetPosition() {
    this.pos.x = CENTER.x;
    this.pos.y = CENTER.y;
  }
}

let CENTER;
let s;

function setup() {
  createCanvas(400, 400);
  CENTER = createVector(width / 2, height / 2);
  s = new Shape();
}

function draw() {
  background(220);
  s.drawWrapper();
}

"use strict";

class Orchestrator {
  constructor() {
    this.instances = [];
  }

  createShapes(qty=100, types=[Circle]) {
    let qtyPerType = Math.ceil(qty / types.length)
    types.forEach((Type) => {
      for (let i = 0; i < qtyPerType; i++) {
        this.instances.push(new Type());
      }
    })
  }

  drawInstances() {
    for (let i of this.instances) {
      i.drawWrapper();
    }
  }
}

class Shape {
  
  static #MIN_SIZE = 10;
  static #MAX_SIZE = 50;
  static #MAX_ROTATION_SPEED = 5;
  static #MIN_ROTATION_SPEED = 1;

  // "public class field" (these become instance properties)
  strokeWeight = 0.5;
  strokeColor = color(10);
  pos = createVector(CENTER.x, CENTER.y);
  fill = color(255, 255, 255, 150);

  static randomSize() {
    return random(Shape.#MIN_SIZE, Shape.#MAX_SIZE);
  }

  constructor() {
    this.resetPosition();
    this.randomizeSpeed()
    this.azimuth = createVector(1, 1).rotate(random(0, 360));
    this.rotation = Math.floor(random(0, 360));
  }
  
  // these are actions that should happen with every call to `draw`
  // regardless of object type
  drawWrapper() {
    push();
    fill(this.fill);
    strokeWeight(this.strokeWeight);
    stroke(this.strokeColor);
    translate(this.pos.x, this.pos.y);
    let scaleFactor = this.getScaleFactorByDist(0.1, 1, 0, width/2, CENTER);
    scale(scaleFactor)
    this.draw();
    pop();
    this.move();
  }

  randomizeSpeed() {
    this.speed = random(0.1,0.5);
  }

  draw() {
    circle(0, 0, 50);
  }

  move() {
    this.pos.add(p5.Vector.mult(this.azimuth, this.speed));
    if (this.isOffScreen()) {
      this.resetPosition();
    }
  }

  isOffScreen() {
    /* 
    What is the role of `azimuth`?
      If shape starts off screen, you should not reset it immediately.
      CHOSEN METHOD: You must be able to tell if the shape is moving towards or away from the screen
      ALTERNATIVE: (Not used) You must track whether or not a shape has been on screen
    */
    return ((this.pos.x < 0      - this.getSize() && this.azimuth.x < 0)||
            (this.pos.x > width  + this.getSize() && this.azimuth.x > 0)||
            (this.pos.y < 0      - this.getSize() && this.azimuth.y < 0)||
            (this.pos.y > height + this.getSize() && this.azimuth.y > 0));
  }

  resetPosition() {
    this.pos.x = CENTER.x;
    this.pos.y = CENTER.y;
  }

  getSize() {
    // Different `Shape` subclasses may have different `size` properties:
    return this.size ?? this.diameter ?? this.width ?? this.height ?? 75;
  }

  getScaleFactorByDist(
    minScale=0.1, 
    maxScale=1, 
    minDist, 
    maxDist, 
    from=CENTER) {
    /* 
    minScale = minimum scale factor.  eg: 0.1 = 10% scale
    maxScale = maximum scale factor.  eg: 1 = full scale
    minDist = distance at which min scale factor should be applied
    maxDist = ditto, except max scale factor
    from = location (p5 vector) to measure from

    RETURN = Scale factor, mapped to minScale <-> maxScale
    */
    let distance = from.dist(this.pos);
    let scale = map(distance, minDist, maxDist, minScale, maxScale, false);
    return scale;
  }
}

class Circle extends Shape {
  constructor(diameter = -1) {
    super();
    this.initializeDiameter(diameter);
    
  }

  draw() {
    circle(0, 0, this.diameter);
  }

  initializeDiameter(diameter) {
    if (diameter <= 0) {
      this.diameter = Shape.randomSize();
    } else {
      this.diameter = diameter;
    }
  }
}

class Square extends Shape {
  
  constructor() {
    super();
    this.size = Shape.randomSize();
  }

  draw() {
    rect(0, 0, this.size)
  }
}

let CENTER;
let o;

//  SETUP AND LOOP -------------------------------------------------------------
function setup() {
  createCanvas(400, 400);
  CENTER = createVector(width / 2, height / 2);
  o = new Orchestrator();
  o.createShapes(100, [Square, Circle]);
}

// MAIN LOOP -------------------------------------------------------------
function draw() {
  background(220);
  o.drawInstances();
}

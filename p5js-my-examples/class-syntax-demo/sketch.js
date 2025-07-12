"use strict";

class Orchestrator {
  // declare here (instead of in constructor) for easier IDE navigation
  instances = [];
  instancesToMove = [];

  constructor() {
    // nothing to see here
  }

  createShapes(qty=100, types=[Circle]) {
    let qtyPerType = Math.ceil(qty / types.length)
    types.forEach((Type) => {
      for (let i = 0; i < qtyPerType; i++) {
        this.instances.push(new Type());
      }
    })
  }

  forEachInstance(callback) {
    for (let i of this.instances) {
      callback.call(i);
    }
  }

  drawAll() {
    this.forEachInstance(Shape.prototype.drawWrapper)
  }

  moveAll() {
    this.forEachInstance(Shape.prototype.move)
    this.forEachInstance(Shape.prototype.rotate)
  }

  pauseAll() {

  }


}

class Shape {

  // Size Unit = pixels (this is the standard p5 unit)
  static #MIN_SIZE = 10;
  static #MAX_SIZE = 50;

  // Speed Unit = pixels per frame
  static #MIN_SPEED = 0.1;
  static #MAX_SPEED = 0.5;

  // Rotation Unit = degrees per frame
  static #MAX_ROTATION_SPEED = 0.1;
  static #MIN_ROTATION_SPEED = 0.02;

  // "public class field" (these become instance properties)
  strokeWeight = 0.5;
  strokeColor = color(10);
  pos = createVector(CENTER_OF_SKETCH.x, CENTER_OF_SKETCH.y);
  fill = color(255, 255, 255, 150);

  static randomSize() {
    return random(Shape.#MIN_SIZE, Shape.#MAX_SIZE);
  }

  constructor() {
    this.resetPosition();
    this.randomizeSpeed()
    this.movementDirection = createVector(1, 1).rotate(random(0, 360));
  }
  
  // these are actions that should happen with every call to `draw`
  // regardless of object type
  drawWrapper() {
    push();
    fill(this.fill);
    strokeWeight(this.strokeWeight);
    stroke(this.strokeColor);
    
    translate(this.pos.x, this.pos.y);
    
    // ROTATION
    if (this.rotationAzimuth) {
      rotate(this.rotationAzimuth.heading(), this.pos);
    }
    
    let scaleFactor = this.getScaleFactorByDist(0.1, 1, 0, width/2, CENTER_OF_SKETCH);
    scale(scaleFactor)
    this.draw();
    pop();
    // this.move();
    // this.rotate();
  }

  randomizeSpeed() {
    this.speed = random(Shape.#MIN_SPEED, Shape.#MAX_SPEED);
  }

  randomizeRotation() {
    // #LOA - figure out the math needed to scale the rotation so that larger object spin slower, but there's still enough variation to look good.
    this.rotationAzimuth = createVector(1, 1).rotate(random(0, 360));
    this.rotationSpeed = random(
      Shape.#MIN_ROTATION_SPEED, 
      Shape.#MAX_ROTATION_SPEED
      );
    // Slower objects should spin slower
    // this.rotationSpeed *= this.speed ?? 1;
    this.rotationDirection = Utils.randomChoice([1, -1]);  // 1 = clockwise
  }

  reverseRotation() {
    this.rotationDirection *= -1;
  }

  rotate() {
    if (this.rotationAzimuth) {
      this.rotationAzimuth.rotate(this.rotationSpeed * this.rotationDirection);
    }
  }

  draw() {
    circle(0, 0, 50);
  }

  move() {
    this.pos.add(p5.Vector.mult(this.movementDirection, this.speed));
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
    return ((this.pos.x < 0      - this.getSize() && this.movementDirection.x < 0)||
            (this.pos.x > width  + this.getSize() && this.movementDirection.x > 0)||
            (this.pos.y < 0      - this.getSize() && this.movementDirection.y < 0)||
            (this.pos.y > height + this.getSize() && this.movementDirection.y > 0));
  }

  resetPosition() {
    this.pos.x = CENTER_OF_SKETCH.x;
    this.pos.y = CENTER_OF_SKETCH.y;
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
    from=CENTER_OF_SKETCH) {
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
    this.randomizeRotation();
    // drawOrigin makes it easy to draw square 'from the center'
    this.drawOrigin = this.size / 2 * -1;
  }

  draw() {
    rect(this.drawOrigin, this.drawOrigin, this.size)
  }


}

class Cursor {

}

class Utils {
  
  static randomChoice(choices) {
    let choice = Math.floor(Math.random() * choices.length);
    return choice;
  }
  
  // TESTS

  static testRandomChoice(trials = 100000) {
    let result = [];

    for (let i = 0; i < trials; i++) {
      result.push(Utils.randomChoice([1, 0]));
    }

    let sum = result.reduce((accum, v) => accum + v);
    console.log(`Result: ${sum} of ${TRIALS}`)
  }
}

let CENTER_OF_SKETCH;
let o;
const CONFIGS = {
  JUMBO: {
    width: 1000,
    shapeCount: 400,
  },
  STANDARD: {
    width: 400,
    shapeCount: 100,
  },
}
// Select a config from the above configs
const CONFIG = CONFIGS.STANDARD;

//  SETUP AND LOOP -------------------------------------------------------------
function setup() {
  createCanvas(CONFIG.width, CONFIG.width);
  CENTER_OF_SKETCH = createVector(width / 2, height / 2);
  o = new Orchestrator();
  o.createShapes(CONFIG.shapeCount, [Square, Circle]);
}

// MAIN LOOP -------------------------------------------------------------
function draw() {
  background(220);
  o.drawAll();
  if (!mouseIsPressed) {
    o.moveAll();
  }
  cursor(CROSS);
}


"use strict";

/* 
ABOUT THIS SKETCH

- Press `Escape` for help

- GOAL: practice ES6 class syntax, context

- Are you viewing this code in the p5 web editor? it seems that the web editor
  does not support some recent ECMAScript syntax features, and as a result, it
  erroneosly flags some code as problematic.  Workaround: use VSCode to view and
  edit.



*/


// GLOBALS AND CONFIG ----------------------------------------------------------

let CENTER_OF_SKETCH;
let myCursor;

const CONFIGS = {
  LARGE: {
    width: 1100,
    height: 700,
    shapeCount: 400,
    additionalCount: 200,
  },
  MEDIUM: {
    width: 680,
    height: 400,
    shapeCount: 125,
    additionalCount: 60,
  },
  SMALL: {
    width: 400,
    shapeCount: 100,
    additionalCount: 40,
  },
}
// Select a config from the above configs
const CONFIG = CONFIGS.MEDIUM;



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//  SETUP AND LOOP -------------------------------------------------------------
function setup() {
  createCanvas(CONFIG.width, CONFIG.height ?? CONFIG.width);
  frameRate(60);
  CENTER_OF_SKETCH = createVector(width / 2, height / 2);
  ShapeGroup.createInitialGroup();
  myCursor = new Cursor();
}

// MAIN LOOP -------------------------------------------------------------
function draw() {
  background(220);
  ShapeGroup.drawAll();
  myCursor.draw();
  Help.draw();
}


// EVENTS -------------------------------------------------------------
function mousePressed() {
  if (Help.visible) {
    Help.hide();
  } else {
    ShapeGroup.getSelection(mouseX, mouseY, myCursor.radius);
  }
}

function mouseWheel(event) {
  myCursor.changeDiameter(event.delta);
}

function keyPressed(event) {
  if (event.key === 'Escape') {
    Help.toggle();
  } else if (event.code === 'Space') {
    ShapeGroup.reset();
  } else if (event.code === 'KeyA') {
    ShapeGroup.createAnotherGroup();
  } else if (event.code === 'KeyS') {
    ShapeGroup.pop();
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


// CLASSES ---------------------------------------------------------------------

class Help {
  static MESSAGE_INTRO = `Esc = show/hide this help message
  
  Scroll up / down = Change size of the grabber
  
  Click = grab some shapes and move em around

  A = add shapes (random shape and color)

  S = subtract shapes
  
  Spacebar = reset
  
  ENJOY!`

  static visible = true;
  
  static draw() { 
    if (this.visible) {
      fill('rgba(255, 255, 255, 0.6)');
      rect(-10, -10, width + 20, height + 20);
      fill('rgb(0, 0, 0)');
      noStroke();
      text(this.MESSAGE_INTRO, 10, 10, width - 10, height - 10);
    }
  }

  static toggle() {
    this.visible = !this.visible;
  }

  static hide() {
    this.visible = false;
  }
}

class Colors {
  static CURSOR_FILL = 'rgba(234, 255, 117, 0.2)'
  static CURSOR_STROKE = 'rgba(233, 255, 120, 0.6)'
  static INITIAL_SHAPE_COLOR = 'rgba(255, 255, 255, 0.6)'
  static MODIFIED_SHAPE_COLOR = 'rgba(0, 0, 0, 0.8)';

  static randomHue() {
    return Math.round(random(0, 359));
  }

  static generateColorPair() {
    let h = this.randomHue();
    return [
      `hsl(${h}, 10.00%, 75.00%)`,
      `hsl(${h}, 60.00%, 50.00%)`
    ];
  }

}

class ShapeGroup {
  static shapeGroups = [];

  static createInitialGroup() {
    new ShapeGroup(
      CONFIG.shapeCount, 
      [Circle, Square, Triangle],
      Colors.INITIAL_SHAPE_COLOR,
      Colors.MODIFIED_SHAPE_COLOR
    );
  }

  static createAnotherGroup() {
    let newColor = Colors.generateColorPair();
    new ShapeGroup(
      CONFIG.additionalCount, 
      Array(Utils.randomChoice([Circle, Square, Triangle])),
      newColor[0],
      newColor[1],
    );
  }

  static drawAll() {
    this.shapeGroups.forEach((s) => s.drawAllShapes());
    if (mouseIsPressed) {
      this.shapeGroups.forEach((s) => s.moveSelected());
      this.shapeGroups.forEach((s) => s.modifyColorOnSelected());
    } else {
      this.shapeGroups.forEach((s) => s.moveAllShapes())
    }
  }

  static pop() {
    this.shapeGroups.pop();
  }

  static reset() {
    this.shapeGroups = [];
    new ShapeGroup(
      CONFIG.shapeCount, 
      [Circle, Square],
      Colors.INITIAL_SHAPE_COLOR,
      Colors.MODIFIED_SHAPE_COLOR
    );
  }

  static getSelection(x, y, radius=30) {
    for (let group of this.shapeGroups) {
      group.selectedShapes = [];
      for (let shape of group.shapes) {
        if (dist(shape.pos.x, shape.pos.y, x, y) <= radius) {
          group.selectedShapes.push(shape);
          // i.fill = color(10);  // for debugging
        }
      }
    }
  }
  
  // Instance vars
  // declare here (instead of in constructor) for easier IDE navigation
  shapes = [];
  selectedShapes = [];

  constructor(
    qty, 
    types=[Circle], 
    fill_initial=Colors.INITIAL_SHAPE_COLOR,
    fill_modified=Colors.MODIFIED_SHAPE_COLOR,
    ) {
      if (!Array.isArray(types)) {
        throw new Error('`types` argument must be an Array')
      }
      this.qty = qty;
      this.types = types;
      this.fill_initial = fill_initial;
      this.fill_modified = fill_modified;
      ShapeGroup.shapeGroups.push(this);
      this.createShapes();
  }

  createShapes() {
    console.log(this.fill_initial)
    let qtyPerType = Math.ceil(this.qty / this.types.length)
    this.types.forEach((Type) => {
      for (let i = 0; i < qtyPerType; i++) {
        this.shapes.push(new Type(this.fill_initial, this.fill_modified));
      }
    })
  }

  clearShapes() {
    this.shapes = [];
  }

  drawAllShapes() {
    this.shapes.forEach((shape) => shape.drawWrapper());
  }

  moveAllShapes() {
    this.shapes.forEach((shape) => {
      shape.autoMove();
      shape.rotate();
    })
  }

  moveSelected() {
    this.selectedShapes.forEach((shape) => shape.moveWithMouse())
  }

  modifyColorOnSelected() {
    this.selectedShapes.forEach((shape) => shape.changeColor());
  }

  getSelection(x, y, radius=30) {
    this.selectedShapes = [];
    for (let i of this.shapes) {
      if (dist(i.pos.x, i.pos.y, x, y) <= radius) {
        this.selectedShapes.push(i);
        // i.fill = color(10);  // for debugging
      }
    }
  }


}

class Shape {

  // Size Unit = pixels (this is the standard p5 unit)
  static #MIN_SIZE = 10;
  static #MAX_SIZE = 50;

  // Speed Unit = pixels per frame
  static #MIN_SPEED = 0.07;
  static #MAX_SPEED = 0.35;

  // Rotation Unit = degrees per frame
  static #MAX_ROTATION_SPEED = 0.03;
  static #MIN_ROTATION_SPEED = 0.005;

  // Colors

  // "public class field" (these become instance properties)
  strokeWeight = 0.5;
  strokeColor = color(10);
  pos = createVector(CENTER_OF_SKETCH.x, CENTER_OF_SKETCH.y);

  static randomSize() {
    return random(Shape.#MIN_SIZE, Shape.#MAX_SIZE);
  }

  constructor(fill_initial, fill_modified) {
    this.fill_initial = fill_initial;
    this.fill_modified = fill_modified;
    this.fill = fill_initial;
    this.resetPosition();
    this.randomizeSpeed()
    this.movementDirection = createVector(1, 1).rotate(random(0, 360));
  }
  
  // these are actions that should happen with every call to `draw`
  // regardless of object type
  // The actual instance shouldn't be modified in this method, just drawn!
  // For instance modification, see `autoMove`, `rotate`, etc...
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
  }

  randomizeSpeed() {
    this.speed = random(Shape.#MIN_SPEED, Shape.#MAX_SPEED);
  }

  randomizeRotation() {
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

  autoMove() {
    this.pos.add(p5.Vector.mult(this.movementDirection, this.speed));
    if (this.isOffScreen()) {
      this.resetPosition();
    }
  }

  moveWithMouse() {
    // todo: eliminate the lag btw cursor and shapes
    this.pos.add(movedX, movedY); // Uses built-in p5 mouse movement variables
  }


  isOffScreen() {
    /* 
    What is the role of `movementDirection`?
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

  changeColor() {
    this.fill = this.fill_modified;
  }
}

class Circle extends Shape {
  constructor(fill_initial, fill_modified, diameter = -1) {
    super(fill_initial, fill_modified);
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
  
  constructor(fill_initial, fill_modified) {
    super(fill_initial, fill_modified);
    this.size = Shape.randomSize();
    this.randomizeRotation();
    // drawOrigin makes it easy to draw square 'from the center'
    this.drawOrigin = this.size / 2 * -1;
  }

  draw() {
    rect(this.drawOrigin, this.drawOrigin, this.size)
  }
}

class Triangle extends Shape {
  
  constructor(fill_initial, fill_modified) {
    super(fill_initial, fill_modified);
    this.size = Shape.randomSize();
    this.randomizeRotation();
  }

  draw() {
    let s = this.size;
    triangle(
       0,            -s * sqrt(3) / 3,
      -s/2,           s * sqrt(3) / 6,
       s/2,           s * sqrt(3) / 6
    );
  }
}

class Cursor {
  static #MAX_DIAMETER = CONFIG.width / 1.5;
  static #MIN_DIAMETER = 15;
  static #MOUSE_WHEEL_DAMPER = 0.2;

  diameter = CONFIG.width / 10;
  fill = Colors.CURSOR_FILL;
  strokeColor = Colors.CURSOR_STROKE;
  strokeWeightLight = 1.5;
  strokeWeightHeavy = 6;

  get radius() {
    return this.diameter / 2;
  }

  draw() {
    cursor(CROSS);  // fallback, in case noCursor doesn't work
    noCursor();

    if (!(mouseX < width && mouseX > 0 && mouseY > 0 && mouseY < height)) {
      return
    }

    if (mouseIsPressed) {
      strokeWeight(this.strokeWeightHeavy);
    } else {
      strokeWeight(this.strokeWeightLight);
    }


    fill(this.fill);
    stroke(this.strokeColor);
    circle(mouseX, mouseY, this.diameter);
  }

  changeDiameter(amount) {
    let newDiameter = this.diameter + (amount * Cursor.#MOUSE_WHEEL_DAMPER) * -1;
    this.diameter = constrain(newDiameter, Cursor.#MIN_DIAMETER, Cursor.#MAX_DIAMETER);
  }
}


class Utils {
  
  static randomChoice(choices) {
    let idx = Math.floor(Math.random() * choices.length);
    return choices[idx];
  }
  
  // TESTS

  static testRandomChoice(trials = 10, choices = [1,0]) {
    let result = [];

    for (let i = 0; i < trials; i++) {
      let t = Utils.randomChoice(choices);
      result.push(t);
      // console.log(t);
    }

    let sum = result.reduce((accum, v) => accum + v);
    // console.log(`Result: ${sum} of ${trials}`)
  }
}




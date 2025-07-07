// GOAL: Practice the Pseudo-Classical Pattern 
// (aka pre-ES6 OOP syntax) 
/* 
`draw` methods -> all shapes are centered over the (0, 0) coordinate.  Allow
  the `drawWrapper` method to translate the shape, as appropriate

*/





// ----------------------------------------------------------
// ORCHESTRATOR 'CLASS'
  // This class orchestrates the creation and display of other 
  // class instances
function Orchestrator() {
  this.instances = [];
}

// "Static Fields"
Orchestrator.MIN_SIZE = 2;
Orchestrator.MAX_SIZE = 22;

// "Instance methods"
Orchestrator.prototype.createShapes = function(qty=100) {
  /* 
  Draw circles first, then squares
  */
  const TYPES = 2;
  qty = Math.round(qty / TYPES);
  for (let i = 0; i < qty; i++) {
    const size = random(Orchestrator.MIN_SIZE, Orchestrator.MAX_SIZE);
    this.instances.push(new Square(size))
    this.instances.push(new Circle(size));
  }
}

Orchestrator.prototype.drawAll = function() {
  let offScreen = [];
  for (let i = 0; i < this.instances.length; i++) {
    let shape = this.instances[i];
    if (shape.isOffScreen()) {
      shape.moveToCenter();
      offScreen.push(...(this.instances.splice(i, 1)));  
      i -= 1;
    } else {
      shape.drawWrapper();
      shape.move();
    }
  }
  this.instances.unshift(...offScreen); // draw shape behind others
}

// ----------------------------------------------------------
// ROTATION MIXIN
const rotation_mixin = {
  rotate(degrees = 0.05) {
    this.rotation += degrees;
  }
}

// ----------------------------------------------------------
// HELPER FUNCTIONS
function drawPoint(weight=5) {
  push();
  strokeWeight(weight);
  color('black');
  point(0, 0);
  pop();
}

function randomColor() {
  return color(random(0, 360), 90, 60, 50);
}


// ----------------------------------------------------------
// SHAPE 'CLASS'
let shapeProto = {
  move() {
    this.pos.add(this.vector);
  },
  drawWrapper() {
    /* 
    INTENT: 
      1) Setup for drawing
      2) Draw (Invokes the draw method of the object)
      3) Cleanup
    */
    push();
    
    // Order of operations matters!
    // Debugging?  Draw the center point as a visual reference
    translate(this.pos.x, this.pos.y)
    let center = createVector(0, 0)
    rotate(this.rotation, center); // rotate around 0,0
    
    // Scale the shape to create sense of perspective
    let distFromCenter = dist(this.pos.x, this.pos.y, CENTER.x, CENTER.y);
    scale(distFromCenter / WIDTH_HEIGHT_MINIMUM * 2)
    
    strokeWeight(this.strokeWeight);
    fill(this.color)
    this.draw();
    // drawPoint();
    pop();
    
    // Prep for next draw loop
    if (this.rotate) {
      this.rotate();
    }
  },
  isOffScreen() {
    let s = this.getSize();
    return (
      this.pos.x < 0 - s||
      this.pos.x > width + s||
      this.pos.y < 0 - s||
      this.pos.y > height + s
    )
  },
  moveToCenter() {
    this.pos.x = width / 2;
    this.pos.y = width / 2;
  },
  getSize() {
    return this.diameter ?? this.size ?? this.width ?? 20;
  }
}

// Constructor
function Shape() {
  this.pos = createVector(random(0, width), random(0, height))
  this.rotation = Math.round(random(0, 360));  // degrees
  this.vector = createVector(random(-1, 1), random(-1, 1));
  this.color = randomColor();
  // this.color = color(255);
  this.strokeWeight = 0.5;
  // this.moveToCenter();
}

// Set prototype and repair .constructor
Shape.prototype = shapeProto;
shapeProto.constructor = Shape;


Shape.drawAll = function() {
  for (let instance of this.instances) {
    instance.drawWrapper();
  }
}


// ----------------------------------------------------------
// CIRCLE 'CLASS'
function Circle(diameter) {
  Shape.call(this);
  this.diameter = diameter;
}

Object.setPrototypeOf(Circle, Shape);
let circleProto = Object.create(Shape.prototype);
Circle.prototype = circleProto;

// "Class methods"
Circle.instances = [];  // Circle has its own instances
Circle.prototype.draw = function() {
  circle(0, 0, this.diameter);
}

// ----------------------------------------------------------
// SQUARE 'CLASS'
function Square(size) {
  Shape.call(this);
  this.size = size;
}

Square.prototype = Object.create(Shape.prototype);
Square.prototype.constructor = Square;
Square.prototype.draw = function() {
  // I couldn't get `CENTER` mode to work, so I'm using `CORNERS`
  rectMode(CORNERS)
  let topLeft = this.size / 2 * -1;
  let bottomRight = this.size / 2;
  rect(topLeft, topLeft, bottomRight, bottomRight);
}

// Insert properties of mixin into the prototype!
Object.assign(Square.prototype, rotation_mixin);

// Square.prototype.rotate = function(degrees = 0.05) {
//   // changes the rotation angle
//   this.rotation += degrees;
// }


// ----------------------------------------------------------
// SETUP
const shapes = new Orchestrator();
let CENTER;
let WIDTH_HEIGHT_MINIMUM;

// ----------------------------------------------------------
// Main Loop
function setup() {
  createCanvas(400, 400);
  CENTER = createVector(width/2, height/2);
  WIDTH_HEIGHT_MINIMUM = Math.min(width, height);

  colorMode(HSL)
  frameRate(30);
  shapes.createShapes(200);
  console.log("SETUP IS COMPLETE")
}

function draw() {
  background('rgb(196, 229, 241)');
  // background(...LIGHT_BLUE);
  shapes.drawAll();
}


// SYNOPSIS: Practice pre-ES6 syntax 

// ----------------------------------------------------------
// ORCHESTRATOR 'CLASS'
  // This class orchestrates the creation and display of other 
  // class instances
function Orchestrator() {
  this.instances = [];
}

// "Instance methods"
Orchestrator.prototype.createShapes = function(qty=100) {
  for (let i = 0; i < qty; i++) {
    this.instances.push(new Circle(random(2, 20)));
  }
}

Orchestrator.prototype.drawAll = function() {
  for (let i of this.instances) {
    i.draw();
    i.move();
  }
}

// ----------------------------------------------------------
// SHAPE 'CLASS'
let shapeProto = {
  move() {
    this.pos.add(this.vector);
    // this.checkFrame(width, height);
  },
  drawPrep() {
    // should be called before drawing any object
    strokeWeight(this.strokeWeight);
    fill(this.color)
  },
  // draw() {
  //   this.drawPrep();
  // circle(this.pos.x, this.pos.y, 10);
  // }
}

// Constructor
function Shape() {
  this.pos = createVector(random(0, width), random(0, height))
  this.rotation = random(0, 360);  // degrees
  this.vector = createVector(random(-1, 1), random(-1, 0.1));
  this.color = color(random(0, 360), 90, 60, 50);
  this.strokeWeight = 0.5;
  Shape.instances.push(this);
}

// Set prototype and repair .constructor
Shape.prototype = shapeProto;
shapeProto.constructor = Shape;

// "Static properties"
Shape.instances = [];

// "Static methods"
Shape.nukeInstances = function() {
  this.instances = [];
}

Shape.populateInstances = function() {
  for (let i = 0; i < 100; i++) {
    this.instances.push(new this(10))
  }
}

Shape.drawAll = function() {
  for (let instance of this.instances) {
    instance.draw();
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
  this.drawPrep();
  circle(this.pos.x, this.pos.y, this.diameter);
}


// ----------------------------------------------------------
// Create objects
const LIGHT_BLUE = [218, 85, 2]
const LIGHT_GRAY = [0, 0, 95]
const shapes = new Orchestrator();

// ----------------------------------------------------------
// Main Loop
function setup() {
  colorMode(HSL)
  createCanvas(400, 400);
  frameRate(15);
  shapes.createShapes();
  console.log("SETUP IS COMPLETE")
}

function draw() {
  background('rgb(196, 229, 241)');
  // background(...LIGHT_BLUE);
  shapes.drawAll();
}

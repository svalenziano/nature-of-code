// SYNOPSIS: Practice pre-ES6 syntax 

let shapeProto = {
  move() {
    this.pos.add(this.vector);
    // this.checkFrame(width, height);
  },
  draw() {
    strokeWeight(this.strokeWeight);
    fill(this.color)
    circle(this.pos.x, this.pos.y, 10);
  }
}

// Constructor
function Shape() {
  // position
  this.pos = createVector(random(0, width), random(0, height))
  this.rotation = random(0, 360);  // degrees
  this.vector = createVector(random(0, 1), random(0, 1));
  // colors
  this.color = color(random(0, 360), 90, 60, 50)
  // this.fillH = random(0, 360);  // hue
  // this.fillS = 90;              // saturation
  // this.fillL = 60;              // luminance
  // this.alpha = 50;              // transparency
  // sizes
  this.strokeWeight = 0.5;
  Shape.instances.push(this);
}

// "Static properties"
Shape.instances = [];

Shape.resetInstances = function() {
  this.instances = [];
}

Shape.populateInstances = function() {
  for (let i = 0; i < 100; i++) {
    this.instances.push(new Shape())
  }
}

Shape.drawAll = function() {
  for (let instance of this.instances) {
    instance.draw();
  }
}

// Set prototype and repair .constructor
Shape.prototype = shapeProto;
shapeProto.constructor = Shape;

// ----------------------------------------------------------
// Create objects

let obj;

// ----------------------------------------------------------
// Main Loop
function setup() {
  colorMode(HSL)
  createCanvas(400, 400);
  frameRate(1);
}

function draw() {
  background(220);
  Shape.resetInstances();
  Shape.populateInstances();
  Shape.drawAll();
}

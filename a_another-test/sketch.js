"use strict";

function setup() {
  createCanvas(400, 400);
  Flower.populate();
  frameRate(20);
}

function draw() {
  background("black");
  // Flower.clear();  // Remove old flowers so they can be GC'ed
  Flower.refresh(1);
  Flower.drawAll();
  
}

class Flower {
  static instances = [];
  static MIN_SIZE = 20;
  static DISAPPEAR_SIZE = 5;
  static MAX_INSTANCES = 100;

  constructor() {
    this.x = random(20, 380);
    this.y = random(20, 380);
    this.size = random(Flower.MIN_SIZE, 75);
    this.shrink = random(85, 99)
    this.lifespan = random(255, 300);
    this.color = color(random(100,255), random(10), random(100, 255));
    
    Flower.instances.push(this);
  }

  static clear() {
    this.instances = [];
  }

  static populate(num = this.MAX_INSTANCES) {
    for (let i = 0; i < num; i++) {
      this.instances.push(new Flower());
    }
  }

  static drawAll() {
    for (let f of this.instances) {
      f.draw();
    }
  }

  static refresh(minimum) {
    if (this.instances.length < minimum) {
      this.populate(this.MAX_INSTANCES - minimum);
    }
  }
  
  draw() {
    let f = this;
    // Petals
    stroke(0,0,0,0)
    fill(f.color);
    ellipse(f.x, f.y, f.size,     f.size / 2)
    ellipse(f.x, f.y, f.size / 2, f.size)
    
    // Yellow center 
    fill("yellow");
    ellipse(f.x, f.y, f.size / 2);

    // Shrink for next go round
    f.size = f.size - (f.shrink / 100);

    // If too small, discard flower
    if (f.size < Flower.DISAPPEAR_SIZE) {
      let idx = Flower.instances.indexOf(f);
      Flower.instances.splice(idx, 1);
    }
  }
}
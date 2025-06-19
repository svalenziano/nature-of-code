"use strict";

function setup() {
  createCanvas(400, 400);
  frameRate(1);
}

function draw() {
  background("lightblue");
  Flower.clear();  // Remove old flowers so they can be GC'ed
  Flower.populate(100);
  Flower.drawAll();
  
}

class Flower {
  static instances = [];
  static MIN_SIZE = 20;
  static DISAPPEAR_SIZE = 5;

  constructor() {
    this.x = random(20, 380);
    this.y = random(20, 380);
    this.size = random(Flower.MIN_SIZE, 75);
    this.lifespan = random(255, 300);
    this.color = color(random(255), random(255), random(255));
    
    Flower.instances.push(this);
  }

  static clear() {
    this.instances = [];
  }

  static populate(num) {
    for (let i = 0; i < num; i++) {
      this.instances.push(new Flower());
    }
  }

  static drawAll() {
    for (let f of this.instances) {
      f.draw();
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
    
    // Prune em

  }
}
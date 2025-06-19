let bubbles = [];

function setup() {
  createCanvas(800, 400);
  console.log('hello world!')
  background(20)

  // Sun
  circle(width * 0.9, height * 0.1, 200)

}

class bubble {
  constructor(size, color) {
    this.size = size;
    this.color = color;
  }
  create() {
    this.location = [mouseX, mouseY];
  }
  draw() {
    fill(200, a=5)
    // fill(255, a=0.1);
    stroke(200)
    strokeWeight(3);
    circle(this.location[0], this.location[1], this.size);
  }
  grow() {
    this.size += 0.5;
    this.draw()
  }
}

function draw() {
  // background(20, a=50);
  
  
  
  // mouse
  // fill(50)
  // circle(mouseX, mouseY, random(90,100))
  for (let b of bubbles) {
    b.grow();
  }
}

function mouseClicked(event) {
    let x = new bubble(random(10,20), random(50, 100));
    x.create();
    bubbles.push(x)
    console.log(event);
  }
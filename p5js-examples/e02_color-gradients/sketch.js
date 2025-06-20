let backgroundColor = 200

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(backgroundColor);
}

function mousePressed() {
  backgroundColor *= -1;
}
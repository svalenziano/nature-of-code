function setup() {
  createCanvas(400, 400);
  frameRate(1);
}

function draw() {
  background("lightblue");

  let myFlower = createFlower();
  
  fill(myFlower.color);
  ellipse(myFlower.x, myFlower.y, myFlower.size);
}


function createFlower() {
  let flower = {
    x: random(20, 380),
    y: random(20, 380),
    size: random(20, 75),
    lifespan: random(255, 300),
    color: color(random(255), random(255), random(255)),
  }
  return flower;
}
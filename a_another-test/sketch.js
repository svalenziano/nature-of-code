function setup() {
  createCanvas(400, 400);
  frameRate(1);
}

function draw() {
  background("lightblue");

  let flowers = [];
  for (let i = 0; i < 100; i++) {
    flowers.push(createFlower());
  }

  drawFlowers(flowers);
  
}

function drawFlowers(flowersArr) {
  for (let i = 0; i < flowersArr.length; i++) {
    let f = flowersArr[i];
    // Petals
    stroke(0,0,0,0)
    fill(f.color);
    ellipse(f.x, f.y, f.size,     f.size / 2)
    ellipse(f.x, f.y, f.size / 2, f.size)
    
    // Yellow center 
    fill("yellow");
    ellipse(f.x, f.y, f.size / 2);
  }
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
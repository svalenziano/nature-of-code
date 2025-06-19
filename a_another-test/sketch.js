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

  for (let i = 0; i < flowers.length; i++) {
    let f = flowers[i];
    fill(f.color);
    ellipse(f.x, f.y, f.size);
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
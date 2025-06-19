let flower = {
  x: 200,
  y: 100,
  emoji: "🌸",
  fname: 'hiiiii'
}

function setup() {
  createCanvas(400, 400);
  console.log(flower);
}

function draw() {
  background("lightblue")
  textSize(100);
  text(flower.emoji, flower.x, flower.y);
}
// let choices = [-1, 0, 1]
let t;

function setup() {
  t = random(-99999, 99999)
  createCanvas(400, 400);
}

function draw() {
  background(100);
  console.log(t)
  textSize(20)
  text(String(t), x=width/2, y=height/2)
}

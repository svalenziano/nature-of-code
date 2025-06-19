function setup() {
  createCanvas(400, 400);
}

let flower = {
  x: 200,
  y: 100,
  emoji: "🌸",
  fname: 'hiiiii'
}

class Flower {
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.emoji = "🌸";
  }
}

class Garden {
  constructor(num) {
    this.plants = [];
    for (let i = 0; i < num; i++) {
      this.plants.push(new Flower())
    }
  };
  
  draw() {
    this.plants.forEach(() => {
      text(this.emoji, this.x, this.y);
    })
  }
}

let garden = new Garden(20);



function draw() {
  background("lightblue")
  textSize(100);
  garden.draw();
}
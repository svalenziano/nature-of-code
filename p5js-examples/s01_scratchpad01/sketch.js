class Button {
  #x; #y; #w; #h; #onClick; #hover;

  static instances = [];

  constructor(x, y, w, h, label, onClick) {
    this.#x = x;
    this.#y = y;
    this.#w = w;
    this.#h = h;
    this.label = label;
    this.#onClick = onClick;  // callback func
    this.#hover = false;
    Button.instances.push(this);
  }

  // call in your draw loop
  static drawAll() {
    for (let i of Button.instances) {
      // check hover state
      i.#hover = (
        mouseX >= i.#x && mouseX <= i.#x + i.#w &&
        mouseY >= i.#y && mouseY <= i.#y + i.#h
      );

      // button background
      noStroke();
      fill(i.#hover ? 200 : 170);
      rect(i.#x, i.#y, i.#w, i.#h, 5);

      // label
      fill(50);
      textAlign(CENTER, CENTER);
      textSize(14);
      text(i.label, i.#x + i.#w/2, i.#y + i.#h/2);
    }
  }

  // call in mousePressed()
  static handleAllClicks() {
    for (let i of Button.instances) {
      if (i.#hover && i.#onClick) {
        i.#onClick();
      }
    }
  }
}

class ButtonArray {
  /* 
  STATIC FIELDS
    - 
  PROPS
  - 
  METHODS
  - constructor:
    - creates array of 
  */
}

// ---------- sketch code ----------

let btn;

function setup() {
  createCanvas(400, 300);

  // Todo: encapsulate in a method that creates an array of buttons
  // create buttons
  let yOffset = 10;
  let xOffset = 10;
  let height = 25;
  for (let i of ['Hello', 'World']) {
    new Button(xOffset, yOffset, 150, height, i, () => console.log(i + ' clicked!'));
    yOffset += yOffset + height;
  }
}

function draw() {
  background(240);
  Button.drawAll();
}

function mousePressed() {
  Button.handleAllClicks();
}

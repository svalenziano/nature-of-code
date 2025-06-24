class Button {
  #x; #y; #w; #h; #onClick; #hover;

  constructor(x, y, w, h, label, onClick) {
    this.#x = x;
    this.#y = y;
    this.#w = w;
    this.#h = h;
    this.label = label;
    this.#onClick = onClick;  // callback func
    this.#hover = false;
  }

  // call in your draw loop
  draw() {
    // check hover state
    this.#hover = (
      mouseX >= this.#x && mouseX <= this.#x + this.#w &&
      mouseY >= this.#y && mouseY <= this.#y + this.#h
    );

    // button background
    noStroke();
    fill(this.#hover ? 200 : 170);
    rect(this.#x, this.#y, this.#w, this.#h, 5);

    // label
    fill(50);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.label, this.#x + this.#w/2, this.#y + this.#h/2);
  }

  // call in mousePressed()
  handleClick() {
    if (this.#hover && this.#onClick) {
      this.#onClick();
    }
  }
}

// ---------- sketch code ----------

let btn;

function setup() {
  createCanvas(400, 300);
  // instantiate a button at (150,50), size 100×40
  btn = new Button(150, 50, 100, 40, 'PRESS', () => {
    console.log('Button clicked!');
  });
}

function draw() {
  background(240);
  btn.draw();
}

function mousePressed() {
  btn.handleClick();
}

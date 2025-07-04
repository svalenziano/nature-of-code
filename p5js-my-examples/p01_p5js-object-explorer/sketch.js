"use strict";

const GLOBAL_RADIUS = 3;
const TEXT_HEIGHT = 12;

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
    this.color = color(170);
    this.colorHover = color(200);
    Button.instances.push(this);
  }

  // call in your draw loop
  static #drawAll() {
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
      textSize(TEXT_HEIGHT);
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

  static logClick() {
    console.log(i + ' clicked!');
  }

  drawNoOffset() {
    // draws WITHOUT offset!  Assumes that `translate` is called elsewhere.
    noStroke();
    fill(this.currentColor);
    rect(0, 0, this.#w, this.#h, GLOBAL_RADIUS);
    fill(50);
    textAlign(CENTER, CENTER);
    textSize(TEXT_HEIGHT);
    text(this.label, 0, 0, this.#w, this.#h);
  }

  get currentColor() {
    return this.#hover ? this.colorHover : this.color;
  }

  get height() {
    return this.#h;
  }

  get width() {
    return this.#w;
  }
}

class ButtonArray {
  #height;
  width;
  
  static instances = [];
  
  constructor(buttons, x, y, dX, dY, padding) {
    // buttons = array of buttons
    // dX and dY = x and y offsets from button 1 to button 2, ...
    //    use dX = 0 for a vertical column of buttons
    //    example: for 100px button and 10px desired gap, use dX = 110pX
    let qty = buttons.length;
    this.x = x;
    this.y = y;
    this.dX = dX;  
    this.dY = dY;
    this.padding = padding;
    this.width = Math.max(dX * qty - padding, buttons[0].width) + padding * 2;
    this.#height = Math.max(dY * qty - padding, buttons[0].height) + padding * 2;
    this.buttons = buttons;
    ButtonArray.instances.push(this);
  }

  draw() {
    push();
    // draw the ButonArray bounding box
    translate(this.x, this.y);
    noStroke();
    fill(75);
    rect(0, 0, this.width, this.#height, 3);

    // draw buttons
    translate(this.padding, this.padding);
    for (let button of this.buttons) {
      button.drawNoOffset();
      translate(this.dX, this.dY)
    }
    pop();
  }

  // get width() {
  //   let w = this.dX ? this.dX : this.buttons[0].width;
  //   console.log('width =', w)
  //   return w
  // }

}

// ---------- sketch code ----------

let btn;
let btnArr;

function setup() {
  createCanvas(400, 300);

  // Todo: encapsulate in a method that creates an array of buttons
  // create buttons
  let height = 25;

  let stackOButtons = [];
  for (let i of ['Hello', 'World', 'Hanna', 'Boops']) {
    let b = new Button( 0, 0, 150, height, i, Button.logClick);
    stackOButtons.push(b);
  }
  
  btnArr = new ButtonArray(stackOButtons, 10, 10, 0, height + 10, 10);
}

function draw() {
  background(240);
  btnArr.draw();
  // Button.drawAll();
}

function mousePressed() {
  // Button.handleAllClicks();
}

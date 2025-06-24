"use strict";

// -- Camera class ---------------------------------------------------
class Camera {
  constructor(minScale, maxScale) {
    this.pos = createVector(0, 0);   // camera center in world coords
    this.scale = 1;                  // zoom level
    this.minScale = minScale;
    this.maxScale = maxScale;
  }

  // Call before drawing your world
  begin() {
    push();
    // Move origin to canvas center
    translate(width / 2, height / 2);
    // Scale (zoom)
    scale(this.scale);
    // Translate by negative camera pos so that pos appears at center
    translate(-this.pos.x, -this.pos.y);
  }

  // Call after drawing your world
  end() {
    pop();
  }

  // Pan the camera by dx, dy in screen pixels
  pan(dx, dy) {
    // convert screen-pixel pan to world coords by dividing by zoom
    this.pos.x -= dx / this.scale;
    this.pos.y -= dy / this.scale;
  }

  // Zoom around a given screen-space point (px, py)
  zoomAt(factor, px, py) {
    // factor = quantity of zoom (floating point)
    // px & py = mouse location = point to use for "zoom in" and "zoom out"
    // Convert screen point to world coords BEFORE zoom
    let wxBefore = (px - width/2) / this.scale + this.pos.x;
    let wyBefore = (py - height/2) / this.scale + this.pos.y;

    // Apply zoom
    this.scale *= factor;

    // Convert screen point to world coords AFTER zoom
    let wxAfter = (px - width/2) / this.scale + this.pos.x;
    let wyAfter = (py - height/2) / this.scale + this.pos.y;

    // Shift camera so that world point under the mouse stays fixed
    this.pos.x += (wxBefore - wxAfter);
    this.pos.y += (wyBefore - wyAfter);
  }
}

// -- Globals --------------------------------------------------------
let cam;
let isDragging = false;
let prevMouseX, prevMouseY;

// -- p5.js setup() -------------------------------------------------
function setup() {
  createCanvas(800, 600);
  cam = new Camera();

  // Optional: smooth drawing
  smooth();
}

// -- p5.js draw() --------------------------------------------------
function draw() {
  background(240);

  // Start camera transform
  cam.begin();

  // ALL OF YOUR CAMERA-DRAWN ELEMENTS GO HERE
    // Draw a simple grid
    stroke(200);
    for (let x = -2000; x <= 2000; x += 50) {
      line(x, -2000, x, 2000);
    }
    for (let y = -2000; y <= 2000; y += 50) {
      line(-2000, y, 2000, y);
    }

    // Draw axes
    strokeWeight(2);
    stroke(255, 0, 0);
    line(0, -2000, 0, 2000);  // Y-axis
    stroke(0, 0, 255);
    line(-2000, 0, 2000, 0);  // X-axis

    // Draw a moving circle at world origin
    fill(0, 200, 100);
    noStroke();
    circle(0, 0, 50);
    fill(255);
    circle(0, 0, 25);

  // End camera transform
  cam.end();

  // Draw instructions in screen-space
  fill(0);
  textSize(14);
  text("👉 Drag to pan; Scroll to zoom", 10, height - 10);
}

// -- Mouse & Touch Events ------------------------------------------
// Start drag
function mousePressed() {
  isDragging = true;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// Drag to pan
function mouseDragged() {
  if (isDragging) {
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    cam.pan(dx, dy);
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}

// End drag
function mouseReleased() {
  isDragging = false;
}

// Zoom with mouse wheel
function mouseWheel(event) {
  // Zoom factor per scroll "step"
  let zoomFactor = 1.001 ** -event.delta;
  cam.zoomAt(zoomFactor, mouseX, mouseY);
  // prevent default mousewheel actions
  return false;
}
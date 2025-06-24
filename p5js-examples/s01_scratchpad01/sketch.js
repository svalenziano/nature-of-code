// Click and drag the mouse to view the scene from different angles.

function setup() {
  createCanvas(200, 200, WEBGL);

  describe(
    'Two spheres drawn on a gray background. The sphere on the left is red and lit from the front. The sphere on the right is a blue wireframe.'
  );
}

function draw() {
  background(200);

  // Enable orbiting with the mouse.
  orbitControl();

  // Draw the red sphere.
  push();
  translate(-25, 0, 0);
  noStroke();
  directionalLight(255, 0, 0, 0, 0, -1);
  sphere(20);
  pop();

  // Draw the blue sphere.
  push();
  translate(25, 0, 0);
  strokeWeight(0.3);
  stroke(0, 0, 255);
  noFill();
  sphere(20);
  pop();
}
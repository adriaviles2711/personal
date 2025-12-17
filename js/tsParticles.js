let cols, rows;
let size = 30;
let blocks = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('tsparticles');
  
  cols = ceil(width / size);
  rows = ceil(height / size);
  
  for (let i = 0; i < cols; i++) {
    blocks[i] = [];
    for (let j = 0; j < rows; j++) {
      blocks[i][j] = new Block(i * size, j * size);
    }
  }
}

function draw() {
  clear();
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      blocks[i][j].update();
      blocks[i][j].display();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = ceil(width / size);
  rows = ceil(height / size);
  blocks = [];
  for (let i = 0; i < cols; i++) {
    blocks[i] = [];
    for (let j = 0; j < rows; j++) {
      blocks[i][j] = new Block(i * size, j * size);
    }
  }
}

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.brightness = 0; 
    this.decay = random(2, 5);
  }

  update() {   
    if (random(1) < 0.0005) {
      this.brightness = random(100, 200);
    }

    if (this.brightness > 0) {
      this.brightness -= this.decay;
    }
  }

  display() {
    if (this.brightness > 1) {
      noStroke();
      fill(255, 123, 0, this.brightness);

      rect(this.x, this.y, size - 2, size - 2);
    } else {
        stroke(255, 255, 255, 5);
        noFill();
        rect(this.x, this.y, size - 2, size - 2);
    }
  }
}
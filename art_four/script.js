const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 650;

ctx.fillStyle = "orange";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

class Particles {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX;
    this.speedY;
    this.speedModifier = Math.floor(Math.random() * 2 + 1);
    this.maxLength = Math.floor(Math.random() * 60 + 20);
    this.history = [{ x: this.x, y: this.y }];
    this.angle = 0;
    this.newAngle = 0;
    this.angleCorrector = Math.random() * 0.05 + 0.01;
    this.timer = this.maxLength * 2;
    this.color =
        this.effect.colors[Math.floor(Math.random() * this.effect.colors.length)];
  }
  draw(context) {
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.strokeStyle = this.color;
    context.stroke();
  }
  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;
      if (this.effect.flowFields[index]) {
        this.newAngle = this.effect.flowFields[index].colorAngle;
        if (this.angle > this.newAngle) this.angle -= this.angleCorrector;
        else if (this.angle > this.newAngle) this.angle -= this.angleCorrector;
        else this.angle = this.newAngle;
      }
      this.speedX = Math.cos(this.angle);
      this.speedY = Math.sin(this.angle);
      this.x += this.speedX * this.speedModifier;
      this.y += this.speedY * this.speedModifier;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }
  reset() {
    let attempts = 0;
    let resetSuccess = false;
    while (attempts < 10 && !resetSuccess) {
      attempts++;
      let testIndex = Math.floor(Math.random() * this.effect.flowFields.length);
      if (this.effect.flowFields[testIndex].alpha > 0) {
        this.x = this.effect.flowFields[testIndex].x;
        this.y = this.effect.flowFields[testIndex].y;
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLength * 2;
        resetSuccess = true;
      }
    }
    if (!resetSuccess) {
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.history = [{ x: this.x, y: this.y }];
      this.timer = this.maxLength * 2;
    }
  }
}

class Effect {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.context = context;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 5;
    this.cols;
    this.rows;
    this.flowFields = [];
    this.zoom = 0.07;
    this.curve = 5;
    this.debug = true;
    this.colors = ["cyan", "red", "green", "blue"];
    // this.colors = ["#2E0249", "#570A57","#A91079","#F806CC"]
    this.init();
    window.addEventListener("keydown", (e) => {
      if (e.key === "d") this.debug = !this.debug;
    });
    window.addEventListener("resize", (e) => {
      //   this.resize(e.target.innerWidth, e.target.innerHeight);
    });
  }
  drawText() {
    this.context.font = "500px Impact";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );

    gradient.addColorStop("0.4", "pink");
    gradient.addColorStop("0.43", "red");
    gradient.addColorStop("0.470", "orange");
    gradient.addColorStop("0.5", "yellow");
    gradient.addColorStop("0.535", "green");
    gradient.addColorStop("0.575", "cyan");
    gradient.addColorStop("0.6", "violet");

    this.context.fillStyle = gradient;
    this.context.fillText("JS", this.width * 0.5, this.height * 0.5);
  }
  init() {
    this.cols = Math.floor(this.width / this.cellSize);
    this.rows = Math.floor(this.height / this.cellSize);
    this.flowFields = [];
    this.drawText();

    // scan pixel data
    const pixel = this.context.getImageData(0, 0, this.width, this.height).data;
    console.log(pixel);
    for (let y = 0; y < this.height; y += this.cellSize) {
      for (let x = 0; x < this.width; x += this.cellSize) {
        const index = (y * this.width + x) * 4;
        const red = pixel[index];
        const green = pixel[index + 1];
        const blue = pixel[index + 2];
        const alpha = pixel[index + 3];
        const grayScale = (red + green + blue) / 3;
        const colorAngle = ((grayScale / 255) * 6.28).toFixed(2);
        this.flowFields.push({
          x,
          y,
          colorAngle,
          alpha,
        });
      }
    }
    // for (let i = 0; i < this.rows; i++) {
    //   for (let j = 0; j < this.cols; j++) {
    //     let angle =
    //       (Math.sin(j * this.zoom) + Math.cos(i * this.zoom)) * this.curve;
    //     this.flowFields.push(angle);
    //   }
    // }
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particles(this));
    }
  }
  drawGrid() {
    this.context.save();
    this.context.globalAlpha = 0.25;
    this.context.strokeStyle = "violet";
    for (let i = 0; i < this.cols; i++) {
      this.context.beginPath();
      this.context.moveTo(i * this.cellSize, 0);
      this.context.lineTo(i * this.cellSize, this.height);
      this.context.stroke();
    }
    for (let i = 0; i < this.rows; i++) {
      this.context.beginPath();
      this.context.moveTo(0, i * this.cellSize);
      this.context.lineTo(this.width, i * this.cellSize);
      this.context.stroke();
    }
    this.context.restore();
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  render() {
    if (this.debug) {
      this.drawGrid();
      this.drawText();
    }
    this.particles.forEach((particle) => {
      particle.draw(this.context);
      particle.update();
    });
  }
}

const effect = new Effect(canvas, ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}
animate();

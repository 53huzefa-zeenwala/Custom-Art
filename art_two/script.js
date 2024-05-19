const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = "pink";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

class Particles {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.speedX;
    this.speedY;
    this.speedModifier = Math.floor(Math.random() * 5 + 1)
    this.maxLength = Math.floor(Math.random() * 200 + 10);
    this.history = [{ x: this.x, y: this.y }];
    this.angle = 0;
    this.timer = this.maxLength * 2;
    this.color = this.effect.colors[Math.floor(Math.random() * this.effect.colors.length)]
  }
  draw(context) {
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.strokeStyle = this.color
    context.stroke();
  }
  update() {
    this.timer--;
    let x = Math.floor(this.x / this.effect.cellSize);
    let y = Math.floor(this.y / this.effect.cellSize);
    let index = y * this.effect.cols + x;
    this.angle = this.effect.flowFields[index];
    this.speedX = Math.cos(this.angle);
    this.speedY = Math.sin(this.angle);
    if (this.timer >= 1) {
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
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxLength * 2;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 5;
    this.cols;
    this.rows;
    this.flowFields = [];
    this.zoom = 0.02;
    this.curve = 10;
    this.debug = false
    this.colors = ["#2E0249", "#570A57","#A91079","#F806CC"]
    this.init();
    window.addEventListener("keydown", e => {
        if (e.key === "d") this.debug = !this.debug 
    })
    window.addEventListener("resize", e => {
        this.resize(e.target.innerWidth, e.target.innerHeight) 
    })
  }
  init() {
    this.cols = Math.floor(this.width / this.cellSize);
    this.rows = Math.floor(this.height / this.cellSize);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let angle =
          (Math.sin(j * this.zoom) + Math.cos(i * this.zoom)) * this.curve;
        this.flowFields.push(angle);
      }
    }
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particles(this));
    }
  }
  drawGrid(context) {
      context.save();
      context.globalAlpha = 0.25;
      context.strokeStyle = "violet"
      for (let i = 0; i < this.cols; i++) {
        context.beginPath();
        context.moveTo(i * this.cellSize, 0);
        context.lineTo(i * this.cellSize, this.height);
        context.stroke();
    }
    for (let i = 0; i < this.rows; i++) {
        context.beginPath();
        context.moveTo(0, i * this.cellSize);
        context.lineTo(this.width, i * this.cellSize);
        context.stroke();
    }
    context.restore();
  }
  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  render(context) {
    this.debug && this.drawGrid(context)
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

const effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}
animate();
console.log(effect);

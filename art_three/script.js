window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.canvasWidth;
      this.y = this.effect.canvasHeight;
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = this.effect.gap;
      this.dx = 0;
      this.dy = 0;
      this.vx = 0;
      this.vy = 0;
      this.force = 0;
      this.angle = 0;
      this.distance = 0;
      this.friction = Math.random() * 0.6 + 0.15;
      this.ease = Math.random() * 0.1 + 0.01;
    }
    draw() {
      if (this.effect.context.fillStyle !== this.color) {
        this.effect.context.fillStyle = this.color;
      }
      this.effect.context.fillRect(
        this.x,
        this.y,
        this.size,
        this.size
      );
    }
    update() {
        this.dx = this.effect.mouse.x - this.x
        this.dy = this.effect.mouse.y - this.y
        this.distance = (this.dx * this.dx) + (this.dy * this.dy)
        this.force = -this.effect.mouse.radius / this.distance
        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx)
            this.vx += this.force * Math.cos(this.angle)
            this.vy += this.force * Math.sin(this.angle)
        }
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
        this.y += (this.vy *= this.friction) + ( this.originY - this.y) * this.ease
    }
  }

  class Effect {
    constructor(context, canvas) {
      this.context = context;
      this.canvasHeight = canvas.height;
      this.canvasWidth = canvas.width;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = 80;
      this.lineHeight = this.fontSize * 0.8;
      this.maxTextWidth = this.canvasWidth * 0.75;
      this.textInput = document.getElementById("textInput");
      this.textInput.addEventListener("keyup", (e) => {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.wrapText(e.target.value);
      });
      this.particles = [];
      this.gap = 3;
      this.mouse = {
        radius: 20000,
        x: 0,
        y: 0,
      };
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });
    }
    wrapText(text) {
      const gradient = this.context.createLinearGradient(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      gradient.addColorStop("0.4", "red");
      gradient.addColorStop("0.5", "cyan");
      gradient.addColorStop("0.6", "purple");
      this.context.fillStyle = gradient;
      this.context.strokeStyle = "yellow";
      this.context.font = this.fontSize + "px Helvetica";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.lineWidth = 5;
      // break words in multiline
      let lineArray = [];
      let lineCounter = 0;
      let line = "";
      let words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        let textLine = line + words[i] + " ";
        if (this.context.measureText(textLine).width > this.maxTextWidth) {
          lineCounter++;
          line = words[i] + " ";
        } else {
          line = textLine;
        }
        lineArray[lineCounter] = line;
      }
      let textHeight = this.lineHeight * lineCounter;
      this.textY = this.canvasHeight / 2 - textHeight / 2;
      lineArray.forEach((el, i) => {
        this.context.strokeText(
          el,
          this.textX + 2,
          this.textY + i * this.lineHeight + 1.5
        );
        this.context.fillText(el, this.textX, this.textY + i * this.lineHeight);
      });
      this.convertToParticle();
    }
    convertToParticle() {
      this.particles = [];
      const pixels = this.context.getImageData(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      ).data;
      this.context.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasWidth; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 0) {
            const red = pixels[index];
            const blue = pixels[index + 1];
            const green = pixels[index + 2];
            const color = `rgb(${red}, ${blue}, ${green})`;
            this.particles.push(new Particle(this, x, y, color));
          }
        }
      }
      console.log(this.particles);
    }
    render() {
      this.particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
    }
  }
  const effect = new Effect(context, canvas);
  effect.wrapText("Hello bro how is it");
console.log(context)
  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
  }
  animate()
});

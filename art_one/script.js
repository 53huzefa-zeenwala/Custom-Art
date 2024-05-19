const canvas = document.getElementById("canvas1")
const ctx = canvas.getContext('2d')
canvas.width = 700
canvas.height = 900

// global canvas settings
ctx.lineWidth = 10
ctx.strokeStyle = "magenta"
const gradient = ctx.createLinearGradient(0,0, canvas.width, canvas.height)

gradient.addColorStop('0.2', 'pink')
gradient.addColorStop('0.3', 'red')
gradient.addColorStop('0.4', 'orange')
gradient.addColorStop('0.5', 'yellow')
gradient.addColorStop('0.6', 'green')
gradient.addColorStop('0.7', 'cyan')
gradient.addColorStop('0.8', 'violet')
ctx.strokeStyle = gradient

class Line {
    constructor(canvas) {
        this.canvas = canvas
        this.x = Math.random() * this.canvas.width
        this.y = Math.random() * this.canvas.height
        this.history = [{x: this.x, y: this.y}]
        this.lineWidth = Math.floor(Math.random() * 15 + 1)
        this.hue = Math.floor(Math.random() * 360)
        this.maxLength = Math.floor(Math.random() * 150 + 10)
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = 7
        this.lifeSpan = this.maxLength * 3
        this.timer = 0
    }
    draw(context) {
        // context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`
        context.lineWidth = this.lineWidth
        context.beginPath()
        context.moveTo(this.history[0].x, this.history[0].y)
        for (let i = 0; i < this.history.length; i++) {
            context.lineTo(this.history[i].x, this.history[i].y)            
        }
        context.stroke()
    }
    update() {
        this.timer++
        if (this.timer < this.lifeSpan) {
            this.x += this.speedX + Math.random() * 20 - 10
            this.y += this.speedY + Math.random() * 20 - 10
            this.history.push({x: this.x, y: this.y})
            if (this.history.length > this.maxLength) {
                this.history.shift()
            }
        } else if (this.history.length <= 1) {
            this.reset()
        } else {
            this.history.shift()
        }
    }
    reset () {
        this.x = Math.random() * this.canvas.width
        this.y = Math.random() * this.canvas.height
        this.history = [{x: this.x, y: this.y}]
        this.timer = 0
    }
}

const lineArray = []
const NUMBER_OF_LINE = 100
for (let i = 0; i < NUMBER_OF_LINE; i++) {
    lineArray.push(new Line(canvas))    
}

function animate() {
    ctx.clearRect(0 , 0, canvas.width, canvas.height)
    // draw line
    lineArray.forEach(object => {
        object.draw(ctx)
        object.update()
    })
    //update line
    requestAnimationFrame(animate)
}
animate()
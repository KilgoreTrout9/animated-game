window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1280;
  canvas.height = 720;

  ctx.fillStyle = 'white';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'black';
  ctx.font = '40px Helvetica';
  ctx.textAlign = 'center';

  let animationStep = 0;

  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 40;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 5;
      this.spriteWidth = 255;
      this.spriteHeight = 256;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.maxAnimations = 59
      this.frameX;
      this.frameY;
      this.image = document.getElementById('bull');
    }

    restart() {
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 90;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
        this.spriteWidth, this.spriteHeight,
        this.spriteX, this.spriteY,
        this.width, this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        context.beginPath();
        context.moveTo(this.collisionX, this.collisionY);
        context.lineTo(this.game.mouse.x, this.game.mouse.y);
        context.stroke();
      }
    }
    update() {
      this.dx = this.game.mouse.x - this.collisionX;
      this.dy = this.game.mouse.y - this.collisionY;
      const distance = Math.hypot(this.dy, this.dx);

      //animation angles
      const moveAngle = Math.atan2(this.dy, this.dx);
      if (moveAngle >= -1.96 && moveAngle < -1.17) this.frameY = 0;
      if (moveAngle >= -1.17 && moveAngle < -0.39) this.frameY = 1;
      if (moveAngle >= -0.39 && moveAngle < 0.39) this.frameY = 2;
      if (moveAngle >= 0.39 && moveAngle < 1.17) this.frameY = 3;
      if (moveAngle >= 1.17 && moveAngle < 1.96) this.frameY = 4;
      if (moveAngle >= 1.96 && moveAngle < 2.74) this.frameY = 5;
      if (moveAngle >= 2.74 || moveAngle < -2.74) this.frameY = 6;
      if (moveAngle >= -2.74 && moveAngle < -1.96) this.frameY = 7;
      this.frameX = animationStep % this.maxAnimations;
      if (distance > this.speedModifier) {
        this.speedX = this.dx / distance || 0;
        this.speedY = this.dy / distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }
      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 90;

      //horizontal boundaries
      if (this.collisionX < this.collisionRadius) this.collisionX = this.collisionRadius;
      else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius;

      //vertical boundaries
      if (this.collisionY < this.game.topMargin + this.collisionRadius) this.collisionY = this.game.topMargin + this.collisionRadius;
      else if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius;

      //collisions with obstacles
      this.game.obstacles.forEach(obstacle => {
        let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
        }
      })
    }
  }

  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 60;
      this.image = document.getElementById('obstacles');
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 70;
      this.frameX = Math.floor(Math.random() * 4);
      this.frameY = Math.floor(Math.random() * 3);
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
        this.spriteWidth, this.spriteHeight,
        this.spriteX, this.spriteY,
        this.width, this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {

    }
  }

  class Egg {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 50;
      this.margin = this.collisionRadius * 2;
      this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
      this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
      this.image = document.getElementById('egg');
      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.hatchTimer = 0;
      this.hatchInterval = 5000;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(
        this.image,
        0, 0, this.spriteWidth, this.spriteHeight,
        this.spriteX, this.spriteY,
        this.width, this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        const displayTimer = (this.hatchTimer / 1000).toFixed(1);
        context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 1.5);
      }
    }

    update(deltaTime) {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 10;
      let collisionItems = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
      collisionItems.forEach(item => {
        let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, item);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = item.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = item.collisionY + (sumOfRadii + 1) * unit_y
        }
      })

      //hatching
      if (this.hatchTimer > this.hatchInterval) {
        //remove the egg and replace with a larva
        this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
        this.markedForDeletion = true;
        this.game.removeGamePieces();
      } else {
        this.hatchTimer += deltaTime;
      }
    }
  }

  class Larva {
    constructor(game, x, y) {
      this.game = game;
      this.collisionRadius = 30;
      this.collisionX = x;
      this.collisionY = y;
      this.speedY = Math.random() * 2 + 1
      this.image = document.getElementById('larva');
      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(
        this.image,
        0, 0, this.spriteWidth, this.spriteHeight,
        this.spriteX, this.spriteY,
        this.width, this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }

    update() {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 50;
      this.collisionY -= this.speedY;
      if (this.collisionY <= this.game.topMargin - this.height * 0.5) {
        this.markedForDeletion = true;
        this.game.removeGamePieces();
        this.game.score++;
        for (let i = 0; i < 3; i++) {
          this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
        }
      }
      //collision with statics or player
      let collisionItems = [...this.game.obstacles, ...this.game.eggs, this.game.player];
      collisionItems.forEach(item => {
        let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, item);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = item.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = item.collisionY + (sumOfRadii + 1) * unit_y
        }
      })
      //collision with enemies
      this.game.enemies.forEach(enemy => {
        if (this.game.checkCollision(this, enemy)[0]) {
          this.markedForDeletion = true;
          this.game.removeGamePieces();
          this.game.lostHatchlings++;
          for (let i = 0; i < 3; i++) {
            this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'blue'));
          }
        }
      })
    }
  }

  class Enemy {
    constructor(game, index) {
      this.game = game;
      this.collisionRadius = 30;
      this.collisionX = this.game.width;
      this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.collisionRadius));
      this.speedX = Math.random() * 3 + 0.5;
      this.image = document.getElementById('toads');
      this.spriteWidth = 140;
      this.spriteHeight = 260;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.frameX = 0;
      this.frameY = index % 4;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
        this.spriteWidth, this.spriteHeight,
        this.spriteX, this.spriteY,
        this.width, this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 90;
      this.collisionX -= this.speedX;
      if (this.spriteX + this.width < 0) {
        this.collisionX = this.game.width;
        this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.collisionRadius));
      }
      let collisionItems = [this.game.player, ...this.game.obstacles];
      collisionItems.forEach(item => {
        let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, item);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = item.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = item.collisionY + (sumOfRadii + 1) * unit_y
        }
      })
    }
  }

  class Particle {
    constructor(game, x, y, color) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.color = color;
      this.radius = Math.floor(Math.random() * 10 + 5);
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 2 + 0.5;
      this.angle = 0;
      this.va = Math.random() * 0.1 + 0.01;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();
    }
  }

  class Firefly extends Particle {
    update() {
      this.angle += this.va;
      this.collisionX += Math.cos(this.angle) * this.speedX;
      this.collisionY -= this.speedY;
      if (this.collisionY < 0 - this.radius) {
        this.markedForDeletion = true;
        this.game.removeGamePieces();
      }
    }
  }

  class Spark extends Particle {
    update() {
      this.angle += this.va * 0.5;
      this.collisionX -= Math.cos(this.angle) * this.speedX;
      this.collisionY -= Math.sin(this.angle) * this.speedY;
      if (this.radius > 0.1) this.radius -= 0.05;
      if (this.radius < 0.15) {
        this.markedForDeletion = true;
        this.game.removeGamePieces();
      }
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 250;
      this.debug = true;
      this.fps = 60;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.player = new Player(this);
      this.obstacles = [];
      this.numberOfObstacles = 10;
      this.eggs = [];
      this.maxEggs = 5;
      this.eggInterval = 1000;
      this.eggTimer = 0;
      this.hatchlings = []
      this.enemies = [];
      this.maxEnemies = 5;
      this.enemyInterval = 2000;
      this.enemyTimer = 0;
      this.gamePieces = [];
      this.particles = [];
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false
      }
      this.score = 0;
      this.lostHatchlings = 0;
      this.gameOver = false;
      this.winningScore = 10;
      this.losingScore = 10;

      //event listeners
      window.addEventListener('mousedown', (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = true;
      })
      window.addEventListener('mouseup', (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      })
      window.addEventListener('mousemove', (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
        }
      })
      window.addEventListener('keydown', (e) => {
        if (e.key === 'd') this.debug = !this.debug;
        else if (e.key === 'r') this.restart();
      })
    }

    render(context, deltaTime) {
      if (this.timer > this.interval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        //take all pieces on the board, sort vertically then draw to show depth
        this.gamePieces = [
          ...this.eggs,
          ...this.hatchlings,
          ...this.obstacles,
          ...this.enemies,
          ...this.particles,
          this.player
        ];
        this.gamePieces.sort((a, b) => a.collisionY - b.collisionY);
        this.gamePieces.forEach(piece => {
          piece.draw(context);
          piece.update(deltaTime);
        });
        this.timer = 0;
      }
      this.timer += deltaTime;

      // add eggs periodically
      if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
        this.addEgg();
        this.eggTimer = 0;
      } else {
        this.eggTimer += deltaTime;
      }

      // draw game score
      context.save();
      context.textAlign = 'left';
      context.fillText('Score: ' + this.score, 25, 50);
      if (this.debug) {
        context.fillText('Lost: ' + this.lostHatchlings, 25, 100);
      }
      context.restore();

      //game endings
      if (this.score >= this.winningScore || this.lostHatchlings >= this.losingScore) {
        this.gameOver = true;
        let message1;
        let message2;
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.5)';
        context.fillRect(0, 0, this.width, this.height);
        context.fillStyle = 'white';
        context.textAlign = 'center';
        if (this.score >= this.winningScore) {
          if (this.lostHatchlings <= 5) {
            message1 = "Bullseye!!!";
            message2 = "You really bullied those toads";
          } else {
            message1 = "Small Victory";
            message2 = "Don't let the toadies eat so much next time";
          }
        } else {
          message1 = "Bollocks!!!";
          message2 = `You lost ${this.lostHatchlings}! Improvements are necessary`;
          context.restore();
        }
        context.font = '130px Helvetica';
        context.fillText(message1, this.width * 0.5, this.height * 0.5 - 30);
        context.font = '40px Helvetica';
        context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
        context.fillText(`Final Score: ${this.score}. Press 'R' to butt heads again`, this.width * 0.5, this.height * 0.5 + 80);
        context.restore();
      }
    }

    checkCollision(a, b) {
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy, dx);
      const sumOfRadii = a.collisionRadius + b.collisionRadius;
      return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
    }

    addEgg() {
      this.eggs.push(new Egg(this));
    }

    addEnemy(index) {
      this.enemies.push(new Enemy(this, index));
    }

    removeGamePieces() {
      this.eggs = this.eggs.filter(egg => !egg.markedForDeletion);
      this.hatchlings = this.hatchlings.filter(larva => !larva.markedForDeletion);
      this.particles = this.particles.filter(particle => !particle.markedForDeletion);
    }

    restart() {
      this.player.restart();
      this.obstacles = [];
      this.enemies = [];
      this.eggs = [];
      this.hatchlings = [];
      this.particles = [];
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false
      };
      this.score = 0;
      this.hatchlings = 0;
      this.gameOver = false;
      this.init();
    }

    init() {
      let attempts = 0;
      for (let i = 0; i < this.maxEnemies; i++) {
        this.addEnemy(i)
      }
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        let testObstacle = new Obstacle(this);
        let overlap = false;
        this.obstacles.forEach(obstacle => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy, dx);
          const distanceBuffer = 100;
          const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
          if (distance < sumOfRadii) {
            overlap = true;
          }
        })
        const spacing = testObstacle.collisionRadius * 2;
        if (!overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + spacing &&
          testObstacle.collisionY < this.height - spacing)
          this.obstacles.push(testObstacle);
        attempts++;
      }
    }
  }

  const game = new Game(canvas);
  game.init();

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.render(ctx, deltaTime);
    if (!game.gameOver) {
      requestAnimationFrame(animate);
    }
    animationStep++
  }

  animate(0);

})
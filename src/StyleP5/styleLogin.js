import nohemiBold from '../Fonts/Nohemi-Bold.otf';

window.filling = 0;

function sketch(p) {

  let f1;
  let grad;

  var particles = new Array(50);
  var totalFrames = 240;
  let counter = 0;

  function radialGradient(sX, sY, sR, eX, eY, eR, colorS, colorE) {
    let gradient = p.drawingContext.createRadialGradient(
      sX, sY, sR, eX, eY, eR
    );
    gradient.addColorStop(0, colorS);
    gradient.addColorStop(1, colorE);
    p.drawingContext.fillStyle = gradient;
  }

  function noiseLoop(diameter, min, max, rnd) {
    let cx = p.random(rnd || 1000);
    let cy = p.random(rnd || 1000);
    return function (angle) {
      let xoff = p.map(p.cos(angle), -1, 1, cx, cx + diameter);
      let yoff = p.map(p.sin(angle), -1, 1, cy, cy + diameter);
      let zoff = p.sin(angle) * 0.0001;
      let r = p.noise(xoff, yoff, zoff);
      return p.map(r, 0, 1, min, max);
    };
  }

  class Particle {

    constructor() {
      this.xn = noiseLoop(0.05, -p.windowWidth, p.windowWidth * 2);
      this.yn = noiseLoop(0.05, -p.windowHeight, p.windowHeight * 2);
      this.rn = noiseLoop(0.5, 0, 255);
      this.gn = noiseLoop(0.5, 0, 255);
      this.bn = noiseLoop(0.5, 0, 255);
      this.dn = noiseLoop(0.5, 1, 10);
      this.an = noiseLoop(1, 5, 200);
    }

    render(a) {
      p.noStroke();
      p.fill(this.rn(a), this.gn(a), this.bn(a), this.an(a));
      p.circle(this.xn(a), this.yn(a), this.dn(a) / 2);
    }
  }

  p.preload = function() { 
    //img = p.loadImage(spotifyLogo); 
    f1 = p.loadFont(nohemiBold);
  } 

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
    p.textFont(f1);
    p.textAlign(p.CENTER, p.CENTER);
    grad = [p.random(125/2), p.random(125/2), p.random(125/2)];
    //img = p.loadImage('../Images/Spotify_Logo_RGB_White.png');

    for (let i = 0; i < particles.length; i++) {
      particles[i] = new Particle();
    }
  }

  p.draw = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    p.push();
    radialGradient(p.windowWidth / 2, p.windowHeight / 2 , 0, p.windowWidth / 2 , p.windowHeight / 2, p.windowWidth/2,
                   p.color(0, 0, 0, 0), p.color(grad[0],grad[1],grad[2], 200));
    p.rect(0, 0, p.windowWidth, p.windowHeight);
    p.pop();

    p.textSize(p.windowWidth/30);
    p.fill(window.filling);

    if(localStorage.getItem("username")) p.text("Welcome, "+localStorage.getItem("username"), p.windowWidth/2, p.windowHeight/2);
    else p.text("Turn your Spotify activity into\n an interactive ecosystem.", p.windowWidth/2, p.windowHeight/2);
    
    if (window.filling < 255) window.filling += 10;

    let percent = (counter % totalFrames) / totalFrames;
    let a = percent * p.TWO_PI;
    for (let i = 0; i < particles.length; i++) {
      particles[i].render(a);
    }
    counter++;
  }
}

export default sketch;

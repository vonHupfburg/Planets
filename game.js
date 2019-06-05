function draw() {
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.clearRect(0, 0, 1000, 1000);

  // Sun
  for (var index = 0; index < orbits.length; index++){
    orbits[index].drawAll(ctx);
  }

  window.requestAnimationFrame(draw);
  time++;
}

class Orbit {
  constructor(orbitThis, orbitDistance, orbitPeriod, fillStyle, planetWidth) {
    this.orbitThis = orbitThis;
    this.orbitDistance = orbitDistance;
    this.orbitPeriod = orbitPeriod;
    this.orbitCurrent = 0;
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
    this.fillStyle = fillStyle;
    this.planetWidth = planetWidth;
  }

  getNextLocs(){
    var orbitalTime = time - (Math.floor(time/this.orbitPeriod) * this.orbitPeriod);
    this.orbitCurrent = (orbitalTime / this.orbitPeriod);
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
  }

  getNextLocX(){
    if (this.orbitThis === null){
      return 500;
    } else {
      return this.orbitThis.locX + this.orbitDistance * Math.sin(2*Math.PI*this.orbitCurrent);
    }
  }

  getNextLocY(){
    if (this.orbitThis === null){
      return 500;
    } else {
      return this.orbitThis.locY + this.orbitDistance * Math.cos(2*Math.PI*this.orbitCurrent);
    }
  }

  drawAll(ctx){
    if (this.orbitThis !== null){
      this.drawOrbit(ctx);
      this.getNextLocs();
    }
    this.drawPlanet(ctx);
  }

  drawOrbit(ctx){
    ctx.beginPath();
    ctx.arc(this.orbitThis.locX, this.orbitThis.locY, this.orbitDistance, 0, 2*Math.PI)
    ctx.stroke();
  }

  drawPlanet(ctx){
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, this.planetWidth, 0, 2*Math.PI);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
  }
}

var orbits = [];
var time = 0;

orbits.push(new Orbit(null, 0, 0, '#ffff00', 50));
orbits.push(new Orbit(orbits[0], 120, 100, "#ff9000", 5));
orbits.push(new Orbit(orbits[0], 170, 225, "#aaaaaa", 15));
orbits.push(new Orbit(orbits[0], 220, 365, "#30aaaa", 20));
orbits.push(new Orbit(orbits[0], 270, 687, "#909000", 12));
orbits.push(new Orbit(orbits[0], 320, 12*365, "orange", 30));
orbits.push(new Orbit(orbits[0], 370, 20*365, "yellow", 22));
orbits.push(new Orbit(orbits[0], 420, 84*365, "#00ffff", 20));
orbits.push(new Orbit(orbits[0], 470, 165*365, "#0000ff", 25));
orbits.push(new Orbit(orbits[3], 30, 27, '#909090', 5));
window.requestAnimationFrame(draw);

function draw() {
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.clearRect(0, 0, 1000, 1000);

  // Sun
  ctx.beginPath();
  ctx.arc(sunLocX, sunLocY, 100, 0, 2*Math.PI);
  ctx.fillStyle = "yellow";
  ctx.fill();


  for (var index = 0; index < orbits.length; index++){
    orbits[index].drawOrbit(ctx);
    orbits[index].drawPlanet(ctx);
  }

  window.requestAnimationFrame(draw);
  time++;
}

class Orbit {
  constructor(distanceFromSun, orbitalPeriod, fillStyle, planetWidth) {
    this.distanceFromSun = distanceFromSun;
    this.orbitalPeriod = orbitalPeriod;
    this.fillStyle = fillStyle;
    this.planetWidth = planetWidth;
  }

  drawOrbit(ctx){
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunLocX, sunLocY, this.distanceFromSun, 0, 2*Math.PI)
    ctx.stroke();
    ctx.restore();
  }

  drawPlanet(ctx){
    var orbitalTime = time - (Math.floor(time/this.orbitalPeriod) * this.orbitalPeriod);
    ctx.save();
    ctx.translate(sunLocX, sunLocY);
    ctx.rotate(Math.PI * 2 * (orbitalTime/this.orbitalPeriod));
    ctx.translate(-sunLocX, -sunLocY);
    ctx.beginPath();
    ctx.arc(sunLocX, sunLocY + this.distanceFromSun, this.planetWidth, 0, 2*Math.PI);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
    ctx.restore();
  }
}

var sunLocX = 500;
var sunLocY = 500;
var orbits = [];
var time = 0;

orbits.push(new Orbit(120, 100, "#ff9000", 5));
orbits.push(new Orbit(170, 225, "#aaaaaa", 15));
orbits.push(new Orbit(220, 365, "#30aaaa", 20));
orbits.push(new Orbit(270, 687, "#909000", 12));
orbits.push(new Orbit(320, 12*365, "orange", 30));
orbits.push(new Orbit(370, 20*365, "yellow", 22));
orbits.push(new Orbit(420, 84*365, "#00ffff", 20));
orbits.push(new Orbit(470, 165*365, "#0000ff", 25));

window.requestAnimationFrame(draw);

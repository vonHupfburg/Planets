function draw() {
  ctx.clearRect(0, 0, 1000, 1000);
  // Sun
  for (var index = 0; index < orbits.length; index++){
    orbits[index].drawAll();
  }

  window.requestAnimationFrame(draw);
  time++;
}

function selectionEvent(){
  barReal = 9999;
  barIndex = 0;
  for (var indexOrbits = 0; indexOrbits < orbits.length; indexOrbits++){
    if (orbits[indexOrbits].canBeSelected === true){
      var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - 500), 2)) + (Math.pow(Math.abs(event.clientY - 500), 2)), 0.5);
      var tempReal = Math.abs(tempReal - orbits[indexOrbits].orbitDistance);
      if (tempReal < barReal){
        barReal = tempReal;
        barIndex = indexOrbits;
      }
    }
  }
  selectedItem = orbits[barIndex];
}

class Orbit {
  constructor(orbitThis, orbitDistance, fillStyle, planetWidth, canBeSelected, rotatesBackwards) {
    this.orbitThis = orbitThis;
    this.orbitDistance = orbitDistance;
    this.orbitCurrent = 0;
    this.fillStyle = fillStyle;
    this.planetWidth = planetWidth;
    this.selectionOpacity = 0;
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
    this.orbitPeriod = this.getOrbitPeriod();
    this.rotatesBackwards = rotatesBackwards;
    this.canBeSelected = canBeSelected;
  }

  getOrbitPeriod(){
    if (this.orbitThis !== null){
      return 100 * Math.PI * (((this.orbitDistance)^3)/(this.orbitThis.planetWidth));
    } else {
      return 0;
    }
  }

  getNextLocs(){
    var orbitalTime = time - (Math.floor(time/this.orbitPeriod) * this.orbitPeriod);
    if (this.rotatesBackwards === true){
      this.orbitCurrent = 1 - (orbitalTime / this.orbitPeriod);
    } else {
      this.orbitCurrent = (orbitalTime / this.orbitPeriod);
    }

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

  drawAll(){
    if (this.orbitThis !== null){
      this.getNextLocs();
      this.drawOrbit();
    }
    this.drawPlanet();
  }

  changeOpacity(){
    if (this.selectionOpacity <= 0){
      this.opacityIncreasing = true;
    } else if (this.selectionOpacity >= 100) {
      this.opacityIncreasing = false;
    }
    if (this.opacityIncreasing === true){
      this.selectionOpacity = this.selectionOpacity + 1.5;
    } else {
      this.selectionOpacity = this.selectionOpacity - 1.5;
    }
  }

  drawOrbit(){
    if (selectedItem == this || selectedItem === this.orbitThis & selectedItem !== orbits[0]){
      this.drawOrbitSelection();
    }
    ctx.beginPath();
    ctx.arc(this.orbitThis.locX, this.orbitThis.locY, this.orbitDistance, 0, 2*Math.PI)
    ctx.stroke();
  }

  drawOrbitSelection(){
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.orbitThis.locX, this.orbitThis.locY, this.orbitDistance, 0, 2*Math.PI)
    ctx.lineWidth = 5;
    ctx.globalAlpha = (this.selectionOpacity / 100);
    ctx.strokeStyle = "#ffcc00";
    ctx.stroke();
    ctx.restore();
  }

  drawPlanet(){
    if (selectedItem === this || selectedItem === this.orbitThis  & selectedItem !== orbits[0]){
      this.changeOpacity();
      this.drawPlanetSelection();
    }
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, this.planetWidth, 0, 2*Math.PI);
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
  }

  drawPlanetSelection(){
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, this.planetWidth + 5, 0, 2*Math.PI);
    ctx.globalAlpha = (this.selectionOpacity / 100);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.restore();
  }
}

var ctx = document.getElementById('canvas').getContext('2d');
document.getElementById('canvas').addEventListener("click", selectionEvent);
var orbits = [];
var time = 0;

orbits.push(new Orbit(null, 0, '#ffff00', 50, true, false));
orbits.push(new Orbit(orbits[0], 80, "#ff9000", 7, true, false));
orbits.push(new Orbit(orbits[0], 100, "#aaaaaa", 7, true, false));
orbits.push(new Orbit(orbits[0], 120, "#30aaaa", 7, true, false));
orbits.push(new Orbit(orbits[0], 145, "#909000", 7, true, false));
orbits.push(new Orbit(orbits[0], 230, "orange", 22, true, false));
orbits.push(new Orbit(orbits[0], 300, "#aaccaa", 17, true, false));
orbits.push(new Orbit(orbits[0], 340, "#ffccff", 15, true, true));
orbits.push(new Orbit(orbits[0], 400, "#0000ff", 40, true, false));
orbits.push(new Orbit(orbits[3], 10, '#909090', 3, false, false));
orbits.push(new Orbit(orbits[4], 10, '#909090', 3, false, false));
orbits.push(new Orbit(orbits[5], 30, '#909090', 3, false, true));
orbits.push(new Orbit(orbits[5], 38, '#909090', 3, false, false));

var selectedItem = orbits[0];

window.requestAnimationFrame(draw);

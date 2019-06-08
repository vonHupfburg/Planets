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
      var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - canvasMidX), 2)) + (Math.pow(Math.abs(event.clientY - canvasMidY), 2)), 0.5);
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
  constructor(orbitThis, planetWidth, canBeSelected) {
    this.orbitThis = orbitThis;
    this.planetWidth = planetWidth;
    this.orbitDistance = 0;
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
    this.orbitPeriod = 0;
    if (this.planetWidth !== "sun"){
      this.planetBlue = this.getRandomBoo();
      this.planetRed = this.getRandomBoo();
      this.planetGreen = this.getRandomBoo();
    }
    this.planetBlue = false;
    this.planetRed = false;
    this.planetGreen = false;
    this.orbitCurrent = 0;
    this.selectionOpacity = 0;
    this.canBeSelected = canBeSelected;
  }

  getPlanetWidthPx(){
    if (this.planetWidth === "small"){
      return 4;
    } else if (this.planetWidth === "medium") {
      return 10;
    } else if (this.planetWidth === "large") {
      return 25;
    } else {
      return 50;
    }
  }

  getRandomBoo(){
    if (Math.random() < 0.30){
      return true;
    }
    return false;
  }

  getPlanetColor(){
    var tempString = "#";
    if (this.planetRed === true){
      tempString = tempString + "ff"
    } else {
      tempString = tempString + "00"
    }
    if (this.planetGreen === true){
      tempString = tempString + "ff"
    } else {
      tempString = tempString + "00"
    }
    if (this.planetBlue === true){
      tempString = tempString + "ff"
    } else {
      tempString = tempString + "00"
    }
    if (this.planetRed === false && this.planetBlue === false && this.planetGreen === false){
      tempString = "#909090"
    }
    if (this.planetRed === true && this.planetBlue === true && this.planetGreen === true){
      tempString = "#ffffdd"
    }
    if (this.planetWidth === "sun"){
      tempString = "#ffff00";
    }
    if (this.planetWidth === "moon"){
      tempString = "#909090"
    }
    return tempString;
  }

  getOrbitPeriod(){
    if (this.orbitThis !== null){
      return 100 * Math.PI * (((this.orbitDistance)^3)/(this.orbitThis.getPlanetWidthPx()));
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
    ctx.save();
    if (selectedItem == this || selectedItem === this.orbitThis & selectedItem !== orbits[0]){
      this.drawOrbitSelection();
    }
    ctx.beginPath();
    ctx.arc(this.orbitThis.locX, this.orbitThis.locY, this.orbitDistance, 0, 2*Math.PI)
    ctx.strokeStyle = "#909090"
    ctx.stroke();
    ctx.restore();
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
    ctx.save();
    if (selectedItem === this || selectedItem === this.orbitThis  & selectedItem !== orbits[0]){
      this.changeOpacity();
      this.drawPlanetSelection();
    }
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, this.getPlanetWidthPx(), 0, 2*Math.PI);
    ctx.fillStyle = this.getPlanetColor();
    ctx.fill();
    ctx.restore();
    if (orbits[0] !== this){
      ctx.beginPath();
      ctx.arc(this.locX, this.locY, this.getPlanetWidthPx(), 0, 2*Math.PI);
      ctx.stroke();
    }
  }

  drawPlanetSelection(){
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, this.getPlanetWidthPx() + 5, 0, 2*Math.PI);
    ctx.globalAlpha = (this.selectionOpacity / 100);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.restore();
  }
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.addEventListener("click", selectionEvent);
var orbits = [];
var time = 0;

var canvasMidX = canvas.getBoundingClientRect().left + 500;
var canvasMidY = canvas.getBoundingClientRect().top + 500;

orbits.push(new Orbit(null, "sun", true));
orbits.push(new Orbit(orbits[0], "small", true));
orbits.push(new Orbit(orbits[0], "medium", true));
orbits.push(new Orbit(orbits[0], "medium", true));
orbits.push(new Orbit(orbits[0], "small", true));
orbits.push(new Orbit(orbits[0], "large", true));
orbits.push(new Orbit(orbits[0], "large", true));
orbits.push(new Orbit(orbits[0], "large", true));
orbits.push(new Orbit(orbits[0], "large", true));

var selectedItem = orbits[0];

orbitDistances();

window.requestAnimationFrame(draw);

var tempButton = document.getElementById('buttonSmall');
tempButton.addEventListener("click", clickButtonSmall);

var tempButton = document.getElementById('buttonMedium');
tempButton.addEventListener("click", clickButtonMedium);

var tempButton = document.getElementById('buttonLarge');
tempButton.addEventListener("click", clickButtonLarge);

var tempButton = document.getElementById('buttonRed');
tempButton.addEventListener("click", clickButtonRed);

var tempButton = document.getElementById('buttonGreen');
tempButton.addEventListener("click", clickButtonGreen);

var tempButton = document.getElementById('buttonBlue');
tempButton.addEventListener("click", clickButtonBlue);



function clickButtonSmall(){
  selectedItem.planetWidth = "small";
  orbitDistances();
}

function clickButtonMedium(){
  selectedItem.planetWidth = "medium";
  orbitDistances();
}

function clickButtonLarge(){
  selectedItem.planetWidth = "large";
  orbitDistances();
}

function clickButtonRed(){
  if (selectedItem.planetRed === true){
    selectedItem.planetRed = false;
  } else {
    selectedItem.planetRed = true;
  }
}

function clickButtonBlue(){
  if (selectedItem.planetBlue === true){
    selectedItem.planetBlue = false;
  } else {
    selectedItem.planetBlue = true;
  }
}

function clickButtonGreen(){
  if (selectedItem.planetGreen === true){
    selectedItem.planetGreen = false;
  } else {
    selectedItem.planetGreen = true;
  }
}

function orbitDistances(){
  console.log(" ")
  var tempReal = 0;
  var tempBoo = false;
  for (var indexOrbits = 1; indexOrbits < orbits.length; indexOrbits++){
    console.log(orbits[indexOrbits].getPlanetWidthPx())
    tempReal = tempReal + 5 + orbits[indexOrbits - 1].getPlanetWidthPx() + orbits[indexOrbits].getPlanetWidthPx();
    console.log(indexOrbits + ": " + tempReal);
    if (indexOrbits < (orbits.length/2)){
      orbits[indexOrbits].orbitDistance = tempReal + 50;
    } else {
      orbits[indexOrbits].orbitDistance = tempReal + 100;
    }
;
    orbits[indexOrbits].orbitPeriod = orbits[indexOrbits].getOrbitPeriod();
  }
}

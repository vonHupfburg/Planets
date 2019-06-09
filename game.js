class Planet {
  constructor(solarSystem, planetType, canBeSelected) {
    this.solarSystem = solarSystem;
    this.canvas = this.solarSystem.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.selectionOpacity = 0;
    this.canBeSelected = canBeSelected;
    this.planetType = planetType;
    this.locX = rescaleValue(500, this.canvas);
    this.locY = rescaleValue(500, this.canvas);
    this.planetBlue = false;
    this.planetRed = false;
    this.planetGreen = false;
  }

  getPlanetWidthPx(){
    var tempReal = 0;
    if (this.planetType === "small"){
      tempReal = 4;
    } else if (this.planetType === "medium") {
      tempReal = 10;
    } else if (this.planetType === "large") {
      tempReal = 18;
    } else if (this.planetType === "sun") {
      tempReal = 70;
    } else {
      tempReal = 0;
    }
    return tempReal
  }

  getPlanetColor(){
    if (this.planetType === "sun"){
      return "#ffff00";
    }
    if (this.planetType === "moon"){
      return "#909090"
    }
    //
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
    return tempString;
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

  drawPlanet(){
    this.ctx.save();
    if (this.solarSystem.selectedItem === this || this.solarSystem.selectedItem === this.centerOfGravity && this.solarSystem.selectedItem.planetType !== "sun"){
      this.changeOpacity();
      this.drawPlanetSelection();
    }
    this.ctx.beginPath();
    this.ctx.arc(this.locX, this.locY, rescaleValue(this.getPlanetWidthPx(), this.canvas), 0, 2*Math.PI);
    this.ctx.fillStyle = this.getPlanetColor();
    this.ctx.fill();
    this.ctx.restore();
    if (this.planetType !== "sun"){
      this.ctx.beginPath();
      this.ctx.arc(this.locX, this.locY, rescaleValue(this.getPlanetWidthPx(), this.canvas), 0, 2*Math.PI);
      this.ctx.strokeStyle = "#ffffff"
      this.ctx.stroke();
    }
  }

  drawPlanetSelection(){
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.locX, this.locY, rescaleValue(this.getPlanetWidthPx(), this.canvas) + 5, 0, 2*Math.PI);
    this.ctx.globalAlpha = (this.selectionOpacity / 100);
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.fill();
    this.ctx.restore();
  }
}

class Orbit extends Planet {
  constructor(solarSystem, planetType, canBeSelected, centerOfGravity) {
    super(solarSystem, planetType, canBeSelected, centerOfGravity)
    this.solarSystem = solarSystem;
    this.centerOfGravity = centerOfGravity;
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
    this.orbitDistance = 0;
    this.orbitPeriod = 0;
    this.orbitCurrent = 0;
  }

  getOrbitPeriod(){
    return 100 * Math.PI * (((this.orbitDistance)^3)/(this.centerOfGravity.getPlanetWidthPx()));
  }

  getNextLocs(){
    var orbitalTime = this.solarSystem.time - (Math.floor(this.solarSystem.time/this.orbitPeriod) * this.orbitPeriod);
    this.orbitCurrent = (orbitalTime / this.orbitPeriod);
    this.locX = this.getNextLocX()
    this.locY = this.getNextLocY()
  }

  getNextLocX(){
      return this.centerOfGravity.locX + rescaleValue(this.orbitDistance, this.canvas) * Math.sin(2*Math.PI*this.orbitCurrent);
  }

  getNextLocY(){
      return this.centerOfGravity.locY + rescaleValue(this.orbitDistance, this.canvas) * Math.cos(2*Math.PI*this.orbitCurrent);
  }

  drawOrbit(){
    this.getNextLocs();
    if (this.solarSystem.selectedItem === this || this.solarSystem.selectedItem === this.centerOfGravity && this.solarSystem.selectedItem.planetType !== "sun"){
      this.drawOrbitSelection();
    }
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerOfGravity.locX, this.centerOfGravity.locY, rescaleValue(this.orbitDistance, this.canvas), 0, 2*Math.PI)
    this.ctx.strokeStyle = "#aaaaaa"
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawOrbitSelection(){
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerOfGravity.locX, this.centerOfGravity.locY, rescaleValue(this.orbitDistance, this.canvas), 0, 2*Math.PI)
    this.ctx.lineWidth = 5;
    this.ctx.globalAlpha = (this.selectionOpacity / 100);
    this.ctx.strokeStyle = "#ffcc00";
    this.ctx.stroke();
    this.ctx.restore();
  }
}

class SolarSystem {
  constructor(canvas, canBeSelected) {
    this.canvas = canvas;
    this.canBeSelected = canBeSelected;
    this.ctx = this.canvas.getContext("2d");
    this.backgroundStarsArray = this.getStarsArray();
    this.sun = new Planet(this, "sun", true);
    this.canvasMidX = this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas);
    this.canvasMidY = this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas);
    this.orbits = [];
    this.time = 0;
    this.selectedItem = null;
    //

    //TODO: This is game's job. Move later:
    this.createNewOrbit("small");
    this.createNewOrbit("medium");
    this.createNewOrbit("small");
    this.createNewOrbit("small");
    this.createNewOrbit("medium");
    this.createNewOrbit("small");
    this.createNewOrbit("large");
    this.createNewOrbit("large");
    this.orbitDistances();

    this.wantEventListener();

    window.requestAnimationFrame(this.draw.bind(this));
  }

  wantEventListener(){
    if (this.canBeSelected === true){
      this.canvas.addEventListener("click", this.selectionEvent.bind(this));
    }
  }

  draw() {
    this.ctx.rect(0, 0, rescaleValue(1000, this.canvas), rescaleValue(1000, this.canvas));
    this.ctx.fillStyle = "#000000";
    this.ctx.fill();

    for (var index = 0; index < this.backgroundStarsArray.length; index++){
      this.backgroundStarsArray[index].drawAll(this.ctx);
    }

    this.drawSolarFlare();
    this.sun.drawPlanet();

    for (var index = 0; index < this.orbits.length; index++){
      this.orbits[index].drawOrbit();
      this.orbits[index].drawPlanet();
    }

    window.requestAnimationFrame(this.draw.bind(this));
    this.time++;
  }

  selectionEvent(){
    var barReal = 9999;
    var barIndex = 0;
    for (var indexOrbits = 0; indexOrbits < this.orbits.length; indexOrbits++){
      if (this.orbits[indexOrbits].canBeSelected === true){
        var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - (this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas))), 2)) + (Math.pow(Math.abs(event.clientY - (this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas))), 2)), 0.5);
        var tempReal = Math.abs(tempReal - rescaleValue(this.orbits[indexOrbits].orbitDistance, this.canvas));
        if (tempReal < barReal){
          barReal = tempReal;
          barIndex = indexOrbits
        }
      }
    }

    this.selectedItem = this.orbits[barIndex];

    // Check if Sun was selected:
    var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - (this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas))), 2)) + (Math.pow(Math.abs(event.clientY - (this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas))), 2)), 0.5);
    var tempReal = Math.abs(tempReal - rescaleValue(this.sun.getPlanetWidthPx(), this.canvas));
    if (tempReal < barReal){
      this.selectedItem = this.sun;
    }
  }

  createNewOrbit(whichType){
    this.orbits.push(new Orbit(this, whichType, this.canBeSelected, this.sun));
  }

  getStarsArray(){
    var tempBackgroundStarsArray = [];
    for (var index = 0; index < 1000; index++){
      tempBackgroundStarsArray.push(new BackgroundStar(this.canvas));
    }
    return tempBackgroundStarsArray;
  }

  drawSolarFlare(){
    for (var index = 0; index < 20; index++){
      this.ctx.save();
      this.ctx.beginPath();
      var rand = Math.random()
      this.ctx.arc(rescaleValue(500, this.canvas) + rescaleValue(70, this.canvas) * Math.sin(2*Math.PI*rand), rescaleValue(500, this.canvas) + rescaleValue(70, this.canvas) * Math.cos(2*Math.PI*rand), 1, 0, 2*Math.PI);
      this.ctx.fillStyle = "#ffcc00";
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  orbitDistances(){
    var tempReal = this.sun.getPlanetWidthPx();
    var tempBoo = false;
    for (var indexOrbits = 0; indexOrbits < this.orbits.length; indexOrbits++){
      tempReal = tempReal + 5 + this.orbits[indexOrbits].getPlanetWidthPx();
      if (indexOrbits < this.orbits.length/2){
        this.orbits[indexOrbits].orbitDistance = tempReal + 40
      } else {
        this.orbits[indexOrbits].orbitDistance = tempReal + 100
      }
      tempReal = tempReal + this.orbits[indexOrbits].getPlanetWidthPx();
      this.orbits[indexOrbits].orbitPeriod = this.orbits[indexOrbits].getOrbitPeriod();
    }
  }
}

class BackgroundStar {
  constructor(whichCanvas) {
    this.canvas = whichCanvas;
    this.locX = whichCanvas.width * Math.random();
    this.locY = whichCanvas.height * Math.random();
  }

  drawAll(ctx){
    ctx.beginPath();
    ctx.arc(this.locX, this.locY, rescaleValue(1, this.canvas), 0, 2*Math.PI);
    ctx.fillStyle = "#cccccc";
    ctx.fill();
  }
}

var gameCanvas = document.getElementById("gameCanvas");
gameCanvas.style.left = "500px";
var game = new SolarSystem(gameCanvas, true);

copyCanvas = document.getElementById("copyCanvas");
copyCanvas.style.left = "50px";
var copyGame = new SolarSystem(copyCanvas, true);

var userInterface = document.getElementById("userInterface");

function rescaleValue(whichValue, whichCanvas){
  var rescaleRatio = (whichCanvas.width / 1000);
  return rescaleRatio * whichValue;
}

//BUTTONS:
/*
var tempButton = document.getElementById('buttonSmall');
tempButton.addEventListener("click", clickButtonSmall);
tempButton.style.top = "1200px";

var tempButton = document.getElementById('buttonMedium');
tempButton.addEventListener("click", clickButtonMedium);
tempButton.style.top = "1200px";

var tempButton = document.getElementById('buttonLarge');
tempButton.addEventListener("click", clickButtonLarge);
tempButton.style.top = "1200px";

var tempButton = document.getElementById('buttonRed');
tempButton.addEventListener("click", clickButtonRed);
tempButton.style.top = "1200px";

var tempButton = document.getElementById('buttonGreen');
tempButton.addEventListener("click", clickButtonGreen);
tempButton.style.top = "1200px";

var tempButton = document.getElementById('buttonBlue');
tempButton.addEventListener("click", clickButtonBlue);
tempButton.style.top = "1200px";

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
*/

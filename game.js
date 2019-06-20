class Planet {
  constructor(solarSystem, planetType, isRed, isBlue, isGreen) {
    this.solarSystem = solarSystem;
    this.canvas = this.solarSystem.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.selectionOpacity = 0;
    this.opacityIncreasing = true;
    this.planetType = planetType;
    this.locX = rescaleValue(500, this.canvas);
    this.locY = rescaleValue(500, this.canvas);
    this.planetBlue = isRed;
    this.planetRed = isBlue;
    this.planetGreen = isGreen;
    this.moonArray = [];
  }

  getPlanetWidthPx(){
    var tempReal = 0;
    if (this.planetType === "moon"){
      return 1;
    } else if (this.planetType === "small"){
      tempReal = 4;
    } else if (this.planetType === "medium") {
      tempReal = 10;
    } else if (this.planetType === "large") {
      tempReal = 18;
    } else if (this.planetType === "sun") {
      tempReal = 50 + 2.5 * (this.solarSystem.orbits.length)
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
      return "#909090";
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
      tempString = "#cccccc"
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
    if (game.selectedItem === this || game.selectedItem === this.centerOfGravity && game.selectedItem.planetType !== "sun"){
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
    this.ctx.arc(this.locX, this.locY, rescaleValue(this.getPlanetWidthPx() + 5, this.canvas), 0, 2*Math.PI);
    this.ctx.globalAlpha = (this.selectionOpacity / 100);
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.fill();
    this.ctx.restore();
  }
}

class Orbit extends Planet {
  constructor(solarSystem, centerOfGravity, planetType, isRed, isBlue, isGreen, numMoons, generatesIncome) {
    super(solarSystem, planetType, isRed, isBlue, isGreen)
    this.solarSystem = solarSystem;
    this.centerOfGravity = centerOfGravity;
    this.locX = this.getNextLocX();
    this.locY = this.getNextLocY();
    this.orbitDistance = 0;
    this.orbitPeriod = 0;
    this.orbitCurrent = 0;
    this.moonArray = [];
    this.getMoons(numMoons);
    this.generatesIncome = generatesIncome;
    this.mineralIncome = 0;
    this.gasIncome = 0;
    this.recalcIncome();
    this.generateIncome();
  }

  recalcIncome(){
    console.log("a")
    var tempMineralIncome = 0;
    var tempGasIncome = 0;
    // PLANET SIZE:
    if (this.planetType === "large"){
      tempMineralIncome = 10;
      tempGasIncome = 0;
    } else if (this.planetType === "medium"){
      tempMineralIncome = 25;
      tempGasIncome = 10;
    } else if (this.planetType === "small"){
      tempMineralIncome = 40;
      tempGasIncome = 20;
    }
    // PLANET COLORS:
    if (this.planetRed === true){
      tempMineralIncome = tempMineralIncome + 5;
      tempGasIncome = tempGasIncome + 5;
    }
    if (this.planetBlue === true){
      tempMineralIncome = tempMineralIncome + 20;
      tempGasIncome = tempGasIncome - 10;
    }
    if (this.planetGreen === true){
      tempMineralIncome = tempMineralIncome - 10;
      tempGasIncome = tempGasIncome + 20;
    }
    // PLANET MOONS:
    if (this.moonArray.length !== 0){
      console.log("b")
      tempMineralIncome = (1 + (this.moonArray.length * 0.25)) * tempMineralIncome;
      tempGasIncome = (1 + (this.moonArray.length * 0.25)) * tempGasIncome;
    }
    this.mineralIncome = tempMineralIncome;
    this.gasIncome = tempGasIncome;
  }

  getMoons(numMoons){
    if (numMoons !== 0){
      for (var index = 0; index < numMoons; index++){
        this.addMoon();
      }
    }
  }

  addMoon(){
    var tempMoon = new Orbit(this.solarSystem, this, "moon", false, false, false, 0, false);
    this.moonArray.push(tempMoon);
    this.recalcMoonDistances();
    this.solarSystem.recalcOrbitDistances();
    tempMoon.selectionOpacity = this.selectionOpacity;
    tempMoon.opacityIncreasing = this.opacityIncreasing;
  }

  removeMoon(){
    this.moonArray.splice(this.moonArray.length - 1, 1);
    this.solarSystem.recalcOrbitDistances();
  }

  recalcMoonDistances(){
    for (var index = 0; index < this.moonArray.length; index++){
      this.moonArray[index].orbitDistance = this.getPlanetWidthPx() + 1 + 2 * (index + 1);
      this.moonArray[index].orbitPeriod = this.moonArray[index].getOrbitPeriod();
    }
  }

  getOrbitPeriod(){
    if (this.planetType === "moon"){
      return 50 * Math.PI * (((this.orbitDistance)^3)/(this.centerOfGravity.getPlanetWidthPx()));
    } else {
      return 100 * Math.PI * (((this.orbitDistance)^3)/(this.centerOfGravity.getPlanetWidthPx()));
    }
  }

  generateIncome(){
    if (this.generatesIncome === true){
      window.setTimeout(this.generateIncomeCallback.bind(this), (1000/60) * this.orbitPeriod);
    }
  }

  generateIncomeCallback(){
    game.addResources(this.mineralIncome, this.gasIncome);
    this.generateIncome();
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
    if (game.selectedItem === this || game.selectedItem === this.centerOfGravity && game.selectedItem.planetType !== "sun"){
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

  drawMoons(){
    if (this.moonArray.length !== 0){
      for (var index = 0; index < this.moonArray.length; index++){
        this.moonArray[index].drawOrbit();
        this.moonArray[index].drawPlanet();
      }
    }
  }
}

class SolarSystem {
  constructor(canvas, canBeManipulated) {
    this.canvas = canvas;
    this.kupierBelt = this.getAsteroidArray("kupier");
    this.postSolarBelt = this.getAsteroidArray("postSolar");
    this.ctx = this.canvas.getContext("2d");
    this.sun = new Planet(this, "sun", true);
    this.canvasMidX = this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas);
    this.canvasMidY = this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas);
    this.canBeManipulated = canBeManipulated;
    this.orbits = [];
    this.time = 0;
    this.createEventListeners();
    window.requestAnimationFrame(this.draw.bind(this));
    if (canBeManipulated === false){
      this.randomSystem();
    } else {
      this.basicSystem();
    }
  }

  randomSystem(){
    var tempInteger = this.randomNumPlanets();
    for (var index = 0; index < tempInteger; index++){
      this.createNewOrbit(this.randomType(), this.randomColor(), this.randomColor(), this.randomColor(), this.randomNumMoons(), false)
    }

  }

  basicSystem(){
    for (var index = 0; index < 3; index++){
      this.createNewOrbit("large", false, false, false, 0, true);
    }
  }

  createNewOrbit(whichType, isRed, isBlue, isGreen, numMoons, generatesIncome){
    this.orbits.push(new Orbit(this, this.sun, whichType, isRed, isBlue, isGreen, numMoons, generatesIncome));
    this.recalcOrbitDistances();
  }

  randomType(){
    var tempReal = Math.random();
    if (tempReal <= 0.50){
      return "small"
    } else if (tempReal > 0.75) {
      return "large"
    } else {
      return "medium"
    }
  }

  randomNumPlanets(){
    return 4 + Math.floor(5 * Math.random());
  }

  randomColor(){
    if (Math.random() < 0.40){
      return true
    } else {
      return false
    }
  }

  randomNumMoons(){
    return Math.floor(0 + 5 * Math.random());
  }

  createEventListeners(){
    this.canvas.addEventListener("click", this.selectionEvent.bind(this));
  }

  getAsteroidArray(beltType){
    var tempArray = [];
    for (var index = 0; index < 400; index++){
      tempArray.push(new Asteroid(beltType));
    }
    return tempArray;
  }

  draw() {
    // Null drawing:
    this.ctx.rect(0, 0, rescaleValue(1000, this.canvas), rescaleValue(1000, this.canvas));
    this.ctx.fillStyle = "#000000";
    this.ctx.fill();
    // Background stars:
    for (var index = 0; index < game.starArray.length; index++){
      game.starArray[index].drawAll(this.canvas, this.ctx);
    }
    // Asteroid belt:
    for (var index = 0; index < this.kupierBelt.length; index++){
      this.kupierBelt[index].drawAll(this, this.canvas, this.ctx);
    }
    // Postsolar asteroid belt:
    for (var index = 0; index < this.postSolarBelt.length; index++){
      this.postSolarBelt[index].drawAll(this, this.canvas, this.ctx);
    }
    // Render sun:
    this.drawSolarFlare();
    this.sun.drawPlanet();
    // Renders planets:
    for (var index = 0; index < this.orbits.length; index++){
      this.orbits[index].drawOrbit();
      this.orbits[index].drawPlanet();
      this.orbits[index].drawMoons();
    }
    // Restart loop:
    this.time++;
    this.framelock();
  }

  framelock(){
    window.setTimeout(this.framelockCallback.bind(this), (1000/60));
  }

  framelockCallback(){
    window.requestAnimationFrame(this.draw.bind(this));
  }

  selectionEvent(){
    // Based on the pythagorian equation, finds the closest orbit to user mouse position.
    var barReal = rescaleValue(9999, this.canvas);
    var barIndex = 0;
    for (var indexOrbits = 0; indexOrbits < this.orbits.length; indexOrbits++){
      var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - (this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas))), 2)) + (Math.pow(Math.abs(event.clientY - (this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas))), 2)), 0.5);
      var tempReal = Math.abs(tempReal - rescaleValue(this.orbits[indexOrbits].orbitDistance, this.canvas));
      if (tempReal < barReal){
        barReal = tempReal;
        barIndex = indexOrbits
      }
    }
    game.selectedItem = this.orbits[barIndex];
    // Check if the player may have actually clicked the sun, instead of an orbit:
    var tempReal = Math.pow((Math.pow(Math.abs(event.clientX - (this.canvas.getBoundingClientRect().left + rescaleValue(500, this.canvas))), 2)) + (Math.pow(Math.abs(event.clientY - (this.canvas.getBoundingClientRect().top + rescaleValue(500, this.canvas))), 2)), 0.5);
    var tempReal = Math.abs(tempReal - rescaleValue(this.sun.getPlanetWidthPx(), this.canvas));
    if (tempReal < barReal){
      game.selectedItem = this.sun;
    }
    game.checkUserInterface();
  }

  drawSolarFlare(){
    for (var index = 0; index < 40; index++){
      this.ctx.save();
      this.ctx.beginPath();
      var rand = Math.random()
      this.ctx.arc(rescaleValue(500, this.canvas) + rescaleValue(this.sun.getPlanetWidthPx(), this.canvas) * Math.sin(2*Math.PI*rand), rescaleValue(500, this.canvas) + rescaleValue(this.sun.getPlanetWidthPx(), this.canvas) * Math.cos(2*Math.PI*rand), rescaleValue(1, this.canvas), 0, 2*Math.PI);
      this.ctx.fillStyle = "#ffcc00";
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  recalcOrbitDistances(){
    var tempReal = this.sun.getPlanetWidthPx();
    var tempBoo = false;
    for (var index = 0; index < this.orbits.length; index++){
      tempReal = tempReal + 5 + this.orbits[index].getPlanetWidthPx();
      if (this.orbits[index].moonArray.length !== 0){
        tempReal = tempReal + 1 + 2 * this.orbits[index].moonArray.length;
      }
      if (index < this.orbits.length/2){
        this.orbits[index].orbitDistance = tempReal + 40
      } else {
        this.orbits[index].orbitDistance = tempReal + 100
      }
      tempReal = tempReal + this.orbits[index].getPlanetWidthPx();
      if (this.orbits[index].moonArray.length !== 0){
        tempReal = tempReal + 1 + 2 * this.orbits[index].moonArray.length;
      }
      this.orbits[index].orbitPeriod = this.orbits[index].getOrbitPeriod();
    }
    if (this.orbits.length > 2){
      this.recalcKupier();
      this.recalcPostSolar();
    }
  }

  recalcKupier(){
    var tempIndex = 0;
    for (var index = 0; index < this.orbits.length; index++){
      if (tempIndex === 0 && index >= this.orbits.length/2){
        tempIndex = index;
      }
    }
    var tempReal = (this.orbits[tempIndex - 1].orbitDistance + this.orbits[tempIndex].orbitDistance)/2;
    for (var index = 0; index < this.kupierBelt.length; index++){
      this.kupierBelt[index].newDistance(tempReal);
    }
  }

  recalcPostSolar(){
    for (var index = 0; index < this.postSolarBelt.length; index++){
      this.postSolarBelt[index].newDistance(50 + this.orbits[this.orbits.length - 1].orbitDistance);
    }
  }
}

class BackgroundStar {
  constructor() {
    this.locX = 1000 * Math.random();
    this.locY = 1000 * Math.random();
    this.width = 0.5 + 1 * Math.random();
    this.colorYellow = (Math.floor(155 + 100 * Math.random())).toString(16);
    this.colorString = "#ffff" + this.colorYellow
  }

  drawAll(canvas, ctx){
    ctx.save();
    ctx.beginPath();
    ctx.arc(rescaleValue(this.locX, canvas), rescaleValue(this.locY, canvas), rescaleValue(this.width, canvas), 0, 2*Math.PI);
    ctx.fillStyle = this.colorString;
    ctx.fill();
    ctx.restore();
  }
}

class Asteroid {
  constructor(beltType) {
    this.beltType = beltType
    this.baseDistance = this.getInitDistance(this.beltType);
    this.offsetDistance = -25 + Math.random() * 50;
    this.angle = Math.random();
    this.locX = this.getLocX();
    this.locY = this.getLocY();
    this.width = 0.5 + 2 * Math.random();
    this.colorString = this.getColorString(this.beltType);
  }

  getColorString(){
    var tempString = (Math.floor(0 + 255 * Math.random())).toString(16);
    if (this.beltType === "kupier"){
      return "#" + tempString + tempString + tempString;
    } else {
      return "#" + tempString + tempString + tempString;
    }
  }

  getInitDistance(beltType){
    if (this.beltType === "kupier"){
      return 140.5;
    } else {
      return 242.5;
    }
  }

  getLocX(){
    return 500 + (this.baseDistance + this.offsetDistance) * Math.sin(2*Math.PI*this.angle)
  }

  getLocY(){
    return 500 + (this.baseDistance + this.offsetDistance) * Math.cos(2*Math.PI*this.angle)
  }

  getNewLocs(){
    this.locX = this.getLocX();
    this.locY = this.getLocY();
  }

  newDistance(whatDistance){
    this.baseDistance = whatDistance;
    this.getNewLocs();
  }

  drawAll(solarSystem, canvas, ctx){
    ctx.save();
    ctx.beginPath();
    ctx.arc(rescaleValue(this.locX, canvas), rescaleValue(this.locY, canvas), rescaleValue(this.width, canvas), 0, 2*Math.PI);
    ctx.fillStyle = this.colorString;
    ctx.fill();
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.starArray = this.getStarsArray();
    this.copyCanvas = document.getElementById("gameCanvas");
    this.modelCanvas = document.getElementById("copyCanvas");
    this.copySystem = new SolarSystem(this.copyCanvas, true);
    this.modelSystem = new SolarSystem(this.modelCanvas, false);
    // UI:
    this.planetInterface = document.getElementById("planetInterface");
    this.sunInterface = document.getElementById("sunInterface");
    this.modelInterface = document.getElementById("modelInterface");
    this.planetInterfaceDescription = document.getElementById("planet-description");
    this.modelInterfaceDescription = document.getElementById("model-description");
    this.incomeInterfaceDescription = document.getElementById("income-statement");
    this.mineralUI = document.getElementById("mineral-ui");
    this.gasUI = document.getElementById("gas-ui");
    this.selectedItem = null;
    this.stockMinerals = 100;
    this.stockGas = 0;
    this.balanceSheet = this.getBalanceSheet();
    // Throwout:
    this.createEventListeners();
    this.lockCanvasii();
  }

  addResources(numMinerals, numGas){
    this.stockMinerals = this.stockMinerals + numMinerals;
    this.stockGas = this.stockGas + numGas;
    this.updateResourceUI()
  }

  getBalanceSheet(){
    var tempMatrix = [];
    tempMatrix.push(["moonAdd", 100, 50]);
    tempMatrix.push(["moonRemove", -50, -25]);
    tempMatrix.push(["upgradePlanet", 100, 50]);
    tempMatrix.push(["downgradePlanet", -50, -25]);
    tempMatrix.push(["colorAdd", 100, 0]);
    tempMatrix.push(["colorRemove", -50, 0]);
    tempMatrix.push(["upgradeSun", 0, 100]);
    return tempMatrix;
  }

  getCost(handle, whichResource){
    console.log(handle + " & " + whichResource + ": ");
    for (var index = 0; index < this.balanceSheet.length; index++){
      if (this.balanceSheet[index][0] === handle){
        if (whichResource === "mineral"){
          return this.balanceSheet[index][1];
        } else {
          return this.balanceSheet[index][2];
        }
      }
    }
  }

  hasResources(handle){
    if (this.stockMinerals < this.getCost(handle, "mineral") && this.getCost(handle, "mineral") !== 0){
      return false
    }
    if (this.stockGas < this.getCost(handle, "gas") && this.getCost(handle, "gas") !== 0){
      return false
    }
    return true
  }

  checkForVictory(){
    if (this.modelSystem.orbits.length !== this.copySystem.orbits.length){
      return false;
    }
    for (var index = 0; index < this.modelSystem.orbits.length; index++){
      if (this.getPlanetDescription(this.modelSystem.orbits[index]) !== this.getPlanetDescription(this.copySystem.orbits[index])){
        return false;
      }
    }
    console.log("heyooo");
    return true;
  }

  victory(){
    rebootGame();
  }

  createEventListeners(){
    document.getElementById('buttonUpgradePlanet').addEventListener("click", this.clickButtonUpgradePlanet.bind(this));
    document.getElementById('buttonDowngradePlanet').addEventListener("click", this.clickButtonDowngradePlanet.bind(this));
    document.getElementById('buttonRed').addEventListener("click", this.clickButtonRed.bind(this));
    document.getElementById('buttonGreen').addEventListener("click", this.clickButtonGreen.bind(this));
    document.getElementById('buttonBlue').addEventListener("click", this.clickButtonBlue.bind(this));
    document.getElementById('buttonUpgrade').addEventListener("click", this.clickButtonUpgrade.bind(this));
    document.getElementById('buttonMoonAdd').addEventListener("click", this.clickButtonMoonAdd.bind(this));
    document.getElementById('buttonMoonRemove').addEventListener("click", this.clickButtonMoonRemove.bind(this));
  }

  lockCanvasii(){
    gameCanvas.style.left = "500px";
    copyCanvas.style.left = "50px";
  }

  getStarsArray(){
    var tempArray = [];
    for (var index = 0; index < 400; index++){
      tempArray.push(new BackgroundStar());
    }
    return tempArray;
  }

  subtractCost(handle){
    this.stockMinerals = this.stockMinerals - this.getCost(handle, "mineral");
    this.stockGas = this.stockGas - this.getCost(handle, "gas");
    this.updateResourceUI();
  }

  updateResourceUI(){
    this.mineralUI.textContent = this.stockMinerals;
    this.gasUI.textContent = this.stockGas;
  }

  clickButtonMoonAdd(){
    if (this.selectedItem.moonArray.length < 4){
      if (this.hasResources("moonAdd")){
        this.selectedItem.addMoon();
        this.subtractCost("moonAdd");
        this.setupChange();
      }
    } else {
      // TODO: UI err. resp.: Can't add any more moons.
    }
  }

  clickButtonMoonRemove(){
    if (this.hasResources("moonRemove")){
      this.selectedItem.removeMoon();
      this.subtractCost("moonRemove");
      this.setupChange();
    }
  }

  clickButtonUpgradePlanet(){
    if (this.selectedItem.planetType !== "small"){
      if (this.hasResources("upgradePlanet")){
        if (this.selectedItem.planetType === "medium"){
          this.selectedItem.planetType = "small";
        } else {
          this.selectedItem.planetType = "medium"
        }
        this.subtractCost("upgradePlanet");
        this.setupChange();
      }
    } else {
      // TODO: UI err. resp.: Can't upgrade this planet further.
    }
  }

  clickButtonDowngradePlanet(){
    if (this.selectedItem.planetType !== "large"){
      if (this.hasResources("downgradePlanet")){
        if (this.selectedItem.planetType === "medium"){
          this.selectedItem.planetType = "large";
        } else {
          this.selectedItem.planetType = "medium"
        }
        this.subtractCost("downgradePlanet")
        this.setupChange();
      }
    } else {
      // TODO: UI err. resp.: Can't downgrade this planet further.
    }
  }

  clickButtonRed(){
    if (this.selectedItem.planetRed){
      this.selectedItem.planetRed = false;
      this.subtractCost("colorRemove")
    } else {
      if (this.hasResources("colorAdd")){
        this.selectedItem.planetRed = true;
        this.subtractCost("colorAdd");
      }
    }
    this.setupChange();
  }

  clickButtonBlue(){
    if (this.selectedItem.planetBlue){
      this.selectedItem.planetBlue = false;
      this.subtractCost("colorRemove")
    } else {
      if (this.hasResources("colorAdd")){
        this.selectedItem.planetBlue = true;
        this.subtractCost("colorAdd");
      }
    }
    this.setupChange();
  }

  clickButtonGreen(){
    if (this.selectedItem.planetGreen){
      this.selectedItem.planetGreen = false;
      this.subtractCost("colorRemove")
    } else {
      if (this.hasResources("colorAdd")){
        this.selectedItem.planetGreen = true;
        this.subtractCost("colorAdd");
      }
    }
    this.setupChange();
  }

  clickButtonUpgrade(){
    if (this.modelSystem.orbits.length > this.copySystem.orbits.length && this.hasResources("upgradeSun")){
      this.copySystem.createNewOrbit("large", false, false, false, 0, true);
      this.subtractCost("upgradeSun")
      this.copySystem.recalcOrbitDistances();
    }
    if (this.modelSystem.orbits.length === this.copySystem.orbits.length){
      document.getElementById("upgradeSunPrompt").hidden = true;
      document.getElementById("buttonUpgrade").hidden = true;
      document.getElementById("sunDescription").textContent = "The burning heart of this system. It is fully upgraded and supports as many orbits as it possibly can.";
    }
    this.setupChange();
  }

  checkUserInterface(){
    if (this.selectedItem.solarSystem === this.copySystem){
      if (this.selectedItem.planetType === "sun"){
        this.showSunInterface();
      } else {
        this.showPlanetInterface();
      }
    } else if (this.selectedItem.solarSystem === this.modelSystem) {
      this.showModelInterface();
    }
  }

  showSunInterface(){
    this.sunInterface.hidden = false;
    this.planetInterface.hidden = true;
    this.modelInterface.hidden = true;
  }

  showPlanetInterface(){
    this.sunInterface.hidden = true;
    this.planetInterface.hidden = false;
    this.modelInterface.hidden = true;
    this.refreshDescription();
  }

  showModelInterface(){
    this.sunInterface.hidden = true;
    this.planetInterface.hidden = true;
    this.modelInterface.hidden = false;
    this.refreshDescription();
  }

  setupChange(){
    this.checkForVictory();
    this.selectedItem.solarSystem.recalcOrbitDistances();
    this.selectedItem.recalcIncome();
    this.refreshDescription();
  }

  refreshDescription(){
    if (this.selectedItem.planetType !== "sun"){
      var tempText = this.getPlanetDescription(this.selectedItem);
      this.planetInterfaceDescription.textContent = tempText;
      this.modelInterfaceDescription.textContent = tempText;
      this.incomeInterfaceDescription.textContent = this.getIncomeDescription(this.selectedItem);
    }
  }

  getIncomeDescription(whichEntity){
    if (this.selectedItem.planetType === "sun"){
      return "It does not generate resources on its own."
    } else {
      var tempText = "It generates " + this.selectedItem.mineralIncome + " minerals and ";
      var tempText = tempText + this.selectedItem.gasIncome + " gas once every ";
      var tempText = tempText + parseFloat(this.selectedItem.orbitPeriod / 60).toFixed(2) + " seconds."
    }
    return tempText;
  }

  getPlanetDescription(whichEntity){
    var tempString = "";
    if (whichEntity.planetType === "sun"){
      tempString = "The burning heart of this system. It supports " + whichEntity.solarSystem.orbits.length + " orbits."
    } else {
      tempString = tempString + this.getTextWhichPlanetSize(whichEntity);
      tempString = tempString + this.getTextWhichColor(whichEntity);
      tempString = tempString + this.getTextWhichOrbit(whichEntity);
      tempString = tempString + this.getTextNumMoon(whichEntity);
    }
    return tempString
  }

  getTextWhichOrbit(whichEntity){
    var tempInteger = 0;
    for (var index = 0; index < whichEntity.solarSystem.orbits.length; index++){
      if (whichEntity === whichEntity.solarSystem.orbits[index]){
        tempInteger = index + 1;
      }
    }
    return (" planet, located on the " + tempInteger + ". orbit of the system.")
  }

  getTextWhichPlanetSize(whichEntity){
    if (whichEntity.planetType === "small"){
      return "A small, ";
    } else if (whichEntity.planetType === "medium") {
      return "A medium-sized, ";
    } else if (whichEntity.planetType === "large") {
      return "A large, "
    }
  }

  getTextWhichColor(whichEntity){
    if (whichEntity.planetRed === true && whichEntity.planetBlue === true && whichEntity.planetGreen === true){
      return "white (red & green & blue)"
    } else if (whichEntity.planetRed === false && whichEntity.planetBlue === true && whichEntity.planetGreen === true) {
      return "cyan-colored (blue & green)"
    } else if (whichEntity.planetRed === true && whichEntity.planetBlue === false && whichEntity.planetGreen === true) {
      return "yellow (red & green)"
    } else if (whichEntity.planetRed === true && whichEntity.planetBlue === true && whichEntity.planetGreen === false) {
      return "purple (red & blue)"
    } else if (whichEntity.planetRed === true && whichEntity.planetBlue === false && whichEntity.planetGreen === false) {
      return "red"
    } else if (whichEntity.planetRed === false && whichEntity.planetBlue === true && whichEntity.planetGreen === false) {
      return "blue"
    } else if (whichEntity.planetRed === false && whichEntity.planetBlue === false && whichEntity.planetGreen === true) {
      return "green"
    } else {
      return "gray"
    }
  }

  getTextNumMoon(whichEntity){
    if (whichEntity.moonArray.length !== 0){
      if (whichEntity.moonArray.length === 1){
        return " It has 1 moon."
      } else {
        return " It has " + whichEntity.moonArray.length + " moons."
      }
    } else {
      return " It has no moons."
    }
  }


}

var game = new Game();

function rebootGame(){
  // TODO: this
}

function rescaleValue(whichValue, whichCanvas){
  var rescaleRatio = (whichCanvas.width / 1000);
  return rescaleRatio * whichValue;
}

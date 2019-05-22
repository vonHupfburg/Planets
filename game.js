function init() {
  window.requestAnimationFrame(draw);
}

function draw() {
  var sunLocX = 500;
  var sunLocY = 500;
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.clearRect(0, 0, 1000, 1000);

  var time = new Date();

  // Sun
  ctx.beginPath();
  ctx.arc(sunLocX, sunLocY, 50, 0, 2*Math.PI);
  ctx.fillStyle = "yellow";
  ctx.fill();

  drawOrbit(ctx, sunLocX, sunLocY, 100);
  planet(time, ctx, sunLocX, sunLocY, 100, 25, 5);
  drawOrbit(ctx, sunLocX, sunLocY, 200);
  planet(time, ctx, sunLocX, sunLocY, 200, 50, 1.32);
  drawOrbit(ctx, sunLocX, sunLocY, 400);
  planet(time, ctx, sunLocX, sunLocY, 400, 100, 15);

  window.requestAnimationFrame(draw);
}

function drawOrbit(ctx, sunLocX, sunLocY, distanceFromSun){
  ctx.beginPath();
  ctx.arc(sunLocX, sunLocY, distanceFromSun, 0, 2*Math.PI)
  ctx.stroke();
}

function planet(time, ctx, sunLocX, sunLocY, distanceFromSun, planetWidth, orbitalPeriod){
  ctx.save();
  ctx.beginPath();
  var planetSeconds = time.getSeconds() - Math.floor(time.getSeconds()/orbitalPeriod)*orbitalPeriod;
  var planetMilliseconds = time.getMilliseconds() / 1000;
  console.log(planetMilliseconds);
  console.log(planetSeconds);
  ctx.translate(sunLocX, sunLocY);
  ctx.rotate(2*Math.PI*((planetSeconds + planetMilliseconds)/orbitalPeriod));
  ctx.translate(-sunLocX, -sunLocY);
  ctx.arc(sunLocX, sunLocY + distanceFromSun, planetWidth, 0, 2*Math.PI);
  ctx.fillStyle = "brown";
  ctx.fill();
  ctx.restore();
}

init();

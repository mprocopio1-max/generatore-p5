let perlinScale = 50;

function setup() {
  createCanvas(200, 200);

  background(0);
  noStroke();

  let centralx = width / 2;
  let centraly = height / 2;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
  
      console.log (x, y);
      
      //distanza dal centro
      let distanceFromCenter = dist(x, y, centralx, centraly);
      let normdistanceFromCenter = distanceFromCenter / (width/2);
      
      let altitude = 1 - normdistanceFromCenter;

      //noise 
      noiseDetail(6);
      let perlin = noise (x / perlinScale, y / perlinScale);
      altitude*= perlin;

      //assegna colore
      let seaLevel = 0.2;
      let beachLevel = 0.25;
      if (altitude < seaLevel) {
        fill(0, 0, 255);
      } else if (altitude < beachLevel) { 
        fill(255, 255, 0);     
      } else {
        fill(0, 255, 0);
      }

      rect(x, y, 1, 1);
      
    }
 }
}

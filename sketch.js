let perlinScale = 200;
let tile_size = 5;

let grassImage; 
let sandImage;
let waterImage;

function preload() {
  //carica risorse
  grassImage = loadImage('tiles/grass.png');
  sandImage = loadImage('tiles/sand.png');
  waterImage = loadImage('tiles/water.png');  
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  background(0);
  noStroke();

  let centralx = width / 2;
  let centraly = height / 2;

  for (let x = 0; x < width; x = x + tile_size) {
    for (let y = 0; y < height; y = y + tile_size) {
  
      console.log (x, y);
      
      //distanza dal centro
      let distanceFromCenter = dist(x, y, centralx, centraly);
      let normdistanceFromCenter = distanceFromCenter / (width/2);
      
      let altitude = 1 - normdistanceFromCenter;

      //noise 
      noiseDetail(6);
      let perlin = noise (x / perlinScale, y / perlinScale);
      altitude*= perlin;
      altitude+= perlin;
      altitude-= 0.5;

      //assegna colore
      let seaLevel = 0.2;
      let beachLevel = 0.25;
      if (altitude < seaLevel) {
        img=waterImage;
      } else if (altitude < beachLevel) { 
        img=sandImage;
      } else {
        img=grassImage;
      }

      image(img, x, y, tile_size, tile_size);
    }
 }
}

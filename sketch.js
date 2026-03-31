let perlinScale = 200;
let tile_size = 16;
let sprites_size = 20;

let grassImage; 
let sandImage;
let waterImage;
let flowerImage;
let mushroomImage;
let leaveImage;
let snowImage;

function preload() {
  //carica risorse
  grassImage = loadImage('assets/tiles/grass.png');
  sandImage = loadImage('assets/tiles/sand.png');
  waterImage = loadImage('assets/tiles/water(1).png');
  leaveImage = loadImage('assets/tiles/leaves.png');
  snowImage = loadImage('assets/tiles/snow.png');
  
  flowerImage = loadImage('assets/sprites/flower.png');
  mushroomImage = loadImage('assets/sprites/mushroom.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  background(0);
  noStroke();

  let centralx = width / 2;
  let centraly = height / 2;

  //tiles
  for (let x = 0; x < width; x = x + tile_size) {
    for (let y = 0; y < height; y = y + tile_size) {
  
      console.log (x, y);
      
    let altitude = computeAltitude(x, y, centralx, centraly);

    
      let seaLevel = 0.15;
      let beachLevel = 0.20;
      let leavelevel = 0.4;
      let snowlevel = 0.45;

      let img;
      if (altitude < seaLevel) {
        img=waterImage;
      } else if (altitude < beachLevel) { 
        img=sandImage;
      } else {
        img=grassImage;
      }
      if (altitude > leavelevel) {
        img=leaveImage;
      }
      if (altitude > snowlevel) {
        img=snowImage;
      }

      image(img, x, y, tile_size, tile_size);
 }
 //sprites
  for (let x = 0; x < width; x = x + tile_size) {
    for (let y = 0; y < height; y = y + tile_size) {
  
      console.log (x, y);
      
      let altitude = computeAltitude(x, y, centralx, centraly);

       let beachLevel = 0.25;
      //  Flowers
       if (random() < 0.002 && altitude > beachLevel) {
        image(flowerImage, x, y, sprites_size, sprites_size);
      }

      // Mushrooms
      if (random() < 0.002 && altitude > beachLevel) {
        image(mushroomImage, x, y, sprites_size, sprites_size);
      }
    }
 }
}
}

function computeAltitude(x, y, centralx, centraly) {
      //distanza dal centro
      let distanceFromCenter = dist(x, y, centralx, centraly);
      let normdistanceFromCenter = distanceFromCenter / (width/2);
      
      let altitude = 1 - normdistanceFromCenter;

      //noise 
      noiseDetail(6, 0.5);
      let perlin = noise (x / perlinScale, y / perlinScale);
      altitude*= perlin;
      altitude+= perlin;
      altitude-= 0.5;

      return altitude;
}

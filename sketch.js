let perlinScale = 200;
let tile_size = 10;

// tiles
let grassImage;
let sandImage;
let deepWaterImage;
let shallowWaterImage;
let farmImage;
let cliffImage;
let snowImage;

// decorazioni statiche
let treeImage;
let houseImage;
let chestImage;

// sprites animate
let slimeSheet;
let skeletonSheet;
let playerSheet;

// layer statici / dinamici
let islandLayer;
let cloudsLayer;

let animatedSprites = [];
let cloudTime = 0;
let cloudOffset = 0;

// Slime_Green.png = 512 x 192 -> 8 colonne x 3 righe -> frame 64x64
const slimeData = {
  img: null,
  frameW: 64,
  frameH: 64,
  cols: 8,
  rows: 3
};

// Skeleton.png = 192 x 320 -> 3 colonne x 5 righe -> frame 64x64
const skeletonData = {
  img: null,
  frameW: 30,
  frameH: 30,
  cols: 3,
  rows: 5
};

// Player.png = 192 x 320 -> 3 colonne x 5 righe -> frame 64x64
const playerData = {
  img: null,
  frameW: 30,
  frameH: 30,
  cols: 3,
  rows: 5
};

function preload() {
  grassImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Grass_Middle.png');
  sandImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Path_Middle.png');
  deepWaterImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Water.png');
  shallowWaterImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Water_Middle.png');
  farmImage = loadImage('assets/Cute_Fantasy_Free/Tiles/FarmLand_Tile.png');
  cliffImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Cliff_Tile.png');
  snowImage = loadImage('assets/Cute_Fantasy_Free/Tiles/Snow.png');

  treeImage = loadImage('assets/Cute_Fantasy_Free/Outdoor decoration/Oak_Tree.png');
  houseImage = loadImage('assets/Cute_Fantasy_Free/Outdoor decoration/House_1_Wood_Base_Blue.png');
  chestImage = loadImage('assets/Cute_Fantasy_Free/Outdoor decoration/Chest.png');

  slimeSheet = loadImage('assets/Cute_Fantasy_Free/Enemies/Slime_Green.png');
  skeletonSheet = loadImage('assets/Cute_Fantasy_Free/Enemies/Skeleton.png');
  playerSheet = loadImage('assets/Cute_Fantasy_Free/Player/Player.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  slimeData.img = slimeSheet;
  skeletonData.img = skeletonSheet;
  playerData.img = playerSheet;

  islandLayer = createGraphics(width, height);
  cloudsLayer = createGraphics(width, height);

  drawStaticIsland();
  createAnimatedSprites();
}

function draw() {
  image(islandLayer, 0, 0);

  updateCloudLayer();

  drawStaticDecorations();

  for (let s of animatedSprites) {
    s.update();
    s.display();
  }

  image(cloudsLayer, 0, 0);
}

// ======================================================
// ISOLA STATICA
// ======================================================
function drawStaticIsland() {
  islandLayer.clear();
  islandLayer.noStroke();

  let centralx = width / 2;
  let centraly = height / 2;

  // 1) tiles
  for (let x = 0; x < width; x += tile_size) {
    for (let y = 0; y < height; y += tile_size) {
      let altitude = computeAltitude(x, y, centralx, centraly);
      let biomeNoise = noise(x / 90 + 1000, y / 90 + 1000);
      let waterPatchNoise = noise((x + 5000) / 85, (y + 5000) / 85);

      let seaLevel = 0.14;
      let beachLevel = 0.21;
      let plainsLevel = 0.28;
      let forestLevel = 0.35;
      let mountainLevel = 0.48;
      let snowLevel = 0.62;

      if (altitude < seaLevel) {
        if (waterPatchNoise > 0.62) {
          islandLayer.image(deepWaterImage, x, y, tile_size, tile_size);
        } else {
          islandLayer.image(shallowWaterImage, x, y, tile_size, tile_size);
        }
      } else if (altitude < beachLevel) {
        islandLayer.image(sandImage, x, y, tile_size, tile_size);
      } else if (altitude < plainsLevel) {
        islandLayer.image(grassImage, x, y, tile_size, tile_size);
      } else if (altitude < forestLevel) {
        if (biomeNoise > 0.58) {
          islandLayer.image(farmImage, x, y, tile_size, tile_size);
        } else {
          islandLayer.image(grassImage, x, y, tile_size, tile_size);
        }
      } else if (altitude < mountainLevel) {
        if (biomeNoise > 0.5) {
          islandLayer.image(farmImage, x, y, tile_size, tile_size);
        } else {
          islandLayer.image(grassImage, x, y, tile_size, tile_size);
        }
      } else if (altitude < snowLevel) {
        islandLayer.image(cliffImage, x, y, tile_size, tile_size);
      } else {
        islandLayer.image(snowImage, x, y, tile_size, tile_size);
      }
    }
  }

  // 2) decorazioni statiche grandi
  placeStaticDecorations();
}

function drawStaticDecorations() {
  for (let obj of placedObjects) {
    let sway = sin(frameCount * 0.02 + obj.x * 0.01) * 0.05;

    if (obj.type === "house") {
      sway *= 0.05;
      push();
      translate(obj.x, obj.y);
      rotate(sway);
      image(houseImage, -42, -68, 84, 112);
      pop();
    } else if (obj.type === "tree") {
      sway *= 1.5;
      push();
      translate(obj.x, obj.y);
      rotate(sway);
      image(treeImage, -30, -44, 60, 75);
      pop();
    } else if (obj.type === "chest") {
      sway *= 0.05;
      push();
      translate(obj.x, obj.y);
      rotate(sway);
      image(chestImage, -10, -10, 20, 20);
      pop();
    }
  }
}

function placeStaticDecorations() {
  let tries = 0;
  let housesPlaced = 0;
  let treesPlaced = 0;
  let chestsPlaced = 0;

  // CASE
  while (housesPlaced < 8 && tries < 1200) {
    let x = random(60, width - 60);
    let y = random(80, height - 50);

    let altitude = computeAltitude(x, y, width / 2, height / 2);

    if (altitude > 0.28 && altitude < 0.48 && isFarFromOthers(x, y, 110, "house")) {
      registerStaticObject(x, y, "house");
      housesPlaced++;
    }
    tries++;
  }

  tries = 0;

  // ALBERI
  while (treesPlaced < 40 && tries < 3000) {
    let x = random(40, width - 40);
    let y = random(50, height - 30);

    let altitude = computeAltitude(x, y, width / 2, height / 2);

    if (altitude > 0.30 && altitude < 0.48 && isFarFromOthers(x, y, 40, "tree")) {
      registerStaticObject(x, y, "tree");
      treesPlaced++;
    }
    tries++;
  }

  tries = 0;

  // CHEST
  while (chestsPlaced < 16 && tries < 15000) {
    let x = random(20, width - 20);
    let y = random(20, height - 20);

    let altitude = computeAltitude(x, y, width / 2, height / 2);

    if (altitude > 0.28 && altitude < 0.7 && isFarFromOthers(x, y, 24, "chest")) {
      registerStaticObject(x, y, "chest");
      chestsPlaced++;
    }
    tries++;
  }
}

// archivio semplice per non sovrapporre troppo gli elementi statici
let placedObjects = [];

function registerStaticObject(x, y, type) {
  placedObjects.push({ x, y, type });
}

function isFarFromOthers(x, y, minDist, type) {
  for (let obj of placedObjects) {
    let d = dist(x, y, obj.x, obj.y);

    if (type === "house" && d < minDist) return false;
    if (type === "tree" && d < minDist) return false;
    if (type === "chest" && d < minDist) return false;
  }
  return true;
}

// ======================================================
// NUVOLE DINAMICHE
// ======================================================
function updateCloudLayer() {
  cloudsLayer.clear();
  cloudsLayer.noStroke();

  let cloudScale = 300;
  let threshold = 0.58;

  for (let x = 0; x < width; x += tile_size) {
    for (let y = 0; y < height; y += tile_size) {
      let n = noise((x / cloudScale) + cloudOffset, y / cloudScale, cloudTime);

      if (n > threshold) {
        let alpha = map(n, threshold, 1, 100, 255);
        cloudsLayer.fill(255, 255, 255, alpha);
        cloudsLayer.rect(x, y, tile_size, tile_size);
      }
    }
  }

  cloudOffset += 0.002;
  cloudTime += 0.0008;
}
// ======================================================
// SPRITE ANIMATE
// ======================================================
function createAnimatedSprites() {
  animatedSprites = [];

  createGroup(10, slimeData, 42, 0.25, 0.60, 0, 8);      // slimes
  createGroup(7, skeletonData, 48, 0.28, 0.62, 0, 3);    // skeleton
  createGroup(5, playerData, 50, 0.24, 0.58, 0, 3);      // npc/player
}

function createGroup(count, sheetData, size, minAlt, maxAlt, row, frames) {
  let attempts = 0;

  while (count > 0 && attempts < 5000) {
    let x = random(30, width - 30);
    let y = random(30, height - 30);
    let altitude = computeAltitude(x, y, width / 2, height / 2);

    if (
      altitude > minAlt &&
      altitude < maxAlt &&
      isFarFromAnimatedSprites(x, y, size) &&
      isFarFromStaticObjects(x, y, size)
    ) {
      animatedSprites.push(
        new WalkerSprite(x, y, sheetData, size, row, frames)
      );
      count--;
    }

    attempts++;
  }
}

function isFarFromAnimatedSprites(x, y, size) {
  for (let sprite of animatedSprites) {
    let minDist = (size + sprite.size) * 0.5;

    if (dist(x, y, sprite.x, sprite.y) < minDist) {
      return false;
    }
  }

  return true;
}

function isFarFromStaticObjects(x, y, size) {
  for (let obj of placedObjects) {
    let minDist = (size + 40) * 0.5;

    if (obj.type === "house") {
      minDist = (size + 112) * 0.5;
    } else if (obj.type === "tree") {
      minDist = (size + 75) * 0.5;
    } else if (obj.type === "chest") {
      minDist = (size + 20) * 0.5;
    }

    if (dist(x, y, obj.x, obj.y) < minDist) {
      return false;
    }
  }

  return true;
}

class WalkerSprite {
  constructor(x, y, sheetData, size, row, framesInRow) {
    this.x = x;
    this.y = y;

    this.sheetData = sheetData;
    this.size = size;

    this.row = row;
    this.framesInRow = framesInRow;

    this.frame = floor(random(framesInRow));
    this.animCounter = 0;
    this.animSpeed = floor(random(6, 11));

    this.vx = random(-0.6, 0.6);
    this.vy = random(-0.6, 0.6);

    this.direction = 1;
  }

  update() {
    let nextX = this.x + this.vx;
    let nextY = this.y + this.vy;

    let altitude = computeAltitude(nextX, nextY, width / 2, height / 2);
    let blockedByStaticObject = !isFarFromStaticObjects(nextX, nextY, this.size);

    if (
      nextX < 15 || nextX > width - 15 ||
      nextY < 15 || nextY > height - 15 ||
      altitude < 0.20 || altitude > 0.72 ||
      blockedByStaticObject
    ) {
      this.vx *= -1;
      this.vy *= -1;
    } else {
      this.x = nextX;
      this.y = nextY;
    }

    if (random() < 0.025) {
      this.vx += random(-0.25, 0.25);
      this.vy += random(-0.25, 0.25);

      this.vx = constrain(this.vx, -0.9, 0.9);
      this.vy = constrain(this.vy, -0.9, 0.9);
    }

    if (this.vx > 0.05) this.direction = 1;
    if (this.vx < -0.05) this.direction = -1;

    this.animCounter++;
    if (this.animCounter % this.animSpeed === 0) {
      this.frame = (this.frame + 1) % this.framesInRow;
    }
  }

  display() {
    let sx = this.frame * this.sheetData.frameW;
    let sy = this.row * this.sheetData.frameH;

    push();
    translate(this.x, this.y);
    scale(this.direction, 1);

    image(
      this.sheetData.img,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
      sx,
      sy,
      this.sheetData.frameW,
      this.sheetData.frameH
    );

    pop();
  }
}

// ======================================================
// ALTEZZA
// ======================================================
function computeAltitude(x, y, centralx, centraly) {
  let waterBorder = min(width, height) * 0.14;
  let islandRadius = max(40, min(width, height) / 2 - waterBorder);

  let distanceFromCenter = dist(x, y, centralx, centraly);
  let normdistanceFromCenter = distanceFromCenter / islandRadius;

  let altitude = 1 - normdistanceFromCenter;

  noiseDetail(6, 0.5);
  let perlin = noise(x / perlinScale, y / perlinScale);

  altitude *= perlin;
  altitude += perlin;
  altitude -= 0.1;

  return altitude;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  islandLayer = createGraphics(width, height);
  cloudsLayer = createGraphics(width, height);

  placedObjects = [];
  drawStaticIsland();
  createAnimatedSprites();
}
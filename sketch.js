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
      
      let atitude = 1 - normdistanceFromCenter;

      fill(atitude * 255);
      rect(x, y, 1, 1);
      
    }
 }
}

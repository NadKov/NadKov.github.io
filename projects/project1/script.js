let t = 0;
let morph = 3;        // Steuert den Übergang (0 = Chaos/Noise, 1 = Wort)
let isWord = false;   // Status, ob gerade das Wort gezeigt wird
let targets = [];     // Speichert die Ziel-Koordinaten des Wortes
let word = "INTERACTION DESIGN";    // <-- HIER DEIN WUNSCHWORT EINTRAGEN
let extraCanvas;

function setup() {
  createCanvas(innerWidth, innerHeight);
  strokeWeight(4);
  calculateWordTargets();
}

// Liest die Pixel-Positionen der Buchstaben aus
function calculateWordTargets() {
  targets = [];
  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  pg.fill(random(255));
  pg.textAlign(CENTER, CENTER);
  
  // Schriftgröße automatisch an die Bildschirmbreite anpassen
  let fontSize = min(width / (word.length * 0.7), 260);
  pg.textSize(fontSize);
  pg.textStyle(BOLD);
  pg.text(word, width / 2, height / 2);
  pg.loadPixels();

  // Raster im gleichen Abstand (8px) wie das Noise-Gitter abtasten
  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      let index = (x + y * width) * 4;
      // Wenn der Pixel weiß ist (Teil des Textes), als Ziel speichern
      if (pg.pixels[index] > 128) {
        targets.push(createVector(x, y));
      }
    }
  }
}

function draw() {
  background(0);


  // Sanfter Übergang zwischen 0 (Noise) und 1 (Wort)
  let targetMorph = isWord ? 1 : 0;
  morph = lerp(morph, targetMorph, 0.06); // 0.06 bestimmt die Geschwindigkeit des Zusammenziehens

  let pointIndex = 0;

  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      let n = noise(x * 0.004, y * 0.004 - t);
      let m = noise(x * 0.01 + 9, y * 0.01 - 9 - t * 2);
      let a = TAU * (n * 3 + m);

      // Ursprüngliche Noise-Position
      let noiseX = x + 100 * cos(a);
      let noiseY = y + 100 * sin(a);

      let finalX = noiseX;
      let finalY = noiseY;

      // Wenn Zielpunkte für das Wort existieren, Punkte dorthin ziehen
      if (targets.length > 0) {
        // Alle Gitterpunkte werden gleichmäßig auf die Buchstaben verteilt
        let target = targets[pointIndex % targets.length];
        
        // Minimaler Rest-Drift (2px), damit das Wort lebendig schimmert
        let hoverX = target.x + 2 * cos(a);
        let hoverY = target.y + 2 * sin(a);

        // Weiche Interpolation zwischen Noise-Position und Wort-Position
        finalX = lerp(noiseX, hoverX, morph);
        finalY = lerp(noiseY, hoverY, morph);
      }

      // Bei Wort-Formation etwas deckender leuchten lassen
      let alpha = lerp(100, 200, morph);
      stroke(120 + 135 * m, 100 + 35 * n, 255, alpha);
      point(finalX, finalY);

      pointIndex++;
    }
  }

  t += 0.05;
}

// Schaltet beim Mausklick zwischen Wort und Noise-Welle um
function mousePressed() {
  isWord = !isWord;
}

// Passt die Leinwand und Textposition an, falls das Fenster skaliert wird
function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  calculateWordTargets();
}
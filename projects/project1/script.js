let t = 0;
let morph = 0;        // Startet sauber bei 0 (Noise)
let isWord = false;   // Status, ob gerade das Wort gezeigt wird
let targets = [];     // Speichert die Ziel-Koordinaten des Wortes
let word = "INTERACTION DESIGN";    // <-- HIER DEIN WUNSCHWORT EINTRAGEN
let particles = [];   // Speichert alle Partikel-Objekte

function setup() {
  createCanvas(innerWidth, innerHeight);
  strokeWeight(4);
  calculateWordTargets();
  initParticles();
}

// Erstellt das Partikel-Gitter einmalig
function initParticles() {
  particles = [];
  let pointIndex = 0;
  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      particles.push(new Particle(x, y, pointIndex));
      pointIndex++;
    }
  }
}

// Liest die Pixel-Positionen der Buchstaben aus
function calculateWordTargets() {
  targets = [];
  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  
  let fontSize = min(width / (word.length * 0.7), 260);
  pg.textSize(fontSize);
  pg.textStyle(BOLD);
  pg.text(word, width / 2, height / 2);
  pg.loadPixels();

  for (let x = 0; x < width; x += 8) {
    for (let y = 0; y < height; y += 8) {
      let index = (x + y * width) * 4;
      if (pg.pixels[index] > 128) {
        targets.push(createVector(x, y));
      }
    }
  }
}

// Partikel-Klasse für Position, Physik und Magnet-Verhalten
class Particle {
  constructor(x, y, index) {
    this.origX = x;
    this.origY = y;
    this.index = index;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
  }

  update(morphVal, t) {
    // 1. Noise-Position berechnen
    let n = noise(this.origX * 0.004, this.origY * 0.004 - t);
    let m = noise(this.origX * 0.01 + 9, this.origY * 0.01 - 9 - t * 2);
    let a = TAU * (n * 3 + m);

    let noiseX = this.origX + 100 * cos(a);
    let noiseY = this.origY + 100 * sin(a);

    let targetX = noiseX;
    let targetY = noiseY;

    // 2. Wort-Zielposition einbeziehen, falls aktiv
    if (targets.length > 0) {
      let target = targets[this.index % targets.length];
      let hoverX = target.x + 2 * cos(a);
      let hoverY = target.y + 2 * sin(a);
      targetX = lerp(noiseX, hoverX, morphVal);
      targetY = lerp(noiseY, hoverY, morphVal);
    }

    let desired = createVector(targetX, targetY);

    // 3. Magnet-Effekt bei gedrückter Maustaste
    if (mouseIsPressed) {
      let mousePos = createVector(mouseX, mouseY);
      let d = dist(this.pos.x, this.pos.y, mousePos.x, mousePos.y);
      let magnetRadius = 200; // Reichweite des Magneten

      if (d < magnetRadius) {
        // Zieht Partikel zur Maus
        let force = p5.Vector.sub(mousePos, this.pos);
        let strength = map(d, 0, magnetRadius, 0.5, 0.05);
        force.mult(strength);
        this.vel.add(force);
      }
    }

    // Rückholkraft zum eigentlichen Ziel (Noise oder Wort)
    let steering = p5.Vector.sub(desired, this.pos);
    steering.mult(0.08); // Elastizität
    this.vel.add(steering);
    this.vel.mult(0.80); // Reibung/Dämpfung

    this.pos.add(this.vel);
  }

  display(morphVal) {
    let n = noise(this.origX * 0.004, this.origY * 0.004 - t);
    let m = noise(this.origX * 0.01 + 9, this.origY * 0.01 - 9 - t * 2);
    let alpha = lerp(100, 200, morphVal);
    stroke(120 + 135 * m, 100 + 35 * n, 255, alpha);
    point(this.pos.x, this.pos.y);
  }
}

function draw() {
  background(0);

  // Sanfter Übergang zwischen 0 (Noise) und 1 (Wort)
  let targetMorph = isWord ? 1 : 0;
  morph = lerp(morph, targetMorph, 0.06);

  // Alle Partikel aktualisieren und zeichnen
  for (let p of particles) {
    p.update(morph, t);
    p.display(morph);
  }

  t += 0.05;
}

// Schaltet beim Klick zwischen Wort und Noise-Welle um
function mousePressed() {
  isWord = !isWord;
}

// Passt die Leinwand und Positionen an, falls das Fenster skaliert wird
function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  calculateWordTargets();
  initParticles();
}
let img;               
let cellSize = 5;      
let brushRadius = 30;  
let cells = [];        
let ready = false;     

// Breite des Gletscher-Bereichs getrennt von der Gesamtbreite des Canvas
let imgWidth = 800;

let dataPoints = [];
let START_YEAR, END_YEAR, START_VOLUME, END_VOLUME;

async function setup() {
  // Canvas verbreitert (800px für das Bild + 320px Seitenleiste rechts)
  createCanvas(1120, 1000);                         
  noStroke();                                      

  // Bild und CSV-Zeilen asynchron laden
  img = await loadImage("CornergratGletscher.png");
  let lines = await loadStrings("gletscher_daten.csv");

  // CSV zeilenweise einlesen (ab Zeile 1, da Zeile 0 die Überschrift ist)
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length === 0) continue; // Leere Zeilen überspringen
    let parts = line.split(",");
    dataPoints.push({
      jahr: int(parts[0]),
      volumen: float(parts[1]),
      prozent: int(parts[2])
    });
  }

  START_YEAR = dataPoints[0].jahr;
  END_YEAR = dataPoints[dataPoints.length - 1].jahr;
  START_VOLUME = dataPoints[0].volumen;
  END_VOLUME = dataPoints[dataPoints.length - 1].volumen;

  // Bild nur auf die linke Fläche (800x1000) skalieren
  img.resize(imgWidth, height);    
  img.loadPixels();             

  for (let x = 0; x < imgWidth; x += cellSize) {       
    for (let y = 0; y < height; y += cellSize) {    
      let farbe = img.get(x, y);                    
      let hell = brightness(farbe);                 
      if (hell > 40) {                              
        cells.push({                                
          x: x,                                     
          y: y,                                     
          size: cellSize,                           
          farbe: farbe,                             
          alive: true                               
        });
      }
    }
  }
  ready = true;  
}

function draw() {
  // Tiefes Gletscher-Nachtblau als Hintergrund statt reinem Schwarz
  background(8, 18, 28);  

  if (!ready) {                    
    fill(255);                     
    text("Lädt Daten & Bild...", 20, 20);  
    return;                        
  }

  let alive = 0;                   
  for (let c of cells) {           
    if (c.alive) alive++;          
  }
  let rest = alive / cells.length; 
  let restHeute = END_VOLUME / START_VOLUME; 

  if (mouseIsPressed && rest > restHeute) {
    for (let c of cells) {
      if (c.alive && dist(mouseX, mouseY, c.x, c.y) < brushRadius) { 
        c.alive = false;                                  
      }
    }
  }

  for (let c of cells) {
    if (c.alive) {
      fill(c.farbe);                 
      circle(c.x, c.y, c.size);      
    }
  }

  // Datenanzeige oben links (über dem linken Rand des Gletschers)
  let aktuellesVolumen = map(rest, 1, restHeute, START_VOLUME, END_VOLUME, true);   
  let aktuelleDaten = getInterpolatedData(aktuellesVolumen);

  fill(10, 25, 40, 200);                    
  rect(20, 20, 260, 100, 8);       
  fill(235, 248, 255);                       
  textSize(32);                    
  text(aktuelleDaten.jahr, 35, 60);              
  textSize(15);                    
  text("Gletschervolumen: " + nf(aktuelleDaten.volumen, 1, 2) + " km³", 35, 85); 
  text("Restbestand: " + aktuelleDaten.prozent + " %", 35, 105);

  // Konstante Hinweistafel rechts (ohne Bildüberlappung)
  drawInfoPanel();

  // Sonne als Cursor (wird zuletzt gezeichnet, damit sie über allem liegt)
  noCursor();                          
  stroke(255, 200, 0);                 
  strokeWeight(3);                     
  for (let i = 0; i < 12; i++) {       
    let winkel = TWO_PI / 12 * i;      
    let x1 = mouseX + cos(winkel) * 25;  
    let y1 = mouseY + sin(winkel) * 25;
    let x2 = mouseX + cos(winkel) * 40;  
    let y2 = mouseY + sin(winkel) * 40;
    line(x1, y1, x2, y2);              
  }
  noStroke();                          

  fill(255, 220, 0);                   
  circle(mouseX, mouseY, 40);          
}

function drawInfoPanel() {
  let panelX = 820;
  let panelY = 20;
  let panelW = 280;
  let panelH = 330;

  push();
  // Gläserner Gletscher-Effekt: Eisblau-türkise Fläche mit Transparenz & feinem Eis-Rahmen
  fill(140, 210, 235, 38);
  stroke(185, 235, 255, 130);
  strokeWeight(1.5);
  rect(panelX, panelY, panelW, panelH, 16);

  // Dezenter Lichtglanz am oberen Rand für den Glas-Look
  noStroke();
  fill(255, 255, 255, 25);
  rect(panelX + 2, panelY + 2, panelW - 4, 35, 14, 14, 0, 0);

  // Titel
  fill(225, 248, 255);
  textStyle(BOLD);
  textSize(22);
  text("Gorner Gletscher", panelX + 22, panelY + 46);

  // Feine Trennlinie in Eisblau
  stroke(160, 225, 250, 90);
  strokeWeight(1);
  line(panelX + 22, panelY + 62, panelX + panelW - 22, panelY + 62);

  // Fließtext
  noStroke();
  textStyle(NORMAL);
  fill(210, 238, 250);
  textSize(15);
  textLeading(22);

  let text1 = "Der Gletscherschwund ist ein direktes Resultat des globalen Klimawandels und der steigenden Temperaturen.";
  let text2 = "Dieses interaktive Modell zeigt den Rückgang des Gornergletschers am Monte Rosa im Wallis zwischen 1928 und 2026.";

  text(text1, panelX + 22, panelY + 84, panelW - 44, 120);
  text(text2, panelX + 22, panelY + 195, panelW - 44, 130);
  pop();
}

function getInterpolatedData(vol) {
  if (vol >= dataPoints[0].volumen) {
    return { jahr: dataPoints[0].jahr, volumen: dataPoints[0].volumen, prozent: dataPoints[0].prozent };
  }
  let last = dataPoints[dataPoints.length - 1];
  if (vol <= last.volumen) {
    return { jahr: last.jahr, volumen: last.volumen, prozent: last.prozent };
  }

  for (let i = 0; i < dataPoints.length - 1; i++) {
    let p1 = dataPoints[i];
    let p2 = dataPoints[i + 1];
    if (vol <= p1.volumen && vol >= p2.volumen) {
      let jahr = map(vol, p1.volumen, p2.volumen, p1.jahr, p2.jahr);
      let prozent = map(vol, p1.volumen, p2.volumen, p1.prozent, p2.prozent);
      return { jahr: round(jahr), volumen: vol, prozent: round(prozent) };
    }
  }
  return { jahr: END_YEAR, volumen: END_VOLUME, prozent: dataPoints[dataPoints.length - 1].prozent };
}

function keyPressed() {
  if (key === "r" || key === "R") {     
    for (let c of cells) c.alive = true; 
  }
}
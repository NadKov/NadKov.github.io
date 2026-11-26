let img;               
let cellSize = 6;      // Etwas grösseres Raster, entlastet den Computer noch mehr
let brushRadius = 30;  
let cells = [];        
let ready = false;     

// Daten Gornergletscher
let START_YEAR = 1928;  
let END_YEAR = 2026;    
let START_VOLUME = 6.8; 
let END_VOLUME = 2.9;   

let gletscherWidth = 750; // Bereich für das Bild links

function setup() {
  createCanvas(1100, 1000);                         
  noStroke();                                      
  loadImage("CornergratGletscher.png", bildGeladen); 
}

function bildGeladen(geladenesBild) {
  img = geladenesBild;          
  img.resize(gletscherWidth, height);    
  img.loadPixels();             

  // Einfache doppelte Schleife für das Raster
  for (let x = 0; x < gletscherWidth; x += cellSize) {       
    for (let y = 0; y < height; y += cellSize) {    
      let farbe = img.get(x, y);                    
      let hell = brightness(farbe);                 
      
      if (hell > 40) {                              
        // Speichert jeden Punkt als einfachen Daten-Eintrag (Objekt)
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
  background(20);  // Einfacher dunkler Hintergrund

  if (!ready) {                    
    fill(255);                     
    textSize(20);
    text("Bild lädt...", 20, 40);  
    return;                        
  }

  // 1. Zählen, wie viele Kreise noch da sind
  let alive = 0;                   
  for (let i = 0; i < cells.length; i++) {           
    if (cells[i].alive == true) {
      alive = alive + 1;          
    }
  }
  
  let rest = alive / cells.length; 
  let restHeute = END_VOLUME / START_VOLUME; 

  // 2. Wischen mit der Maus
  if (mouseIsPressed && rest > restHeute && mouseX < gletscherWidth) {
    for (let i = 0; i < cells.length; i++) {
      let d = dist(mouseX, mouseY, cells[i].x, cells[i].y);
      if (cells[i].alive && d < brushRadius) { 
        cells[i].alive = false;                                  
      }
    }
  }

  // 3. Alle noch vorhandenen Kreise zeichnen
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].alive == true) {
      fill(cells[i].farbe);                 
      circle(cells[i].x, cells[i].y, cells[i].size);      
    }
  }

  // 4. Sonne an der Mausposition zeichnen (nur im linken Bereich)
  if (mouseX < gletscherWidth) {
    noCursor();                          
    stroke(255, 200, 0);                 
    strokeWeight(3);                     
    
    // 12 Sonnenstrahlen mit einfacher Schleife
    for (let i = 0; i < 12; i++) {       
      let winkel = TWO_PI / 12 * i;      
      let x1 = mouseX + cos(winkel) * 25;  
      let y1 = mouseY + sin(winkel) * 25;
      let x2 = mouseX + cos(winkel) * 40;  
      let y2 = mouseY + sin(winkel) * 40;
      line(x1, y1, x2, y2);              
    }
    noStroke();                          

    // Sonnenkern
    fill(255, 220, 0);                   
    circle(mouseX, mouseY, 40);          
  } else {
    cursor(); // Normaler Mauszeiger über der Infotafel rechts
  }

  // 5. Jahr und Volumen berechnen
  let jahr = round(map(rest, 1, restHeute, START_YEAR, END_YEAR, true));   
  let volumen = map(rest, 1, restHeute, START_VOLUME, END_VOLUME, true);   
  let prozent = round(volumen / START_VOLUME * 100);                       

  // 6. Infobox oben links (Gletscher-Daten)
  fill(0, 150);                    
  rect(20, 20, 260, 100, 8);       
  
  fill(255);                       
  textSize(32);                    
  text(jahr, 35, 60);              
  
  textSize(15);                    
  text("Gletschervolumen: " + nf(volumen, 1, 2) + " km³", 35, 85); 
  text("Restbestand: " + prozent + " %", 35, 105);                 

  // 7. Rechte Hinweistafel (ganz klassisch mit einzelnen text()-Zeilen geschrieben)
  fill(180, 215, 255, 40); // Leicht bläuliches Glas
  stroke(255, 100);
  strokeWeight(1);
  rect(780, 20, 300, 960, 10); // Rechteck rechts
  noStroke();

  // Titel rechts
  fill(255);
  textSize(22);
  text("Gorner Gletscher", 810, 70);

  // Trennlinie
  stroke(255, 100);
  line(810, 90, 1050, 90);
  noStroke();

  // Beschreibung (Zeile für Zeile geschrieben, typisch für Anfänger)
  fill(230, 240, 255);
  textSize(13);
  
  text("Der Gletscherschwund ist ein direktes", 810, 130);
  text("Resultat des globalen Klimawandels", 810, 150);
  text("und der steigenden Temperaturen.", 810, 170);

  text("Dieses interaktive Modell zeigt den/n Rückgang des Gornergletschers/n am Monte Rosa im Wallis/n zwischen 1928 und 2026.", 810, 220);
  //text("Rückgang des Gornergletschers", 810, 240);
  //text("am Monte Rosa im Wallis", 810, 260);
  //text("zwischen 1928 und 2026.", 810, 280);

  // Bedienungsanleitung rechts
  fill(255, 210, 100);
  textSize(15);
  text("Bedienung:", 810, 360);

  fill(230, 240, 255);
  textSize(13);
  text("1. Bewege die Sonne über den", 810, 400);
  text("   Gletscher zum Schmelzen.", 810, 420);
  
  text("2. Das Modell stoppt im", 810, 460);
  text("   Jahr 2026.", 810, 480);

  text("3. Drücke 'R' auf der Tastatur,", 810, 520);
  text("   um neu zu starten.", 810, 540);
}

// Taste R: Alles zurücksetzen
function keyPressed() {
  if (key === "r" || key === "R") {     
    for (let i = 0; i < cells.length; i++) {
      cells[i].alive = true; 
    }
  }
}
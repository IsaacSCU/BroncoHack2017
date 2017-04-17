var UP_VECTOR, LT_VECTOR, DL_VECTOR, DR_VECTOR, RT_VECTOR, tmp;
var backgroundColor;
var pentagonFillColor, pentagonLineColor;
var shapeFillColor, shapeLineColor;
var NUM_PENTS;
var PENT_WIDTH;
var lineColors = [];
var img;

// var elasticsearch = require('elasticsearch');
// var client;

var response;
var data;
var XLEN;
var WIDTH;
var HEIGHT;
var font;
var OFFSET;

function preload() {
  loadJSON("data.json", getData);
  font = loadFont("./Exo-Regular.ttf");
}

function getData(response) {
  data = response;
}

function setup() {
  img = loadImage("logo.png");
  
  HEIGHT = 10;
  PENT_WIDTH = 300;
  // client = new elasticsearch.Client({
  //   host: 'localhost:9200',
  //   log: 'trace'
  // });
  
  // client.ping({
  //   requestTimeout: 30000,
  // }, function (error) {
  //   if (error) {
  //     console.error('elasticsearch cluster is down!');
  //   } else {
  //     console.log('All is well');
  //   }
  // });
  
  lineColors.push(color(91, 192, 235));
  lineColors.push(color(253, 231, 76));
  lineColors.push(color(154, 196, 61));
  lineColors.push(color(229, 89, 52));
  lineColors.push(color(250, 121, 33));
  
  createCanvas(1368, 768);
  //var canvas = createCanvas(400, 400, P2D);
  //canvas.parent('pentScript');
  frameRate(60);

  UP_VECTOR = createVector(0, -1);
  tmp = UP_VECTOR.copy();
  tmp.rotate(TWO_PI/5.0)
  LT_VECTOR = tmp.copy();
  tmp.rotate(TWO_PI/5.0)
  DL_VECTOR = tmp.copy();
  tmp.rotate(TWO_PI/5.0)
  DR_VECTOR = tmp.copy();
  tmp.rotate(TWO_PI/5.0)
  RT_VECTOR = tmp.copy();

  backgroundColor = color(91);
  pentagonLineColor = color(51, 51, 51);
  pentagonFillColor = color(255, 255, 255);
  //shapeFillColor = color(121, 154, 216, 220);
  shapeFillColor = color(77, 134, 182, 220);
  shapeLineColor = color(73, 107, 170);

  NUM_PENTS = 6;
  
  XLEN = 10;
  WIDTH = 800;
  textFont(font);
  }

function draw() {
  background(backgroundColor);
  
  fill(255);
  noStroke();
  push();
  rectMode(CORNERS);
  
  OFFSET = 15;
  rect(OFFSET, OFFSET, width/3 - OFFSET/2, height/2 - OFFSET/2); //ul
  
  rect(OFFSET, height/2 + OFFSET/2, width*2/3 - OFFSET/2, height - OFFSET); //graph
  
  rect(width/3 + OFFSET/2, OFFSET, width*2/3 - OFFSET/2, height/2 - OFFSET/2); //ur two
  rect(width*2/3 + OFFSET/2, OFFSET, width - OFFSET, height/2 - OFFSET/2);
  
  rect(width*2/3 + OFFSET/2, height/2 + OFFSET/2, width - OFFSET, height - OFFSET); //lr
  pop();
  
  if (frameCount % 10*60 === 0) { // load JSON every 10s
    loadJSON("data.json", getData);
  }
  
  var myKey;
  for (var key in data)
    myKey = key;
  
  var emotRngScore, agreeScore, extrScore, concScore, openScore;
  emotRngScore = 0; agreeScore = 0; extrScore = 0; concScore = 0; openScore = 0;
  
  var iter = 0.0;
  for (var key in data) {
    openScore += data[key]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][0]["score"];
    concScore += data[key]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][1]["score"];
    extrScore += data[key]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][2]["score"];
    agreeScore += data[key]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][3]["score"];
    emotRngScore += data[key]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][4]["score"];
    iter += 1.0;
  }

  // DRAW PENTAGON DATA
  drawPentData(width*2/3 + OFFSET/2 + (width - OFFSET - (width*2/3 + OFFSET/2))/2, height*3/4 + OFFSET, openScore/iter, concScore/iter, extrScore/iter, agreeScore/iter, emotRngScore/iter);
  
  var points = [];
 
  for (var i = 0; i < 5; i++) {
    points[i] = [];
    var j = 0;
    for (var key in data) {
      points[i][j] = data[key]["watson_response"]["document_tone"]["tone_categories"][0]["tones"][i]["score"];
      j++;
    }
  }
            
  for (var j = 0; j < points.length; j++) {
    for (var i = 0; i < points[j].length; i++) {
      if (points[j][i] > 1)
        points[j][i] = 1;
      else
        points[j][i] = map(points[j][i], 0, 1, 0, HEIGHT);
    }
  }
  
  // DRAW GRAPH DATA
  drawGraphData(2*OFFSET, height/2 + OFFSET/2+OFFSET, width*2/3 - OFFSET/2-OFFSET, height - 2*OFFSET, points);

  fill(pentagonLineColor);
  push();
  textAlign(CENTER);
  
  //textSize(64);
  //text("MELLOW", width/6 + OFFSET/4, -76 + (height/2-OFFSET/2-OFFSET)/2); // center
  //text("MIND", width/6 + OFFSET/4, -6 + (height/2-OFFSET/2-OFFSET)/2); // center
  
  // LOGO INSERT
  imageMode(CENTER);
  image(img, width/6 + OFFSET/2 + OFFSET/4, -26 + (height/2-OFFSET/2-OFFSET)/2, img.width*4/3, img.height*4/3);
  
  
  // caption
  textSize(20);
  noStroke();
  fill(color(77, 134, 182));
  text("Visualize your mental state", width/6 + OFFSET/4, 60 + (height/2-OFFSET/2-OFFSET)/2);
  pop();
  
  // text
  push();
  fill(pentagonLineColor);
  textSize(16);
  noStroke();
  translate(width/3 + OFFSET/2, OFFSET + 25);
  
  push();
  stroke(pentagonLineColor);
  strokeWeight(1);
  text("Analysis:", 2*OFFSET, 2*OFFSET, width/4 + 50, height/2 - OFFSET);
  pop();
  
  text("Based on your stress levels during the session and the emotion of what you have said, we have determined that your mind is too overwhelmed.", 2*OFFSET, 2*OFFSET + 25, width/4 + 50, height/2 - OFFSET);
  
  push();
  stroke(pentagonLineColor);
  strokeWeight(1);
  text("Recommendations:", 2*OFFSET, 2*OFFSET + 125, width/4 + 50, height/2 - OFFSET);
  pop();
  
  text("We recommend (2) 15 minute meditation sessions a day to help calm the mind in the morning and at night. We also suggest writing down how your day went each night, and reviewing your journal before your next session with us. See you soon!", 2*OFFSET, 2*OFFSET + 150, width/4+50, height/4);
  pop();
  
  // draw mellow/focused
  stroke(pentagonLineColor);
  fill(255);
  
  // data relativization
  var mellow = data[myKey]["eeg_averages"]["mellow"];
  var focus = data[myKey]["eeg_averages"]["focused"];
  
  var MAX = max(mellow, focus);
  var MIN = min(mellow, focus);
  mellow = mellow*200 / MAX;
  focus = focus*200 / MAX;
  
  rect(width*2/3 + OFFSET/2 + OFFSET, 2*OFFSET, width - 2*OFFSET, height/2 - OFFSET/2 - OFFSET);
  
  push();
  translate(width*2/3 + OFFSET/2, 2*OFFSET);
  translate(width/6 - OFFSET/2, height/2 - 3*OFFSET - OFFSET/2);
  fill(shapeFillColor);
  rect(0, 0, -100, -mellow);
  fill(lineColors[4]);
  rect(0, 0, 100, -focus);
  
  fill(pentagonLineColor);
  textSize(20)
  noStroke();
  text("mellow", -82, -mellow - 5);
  text("focus", 24, -focus - 5);
  textSize(32);
  text("EEG Processing", -100, -280);
  pop();
}

// make sure points data is mapped to have y coordinate in the range of 0 to height-150
function drawGraphData(x, y, x2, y2, points) { // array of points with x and y fields
  push();
  fill(pentagonFillColor);
  stroke(pentagonLineColor);
  WIDTH = x2 - x;
  HEIGHT = y2-y;
  rectMode(CORNERS);
  rect(x, y, x2, y2);
  translate(x, y);
  
  strokeWeight(0.5);
  for (var i = 1; i < XLEN; i++) {
    line(WIDTH/XLEN * i, 0, WIDTH/XLEN * i, HEIGHT);
  }
  
  strokeWeight(3);
  noFill();
  
  //console.log(points[0][0]);
  for (var j = 0; j < points.length; j++) {
    stroke(lineColors[j]);
    beginShape();
    for (var i = 0; i <= XLEN && points[j][i]; i++) {
      vertex(WIDTH/XLEN * i, HEIGHT - points[j][i]);
    }
    endShape();
  }
  
  pop();
  
  // put title
  push()
  fill(pentagonLineColor);
  textSize(32);
  text("Tonal Analysis", width/6, height/2 + OFFSET/2 + 2*OFFSET + 40);
  pop();
  
  // draw legend
  fill(255);
  stroke(pentagonLineColor);
  rectMode(CORNERS);
  var xoff = width/2 + 93;
  rect(xoff, height/2 + OFFSET/2 + 2*OFFSET, width*2/3 - OFFSET/2 - 2*OFFSET, height - 3*OFFSET - height/4);
  push();
  translate(xoff, height/2 + OFFSET/2 + 2*OFFSET);
  noStroke();
  fill(51);
  textSize(16);
  text("anger", 29, 20);
  text("disgust", 29, 40);
  text("fear", 29, 60);
  text("joy", 29, 80);
  text("sadness", 29, 100);
  
  fill(lineColors[3]);
  ellipse(15, 15, 12, 12);
  fill(lineColors[2]);
  ellipse(15, 35, 12, 12);
  fill(lineColors[4]);
  ellipse(15, 55, 12, 12);
  fill(lineColors[1]);
  ellipse(15, 75, 12, 12);
  fill(lineColors[0]);
  ellipse(15, 95, 12, 12);
  pop();
}

function drawPentData(x, y, r1, r2, r3, r4, r5) {
  push();
  translate(x, y);
  fill(pentagonFillColor);
  stroke(pentagonLineColor);
  strokeWeight(1);
  
  var MAX, MIN;
  MAX = Math.max(r1, r2, r3, r4, r5);
  MIN = Math.min(r1, r2, r3, r4, r5);
  r1 = map(r1, MIN, MAX, 0.3, 0.9);
  r2 = map(r2, MIN, MAX, 0.3, 0.9);
  r3 = map(r3, MIN, MAX, 0.3, 0.9);
  r4 = map(r4, MIN, MAX, 0.3, 0.9);
  r5 = map(r5, MIN, MAX, 0.3, 0.9);

  // draw the background shapes
  push();
  strokeWeight(4);
  drawPentagon(1);
  pop();

  for (var i = 1; i >= 0; i -= 1/(NUM_PENTS - 1)) {
    if (i == 1 || i === 0)
      continue;
    drawPentagon(i);
  }
  point(0, 0);

  drawGuideLines();

  // draw the data component
  drawDataPolygon(r1, r2, r3, r4, r5);

  pop();
}

function drawPentagon(size) {
  beginShape();
  vertex(size*PENT_WIDTH/2*UP_VECTOR.x, size*PENT_WIDTH/2*UP_VECTOR.y);
  vertex(size*PENT_WIDTH/2*LT_VECTOR.x, size*PENT_WIDTH/2*LT_VECTOR.y);
  vertex(size*PENT_WIDTH/2*DL_VECTOR.x, size*PENT_WIDTH/2*DL_VECTOR.y);
  vertex(size*PENT_WIDTH/2*DR_VECTOR.x, size*PENT_WIDTH/2*DR_VECTOR.y);
  vertex(size*PENT_WIDTH/2*RT_VECTOR.x, size*PENT_WIDTH/2*RT_VECTOR.y);
  vertex(size*PENT_WIDTH/2*UP_VECTOR.x, size*PENT_WIDTH/2*UP_VECTOR.y);
  endShape();
}

function drawGuideLines() {
  line(0, 0, PENT_WIDTH/2*UP_VECTOR.x, PENT_WIDTH/2*UP_VECTOR.y);
  line(0, 0, PENT_WIDTH/2*LT_VECTOR.x, PENT_WIDTH/2*LT_VECTOR.y);
  line(0, 0, PENT_WIDTH/2*DL_VECTOR.x, PENT_WIDTH/2*DL_VECTOR.y);
  line(0, 0, PENT_WIDTH/2*DR_VECTOR.x, PENT_WIDTH/2*DR_VECTOR.y);
  line(0, 0, PENT_WIDTH/2*RT_VECTOR.x, PENT_WIDTH/2*RT_VECTOR.y);
  
  push();
  fill(0);
  noStroke();
  textSize(16);
  text("open", PENT_WIDTH/2*UP_VECTOR.x - 19, PENT_WIDTH/2*UP_VECTOR.y - 13);
  text("consc", PENT_WIDTH/2*LT_VECTOR.x + 10, PENT_WIDTH/2*LT_VECTOR.y);
  text("extr", PENT_WIDTH/2*DL_VECTOR.x + 10, PENT_WIDTH/2*DL_VECTOR.y + 10);
  text("agree", PENT_WIDTH/2*DR_VECTOR.x - 50, PENT_WIDTH/2*DR_VECTOR.y + 10);
  text("emot", PENT_WIDTH/2*RT_VECTOR.x - 50, PENT_WIDTH/2*RT_VECTOR.y);
  pop();
}

// r1 is top index, working clockwise around
function drawDataPolygon(r1, r2, r3, r4, r5) {
  push();
  //fill(229, 100, 60, 220);
  fill(shapeFillColor);
  strokeWeight(3);
  //stroke(209, 80, 40);
  stroke(shapeLineColor);

  push();
  strokeWeight(1);
  line(0, 0, r1*PENT_WIDTH/2*UP_VECTOR.x, r1*PENT_WIDTH/2*UP_VECTOR.y);
  line(0, 0, r2*PENT_WIDTH/2*LT_VECTOR.x, r2*PENT_WIDTH/2*LT_VECTOR.y);
  line(0, 0, r3*PENT_WIDTH/2*DL_VECTOR.x, r3*PENT_WIDTH/2*DL_VECTOR.y);
  line(0, 0, r4*PENT_WIDTH/2*DR_VECTOR.x, r4*PENT_WIDTH/2*DR_VECTOR.y);
  line(0, 0, r5*PENT_WIDTH/2*RT_VECTOR.x, r5*PENT_WIDTH/2*RT_VECTOR.y);
  pop();

  beginShape();
  vertex(r1*PENT_WIDTH/2*UP_VECTOR.x, r1*PENT_WIDTH/2*UP_VECTOR.y);
  vertex(r2*PENT_WIDTH/2*LT_VECTOR.x, r2*PENT_WIDTH/2*LT_VECTOR.y);
  vertex(r3*PENT_WIDTH/2*DL_VECTOR.x, r3*PENT_WIDTH/2*DL_VECTOR.y);
  vertex(r4*PENT_WIDTH/2*DR_VECTOR.x, r4*PENT_WIDTH/2*DR_VECTOR.y);
  vertex(r5*PENT_WIDTH/2*RT_VECTOR.x, r5*PENT_WIDTH/2*RT_VECTOR.y);
  vertex(r1*PENT_WIDTH/2*UP_VECTOR.x, r1*PENT_WIDTH/2*UP_VECTOR.y);
  endShape();
  pop();
}

var UP_VECTOR, LT_VECTOR, DL_VECTOR, DR_VECTOR, RT_VECTOR, tmp;
var backgroundColor;
var pentagonFillColor, pentagonLineColor;
var shapeFillColor, shapeLineColor;
var NUM_PENTS;
var PENT_WIDTH;
var lineColors = [];

// var elasticsearch = require('elasticsearch');
// var client;

var response;
var data;

function preload() {
  loadJSON("data.json", getData);
}

function getData(response) {
  data = response;
}

function setup() {
  PENT_WIDTH = 400;
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
  
  for (var i = 0; i < 8; i++) {  // set colors for legend
    lineColors.push(color(random(50, 240), random(50, 240), random(50, 240)));
  }
  
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

  backgroundColor = color(130, 130, 140);
  pentagonLineColor = color(61, 51, 51);
  pentagonFillColor = color(255, 255, 255);
  shapeFillColor = color(121, 154, 216, 220);
  shapeLineColor = color(73, 107, 170);

  NUM_PENTS = 6;
  
  }

function draw() {
  background(backgroundColor);
  
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
    openScore += data[myKey]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][0]["score"];
    concScore += data[myKey]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][1]["score"];
    extrScore += data[myKey]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][2]["score"];
    agreeScore += data[myKey]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][3]["score"];
    emotRngScore += data[myKey]["watson_response"]["document_tone"]["tone_categories"][2]["tones"][4]["score"];
    iter += 1.0;
  }

  drawPentData(width*5/6, height*2/3, openScore/iter, concScore/iter, extrScore/iter, agreeScore/iter, emotRngScore/iter);
  
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
        points[j][i] = map(points[j][i], 0, 1, 0, height - 150);
    }
  }
  
  drawGraphData(50, 100, points);
}

// make sure points data is mapped to have y coordinate in the range of 0 to height-150
function drawGraphData(x, y, points) { // array of points with x and y fields
  push();
  translate(x, y);
  fill(pentagonFillColor);
  stroke(pentagonLineColor);
  rect(0, 0, 800, height - 150);
  
  strokeWeight(0.5);
  for (var i = 1; i < 4; i++) {
    line(200 * i, 0, 200 * i, height - 150);
  }
  
  strokeWeight(3);
  noFill();
  
  //console.log(points[0][0]);
  for (var j = 0; j < points.length; j++) {
    stroke(lineColors[j]);
    beginShape();
    for (var i = 0; i <= 4 && points[j][i]; i++) {
      vertex(200 * i, height - 150 - points[j][i]);
    }
    endShape();
  }
  
  
  pop();
}

function drawPentData(x, y, r1, r2, r3, r4, r5) {
  push();
  translate(x, y);
  fill(pentagonFillColor);
  stroke(pentagonLineColor);
  strokeWeight(1);

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

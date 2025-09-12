let data = null;
let arr = [1, 2, 3, 4, 5];

function setup() {
    createCanvas(800, 800);
    background(245);
    let overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];(way["building"](35.64,139.7,35.73,139.8););out%20geom;';
    data = loadJSON(overpassUrl, gotData);
    noFill();
    strokeWeight(0.5);
    frameRate(5);
}

function draw() {

    if (data["elements"]) {
        data["elements"].forEach(building => {
            beginShape();
            building["geometry"].forEach(p => {
                let y = map(p.lat, 35.64, 35.73, height, 0);
                let x = map(p.lon, 139.7, 139.8, 0, width);
                vertex(x, y);
            })
            endShape(CLOSE);
        })
        noLoop();
    }
}


function gotData() {
    console.log("got data");
}
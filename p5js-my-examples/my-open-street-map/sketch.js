let data = null;
const coords = [25.029928, 121.470337, 25.054501, 121.499004];
const [latMin, longMin, latMax, longMax] = coords;
let shapesDrawn = 0;

function setup() {
    createCanvas(800, 800);
    background(245);
    let overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(way["building"](${coords.join(",")}););out%20geom;`;
    console.log(overpassUrl);
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
                let y = map(p.lat, latMin, latMax, height, 0);
                let x = map(p.lon, longMin, longMax, 0, width);
                vertex(x, y);
                console.log(x, y)
            })
            endShape(CLOSE);
        })
        noLoop();
    } else {
      console.error(`"ERROR: elements" not found in OSM data`)
    }
}


function gotData() {
    console.log("got data");
}
class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004]
  }
}

const coords = TestCoordinates.coords.Taipei;
const [latMin, longMin, latMax, longMax] = coords;

function setup() {
  createCanvas(800, 800);
  background(240);
  noFill();
  strokeWeight(0.5);
  console.log("loading...")
  renderTile(coords); 
}

function draw() {
  // nothing yet
}

async function renderTile(coords) {
  try {
    const coordString = coords.join(",")
    const osmQuery = "data=" + encodeURIComponent(`
        [bbox:${coordString}][out:json][timeout:90];
        (
          way["building"](${coordString});
        );
        out geom;`);

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: osmQuery,
    });

    const json = await response.json();
    console.log(json);

    // debug truncate
    // json.elements = json.elements.slice(0, 300);

    json.elements.forEach((building) => {
      beginShape();
      building.geometry.forEach((point) => {
        let y = map(point.lat, latMin, latMax, height, 0);
        let x = map(point.lon, longMin, longMax, 0, width);
        vertex(x, y);
      });
      endShape(CLOSE);
    });

  } catch (error) {
    console.error(error);
  }



}
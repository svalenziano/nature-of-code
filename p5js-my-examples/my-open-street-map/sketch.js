class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004]
  }
}

const TIMEOUT = 6;  // unit = seconds

const myQueries = {
  building: `wr["building"];`,
  road: `wr["highway"~"motorway|motorway_link|trunk|primary|secondary|tertiary|residential|service"];`,
  green_space: `
    wr["leisure"~"park|garden"];
    wr["landuse"~"grass|forest|meadow|orchard"];`,
  farm: `wr["landuse"~"farmyard|vineyard"]`,
  industrial: `wr["landuse"~"industrial|quarry|brownfield|military|logging|landfill"]`
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
        [bbox:${coordString}][out:json][timeout:${TIMEOUT}];
        (
          ${myQueries.building}
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

    json.elements.forEach((object) => {
      beginShape();
      if (object.type === "way") {
        object.geometry.forEach((point) => {
          let y = map(point.lat, latMin, latMax, height, 0);
          let x = map(point.lon, longMin, longMax, 0, width);
          vertex(x, y);
        });
      }
      endShape();
    });

  } catch (error) {
    console.error(error);
  }



}
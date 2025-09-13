class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004],
    Durham: [35.985577, -78.913336, 36.004673, -78.888788],
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

const coords = TestCoordinates.coords.Durham;
const [latMin, longMin, latMax, longMax] = coords;

function setup() {
  createCanvas(800, 800);
  background(240);
  // noFill();
  strokeWeight(0.5);
  console.log("loading...")
  renderTile(coords); 
}

function draw() {
  // nothing yet
}

async function fetchLayer(coords, query) {
  
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
      if (object.type === "way") {
        drawGeometry(object.geometry, {latMin, longMin, latMax, longMax});
      } else if (object.type === "relation") {
        object.members.forEach((member) => {
          if (member.type === "way") {
            drawGeometry(member.geometry, {latMin, longMin, latMax, longMax});
          }
        })
      }
    });

  } catch (error) {
    console.error(error);
  }



}

function drawGeometry(geoArray, {latMin, longMin, latMax, longMax}, fillColor=255) {
  /*
  EXPECTED INPUT = ARRAY:
      [
         { "lat": 35.9945128, "lon": -78.9050525 },
         { "lat": 35.9945023, "lon": -78.9050263 },
         ...
      ]
  */
  beginShape();
  if (fillColor) {
    fill(fillColor);
  } else {
    noFill();
  }
  geoArray.forEach((point) => {
    let y = map(point.lat, latMin, latMax, height, 0);
    let x = map(point.lon, longMin, longMax, 0, width);
    vertex(x, y);
  });
  endShape();
}
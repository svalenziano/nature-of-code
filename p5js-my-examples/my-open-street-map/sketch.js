class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004]
  }
}

const myQueries = {
  buildings: `wr["building"]({{bbox}});`,
  roads: `wr["highway"~"motorway|motorway_link|trunk|primary|secondary|tertiary|residential|service"]({{bbox}});`,
  green_space: `
    wr["leisure"="park"]({{bbox}});
    wr["landuse"="grass"]({{bbox}});
    wr["landuse"="grass"]({{bbox}});
    wr["leisure"="garden"]({{bbox}});`,
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
          way["building:levels"](${coordString});
          way["highway"](${coordString});
          way["surface"](${coordString});
          way["natural"](${coordString});
          way["waterway"](${coordString});
          way["power"](${coordString});
          way["service"](${coordString});
          way["access"](${coordString});
          way["wall"](${coordString});
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
      endShape();
    });

  } catch (error) {
    console.error(error);
  }



}
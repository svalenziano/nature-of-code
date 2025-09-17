"use strict";

/*
Written by Steven Valenziano in 2025 to practice working with DOM manipulation, events, asynchronous programming, network requests (via fetch), with a sprinkling of pre-ES6 syntax just for giggles.

HEAVILY INSPIRED BY: Prettymaps, by Marcelo de Oliveira Rosa Prates (https://github.com/marceloprates/prettymaps)

Dependencies: p5js library
*/




///////////////////////////////////////////////////////////
// CLASSES AND HELPER FUNCTIONS

// There are more robust methods of throttling, but this does the trick for now
class SlowFetcher {
  constructor(milliseconds) {
    this.queue = [];
    this.milliseconds = milliseconds;  // Minimum interval between requests.  unit = milliseconds
    this.timer = null;
  }

  async fetch(url, options) {
    let resolve;
    let reject;

    const futureFetch =  new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    // IF TIMER EXISTS, PUSH ARGUMENTS TO QUEUE FOR FUTURE FETCHING
    if (this.timer !== null) {
      this.queue.push({url, options, resolve, reject});
      console.log("SlowFetcher: Pushing new fetch to queue")
      console.log(this.queue)
      return futureFetch;

    // IF NO TIMER EXISTS, CREATE THE TIMER AND PROCESS THIS FETCH IMMEDIATELY
    } else {
      // CREATE TIMER that resolves the `futureFetch`
      console.log("SlowFetcher: Creating timer")
      this.timer = setInterval(async () => {
        if (this.queue.length > 0) {
          const {url, options, resolve, reject} = this.queue.shift();
          const response = await fetch(url, options);
          if (response.ok) {
            resolve(response);
          } else {
            reject(response);
          }
        } else {
          console.log("SlowFetcher: Destroying timer")
          clearInterval(this.timer);
          this.timer = null;
        }
      }, this.milliseconds); 
      
      // PROCESS IMMEDIATELY and return Promise
      // no `await`, since we want this method to act exactly like the native `fetch`
      return fetch(url, options);  
    }
  }
}


function setupListeners() {
  document.body.addEventListener("click", async (ev) => {
    console.log("Fetching data...")
    renderTile(coords, await fetchLayer(coords, [myQueries.building]), null);
  })
  console.log("Click to load: setup complete.");
}



function renderTile([latMin, longMin, latMax, longMax], json, color) {
    json.elements.forEach((object) => {
      if (object.type === "way") {
        drawGeometry(object.geometry, {latMin, longMin, latMax, longMax}, color);
      } else if (object.type === "relation") {
        object.members.forEach((member) => {
          if (member.type === "way") {
            drawGeometry(member.geometry, {latMin, longMin, latMax, longMax}, color);
          }
        })
      }
    });

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

class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004],
    Durham: [35.985577, -78.913336, 36.004673, -78.888788],
  }
}

///////////////////////////////////////////////////////////
// GLOBALS AND CONFIG
const OFFLINE = true;
const TIMEOUT = 6;  // unit = seconds
const REQUEST_DELAY = 3000;  // delay to play nice with OSM servers

let done = false;

const myQueries = {
  building: `wr["building"];`,
  road: `wr["highway"~"motorway|motorway_link|trunk|primary|secondary|tertiary|residential|service"];`,
  green_space: `
    wr["leisure"~"park|garden"];
    wr["landuse"~"grass|forest|meadow|orchard"];`,
  farm: `wr["landuse"~"farmyard|vineyard"];`,
  industrial: `wr["landuse"~"industrial|quarry|brownfield|military|logging|landfill"];`
}

const coords = TestCoordinates.coords.Durham;

///////////////////////////////////////////////////////////
// APP LOGIC

const osmFetcher = new SlowFetcher(REQUEST_DELAY);
const [latMin, longMin, latMax, longMax] = coords;

async function setup() {
  createCanvas(800, 800);
  background(240);
  noFill();
  strokeWeight(0.5);
  console.log("loading...")
  // renderTile(coords, await fetchLayer(coords, [myQueries.building]));
  setupListeners();
  console.log("Setup is complete!")
}

// From what  I can tell, `draw` is always executed synchronously, regardless of `async` keyword
function draw() {
  // Intentionally left blank
  // No `draw` loop is needed
}


async function fetchLayer(coords, queries) {
  /*
  coords: OSM-formatted array of coords, eg [25.029928, 121.470337, 25.054501, 121.499004]
  queries: array of one or more Overpass API queries eg [`wr["building"];`, `wr["landuse"];`]
  Return: json API response
  */
  if (OFFLINE) {
    const response = await fetch("./data_durham.json");
    return await response.json();
  }
  try {
    const coordString = coords.join(",")
    const osmQuery = "data=" + encodeURIComponent(`
        [bbox:${coordString}][out:json][timeout:${TIMEOUT}];
        (
          ${queries.join('')}
        );
        out geom;`);

    const response = await osmFetcher.fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: osmQuery,
    });

    const json = await response.json();
    return json;

  } catch (error) {
    console.log("Fetch from OSM failed");
    throw error;
  }
}
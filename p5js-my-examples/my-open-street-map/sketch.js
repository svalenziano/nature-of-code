"use strict";

/*
Written by Steven Valenziano in 2025 to practice working with DOM manipulation, events, asynchronous programming, network requests (via fetch), with a sprinkling of pre-ES6 syntax just for giggles.

HEAVILY INSPIRED BY: Prettymaps, by Marcelo de Oliveira Rosa Prates (https://github.com/marceloprates/prettymaps)

Dependencies: p5js library
*/

/////////////////////////////////////////////////////////////////////////////
// Slow Fetcher
// Written in pre-ES6 syntax
// There are more robust methods of throttling, but this does the trick for now

/*
  Since fetch is async and request may be resolved or rejected IN ANY ORDER (not the order that they were made), you must use a 'token-based' system rather than a linear data structure such as a queue.
  
  V1
    IDEA: use Promise.withResolvers() to create a remote-controlled Promise.  Fetching is handled on a timer, and results / errors are resolved to the original promise.  
    
    STATES:
      - Timer exists AND fetches in queue:
        - push AND RETURN a future fetch to the queue!
      - Else (Timer doesn't exist or queue empty):
        - create timer
        - fetch now AND RETURN
      - Timer callback:
        - if queue exists:
          - dequeue and process one of the objects with a native `fetch`
          - resolve /reject the associated `futureFetch` 
        - else:
          - clear the timer (access via this.timer)
    ALGO
      FETCH
        - input = standard fetch args
        - return = promise that resolves with a Response object (same as fetch)
        REGARDLESS:
          - make a promise (to make a request in the future) using `Promise.withResolvers`
        if timer exists
          - enqueue object: {resolver, rejector, url, options} => this object enables the promise to be resolved remotely, with the results of a "future fetch"
          - return the future fetch promise (so that this function can be used identically to built-in `fetch`)
        Else (timer is null), the request can be made immediately. 
          - return the promise
          - create the timer
            - schedule the "future fetch" => create `processQueue` (helper) timer using setInterval
      
      processQueue (HELPER callback for setInterval)
        - on timeout (execute every X milliseconds):
          - if queue has elements:
            - await: fetch and get json from response
            - if response, resolve the original promise
            - if error, reject
          - else:
            - clearInterval

  V2
    IDEA: use all.Settled to create a remote-controlled promise? I don't think this is possible.
*/

///////////////////////////////////////////////////////////
// CLASSES AND HELPER FUNCTIONS

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
    if (this.timer) {

      this.queue.push({url, options, resolve, reject});
      return futureFetch;

    // IF NO TIMER EXISTS, CREATE THE TIMER AND PROCESS THIS FETCH IMMEDIATELY
    } else {
      // CREATE TIMER that resolves the `futureFetch`
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


class TestCoordinates {
  static coords = {
    Taipei: [25.029928, 121.470337, 25.054501, 121.499004],
    Durham: [35.985577, -78.913336, 36.004673, -78.888788],
  }
}



function setupListeners() {
  document.body.addEventListener("click", async (ev) => {
    console.log("Fetching data...")
    renderTile(coords, await fetchLayer(coords, [myQueries.building]));
  })
  console.log("Click to load: setup complete.");
}

async function fetchLayer(coords, queries) {
  /*
  coords: OSM-formatted array of coords, eg [25.029928, 121.470337, 25.054501, 121.499004]
  queries: array of one or more Overpass API queries eg [`wr["building"];`, `wr["landuse"];`]
  Return: json API response
  */
  try {
    const coordString = coords.join(",")
    const osmQuery = "data=" + encodeURIComponent(`
        [bbox:${coordString}][out:json][timeout:${TIMEOUT}];
        (
          ${queries.join('')}
        );
        out geom;`);

    const response = await fetch("https://overpass-api.de/api/interpreter", {
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

function renderTile([latMin, longMin, latMax, longMax], json) {
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


///////////////////////////////////////////////////////////
// GLOBALS AND CONFIG

const TIMEOUT = 6;  // unit = seconds
const osmFetcher = new SlowFetcher(500);

let done = false;

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

///////////////////////////////////////////////////////////
// MAIN LOOP

const [latMin, longMin, latMax, longMax] = coords;

async function setup() {
  createCanvas(800, 800);
  background(240);
  // noFill();
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
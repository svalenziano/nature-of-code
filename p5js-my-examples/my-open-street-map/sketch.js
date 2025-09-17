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

class Layer {
  /*
  keysAndTags = JS object: `{building: null, leisure: [park, garden], landuse: [grass, forest, meadow, orchard]}` where `null` represents ALL tags for that key
  */
  static hashKeyTag(key, tag) {
    return `${key}:${tag}`;
  }

  constructor({name, keysAndTags}) {
    this.name = name;
    this.keysAndTags = keysAndTags;
    this.elements = [];

    Object.values(keysAndTags).forEach((tag) => {
      if (tag !== null && !Array.isArray(tag)) {
        throw new Error("tag must be `null` or Array");
      }
    })
  }

  addElements(elements) {
    this.elements.push(elements);
  }

  get queryString() {
    let string = "";
    for (const key in this.keysAndTags) {
      const tags = this.keysAndTags[key];
      if (tags === null) {
        string += `wr["${key}"];`;
      } else if (tags.length > 1) {
        string += `wr["${key}"~"${tags.join("|")}"];`;
      } else {
        string += `wr["${key}"="${tags[0]}"];`;
      }
    }
    return string;
  }

  get dispatchHash() {
    /*
    Input: none (use this.keysAndTags)
    Return: object eg {"building": this} or {"leisure:park": this, "leisure:garden": this}
    */
    const result = {};
    for (const key in this.keysAndTags) {
      const tags = this.keysAndTags[key];
      if (tags === null) {
        result[key] = this;
      } else {
        tags.forEach((tag) => {
          result[Layer.hashKeyTag(key, tag)] = this;
        })
      }
    }
    return result;
  }
}

/*
Map contains and orchestrates Layers
*/
class StreetMap {

  static defaultLayers = [
    { 
      name: "Buildings",
      keysAndTags: {
        building: null,
      },
    },
    {
      name: "Green Space",
      keysAndTags: {
        leisure: ["park", "garden"],
        landuse: ["grass"],
      },
    }
  ];

  constructor(coords) {
    this.coords = coords;
    this.latMin = coords[0];
    this.longMin = coords[1];
    this.latMax = coords[2];
    this.longMax = coords[3];

    this.layers = [];
    this.dispatchHash = {};

    this.populateDefaultLayers();
    this.updateDispatchHash();
  }

  async init() {
    const data = await this.fetchlayers();
    console.log(data);
    // dispatch fetched data to layer objects
    /*
      - For each element in json
        - check for match between keys and tags
        - push the element to the appropriate layer
    */

    // draw layers

  }

  get coordString() {
    return this.coords.join(",");
  }

  updateDispatchHash() {
    this.layers.forEach((layer) => {
      Object.assign(this.dispatchHash, layer.dispatchHash);
    })
  }

  populateDefaultLayers() {
    for (const l of StreetMap.defaultLayers) {
      this.layers.push(new Layer(l));
    }
  }

  async fetchlayers(layerNames=[]) {
    /*
    Input: layers to fetch data for.  Default = use this.layers
    Return: JSON response
    parse response and populate each layer with elements
    */
    let query = "";
    if (layerNames.length === 0) {
      for (const layer of this.layers) {
        query += layer.queryString;
      }

      const osmQuery = "data=" + encodeURIComponent(`
          [bbox:${this.coordString}][out:json][timeout:${TIMEOUT}];
          (${query});
          out geom;`);

      const response = await osmFetcher.fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: osmQuery,
      });

      const json = await response.json();
      return json;

    } else {
      throw new Error("NOT YET IMPLEMENTED")
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
let map;

async function setup() {
  createCanvas(800, 800);
  background(240);
  noFill();
  strokeWeight(0.5);
  console.log("loading...")
  // renderTile(coords, await fetchLayer(coords, [myQueries.building]));
  // setupListeners();
  map = new StreetMap(coords);
  await map.init();
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
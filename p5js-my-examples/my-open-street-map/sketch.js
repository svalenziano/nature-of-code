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


  constructor({name, tags, color_line, color_fill}) {
    /*
    tags = JS object: `{building: null, leisure: [park, garden], landuse: [grass, forest, meadow, orchard]}` where `null` represents ALL tags for that key
    */
    this.name = name;
    this.tags = tags;
    this.color_line = color_line;
    this.color_fill = color_fill;
    this.elements = [];  // collection of elements from OSM API response

    Object.values(tags).forEach((tag) => {
      if (tag !== null && !Array.isArray(tag)) {
        throw new Error("tag must be `null` or Array");
      }
    })
  }

  static relationHasCutouts(element) {
    /*
    Given a relation, is at least one of it's members role === 'inner'?
    */
    const m = element.members;
    if (m && m[m.length - 1].role === "inner") return true;
    return false;
  }

  static isClosed(element) {
    /*
    Limitation: for relations, this function checks to see if any duplicate points exist.  There's probably a better way.
    */
    if (element.type === "way") {

      const first = element.geometry[0];
      const last = element.geometry.slice(-1)[0];
      return JSON.stringify(first) === JSON.stringify(last);

    } else if (element.type === "relation") {
      
      const seen = [];

      for (let member of element.members) {
        if (member.role === "inner") continue;
        for (let pt of member.geometry) {
          const pointString = JSON.stringify(pt);
          if (seen.includes(pointString)) return true
          seen.push(pointString);
        }
      }
      return false;
    }
  }

  draw({coords, elements, filterCB}) {
    /*
    REQ'D ARGS
      coords = required,
    OPTIONAL ARGS
      elements = array of elements to be drawn
      filterCB = callback to filter elements (ele)
    EXPECTED INPUT = ARRAY:
        [
          { "lat": 35.9945128, "lon": -78.9050525 },
          { "lat": 35.9945023, "lon": -78.9050263 },
          ...
        ]
    */
    if (this.color_line) {
      stroke(this.color_line);
    } else {
      noStroke();
    }
    
    elements = elements || this.elements;

    if (filterCB instanceof Function) {
      elements = elements.filter(filterCB);
      console.log(`Filtered elements for layer "${this.name}":`)
      console.info(elements);
    }

    for (let ele of elements) {
      if (Layer.isClosed(ele) && this.color_fill) {
        fill(this.color_fill);
      } else {
        noFill();
      }

      if (ele.type === "way") {
        beginShape();
        for (const pt of ele.geometry) {
          Layer.addVertex({coords, pt});
        }
        endShape();
      } else if (ele.type === "relation") {
        if (Layer.relationHasCutouts(ele)) {
          beginShape();
          // DRAW OUTER CONTOURS
          // ele.members.filter((member) => member.role === "outer")
          //   .map((member) => member.geometry)
          //   .forEach((pt) => Layer.addVertex({coords, pt, bounds:ele.bounds}));
          for (const member of ele.members.filter((m) => m.role === "outer")) {
            const geo = member.geometry;
            for (let pt of geo) {
              Layer.addVertex({coords, pt, bounds:ele.bounds});
            }
          }


          // DRAW INNER CONTOURS IN REVERSE
          // todo - make helper function and implement!
          ele.members.filter((member) => member.role === "inner")
            .forEach((member) => Layer.createCutout({
              coords, 
              memberGeometry: member.geometry,
              bounds:ele.bounds
            }));
          endShape();
        } else {  // Relations w/ no cutouts
          for (const member of ele.members) {
            beginShape();
            
            for (const pt of member.geometry) {
              Layer.addVertex({coords, pt});
            }
            endShape();
          }
        }
      } else {
        console.log("ABORTING");
        console.log(ele);
        throw new Error("Can only draw ways and relations")
      }
    }
  }

  static createCutout({coords, memberGeometry, bounds}) {
    /*
    Input = member.geometry eg '[{"lat":35.9894581,"lon":-78.8993456},...]'
    Return: none
    SideEffect = beginContour, drawVertex, endContour
    */
    beginContour();
    memberGeometry
      .reverse()
      .forEach((pt) => {
        Layer.addVertex({coords, pt, bounds});
      })
    endContour();
  }

  static addVertex({coords, pt, bounds}) {
    /*
    point = eg {lat: 1.23, lon: 4.56}
    coords = OSM coords array eg [1.23, 4.56, 7.89, 9.99] (latMin, longMin, etc)
    */
    let latMin, longMin, latMax, longMax;
    if (DEBUG.drawLarge === true && bounds) {
      // Use bounds of element as min and max
      const {minlat, minlon, maxlat, maxlon} = bounds;
      [latMin, longMin, latMax, longMax] = [minlat, minlon, maxlat, maxlon];
    } else {
      [latMin, longMin, latMax, longMax] = coords;
    }
    let y = map(pt.lat, latMin, latMax, height, 0);
    let x = map(pt.lon, longMin, longMax, 0, width);
    point(x, y);
    vertex(x, y);
  }

  addElement(element) {
    /*
    Input = element from OSM json response
    Side effect = mutate this.elements
    */
    this.elements.push(element);
  }

  matchesTags(tags) {
    /*
    input = 
      - tags = eg {"destination:street":"Chapel Hill Street","highway":"motorway_link","lanes":"1","oneway":"yes","surface":"concrete"}
      - this.tags = eg {"leisure":["park","garden"],"landuse":["grass"]}
    return = boolean
    */
    for (let [eleKey, eleTag] of Object.entries(tags)) {
      if (Object.keys(this.tags).includes(eleKey) && (
          this.tags[eleKey] === null || this.tags[eleKey].includes(eleTag))) {
        return true;
      }
    }
    return false;
  }

  get queryString() {
    let string = "";
    for (const key in this.tags) {
      const tags = this.tags[key];
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

}

/*
Map contains and orchestrates Layers
*/
class StreetMap {

  static colors = {
    bg: "rgb(241, 244, 203)",
    dark: "rgb(65, 54, 51)",
    bright: "rgb(239, 96, 94)",
    green: "rgba(153, 197, 114, 1)",
    blue: "rgba(138, 181, 204, 1)",
    ick: "rgba(115, 28, 122, 1)",
  }

  // Top layers are drawn last
  static defaultLayers = [
    { 
      name: "Buildings",
      color_fill: StreetMap.colors.dark,
      color_line: StreetMap.colors.dark,
      tags: {
        building: null,
      },
    },
    {
      name: "Roads",
      color_fill: null,
      color_line: StreetMap.colors.dark,
      tags: {
        highway: ["motorway", "motorway_link", "trunk", "primary", "primary_link", "secondary", "tertiary", "tertiary_link","residential", "service"]
      },
    },
    {
      name: "Green Space",
      color_fill: StreetMap.colors.green,
      color_line: StreetMap.colors.dark,
      tags: {
        leisure: ["park", "garden"],
        landuse: ["grass"],
      },
    },
    {
      name: "Public Space",
      color_fill: StreetMap.colors.green,
      color_line: StreetMap.colors.dark,
      tags: {
        leisure: ["village_green", "track"],
        amenity: ["school"],
      }
    },
    {
      name: "Paths",
      color_fill: null,
      color_line: StreetMap.colors.dark, 
      tags: {
        highway: ["footway", "service", "driveway"],
      },
    },
    {
      name: "Water",
      color_fill: StreetMap.colors.blue,
      color_line: StreetMap.colors.dark,
      tags: {
        waterway: null,
        natural: ["water"],
      },
    },
    {
      name: "Parking",
      color_fill: StreetMap.colors.ick,
      color_line: StreetMap.colors.bg,
      tags: {
        parking: null,
        parking_space: null,
        amenity: ["parking"]
      }
    },
    {
      name: "No Tresspassing",
      color_fill: StreetMap.colors.bright,
      color_line: null,
      tags: {
        access: ["private"],
      },
    },
  ];

  constructor(coords) {
    this.coords = coords;
    this.latMin = coords[0];
    this.longMin = coords[1];
    this.latMax = coords[2];
    this.longMax = coords[3];

    this.layers = [];
    this.dispatchHash = {};
    this.color_bg = "rgba(241, 244, 203, 1)"

    this.populateDefaultLayers();
    this.updateDispatchHash();
  }

  async init() {
    const json = await this.fetchlayers();
    console.log(json);
    this.dispatchToLayer(json);
    this.draw({filterCB: DEBUG.activeFilter});
  }

  clear() {
    background(this.color_bg);
  }

  draw({filterCB}) {
    for (const layer of this.layers.reverse()) {
      layer.draw({coords: this.coords, filterCB})
    }
  }

  dispatchToLayer(json) {
    /*
    Input: json response from OSM
    Side effects: 
      1) Warn if orphans are found
      2) Dispatch elements from json to each Layer
    */
    const orphanElements = [];
    let foundCount = 0;

    elementIteration: for (const element of json.elements) {

      for (let layer of this.layers) {
        if (layer.matchesTags(element.tags)) {
          foundCount += 1;
          layer.addElement(element);
          continue elementIteration;
        }
      }
      // push to 'orphans' if not found in any layer
      orphanElements.push(element);
    }
    if (orphanElements.length > 0) {
      console.error(`Warning: layers could not be found for ${orphanElements.length} elements!`);
      console.error(orphanElements);
    }
    console.log(`Dispatched ${foundCount} elements to layers.`)
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
    if (OFFLINE) {
      const response = await fetch("./data_durham.json");
      const json = await response.json();
      console.log(`(OFFLINE) Fetched ${json.elements.length} elements`)
      return json;
    }

    
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
      console.log(`Fetched ${json.elements.length} elements`)
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
let myMap;


const FILTERS = {
  none: null,

  cutouts(ele) {
    return (
      ele.id === 355718 ||  // running track w/ inner and outer
      ele.id === 3423713 || // church
      ele.id === 7586589 || // grass thingy?
      ele.members && ele.members.length === 4
    )
  }
}

const DEBUG = {
  activeFilter: FILTERS.none,
  drawLarge: false,
}

async function setup() {
  createCanvas(800, 800);
  noFill();
  strokeWeight(0.5);
  console.log("loading...")
  // renderTile(coords, await fetchLayer(coords, [myQueries.building]));
  // setupListeners();
  myMap = new StreetMap(coords);
  myMap.clear();
  await myMap.init();
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
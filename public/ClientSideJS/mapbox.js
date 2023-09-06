// "use strict";

console.log("Hello from the CLIENT side");

// Get access to the location of the Tour :
/*
  to do this step withou making the js sending a seperate
  request to the API, we're going to write the location data
  in the tour template since the template has an access to the tour variable
  and has all its data, the all is left is to read that data by the js .
*/

const locations = JSON.parse(document.getElementById("map").dataset.locations);
// console.log(locations);

const map = L.map("map", {
  center: [51.505, -0.09],
  zoom: 13,
  zoomControl: false,
  dragging: false,
});
// console.log(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const points = [];
locations.forEach((locatin) => {
  points.push([locatin.coordinates[1], locatin.coordinates[0]]);
  L.marker([locatin.coordinates[1], locatin.coordinates[0]], {
    icon: L.icon({
      iconUrl: "../img/pin.png",
      iconSize: [27, 34],
      iconAnchor: [20, 20],
      popupAnchor: [-7, -7],
    }),
  })
    .addTo(map)
    .bindPopup(`<p>Day ${locatin.day}: ${locatin.description}</p>`, {
      autoClose: false,
    })
    .openPopup();
});

const bounds = L.latLngBounds(points).pad(0.4);
map.fitBounds(bounds);

map.scrollWheelZoom.disable();

/*
mapboxgl.accessToken =
  "pk.eyJ1IjoianVzdG1hcnlhIiwiYSI6ImNsbGoxMW1kYTB0bzEzbHQ2NzdzZG43cWUifQ.tQAS-nyFoFryn1FqCtMlhw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/justmarya/cllj275ij019n01qsb19x7bft",
  // center: [-118.113491, 34.111745] ,// like mongoDB, first lng then lat
//   zoom: 3,
  interactive: false,
//   scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();

// create a marker for each location :
locations.forEach((loc) => {
  const elHTML = document.createElement("div");
  elHTML.className = "marker";
  // add the markers inside mapbox :
  new mapboxgl.Marker({
    element: elHTML,
    anchor: "bottom",
  }).setLngLat(loc.coordinates).addTo(map);

  // add a popup for each location :
  new mapboxgl.Popup({
    offset: 30, // to create a space between the marker and popup .
    focusAfterOpen: false // tp prevent the page from scrolling down to the map directly .
  }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
  .addTo(map);
  // extend map boundes to include the current locations :
  bounds.extend(loc.coordinates);
});

// حركة الدوران الي تصير للماب من أسوي ريفريش للصفحة هي بسبب هذي الميثود
map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
*/

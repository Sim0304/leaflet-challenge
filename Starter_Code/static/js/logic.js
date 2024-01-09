let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(url).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                    <p>${new Date(feature.properties.time)}</p>
                    <p>Magnitude: ${feature.properties.mag}</p>
                    <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
  }

  // Define a function to determine the marker size based on magnitude
  function getMarkerSize(magnitude) {
    return magnitude * 3;
  }

  // Define a function to determine the marker color based on depth
  function getMarkerColor(depth) {
    // You can adjust the color scale based on your preferences
    return depth > 50 ? '#ff0000' : '#0000ff';
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: getMarkerSize(feature.properties.mag),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create a map centered at (0, 0).
  let map = L.map('map').setView([0, 0], 2);

  // Add the base map layer.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add the earthquakes layer to the map.
  earthquakes.addTo(map);
  
  // Add a legend
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depthValues = [0, 10, 20, 30, 40, 50];
    let labels = [];

    // loop through depth values and generate a label with a colored square for each depth range
    for (let i = 0; i < depthValues.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getMarkerColor(depthValues[i] + 1) + '"></i> ' +
        depthValues[i] + (depthValues[i + 1] ? '&ndash;' + depthValues[i + 1] + ' km<br>' : '+ km');
    }

    return div;
  };
}

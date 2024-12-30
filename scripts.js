mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRnZnRiMDBmYXYybHNneTNobDNoODEifQ.SIUur0MYADGFIENyXuVwRA';

const map = new mapboxgl.Map({
  container: 'map', // The ID of the map container
  style: 'mapbox://styles/mapbox/dark-v11', // Default style
  center: [-0.1276, 51.5074], // London coordinates
  zoom: 10.5, // Adjust zoom level
});

map.addControl(new mapboxgl.NavigationControl());

// Function to normalize the rating
function normalizeRating(rating) {
  return Math.max(-16, Math.min(16, rating)); // Ensure rating is within the -16 to 16 range
}

// Function to fetch GeoJSON data from the Google Apps Script web app
function fetchGeoJSON() {
  const geoJSONUrl = 'https://script.google.com/macros/s/AKfycbxw1siuCZUp0YnvNSVmRmFzbibuRVhk2JGr25H2CxFTfjvD5N1NgHFBLmqUXIl5C2slyg/exec';

  fetch(geoJSONUrl)
    .then(response => response.json())
    .then(data => {
      // Add the GeoJSON data to the map
      map.addSource('pubs', {
        type: 'geojson',
        data: data
      });

      // Add a layer to display the pubs on the map
      map.addLayer({
        id: 'pubs-layer',
        type: 'circle',
        source: 'pubs',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'rating'],
            -16, '#940000',
            -10, '#ff0000',
            -2, '#FFA500',
            7, '#c7ff66',
            16, '#196903'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add popups to each marker
      map.on('click', 'pubs-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const pubName = e.features[0].properties.pubName;
        const rating = e.features[0].properties.rating;

        const normalizedRating = normalizeRating(rating);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${pubName}</h3><p>Rating: ${normalizedRating}/16</p>`)
          .addTo(map);
      });

      map.on('mouseenter', 'pubs-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'pubs-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    })
    .catch(error => console.error('Error fetching GeoJSON data:', error));
}

// Fetch the GeoJSON data on page load
fetchGeoJSON();

// Geocode a pub name and center on the map
function geocodePlace(name) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${mapboxgl.accessToken}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        map.setCenter(coordinates);
        map.setZoom(14);

        new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${data.features[0].place_name}</h3>`))
          .addTo(map);
      }
    })
    .catch(error => console.error('Error in geocoding:', error));
}

// Add a search bar
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search pubs...';
searchInput.style.position = 'absolute';
searchInput.style.top = '10px';
searchInput.style.left = '10px';
searchInput.style.padding = '8px';
searchInput.style.border = '1px solid #ccc';
searchInput.style.borderRadius = '4px';
searchInput.style.width = '200px';
searchInput.style.zIndex = '1';
document.body.appendChild(searchInput);

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  fetchGeoJSON(query);
});

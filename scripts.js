// Initialize map
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
  const geoJSONUrl = 'https://script.google.com/macros/s/AKfycbxw1siuCZUp0YnvNSVmRmFzbibuRVhk2JGr25H2CxFTfjvD5N1NgHFBLmqUXIl5C2slyg/exec'; // Replace with the actual Web App URL

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
            -16, '#D3D3D3', // Light grey for -16
            -10, 'blue', // Blue for -10
            0, 'orange', // Orange for neutral ratings
            10, 'red', // Red for 10
            16, '#228B22' // green for 16
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      // Add popups to each marker
      map.on('click', 'pubs-layer', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var pubName = e.features[0].properties.pubName;
        var rating = e.features[0].properties.rating;

        // Normalize the rating and display it as rating/16
        var normalizedRating = normalizeRating(rating);

        // Log rating and normalized rating for debugging
        console.log('Raw rating:', rating);
        console.log('Normalized rating:', normalizedRating);

        // Create a popup with pub details and normalized rating
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${pubName}</h3><p>Rating: ${normalizedRating}/16</p>`)
          .addTo(map);
      });

      // Change the cursor to a pointer when hovering over the pubs layer
      map.on('mouseenter', 'pubs-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Reset the cursor when leaving the layer
      map.on('mouseleave', 'pubs-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    })
    .catch(error => {
      console.error('Error fetching GeoJSON data:', error);
    });
}

// Fetch the GeoJSON data on page load
fetchGeoJSON();

// Function to geocode a pub name (convert name to coordinates)
function geocodePlace(name) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${mapboxgl.accessToken}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        const placeName = data.features[0].place_name;

        // Update map center and zoom
        map.setCenter(coordinates);
        map.setZoom(14);

        // Create and add marker
        new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`))
          .addTo(map);
      } else {
        console.error("No results found for this place.");
      }
    })
    .catch(err => console.error('Error geocoding place:', err));
}

// Call geocodePlace if pub name is in the URL
const urlParams = new URLSearchParams(window.location.search);
const pubName = urlParams.get('pub_name');
if (pubName) {
  geocodePlace(pubName);
}

// Add filter control (for filtering by rating range)
const filterControl = document.createElement('div');
filterControl.className = 'mapboxgl-ctrl';
filterControl.style.position = 'absolute';
filterControl.style.top = '10px';
filterControl.style.right = '10px';
filterControl.style.zIndex = '1'; // Ensure the button is above the map
filterControl.innerHTML = `
  <button id="filter-button" style="background-color: #212020; color: #f5d3b5; border: none; padding: 10px; cursor: pointer;">
    Filter
  </button>
`;

filterControl.addEventListener('click', () => {
  const ratingRange = prompt("Enter rating range:\n\n-16 to -11, -10 to 0, 1 to 10, 11 to 16");
  let filteredRatings = [];
  
  switch (ratingRange) {
    case "-16 to -11":
      filteredRatings = [-16, -11];
      break;
    case "-10 to 0":
      filteredRatings = [-10, 0];
      break;
    case "1 to 10":
      filteredRatings = [1, 10];
      break;
    case "11 to 16":
      filteredRatings = [11, 16];
      break;
    default:
      alert("Invalid range");
      return;
  }

  // Filter pubs based on the selected range
  map.setFilter('pubs-layer', [
    'all',
    ['>=', ['get', 'rating'], filteredRatings[0]],
    ['<=', ['get', 'rating'], filteredRatings[1]]
  ]);
});

map.getCanvas().parentNode.appendChild(filterControl);

// Add search bar control
const searchControl = document.createElement('div');
searchControl.className = 'mapboxgl-ctrl';
searchControl.style.position = 'absolute';
searchControl.style.top = '50px'; // Adjusted top offset
searchControl.style.right = '10px'; // Adjusted right offset
searchControl.style.zIndex = '1'; // Ensure the search bar is above the map
searchControl.innerHTML = `
  <input id="search-bar" type="text" placeholder="Search pub by name" style="padding: 5px; border-radius: 5px;">
`;

searchControl.querySelector('#search-bar').addEventListener('input', (event) => {
  const searchTerm = event.target.value.toLowerCase();
  if (searchTerm === '') {
    map.setFilter('pubs-layer', ['>=', ['get', 'rating'], -16]);
  } else {
    map.setFilter('pubs-layer', ['all', 
      ['>=', ['get', 'rating'], -16], 
      ['match', ['get', 'pubName'], searchTerm, true, false]
    ]);
  }
});

map.getCanvas().parentNode.appendChild(searchControl);

// Filter Menu Toggle
const filterBtn = document.getElementById('filter-btn');
const filterMenu = document.getElementById('filter-menu');

filterBtn.addEventListener('click', function () {
  filterMenu.classList.toggle('active');
});

// Search Bar Toggle (Expanding)
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');

searchBar.addEventListener('focus', function () {
  searchBar.classList.add('expanded');
});

searchBar.addEventListener('blur', function () {
  searchBar.classList.remove('expanded');
});

// Filter Range Selection
const filterRange = document.getElementById('filter-range');
filterRange.addEventListener('change', function () {
  const selectedRange = filterRange.value;
  console.log(`Selected Range: ${selectedRange}`);
  // You can use this range to filter markers on the map
});

// Reset Filter
const resetFilterButton = document.getElementById('reset-filter');
resetFilterButton.addEventListener('click', function () {
  filterRange.value = '';
  console.log('Filter Reset');
  // Reset map markers or other content as needed
});

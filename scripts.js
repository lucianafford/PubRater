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
            -16, '#940000', // red
            -10, '#ff0000', // red
            -2, '#FFA500', // orange
            7, '#c7ff66', // Lime for 10
            16, '#196903' // Green for 16
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

      // **Search and Filter Code**

      // Function to search pubs by name
      function searchPub(name) {
        const searchResult = data.features.filter(pub => pub.properties.pubName.toLowerCase().includes(name.toLowerCase()));

        // Clear existing markers
        map.getSource('pubs').setData({
          type: 'FeatureCollection',
          features: searchResult
        });
      }

      // **Search Input**
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search';
      searchInput.style.position = 'absolute';
      searchInput.style.bottom = '20px'; // Place it just above the map
      searchInput.style.right = '70px'; // Place it to the right
      searchInput.style.padding = '8px';
      searchInput.style.border = 'none';
      searchInput.style.borderRadius = '5px';
      searchInput.style.backgroundColor = 'black'; // Black background
      searchInput.style.color = 'white'; // White text
      searchInput.style.fontSize = '14px';
      searchInput.style.width = '100px'; // Smaller width
      searchInput.style.zIndex = '1'; // Ensure it stays above the map

      document.body.appendChild(searchInput);

      searchInput.addEventListener('input', (event) => {
        const query = event.target.value;
        searchPub(query);
      });

      // **Range Filter Code**
      const rangeFilterContainer = document.createElement('div');
      rangeFilterContainer.style.position = 'absolute';
      rangeFilterContainer.style.bottom = '60px';
      rangeFilterContainer.style.right = '20px';
      rangeFilterContainer.style.padding = '8px';
      rangeFilterContainer.style.backgroundColor = 'black';
      rangeFilterContainer.style.borderRadius = '5px';
      rangeFilterContainer.style.color = 'white';
      rangeFilterContainer.style.fontSize = '14px';
      rangeFilterContainer.style.display = 'flex';
      rangeFilterContainer.style.flexDirection = 'row';
      rangeFilterContainer.style.alignItems = 'center';
      rangeFilterContainer.style.zIndex = '1';

      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.placeholder = 'Min';
      minInput.placeholder.colour = 'LightGray';
      minInput.style.width = '36px';
      minInput.style.marginRight = '5px';
      minInput.style.color = 'DimGray';

      const toLabel = document.createElement('span');
      toLabel.textContent = 'to';
      toLabel.style.marginRight = '5px';

      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.placeholder = 'Max';
      maxInput.placeholder.colour = 'LightGray';
      maxInput.style.width = '36px';
      maxInput.style.marginRight = '5px';
      maxInput.style.color = 'DimGray';

      const filterButton = document.createElement('button');
      filterButton.textContent = 'Filter';
      filterButton.style.padding = '5px';
      filterButton.style.border = 'none';
      filterButton.style.borderRadius = '5px';
      filterButton.style.backgroundColor = 'white';
      filterButton.style.color = 'black';
      filterButton.style.cursor = 'pointer';

      rangeFilterContainer.appendChild(minInput);
      rangeFilterContainer.appendChild(toLabel);
      rangeFilterContainer.appendChild(maxInput);
      rangeFilterContainer.appendChild(filterButton);
      document.body.appendChild(rangeFilterContainer);

      filterButton.addEventListener('click', () => {
        if (filterButton.textContent === 'Filter') {
          const minRating = parseInt(minInput.value) || -16;
          const maxRating = parseInt(maxInput.value) || 16;

          const filteredPubs = data.features.filter(pub => {
            const rating = pub.properties.rating;
            return rating >= minRating && rating <= maxRating;
          });

          map.getSource('pubs').setData({
            type: 'FeatureCollection',
            features: filteredPubs
          });

          filterButton.textContent = 'Clear';
          filterButton.style.backgroundColor = 'black';
          filterButton.style.color = 'white';
        } else {
          map.getSource('pubs').setData(data);

          filterButton.textContent = 'Filter';
          filterButton.style.backgroundColor = 'white';
          filterButton.style.color = 'black';
        }
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
      }
    })
    .catch(error => {
      console.error('Error in geocoding place:', error);
    });
}

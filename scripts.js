// Initialize the markers array to keep track of all markers
let markers = [];  

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRkazV4bjBoYWEyanNkMGxyaWRjbHoifQ.znIKAp83G9yFVD7hqCm3LA';

// Initialize the Mapbox map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40], // Default map center
    zoom: 9
});

// Add map navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Function to geocode a pub name (convert name to coordinates)
function geocodePlace(name) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${mapboxgl.accessToken}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const coordinates = data.features[0].geometry.coordinates;
                const placeName = data.features[0].place_name;

                // Create a new marker and add it to the map
                const marker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`)) // Optional: Add a popup with the place name
                    .addTo(map);

                // Store the new marker in the markers array
                markers.push(marker);

                // Optionally, zoom into the new marker's location
                map.flyTo({ center: coordinates, zoom: 12 });
            } else {
                console.error("No results found for this place.");
            }
        })
        .catch(err => console.error('Error geocoding place:', err));
}

// Get the pub name from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const pubName = urlParams.get('pub_name');

// If a pub name is provided in the URL, call the geocode function
if (pubName) {
    geocodePlace(pubName);
}

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PubRater Map</title>

  <!-- Google Fonts Link for Pattaya -->
  <link href="https://fonts.googleapis.com/css2?family=Pattaya&display=swap" rel="stylesheet">

  <!-- Mapbox GL CSS -->
  <link href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css" rel="stylesheet" />

  <!-- Custom styles -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Title and Subtitle -->
  <h1>PubRater</h1> <!-- This is the title -->
  <h2>By Lucian Afford</h2> <!-- This is the subtitle -->

  <!-- Hot-to-Cold Slider -->
  <div id="slider-container">
    <div id="slider"></div>
    <div id="slider-labels">
      <span>-16</span>
      <span>0</span>
      <span>16</span>
    </div>
  </div>

  <!-- Map container -->
  <div id="map"></div>

  <!-- Mapbox GL JS -->
  <script src="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js"></script>

  <!-- Custom scripts -->
  <script>
    mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRnazV4bjBoYWEyanNkMGxyaWRjbHoifQ.znIKAp83G9yFVD7hqCm3LA';
    
    const map = new mapboxgl.Map({
      container: 'map', // The ID of the map container
      style: 'mapbox://styles/mapbox/dark-v11', // Default style
      center: [-0.1276, 51.5074], // London coordinates
      zoom: 10.5, // Adjust zoom level
    });

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
  </script>
</body>
</html>

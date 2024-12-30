mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRnZnRiMDBmYXYybHNneTNobDNoODEifQ.SIUur0MYADGFIENyXuVwRA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-0.1276, 51.5074],
  zoom: 10.5,
});

map.addControl(new mapboxgl.NavigationControl());

function normalizeRating(rating) {
  return Math.max(-16, Math.min(16, rating));
}

function fetchGeoJSON() {
  const geoJSONUrl = 'https://script.google.com/macros/s/AKfycbxw1siuCZUp0YnvNSVmRmFzbibuRVhk2JGr25H2CxFTfjvD5N1NgHFBLmqUXIl5C2slyg/exec';

  fetch(geoJSONUrl)
    .then(response => response.json())
    .then(data => {
      map.addSource('pubs', {
        type: 'geojson',
        data: data
      });

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

      map.on('click', 'pubs-layer', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var pubName = e.features[0].properties.pubName;
        var rating = e.features[0].properties.rating;

        var normalizedRating = normalizeRating(rating);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${pubName}</h3><p>Rating: ${normalizedRating}/16</p>`)
          .addTo(map);
      });

      const ratingDropdown = document.getElementById("rating-dropdown");
      const ratingList = document.getElementById("rating-list");

      ratingDropdown.addEventListener("click", () => {
        ratingList.style.display = ratingList.style.display === 'block' ? 'none' : 'block';
      });

      data.features.forEach(pub => {
        const ratingItem = document.createElement('div');
        ratingItem.className = 'rating-item';
        ratingItem.innerHTML = `
          <span>${pub.properties.pubName}</span>
          <span>Rating: ${normalizeRating(pub.properties.rating)}/16</span>
        `;
        ratingList.appendChild(ratingItem);
      });
    })
    .catch(error => {
      console.error('Error fetching GeoJSON data:', error);
    });
}

fetchGeoJSON();

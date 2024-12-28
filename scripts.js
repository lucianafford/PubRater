// Initialize map
mapboxgl.accessToken = 'your-access-token';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0], // Change to your desired center
    zoom: 2
});

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

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRnazV4bjBoYWEyanNkMGxyaWRjbHoifQ.znIKAp83G9yFVD7hqCm3LA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40], // Default center
    zoom: 9
});

map.addControl(new mapboxgl.NavigationControl());

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVnztbjhDg-8UvqZNyctAvq_xG-VzSMZ0",
    authDomain: "pubrater.firebaseapp.com",
    projectId: "pubrater",
    storageBucket: "pubrater.firebasestorage.app",
    messagingSenderId: "265005562249",
    appId: "1:265005562249:web:7d01614b4ca1db95570958",
    measurementId: "G-2W13TYS106"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to geocode a pub name (convert name to coordinates)
function geocodePlace(name) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${mapboxgl.accessToken}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const coordinates = data.features[0].geometry.coordinates;
                const placeName = data.features[0].place_name;

                // Update the map center and zoom level to the location of the pub
                map.setCenter(coordinates);
                map.setZoom(14);

                // Create a new marker and add it to the map
                const marker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`)) // Optional: Add a popup with the place name
                    .addTo(map);

                // Store the marker in Firestore
                storeMarker(placeName, coordinates, 5); // Example: Rating 5
            } else {
                console.error("No results found for this place.");
            }
        })
        .catch(err => console.error('Error geocoding place:', err));
}

// Store marker in Firestore
async function storeMarker(name, coordinates, rating) {
    try {
        const docRef = await addDoc(collection(db, "markers"), {
            name: name,
            coordinates: coordinates,
            rating: rating
        });
        console.log("Marker added with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Retrieve all markers from Firestore
async function retrieveMarkers() {
    const querySnapshot = await getDocs(collection(db, "markers"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const coordinates = data.coordinates;
        const rating = data.rating;
        const name = data.name;

        // Create a marker for each document in Firestore
        const marker = new mapboxgl.Marker()
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3><p>Rating: ${rating}</p>`))
            .addTo(map);
    });
}

// Get the pub name from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const pubName = urlParams.get('pub_name');

// If a pub name is provided in the URL, call the geocode function
if (pubName) {
    geocodePlace(pubName);
}

// Call the function to retrieve all markers when the page loads
retrieveMarkers();

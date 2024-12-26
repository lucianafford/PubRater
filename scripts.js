// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Your Firebase configuration
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

// Mapbox setup
mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWFuYWZmb3JzIiwiYSI6ImNtNTRnazV4bjBoYWEyanNkMGxyaWRjbHoifQ.znIKAp83G9yFVD7hqCm3LA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // Using a default style to ensure map loads
  center: [-0.1276, 51.5074], // London coordinates (Longitude, Latitude)
  zoom: 12, // Adjusted zoom level for better initial view
});
map.addControl(new mapboxgl.NavigationControl());

// Array to store markers
let markers = [];

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
        map.setZoom(14); // Adjust zoom level to get a better view of the location

        // Create a new marker and add it to the map
        const marker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`)) // Optional: Add a popup with the place name
          .addTo(map);

        // Store the marker in the markers array
        markers.push(marker);

        // Save the marker data to Firestore
        storeMarker(placeName, coordinates);
      } else {
        console.error("No results found for this place.");
      }
    })
    .catch(err => console.error('Error geocoding place:', err));
}

// Function to store marker in Firestore with rating
async function storeMarker(name, coordinates) {
  const rating = document.getElementById("rating").value;

  // Ensure that the rating is a valid number
  if (rating < 1 || rating > 16) {
    alert("Please enter a valid rating between 1 and 16.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "markers"), {
      name: name,
      coordinates: coordinates,
      rating: rating
    });
    console.log("Marker added with ID: ", docRef.id);
    alert("Rating submitted successfully!");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Function to retrieve all markers from Firestore
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
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3><p>Rating: ${rating} / 16</p>`))
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

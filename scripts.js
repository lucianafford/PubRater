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
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [-0.1276, 51.5074], 
    zoom: 12, 
});
map.addControl(new mapboxgl.NavigationControl());

// Function to load markers from Firestore
async function loadMarkersFromFirestore() {
  const markersCollection = collection(db, "markers");
  const querySnapshot = await getDocs(markersCollection);
  
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const coordinates = [data.coordinates.lng, data.coordinates.lat];
    const rating = data.rating;
    const name = data.name;

    // Create a marker for each document in Firestore
    const marker = new mapboxgl.Marker()
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3><p>Rating: ${rating}/16</p>`)) // Add rating to the popup
      .addTo(map);
  });
}

// Call the function to load markers when the page loads
loadMarkersFromFirestore();

// Example of storing a new pub with its rating in Firestore (this would be triggered by your app's logic)
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

// Example to store a predefined pub (you can remove this part later)
storeMarker("The Test Pub", [-0.1234, 51.5074], 7.5); // Adds a new pub marker with rating 7.5/16

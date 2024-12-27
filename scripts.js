body {
    font-family: 'Pattaya', sans-serif;
    background-color: #2c2c2c; /* Warm black background */
    color: #f5d3b5; /* Creamy orange-brown text */
    margin: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

h1 {
    color: #f5d3b5; /* Creamy orange-brown title */
    font-size: 2.5em; /* Adjust title size smaller */
    margin: 0;
    text-align: center; /* Center-align the title */
}

h2 {
    color: #f5d3b5; /* Creamy orange-brown subtitle */
    font-size: 1em;
    text-align: center; /* Center-align the subtitle */
    margin-top: 4px;
    line-height: 0.7;
}

#slider-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
}

#slider {
    width: 150px; /* Fixed small width */
    height: 20px;
    border-radius: 10px;
    background: linear-gradient(to right, blue, red);
    position: relative;
}

#slider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-image: repeating-linear-gradient(
        to right,
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0.5) 2px,
        transparent 2px,
        transparent 6px
    );
    border-radius: 10px;
}

#slider-labels {
    display: flex;
    justify-content: space-between;
    width: 150px; /* Fixed width */
    margin-top: 5px;
}

#slider-labels span {
    font-size: 0.9em;
}

#map {
    width: 100%;
    height: 600px; /* Increased height for the map */
    margin-top: 20px;
}

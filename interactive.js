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
      searchInput.style.position = 'static';
      searchInput.style.bottom = '20px'; // Place it just above the map
      searchInput.style.right = '54px'; // Place it to the right
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
      rangeFilterContainer.style.position = 'static';
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


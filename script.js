const rootElement = document.getElementById('root');
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
const showSelect = document.getElementById('showSelect'); // Added reference to the select element

let episodes = [];

// Fetch data from TVMaze API
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // Display error message to user
    rootElement.innerHTML = `<div>Error fetching data: ${error.message}</div>`;
    throw error; // Re-throw error for handling elsewhere if needed
  }
}

// Render episode cards
function renderEpisodes(episodes) {
  rootElement.innerHTML = '';
  episodes.forEach(episode => {
    const episodeCard = document.createElement('div');
    episodeCard.classList.add('episode-card');

    const episodeCode = `S${episode.season.toString().padStart(2, '0')}E${episode.number.toString().padStart(2, '0')}`;

    episodeCard.innerHTML = `
      <h3>${episode.name}</h3>
      <p>Episode Code: ${episodeCode}</p>
      <p>${episode.summary}</p>
      <img class="episode-image" src="${episode.image ? episode.image.medium : ''}" alt="${episode.name}">
      <p>Season: ${episode.season} | Episode: ${episode.number}</p>
      <p><a href="${episode.url}" target="_blank">View on TVMaze</a></p>
    `;

    rootElement.appendChild(episodeCard);
  });
}

// Perform search and update episode display
function performSearch(searchTerm) {
  const filteredEpisodes = episodes.filter(episode =>
    episode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderEpisodes(filteredEpisodes);
  searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${episodes.length} episodes`;
}

// Populate select element with shows
async function populateShows() {
  const shows = await fetchData('https://api.tvmaze.com/shows');
  // Sort shows alphabetically
  shows.sort((a, b) => a.name.localeCompare(b.name));
  // Populate select element
  shows.forEach(show => {
    const option = document.createElement('option');
    option.text = show.name;
    option.value = show.id;
    showSelect.add(option);
  });
}

// Initialize
async function initialize() {
  try {
    // Fetch shows and populate select element
    await populateShows();
    // Add event listener for show select change
    showSelect.addEventListener('change', async function () {
      const selectedShowId = this.value;
      const showEpisodes = await fetchData(`https://api.tvmaze.com/shows/${selectedShowId}/episodes`);
      episodes = showEpisodes;
      renderEpisodes(episodes);
    });
    // Fetch episodes for the default show
    const defaultShowId = showSelect.value; // Get the default selected show ID
    const defaultShowEpisodes = await fetchData(`https://api.tvmaze.com/shows/${defaultShowId}/episodes`);
    episodes = defaultShowEpisodes;
    renderEpisodes(episodes);
    // Add event listener for search input
    searchInput.addEventListener('input', function () {
      performSearch(this.value);
    });
  } catch (error) {
    // Display error message to user
    rootElement.innerHTML = `<div>Error initializing: ${error.message}</div>`;
  }
}

initialize();

// Cache for fetched data
const cache = {
  shows: null,
  episodes: {},
  firstFetch: false,
};

let fetchedEpisodes = null;

// Fetch shows data
function fetchShows() {
  if (cache.shows) {
    populateShowDropdown(cache.shows);
  } else {
    fetch("https://api.tvmaze.com/shows")
      .then((response) => response.json())
      .then((data) => {
        cache.shows = data;
        populateShowDropdown(cache.shows);
        displayAllShows(cache.shows);
      })
      .catch((error) => console.error("Error fetching shows:", error));
  }
}

function displayAllShows(shows) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  shows.map((show) => displayShows(show));
}

/// Displaying shows
function displayShows(show) {
  const root = document.getElementById("root");

  const showImg = document.createElement("img");
  showImg.src = show.image.medium ?? "";
  showImg.alt = show.name;

  const showName = document.createElement("h2");
  showName.innerHTML = "Show Name: " + show.name;

  const showSummary = document.createElement("p");
  showSummary.innerHTML = "Summary: " + show.summary;

  const cardShow = document.createElement("div");
  cardShow.className = "mainShowCard";

  const cardInfo = document.createElement("div");
  cardInfo.className = "cardInfo";

  const cardInfoInner = document.createElement("div");
  cardInfoInner.className = "cardInfoInner";

  const cardShowInfo = document.createElement("div");
  cardShowInfo.className = "mainShowCardInfo";

  const showStatus = document.createElement("p");
  showStatus.innerHTML = "Status: " + show.status;

  const showGenres = document.createElement("p");
  showGenres.innerHTML = "Genres: " + show.genres.join(", ");

  const showRating = document.createElement("p");
  showRating.innerHTML = "Average Rating: " + show.rating.average;

  const showRuntime = document.createElement("p");
  showRuntime.innerHTML = "Runtime: " + show.runtime;

  const castList = document.createElement("p");
  castList.innerHTML = "Cast: " + show._embedded.cast.map((actor) => actor.person.name).join(", ");

  cardShowInfo.append(showStatus, showGenres, showRating, showRuntime, castList);
  cardInfoInner.append(showSummary, cardShowInfo);
  cardInfo.append(showName, cardInfoInner);
  cardShow.append(showImg, cardInfo);

  root.append(cardShow);
}

// Populate show dropdown
function populateShowDropdown(shows) {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = "<option value='default'>All Shows</option>";

  shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

// Fetch episodes data
function fetchEpisodesData(showId) {
  if (cache.episodes[showId]) {
    displayEpisodes(cache.episodes[showId]);
    populateDropdown(cache.episodes[showId]);
  } else {
    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      .then((response) => response.json())
      .then((data) => {
        cache.episodes[showId] = data;
        fetchedEpisodes = data;
        displayEpisodes(cache.episodes[showId], showId);
        populateDropdown(data);
      })
      .catch((error) => console.error("Error fetching episodes:", error));
  }
}

// Generate episode code
function generateEpisodeCode(episode) {
  return `S${episode.season.toString().padStart(2, "0")}E${episode.number
    .toString()
    .padStart(2, "0")}`;
}

// Display episodes
function displayEpisodes(episodes, id) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  if (cache.shows && id) {
    let myShow = cache.shows.filter((show) => show.id == id);
    displayShows(...myShow);
  }
  episodes.forEach((episode) => {
    const template = document
      .getElementById("episode-template")
      .content.cloneNode(true);
    const episodeCode = generateEpisodeCode(episode);

    template.querySelector(
      ".episode-name"
    ).textContent = `${episode.name} - ${episodeCode}`;

    template.querySelector(".episode-image").src = episode.image
      ? episode.image.medium
      : "";
    template.querySelector(".episode-image").alt = episode.name;
    template.querySelector(".episode-summary").innerHTML = episode.summary;

    root.appendChild(template);
  });

  document.getElementById(
    "episode-count"
  ).textContent = `Total Episodes: ${episodes.length}`;
}

// Display page
function displayPage() {
  const root = document.getElementById("root");
  const searchContainer = document.createElement("div");
  searchContainer.id = "navbar";
  searchContainer.innerHTML = `
  <button id="back-to-all" style="display:none" >Back to Shows</button>
    <select id="show-select">
      <option value="default">All Shows</option>
    </select>
    <select id="episode-select" style="display:none">
      <option value="">Episodes</option>
    </select>
    <span id="episode-count" style="display:none"></span>
    <input type="text" id="search-input" style="display:none" placeholder="Search episodes...">
  `;
  document.body.insertBefore(searchContainer, root);

  displayEpisodes(fetchedEpisodes || []);

  // Add event listeners
  document
    .getElementById("search-input")
    .addEventListener("input", filterEpisodes);

  document.getElementById("search-input").addEventListener("focus", () => {
    document.getElementById("episode-select").value = "";
    displayEpisodes(fetchedEpisodes || []);
  });
  document.getElementById("show-select").addEventListener("change", (event) => {
    const dropdown = document.getElementById("episode-select");
    dropdown.value = "";
    document.getElementById("search-input").value = "";
    if (event.target.value === "default") {
      displayAllShows(cache.shows);
    } else {
      dropdown.setAttribute("placeholder", "Episodes");

      fetchEpisodesData(event.target.value || []);
      document.getElementById("show-select").style.display = "none";
      document.getElementById("back-to-all").style.display = "inline";
      document.getElementById("episode-select").style.display = "inline";
      document.getElementById("episode-count").style.display = "inline";
      document.getElementById("search-input").style.display = "inline";
    }
  });
  document.getElementById("episode-select").addEventListener("change", () => {
    const selectedValue = document.getElementById("episode-select").value;
    if (selectedValue === "") {
      displayEpisodes(fetchedEpisodes || []);
    } else {
      const selectedEpisode = fetchedEpisodes.find(
        (episode) => episode.id === parseInt(selectedValue)
      );
      displayEpisodes([selectedEpisode]);
    }
    document.getElementById("search-input").value = "";
  });
  document.getElementById("back-to-all").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("back-to-all").style.display = "none";
    document.getElementById("show-select").style.display = "inline";
    document.getElementById("show-select").value = "default";
    document.getElementById("episode-select").style.display = "none";
    document.getElementById("episode-count").style.display = "none";
    document.getElementById("search-input").style.display = "none";
    displayAllShows(cache.shows);
  });
}

// Populate episode dropdown
function populateDropdown(episodes) {
  const selectElement = document.getElementById("episode-select");
  selectElement.innerHTML = `<option value="">Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${generateEpisodeCode(episode)} - ${episode.name}`;
    selectElement.appendChild(option);
  });
}

// Filter episodes
function filterEpisodes() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const filteredEpisodes = fetchedEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
  );
  displayEpisodes(filteredEpisodes);
}

// Function to add footer
function addFooter() {
  const footer = document.querySelector("footer");
  const tvmazeLink = document.createElement("a");
  tvmazeLink.href = "https://www.tvmaze.com/";
  tvmazeLink.textContent = "TVMaze.com";
  tvmazeLink.target = "_blank";
  footer.appendChild(document.createTextNode("Data provided by "));
  footer.appendChild(tvmazeLink);
}

const initializePage = () => {
  addFooter();
  fetchShows();
  displayPage();
};

initializePage();

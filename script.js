//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Loop through each episode
  episodeList.forEach(episode => {
    // Create HTML elements for episode details
    const episodeDiv = document.createElement("div");
    const episodeCode = `S${episode.season.toString().padStart(2, '0')}E${episode.number.toString().padStart(2, '0')}`;
    episodeDiv.innerHTML = `
      <h2>${episode.name} (${episodeCode})</h2>
      <p>Season ${episode.season}, Episode ${episode.number}</p>
      <img src="${episode.image.medium}" alt="${episode.name}" />
      <p>${episode.summary}</p>
      <p>Source: <a href="${episode.url}"target="_blank">TVMaze.com</a></p>
`;
    rootElem.appendChild(episodeDiv);
  });

  // Display total number of episodes
  rootElem.insertAdjacentHTML("beforebegin", `<p>Got ${episodeList.length} episode(s)</p>`);
}

window.onload = setup;

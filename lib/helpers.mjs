// utility functions to
// help with formatting and parsing data

const pad = (number) => number.toString().padStart(2, "0");

const makeEpisodeCode = (season, episode) => `S${pad(season)}E${pad(episode)}`;
const makeEpisodeTitle = (name, season, episode) =>
  season && episode
    ? `${name} - ${makeEpisodeCode(season, episode)}`
    : `${name}`;

const parseFromAPI = (html) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

export {pad, makeEpisodeTitle, parseFromAPI};

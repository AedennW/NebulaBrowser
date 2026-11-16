const gameLibrary = [];
const gameLibraryElement = document.getElementById("gameLibrary");
const gameSearch = document.getElementById("gameSearch");
const gameCount = document.getElementById("gameCount");
const gameStage = document.getElementById("gameStage");
const gameTitle = document.getElementById("gameTitle");
const gameFrame = document.getElementById("gameFrame");
const openGameTab = document.getElementById("openGameTab");

const CATALOG_URLS = [
  "./games.json",
  "https://raw.githubusercontent.com/gn-math/assets/main/zones.json",
  "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json"
];
const GAME_HTML_BASE = "https://cdn.jsdelivr.net/gh/gn-math/html@main/";
const GAME_COVER_BASE = "https://cdn.jsdelivr.net/gh/gn-math/covers@main/";

// Exclude catalog entries that are not suitable for a general-audience game list.
const excludedGameName = /suggest games|comments|horror|scary|slender|five nights|freddy|backrooms|creepypasta|bloodmoney|blood money|fear & hunger|silent hill|resident evil|doom|wolfenstein|postal|hotline miami|ultrakill|half life|quake|metal gear|grand theft auto|sniper|shooter|shooting|gun|weapon|war\b|battle royale|zombie|nazi|robbery|assassin|killer|murder|combat|boxing|sword|roulette|blackjack|casino|gamble|plinko|dice|slot|adult|hentai|yandere|lobotomy|cruelty squad|people playground|happy wheels|scp:|lethal company|lethal ape|slendytubbies|madness combat|binding of isaac|godzilla|rio rex|bacon may die|stick war|archery|bazooka|cannon|tank|fortzone|pixel gun|ravenfield|time shooter|raft wars|evolving bombs|bomb|swords and sandals|gladi|archers|survivor.io|vampire survivors|plague inc|city defense|telekinesis attack|bowmasters|supreme duelist|ragdoll hit|ragdoll archers|johnny trigger|toss the turtle|attack hole|road of fury|1v1\.lol|solar smash|bank robbery|stickman fight|stickman duel|stickman destruction|stickman and guns|stickman kombat|stickman slasher|stickman hit|smash karts|brawl|clash of vikings|recoil|car survival|office fight|survive to victory|gunspin|weapon craft|weapon upgrade|weapon scale|build a big army|shipo\.io|territorial\.io|evoWars|state\.io|slither\.io|yohoho|agar\.io/i;

function getGenre(name) {
  const title = name.toLowerCase();
  if (/puzzle|2048|tetris|wordle|cut the rope|sort|match|bloxorz|minesweeper|suika|peg gle|pegge/.test(title)) return "Puzzle";
  if (/racing|race|racer|drift|moto|car|bike|track|rider|drive|slowroads|snow rider/.test(title)) return "Racing";
  if (/basket|football|soccer|fifa|baseball|volley|tennis|golf|bowling|pool|sports/.test(title)) return "Sports";
  if (/rhythm|dance|friday night funkin|osu|trombone|music|tunes|beat|vib-ribbon/.test(title)) return "Rhythm";
  if (/run|runner|jump|doodle jump|flappy|platform|vex|obby|climb|parkour|red ball|fancy pants/.test(title)) return "Platform";
  if (/minecraft|pokemon|sonic|mario|zelda|kirby|pac-man|pacman|metroid|final fantasy|ace attorney|emulator/.test(title)) return "Adventure";
  if (/idle|clicker|cookie|tycoon|simulator|simulation|farm|shop|business|money|capitalist/.test(title)) return "Simulation";
  return "Arcade";
}

function renderGameList(searchText = "") {
  const query = searchText.trim().toLowerCase();
  const filteredGames = gameLibrary.filter(game =>
    game.name.toLowerCase().includes(query) || game.genre.toLowerCase().includes(query)
  );
  gameCount.textContent = filteredGames.length + " of " + gameLibrary.length + " games";
  gameLibraryElement.replaceChildren();

  if (!filteredGames.length) {
    const empty = document.createElement("div");
    empty.className = "no-games";
    empty.textContent = "No games found. Try another search.";
    gameLibraryElement.appendChild(empty);
    return;
  }

  filteredGames.forEach(game => {
    const card = document.createElement("article");
    card.className = "library-game";

    const cover = document.createElement("img");
    cover.src = game.coverUrl;
    cover.alt = game.name + " cover";
    cover.loading = "lazy";
    cover.onerror = () => {
      cover.onerror = null;
      cover.src = "https://raw.githubusercontent.com/gn-math/covers/main/" + game.id + ".png";
    };

    const info = document.createElement("div");
    info.className = "library-game-info";
    const title = document.createElement("h3");
    title.textContent = game.name;
    const genre = document.createElement("span");
    genre.textContent = game.genre;
    info.append(title, genre);

    const play = document.createElement("button");
    play.type = "button";
    play.textContent = "Play ↗";
    play.addEventListener("click", () => launchGame(game));

    card.append(cover, info, play);
    gameLibraryElement.appendChild(card);
  });
}

async function launchGame(game) {
  const url = GAME_HTML_BASE + encodeURIComponent(game.file);
  gameTitle.textContent = game.name;
  gameStage.hidden = false;
  gameStage.scrollIntoView({ behavior: "smooth", block: "start" });
  gameFrame.srcdoc = '<!doctype html><html><body style="background:#090817;color:white;font:16px sans-serif;display:grid;place-items:center;height:100vh;margin:0">Loading game...</body></html>';
  openGameTab.href = url;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Game file returned HTTP " + response.status);
    let html = await response.text();
    if (!html.trim()) throw new Error("The game file was empty");

    const baseTag = '<base href="' + GAME_HTML_BASE + '">';
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, match => match + baseTag);
    } else {
      html = baseTag + html;
    }
    gameFrame.srcdoc = html;
  } catch (error) {
    gameFrame.srcdoc = '<!doctype html><html><body style="background:#090817;color:white;font:16px sans-serif;padding:24px"><h2>Could not load this game</h2><p>' +
      String(error.message || error).replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character])) +
      '</p><p>Try opening the game in a new tab.</p></body></html>';
  }
}

async function getCatalog() {
  let lastError;
  for (const url of CATALOG_URLS) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Catalog request failed: " + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected catalog format");
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not load the GN-Math catalog");
}

async function loadGameLibrary() {
  gameCount.textContent = "Loading catalog...";
  try {
    const zones = await getCatalog();
    const seenIds = new Set();

    zones.forEach(entry => {
      if (!Number.isInteger(entry.id) || entry.id < 0) return;
      if (typeof entry.name !== "string" || typeof entry.url !== "string") return;
      if (!entry.url.startsWith("{HTML_URL}/")) return;
      if (excludedGameName.test(entry.name)) return;
      if (seenIds.has(entry.id)) return;

      const file = entry.url.substring("{HTML_URL}/".length);
      if (!/^[a-zA-Z0-9._-]+\.html$/.test(file)) return;

      const coverPath = typeof entry.cover === "string" && entry.cover.startsWith("{COVER_URL}/")
        ? entry.cover.substring("{COVER_URL}/".length)
        : entry.id + ".png";

      seenIds.add(entry.id);
      gameLibrary.push({
        id: entry.id,
        name: entry.name,
        file,
        genre: getGenre(entry.name),
        coverUrl: GAME_COVER_BASE + encodeURIComponent(coverPath)
      });
    });

    gameLibrary.sort((a, b) => a.name.localeCompare(b.name));
    renderGameList(gameSearch.value);
    if (!gameLibrary.length) throw new Error("No compatible games were found in the catalog");
  } catch (error) {
    gameCount.textContent = "Catalog unavailable";
    gameLibraryElement.replaceChildren();
    const message = document.createElement("div");
    message.className = "no-games";
    message.textContent = "The game list could not load: " + (error && error.message ? error.message : "Unknown error") + ". Refresh the page to try again.";
    gameLibraryElement.appendChild(message);
  }
}

gameSearch.addEventListener("input", () => renderGameList(gameSearch.value));

document.getElementById("closeGame").addEventListener("click", () => {
  gameFrame.src = "about:blank";
  gameStage.hidden = true;
});

loadGameLibrary();

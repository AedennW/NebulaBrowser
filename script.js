const gameLibrary = [];
const gameLibraryElement = document.getElementById("gameLibrary");
const gameSearch = document.getElementById("gameSearch");
const gameCount = document.getElementById("gameCount");
const gameStage = document.getElementById("gameStage");
const gameTitle = document.getElementById("gameTitle");
const gameFrame = document.getElementById("gameFrame");
const openGameTab = document.getElementById("openGameTab");

const GAME_DATA_URL = "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json";
const GAME_HTML_BASE = "https://cdn.jsdelivr.net/gh/gn-math/html@main/";
const GAME_COVER_BASE = "https://cdn.jsdelivr.net/gh/gn-math/covers@main/";

// Keep non-game entries and clearly unsuitable categories out of the default library.
const excludedGameName = /suggest games|comments|horror|scary|slender|five nights|freddy|backrooms|creepypasta|bloodmoney|blood money|suicide|epstein|fear & hunger|silent hill|resident evil|doom|wolfenstein|postal|hotline miami|ultrakill|half life|quake|metal gear|grand theft auto|sniper|shooter|shooting|gun|weapon|war\b|battle royale|zombie|nazi|robbery|assassin|killer|murder|combat|boxing|sword|roulette|blackjack|casino|gamble|plinko|dice|slot|adult|hentai|yandere|lobotomy|cruelty squad|people playground|happy wheels|scp:|lethal company|lethal ape|slendytubbies|madness combat|binding of isaac|godzilla|rio rex|bacon may die|stick war|archery|bazooka|cannon|tank|fortzone|pixel gun|ravenfield|time shooter|raft wars|evolving bombs|bomb|swords and sandals|gladi|archers|survivor.io|vampire survivors|plague inc|city defense|telekinesis attack|bowmasters|supreme duelist|ragdoll hit|ragdoll archers|johnny trigger|toss the turtle|attack hole|road of fury|1v1\.lol|solar smash|bank robbery|stickman fight|stickman duel|stickman destruction|stickman and guns|stickman kombat|stickman slasher|stickman hit|smash karts|brawl|clash of vikings|recoil|car survival|office fight|survive to victory|gunspin|weapon craft|weapon upgrade|weapon scale|build a big army|shipo\.io|territorial\.io|evoWars|state\.io|slither\.io|yohoho|agar\.io/i;

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

function getGameUrl(game) {
  return GAME_HTML_BASE + game.file;
}

function renderGameList(searchText = "") {
  const query = searchText.trim().toLowerCase();
  const filteredGames = gameLibrary.filter(game =>
    game.name.toLowerCase().includes(query) || game.genre.toLowerCase().includes(query)
  );

  gameCount.textContent = filteredGames.length + " of " + gameLibrary.length + " games";
  gameLibraryElement.innerHTML = "";

  if (filteredGames.length === 0) {
    gameLibraryElement.innerHTML = '<div class="no-games">No games found. Try another search.</div>';
    return;
  }

  filteredGames.forEach(game => {
    const card = document.createElement("article");
    card.className = "library-game";

    const cover = document.createElement("img");
    cover.src = GAME_COVER_BASE + game.id + ".png";
    cover.alt = game.name + " cover";
    cover.loading = "lazy";
    cover.onerror = () => {
      cover.removeAttribute("src");
      cover.alt = "Cover unavailable";
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

function launchGame(game) {
  const url = getGameUrl(game);
  gameTitle.textContent = game.name;
  gameFrame.src = url;
  openGameTab.href = url;
  gameStage.hidden = false;
  gameStage.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadGameLibrary() {
  gameCount.textContent = "Loading the GN-Math catalog...";
  gameLibraryElement.innerHTML = '<div class="no-games">Loading games...</div>';

  try {
    const response = await fetch(GAME_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load the game catalog.");

    const zones = await response.json();
    const seenIds = new Set();

    zones.forEach(entry => {
      if (!Number.isInteger(entry.id) || entry.id < 0) return;
      if (typeof entry.name !== "string" || typeof entry.url !== "string") return;
      if (!entry.url.startsWith("{HTML_URL}/")) return;
      if (excludedGameName.test(entry.name)) return;
      if (seenIds.has(entry.id)) return;

      const file = entry.url.slice("{HTML_URL}/".length);
      if (!/^[a-zA-Z0-9._-]+\.html$/.test(file)) return;

      seenIds.add(entry.id);
      gameLibrary.push({
        id: entry.id,
        name: entry.name,
        file,
        genre: getGenre(entry.name)
      });
    });

    gameLibrary.sort((a, b) => a.name.localeCompare(b.name));
    renderGameList(gameSearch.value);
  } catch (error) {
    gameCount.textContent = "Catalog unavailable";
    gameLibraryElement.innerHTML = '<div class="no-games">The GN-Math catalog could not load. Refresh the page to try again.</div>';
  }
}

gameSearch.addEventListener("input", () => renderGameList(gameSearch.value));

document.getElementById("closeGame").addEventListener("click", () => {
  gameFrame.src = "about:blank";
  gameStage.hidden = true;
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("soft-glow");
});

loadGameLibrary();

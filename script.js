const gameLibrary = [];
const gameLibraryElement = document.getElementById("gameLibrary");
const gameSearch = document.getElementById("gameSearch");
const gameCount = document.getElementById("gameCount");
const gameStage = document.getElementById("gameStage");
const gameTitle = document.getElementById("gameTitle");
const gameFrame = document.getElementById("gameFrame");
const openGameTab = document.getElementById("openGameTab");
const fullScreenGame = document.getElementById("fullScreenGame");
const focusGameKeyboard = document.getElementById("focusGameKeyboard");
const gameFrameWrap = document.querySelector(".game-frame-wrap");
const gameLoadStatus = document.getElementById("gameLoadStatus");
let currentGameUrl = "";
let gameLoadTimer = null;
let gameLoadSession = 0;

const CATALOG_URLS = [
  "./games.json",
  "https://raw.githubusercontent.com/gn-math/assets/main/zones.json"
];
const GAME_COVER_BASE = "https://raw.githubusercontent.com/gn-math/covers/main/";

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

function getGameUrl(game) {
  const url = new URL("./game-loader.html", window.location.href);
  url.searchParams.set("file", game.file);
  return url.href;
}

function launchGame(game) {
  gameTitle.textContent = game.name;
  gameStage.hidden = false;
  gameStage.scrollIntoView({ behavior: "smooth", block: "start" });

  gameLoadSession += 1;
  const session = gameLoadSession;
  if (gameLoadTimer) clearTimeout(gameLoadTimer);

  currentGameUrl = getGameUrl(game);
  openGameTab.disabled = false;
  openGameTab.textContent = "Open in new tab ↗";
  gameLoadStatus.textContent = "Opening game. Click inside it or use Keyboard controls to activate WASD and arrow keys.";

  gameFrame.onload = () => {
    if (session !== gameLoadSession) return;
    gameLoadStatus.textContent = "Game frame opened. Use Keyboard controls if WASD or arrow keys do not respond.";
  };

  // Some Unity games download large data and WebAssembly files after the page opens.
  // Do not interrupt them; show a useful fallback hint if initialization takes a while.
  gameLoadTimer = setTimeout(() => {
    if (session !== gameLoadSession) return;
    gameLoadStatus.textContent = "Still loading? This game may be downloading large files. You can also test it in a new tab.";
  }, 45000);

  gameFrame.src = currentGameUrl;
}

async function getCatalog() {
  if (Array.isArray(window.GN_MATH_CATALOG)) return window.GN_MATH_CATALOG;
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
        coverUrl: GAME_COVER_BASE + coverPath.split("/").map(encodeURIComponent).join("/")
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



const fontWeirdness = document.getElementById("fontWeirdness");
const fontWeirdnessValue = document.getElementById("fontWeirdnessValue");
function updateFontWeirdness(value) {
  const amount = Number(value);
  const spacing = (amount * 0.025).toFixed(2) + "px";
  const shadowAlpha = (amount * 0.0016).toFixed(3);
  const shadow = amount === 0 ? "none" : "0 0 1px rgba(112,76,190," + shadowAlpha + ")";
  const displayFont = amount < 25 ? '"Plus Jakarta Sans", sans-serif' : amount < 50 ? '"Trebuchet MS", sans-serif' : amount < 75 ? "monospace" : '"Courier New", monospace';
  document.documentElement.style.setProperty("--type-spacing", spacing);
  document.documentElement.style.setProperty("--type-shadow", shadow);
  document.documentElement.style.setProperty("--type-font", displayFont);
  document.documentElement.style.setProperty("--type-italic", amount >= 65 ? "italic" : "normal");
  fontWeirdnessValue.textContent = amount + "%";
  fontWeirdness.setAttribute("aria-valuetext", amount + " percent weirdness");
}
fontWeirdness.addEventListener("input", () => updateFontWeirdness(fontWeirdness.value));
updateFontWeirdness(fontWeirdness.value);

gameSearch.addEventListener("input", () => renderGameList(gameSearch.value));

openGameTab.addEventListener("click", () => {
  if (!currentGameUrl) return;
  // Open the original hosted HTML page so it keeps its real browser origin and assets.
  const newTab = window.open(currentGameUrl, "_blank");
  if (!newTab) {
    alert("Your browser blocked the new tab. Allow pop-ups for this site and try again.");
    return;
  }
  newTab.opener = null;
});

function focusGameControls() {
  try {
    gameFrame.focus({ preventScroll: true });
    const gameWindow = gameFrame.contentWindow;
    if (gameWindow) gameWindow.focus();

    const gameDocument = gameFrame.contentDocument;
    if (gameDocument) {
      const target = gameDocument.querySelector("#unity-canvas, canvas, [tabindex]");
      if (target) {
        target.focus({ preventScroll: true });
      } else if (gameDocument.body) {
        gameDocument.body.tabIndex = -1;
        gameDocument.body.focus({ preventScroll: true });
      }
    }
    gameLoadStatus.textContent = "Keyboard focus sent to the game. Try WASD or the arrow keys. Some games also require one click on the game area.";
  } catch (error) {
    gameLoadStatus.textContent = "Click directly inside the game area to activate its keyboard controls.";
  }
}

focusGameKeyboard.addEventListener("click", focusGameControls);

fullScreenGame.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (gameFrameWrap.requestFullscreen) {
      await gameFrameWrap.requestFullscreen();
    } else {
      alert("Fullscreen is not supported by this browser.");
    }
  } catch (error) {
    console.error("Fullscreen request failed:", error);
  }
});

document.getElementById("closeGame").addEventListener("click", async () => {
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  if (gameLoadTimer) clearTimeout(gameLoadTimer);
  gameLoadSession += 1;
  currentGameUrl = "";
  gameFrame.src = "about:blank";
  gameLoadStatus.textContent = "";
  gameStage.hidden = true;
});

loadGameLibrary();

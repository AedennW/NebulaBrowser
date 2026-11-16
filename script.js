const gameLibrary = [{"name":"OvO","file":"1-fix2.html","id":1,"genre":"Platform"},{"name":"OvO 2","file":"2-fix3.html","id":2,"genre":"Platform"},{"name":"OvO 3 Dimensions","file":"3-fix3.html","id":3,"genre":"Platform"},{"name":"Ice Dodo","file":"5-fix2.html","id":5,"genre":"Racing"},{"name":"Block Blast","file":"6-fix3.html","id":6,"genre":"Puzzle"},{"name":"Temple Run 2","file":"10-fix2.html","id":10,"genre":"Runner"},{"name":"Stickman Hook","file":"11-fix2.html","id":11,"genre":"Platform"},{"name":"Bridge Race","file":"14-fix2.html","id":14,"genre":"Arcade"},{"name":"Color Water Sort 3D","file":"15-fix2.html","id":15,"genre":"Puzzle"},{"name":"Magic Tiles 3","file":"17-fix2.html","id":17,"genre":"Rhythm"},{"name":"Stacky Dash","file":"18-fix2.html","id":18,"genre":"Puzzle"},{"name":"Pou","file":"23-fix2.html","id":23,"genre":"Casual"},{"name":"Crossy Road","file":"24-fix2.html","id":24,"genre":"Arcade"},{"name":"Amaze","file":"26-fix2.html","id":26,"genre":"Puzzle"},{"name":"Geometry Dash Lite","file":"27-fix2.html","id":27,"genre":"Rhythm"},{"name":"Basketball FRVR","file":"28-fix2.html","id":28,"genre":"Sports"},{"name":"Bottle Jump 3D","file":"30-fix2.html","id":30,"genre":"Skill"},{"name":"Color Match","file":"31-fix2.html","id":31,"genre":"Puzzle"},{"name":"Retro Bowl","file":"33-fix2.html","id":33,"genre":"Sports"},{"name":"Retro Bowl College","file":"34-fix2.html","id":34,"genre":"Sports"},{"name":"Monster Tracks","file":"36-fix3.html","id":36,"genre":"Racing"},{"name":"Gobble","file":"37-fix3.html","id":37,"genre":"Arcade"},{"name":"Vex","file":"45-fix2.html","id":45,"genre":"Platform"},{"name":"Vex 2","file":"46-fix2.html","id":46,"genre":"Platform"},{"name":"Vex 3","file":"47-fix2.html","id":47,"genre":"Platform"},{"name":"Vex 4","file":"49-fix2.html","id":49,"genre":"Platform"},{"name":"Vex 5","file":"50-fix2.html","id":50,"genre":"Platform"},{"name":"Vex 6","file":"51-fix2.html","id":51,"genre":"Platform"},{"name":"Vex 7","file":"52-fix2.html","id":52,"genre":"Platform"},{"name":"Vex 8","file":"53-fix2.html","id":53,"genre":"Platform"},{"name":"A Dance of Fire and Ice","file":"59-fix2.html","id":59,"genre":"Rhythm"},{"name":"Achievement Unlocked","file":"60-fix.html","id":60,"genre":"Platform"},{"name":"Achievement Unlocked 2","file":"61-fix.html","id":61,"genre":"Platform"},{"name":"Achievement Unlocked 3","file":"62-fix.html","id":62,"genre":"Platform"},{"name":"Big Tower Tiny Square","file":"67-fix2.html","id":67,"genre":"Platform"},{"name":"Big NEON Tower Tiny Square","file":"68-fix2.html","id":68,"genre":"Platform"},{"name":"Big ICE Tower Tiny Square","file":"69-fix.html","id":69,"genre":"Platform"},{"name":"Cut the Rope","file":"85-fix2.html","id":85,"genre":"Puzzle"},{"name":"2048","file":"114-fix2.html","id":114,"genre":"Puzzle"},{"name":"Run 3","file":"177-fix.html","id":177,"genre":"Runner"},{"name":"Tetris","file":"733-fix2.html","id":733,"genre":"Puzzle"}];
const gameLibraryElement = document.getElementById("gameLibrary");
const gameSearch = document.getElementById("gameSearch");
const gameCount = document.getElementById("gameCount");
const gameStage = document.getElementById("gameStage");
const gameTitle = document.getElementById("gameTitle");
const gameFrame = document.getElementById("gameFrame");
const openGameTab = document.getElementById("openGameTab");

function getGameUrl(game) {
  return "https://cdn.jsdelivr.net/gh/gn-math/html@main/" + game.file;
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
    cover.src = "https://cdn.jsdelivr.net/gh/gn-math/covers@main/" + game.id + ".png";
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

gameSearch.addEventListener("input", () => renderGameList(gameSearch.value));

document.getElementById("closeGame").addEventListener("click", () => {
  gameFrame.src = "about:blank";
  gameStage.hidden = true;
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("soft-glow");
});

renderGameList();

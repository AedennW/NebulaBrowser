const destinationInput = document.getElementById("destinationInput");
const launchButton = document.getElementById("launchButton");
const gameStage = document.getElementById("gameStage");
const gameTitle = document.getElementById("gameTitle");
const gameContent = document.getElementById("gameContent");

function launchDestination() {
  const raw = destinationInput.value.trim();
  if (!raw) {
    destinationInput.focus();
    return;
  }

  let destination;
  if (/^https?:\/\//i.test(raw)) {
    destination = raw;
  } else if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(raw)) {
    destination = "https://" + raw;
  } else {
    destination = "https://www.google.com/search?q=" + encodeURIComponent(raw);
  }

  try {
    const parsed = new URL(destination);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Only web addresses are supported.");
    }
    window.open(parsed.href, "_blank", "noopener,noreferrer");
  } catch {
    destinationInput.setCustomValidity("Enter a valid website or search phrase.");
    destinationInput.reportValidity();
    destinationInput.setCustomValidity("");
  }
}

launchButton.addEventListener("click", launchDestination);
destinationInput.addEventListener("keydown", event => {
  if (event.key === "Enter") launchDestination();
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("soft-glow");
});

document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => openGame(button.dataset.game));
});

document.getElementById("closeGame").addEventListener("click", () => {
  gameStage.hidden = true;
  gameContent.innerHTML = "";
});

function openGame(name) {
  gameStage.hidden = false;
  gameStage.scrollIntoView({ behavior: "smooth", block: "center" });

  if (name === "memory") startMemory();
  if (name === "tic") startTicTacToe();
  if (name === "math") startMath();
}

function startMemory() {
  gameTitle.textContent = "Cosmic Pairs";
  const symbols = ["✦", "☾", "✧", "☼", "◇", "♢", "✺", "☆"];
  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let first = null;
  let locked = false;
  let matches = 0;
  let moves = 0;

  gameContent.innerHTML = '<p>Match all eight pairs. Find them in as few moves as you can.</p><p id="memoryScore">Moves: 0 · Matches: 0/8</p><div class="memory-board" id="memoryBoard"></div><button class="game-action" id="memoryRestart">Restart</button>';
  const board = document.getElementById("memoryBoard");
  const score = document.getElementById("memoryScore");

  cards.forEach(symbol => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.type = "button";
    card.textContent = "?";
    card.setAttribute("aria-label", "Hidden card");
    card.addEventListener("click", () => {
      if (locked || card.classList.contains("matched") || card === first) return;
      card.textContent = symbol;
      card.classList.add("flipped");
      card.setAttribute("aria-label", symbol);
      if (!first) {
        first = card;
        return;
      }
      moves++;
      if (first.textContent === card.textContent) {
        first.classList.add("matched");
        card.classList.add("matched");
        first = null;
        matches++;
        score.textContent = "Moves: " + moves + " · Matches: " + matches + "/8";
        if (matches === 8) score.textContent += " · All pairs found!";
      } else {
        locked = true;
        const previous = first;
        first = null;
        score.textContent = "Moves: " + moves + " · Matches: " + matches + "/8";
        setTimeout(() => {
          previous.textContent = "?";
          card.textContent = "?";
          previous.classList.remove("flipped");
          card.classList.remove("flipped");
          previous.setAttribute("aria-label", "Hidden card");
          card.setAttribute("aria-label", "Hidden card");
          locked = false;
        }, 700);
      }
    });
    board.appendChild(card);
  });
  document.getElementById("memoryRestart").addEventListener("click", startMemory);
}

function startTicTacToe() {
  gameTitle.textContent = "Orbit Tic-Tac-Toe";
  let cells = Array(9).fill("");
  let turn = "X";
  let finished = false;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  gameContent.innerHTML = '<p>Take turns placing X and O. Get three in a row to win.</p><p class="game-feedback" id="ticStatus">X goes first.</p><div class="tic-board" id="ticBoard"></div><button class="game-action" id="ticRestart">New round</button>';
  const board = document.getElementById("ticBoard");
  const status = document.getElementById("ticStatus");

  function draw() {
    board.innerHTML = "";
    cells.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "tic-cell";
      cell.type = "button";
      cell.textContent = value;
      cell.setAttribute("aria-label", "Square " + (index + 1) + (value ? ": " + value : ""));
      cell.addEventListener("click", () => {
        if (finished || cells[index]) return;
        cells[index] = turn;
        const winner = wins.some(line => line.every(position => cells[position] === turn));
        if (winner) {
          status.textContent = turn + " wins this round!";
          finished = true;
        } else if (cells.every(Boolean)) {
          status.textContent = "It's a tie!";
          finished = true;
        } else {
          turn = turn === "X" ? "O" : "X";
          status.textContent = turn + "'s turn.";
        }
        draw();
      });
      board.appendChild(cell);
    });
  }
  draw();
  document.getElementById("ticRestart").addEventListener("click", startTicTacToe);
}

function startMath() {
  gameTitle.textContent = "Stellar Math";
  let score = 0;
  let question = 0;
  gameContent.innerHTML = '<p>Answer ten quick questions. Choose the correct result.</p><h2 id="mathQuestion"></h2><p id="mathScore">Score: 0 / 10</p><div class="math-answer" id="mathAnswers"></div><p class="game-feedback" id="mathFeedback" aria-live="polite"></p>';
  nextQuestion();

  function nextQuestion() {
    if (question >= 10) {
      document.getElementById("mathQuestion").textContent = "Mission complete!";
      document.getElementById("mathAnswers").innerHTML = '<button class="game-action" id="mathAgain">Play again</button>';
      document.getElementById("mathFeedback").textContent = "Final score: " + score + " / 10";
      document.getElementById("mathAgain").addEventListener("click", startMath);
      return;
    }
    question++;
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const answer = a + b;
    document.getElementById("mathQuestion").textContent = a + " + " + b + " = ?";
    document.getElementById("mathScore").textContent = "Question " + question + " / 10 · Score: " + score;
    document.getElementById("mathFeedback").textContent = "";
    const choices = new Set([answer]);
    while (choices.size < 4) choices.add(Math.max(0, answer + Math.floor(Math.random() * 11) - 5));
    const options = [...choices].sort(() => Math.random() - 0.5);
    const answers = document.getElementById("mathAnswers");
    answers.innerHTML = "";
    options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => {
        answers.querySelectorAll("button").forEach(item => item.disabled = true);
        if (option === answer) {
          score++;
          document.getElementById("mathFeedback").textContent = "Correct! Nice work.";
        } else {
          document.getElementById("mathFeedback").textContent = "Good try! The answer was " + answer + ".";
        }
        document.getElementById("mathScore").textContent = "Question " + question + " / 10 · Score: " + score;
        const next = document.createElement("button");
        next.className = "game-action";
        next.textContent = question === 10 ? "See results" : "Next question";
        next.addEventListener("click", nextQuestion);
        answers.appendChild(next);
      });
      answers.appendChild(button);
    });
  }
}

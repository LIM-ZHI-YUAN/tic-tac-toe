const STATE = {
  NOT_STARTED: "not_started",
  PLAYING: "playing",
  WON: "won",
  DRAW: "draw",
};

function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  // create 2d array
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const dropToken = (row, column, player) => {
    // check user input
    if (row < 0 || row >= rows || column < 0 || column >= columns) {
      return false;
    }

    // check if the cell is filled already
    if (board[row][column].getValue() != null) {
      return false;
    }
    board[row][column].addToken(player);

    return true;
  };

  const printBoard = () => {
    // print out the result each round for console output
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return {
    getBoard,
    dropToken,
    printBoard,
  };
}

function Cell() {
  let value = null;

  const addToken = (player) => {
    value = player;
  };

  const getValue = () => value;

  return {
    addToken,
    getValue,
  };
}

function GameController(
  playerOneName = "Player 1",
  playerTwoName = "Player 2"
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: "X",
    },
    {
      name: playerTwoName,
      token: "O",
    },
  ];

  let currentGameState = STATE.NOT_STARTED;
  let winner;

  const getGameState = () => currentGameState;

  const setGameState = (state) => {
    currentGameState = state;
  };

  const getWinner = () => winner;

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const setPlayerName = (playerOneName, playerTwoName) => {
    players[0].name = playerOneName;
    players[1].name = playerTwoName;
  };

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playRound = (row, column) => {

    const dropSucess = board.dropToken(row, column, getActivePlayer().token);

    if (!dropSucess) {
      console.log("Invalid move! Try again.");
      return;
    }

    if (checkWin(3, row, column, getActivePlayer().token)) {
      board.printBoard();
      console.log(`Winner is ${getActivePlayer().name}!`);
      winner = getActivePlayer().name;
      currentGameState = STATE.WON;
      return;
    } else if (checkDraw()) {
      board.printBoard();
      console.log("It's a draw!");
      currentGameState = STATE.DRAW;
      return;
    }

    switchPlayerTurn();
    printNewRound();
  };

  const checkWin = (connectN, row, col, piece) => {
    const gameBoard = board.getBoard();
    const rows = 3;
    const columns = 3;

    // check horizontal
    let count = 0;
    for (let c = 0; c < columns; c++) {
      if (gameBoard[row][c].getValue() === piece) {
        count++;
        if (count === connectN) return true;
      } else {
        count = 0;
      }
    }

    // Check vertical
    count = 0;
    for (let r = 0; r < rows; r++) {
      if (gameBoard[r][col].getValue() === piece) {
        count++;
        if (count === connectN) return true;
      } else {
        count = 0;
      }
    }

    // Check diagonal
    count = 0;
    for (let r = 0; r < rows; r++) {
      let c = row + col - r;
      if (c >= 0 && c < columns && gameBoard[r][c].getValue() === piece) {
        count++;
        if (count === connectN) return true;
      } else {
        count = 0;
      }
    }

    // Check anti-diagonal
    count = 0;
    for (let r = 0; r < rows; r++) {
      let c = col - row + r;
      if (c >= 0 && c < columns && gameBoard[r][c].getValue() === piece) {
        count++;
        if (count === connectN) return true;
      } else {
        count = 0;
      }
    }

    return false;
  };

  // Reset the game state
  const resetGame = () => {
    board
      .getBoard()
      .forEach((row) => row.forEach((cell) => cell.addToken(null)));
    currentGameState = STATE.NOT_STARTED;
    winner = null;
    activePlayer = players[0];
  };

  const checkDraw = () => {
    const gameBoard = board.getBoard();
    return gameBoard.every(row => row.every(cell => cell.getValue() !== null));
  }

  // Intitial play game message
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getGameState,
    getWinner,
    setPlayerName,
    setGameState,
    resetGame,
  };
}

function ScreenController() {
  let game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const winnerDiv = document.querySelector(".winner");
  const playNameForm = document.getElementById("playForm");
  const resetButton = document.getElementById("reset");
  const instructionDiv = document.querySelector(".instruction");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const winner = game.getWinner();

    // Render board squares
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        // Anything clickable should be a button!!
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        // Create a data attribute to identify the column
        // This makes it easier to pass into our `playRound` function
        cellButton.dataset.cell = `${rowIndex}${colIndex}`;
        cellButton.textContent = cell.getValue();

        if (cellButton.textContent === "X") {
          cellButton.style.color = "red";
        } else if (cellButton.textContent === "O") {
          cellButton.style.color = "blue";
        }
        boardDiv.appendChild(cellButton);
      });
    });

    // Hide the instruction div if game is started
    if (game.getGameState() !== STATE.NOT_STARTED) {
      instructionDiv.style.display = "none";
      // Display player's turn
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    } else {
      instructionDiv.style.display = "block";
      playerTurnDiv.textContent = ""
    }

    // Display winner
    if (game.getGameState() === STATE.WON) {
      winnerDiv.textContent = `Winner is ${winner}`;
      playerTurnDiv.textContent = "";
    } else if (game.getGameState() === STATE.DRAW) {
      winnerDiv.textContent = "It's a draw!";
      playerTurnDiv.textContent = "";
    }

  };

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedCell = e.target.dataset.cell;
    // Make sure I've clicked a column and not the gaps in between OR game is not in playing state
    if (!selectedCell || game.getGameState() !== STATE.PLAYING) return;
    let [row, col] = selectedCell.split("").map(ele => parseInt(ele));

    game.playRound(row, col);
    updateScreen();
  }

  function clickHandlerPlayerName(e) {
    e.preventDefault();
    const playerOne = document.getElementById("player1").value;
    const playerTwo = document.getElementById("player2").value;

    // game.setPlayerName(playerOne, playerTwo); // This doesn't create a new game, just updates names
    game = GameController(playerOne, playerTwo); // this instantiate a new game with the player names
    game.setGameState(STATE.PLAYING);

    e.target.reset();
    updateScreen();
  }

  function clickHandlerResetGame() {
    game.resetGame();
    winnerDiv.textContent = "";
    game.setPlayerName("Player 1", "Player 2");
    playNameForm.reset();
    updateScreen();
  }

  boardDiv.addEventListener("click", clickHandlerBoard);
  playNameForm.addEventListener("submit", clickHandlerPlayerName);
  resetButton.addEventListener("click", clickHandlerResetGame);

  updateScreen();
}

ScreenController();

import React, { useState } from "react";
import "./App.css";

/**
 * TicTacToeBoard - Game board component for Tic Tac Toe
 * @param {Object} props - size, board array, onCellClick, gameOver, winningLine, accentColor
 */
// PUBLIC_INTERFACE
function TicTacToeBoard({
  board,
  onCellClick,
  gameOver,
  winningLine,
  accentColor,
}) {
  // 3x3 board
  return (
    <div className="ttt-board-wrap">
      <div className="ttt-board">
        {board.map((cell, i) => {
          let highlight = winningLine && winningLine.includes(i);
          return (
            <button
              key={i}
              className="ttt-cell"
              style={{
                color: cell === "X" ? "var(--primary)" : cell === "O" ? "var(--secondary)" : "",
                borderColor: highlight ? accentColor : "var(--ttt-board-border)",
                background: highlight ? "rgba(67,160,71, 0.06)" : "var(--ttt-cell-bg)",
                cursor: cell || gameOver ? "default" : "pointer",
              }}
              disabled={!!cell || gameOver}
              onClick={() => onCellClick(i)}
              aria-label={"Cell " + (i + 1)}
            >
              {cell}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Header component for the app
 */
// PUBLIC_INTERFACE
function Header() {
  return (
    <header className="ttt-header">
      <h1>Tic Tac Toe</h1>
    </header>
  );
}

/**
 * ScoreBoard for both players
 */
// PUBLIC_INTERFACE
function ScoreBoard({ scores, mode }) {
  return (
    <div className="ttt-scoreboard">
      <div className="ttt-scorebox">
        <span className="ttt-player-x">X</span>
        <div>{mode === "single" ? "You" : "Player 1"}</div>
        <div className="ttt-score">{scores.X}</div>
      </div>
      <div className="ttt-scorebox">
        <span className="ttt-player-o">O</span>
        <div>{mode === "single" ? "AI" : "Player 2"}</div>
        <div className="ttt-score">{scores.O}</div>
      </div>
      <div className="ttt-scorebox">
        <span className="ttt-tie">🤝</span>
        <div>Ties</div>
        <div className="ttt-score">{scores.T}</div>
      </div>
    </div>
  );
}

const EMPTY_BOARD = Array(9).fill("");

/**
 * Utility to determine winner
 */
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    )
      return { winner: board[a], line };
  }
  if (board.every((cell) => !!cell)) return { winner: "T", line: null };
  return null;
}

/**
 * Simple AI for single-player mode
 */
function aiMove(board) {
  // Try winning move, then block X, else random
  let available = board
    .map((v, i) => (v === "" ? i : null))
    .filter((i) => i !== null);

  for (let i of available) {
    let testBoard = board.slice();
    testBoard[i] = "O";
    if (checkWinner(testBoard)?.winner === "O") return i;
  }
  for (let i of available) {
    let testBoard = board.slice();
    testBoard[i] = "X";
    if (checkWinner(testBoard)?.winner === "X") return i;
  }
  // Prefer center, else random
  if (available.includes(4)) return 4;
  let corners = available.filter(i => [0,2,6,8].includes(i));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Controls below the board (mode, reset, new game)
 */
// PUBLIC_INTERFACE
function Controls({ mode, setMode, onReset, gameOver, onNewGame }) {
  return (
    <div className="ttt-controls">
      <div className="ttt-modes">
        <button
          className={`ttt-mode-btn${mode === "single" ? " active" : ""}`}
          type="button"
          onClick={() => setMode("single")}
          aria-label="Single player mode"
        >
          Single (vs AI)
        </button>
        <button
          className={`ttt-mode-btn${mode === "multi" ? " active" : ""}`}
          type="button"
          onClick={() => setMode("multi")}
          aria-label="Two player mode"
        >
          Two Player
        </button>
      </div>
      <button onClick={onReset} className="ttt-btn ttt-btn-reset" aria-label="Restart Game">
        {gameOver ? "New Game" : "Restart"}
      </button>
      {gameOver && (
        <button onClick={onNewGame} className="ttt-btn ttt-btn-next" aria-label="Play Again">
          Next Round
        </button>
      )}
    </div>
  );
}

/**
 * Main App component implementing game state
 */
// PUBLIC_INTERFACE
function App() {
  const [board, setBoard] = useState([...EMPTY_BOARD]);
  const [xIsNext, setXisNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, T: 0 });
  const [mode, setMode] = useState("single"); // "single" or "multi"
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [winningLine, setWinningLine] = useState(null);
  const [accentColor] = useState("#43a047");

  // Handle move
  const handleCellClick = (i) => {
    if (gameOver || board[i] !== "") return;
    const turn = xIsNext ? "X" : "O";
    let newBoard = board.slice();
    newBoard[i] = turn;
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setXisNext((prev) => !prev);
      setMessage(
        mode === "single"
          ? xIsNext
            ? ""
            : ""
          : !xIsNext
          ? "Player 1 (X)'s turn"
          : "Player 2 (O)'s turn"
      );
      if (mode === "single" && !xIsNext) {
        setTimeout(() => {
          doAiMove(newBoard);
        }, 420);
      }
    }
  };

  // Run AI move
  const doAiMove = (currentBoard) => {
    // Only play if game not over
    if (checkWinner(currentBoard) || gameOver) return;
    let move = aiMove(currentBoard);
    if (move === undefined) return;
    let newBoard = currentBoard.slice();
    newBoard[move] = "O";
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
    } else {
      setXisNext(true);
    }
  };

  // Handle game end
  const endGame = (result) => {
    setGameOver(true);
    if (result.winner === "T") {
      setMessage("It's a tie!");
      setScores((prev) => ({ ...prev, T: prev.T + 1 }));
      setWinningLine(null);
    } else {
      setMessage(
        mode === "single"
          ? result.winner === "X"
            ? "You win! 🎉"
            : "AI wins!"
          : result.winner === "X"
          ? "Player 1 wins! 🎉"
          : "Player 2 wins!"
      );
      setScores((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
      setWinningLine(result.line);
    }
  };

  // New game, keeping scores
  const handleNewGame = () => {
    setBoard([...EMPTY_BOARD]);
    setXisNext(true);
    setGameOver(false);
    setMessage("");
    setWinningLine(null);
    if (mode === "single") {
      // If AI starts, let AI go
    }
  };

  // Reset everything (scores too)
  const handleReset = () => {
    setBoard([...EMPTY_BOARD]);
    setXisNext(true);
    setScores({ X: 0, O: 0, T: 0 });
    setGameOver(false);
    setMessage("");
    setWinningLine(null);
  };

  // Switch mode (resets board and scores)
  const handleSetMode = (newMode) => {
    setMode(newMode);
    setBoard([...EMPTY_BOARD]);
    setXisNext(true);
    setScores({ X: 0, O: 0, T: 0 });
    setGameOver(false);
    setMessage("");
    setWinningLine(null);
  };

  // Simple minimal header, board, controls
  return (
    <div className="ttt-app-bg">
      <div className="ttt-app-main">
        <Header />
        <ScoreBoard scores={scores} mode={mode} />
        <TicTacToeBoard
          board={board}
          onCellClick={handleCellClick}
          gameOver={gameOver}
          winningLine={winningLine}
          accentColor={accentColor}
        />
        <div className="ttt-info">
          <span>
            {message ||
              (mode === "single"
                ? xIsNext
                  ? "Your turn (X)"
                  : "AI's turn (O)"
                : xIsNext
                ? "Player 1 (X) turn"
                : "Player 2 (O) turn")}
          </span>
          {gameOver && (
            <div className="ttt-gameover-msg" style={{ color: accentColor }}>
              {message}
            </div>
          )}
        </div>
        <Controls
          mode={mode}
          setMode={handleSetMode}
          onReset={handleReset}
          gameOver={gameOver}
          onNewGame={handleNewGame}
        />
      </div>
      <footer className="ttt-footer">
        <span>
          <a
            href="https://github.com/kavia-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="ttt-footer-link"
          >
            © 2024 Kavia Demo
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type CellValue = TetrominoType | null;
type Position = { x: number; y: number };
type Tetromino = {
  type: TetrominoType;
  shape: number[][];
  position: Position;
};

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_SPEED = 1000;
const SPEED_DECREASE_PER_LEVEL = 0.1;

// Tetromino shapes (rotation states)
const SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  O: [
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
};

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Scoring
const LINE_SCORES = [0, 100, 300, 500, 800];

export default function TetrisPage() {
  const [board, setBoard] = useState<CellValue[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random tetromino type
  const getRandomType = useCallback((): TetrominoType => {
    return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  }, []);

  // Create new tetromino
  const createTetromino = useCallback((type: TetrominoType): Tetromino => {
    return {
      type,
      shape: SHAPES[type][0],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    };
  }, []);

  // Check if position is valid
  const isValidPosition = useCallback((piece: Tetromino, shape: number[][], pos: Position): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  // Lock piece to board
  const lockPiece = useCallback((piece: Tetromino) => {
    const newBoard = board.map(row => [...row]);
    
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type;
          }
        }
      });
    });

    // Check for complete lines
    let linesComplete = 0;
    const filteredBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesComplete++;
        return false;
      }
      return true;
    });

    // Add empty rows at top
    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    setBoard(filteredBoard);

    if (linesComplete > 0) {
      setLinesCleared(prev => prev + linesComplete);
      setScore(prev => prev + LINE_SCORES[linesComplete] * level);
      setLevel(Math.floor((linesCleared + linesComplete) / 10) + 1);
    }
  }, [board, level, linesCleared]);

  // Spawn new piece
  const spawnNewPiece = useCallback(() => {
    const type = nextPiece || getRandomType();
    const newPiece = createTetromino(type);
    
    if (!isValidPosition(newPiece, newPiece.shape, newPiece.position)) {
      setGameStatus('gameover');
      return;
    }
    
    setCurrentPiece(newPiece);
    setRotationIndex(0);
    setNextPiece(getRandomType());
  }, [nextPiece, getRandomType, createTetromino, isValidPosition]);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!currentPiece) return false;
    
    const newPosition = {
      x: currentPiece.position.x + dx,
      y: currentPiece.position.y + dy,
    };
    
    if (isValidPosition(currentPiece, currentPiece.shape, newPosition)) {
      setCurrentPiece({ ...currentPiece, position: newPosition });
      return true;
    }
    
    return false;
  }, [currentPiece, isValidPosition]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const shapes = SHAPES[currentPiece.type];
    const nextRotation = (rotationIndex + 1) % shapes.length;
    const newShape = shapes[nextRotation];
    
    // Try rotation with wall kicks
    const kicks = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
    ];
    
    for (const kick of kicks) {
      const newPosition = {
        x: currentPiece.position.x + kick.x,
        y: currentPiece.position.y + kick.y,
      };
      
      if (isValidPosition(currentPiece, newShape, newPosition)) {
        setCurrentPiece({
          ...currentPiece,
          shape: newShape,
          position: newPosition,
        });
        setRotationIndex(nextRotation);
        return;
      }
    }
  }, [currentPiece, rotationIndex, isValidPosition]);

  // Drop piece one row
  const dropPiece = useCallback(() => {
    if (!currentPiece) return;
    
    if (!movePiece(0, 1)) {
      lockPiece(currentPiece);
      spawnNewPiece();
    }
  }, [currentPiece, movePiece, lockPiece, spawnNewPiece]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece) return;
    
    let dropDistance = 0;
    while (movePiece(0, 1)) {
      dropDistance++;
    }
    
    if (currentPiece) {
      lockPiece(currentPiece);
      spawnNewPiece();
    }
  }, [currentPiece, movePiece, lockPiece, spawnNewPiece]);

  // Start new game
  const startGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setRotationIndex(0);
    setNextPiece(getRandomType());
    setGameStatus('playing');
    
    const firstPiece = createTetromino(getRandomType());
    setCurrentPiece(firstPiece);
  }, [getRandomType, createTetromino]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  }, [gameStatus]);

  // Keyboard controls
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          dropPiece();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, movePiece, dropPiece, rotatePiece, hardDrop, togglePause]);

  // Game loop
  useEffect(() => {
    if (gameStatus === 'playing') {
      const speed = INITIAL_DROP_SPEED * Math.pow(1 - SPEED_DECREASE_PER_LEVEL, level - 1);
      dropIntervalRef.current = setInterval(dropPiece, speed);
    }
    
    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameStatus, level, dropPiece]);

  // Render board with current piece
  const renderBoard = useCallback(() => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.type;
            }
          }
        });
      });
    }
    
    return displayBoard;
  }, [board, currentPiece]);

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    const shape = SHAPES[nextPiece][0];
    const previewBoard = Array(4).fill(null).map(() => Array(4).fill(null));
    
    const offsetY = nextPiece === 'I' ? 1 : 0;
    const offsetX = nextPiece === 'O' ? 1 : nextPiece === 'I' ? 0 : 0;
    
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && y + offsetY < 4 && x + offsetX < 4) {
          previewBoard[y + offsetY][x + offsetX] = nextPiece;
        }
      });
    });
    
    return previewBoard;
  };

  const displayBoard = renderBoard();
  const nextPieceBoard = renderNextPiece();

  return (
    <main className="container">
      <div className="mb-5">
        <h1 className="heading">Tetris</h1>
        <p className="mt-2 muted">
          Classic Tetris game. Use arrow keys to move, up arrow or W to rotate, space for hard drop, and P to pause.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Game area */}
        <section className="card">
          {gameStatus === 'idle' && (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
              <button onClick={startGame} className="btn btn-primary">
                Start Game
              </button>
            </div>
          )}

          {gameStatus === 'gameover' && (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-lg mb-4 muted">Final Score: {score}</p>
              <button onClick={startGame} className="btn btn-primary">
                Play Again
              </button>
            </div>
          )}

          {(gameStatus === 'playing' || gameStatus === 'paused') && (
            <div className="flex flex-col items-center">
              {/* Game controls */}
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={togglePause} 
                  className="btn btn-neutral"
                  aria-label={gameStatus === 'paused' ? 'Resume' : 'Pause'}
                >
                  {gameStatus === 'paused' ? '▶ Resume' : '⏸ Pause'}
                </button>
                <button onClick={startGame} className="btn btn-danger">
                  🔄 Restart
                </button>
              </div>

              {/* Game board */}
              <div className="relative mb-4">
                {gameStatus === 'paused' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10 rounded">
                    <div className="text-3xl font-bold">PAUSED</div>
                  </div>
                )}
                
                <div className="tetris-board">
                  {displayBoard.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((cell, x) => (
                        <div
                          key={`${y}-${x}`}
                          className={`tetris-cell ${cell ? `tetris-${cell.toLowerCase()}` : 'tetris-empty'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile controls */}
              <div className="flex flex-wrap gap-2 justify-center md:hidden">
                <button
                  onClick={() => movePiece(-1, 0)}
                  className="btn btn-neutral px-6"
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  onClick={() => movePiece(1, 0)}
                  className="btn btn-neutral px-6"
                  aria-label="Move right"
                >
                  →
                </button>
                <button
                  onClick={rotatePiece}
                  className="btn btn-neutral px-6"
                  aria-label="Rotate"
                >
                  ↻
                </button>
                <button
                  onClick={dropPiece}
                  className="btn btn-neutral px-6"
                  aria-label="Soft drop"
                >
                  ↓
                </button>
                <button
                  onClick={hardDrop}
                  className="btn btn-neutral px-6"
                  aria-label="Hard drop"
                >
                  ⇊
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Info panel */}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <aside className="space-y-4">
            {/* Score */}
            <div className="card">
              <h3 className="font-semibold mb-3">Score</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="muted">Points:</span>
                  <span className="font-mono font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="muted">Level:</span>
                  <span className="font-mono font-bold">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="muted">Lines:</span>
                  <span className="font-mono font-bold">{linesCleared}</span>
                </div>
              </div>
            </div>

            {/* Next piece */}
            {nextPieceBoard && (
              <div className="card">
                <h3 className="font-semibold mb-3">Next</h3>
                <div className="flex justify-center">
                  <div className="tetris-preview">
                    {nextPieceBoard.map((row, y) => (
                      <div key={y} className="flex">
                        {row.map((cell, x) => (
                          <div
                            key={`${y}-${x}`}
                            className={`tetris-cell-small ${cell ? `tetris-${cell.toLowerCase()}` : 'tetris-empty'}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Controls help */}
            <div className="card">
              <h3 className="font-semibold mb-3">Controls</h3>
              <div className="space-y-1 text-sm muted">
                <div className="flex justify-between">
                  <span>Move:</span>
                  <span className="font-mono">← →</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotate:</span>
                  <span className="font-mono">↑ / W</span>
                </div>
                <div className="flex justify-between">
                  <span>Soft drop:</span>
                  <span className="font-mono">↓</span>
                </div>
                <div className="flex justify-between">
                  <span>Hard drop:</span>
                  <span className="font-mono">Space</span>
                </div>
                <div className="flex justify-between">
                  <span>Pause:</span>
                  <span className="font-mono">P</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

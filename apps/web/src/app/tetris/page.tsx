'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WinBar, AscFrame, SecH } from '@/components/kit';

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
      setScore(prev => prev + dropDistance * 2);
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
    <main className="page-wrap">
      <div style={{ marginBottom: 24 }}>
        <SecH level={1} style={{ marginBottom: 6 }}>tetris</SecH>
        <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
          ← → move &nbsp;·&nbsp; ↑ / W rotate &nbsp;·&nbsp; space hard-drop &nbsp;·&nbsp; P pause
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        {/* Board */}
        <div style={{ border: '1px solid var(--rule-2)' }}>
          <WinBar
            title="tetris.exe"
            right={
              gameStatus === 'playing' || gameStatus === 'paused' ? (
                <div className="flex gap-2">
                  <button onClick={togglePause} className="btn ghost" style={{ fontSize: 11, padding: '2px 8px' }}>
                    {gameStatus === 'paused' ? '▶ resume' : '⏸ pause'}
                  </button>
                  <button onClick={startGame} className="btn danger" style={{ fontSize: 11, padding: '2px 8px' }}>
                    restart
                  </button>
                </div>
              ) : null
            }
          />

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {gameStatus === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0' }}>
                <div aria-label="tetris" style={{ lineHeight: 1 }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 42,
                    fontWeight: 700,
                    color: 'var(--olive)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}>
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>[</span>
                    {' tetris '}
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>]</span>
                  </span>
                </div>
                <button onClick={startGame} className="btn primary">
                  [ start game ]
                </button>
              </div>
            )}

            {gameStatus === 'gameover' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' }}>
                <p style={{ fontFamily: 'var(--mono)', color: 'var(--rust)', fontSize: 18, fontWeight: 700 }}>
                  game over
                </p>
                <p style={{ fontFamily: 'var(--mono)', color: 'var(--ink-2)', fontSize: 13 }}>
                  score: {score}
                </p>
                <button onClick={startGame} className="btn primary">
                  [ play again ]
                </button>
              </div>
            )}

            {(gameStatus === 'playing' || gameStatus === 'paused') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {gameStatus === 'paused' && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(29,27,24,0.75)', backdropFilter: 'blur(2px)',
                    }}>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--mustard)', fontSize: 22, fontWeight: 700 }}>
                        [ paused ]
                      </span>
                    </div>
                  )}
                  <div className="tetris-board">
                    {displayBoard.map((row, y) => (
                      <div key={y} className="tetris-row">
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
                <div className="flex flex-wrap gap-2 justify-center md:hidden" style={{ marginTop: 12 }}>
                  {[
                    { label: '←', action: () => movePiece(-1, 0), a11y: 'move left' },
                    { label: '→', action: () => movePiece(1, 0),  a11y: 'move right' },
                    { label: '↻', action: rotatePiece,            a11y: 'rotate' },
                    { label: '↓', action: dropPiece,              a11y: 'soft drop' },
                    { label: '⇊', action: hardDrop,               a11y: 'hard drop' },
                  ].map(({ label, action, a11y }) => (
                    <button key={a11y} onClick={action} className="btn ghost" aria-label={a11y}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {(gameStatus === 'playing' || gameStatus === 'paused') && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AscFrame title="score">
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 2.2 }}>
                {[
                  ['pts',   String(score)],
                  ['lvl',   String(level)],
                  ['lines', String(linesCleared)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </AscFrame>

            {nextPieceBoard && (
              <AscFrame title="next">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="tetris-preview">
                    {nextPieceBoard.map((row, y) => (
                      <div key={y} className="tetris-row">
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
              </AscFrame>
            )}

            <AscFrame title="controls">
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 2, color: 'var(--ink-2)' }}>
                {[
                  ['move',      '← →'],
                  ['rotate',    '↑ / W'],
                  ['soft drop', '↓'],
                  ['hard drop', 'space'],
                  ['pause',     'P'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </AscFrame>
          </aside>
        )}
      </div>
    </main>
  );
}

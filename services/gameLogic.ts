
import { Player, BoardState, Move } from '../types';

export const BOARD_SIZE = 8;

export const createInitialBoard = (): BoardState => {
  const board: BoardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Player.NONE));
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = Player.WHITE;
  board[mid][mid] = Player.WHITE;
  board[mid - 1][mid] = Player.BLACK;
  board[mid][mid - 1] = Player.BLACK;
  return board;
};

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// 오델로 위치별 가중치 테이블 (가장 고전적이고 효율적인 알고리즘)
const POSITION_WEIGHTS = [
  [100, -20, 10,  5,  5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [ 10,  -2,  5,  1,  1,  5,  -2,  10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10,  5,  5, 10, -20, 100]
];

export const isValidMove = (board: BoardState, row: number, col: number, player: Player): boolean => {
  if (board[row][col] !== Player.NONE) return false;

  const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    let foundOpponent = false;

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      r += dr;
      c += dc;
      foundOpponent = true;
    }

    if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      return true;
    }
  }

  return false;
};

export const getValidMoves = (board: BoardState, player: Player): Move[] => {
  const moves: Move[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, player)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
};

export const makeMove = (board: BoardState, row: number, col: number, player: Player): BoardState => {
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = player;

  const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK;

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const toFlip: Move[] = [];

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && newBoard[r][c] === opponent) {
      toFlip.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (toFlip.length > 0 && r >= 0 && r < BOARD_SIZE && newBoard[r][c] === player) {
      for (const move of toFlip) {
        newBoard[move.row][move.col] = player;
      }
    }
  }

  return newBoard;
};

export const calculateScores = (board: BoardState): { [key in Player]: number } => {
  let black = 0;
  let white = 0;
  let none = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === Player.BLACK) black++;
      else if (board[r][c] === Player.WHITE) white++;
      else none++;
    }
  }
  return { 
    [Player.BLACK]: black, 
    [Player.WHITE]: white,
    [Player.NONE]: none 
  };
};

export const getBasicAIMove = (board: BoardState, player: Player): Move | null => {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;

  // 가중치 테이블 기반의 즉각적인 의사결정
  let bestScore = -Infinity;
  let bestMove = validMoves[0];

  for (const move of validMoves) {
    const score = POSITION_WEIGHTS[move.row][move.col];
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

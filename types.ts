
export enum Player {
  NONE = 0,
  BLACK = 1,
  WHITE = 2
}

export type BoardState = Player[][];

export interface Move {
  row: number;
  col: number;
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  isGameOver: boolean;
  winner: Player | 'TIE' | null;
  history: BoardState[];
  scores: { [key in Player]: number };
}

export enum GameMode {
  PVP = 'PVP',
  AI_EASY = 'AI_EASY',
  AI_GEMINI = 'AI_GEMINI'
}

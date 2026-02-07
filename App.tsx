
import React, { useState, useEffect, useCallback } from 'react';
import { Player, BoardState, Move, GameMode } from './types';
import { 
  createInitialBoard, 
  getValidMoves, 
  makeMove, 
  calculateScores, 
  BOARD_SIZE,
  getBasicAIMove 
} from './services/gameLogic';
import { getGeminiMove } from './services/geminiService';
import Cell from './components/Cell';
import ScoreBoard from './components/ScoreBoard';

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.BLACK);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.AI_EASY);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | 'TIE' | null>(null);
  const [history, setHistory] = useState<BoardState[]>([]);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const scores = calculateScores(board);
  const validMoves = getValidMoves(board, currentPlayer);

  const handleNewGame = () => {
    if (window.confirm('새 게임을 시작하시겠습니까?')) {
      setBoard(createInitialBoard());
      setCurrentPlayer(Player.BLACK);
      setIsGameOver(false);
      setWinner(null);
      setHistory([]);
      setIsAiThinking(false);
    }
  };

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (isGameOver || isAiThinking) return;
    if (gameMode !== GameMode.PVP && currentPlayer !== Player.BLACK) return;

    if (validMoves.some(m => m.row === row && m.col === col)) {
      const newBoard = makeMove(board, row, col, currentPlayer);
      processNextTurn(newBoard, currentPlayer);
    }
  }, [board, currentPlayer, isGameOver, validMoves, isAiThinking, gameMode]);

  const processNextTurn = useCallback((newBoard: BoardState, lastPlayer: Player) => {
    const nextPlayer = lastPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;
    const nextValidMoves = getValidMoves(newBoard, nextPlayer);
    
    setBoard(newBoard);
    setHistory(prev => [...prev, newBoard]);

    if (nextValidMoves.length > 0) {
      setCurrentPlayer(nextPlayer);
    } else {
      const prevPlayerCanMove = getValidMoves(newBoard, lastPlayer);
      if (prevPlayerCanMove.length > 0) {
        setCurrentPlayer(lastPlayer);
      } else {
        const finalScores = calculateScores(newBoard);
        setIsGameOver(true);
        if (finalScores[Player.BLACK] > finalScores[Player.WHITE]) setWinner(Player.BLACK);
        else if (finalScores[Player.WHITE] > finalScores[Player.BLACK]) setWinner(Player.WHITE);
        else setWinner('TIE');
      }
    }
  }, []);

  useEffect(() => {
    if (!isGameOver && gameMode !== GameMode.PVP && currentPlayer === Player.WHITE && !isAiThinking) {
      const performAiMove = async () => {
        setIsAiThinking(true);
        const delay = gameMode === GameMode.AI_GEMINI ? 1000 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));

        let move: Move | null = null;
        if (gameMode === GameMode.AI_GEMINI) {
          move = await getGeminiMove(board, Player.WHITE);
        } else {
          move = getBasicAIMove(board, Player.WHITE);
        }

        if (move) {
          const newBoard = makeMove(board, move.row, move.col, Player.WHITE);
          processNextTurn(newBoard, Player.WHITE);
        }
        setIsAiThinking(false);
      };
      performAiMove();
    }
  }, [currentPlayer, isGameOver, gameMode, board, isAiThinking, processNextTurn]);

  const handleUndo = () => {
    if (history.length === 0 || isAiThinking) return;
    
    if (gameMode !== GameMode.PVP && history.length >= 2) {
      const newHistory = history.slice(0, -2);
      setHistory(newHistory);
      setBoard(newHistory.length > 0 ? newHistory[newHistory.length - 1] : createInitialBoard());
      setCurrentPlayer(Player.BLACK);
    } else if (history.length >= 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setBoard(newHistory.length > 0 ? newHistory[newHistory.length - 1] : createInitialBoard());
      setCurrentPlayer(currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK);
    }
    setIsGameOver(false);
    setWinner(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: '오델로 그랜드마스터',
      text: '나랑 오델로 한판 어때? 세련된 그래픽과 강력한 AI가 기다리고 있어!',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
      } catch (err) {}
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-4 pt-6 pb-12 font-['Noto_Sans_KR']">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          오델로 그랜드마스터
        </h1>
        <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-widest mt-1">심플하고 강력한 모바일 전략 대결</p>
      </header>

      {/* Main Container - Mobile First Vertical Layout */}
      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        
        {/* Top: ScoreBoard */}
        <div className="w-full">
          <ScoreBoard scores={scores} currentPlayer={currentPlayer} isGameOver={isGameOver} />
        </div>

        {/* Center: Board Container */}
        <div className="w-full flex flex-col items-center">
          <div className="relative p-1 md:p-2 bg-emerald-900/30 rounded-2xl border-4 border-emerald-950 shadow-2xl w-full aspect-square max-w-[450px]">
            {/* Grid Coordinates (A-H) */}
            <div className="flex w-full px-4 mb-1">
              {['A','B','C','D','E','F','G','H'].map(l => (
                <div key={l} className="flex-1 text-center text-[10px] text-emerald-600/60 font-bold">{l}</div>
              ))}
            </div>
            
            <div className="flex w-full h-[calc(100%-1.5rem)]">
              {/* Grid Coordinates (1-8) */}
              <div className="flex flex-col h-full mr-1 justify-around">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <div key={n} className="text-[10px] text-emerald-600/60 font-bold w-3">{n}</div>
                ))}
              </div>

              {/* The Actual Game Board */}
              <div 
                className="flex-1 grid grid-cols-8 grid-rows-8 bg-emerald-800 rounded-lg shadow-inner overflow-hidden border-2 border-emerald-950"
              >
                {board.map((row, rIdx) => 
                  row.map((cell, cIdx) => (
                    <Cell 
                      key={`${rIdx}-${cIdx}`}
                      row={rIdx}
                      col={cIdx}
                      value={cell}
                      isValid={validMoves.some(m => m.row === rIdx && m.col === cIdx)}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Thinking Overlay */}
            {isAiThinking && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none transition-all z-10">
                <div className="bg-slate-900/90 px-4 py-2 rounded-full flex items-center gap-3 border border-emerald-500/40 shadow-2xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  <span className="text-xs font-bold text-white tracking-widest uppercase">AI 대국 중...</span>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl z-20 animate-in zoom-in duration-300">
                <div className="text-center p-6">
                  <h2 className="text-4xl font-black text-white mb-2 leading-tight">
                    {winner === 'TIE' ? "무승부!" : winner === Player.BLACK ? "BLACK 승리!" : "WHITE 승리!"}
                  </h2>
                  <div className="flex justify-center gap-4 text-slate-300 font-bold text-xl mb-6">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 uppercase">BLACK</span>
                      <span>{scores[Player.BLACK]}</span>
                    </div>
                    <div className="self-center text-slate-700">:</div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 uppercase">WHITE</span>
                      <span>{scores[Player.WHITE]}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleNewGame}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-3 rounded-full shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    다시 하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Settings & Controls (Mobile Friendly Layout) */}
        <div className="w-full grid grid-cols-1 gap-4">
          {/* Opponent Selection & Share */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-cog"></i> 게임 설정
                </h3>
                <div className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-900/30 rounded-full">
                  {history.length}수 진행
                </div>
             </div>
            
            <div className="flex gap-2">
              <select 
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as GameMode)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none"
              >
                <option value={GameMode.AI_EASY}>단순 AI (매우 빠름)</option>
                <option value={GameMode.AI_GEMINI}>Gemini AI (심층 전략)</option>
                <option value={GameMode.PVP}>로컬 2인 대전</option>
              </select>
              
              <button 
                onClick={handleShare}
                className={`px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${showCopyFeedback ? 'bg-emerald-600' : 'bg-blue-600'}`}
              >
                <i className={`fas ${showCopyFeedback ? 'fa-check' : 'fa-share-alt'} text-white`}></i>
                {showCopyFeedback && <div className="absolute inset-0 bg-emerald-400/30 animate-pulse"></div>}
              </button>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={handleUndo}
              disabled={history.length === 0 || isAiThinking || isGameOver}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <i className="fas fa-undo"></i> 무르기
            </button>
            <button 
              onClick={handleNewGame}
              className="flex-1 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <i className="fas fa-redo"></i> 새 대국
            </button>
          </div>

          {/* Collapsible History for Mobile */}
          <details className="bg-slate-800/40 rounded-2xl border border-slate-700 overflow-hidden">
            <summary className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer list-none flex justify-between items-center">
              <span><i className="fas fa-history mr-2"></i> 대국 기록</span>
              <i className="fas fa-chevron-down opacity-50"></i>
            </summary>
            <div className="px-4 pb-4 max-h-[150px] overflow-y-auto custom-scrollbar space-y-2">
              {history.length === 0 ? (
                <p className="text-slate-600 text-[10px] text-center py-4 italic">기록이 없습니다.</p>
              ) : (
                history.map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-[10px]">
                    <span className="text-slate-500 font-mono">#{idx + 1}</span>
                    <span className={`font-bold ${idx % 2 === 0 ? 'text-white' : 'text-slate-400'}`}>
                      {idx % 2 === 0 ? 'BLACK의 수' : 'WHITE의 수'}
                    </span>
                    <span className="text-emerald-500"><i className="fas fa-check-circle"></i></span>
                  </div>
                )).reverse()
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-slate-700 text-[9px] uppercase tracking-[0.2em] text-center">
        &copy; 2024 Othello Grandmaster &bull; Mobile Optimized
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
};

export default App;

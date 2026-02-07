
import React from 'react';
import { Player } from '../types';

interface ScoreBoardProps {
  scores: { [key in Player]: number };
  currentPlayer: Player;
  isGameOver: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, currentPlayer, isGameOver }) => {
  return (
    <div className="flex justify-between items-center w-full bg-slate-800/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
      {/* Black Player */}
      <div className={`flex items-center gap-3 transition-all duration-500 z-10 px-3 py-1 rounded-xl ${currentPlayer === Player.BLACK && !isGameOver ? 'bg-slate-700/50 ring-1 ring-emerald-500/50' : 'opacity-60'}`}>
        <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-700 shadow-lg flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-950 to-zinc-700" />
        </div>
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">BLACK</p>
          <p className="text-xl font-black text-white">{scores[Player.BLACK]}</p>
        </div>
      </div>

      {/* Turn Indicator Dot */}
      <div className="flex flex-col items-center">
        {!isGameOver ? (
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${currentPlayer === Player.BLACK ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-slate-700'}`} />
            <div className="text-[10px] font-black text-slate-600 mx-1">VS</div>
            <div className={`w-1.5 h-1.5 rounded-full ${currentPlayer === Player.WHITE ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-slate-700'}`} />
          </div>
        ) : (
          <div className="text-emerald-400 font-black text-[10px] uppercase tracking-widest animate-pulse">FINISH</div>
        )}
      </div>

      {/* White Player */}
      <div className={`flex items-center gap-3 transition-all duration-500 z-10 px-3 py-1 rounded-xl ${currentPlayer === Player.WHITE && !isGameOver ? 'bg-slate-700/50 ring-1 ring-emerald-500/50' : 'opacity-60'}`}>
        <div className="flex flex-col items-end">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">WHITE</p>
          <p className="text-xl font-black text-white">{scores[Player.WHITE]}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-300 shadow-lg flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-white" />
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;

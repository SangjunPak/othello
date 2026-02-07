
import React from 'react';
import { Player } from '../types';

interface CellProps {
  value: Player;
  isValid: boolean;
  row: number;
  col: number;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, isValid, onClick }) => {
  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center cursor-pointer 
        ${isValid ? 'hover:bg-emerald-600/30' : ''} 
        transition-colors duration-200 border border-emerald-900/50`}
      onClick={onClick}
    >
      {/* Background hint for valid moves */}
      {isValid && value === Player.NONE && (
        <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
      )}

      {/* The Piece */}
      {value !== Player.NONE && (
        <div className={`
          w-4/5 h-4/5 rounded-full shadow-lg transform transition-all duration-500
          ${value === Player.BLACK ? 'bg-zinc-900 shadow-zinc-950' : 'bg-slate-50 shadow-slate-400'}
          ${value === Player.BLACK ? 'rotate-0' : 'rotate-y-180'}
        `}>
          <div className="w-full h-full rounded-full opacity-30 bg-gradient-to-tr from-transparent to-white/30" />
        </div>
      )}
    </div>
  );
};

export default Cell;

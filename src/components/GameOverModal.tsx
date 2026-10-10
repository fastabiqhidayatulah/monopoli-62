import React, { useEffect } from 'react';
import { Player } from '../types/game';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Home } from 'lucide-react';

interface GameOverModalProps {
  winner: Player | null;
  players: Player[];
  isOpen: boolean;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  players,
  isOpen,
  onPlayAgain,
  onReturnToLobby,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playGongWin();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  const sortedPlayers = [...players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-400 w-full max-w-md overflow-hidden text-center p-6 space-y-5">
        <div className="inline-flex p-4 bg-amber-100 rounded-full text-amber-600 shadow-inner">
          <Trophy className="w-12 h-12 animate-bounce" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            SULTAN NUSANTARA TERPILIH!
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{winner.name} Menang!</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Berhasil menguasai aset perekonomian dan bertahan dari segala krisis warga +62!
          </p>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1">
          <span className="text-xs font-semibold text-slate-600">Total Kekayaan Bersih Pemenang:</span>
          <div className="text-xl font-black text-amber-900">{formatRupiah(winner.netWorth)}</div>
        </div>

        {/* Final Standings */}
        <div className="space-y-2 text-left">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peringkat Akhir:</h3>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">#{idx + 1}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-bold text-slate-800">{p.name}</span>
                  {p.isBankrupt && (
                    <span className="text-[9px] bg-rose-100 text-rose-700 px-1 rounded font-semibold">
                      Bangkrut
                    </span>
                  )}
                </div>
                <span className="font-black text-slate-900">{formatRupiah(p.netWorth)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi</span>
          </button>
          <button
            onClick={onReturnToLobby}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};

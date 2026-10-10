import React, { useState } from 'react';
import { Player, BoardSquare } from '../types/game';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { X, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';

interface TradeModalProps {
  activePlayer: Player;
  players: Player[];
  board: BoardSquare[];
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade: (
    targetPlayerId: string,
    myOfferedSquareIds: number[],
    myCash: number,
    theirRequestedSquareIds: number[],
    theirCash: number
  ) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  activePlayer,
  players,
  board,
  isOpen,
  onClose,
  onExecuteTrade,
}) => {
  const otherPlayers = players.filter((p) => p.id !== activePlayer.id && !p.isBankrupt);
  const [targetPlayerId, setTargetPlayerId] = useState<string>(otherPlayers[0]?.id || '');
  const [myOfferedSquareIds, setMyOfferedSquareIds] = useState<number[]>([]);
  const [theirRequestedSquareIds, setTheirRequestedSquareIds] = useState<number[]>([]);
  const [myCash, setMyCash] = useState<number>(0);
  const [theirCash, setTheirCash] = useState<number>(0);

  if (!isOpen || otherPlayers.length === 0) return null;

  const targetPlayer = otherPlayers.find((p) => p.id === targetPlayerId) || otherPlayers[0];
  const myProperties = board.filter((s) => s.ownerId === activePlayer.id);
  const theirProperties = board.filter((s) => s.ownerId === targetPlayer?.id);

  const toggleMyProperty = (id: number) => {
    setMyOfferedSquareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTheirProperty = (id: number) => {
    setTheirRequestedSquareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmTrade = () => {
    sounds.playCash();
    onExecuteTrade(targetPlayer.id, myOfferedSquareIds, myCash, theirRequestedSquareIds, theirCash);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-black tracking-tight">NEGOSIASI & TUKAR PROPERTI</h2>
              <p className="text-xs text-emerald-100">Jual beli aset antarwarga tanpa perantara calo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Select Partner */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Pilih Rekan Transaksi:</label>
            <div className="flex items-center gap-2">
              {otherPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setTargetPlayerId(p.id);
                    setTheirRequestedSquareIds([]);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    targetPlayer.id === p.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Offer */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Tawaran Anda ({activePlayer.name}):
              </h3>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {myProperties.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Anda belum memiliki properti.</p>
                ) : (
                  myProperties.map((p) => {
                    const isSelected = myOfferedSquareIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleMyProperty(p.id)}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-emerald-100/70 border-emerald-500 font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="truncate max-w-[130px]">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{formatRupiah(p.price)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Tambah Uang Tunai ({formatRupiah(myCash)}):
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.min(activePlayer.money, 5000000)}
                  step="100000"
                  value={myCash}
                  onChange={(e) => setMyCash(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Their Offer */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Permintaan dari ({targetPlayer.name}):
              </h3>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {theirProperties.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Lawan tidak memiliki properti.</p>
                ) : (
                  theirProperties.map((p) => {
                    const isSelected = theirRequestedSquareIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleTheirProperty(p.id)}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-emerald-100/70 border-emerald-500 font-bold'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="truncate max-w-[130px]">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{formatRupiah(p.price)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Minta Uang Tunai ({formatRupiah(theirCash)}):
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.min(targetPlayer.money, 5000000)}
                  step="100000"
                  value={theirCash}
                  onChange={(e) => setTheirCash(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmTrade}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Kirim Kesepakatan Dagang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

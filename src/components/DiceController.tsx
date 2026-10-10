import React, { useState } from 'react';
import { Player, BoardSquare } from '../types/game';
import { sounds } from '../utils/audio';
import { Dices, Play, ArrowRight, Shield, ShoppingBag, TrendingUp, Building2, Skull, Palette, Gavel } from 'lucide-react';

interface DiceControllerProps {
  activePlayer: Player;
  isMyTurn: boolean;
  dice: [number, number];
  isDiceRolled: boolean;
  canEndTurn: boolean;
  isMovingPlayer?: boolean;
  stepProgress?: { current: number; total: number } | null;
  onRollDice: () => void;
  onEndTurn: () => void;
  onOpenMarket: () => void;
  onOpenCityHazard: () => void;
  onOpenBlackMarket: () => void;
  onOpenCosmetics: () => void;
  onOpenTrade: () => void;
  onOpenAvatarCustomizer: () => void;
  onOpenAuction?: () => void;
}

export const DiceController: React.FC<DiceControllerProps> = ({
  activePlayer,
  isMyTurn,
  dice,
  isDiceRolled,
  canEndTurn,
  isMovingPlayer,
  stepProgress,
  onRollDice,
  onEndTurn,
  onOpenMarket,
  onOpenCityHazard,
  onOpenBlackMarket,
  onOpenCosmetics,
  onOpenTrade,
  onOpenAvatarCustomizer,
  onOpenAuction,
}) => {
  const [isRollingAnim, setIsRollingAnim] = useState(false);

  const handleRollClick = () => {
    if (!isMyTurn || isDiceRolled || isRollingAnim || isMovingPlayer) return;
    setIsRollingAnim(true);
    sounds.playDiceRoll();
    setTimeout(() => {
      setIsRollingAnim(false);
      onRollDice();
    }, 600);
  };

  const getDiceDots = (val: number) => {
    switch (val) {
      case 1:
        return '⚀';
      case 2:
        return '⚁';
      case 3:
        return '⚂';
      case 4:
        return '⚃';
      case 5:
        return '⚄';
      case 6:
        return '⚅';
      default:
        return '🎲';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-1.5 sm:p-2 shadow-md border border-amber-200 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 w-full overflow-hidden">
      {/* Dice Visual */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-400 rounded-lg flex items-center justify-center text-xl sm:text-2xl shadow-xs text-amber-900 select-none ${
              isRollingAnim ? 'animate-spin' : ''
            }`}
          >
            {getDiceDots(dice[0])}
          </div>
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-400 rounded-lg flex items-center justify-center text-xl sm:text-2xl shadow-xs text-amber-900 select-none ${
              isRollingAnim ? 'animate-bounce' : ''
            }`}
          >
            {getDiceDots(dice[1])}
          </div>
        </div>

        <div className="text-left pl-0.5">
          <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Dadu</div>
          <div className="text-sm sm:text-base font-black text-amber-950 leading-tight">
            {dice[0] + dice[1]}
            {dice[0] === dice[1] && (
              <span className="ml-1 text-[8px] text-emerald-600 bg-emerald-100 px-1 py-0.2 rounded-full font-bold">
                KEMBAR!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-1 justify-center shrink-0">
        {isMovingPlayer ? (
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm animate-pulse ring-2 ring-amber-300">
            <span className="inline-block animate-bounce text-sm">🚶‍♂️</span>
            <span className="whitespace-nowrap font-black">
              {stepProgress ? `Melangkah (${stepProgress.current}/${stepProgress.total})` : 'Melangkah...'}
            </span>
          </div>
        ) : !isDiceRolled ? (
          <button
            onClick={handleRollClick}
            disabled={!isMyTurn || isRollingAnim}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all text-white text-xs sm:text-sm ${
              isMyTurn && !isRollingAnim
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 active:scale-95 cursor-pointer ring-2 ring-red-400'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            <span className="whitespace-nowrap">{isRollingAnim ? 'Mengocok...' : 'Lempar Dadu'}</span>
          </button>
        ) : (
          <button
            onClick={onEndTurn}
            disabled={!isMyTurn || !canEndTurn}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-all text-white text-xs sm:text-sm ${
              isMyTurn && canEndTurn
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 cursor-pointer ring-2 ring-emerald-400'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="whitespace-nowrap">Akhiri Giliran</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Quick Navigation Panels */}
      <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none py-0.5">
        <button
          onClick={onOpenMarket}
          title="Pasar Komoditas & Inflasi"
          className="p-1 sm:p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden xl:inline text-[10px]">Pasar</span>
        </button>

        <button
          onClick={onOpenCityHazard}
          title="Fasilitas & Kesejahteraan Kota"
          className="p-1 sm:p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline text-[10px]">Kota</span>
        </button>

        <button
          onClick={onOpenBlackMarket}
          title="Pasar Gelap (High Risk Cuan)"
          className="p-1 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Skull className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden xl:inline text-[10px]">Gelap</span>
        </button>

        <button
          onClick={onOpenTrade}
          title="Negosiasi & Tukar Properti"
          className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <span className="text-xs">🤝</span>
          <span className="hidden xl:inline text-[10px]">Trade</span>
        </button>

        <button
          onClick={onOpenAvatarCustomizer}
          title="Kustomisasi Avatar Warga"
          className="p-1 sm:p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Palette className="w-3.5 h-3.5 text-orange-600" />
          <span className="hidden xl:inline text-[10px]">Avatar</span>
        </button>

        {onOpenAuction && (
          <button
            onClick={onOpenAuction}
            title="Sesi Lelang Properti"
            className="p-1 sm:p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Gavel className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden xl:inline text-[10px]">Lelang</span>
          </button>
        )}

        <button
          onClick={onOpenCosmetics}
          title="Toko Kosmetik Koin Nusantara"
          className="p-1 sm:p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden xl:inline text-[10px]">Toko</span>
        </button>
      </div>
    </div>
  );
};

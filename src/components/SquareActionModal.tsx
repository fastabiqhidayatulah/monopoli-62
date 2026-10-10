import React from 'react';
import { BoardSquare, Player, CityStatus, CityGroup } from '../types/game';
import { formatRupiah, calculateRent } from '../utils/format';
import { sounds } from '../utils/audio';
import { X, Building, DollarSign, Store, Hotel, RefreshCw, AlertCircle, CheckCircle2, Gavel } from 'lucide-react';

interface SquareActionModalProps {
  square: BoardSquare | null;
  activePlayer: Player;
  allPlayers: Player[];
  allBoard: BoardSquare[];
  cityStatuses: Record<CityGroup, CityStatus>;
  isOpen: boolean;
  isCurrentLanding: boolean;
  onClose: () => void;
  onBuyProperty: (squareId: number) => void;
  onUpgradeBuilding: (squareId: number) => void;
  onMortgageProperty: (squareId: number) => void;
  onUnmortgageProperty: (squareId: number) => void;
  onStartAuction?: (squareId: number) => void;
}

export const SquareActionModal: React.FC<SquareActionModalProps> = ({
  square,
  activePlayer,
  allPlayers,
  allBoard,
  cityStatuses,
  isOpen,
  isCurrentLanding,
  onClose,
  onBuyProperty,
  onUpgradeBuilding,
  onMortgageProperty,
  onUnmortgageProperty,
  onStartAuction,
}) => {
  if (!isOpen || !square) return null;

  const owner = square.ownerId ? allPlayers.find((p) => p.id === square.ownerId) : null;
  const isOwner = square.ownerId === activePlayer.id;
  const canBuy = isCurrentLanding && !square.ownerId && square.price > 0 && activePlayer.money >= square.price;
  const currentRent = calculateRent(square, allBoard, cityStatuses, 7);

  const upgradeCost = square.housePrice || 500000;
  const canUpgrade = isOwner && square.buildingLevel < 3 && activePlayer.money >= upgradeCost;

  const mortgageValue = Math.round(square.price * 0.5);
  const unmortgageCost = Math.round(mortgageValue * 1.1);

  const getBuildingLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Warung Makan Madura';
      case 2:
        return 'Ruko Usaha Mandiri';
      case 3:
        return 'Mall / Hotel Megah Nusantara';
      default:
        return 'Tanah Kavling Kosong';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header with City Color */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ backgroundColor: square.color || '#3b82f6' }}
        >
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded-full">
              {square.cityName || square.type}
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1">{square.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 transition-all text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {square.description}
          </p>

          {/* Pricing & Status Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              <span className="text-slate-500 font-semibold">Harga Aset:</span>
              <div className="text-base font-black text-amber-900">{formatRupiah(square.price)}</div>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 font-semibold">Sewa Saat Ini:</span>
              <div className="text-base font-black text-emerald-800">{formatRupiah(currentRent)}</div>
            </div>
          </div>

          {/* Ownership Information */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Status Kepemilikan:</span>
            {owner ? (
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                <span>{owner.name} {isOwner ? '(Anda)' : ''}</span>
              </span>
            ) : (
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Tersedia untuk Dibeli
              </span>
            )}
          </div>

          {/* Building Level if property */}
          {square.type === 'PROPERTY' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-blue-900">Level Bangunan:</span>
                <div className="font-black text-blue-950 mt-0.5">{getBuildingLabel(square.buildingLevel)}</div>
              </div>
              <span className="text-xl">
                {square.buildingLevel === 1 ? '🏪' : square.buildingLevel === 2 ? '🏢' : square.buildingLevel === 3 ? '🏨' : '🏕️'}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {/* Buy Property Action */}
            {canBuy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playCash();
                    onBuyProperty(square.id);
                    onClose();
                  }}
                  className="py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl text-xs shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Beli ({formatRupiah(square.price)})</span>
                </button>

                {onStartAuction && (
                  <button
                    onClick={() => {
                      sounds.playGavel();
                      onStartAuction(square.id);
                      onClose();
                    }}
                    className="py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black rounded-xl text-xs shadow-md hover:from-amber-700 hover:to-orange-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Lelang ke Publik</span>
                  </button>
                )}
              </div>
            )}

            {/* Upgrade Building Action */}
            {canUpgrade && (
              <button
                onClick={() => {
                  sounds.playCash();
                  onUpgradeBuilding(square.id);
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Building className="w-4 h-4" />
                <span>Upgrade Bangunan ({formatRupiah(upgradeCost)})</span>
              </button>
            )}

            {/* Auction owned property */}
            {isOwner && onStartAuction && (
              <button
                onClick={() => {
                  sounds.playGavel();
                  onStartAuction(square.id);
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Gavel className="w-4 h-4" />
                <span>Lelang Aset Ini ke Publik</span>
              </button>
            )}

            {/* Mortgage / Unmortgage */}
            {isOwner && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {!square.isMortgaged ? (
                  <button
                    onClick={() => {
                      sounds.playCash();
                      onMortgageProperty(square.id);
                      onClose();
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Gadai (+{formatRupiah(mortgageValue)})
                  </button>
                ) : (
                  <button
                    disabled={activePlayer.money < unmortgageCost}
                    onClick={() => {
                      sounds.playCash();
                      onUnmortgageProperty(square.id);
                      onClose();
                    }}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    Tebus Gadai (-{formatRupiah(unmortgageCost)})
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

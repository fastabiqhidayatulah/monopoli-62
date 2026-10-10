import React from 'react';
import { BoardSquare, Player, CityGroup, CityStatus, NaturalDisasterEvent } from '../types/game';
import { AvatarRenderer } from './AvatarRenderer';
import { formatRupiahShort } from '../utils/format';
import {
  Flag,
  ShieldAlert,
  Coffee,
  Siren,
  HelpCircle,
  Gift,
  Train,
  Bus,
  Bike,
  Zap,
  Droplet,
  Landmark,
  Skull,
  Shield,
  Building,
  Home,
  Store,
  Hotel,
} from 'lucide-react';

interface GameBoardProps {
  board: BoardSquare[];
  players: Player[];
  activePlayerIndex: number;
  cityStatuses: Record<CityGroup, CityStatus>;
  activeDisaster?: NaturalDisasterEvent | null;
  onSquareClick: (square: BoardSquare) => void;
  selectedSquareId?: number | null;
  movingPlayerId?: string | null;
  targetSquareId?: number | null;
  stepProgress?: { current: number; total: number } | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  players,
  activePlayerIndex,
  cityStatuses,
  activeDisaster,
  onSquareClick,
  selectedSquareId,
  movingPlayerId,
  targetSquareId,
  stepProgress,
}) => {
  // Map 0-39 to (col, row) coordinates in an 11x11 grid:
  // Top: 20 -> (0,0) to 30 -> (10,0)
  // Right: 30 -> (10,0) down to 0 -> (10,10)
  // Bottom: 10 -> (0,10) to 0 -> (10,10)
  // Left: 20 -> (0,0) down to 10 -> (0,10)
  const getCoordinates = (index: number): { col: number; row: number } => {
    if (index >= 0 && index <= 10) {
      // Bottom edge: index 0 is (10, 10), index 10 is (0, 10)
      return { col: 10 - index, row: 10 };
    }
    if (index >= 11 && index <= 20) {
      // Left edge: index 10 is (0, 10), index 20 is (0, 0)
      return { col: 0, row: 10 - (index - 10) };
    }
    if (index >= 21 && index <= 30) {
      // Top edge: index 20 is (0, 0), index 30 is (10, 0)
      return { col: index - 20, row: 0 };
    }
    // Right edge: index 30 is (10, 0), index 39 is (10, 9)
    return { col: 10, row: index - 30 };
  };

  const renderIcon = (square: BoardSquare) => {
    switch (square.type) {
      case 'START':
        return <Flag className="w-5 h-5 text-emerald-600" />;
      case 'JAIL':
        return <ShieldAlert className="w-5 h-5 text-slate-700" />;
      case 'REST_AREA':
        return <Coffee className="w-5 h-5 text-teal-600" />;
      case 'GO_TO_JAIL':
        return <Siren className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'CHANCE':
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      case 'COMMUNITY_CHEST':
        return <Gift className="w-5 h-5 text-amber-600" />;
      case 'TAX':
        return <Landmark className="w-4 h-4 text-rose-600" />;
      case 'POLICE_RAID':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'BLACK_MARKET':
        return <Skull className="w-4 h-4 text-slate-900" />;
      case 'TRANSPORT':
        if (square.name.includes('KRL')) return <Train className="w-4 h-4 text-slate-700" />;
        if (square.name.includes('TransJakarta')) return <Bus className="w-4 h-4 text-slate-700" />;
        if (square.name.includes('MRT')) return <Train className="w-4 h-4 text-slate-700" />;
        return <Bike className="w-4 h-4 text-slate-700" />;
      case 'UTILITY':
        if (square.name.includes('PLN')) return <Zap className="w-4 h-4 text-amber-500" />;
        return <Droplet className="w-4 h-4 text-sky-500" />;
      default:
        return null;
    }
  };

  const renderBuildingIcon = (level: number) => {
    if (level === 1) return <span title="Warung"><Store className="w-3 h-3 text-amber-700" /></span>;
    if (level === 2) return <span title="Ruko"><Building className="w-3 h-3 text-emerald-700" /></span>;
    if (level === 3) return <span title="Mall / Hotel"><Hotel className="w-3 h-3 text-indigo-700" /></span>;
    return null;
  };

  return (
    <div className="relative h-full max-h-full max-w-full aspect-square mx-auto p-1 sm:p-1.5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl shadow-xl border-2 sm:border-4 border-amber-900/30 overflow-hidden select-none flex flex-col">
      {/* Subtle Batik Ornaments in background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#854d0e_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* Grid Container 11x11 */}
      <div className="grid grid-cols-11 grid-rows-11 gap-0.5 sm:gap-1 w-full h-full text-xs">
        {board.map((square) => {
          const { col, row } = getCoordinates(square.id);
          const isCorner =
            square.id === 0 || square.id === 10 || square.id === 20 || square.id === 30;
          const isSelected = selectedSquareId === square.id;
          const isTargetSquare = targetSquareId !== null && targetSquareId !== undefined && targetSquareId === square.id;
          const owner = square.ownerId ? players.find((p) => p.id === square.ownerId) : null;
          const occupyingPlayers = players.filter((p) => p.position === square.id && !p.isBankrupt);
          const hasMovingPlayer = occupyingPlayers.some((p) => p.id === movingPlayerId);

          const cityStatus = square.city ? cityStatuses[square.city] : null;
          const isFlooded = cityStatus?.hazard === 'BANJIR';
          const isTraffic = cityStatus?.hazard === 'MACET';

          return (
            <div
              key={square.id}
              onClick={() => onSquareClick(square)}
              style={{
                gridColumnStart: col + 1,
                gridRowStart: row + 1,
              }}
              className={`relative flex flex-col justify-between p-0.5 sm:p-1 rounded-sm sm:rounded-md transition-all cursor-pointer border shadow-xs min-h-0 overflow-hidden ${
                isCorner
                  ? 'bg-amber-100/95 border-amber-300 font-bold'
                  : 'bg-white/95 border-amber-200/80 hover:border-amber-500 hover:shadow-md'
              } ${isSelected ? 'ring-2 ring-blue-500 scale-[1.03] z-20 shadow-lg' : ''} ${
                isFlooded ? 'bg-blue-50/90 border-blue-400' : ''
              } ${
                isTargetSquare ? 'ring-2 ring-rose-500 bg-rose-50/90 border-rose-400 scale-[1.03] z-20 shadow-md' : ''
              } ${
                hasMovingPlayer ? 'ring-2 ring-amber-400 bg-amber-100/95 shadow-xl scale-[1.04] z-30 transition-all duration-150' : ''
              }`}
            >
              {/* Destination Target Pin */}
              {isTargetSquare && (
                <div className="absolute top-0 right-0 z-20 bg-rose-600 text-white text-[6.5px] sm:text-[7.5px] font-black px-1 py-0.2 rounded-bl shadow-xs flex items-center gap-0.5 animate-bounce">
                  <span>🎯</span>
                  <span className="hidden sm:inline">TUJUAN</span>
                </div>
              )}

              {/* City Color Bar if property */}
              {square.city && square.city !== 'TRANSPORT' && square.city !== 'UTILITY' && (
                <div
                  className="w-full h-1.5 sm:h-2 rounded-xs mb-0.5 flex items-center justify-between px-0.5 shrink-0"
                  style={{ backgroundColor: square.color }}
                >
                  {owner && (
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ring-1 ring-white"
                      style={{ backgroundColor: owner.color }}
                      title={`Pemilik: ${owner.name}`}
                    />
                  )}
                  {square.buildingLevel > 0 && renderBuildingIcon(square.buildingLevel)}
                </div>
              )}

              {/* Square Header / Icon */}
              <div className="flex items-center justify-center flex-1 min-h-0 my-auto overflow-hidden">
                {renderIcon(square)}
                {square.type === 'PROPERTY' && !renderIcon(square) && (
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-700 leading-tight text-center line-clamp-2">
                    {square.name}
                  </span>
                )}
              </div>

              {/* Special Corner or Action Text */}
              {isCorner && (
                <span className="text-[7.5px] sm:text-[9px] font-extrabold text-slate-800 text-center uppercase tracking-tight leading-tight">
                  {square.name}
                </span>
              )}

              {/* Price / Rent / Hazard Badge */}
              <div className="flex flex-col items-center mt-auto shrink-0 leading-none">
                {square.price > 0 && (
                  <span className="text-[7px] sm:text-[8.5px] font-semibold text-slate-600 bg-amber-50/90 px-0.5 py-0.2 rounded-xs">
                    {formatRupiahShort(square.price)}
                  </span>
                )}
                {isFlooded && (
                  <span className="text-[6px] sm:text-[7px] bg-blue-500 text-white px-1 rounded-full font-bold">
                    BANJIR
                  </span>
                )}
                {isTraffic && (
                  <span className="text-[6px] sm:text-[7px] bg-amber-500 text-white px-1 rounded-full font-bold">
                    MACET
                  </span>
                )}
                {square.isMortgaged && (
                  <span className="text-[6px] sm:text-[7px] bg-rose-500 text-white px-1 rounded-full font-bold">
                    GADAI
                  </span>
                )}
              </div>

              {/* Occupying Players' Tokens */}
              {occupyingPlayers.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-1 z-30">
                  <div className="flex -space-x-1.5 overflow-visible">
                    {occupyingPlayers.map((player) => {
                      const isThisPlayerMoving = player.id === movingPlayerId;
                      const isCurrentTurnPlayer = player.id === players[activePlayerIndex]?.id;

                      return (
                        <div
                          key={player.id}
                          className={`relative transform transition-all duration-150 ${
                            isThisPlayerMoving
                              ? 'scale-125 -translate-y-2 ring-3 ring-amber-400 rounded-full shadow-2xl z-40 animate-bounce'
                              : isCurrentTurnPlayer
                              ? 'scale-105 ring-2 ring-amber-300 rounded-full shadow-md z-30'
                              : 'ring-1.5 ring-white/90 rounded-full shadow-xs opacity-90'
                          }`}
                          title={`${player.name} (${player.inJail ? 'Di Penjara' : 'Aktif'})`}
                        >
                          <AvatarRenderer
                            customization={player.customAvatar}
                            fallbackIcon={player.avatarId}
                            size="xs"
                          />
                          {isThisPlayerMoving && stepProgress && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-md whitespace-nowrap animate-pulse border border-amber-300">
                              {stepProgress.current}/{stepProgress.total}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Center Board Area (Spans from col 2 to 10, row 2 to 10) */}
        <div
          style={{
            gridColumn: '2 / 11',
            gridRow: '2 / 11',
          }}
          className="flex flex-col items-center justify-between p-2 sm:p-3 bg-gradient-to-b from-white/90 via-amber-50/80 to-white/95 rounded-xl sm:rounded-2xl border border-amber-200/90 shadow-inner backdrop-blur-xs relative overflow-hidden"
        >
          {/* Header Title with Garuda & Batik aesthetics */}
          <div className="text-center z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-black rounded-full shadow-xs uppercase tracking-wider mb-0.5">
              <span>🇲🇨</span>
              <span>Monopoli Warga +62</span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-950 tracking-tight drop-shadow-xs">
              JUARA NUSANTARA
            </h1>
            <p className="text-[9px] sm:text-[11px] text-amber-800/80 font-medium hidden sm:block">
              Simulasi Kehidupan, Bisnis Properti & Dinamika Warga Indonesia
            </p>
          </div>

          {/* Stepping Movement Banner */}
          {movingPlayerId && stepProgress && (
            <div className="w-full max-w-xs sm:max-w-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-xl p-1.5 sm:p-2 text-center shadow-lg border-2 border-yellow-300/80 z-20 animate-pulse">
              <div className="flex items-center justify-center gap-1.5 font-black text-[11px] sm:text-xs">
                <span className="text-sm animate-bounce">🚶‍♂️</span>
                <span>{players.find((p) => p.id === movingPlayerId)?.name || 'Pemain'} melangkah!</span>
                <span className="bg-white/30 backdrop-blur-xs px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px]">
                  {stepProgress.current} / {stepProgress.total} Petak
                </span>
              </div>
              {targetSquareId !== null && targetSquareId !== undefined && (
                <div className="text-[9px] sm:text-[10px] text-amber-100 font-semibold truncate mt-0.5">
                  🎯 Menuju: <span className="font-bold underline">{board[targetSquareId]?.name || 'Petak'}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Disaster Notice if any */}
          {activeDisaster && (
            <div className="w-full max-w-sm bg-rose-50 border border-rose-300 rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center shadow-xs animate-pulse z-10">
              <div className="flex items-center justify-center gap-1 text-rose-700 font-bold text-[10px] uppercase">
                <Siren className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                <span className="truncate">BENCANA: {activeDisaster.title}</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-rose-800 mt-0.5 line-clamp-1">
                {activeDisaster.impactDescription}
              </p>
            </div>
          )}

          {/* Active Player Status Banner */}
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 bg-white/95 rounded-xl border border-amber-300/80 shadow-sm w-full max-w-xs sm:max-w-sm justify-between z-10">
            <div className="flex items-center gap-2">
              <AvatarRenderer
                customization={players[activePlayerIndex]?.customAvatar}
                fallbackIcon={players[activePlayerIndex]?.avatarId}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                    {players[activePlayerIndex]?.name || 'Pemain'}
                  </span>
                  {players[activePlayerIndex]?.isAi && (
                    <span className="text-[8px] bg-slate-200 text-slate-700 px-1 rounded-sm font-semibold">
                      BOT
                    </span>
                  )}
                  {players[activePlayerIndex]?.inJail && (
                    <span className="text-[8px] bg-red-500 text-white px-1 rounded-sm font-bold">
                      SEL
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-black text-emerald-600">
                  {formatRupiahShort(players[activePlayerIndex]?.money || 0)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] text-slate-500 font-medium">Posisi:</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-800 max-w-[100px] sm:max-w-[130px] truncate">
                {board[players[activePlayerIndex]?.position || 0]?.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

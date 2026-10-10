import React from 'react';
import { Player, BoardSquare } from '../types/game';
import { AvatarRenderer } from './AvatarRenderer';
import { formatRupiah, formatRupiahShort } from '../utils/format';
import { Shield, Flame, Building, Award, User, AlertCircle } from 'lucide-react';

interface PlayerDashboardProps {
  players: Player[];
  activePlayerIndex: number;
  board: BoardSquare[];
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  players,
  activePlayerIndex,
  board,
}) => {
  // Sort players by net worth for leaderboard display
  const sortedPlayers = [...players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md border border-amber-200 flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-amber-100 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-600" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            KLASEMEN WARGA NUSANTARA
          </h2>
        </div>
        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
          {players.length} Pemain
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 mt-1.5 scrollbar-thin">
        {sortedPlayers.map((player, rank) => {
          const isCurrentTurn = players[activePlayerIndex]?.id === player.id;
          const myProperties = board.filter((s) => s.ownerId === player.id);

          return (
            <div
              key={player.id}
              className={`p-2 rounded-xl border transition-all ${
                player.isBankrupt
                  ? 'bg-slate-100/70 border-slate-300 opacity-50 grayscale'
                  : isCurrentTurn
                  ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black bg-slate-200 text-slate-700">
                    #{rank + 1}
                  </span>
                  <AvatarRenderer
                    customization={player.customAvatar}
                    fallbackIcon={player.avatarId}
                    size="xs"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-800 truncate max-w-[85px] sm:max-w-[110px]">
                        {player.name}
                      </span>
                      {player.isAi && (
                        <span className="text-[7px] bg-slate-100 text-slate-600 px-1 rounded font-bold">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">
                      {player.isBankrupt ? 'BANGKRUT' : player.inJail ? '🔒 DI PENJARA' : 'Aktif'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-emerald-600">
                    {formatRupiahShort(player.money)}
                  </div>
                  <div className="text-[8px] text-slate-400 font-semibold" title="Total Nilai Kekayaan Bersih">
                    Kekayaan: {formatRupiahShort(player.netWorth)}
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              {!player.isBankrupt && (
                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-600">
                  <span className="flex items-center gap-0.5">
                    <Building className="w-2.5 h-2.5 text-blue-500" />
                    <span>{myProperties.length}</span>
                  </span>

                  <span className="flex items-center gap-0.5" title="Reputasi Warga">
                    <span>🌟{player.reputation}</span>
                  </span>

                  <span className="flex items-center gap-0.5" title="Heat Pasar Gelap">
                    <Flame className="w-2.5 h-2.5 text-orange-500" />
                    <span>{player.blackMarketHeat}%</span>
                  </span>

                  <span className="flex items-center gap-0.5" title="Risiko Tilang">
                    <Shield className="w-2.5 h-2.5 text-indigo-500" />
                    <span>{player.legalRisk}%</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

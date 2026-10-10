import React, { useState } from 'react';
import { Player, BlackMarketItem } from '../types/game';
import { BLACK_MARKET_ITEMS } from '../data/commodities';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { X, Flame, ShieldAlert, Skull, DollarSign, AlertTriangle } from 'lucide-react';

interface BlackMarketModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onExecuteTransaction: (item: BlackMarketItem, action: 'BUY_AND_FLIP') => void;
}

export const BlackMarketModal: React.FC<BlackMarketModalProps> = ({
  player,
  isOpen,
  onClose,
  onExecuteTransaction,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(BLACK_MARKET_ITEMS[0].id);

  if (!isOpen) return null;

  const selectedItem = BLACK_MARKET_ITEMS.find((i) => i.id === selectedItemId) || BLACK_MARKET_ITEMS[0];
  const canAfford = player.money >= selectedItem.buyPrice;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-slate-900 border-2 border-red-700/60 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-black border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕵️‍♂️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-red-400">PASAR GELAP GANG TIKUS</h2>
                <span className="text-[10px] bg-red-900 text-red-200 px-1.5 py-0.5 rounded font-bold uppercase">
                  HIGH RISK - HIGH RETURN
                </span>
              </div>
              <p className="text-xs text-slate-400">Transaksi bawah tanah warga +62 tanpa pajak & izin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 transition-all text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Heat Meter */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-red-900/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                <span>Heat Level (Atensi Intel & Aparat):</span>
              </span>
              <span className="text-red-400 font-black">{player.blackMarketHeat}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 transition-all duration-300"
                style={{ width: `${player.blackMarketHeat}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Makin sering bertransaksi, peluang digerebek intel meningkat drastis!
            </p>
          </div>

          {/* Items Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilih Komoditas Ilegal:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BLACK_MARKET_ITEMS.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-500 bg-red-950/40 ring-1 ring-red-400'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-200">{item.name}</span>
                        <span className="text-[10px] bg-red-950 text-red-300 font-bold px-1.5 py-0.5 rounded">
                          Risiko {item.riskPercent}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px]">Modal:</span>
                        <div className="font-bold text-slate-300">{formatRupiah(item.buyPrice)}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-500 text-[10px]">Potensi Cuan:</span>
                        <div className="font-black text-emerald-400">{formatRupiah(item.sellPricePotential)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Action */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                Anda akan membeli <span className="font-bold text-white">{selectedItem.name}</span> seharga{' '}
                <span className="font-bold text-amber-400">{formatRupiah(selectedItem.buyPrice)}</span> dan langsung
                menjualnya di pasar gelap dengan potensi cuan{' '}
                <span className="font-bold text-emerald-400">{formatRupiah(selectedItem.sellPricePotential)}</span>. Jika
                terciduk razia, barang disita dan Anda kena denda/masuk sel tahanan!
              </div>
            </div>

            <button
              disabled={!canAfford}
              onClick={() => {
                onExecuteTransaction(selectedItem, 'BUY_AND_FLIP');
              }}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white active:scale-98'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>
                {canAfford ? `Jalankan Transaksi Bawah Tanah (${formatRupiah(selectedItem.buyPrice)})` : 'Saldo Tidak Cukup'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

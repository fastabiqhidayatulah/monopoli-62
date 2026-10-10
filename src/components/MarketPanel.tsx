import React, { useState } from 'react';
import { Commodity, Player } from '../types/game';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { X, TrendingUp, TrendingDown, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';

interface MarketPanelProps {
  commodities: Commodity[];
  player: Player;
  inflationRate: number;
  isOpen: boolean;
  onClose: () => void;
  onBuyCommodity: (commodityId: string, quantity: number) => void;
  onSellCommodity: (commodityId: string, quantity: number) => void;
}

export const MarketPanel: React.FC<MarketPanelProps> = ({
  commodities,
  player,
  inflationRate,
  isOpen,
  onClose,
  onBuyCommodity,
  onSellCommodity,
}) => {
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(commodities[0]?.id || 'rice');
  const [amount, setAmount] = useState<number>(1);

  if (!isOpen) return null;

  const selectedCommodity = commodities.find((c) => c.id === selectedCommodityId) || commodities[0];
  const userOwned = player.commodities[selectedCommodity.id] || 0;
  const totalCost = selectedCommodity.currentPrice * amount;
  const canAfford = player.money >= totalCost;
  const canSell = userOwned >= amount;

  // Render simple SVG sparkline / line chart
  const renderChart = (history: number[]) => {
    if (!history || history.length < 2) return null;
    const min = Math.min(...history) * 0.98;
    const max = Math.max(...history) * 1.02;
    const width = 280;
    const height = 90;

    const points = history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * width;
        const y = height - ((val - min) / (max - min || 1)) * height;
        return `${x},${y}`;
      })
      .join(' ');

    const isUp = history[history.length - 1] >= history[0];
    const strokeColor = isUp ? '#10b981' : '#ef4444';

    return (
      <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
          <span>Tren Harga Pasar Real-time</span>
          <span className="font-mono text-slate-300">Min: {formatRupiah(min)} | Max: {formatRupiah(max)}</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <div>
              <h2 className="text-lg font-black tracking-tight">BURSA KOMODITAS NUSANTARA</h2>
              <p className="text-xs text-amber-100">
                Pasar dinamis penawaran & permintaan | Inflasi: {((inflationRate - 1) * 100).toFixed(1)}%
              </p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Commodity Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {commodities.map((item) => {
              const isSelected = item.id === selectedCommodityId;
              const isPositive = item.changePercent >= 0;
              const ownedCount = player.commodities[item.id] || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCommodityId(item.id);
                    setAmount(1);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-400'
                      : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}
                      {item.changePercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">
                      {formatRupiah(item.currentPrice)}
                      <span className="text-[10px] text-slate-500 font-normal">/{item.unit}</span>
                    </div>
                  </div>

                  {ownedCount > 0 && (
                    <div className="mt-1 text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                      Milikmu: {ownedCount} {item.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Commodity Detail & Trading Area */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCommodity.icon}</span>
                  <h3 className="text-base font-black text-slate-800">{selectedCommodity.name}</h3>
                  <span className="text-xs bg-slate-200 px-2 py-0.5 rounded font-mono font-bold text-slate-700">
                    {selectedCommodity.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedCommodity.description}</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500">Harga Sekarang:</div>
                <div className="text-xl font-black text-slate-900">
                  {formatRupiah(selectedCommodity.currentPrice)}{' '}
                  <span className="text-xs font-normal text-slate-600">/{selectedCommodity.unit}</span>
                </div>
              </div>
            </div>

            {/* Sparkline Graphic */}
            {renderChart(selectedCommodity.priceHistory)}

            {/* Quantity Controller */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Jumlah ({selectedCommodity.unit}):</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                    className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-black text-slate-800 text-sm">{amount}</span>
                  <button
                    onClick={() => setAmount(amount + 1)}
                    className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setAmount(5)}
                  className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold cursor-pointer"
                >
                  5
                </button>
                <button
                  onClick={() => setAmount(10)}
                  className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold cursor-pointer"
                >
                  10
                </button>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Total Transaksi:</span>
                <div className="text-base font-black text-amber-700">{formatRupiah(totalCost)}</div>
              </div>
            </div>

            {/* Trade Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={!canAfford}
                onClick={() => {
                  sounds.playCash();
                  onBuyCommodity(selectedCommodity.id, amount);
                }}
                className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Beli ({formatRupiah(totalCost)})</span>
              </button>

              <button
                disabled={!canSell}
                onClick={() => {
                  sounds.playCash();
                  onSellCommodity(selectedCommodity.id, amount);
                }}
                className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  canSell
                    ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                }`}
              >
                <span>Jual ({formatRupiah(totalCost)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { AuctionSession, Player, BoardSquare } from '../types/game';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { Gavel, Clock, Trophy, ArrowUpRight, DollarSign, AlertCircle, Shield } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';

interface PropertyAuctionModalProps {
  auction: AuctionSession | null;
  activePlayer: Player;
  players: Player[];
  isOpen: boolean;
  onPlaceBid: (bidAmount: number) => void;
  onAuctionEnd: (winnerId: string | null, finalAmount: number) => void;
  onPassBid: () => void;
}

export const PropertyAuctionModal: React.FC<PropertyAuctionModalProps> = ({
  auction,
  activePlayer,
  players,
  isOpen,
  onPlaceBid,
  onAuctionEnd,
  onPassBid,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && auction) {
      setTimeLeft(auction.timeRemaining || 15);
      setCustomBidAmount((auction.currentHighestBid || auction.startingPrice) + 100000);
      sounds.playGavel();
    }
  }, [isOpen, auction?.squareId]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !auction || auction.status !== 'ACTIVE') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          sounds.playGavel();
          onAuctionEnd(auction.highestBidderId, auction.currentHighestBid);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, auction?.currentHighestBid, auction?.status]);

  // AI Bots bidding automation during auction
  useEffect(() => {
    if (!isOpen || !auction || auction.status !== 'ACTIVE' || timeLeft <= 1) return;

    // Pick a bot that hasn't bid or can bid higher
    const eligibleBots = players.filter(
      (p) =>
        p.isAi &&
        !p.isBankrupt &&
        p.id !== auction.highestBidderId &&
        p.money >= auction.currentHighestBid + 50000
    );

    if (eligibleBots.length > 0 && Math.random() < 0.45) {
      const randomDelay = Math.floor(1200 + Math.random() * 2000);
      const timer = setTimeout(() => {
        const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
        const maxBotBudget = bot.aiPersonality === 'JURAGAN' ? bot.money * 0.7 : bot.money * 0.4;
        const nextMinBid = auction.currentHighestBid + 100000;

        if (nextMinBid <= maxBotBudget) {
          sounds.playBidChime();
          setTimeLeft((prev) => Math.max(prev, 6)); // Reset timer for tension
          onPlaceBid(nextMinBid);
        }
      }, randomDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, auction?.currentHighestBid, timeLeft, players]);

  if (!isOpen || !auction) return null;

  const highestBidder = players.find((p) => p.id === auction.highestBidderId);
  const minNextBid = auction.currentHighestBid > 0 ? auction.currentHighestBid + 50000 : auction.startingPrice;
  const canAffordMinBid = activePlayer.money >= minNextBid;

  const handleQuickBid = (increment: number) => {
    const amount = (auction.currentHighestBid || auction.startingPrice) + increment;
    if (activePlayer.money < amount) return;
    sounds.playBidChime();
    setTimeLeft((prev) => Math.max(prev, 6)); // reset back to at least 6s
    onPlaceBid(amount);
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBidAmount < minNextBid || activePlayer.money < customBidAmount) return;
    sounds.playBidChime();
    setTimeLeft((prev) => Math.max(prev, 6));
    onPlaceBid(customBidAmount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ backgroundColor: auction.squareColor || '#b45309' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/20 rounded-xl">
              <Gavel className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                LELANG PROPERTI TERBUKA
              </span>
              <h2 className="text-xl font-black tracking-tight">{auction.squareName}</h2>
              <span className="text-xs text-white/90">{auction.cityName}</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-white/20">
            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-400 animate-spin' : 'text-amber-300'}`} />
            <span
              className={`text-lg font-black font-mono ${
                timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Current Highest Bid Banner */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-4 border border-amber-500/40 text-center space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Tawaran Tertinggi Saat Ini:
            </span>
            <div className="text-3xl font-black text-amber-400">
              {formatRupiah(auction.currentHighestBid || auction.startingPrice)}
            </div>

            {highestBidder ? (
              <div className="flex items-center justify-center gap-2 pt-1">
                <AvatarRenderer
                  customization={highestBidder.customAvatar}
                  fallbackIcon={highestBidder.avatarId}
                  size="xs"
                />
                <span className="text-xs font-bold text-white">
                  Oleh: <span className="text-amber-300">{highestBidder.name}</span>{' '}
                  {highestBidder.id === activePlayer.id ? '(Anda)' : ''}
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Belum ada tawaran masuk. Jadilah yang pertama!</div>
            )}
          </div>

          {/* Property Info Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500">Harga Beli Normal:</span>
              <div className="font-bold text-slate-300">{formatRupiah(auction.basePrice)}</div>
            </div>
            <div>
              <span className="text-slate-500">Harga Buka Lelang:</span>
              <div className="font-bold text-emerald-400">{formatRupiah(auction.startingPrice)}</div>
            </div>
          </div>

          {/* Quick Bid Increment Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Ajukan Tawaran Cepat:</span>
              <span className="text-emerald-400">Saldo Anda: {formatRupiah(activePlayer.money)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 250000].map((inc) => {
                const targetBid = (auction.currentHighestBid || auction.startingPrice) + inc;
                const canAfford = activePlayer.money >= targetBid;

                return (
                  <button
                    key={inc}
                    disabled={!canAfford || auction.highestBidderId === activePlayer.id}
                    onClick={() => handleQuickBid(inc)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center cursor-pointer ${
                      canAfford && auction.highestBidderId !== activePlayer.id
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>+{formatRupiah(inc)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Bid Input */}
          <form onSubmit={handleCustomBidSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={minNextBid}
                max={activePlayer.money}
                step="50000"
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                placeholder={`Min: ${formatRupiah(minNextBid)}`}
              />
            </div>
            <button
              type="submit"
              disabled={customBidAmount < minNextBid || activePlayer.money < customBidAmount}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
            >
              Tawar
            </button>
          </form>

          {/* Pass / Pass Turn Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Lelang selesai saat hitung mundur mencapai 0 detik.
            </span>
            <button
              onClick={onPassBid}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
            >
              Lewatkan (Pass)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
